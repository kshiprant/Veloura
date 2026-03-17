import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

const users = [
  {
    email: 'ava@veloura.app',
    password: 'password123',
    firstName: 'Ava',
    age: 27,
    gender: 'Woman',
    city: 'Mumbai',
    bio: 'I love thoughtful conversations, slow mornings, and meaningful connection.',
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80'],
    interests: ['Reading', 'Travel', 'Coffee'],
    prompts: [
      { question: 'The way to my heart is...', answer: 'Kindness, curiosity, and showing up consistently.' },
      { question: 'A perfect first date looks like...', answer: 'Coffee, a walk, and conversation that feels easy.' }
    ],
    intention: 'Something meaningful',
    onboardingCompleted: true
  },
  {
    email: 'noah@veloura.app',
    password: 'password123',
    firstName: 'Noah',
    age: 29,
    gender: 'Man',
    city: 'Bengaluru',
    bio: 'Builder by day, reader by night. Looking for someone genuine.',
    photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80'],
    interests: ['Fitness', 'Podcasts', 'Writing'],
    prompts: [
      { question: 'The way to my heart is...', answer: 'Honesty, humor, and emotional maturity.' },
      { question: 'A perfect first date looks like...', answer: 'A bookstore, a café, and zero pressure.' }
    ],
    intention: 'Long-term relationship',
    onboardingCompleted: true
  }
];

await connectDB(process.env.MONGO_URI);
await User.deleteMany({ email: { $in: users.map((u) => u.email) } });
for (const item of users) {
  const password = await bcrypt.hash(item.password, 10);
  await User.create({ ...item, password });
}
console.log('Seed complete');
process.exit(0);
