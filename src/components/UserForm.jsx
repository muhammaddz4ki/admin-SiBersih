// src/components/UserForm.jsx

import React, { useState } from 'react';
import { db } from '../firebaseConfig'; 
import { doc, setDoc } from 'firebase/firestore';
// Hapus: import { v4 as uuidv4 } from 'uuid'; 

function UserForm({ onClose, onUserCreated }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Masyarakat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = ['Masyarakat', 'TPS', 'Admin'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Kita buat ID dokumen secara lokal (Simulasi pendaftaran)
    // Gunakan kombinasi email unik dan timestamp
    const uniqueId = email.toLowerCase().replace(/[^a-z0-9]/g, ''); 
    const docId = `${uniqueId}_${Date.now()}`; 

    try {
      // 1. Cek apakah email sudah terdaftar di Firestore
      const userQuery = await db.collection('users').where('email', '==', email).get();
      if (!userQuery.empty) {
         throw new Error("Email sudah ada di database!");
      }

      // 2. Simpan data tambahan ke Firestore
      await setDoc(doc(db, 'users', docId), {
        uid: docId, 
        email: email,
        name: name,
        role: role,
        createdAt: new Date(),
        points: 0, 
        photoUrl: null,
      });

      onUserCreated(); // Panggil callback sukses
      onClose();      // Tutup form

    } catch (err) {
      setError('Gagal membuat pengguna: ' + (err.message || 'Error tidak diketahui'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h3>Tambah Pengguna Baru (Manual)</h3>
      <p style={{ color: 'red', fontSize: 'small' }}>*Akun harus dibuat di Firebase Auth Console, lalu dokumen Firestore-nya ditambahkan di sini.</p>
      <form onSubmit={handleSubmit}>
        
        <label>Nama:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '8px', width: '100%', marginBottom: '10px' }} />
        
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '8px', width: '100%', marginBottom: '10px' }} />
        
        {/* Field Password dihapus karena Admin tidak boleh menggunakan Auth client */}
        
        <label>Role:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '8px', width: '100%', marginBottom: '20px' }}>
          {roles.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose} style={{ backgroundColor: '#ccc', color: '#333' }} disabled={loading}>Batal</button>
          <button type="submit" disabled={loading}>
            {loading ? 'Membuat...' : 'Buat Dokumen User'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserForm;