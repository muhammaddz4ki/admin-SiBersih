// src/pages/ReportsManagementPage.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; // Import db
import { collection, onSnapshot, orderBy, query, doc, updateDoc, deleteDoc } from 'firebase/firestore'; // Firestore actions
import ReportTable from '../components/ReportTable';
import ExportButton from '../components/ExportButton'; // <-- IMPOR BARU

function ReportsManagementPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Logika Aksi Admin (Diulang di sini untuk kepraktisan) ---
  const onStatusChange = async (id, newStatus) => {
    const docRef = doc(db, 'reports', id);
    await updateDoc(docRef, { status: newStatus });
  };

  const onDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus laporan ini secara permanen?')) {
      const docRef = doc(db, 'reports', id);
      await deleteDoc(docRef);
    }
  };
  // --- Akhir Logika Aksi ---

  // Ambil Data Laporan
  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reportsData = [];
      querySnapshot.forEach((doc) => {
        reportsData.push({ id: doc.id, ...doc.data() });
      });
      setReports(reportsData); 
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>Memuat data laporan...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Daftar Laporan Masuk</h2>
        <ExportButton data={reports} fileName="Laporan_SiBersih" />
      </div>
      
      <p>Kelola semua laporan yang dikirim oleh pengguna.</p>
      <div className="table-wrapper">
        <ReportTable 
            reports={reports} 
            onStatusChange={onStatusChange} 
            onDelete={onDelete}
        />
      </div>
    </div>
  );
}

export default ReportsManagementPage;