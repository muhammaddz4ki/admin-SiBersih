// src/components/PublicScheduleTable.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, orderBy, query, doc, deleteDoc } from 'firebase/firestore';

// Helper untuk format tanggal
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  if (timestamp.toDate) {
    return new Date(timestamp.seconds * 1000).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  return 'N/A';
};

function PublicScheduleTable() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Query: Ambil SEMUA Jadwal Umum
    const q = query(
      collection(db, 'public_schedules'),
      orderBy('createdAt', 'desc')
    );

    // 2. Dengarkan perubahan (real-time)
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const schedulesData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Gabungkan array 'days' menjadi string
        const daysString = Array.isArray(data.days) ? data.days.join(', ') : data.days || 'Tidak terulang';
        schedulesData.push({ id: doc.id, ...data, daysString });
      });
      setSchedules(schedulesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus jadwal pengangkutan ini?')) {
      const docRef = doc(db, 'public_schedules', id);
      try {
        await deleteDoc(docRef);
      } catch (e) {
        console.error('Error deleting document: ', e);
      }
    }
  };

  if (loading) {
    return <p>Memuat data jadwal...</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Tanggal Dibuat</th>
            <th>Area Layanan</th>
            <th>Hari Pengangkutan</th>
            <th>Jam Operasi</th>
            <th>Dibuat Oleh (TPS ID)</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>{formatDate(schedule.createdAt)}</td>
              <td>{schedule.areaName}</td>
              <td>
                <span style={{ fontWeight: 'bold', color: schedule.days.length > 5 ? 'red' : 'darkgreen' }}>
                    {schedule.daysString}
                </span>
              </td>
              <td>{schedule.timeStart} - {schedule.timeEnd}</td>
              <td>{schedule.tpsId}</td>
              <td>
                <span className="action-button" onClick={() => handleDelete(schedule.id)}>
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

export default PublicScheduleTable;