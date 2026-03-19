import ConversationSession from '../models/ConversationSession.js';
import Message from '../models/Message.js';
import Match from '../models/Match.js';
import User from '../models/User.js';

const PROMPTS = [
  'Tell me something you believe that most people wouldn’t agree with.',
  'Convince me your favorite movie is actually worth watching.',
  'Say something controversial — and stand by it.',
  'Give me a take you’re ready to defend.',
  'Change my mind about something.',
  'What’s a hill you’ll die on?',
  'Tell me something most people get completely wrong.',
  'Make me question something I thought was obvious.',
];

function getRandomPrompt(excludePrompt = null) {
  const available = excludePrompt
    ? PROMPTS.filter((prompt) => prompt !== excludePrompt)
    : PROMPTS;

  return available[Math.floor(Math.random() * available.length)];
}

function getNextResetTime() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next;
}

async function resetConversationLimitIfNeeded(user) {
  const now = new Date();

  if (!user.conversationSessionResetAt || user.conversationSessionResetAt <= now) {
    user.conversationSessionsUsed = 0;
    user.conversationSessionResetAt = getNextResetTime();
    await user.save();
  }
}

function canReveal(session) {
  const counts = Object.fromEntries(session.userMessageCounts || []);
  const values = Object.values(counts);
  return session.totalMessages >= 7 && values.filter((count) => count >= 2).length >= 2;
}

