import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchGameHistory } from '../api';
import { formatAmount, displayAmount } from '../utils/amount';

const GAME_TYPES = ['crash', 'roll', 'blackjack', 'duels', 'mines', 'towers', 'unbox', 'battles'];

export default function GameHistory() {
  const { gameType } = useParams<{ gameType: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<{ amount: number; payout: number; user?: string; createdAt: string }[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const type = (gameType || '').toLowerCase();

  useEffect(() => {
    if (!GAME_TYPES.includes(type)) {
      setError('Invalid game');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetchGameHistory(type, page)
      .then(({ list: l, count: c }) => {
        setList(l);
        setCount(c);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [type, page]);

  const th = { padding: '12px 16px', textAlign: 'left' as const, background: '#f8fafc', fontWeight: 600, fontSize: 12 };
  const td = { padding: '12px 16px', borderTop: '1px solid #eee', fontSize: 14 };
  const title = type ? type.charAt(0).toUpperCase() + type.slice(1) : '';

  if (!GAME_TYPES.includes(type)) {
    return (
      <div>
        <button type="button" onClick={() => navigate(-1)} style={{ marginBottom: 16, padding: '8px 12px', cursor: 'pointer' }}>← Back</button>
        <div style={{ color: '#b91c1c' }}>Invalid game type.</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={() => navigate('/games')} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>← Back to Games</button>
        <h1 style={{ fontSize: 22, margin: 0 }}>{title} – All game history</h1>
      </div>
      {error && <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div>}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>User</th>
            <th style={th}>Bet</th>
            <th style={th}>Win</th>
            <th style={th}>Profit / Loss</th>
            <th style={th}>Date</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ ...td, textAlign: 'center' }}>Loading...</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={5} style={{ ...td, textAlign: 'center' }}>No history</td></tr>
            ) : (
              list.map((row, i) => {
                const profit = displayAmount(row.payout) - displayAmount(row.amount);
                return (
                  <tr key={i}>
                    <td style={td}>{row.user ?? '-'}</td>
                    <td style={td}>{formatAmount(row.amount)}</td>
                    <td style={td}>{formatAmount(row.payout)}</td>
                    <td style={{ ...td, color: profit >= 0 ? '#16a34a' : '#b91c1c' }}>{profit >= 0 ? '+' : ''}{profit.toLocaleString()}</td>
                    <td style={td}>{row.createdAt ? new Date(row.createdAt).toLocaleString() : '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {count > 20 && (
          <div style={{ padding: 12, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#64748b' }}>Total: {count}</span>
            <div>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ marginRight: 8, padding: '6px 12px', cursor: 'pointer' }}>Prev</button>
              <span style={{ marginRight: 8 }}>Page {page}</span>
              <button disabled={list.length < 20} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', cursor: 'pointer' }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
