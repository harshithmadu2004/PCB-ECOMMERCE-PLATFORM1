'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <section className="hero-section">
        <div style={{ display: 'inline-block', background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.3)', color: 'var(--accent-cyan)', padding: '0.3rem 0.9rem', borderRadius: '30px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1.2rem' }}>
          ⚡ Next-Gen PCB Manufacturing Engine
        </div>
        <h1 className="hero-title">
          Precision Custom PCB Fabrication <br /> Made Fast & Simple
        </h1>
        <p className="hero-subtitle">
          Order prototype and production PCBs with real-time specification pricing, instant microservice cart calculations, and full lifecycle tracking.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/products" className="btn-glow" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
            Explore Product Catalog
          </Link>
          <Link href="/cart" className="glass-card" style={{ padding: '0.8rem 2rem', textDecoration: 'none', color: 'white', fontWeight: '600' }}>
            View Cart (MongoDB)
          </Link>
        </div>
      </section>

      <div className="grid-3" style={{ marginTop: '3rem' }}>
        <div className="glass-card">
          <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>🛰️</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>High-Precision Layers</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Configure 2-layer to 32-layer impedance controlled stackups with ENIG, HASL, and OSP finishes.
          </p>
        </div>
        <div className="glass-card">
          <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>⚡</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>FastAPI Cart Microservice</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Decoupled MongoDB backend handles dynamic PCB customization specs and instant subtotal recalculations.
          </p>
        </div>
        <div className="glass-card">
          <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>🔒</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Shared JWT Interop</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Single Sign-On authentication system seamlessly linked across Next.js, React Admin, and Django SSR.
          </p>
        </div>
      </div>
    </div>
  );
}
