// src/layout/AdminLayout.jsx

import React from 'react';
import Sidebar from '../components/Sidebar';
import { auth } from '../firebaseConfig';

// Menerima 'children' sebagai properti
function AdminLayout({ user, children }) {
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className="admin-layout">
      {/* 1. Sidebar */}
      <Sidebar />
      
      {/* 2. Konten (Header + Halaman) */}
      <div className="admin-content-wrapper">
        
        {/* Header yang persisten */}
        <header className="admin-header">
          <h1>Welcome, {user?.email || 'Admin'}!</h1>
          <button onClick={handleLogout}>
            Logout
          </button>
        </header>

        {/* Konten Halaman yang akan berubah */}
        <main className="admin-main-content">
          {children} {/* <-- Tampilkan konten yang dilewatkan */}
        </main>
        
      </div>
    </div>
  );
}

export default AdminLayout;