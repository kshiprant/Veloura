import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import Message from './models/Message.js';
import Match from './models/Match.js';

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_PREVIEW,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// serves uploaded images publicly
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const io = new Server(server, {
  cors: corsOptions
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.on('join_match', async (matchId) => {
    try {
      const match = await Match.findOne({ _id: matchId, users: socket.userId });
      if (match) socket.join(matchId);
    } catch (error) {
      console.error('join_match error:', error.message);
    }
  });

  socket.on('send_message', async ({ matchId, content }) => {
    try {
      if (!content?.trim()) return;

      const match = await Match.findOne({ _id: matchId, users: socket.userId });
      if (!match) return;

      const message = await Message.create({
        matchId,
        sender: socket.userId,
        content: content.trim()
      });

      match.lastMessageAt = new Date();
      await match.save();

      const populated = await Message.findById(message._id).populate(
        'sender',
        'firstName photos'
      );

      io.to(matchId).emit('new_message', populated);
    } catch (error) {
      console.error('send_message error:', error.message);
    }
  });
});

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI)
  .then(() => server.listen(PORT, () => console.log(`Server running on ${PORT}`)))
  .catch((error) => {
    console.error('DB connection failed', error);
    process.exit(1);
  });
