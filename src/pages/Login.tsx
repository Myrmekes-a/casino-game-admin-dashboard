import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <h1 style={{ marginBottom: 24, fontSize: 24 }}>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }} />
        </div>
        {error && <div style={{ color: '#b91c1c', marginBottom: 12, fontSize: 14 }}>{error}</div>}
        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: 12, background: '#1a2332', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 14, color: '#666' }}>
        No account? <Link to="/register" style={{ color: '#3b82f6' }}>Register</Link> (then set rank to admin in DB to access)
      </p>
    </div>
  );
}




