import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

export async function register(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }

    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed });
    const token = generateToken(user._id.toString());

    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted
      }
    });
  } catch (error) {
    console.error('register error', error);
    return res.status(500).json({ message: 'Registration failed' });
  }
}

export async function login(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastActiveAt = new Date();
    await user.save();

    const token = generateToken(user._id.toString());

    return res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        onboardingCompleted: user.onboardingCompleted
      }
    });
  } catch (error) {
    console.error('login error', error);
    return res.status(500).json({ message: 'Login failed' });
  }
}

export async function me(req, res) {
  return res.json(req.user);
}
