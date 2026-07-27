import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { djangoApi, setAuthData } from '../api';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('adminpassword');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await djangoApi.post('/auth/login/', { username, password });
      const { access, user } = res.data;
      setAuthData(access, user);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Authentication failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '4rem auto' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.6rem', textAlign: 'center', marginBottom: '0.4rem' }}>
          React Multi-Role Portal
        </h2>
        <p style={{ color: 'var(--text-sub)', textAlign: 'center', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          Login for both Admin & Customers
        </p>

        {error && (
          <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid var(--accent-rose)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '0.3rem' }}>Username</label>
            <input 
              type="text" 
              className="input-field" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '0.3rem' }}>Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '1.5rem' }}>
            💡 <strong>Quick Login Presets:</strong><br />
            • Admin: <code>admin</code> / <code>adminpassword</code><br />
            • Customer: <code>customer1</code> / <code>customerpassword</code>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
