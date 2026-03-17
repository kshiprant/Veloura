import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import jwt from 'jsonwebtoken';
import Message from './models/Message.js';
import Match from './models/Match.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

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
    const match = await Match.findOne({ _id: matchId, users: socket.userId });
    if (match) socket.join(matchId);
  });

  socket.on('send_message', async ({ matchId, content }) => {
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

    const populated = await Message.findById(message._id).populate('sender', 'firstName photos');
    io.to(matchId).emit('new_message', populated);
  });
});

const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGO_URI)
  .then(() => server.listen(PORT, () => console.log(`Server running on ${PORT}`)))
  .catch((error) => {
    console.error('DB connection failed', error);
    process.exit(1);
  });