export async function startConversationSession(req, res) {
  try {
    const me = await User.findById(req.user._id);

    if (!me) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await resetConversationLimitIfNeeded(me);

    if ((me.conversationSessionsUsed || 0) >= 7) {
      return res.status(403).json({ message: 'You have used all 7 conversation sessions today.' });
    }

    const existingSession = await ConversationSession.findOne({
      users: req.user._id,
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    if (existingSession) {
      const messages = await Message.find({ session: existingSession._id })
        .populate('sender', 'firstName photos')
        .sort({ createdAt: 1 });

      return res.json({
        reused: true,
        session: existingSession,
        messages,
      });
    }

    const activeSessionUserIds = await ConversationSession.find({
      status: 'active',
      expiresAt: { $gt: new Date() },
    }).distinct('users');

    const candidate = await User.findOne({
      _id: {
        $ne: req.user._id,
        $nin: activeSessionUserIds,
      },
      onboardingCompleted: true,
    }).select('_id firstName');

    if (!candidate) {
      return res.status(404).json({ message: 'No one is available right now.' });
    }

    const prompt = getRandomPrompt();

    const session = await ConversationSession.create({
      users: [req.user._id, candidate._id],
      prompt,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      userMessageCounts: {
        [String(req.user._id)]: 0,
        [String(candidate._id)]: 0,
      },
    });

    await Message.create({
      session: session._id,
      sender: null,
      content: prompt,
      type: 'system',
    });

    me.conversationSessionsUsed = (me.conversationSessionsUsed || 0) + 1;
    await me.save();

    const messages = await Message.find({ session: session._id }).sort({ createdAt: 1 });

    return res.status(201).json({
      reused: false,
      session,
      messages,
      sessionsLeft: Math.max(0, 7 - me.conversationSessionsUsed),
    });
  } catch (error) {
    console.error('startConversationSession error', error);
    return res.status(500).json({ message: 'Could not start conversation session.' });
  }
}

export async function getConversationSession(req, res) {
  try {
    const { sessionId } = req.params;

    const session = await ConversationSession.findOne({
      _id: sessionId,
      users: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: 'Conversation session not found.' });
    }

    const messages = await Message.find({ session: sessionId })
      .populate('sender', 'firstName photos')
      .sort({ createdAt: 1 });

    return res.json({
      session,
      messages,
      revealAvailable: canReveal(session),
    });
  } catch (error) {
    console.error('getConversationSession error', error);
    return res.status(500).json({ message: 'Could not load conversation session.' });
  }
}

export async function sendConversationMessage(req, res) {
  try {
    const { sessionId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const session = await ConversationSession.findOne({
      _id: sessionId,
      users: req.user._id,
      status: { $in: ['active', 'revealed'] },
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(404).json({ message: 'Conversation session not found.' });
    }

    const message = await Message.create({
      session: session._id,
      sender: req.user._id,
      content: content.trim(),
      type: 'text',
    });

    const userKey = String(req.user._id);
    const currentCount = session.userMessageCounts.get(userKey) || 0;
    session.userMessageCounts.set(userKey, currentCount + 1);
    session.totalMessages += 1;
    session.lastMessageAt = new Date();

    await session.save();

    const populated = await Message.findById(message._id).populate('sender', 'firstName photos');

    return res.status(201).json({
      message: populated,
      revealAvailable: canReveal(session),
      totalMessages: session.totalMessages,
    });
  } catch (error) {
    console.error('sendConversationMessage error', error);
    return res.status(500).json({ message: 'Could not send conversation message.' });
  }
}

export async function requestReveal(req, res) {
  try {
    const { sessionId } = req.params;

    const session = await ConversationSession.findOne({
      _id: sessionId,
      users: req.user._id,
      status: { $in: ['active', 'revealed'] },
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(404).json({ message: 'Conversation session not found.' });
    }

    if (!canReveal(session)) {
      return res.status(400).json({ message: 'Reveal is not available yet.' });
    }

    const alreadyRequested = session.revealRequestedBy.some(
      (id) => String(id) === String(req.user._id)
    );

    if (!alreadyRequested) {
      session.revealRequestedBy.push(req.user._id);
      await session.save();
    }

    if (session.revealRequestedBy.length < 2) {
      const otherUserId = session.users.find((id) => String(id) !== String(req.user._id));

      await Message.create({
        session: session._id,
        sender: null,
        content: 'They’re ready to stop being anonymous. Are you?',
        type: 'reveal_request',
        targetUser: otherUserId,
      });

      return res.json({
        revealed: false,
        waiting: true,
        message: 'Reveal request sent.',
      });
    }

    session.isAnonymous = false;
    session.isRevealed = true;
    session.status = 'revealed';
    await session.save();

    const existingMatch = await Match.findOne({
      users: { $all: session.users, $size: 2 },
    });

    if (!existingMatch) {
      await Match.create({
        users: session.users,
      });
    }

    await Message.create({
      session: session._id,
      sender: null,
      content: 'Profiles revealed. You can now view each other fully.',
      type: 'system',
    });

    return res.json({
      revealed: true,
      waiting: false,
      message: 'Profiles revealed.',
    });
  } catch (error) {
    console.error('requestReveal error', error);
    return res.status(500).json({ message: 'Could not process reveal request.' });
  }
}

export async function skipPrompt(req, res) {
  try {
    const { sessionId } = req.params;

    const session = await ConversationSession.findOne({
      _id: sessionId,
      users: req.user._id,
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(404).json({ message: 'Conversation session not found.' });
    }

    const newPrompt = getRandomPrompt(session.prompt);
    session.prompt = newPrompt;
    await session.save();

    const systemMessage = await Message.create({
      session: session._id,
      sender: null,
      content: newPrompt,
      type: 'system',
    });

    return res.json({
      prompt: newPrompt,
      message: systemMessage,
    });
  } catch (error) {
    console.error('skipPrompt error', error);
    return res.status(500).json({ message: 'Could not change prompt.' });
  }
}

export async function trySomeoneElse(req, res) {
  try {
    const { sessionId } = req.params;

    const session = await ConversationSession.findOne({
      _id: sessionId,
      users: req.user._id,
      status: { $in: ['active', 'revealed'] },
    });

    if (!session) {
      return res.status(404).json({ message: 'Conversation session not found.' });
    }

    session.status = 'ended';
    await session.save();

    return res.json({ message: 'Conversation ended. Try someone else.' });
  } catch (error) {
    console.error('trySomeoneElse error', error);
    return res.status(500).json({ message: 'Could not end conversation.' });
  }
}
