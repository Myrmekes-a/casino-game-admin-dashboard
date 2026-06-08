import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:7777' : '');

export function adminSocketEmit<T>(event: string, data: unknown): Promise<T> {
  const token = localStorage.getItem('admin_token');
  if (!token) return Promise.reject(new Error('Not authenticated'));
  const socket = io(`${SOCKET_URL}/admin`, { auth: { token }, transports: ['websocket'] });
  return new Promise((resolve, reject) => {
    socket.emit(event, data, (res: { success?: boolean; error?: { message: string }; [k: string]: unknown }) => {
      socket.disconnect();
      if (res?.success === false) reject(new Error(res.error?.message || 'Request failed'));
      else resolve(res as T);
    });
  });
}


