import Match from '../models/Match.js';
import Message from '../models/Message.js';

export async function getMessages(req, res) {
  try {
    const { matchId } = req.params;
    const match = await Match.findOne({ _id: matchId, users: req.user._id });
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const messages = await Message.find({ matchId })
      .populate('sender', 'firstName photos')
      .sort({ createdAt: 1 });

    return res.json(messages);
  } catch (error) {
    console.error('get messages error', error);
    return res.status(500).json({ message: 'Could not load messages' });
  }
}

export async function sendMessage(req, res) {
  try {
    const { matchId } = req.params;
    const { content } = req.body;

    const match = await Match.findOne({ _id: matchId, users: req.user._id });
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const message = await Message.create({
      matchId,
      sender: req.user._id,
      content
    });

    match.lastMessageAt = new Date();
    await match.save();

    const populated = await Message.findById(message._id).populate('sender', 'firstName photos');
    return res.status(201).json(populated);
  } catch (error) {
    console.error('send message error', error);
    return res.status(500).json({ message: 'Could not send message' });
  }
}
