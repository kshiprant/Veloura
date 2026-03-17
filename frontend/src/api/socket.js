import { io } from 'socket.io-client';

let socket;

export function getSocket() {
  const token = localStorage.getItem('veloura_token');
  if (!socket && token) {
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    socket = io(baseUrl, {
      auth: { token }
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
