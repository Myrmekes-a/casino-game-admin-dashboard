import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchGameStats, type GameStat } from '../api';
import { formatAmount } from '../utils/amount';

export default function Games() {
  const [stats, setStats] = useState<GameStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGameStats()
      .then(setStats)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  const th = { padding: '12px 16px', textAlign: 'left' as const, background: '#f8fafc', fontWeight: 600, fontSize: 12 };
  const td = { padding: '12px 16px', borderTop: '1px solid #eee', fontSize: 14 };

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 22 }}>Game Management</h1>
      <p style={{ marginBottom: 16, fontSize: 14, color: '#64748b' }}>Click a game to see full history of all users.</p>
      {error && <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div>}

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>Game</th>
            <th style={th}>Total bet</th>
            <th style={th}>Total won</th>
            <th style={th}>Profit / Loss</th>
            <th style={th}>RTP %</th>
            <th style={th}>Win %</th>
            <th style={th}>Rounds</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ ...td, textAlign: 'center' }}>Loading...</td></tr>
            ) : (
              stats.map(s => (
                <tr key={s.game}>
                  <td style={td}>
                    <Link to={`/games/${s.game.toLowerCase()}`} style={{ color: '#3b82f6', fontWeight: 500 }}>{s.game}</Link>
                  </td>
                  <td style={td}>{formatAmount(s.totalBet)}</td>
                  <td style={td}>{formatAmount(s.totalWon)}</td>
                  <td style={{ ...td, color: s.profit >= 0 ? '#16a34a' : '#b91c1c' }}>
                    {s.profit >= 0 ? '+' : ''}{formatAmount(s.profit)}
                  </td>
                  <td style={td}>{s.rtp}%</td>
                  <td style={td}>{s.winPercent}%</td>
                  <td style={td}>{s.rounds.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}




