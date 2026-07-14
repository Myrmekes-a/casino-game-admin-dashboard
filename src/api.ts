const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:7777' : '');

export function getAuthHeaders(): Record<string, string> {
  const t = localStorage.getItem('admin_token');
  return t ? { 'x-auth-token': t, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export async function fetchDashboard() {
  const res = await fetch(`${API}/admin/dashboard`, { headers: getAuthHeaders() });
  const data = await res.json().catch(() => ({}));
  if (res.status === 403) throw new Error('Admin access required. Log in with an account that has rank "admin" (e.g. run npm run seed-admins in backend).');
  if (!data.success) throw new Error(data.error?.message || 'Failed to load dashboard');
  return data;
}

export async function deleteUser(userId: string) {
  const res = await fetch(`${API}/admin/users/${userId}`, { method: 'DELETE', headers: getAuthHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!data.success) throw new Error(data.error?.message || 'Delete failed');
}

export type GameStat = { game: string; totalBet: number; totalWon: number; profit: number; rounds: number; rtp: string; winPercent: string };

export async function fetchGameStats(): Promise<GameStat[]> {
  const res = await fetch(`${API}/admin/games/stats`, { headers: getAuthHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!data.success) throw new Error(data.error?.message || 'Failed to load game stats');
  return data.stats || [];
}

export async function fetchGameHistory(gameType: string, page: number): Promise<{ list: { amount: number; payout: number; user?: string; createdAt: string }[]; count: number }> {
  const res = await fetch(`${API}/admin/games/${encodeURIComponent(gameType)}/history?page=${page}`, { headers: getAuthHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!data.success) throw new Error(data.error?.message || 'Failed to load history');
  return { list: data.list || [], count: data.count || 0 };
}



