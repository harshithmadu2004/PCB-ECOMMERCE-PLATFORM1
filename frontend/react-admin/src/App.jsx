import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import { getCurrentUser, clearAuthData } from './api';

function AppLayout({ children }) {
  const [user, setUser] = useState(getCurrentUser());
  const location = useLocation();

  const handleLogout = () => {
    clearAuthData();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <div>
      {user && (
        <nav className="navbar">
          <Link to="/dashboard" className="brand">
            ⚡ PCB Direct <span>React Admin</span>
          </Link>
          <ul className="nav-links">
            <li><Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link></li>
            <li><Link to="/orders" className={location.pathname === '/orders' ? 'active' : ''}>Orders</Link></li>
            <li><Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>Products</Link></li>
            <li>
              <span className={`role-badge role-${user.role}`}>{user.role}</span>
            </li>
            <li>
              <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                Logout ({user.username})
              </button>
            </li>
          </ul>
        </nav>
      )}
      <main className="container">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const user = getCurrentUser();

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" />} />
          <Route path="/products" element={user ? <Products /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
