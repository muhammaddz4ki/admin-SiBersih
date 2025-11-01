// src/components/UserTable.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; // Impor db
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

// --- (FUNGSI formatDate DIHAPUS DARI SINI) ---
// Kita tidak membutuhkannya di file ini.

function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Efek ini akan berjalan saat komponen dimuat
  useEffect(() => {
    // 1. Buat query ke koleksi 'users', urutkan
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

    // 2. Dengarkan perubahan (real-time)
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData); // Simpan ke state
      setLoading(false);
    });

    // 3. Cleanup listener saat komponen ditutup
    return () => unsubscribe();
  }, []); // [] berarti jalankan sekali

  // --- Fungsi Aksi untuk Admin ---
  const handleChangeRole = async (id, newRole) => {
    // Jangan izinkan admin mengubah rolenya sendiri (berbahaya)
    // Atau jika role tidak berubah
    const user = users.find(u => u.id === id);
    if (user.role === 'Admin' || user.role === newRole) return; 
    
    if (window.confirm(`Yakin ingin mengubah role ${user.email} menjadi ${newRole}?`)) {
      const docRef = doc(db, 'users', id);
      try {
        await updateDoc(docRef, { role: newRole });
      } catch (e) {
        console.error('Error updating role: ', e);
      }
    }
  };

  const handleDelete = async (id) => {
    // Jangan izinkan admin menghapus dirinya sendiri
    const user = users.find(u => u.id === id);
    if (user.role === 'Admin') {
      alert("Tidak bisa menghapus akun Admin.");
      return;
    }

    if (window.confirm(`Yakin ingin menghapus pengguna ${user.email}? Ini hanya akan menghapus data Firestore.`)) {
      const docRef = doc(db, 'users', id);
      try {
        // PENTING: Ini hanya menghapus dokumen Firestore.
        // Pengguna masih ada di 'Authentication'.
        // Menghapus dari Auth butuh Admin SDK di backend (Cloud Function).
        // Tapi dengan menghapus ini, mereka tidak akan bisa login lagi.
        await deleteDoc(docRef);
      } catch (e) {
        console.error('Error deleting document: ', e);
      }
    }
  };
  // --- Akhir Fungsi Aksi ---

  if (loading) {
    return <p>Memuat data pengguna...</p>;
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      {/* Kita pakai CSS yang sama dari ReportTable */}
      <style>
        {`
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
          th { background-color: #f4f4f4; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .status-select { padding: 5px; }
          .action-button { margin-right: 5px; cursor: pointer; color: red; }
        `}
      </style>
      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th>Poin (Masyarakat)</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name || 'Tanpa Nama'}</td>
              <td>{user.email}</td>
              <td>
                <select
                  className="status-select"
                  value={user.role}
                  onChange={(e) => handleChangeRole(user.id, e.target.value)}
                  disabled={user.role === 'Admin'} // Nonaktifkan jika dia Admin
                >
                  <option value="Masyarakat">Masyarakat</option>
                  <option value="TPS">TPS</option>
                  <option value="Admin">Admin</option>
                </select>
              </td>
              <td>{user.role === 'Masyarakat' ? user.points : 'N/A'}</td>
              <td>
                <span
                  className="action-button"
                  onClick={() => handleDelete(user.id)}
                  style={{ color: user.role === 'Admin' ? '#ccc' : 'red' }} // Abu-abu jika Admin
                >
                  Hapus
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;