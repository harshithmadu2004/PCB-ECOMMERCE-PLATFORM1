'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { djangoApi, getAuthToken } from '../../lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await djangoApi.get('/orders/');
      setOrders(res.data.results || res.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load orders from Django API.');
    } finally {
      setLoading(false);
    }
  };

  const token = getAuthToken();

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div className="glass-card" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1rem' }}>Authentication Required</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Log in as a customer to view and track your PCB order history.
          </p>
          <Link href="/login" className="btn-glow">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Fetching Order History...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Order History & Status Tracking</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Real-time status updates synced with Django Backend
      </p>

      {error && (
        <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid var(--accent-rose)', color: '#fca5a5', padding: '1rem', borderRadius: '12px', marginBottom: '2rem' }}>
          ⚠️ {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
          <h3>No Orders Found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            You haven't placed any PCB orders yet.
          </p>
          <Link href="/products" className="btn-glow">Order Your First PCB</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
                    Order #{order.id}
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Placed on: {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
                <span className={`status-badge status-${order.status}`}>
                  {order.status}
                </span>
              </div>

              {/* Items in Order */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>Purchased Items</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem 0.8rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <div>
                        <strong>{item.product_name}</strong> &times; {item.quantity}
                        {item.pcb_specs && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.6rem' }}>
                            ({item.pcb_specs.layers || 2}L, {item.pcb_specs.thickness || '1.6mm'})
                          </span>
                        )}
                      </div>
                      <span style={{ color: 'var(--accent-cyan)' }}>${item.price_at_purchase} / unit</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.88rem', borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
                <div style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
                  <strong>Shipping Address:</strong> {order.shipping_address}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Paid</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                    ${order.total_amount}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
