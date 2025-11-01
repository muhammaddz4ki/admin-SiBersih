// src/pages/UsersManagementPage.jsx

import React, { useState } from 'react';
import UserTable from '../components/UserTable';
import UserForm from '../components/UserForm'; // <-- IMPOR BARU

function UsersManagementPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Daftar Pengguna</h2>
        <button 
          onClick={() => setShowForm(true)} 
          style={{ padding: '10px 15px', backgroundColor: '#1abc9c', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Tambah Pengguna Baru
        </button>
      </div>
      
      {/* Tampilkan form jika state showForm true */}
      {showForm && (
        <div style={{ marginBottom: '30px' }}>
          <UserForm 
            onClose={() => setShowForm(false)} 
            onUserCreated={() => alert("Pengguna berhasil dibuat!")}
          />
          <hr style={{marginTop: '30px'}} />
        </div>
      )}
      
      <p>Kelola semua pengguna yang terdaftar di aplikasi.</p>
      <div className="table-wrapper">
        <UserTable />
      </div>
    </div>
  );
}

export default UsersManagementPage;