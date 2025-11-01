// src/components/MarketplaceTable.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; // Impor db
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  deleteDoc,
  updateDoc, // Kita juga impor updateDoc
} from 'firebase/firestore';

// Helper untuk format tanggal
const formatDate = (timestamp) => {
  if (!timestamp) return '...';
  return new Date(timestamp.seconds * 1000).toLocaleString('id-ID');
};

function MarketplaceTable() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Efek ini akan berjalan saat komponen dimuat
  useEffect(() => {
    // 1. Buat query ke koleksi 'marketplace_listings'
    const q = query(
      collection(db, 'marketplace_listings'),
      orderBy('createdAt', 'desc')
    );

    // 2. Dengarkan perubahan (real-time)
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const listingsData = [];
      querySnapshot.forEach((doc) => {
        listingsData.push({ id: doc.id, ...doc.data() });
      });
      setListings(listingsData); // Simpan ke state
      setLoading(false);
    });

    // 3. Cleanup listener saat komponen ditutup
    return () => unsubscribe();
  }, []); // [] berarti jalankan sekali

  // --- Fungsi Aksi untuk Admin ---
  const handleChangeStatus = async (id, newStatus) => {
    // Admin bisa paksa ubah status
    const docRef = doc(db, 'marketplace_listings', id);
    try {
      await updateDoc(docRef, { status: newStatus });
    } catch (e) {
      console.error('Error updating status: ', e);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus postingan marketplace ini secara permanen?')) {
      const docRef = doc(db, 'marketplace_listings', id);
      try {
        await deleteDoc(docRef);
      } catch (e) {
        console.error('Error deleting document: ', e);
      }
    }
  };
  // --- Akhir Fungsi Aksi ---

  if (loading) {
    return <p>Memuat data marketplace...</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Tanggal Posting</th>
            <th>Penjual (Email)</th>
            <th>Judul Barang</th>
            <th>Harga (Rp)</th>
            <th>Status</th>
            <th>Foto</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((item) => (
            <tr key={item.id}>
              <td>{formatDate(item.createdAt)}</td>
              <td>{item.sellerEmail}</td>
              <td>{item.title}</td>
              <td>{item.price}</td>
              <td>
                {/* Admin bisa ganti statusnya */}
                <select
                  className="status-select"
                  value={item.status}
                  onChange={(e) => handleChangeStatus(item.id, e.target.value)}
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                </select>
              </td>
              <td>
                <a
                  href={item.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="image-link"
                >
                  Lihat Foto
                </a>
              </td>
              <td>
                <span
                  className="action-button"
                  onClick={() => handleDelete(item.id)}
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

export default MarketplaceTable;