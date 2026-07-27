import React, { useState, useEffect } from 'react';
import { djangoApi, getCurrentUser } from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    setUser(getCurrentUser());
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await djangoApi.get('/orders/');
      setOrders(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await djangoApi.post(`/orders/${id}/approve/`);
      setActionMessage(`Order #${id} Approved successfully!`);
      fetchOrders();
    } catch (err) {
      alert('Failed to approve order');
    }
  };

  const handleReject = async (id) => {
    try {
      await djangoApi.post(`/orders/${id}/reject/`);
      setActionMessage(`Order #${id} Rejected.`);
      fetchOrders();
    } catch (err) {
      alert('Failed to reject order');
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'staff' || user?.is_superuser;

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading Orders...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>
        {isAdmin ? 'Order Management & Approvals' : 'My Orders & Status'}
      </h1>
      <p style={{ color: 'var(--text-sub)', marginBottom: '1.5rem' }}>
        {isAdmin ? 'Approve or reject pending customer PCB manufacturing requests' : 'Track your order status'}
      </p>

      {actionMessage && (
        <div style={{ background: 'rgba(0,242,254,0.15)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          ⚡ {actionMessage}
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Items & Specs</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Shipping Address</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#<strong>{o.id}</strong></td>
                <td>
                  <strong>{o.customer_username}</strong><br />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{o.customer_email}</span>
                </td>
                <td>
                  <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.85rem' }}>
                    {(o.items || []).map((item, idx) => (
                      <li key={idx}>
                        • {item.product_name} &times; {item.quantity} ({item.pcb_specs?.layers || 2}L)
                      </li>
                    ))}
                  </ul>
                </td>
                <td style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>${o.total_amount}</td>
                <td>
                  <span style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    background: o.status === 'APPROVED' ? 'rgba(16,185,129,0.15)' : o.status === 'PENDING' ? 'rgba(245,158,11,0.15)' : 'rgba(244,63,94,0.15)',
                    color: o.status === 'APPROVED' ? 'var(--accent-emerald)' : o.status === 'PENDING' ? 'var(--accent-amber)' : 'var(--accent-rose)'
                  }}>
                    {o.status}
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-sub)', maxWidth: '200px' }}>
                  {o.shipping_address}
                </td>
                {isAdmin && (
                  <td>
                    {o.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => handleApprove(o.id)} className="btn btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}>
                          Approve
                        </button>
                        <button onClick={() => handleReject(o.id)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-sub)', fontSize: '0.8rem' }}>No pending action</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', color: 'var(--text-sub)' }}>
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
