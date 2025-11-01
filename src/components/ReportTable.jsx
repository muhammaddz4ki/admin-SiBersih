// src/components/ReportTable.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, orderBy, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Helper untuk format tanggal
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  if (timestamp.toDate) {
    return new Date(timestamp.seconds * 1000).toLocaleString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }
  return 'N/A';
};

// --- (KOMPONEN INI SEKARANG HANYA UNTUK TAMPILAN) ---
function ReportTable({ reports, onStatusChange, onDelete }) {
  if (reports.length === 0) {
    return <p>Tidak ada laporan.</p>;
  }

  // Tampilan tabel (CSS sederhana)
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Pelapor</th>
            <th>Judul Laporan</th>
            <th>Status</th>
            <th>Bukti Foto</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{formatDate(report.createdAt)}</td>
              <td>{report.reporterEmail || report.reporterUid}</td>
              <td>{report.title}</td>
              <td>
                <select
                  className="status-select"
                  value={report.status}
                  onChange={(e) => onStatusChange(report.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="On Progress">On Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </td>
              <td>
                <a href={report.imageUrl} target="_blank" rel="noopener noreferrer" className="image-link">
                  Lihat Foto
                </a>
              </td>
              <td>
                <span className="action-button" onClick={() => onDelete(report.id)}>
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
// --- (LOGIKA DATA PINDAH KE HALAMAN INDUK) ---

// --- (KOMPONEN WRAPPER YANG MENGAMBIL DATA) ---
function ReportTableWrapper() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Logika Aksi Admin ---
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
    <>
      {/* Tombol Export HANYA AKAN TAMPIL DI HALAMAN INDUK */}
      <ReportTable 
        reports={reports} 
        onStatusChange={onStatusChange} 
        onDelete={onDelete}
      />
    </>
  );
}

export default ReportTableWrapper;