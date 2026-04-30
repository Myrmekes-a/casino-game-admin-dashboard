import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { deleteUser as apiDeleteUser } from '../api';
import { formatAmount, toStoredAmount } from '../utils/amount';

type User = { _id: string; username?: string; balance?: number; rank?: string; createdAt?: string };

function socketEmit<T>(event: string, data: unknown): Promise<T> {
  const token = localStorage.getItem('admin_token');
  if (!token) return Promise.reject(new Error('Not authenticated'));
  const socket = io(`${import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:7777' : '')}/admin`, { auth: { token }, transports: ['websocket'] });
  return new Promise((resolve, reject) => {
    socket.emit(event, data, (res: { success?: boolean; error?: { message: string }; users?: User[]; count?: number; data?: unknown; user?: User }) => {
      socket.disconnect();
      if (res?.success === false) reject(new Error(res.error?.message || 'Request failed'));
      else resolve(res as T);
    });
  });
}

const RANKS = ['user', 'admin', 'mod'];

type UsersProps = { rankFilter?: 'admin' | 'user'; title?: string };

export default function Users({ rankFilter = 'user', title = 'Users' }: UsersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<User | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editRank, setEditRank] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    socketEmit<{ users: User[]; count: number }>('getUserList', { page, search: search || '', sort: 'newest', rank: rankFilter })
      .then(res => {
        setUsers(res.users || []);
        setCount(res.count ?? 0);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [page, search, rankFilter]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (u: User) => {
    setEditing(u);
    setEditBalance(String((u.balance ?? 0) / 1000));
    setEditRank(u.rank || 'user');
  };

  const saveEdit = async () => {
    if (!editing) return;
    setEditSaving(true);
    try {
      const displayVal = Math.max(0, Number(editBalance));
      const balanceNum = toStoredAmount(displayVal);
      await socketEmit('sendUserBalance', { userId: editing._id, balance: balanceNum });
      if (editRank !== (editing.rank || 'user')) {
        await socketEmit('sendUserValue', { userId: editing._id, setting: 'rank', value: editRank });
      }
      setUsers(prev => prev.map(u => u._id === editing._id ? { ...u, balance: balanceNum, rank: editRank } : u));
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (userId: string) => {
    setDeleteLoading(true);
    setError('');
    try {
      await apiDeleteUser(userId);
      setDeleteConfirm(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const th = { padding: '12px 16px', textAlign: 'left' as const, background: '#f8fafc', fontWeight: 600, fontSize: 12 };
  const td = { padding: '12px 16px', borderTop: '1px solid #eee', fontSize: 14 };
  const btn = { padding: '6px 10px', marginRight: 6, cursor: 'pointer', border: '1px solid #ddd', borderRadius: 6, background: '#fff', fontSize: 13 };

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 22 }}>{title}</h1>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <input type="search" placeholder="Search username / ID..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, width: 260 }} />
      </div>
      {error && <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div>}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>Username</th><th style={th}>Balance</th><th style={th}>Rank</th><th style={th}>Joined</th><th style={th}>Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ ...td, textAlign: 'center' }}>Loading...</td></tr> :
              users.map(u => (
                <tr key={u._id}>
                  <td style={td}>
                    <Link to={`/user/${u._id}`} style={{ color: '#3b82f6', fontWeight: 500 }}>{u.username ?? u._id}</Link>
                  </td>
                  <td style={td}>{formatAmount(u.balance)}</td>
                  <td style={td}>{u.rank ?? '-'}</td>
                  <td style={td}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                  <td style={td}>
                    <button type="button" style={btn} onClick={() => openEdit(u)}>Edit</button>
                    {deleteConfirm === u._id ? (
                      <>
                        <span style={{ marginRight: 8, fontSize: 13 }}>Delete?</span>
                        <button type="button" style={{ ...btn, color: '#b91c1c' }} onClick={() => handleDelete(u._id)} disabled={deleteLoading}>Yes</button>
                        <button type="button" style={btn} onClick={() => setDeleteConfirm(null)} disabled={deleteLoading}>No</button>
                      </>
                    ) : (
                      <button type="button" style={{ ...btn, color: '#b91c1c' }} onClick={() => setDeleteConfirm(u._id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div style={{ padding: 12, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: '#64748b' }}>Total: {count}</span>
          <div>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ marginRight: 8, padding: '6px 12px', cursor: 'pointer' }}>Prev</button>
            <span style={{ marginRight: 8 }}>Page {page}</span>
            <button disabled={users.length < 12} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', cursor: 'pointer' }}>Next</button>
          </div>
        </div>
      </div>

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => !editSaving && setEditing(null)}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, minWidth: 320 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>Edit user: {editing.username ?? editing._id}</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Balance (display units)</label>
              <input type="number" min={0} step="any" value={editBalance} onChange={e => setEditBalance(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Rank</label>
              <select value={editRank} onChange={e => setEditRank(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}>
                {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" style={btn} onClick={() => setEditing(null)} disabled={editSaving}>Cancel</button>
              <button type="button" style={{ ...btn, background: '#1a2332', color: '#fff' }} onClick={saveEdit} disabled={editSaving}>{editSaving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

