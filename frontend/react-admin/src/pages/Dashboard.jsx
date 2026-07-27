import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { djangoApi, getCurrentUser } from '../api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [orderRes, prodRes] = await Promise.all([
        djangoApi.get('/orders/'),
        djangoApi.get('/products/')
      ]);
      setOrders(orderRes.data.results || orderRes.data);
      setProducts(prodRes.data.results || prodRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading Dashboard...</div>;

  const isAdmin = user?.role === 'admin' || user?.role === 'staff' || user?.is_superuser;

  const totalRevenue = orders
    .filter(o => ['APPROVED', 'SHIPPED', 'COMPLETED'].includes(o.status))
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
    .toFixed(2);

  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const approvedCount = orders.filter(o => o.status === 'APPROVED').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>
            {isAdmin ? '🛡️ Admin Management Dashboard' : '👤 Customer Order Dashboard'}
          </h1>
          <p style={{ color: 'var(--text-sub)' }}>
            Welcome back, <strong>{user?.username}</strong> ({user?.role})
          </p>
        </div>
        <span className={`role-badge role-${user?.role || 'customer'}`}>
          Role: {user?.role}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <span style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>
            {isAdmin ? 'Total Sales Revenue' : 'Total Order Volume'}
          </span>
          <div className="stat-num" style={{ color: 'var(--accent-emerald)' }}>
            ${totalRevenue}
          </div>
        </div>

        <div className="card">
          <span style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>Pending Approval</span>
          <div className="stat-num" style={{ color: 'var(--accent-amber)' }}>
            {pendingCount}
          </div>
        </div>

        <div className="card">
          <span style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>Approved Orders</span>
          <div className="stat-num" style={{ color: 'var(--accent-emerald)' }}>
            {approvedCount}
          </div>
        </div>

        <div className="card">
          <span style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>Active Products</span>
          <div className="stat-num" style={{ color: 'var(--accent-cyan)' }}>
            {products.length}
          </div>
        </div>
      </div>

      {/* Role-Specific Views */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Recent Orders</h3>
          <Link to="/orders" className="btn btn-primary">
            {isAdmin ? 'Manage All Orders' : 'View Full History'}
          </Link>
        </div>

        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map((o) => (
              <tr key={o.id}>
                <td>#<strong>{o.id}</strong></td>
                <td>{o.customer_username || 'Customer'}</td>
                <td style={{ color: 'var(--accent-cyan)' }}>${o.total_amount}</td>
                <td>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    background: o.status === 'APPROVED' ? 'rgba(16,185,129,0.15)' : o.status === 'PENDING' ? 'rgba(245,158,11,0.15)' : 'rgba(244,63,94,0.15)',
                    color: o.status === 'APPROVED' ? 'var(--accent-emerald)' : o.status === 'PENDING' ? 'var(--accent-amber)' : 'var(--accent-rose)'
                  }}>
                    {o.status}
                  </span>
                </td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-sub)' }}>
                  No orders recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
