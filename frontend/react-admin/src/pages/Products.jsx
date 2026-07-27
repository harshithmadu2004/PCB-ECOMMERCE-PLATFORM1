import React, { useState, useEffect } from 'react';
import { djangoApi, getCurrentUser } from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Product Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [maxLayers, setMaxLayers] = useState(4);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setUser(getCurrentUser());
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await djangoApi.get('/products/');
      setProducts(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await djangoApi.post('/products/', {
        name,
        sku,
        description,
        base_price: parseFloat(basePrice),
        max_layers: parseInt(maxLayers, 10),
        material: 'FR-4 High TG',
        surface_finish: 'ENIG',
        stock: 100
      });
      setMsg(`Product "${name}" created successfully!`);
      setName('');
      setSku('');
      setDescription('');
      setBasePrice('');
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to create product. Admin permissions required.');
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'staff' || user?.is_superuser;

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading Products...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>
        {isAdmin ? 'Product Control Panel' : 'PCB Catalog View'}
      </h1>
      <p style={{ color: 'var(--text-sub)', marginBottom: '1.5rem' }}>
        {isAdmin ? 'Manage manufacturing specs, base pricing, and catalog inventory' : 'Browse available PCB specs'}
      </p>

      {msg && (
        <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid var(--accent-emerald)', color: '#6ee7b7', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          ✅ {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 340px' : '1fr', gap: '1.5rem' }}>
        {/* Products Table */}
        <div className="card">
          <h3>Catalog Items</h3>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Base Price</th>
                <th>Max Layers</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><code>{p.sku}</code></td>
                  <td><strong>{p.name}</strong></td>
                  <td style={{ color: 'var(--accent-cyan)' }}>${p.base_price}</td>
                  <td>Up to {p.max_layers}L</td>
                  <td>{p.stock} pcs</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-sub)' }}>
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Product Form (Admin Only) */}
        {isAdmin && (
          <div className="card" style={{ height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1rem' }}>Add New Product</h3>
            <form onSubmit={handleCreateProduct}>
              <div style={{ marginBottom: '0.8rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '0.2rem' }}>Product Name</label>
                <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Rigid-Flex 4L PCB" />
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '0.2rem' }}>SKU Code</label>
                <input type="text" className="input-field" value={sku} onChange={(e) => setSku(e.target.value)} required placeholder="PCB-RF-4L" />
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '0.2rem' }}>Description</label>
                <textarea className="input-field" rows="2" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Advanced rigid-flex hybrid PCB" />
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '0.2rem' }}>Base Price ($)</label>
                <input type="number" step="0.01" className="input-field" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required placeholder="85.00" />
              </div>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '0.2rem' }}>Max Layers</label>
                <input type="number" className="input-field" value={maxLayers} onChange={(e) => setMaxLayers(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Publish Product
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
