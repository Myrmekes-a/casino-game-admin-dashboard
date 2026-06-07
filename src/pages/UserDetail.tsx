import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminSocketEmit } from '../lib/adminSocket';
import { formatAmount, displayAmount } from '../utils/amount';

type UserData = {
  _id: string;
  username?: string;
  balance?: number;
  rank?: string;
  stats?: { bet?: number; won?: number; deposit?: number; withdraw?: number };
  createdAt?: string;
  [k: string]: unknown;
};
type Transaction = { method: string; amount: number; type?: string; deposit?: { user?: unknown }; withdraw?: { user?: unknown }; state?: string; createdAt?: string };
type Game = { method: string; amount: number; payout?: number; createdAt?: string };

const sectionStyle = { background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' as const, marginBottom: 24 };
const thStyle = { padding: '12px 16px', textAlign: 'left' as const, background: '#f8fafc', fontWeight: 600, fontSize: 12 };
const tdStyle = { padding: '12px 16px', borderTop: '1px solid #eee', fontSize: 14 };

export default function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [txPage, setTxPage] = useState(1);
  const [gamePage, setGamePage] = useState(1);
  const [txCount, setTxCount] = useState(0);
  const [gameCount, setGameCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError('');
    Promise.all([
      adminSocketEmit<{ data: UserData }>('getUserData', { userId }),
      adminSocketEmit<{ transactions: Transaction[]; count: number }>('getUserTransactionList', { userId, page: txPage }),
      adminSocketEmit<{ games: Game[]; count: number }>('getUserGameList', { userId, page: gamePage }),
    ])
      .then(([userRes, txRes, gameRes]) => {
        setUser(userRes.data);
        setTransactions(txRes.transactions || []);
        setGames(gameRes.games || []);
        setTxCount(txRes.count ?? 0);
        setGameCount(gameRes.count ?? 0);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [userId, txPage, gamePage]);

  if (!userId) return null;
  if (loading && !user) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error && !user) return <div style={{ padding: 40, color: '#b91c1c' }}>{error}</div>;
  if (!user) return null;

  const txType = (t: Transaction) => {
    if (t.type) return t.type;
    if (t.deposit?.user) return 'deposit';
    if (t.withdraw?.user) return 'withdraw';
    return '-';
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={() => navigate(-1)} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>← Back</button>
        <h1 style={{ fontSize: 22, margin: 0 }}>{user.username || user._id}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ ...sectionStyle, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Balance</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{formatAmount(user.balance)}</div>
        </div>
        <div style={{ ...sectionStyle, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Rank</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{user.rank ?? '-'}</div>
        </div>
        <div style={{ ...sectionStyle, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Deposit (total)</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{formatAmount(user.stats?.deposit)}</div>
        </div>
        <div style={{ ...sectionStyle, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Withdraw (total)</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{formatAmount(user.stats?.withdraw)}</div>
        </div>
        <div style={{ ...sectionStyle, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Bet (total)</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{formatAmount(user.stats?.bet)}</div>
        </div>
        <div style={{ ...sectionStyle, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Won (total)</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{formatAmount(user.stats?.won)}</div>
        </div>
        <div style={{ ...sectionStyle, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Joined</div>
          <div style={{ fontSize: 14 }}>{user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}</div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 600 }}>Transactions (deposit / withdraw)</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={thStyle}>Method</th><th style={thStyle}>Type</th><th style={thStyle}>Amount</th><th style={thStyle}>Date</th></tr></thead>
          <tbody>
            {transactions.length === 0 ? <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center' }}>No transactions</td></tr> :
              transactions.map((t, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{t.method}</td>
                  <td style={tdStyle}>{txType(t)}</td>
                  <td style={tdStyle}>{formatAmount(t.amount)}</td>
                  <td style={tdStyle}>{t.createdAt ? new Date(t.createdAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {txCount > 14 && (
          <div style={{ padding: 12, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: '#64748b' }}>Total: {txCount}</span>
            <div>
              <button disabled={txPage <= 1} onClick={() => setTxPage(p => p - 1)} style={{ marginRight: 8, padding: '6px 12px', cursor: 'pointer' }}>Prev</button>
              <span style={{ marginRight: 8 }}>Page {txPage}</span>
              <button disabled={transactions.length < 14} onClick={() => setTxPage(p => p + 1)} style={{ padding: '6px 12px', cursor: 'pointer' }}>Next</button>
            </div>
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <div style={{ padding: '12px 16px', background: '#f8fafc', fontWeight: 600 }}>Game history (bet / win / loss)</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={thStyle}>Game</th><th style={thStyle}>Bet</th><th style={thStyle}>Win</th><th style={thStyle}>Profit</th><th style={thStyle}>Date</th></tr></thead>
          <tbody>
            {games.length === 0 ? <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center' }}>No games</td></tr> :
              games.map((g, i) => {
                const betDisplay = displayAmount(g.amount);
                const winDisplay = displayAmount(g.payout);
                const profit = winDisplay - betDisplay;
                return (
                  <tr key={i}>
                    <td style={tdStyle}>{g.method}</td>
                    <td style={tdStyle}>{formatAmount(g.amount)}</td>
                    <td style={tdStyle}>{formatAmount(g.payout)}</td>
                    <td style={{ ...tdStyle, color: profit >= 0 ? '#16a34a' : '#b91c1c' }}>{profit >= 0 ? '+' : ''}{profit.toLocaleString()}</td>
                    <td style={tdStyle}>{g.createdAt ? new Date(g.createdAt).toLocaleString() : '-'}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {gameCount > 14 && (
          <div style={{ padding: 12, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: '#64748b' }}>Total: {gameCount}</span>
            <div>
              <button disabled={gamePage <= 1} onClick={() => setGamePage(p => p - 1)} style={{ marginRight: 8, padding: '6px 12px', cursor: 'pointer' }}>Prev</button>
              <span style={{ marginRight: 8 }}>Page {gamePage}</span>
              <button disabled={games.length < 14} onClick={() => setGamePage(p => p + 1)} style={{ padding: '6px 12px', cursor: 'pointer' }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



