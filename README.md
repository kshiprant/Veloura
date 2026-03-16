# Veloura SaaS

Veloura is a full-stack dating SaaS with onboarding, profile management, discovery, likes, matching, and real-time messaging.

## Tech Stack
- Frontend: React + Vite + React Router
- Backend: Node.js + Express + MongoDB + Socket.IO
- Auth: JWT + bcrypt

## Features
- Sign up / sign in
- Secure JWT authentication
- Multi-step onboarding inspired by the Veloura UI
- Profile editing with photos, prompts, interests, intentions
- Discovery feed excluding already liked / matched users
- Like another profile and auto-create a match on mutual like
- Matches list
- Real-time messaging with Socket.IO
- Clean premium mobile-first UI

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create `backend/.env` from `backend/.env.example`

### 3. Start development
```bash
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`

## Production notes
- Use MongoDB Atlas or your own MongoDB instance
- Set strong JWT secret
- Configure frontend env `VITE_API_URL`
- Add HTTPS, rate limiting, email verification, image storage (Cloudinary / S3), moderation, and payments before public launch

## Demo user flow
1. Create account
2. Complete onboarding
3. Discover profiles
4. Like profiles
5. When both users like each other, a match appears
6. Start chatting in Matches
