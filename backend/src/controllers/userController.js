import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Match from '../models/Match.js';

export async function saveOnboarding(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }

    const allowed = ['firstName', 'age', 'gender', 'city', 'photos', 'bio', 'interests', 'prompts', 'intention'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const completed = Boolean(updates.firstName || req.user.firstName) &&
      Boolean(updates.age || req.user.age) &&
      Boolean(updates.gender || req.user.gender) &&
      Boolean(updates.city || req.user.city);

    updates.onboardingCompleted = completed;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    return res.json(user);
  } catch (error) {
    console.error('save onboarding error', error);
    return res.status(500).json({ message: 'Could not save onboarding' });
  }
}

export async function updateProfile(req, res) {
  try {
    const fields = ['firstName', 'age', 'gender', 'city', 'bio', 'photos', 'interests', 'prompts', 'intention'];
    const updates = {};
    for (const field of fields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    return res.json(user);
  } catch (error) {
    console.error('update profile error', error);
    return res.status(500).json({ message: 'Could not update profile' });
  }
}

export async function getDiscovery(req, res) {
  try {
    const currentUser = await User.findById(req.user._id).select('likesSent');
    const matches = await Match.find({ users: req.user._id }).select('users');
    const matchedUserIds = matches
      .flatMap((m) => m.users)
      .filter((id) => String(id) !== String(req.user._id));

    const excludeIds = [currentUser._id, ...currentUser.likesSent, ...matchedUserIds];

    const users = await User.find({
      _id: { $nin: excludeIds },
      onboardingCompleted: true
    })
      .select('-password -likesSent -likesReceived -matches')
      .sort({ lastActiveAt: -1 })
      .limit(25);

    return res.json(users);
  } catch (error) {
    console.error('get discovery error', error);
    return res.status(500).json({ message: 'Could not load discovery' });
  }
}

export async function likeUser(req, res) {
  try {
    const { targetUserId } = req.params;
    if (String(targetUserId) === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot like yourself' });
    }

    const user = await User.findById(req.user._id);
    const target = await User.findById(targetUserId);

    if (!target || !target.onboardingCompleted) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const alreadyMatched = await Match.findOne({ users: { $all: [user._id, target._id] } });
    if (alreadyMatched) {
      return res.json({ matched: true, matchId: alreadyMatched._id });
    }

    if (!user.likesSent.some((id) => String(id) === String(target._id))) {
      user.likesSent.push(target._id);
    }

    if (!target.likesReceived.some((id) => String(id) === String(user._id))) {
      target.likesReceived.push(user._id);
    }

    const mutual = target.likesSent.some((id) => String(id) === String(user._id));

    await user.save();
    await target.save();

    if (mutual) {
      const match = await Match.create({
        users: [user._id, target._id],
        createdBy: user._id
      });

      user.matches.push(match._id);
      target.matches.push(match._id);

      await user.save();
      await target.save();

      return res.json({
        matched: true,
        matchId: match._id,
        message: "It's a match!"
      });
    }

    return res.json({ matched: false, message: 'Like sent' });
  } catch (error) {
    console.error('like user error', error);
    return res.status(500).json({ message: 'Could not like profile' });
  }
}

export async function getMyMatches(req, res) {
  try {
    const matches = await Match.find({ users: req.user._id })
      .populate({
        path: 'users',
        select: 'firstName age city photos bio interests intention lastActiveAt'
      })
      .sort({ lastMessageAt: -1, createdAt: -1 });

    const formatted = matches.map((match) => ({
      ...match.toObject(),
      otherUser: match.users.find((u) => String(u._id) !== String(req.user._id))
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('get matches error', error);
    return res.status(500).json({ message: 'Could not load matches' });
  }
}

export async function getLikesReceived(req, res) {
  try {
    const currentUser = await User.findById(req.user._id).select('likesReceived');

    const users = await User.find({
      _id: { $in: currentUser.likesReceived },
      onboardingCompleted: true
    })
      .select('firstName age city photos bio interests intention lastActiveAt')
      .sort({ lastActiveAt: -1 });

    return res.json(users);
  } catch (error) {
    console.error('get likes received error', error);
    return res.status(500).json({ message: 'Could not load likes received' });
  }
}
