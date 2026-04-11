import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../api';
import { formatAmount } from '../utils/amount';

type DashboardData = {
  totalUsers: number;
  newUsersThisMonth: number;
  bannedUsers: number;
  totalGames: number;
  totalDeposit: number;
  totalWithdraw: number;
  totalWagered: number;
  totalWon: number;
  houseProfit: number;
  latestRegistrations: { username: string; balance: number; createdAt: string }[];
  latestPayStats: { system: string; sum: number; user?: string; date: string }[];
  latestGameStats: { game: string; user?: string; bet: number; win: number; date: string }[];
};

const cardStyle = (color: string) => ({
  padding: 20,
  borderRadius: 12,
  background: '#fff',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  borderLeft: `4px solid ${color}`,
});
const tableWrap = { background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' as const };
const thStyle = { padding: '12px 16px', textAlign: 'left' as const, background: '#f8fafc', fontWeight: 600, fontSize: 12 };
const tdStyle = { padding: '12px 16px', borderTop: '1px solid #eee', fontSize: 14 };

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard()
      .then(d => setData(d))
      .catch(e => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading dashboard...</div>;
  if (error) return <div style={{ color: '#b91c1c', padding: 40 }}>{error}</div>;
  if (!data) return null;

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 22 }}>Dashboard</h1>
      <p style={{ marginBottom: 20, fontSize: 14, color: '#64748b' }}>Short overview of site activity and totals.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <div style={cardStyle('#3b82f6')}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total Users</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{data.totalUsers}</div>
          <Link to="/users" style={{ fontSize: 12, color: '#3b82f6', marginTop: 8, display: 'inline-block' }}>More</Link>
        </div>
        <div style={cardStyle('#22c55e')}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>New This Month</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{data.newUsersThisMonth}</div>
          <Link to="/users" style={{ fontSize: 12, color: '#22c55e', marginTop: 8, display: 'inline-block' }}>More</Link>
        </div>
        <div style={cardStyle('#f59e0b')}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Banned</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{data.bannedUsers}</div>
          <Link to="/users" style={{ fontSize: 12, color: '#f59e0b', marginTop: 8, display: 'inline-block' }}>More</Link>
        </div>
        <div style={cardStyle('#ef4444')}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Game Rounds</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{data.totalGames?.toLocaleString() ?? 0}</div>
          <Link to="/games" style={{ fontSize: 12, color: '#ef4444', marginTop: 8, display: 'inline-block' }}>More</Link>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={cardStyle('#0ea5e9')}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total Deposit</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{formatAmount(data.totalDeposit)}</div>
        </div>
        <div style={cardStyle('#8b5cf6')}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total Withdraw</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{formatAmount(data.totalWithdraw)}</div>
        </div>
        <div style={cardStyle('#64748b')}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total Wagered</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{formatAmount(data.totalWagered)}</div>
        </div>
        <div style={cardStyle(data.houseProfit >= 0 ? '#16a34a' : '#dc2626')}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>House Profit</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{formatAmount(data.houseProfit)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={tableWrap}>
          <div style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 600 }}>Latest transactions (deposit/withdraw)</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={thStyle}>System</th><th style={thStyle}>Amount</th><th style={thStyle}>User</th><th style={thStyle}>Date</th>
            </tr></thead>
            <tbody>
              {(data.latestPayStats || []).length === 0 ? <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#64748b' }}>No recent transactions</td></tr> :
                (data.latestPayStats || []).map((row, i) => (
                  <tr key={i}><td style={tdStyle}>{row.system}</td><td style={tdStyle}>{formatAmount(row.sum)}</td><td style={tdStyle}>{row.user ?? '-'}</td><td style={tdStyle}>{row.date ? new Date(row.date).toLocaleString() : '-'}</td></tr>
                ))}
            </tbody>
          </table>
        </div>
        <div style={tableWrap}>
          <div style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 600 }}>Latest game bets (all games)</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={thStyle}>Game</th><th style={thStyle}>User</th><th style={thStyle}>Bet</th><th style={thStyle}>Win</th><th style={thStyle}>Date</th>
            </tr></thead>
            <tbody>
              {(data.latestGameStats || []).length === 0 ? <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#64748b' }}>No recent bets</td></tr> :
                (data.latestGameStats || []).map((row, i) => (
                  <tr key={i}><td style={tdStyle}>{row.game}</td><td style={tdStyle}>{row.user ?? '-'}</td><td style={tdStyle}>{formatAmount(row.bet)}</td><td style={tdStyle}>{formatAmount(row.win)}</td><td style={tdStyle}>{row.date ? new Date(row.date).toLocaleString() : '-'}</td></tr>
                ))}
            </tbody>
          </table>
        </div>
        <div style={tableWrap}>
          <div style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 600 }}>Latest registrations</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={thStyle}>Username</th><th style={thStyle}>Balance</th><th style={thStyle}>Date</th></tr></thead>
            <tbody>
              {(data.latestRegistrations || []).length === 0 ? <tr><td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: '#64748b' }}>No users yet</td></tr> :
                (data.latestRegistrations || []).map((row, i) => (
                  <tr key={i}><td style={tdStyle}>{row.username ?? '-'}</td><td style={tdStyle}>{formatAmount(row.balance)}</td><td style={tdStyle}>{row.createdAt ? new Date(row.createdAt).toLocaleString() : '-'}</td></tr>
                ))}
            </tbody>
          </table>
        </div>
        <div style={tableWrap}>
          <div style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 600 }}>Summary</div>
          <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 8 }}>Total wagered: <strong>{formatAmount(data.totalWagered)}</strong></div>
            <div style={{ marginBottom: 8 }}>Total won (players): <strong>{formatAmount(data.totalWon)}</strong></div>
            <div>House profit (deposit − withdraw): <strong style={{ color: (data.houseProfit ?? 0) >= 0 ? '#16a34a' : '#dc2626' }}>{formatAmount(data.houseProfit)}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
