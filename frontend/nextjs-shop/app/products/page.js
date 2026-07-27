'use client';

import { useState, useEffect } from 'react';
import { djangoApi, fastapiApi, getAuthToken } from '../../lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await djangoApi.get('/products/');
      setProducts(res.data.results || res.data);
      
      // Initialize default specs for each product
      const initial = {};
      (res.data.results || res.data).forEach(p => {
        initial[p.id] = {
          layers: p.max_layers || 2,
          thickness: '1.6mm',
          surface_finish: p.surface_finish || 'HASL with lead',
          quantity: 5
        };
      });
      setSelectedSpecs(initial);
    } catch (err) {
      console.error(err);
      setError('Unable to connect to Django Products API. Showing sample catalog fallback.');
      setProducts([
        {
          id: 1,
          name: '2-Layer Standard Prototyping PCB',
          sku: 'PCB-2L-STD',
          description: 'High reliability FR-4 substrate standard 2-layer PCB suitable for general hardware prototyping.',
          base_price: '15.00',
          max_layers: 2,
          surface_finish: 'HASL with lead',
          stock: 500
        },
        {
          id: 2,
          name: '4-Layer High-Speed Impedance Control PCB',
          sku: 'PCB-4L-IMP',
          description: '4-layer stackup with controlled differential impedance traces for USB 3.0 and high-speed processors.',
          base_price: '45.00',
          max_layers: 4,
          surface_finish: 'ENIG',
          stock: 300
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecChange = (productId, field, value) => {
    setSelectedSpecs(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleAddToCart = async (product) => {
    const token = getAuthToken();
    if (!token) {
      alert('Please log in as a customer first to add items to your cart.');
      window.location.href = '/login';
      return;
    }

    const specs = selectedSpecs[product.id] || {
      layers: product.max_layers || 2,
      thickness: '1.6mm',
      surface_finish: product.surface_finish,
      quantity: 5
    };

    try {
      await fastapiApi.post('/cart/items', {
        product_id: product.id,
        product_name: product.name,
        quantity: parseInt(specs.quantity, 10),
        unit_price: parseFloat(product.base_price),
        specs: {
          layers: parseInt(specs.layers, 10),
          thickness: specs.thickness,
          surface_finish: specs.surface_finish
        }
      });
      setNotification(`Added "${product.name}" to FastAPI MongoDB Cart!`);
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to add item to FastAPI Cart microservice.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading PCB Catalog...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>PCB Catalog & Configurator</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure layers, thickness, and finishes in real-time</p>
        </div>
      </div>

      {notification && (
        <div style={{ background: 'rgba(0,242,254,0.15)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '0.8rem 1.2rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
          ⚡ {notification}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid var(--accent-rose)', color: '#fca5a5', padding: '0.8rem 1.2rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="grid-3">
        {products.map(prod => {
          const spec = selectedSpecs[prod.id] || { layers: 2, thickness: '1.6mm', surface_finish: 'HASL', quantity: 5 };
          const calculatedPrice = (parseFloat(prod.base_price) * parseInt(spec.quantity, 10)).toFixed(2);

          return (
            <div key={prod.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <h3 style={{ fontSize: '1.2rem', lineHeight: '1.3' }}>{prod.name}</h3>
                  <span className="mono" style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4rem' }}>
                    {prod.sku}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                  {prod.description}
                </p>

                {/* Specs Selection */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Layers</label>
                      <select 
                        className="input-field" 
                        style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                        value={spec.layers}
                        onChange={(e) => handleSpecChange(prod.id, 'layers', e.target.value)}
                      >
                        <option value="2">2 Layers</option>
                        <option value="4">4 Layers</option>
                        <option value="6">6 Layers</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Thickness</label>
                      <select 
                        className="input-field"
                        style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                        value={spec.thickness}
                        onChange={(e) => handleSpecChange(prod.id, 'thickness', e.target.value)}
                      >
                        <option value="0.8mm">0.8 mm</option>
                        <option value="1.2mm">1.2 mm</option>
                        <option value="1.6mm">1.6 mm</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Finish</label>
                      <select 
                        className="input-field"
                        style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                        value={spec.surface_finish}
                        onChange={(e) => handleSpecChange(prod.id, 'surface_finish', e.target.value)}
                      >
                        <option value="HASL with lead">HASL with lead</option>
                        <option value="ENIG Gold">ENIG Gold</option>
                        <option value="OSP">OSP</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Quantity</label>
                      <input 
                        type="number" 
                        className="input-field"
                        style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                        min="1"
                        value={spec.quantity}
                        onChange={(e) => handleSpecChange(prod.id, 'quantity', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Est. Subtotal</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                      ${calculatedPrice}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>In Stock</span>
                </div>

                <button 
                  onClick={() => handleAddToCart(prod)} 
                  className="btn-glow" 
                  style={{ width: '100%', padding: '0.65rem' }}
                >
                  🛒 Add to FastAPI Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
