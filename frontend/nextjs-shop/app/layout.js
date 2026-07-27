'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './globals.css';
import { getCurrentUser, clearAuthData } from '../lib/api';

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    clearAuthData();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <html lang="en">
      <head>
        <title>PCB Engine Direct | Modular PCB E-Commerce</title>
        <meta name="description" content="Custom PCB Fabrication & Assembly Platform" />
      </head>
      <body>
        <nav class="navbar">
          <Link href="/" class="brand-title">
            <span>⚡</span> PCB Direct Customer Portal
          </Link>
          <div class="nav-links">
            <Link href="/products">Products</Link>
            <Link href="/cart">Cart (FastAPI)</Link>
            {user ? (
              <>
                <Link href="/orders">My Orders</Link>
                <span style={{ color: 'var(--accent-cyan)', fontSize: '0.88rem' }}>
                  Hi, {user.username}
                </span>
                <button 
                  onClick={handleLogout}
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
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" class="btn-glow">
                Customer Login
              </Link>
            )}
          </div>
        </nav>
        <main class="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
