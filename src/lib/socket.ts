import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:7777' : '');

let adminSocket: Socket | null = null;

export function getAdminSocket(token: string): Socket {
  if (adminSocket?.connected) return adminSocket;
  adminSocket = io(`${SOCKET_URL}/admin`, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket'],
  });
  return adminSocket;
}

export function disconnectAdminSocket() {
  if (adminSocket) {
    adminSocket.disconnect();
    adminSocket = null;
  }
}

export function socketEmit<T>(event: string, data: unknown): Promise<T> {
  const token = localStorage.getItem('admin_token');
  if (!token) return Promise.reject(new Error('Not authenticated'));
  const socket = getAdminSocket(token);
  return new Promise((resolve, reject) => {
    socket.emit(event, data, (res: { success?: boolean; error?: { message: string }; [k: string]: unknown }) => {
      if (res?.success === false) reject(new Error(res.error?.message || 'Request failed'));
      else resolve(res as T);
    });
  });
}

