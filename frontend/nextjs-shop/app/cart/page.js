'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fastapiApi, djangoApi, getAuthToken } from '../../lib/api';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('123 Innovation Way, Tech Park, Suite 400');
  const [notes, setNotes] = useState('Please double check layer stackup alignment before panelization.');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fastapiApi.get('/cart/');
      setCart(res.data);
    } catch (err) {
      console.error(err);
      setError('Unable to fetch cart from FastAPI microservice.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await fastapiApi.delete(`/cart/items/${itemId}`);
      fetchCart();
    } catch (err) {
      console.error(err);
      alert('Failed to remove item from FastAPI Cart');
    }
  };

  const handleCheckout = async () => {
    if (!cart || !cart.items || cart.items.length === 0) return;
    setCheckoutLoading(true);
    setError('');

    try {
      // 1. Create Django Order from Cart items
      const orderData = {
        total_amount: cart.total_price,
        shipping_address: shippingAddress,
        notes: notes,
        items: cart.items.map(item => ({
          product_name: item.product_name,
          quantity: item.quantity,
          price_at_purchase: item.unit_price,
          pcb_specs: item.specs || {}
        }))
      };

      const orderRes = await djangoApi.post('/orders/', orderData);

      // 2. Clear FastAPI Cart upon successful checkout
      await fastapiApi.delete('/cart/');
      
      setMessage(`Success! Order #${orderRes.data.id} has been submitted for Admin approval.`);
      setCart({ items: [], total_price: 0 });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to place order. Check Django Auth/Order API status.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const token = getAuthToken();

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div className="glass-card" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1rem' }}>Authentication Required</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Please log in as a customer to manage your FastAPI microservice cart and place orders.
          </p>
          <Link href="/login" className="btn-glow">Sign In Now</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Connecting to FastAPI Cart Microservice...</div>;
  }

  const items = cart?.items || [];

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Shopping Cart</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Managed by <span style={{ color: 'var(--accent-cyan)' }}>FastAPI + MongoDB Microservice</span>
      </p>

      {message && (
        <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid var(--accent-emerald)', color: '#6ee7b7', padding: '1rem', borderRadius: '12px', marginBottom: '2rem' }}>
          ✅ {message} <br />
          <Link href="/orders" style={{ color: 'white', textDecoration: 'underline', marginTop: '0.5rem', display: 'inline-block' }}>Track Order Status &rarr;</Link>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid var(--accent-rose)', color: '#fca5a5', padding: '1rem', borderRadius: '12px', marginBottom: '2rem' }}>
          ⚠️ {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛒</div>
          <h3>Your cart is currently empty</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Configure custom PCB designs and add them to your cart.
          </p>
          <Link href="/products" className="btn-glow">Browse Products</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem' }}>
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item) => (
              <div key={item.item_id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{item.product_name}</h3>
                  <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <span>Layers: <strong>{item.specs?.layers || 2}</strong></span>
                    <span>Thickness: <strong>{item.specs?.thickness || '1.6mm'}</strong></span>
                    <span>Finish: <strong>{item.specs?.surface_finish || 'HASL'}</strong></span>
                  </div>
                  <div style={{ fontSize: '0.88rem' }}>
                    Price: ${item.unit_price} &times; {item.quantity} qty = <strong style={{ color: 'var(--accent-cyan)' }}>${item.subtotal}</strong>
                  </div>
                </div>

                <button 
                  onClick={() => handleRemoveItem(item.item_id)}
                  style={{
                    background: 'rgba(244,63,94,0.15)',
                    border: '1px solid rgba(244,63,94,0.3)',
                    color: 'var(--accent-rose)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Checkout Panel */}
          <div className="glass-card" style={{ height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1.2rem' }}>Checkout & Order Placement</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Shipping Address</label>
              <textarea 
                className="input-field" 
                rows="3"
                value={shippingAddress} 
                onChange={(e) => setShippingAddress(e.target.value)} 
                required 
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>PCB Engineering Notes</label>
              <input 
                type="text" 
                className="input-field" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700' }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--accent-cyan)' }}>${cart.total_price}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout} 
              className="btn-glow" 
              style={{ width: '100%', padding: '0.75rem' }}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? 'Submitting Order...' : '🚀 Place Order (Django API)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
