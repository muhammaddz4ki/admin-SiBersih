// src/components/ScheduleForm.jsx

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig'; // Impor 'auth'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

function ScheduleForm({ onClose, onScheduleCreated }) {
  const [areaName, setAreaName] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [tpsList, setTpsList] = useState([]);
  const [selectedTps, setSelectedTps] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // State baru
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const adminId = auth.currentUser?.uid; // UID Admin yang sedang login

  // Ambil daftar TPS dan cek role Admin
  useEffect(() => {
    const fetchTpsAndCheckRole = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'TPS'));
      const snapshot = await getDocs(q);
      const tps = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name || doc.data().email }));
      setTpsList(tps);

      // Cek apakah user yang login adalah Admin (untuk tujuan membuat jadwal)
      const adminQ = query(collection(db, 'users'), where('uid', '==', adminId), where('role', '==', 'Admin'));
      const adminSnap = await getDocs(adminQ);
      
      if (adminSnap.docs.length > 0) {
          setIsAdmin(true);
      } else if (tps.length > 0) {
          setSelectedTps(tps[0].id); // Jika bukan admin, pilih TPS pertama
      }
    };
    fetchTpsAndCheckRole();
  }, [adminId]);


  const handleDayToggle = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (selectedDays.length === 0) {
      setError('Harap pilih minimal satu hari.');
      setLoading(false);
      return;
    }
    
    // Tentukan ID yang akan disimpan (TPS yang dipilih atau Admin)
    const finalTpsId = isAdmin ? adminId : selectedTps;
    
    if (!finalTpsId) {
        setError('TPS belum terpilih atau Admin ID tidak ditemukan.');
        setLoading(false);
        return;
    }

    try {
      await addDoc(collection(db, 'public_schedules'), {
        tpsId: finalTpsId, // Simpan ID Admin jika Admin yang membuat
        areaName: areaName,
        timeStart: timeStart,
        timeEnd: timeEnd,
        days: selectedDays,
        createdAt: new Date(),
        // Label baru untuk memudahkan audit
        createdByAdmin: isAdmin, 
      });

      onScheduleCreated();
      onClose();

    } catch (err) {
      setError('Gagal membuat jadwal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h3>Tambah Jadwal Umum</h3>
      <form onSubmit={handleSubmit}>
        
        {/* --- Pilihan TPS (Hanya muncul jika BUKAN Admin) --- */}
        {!isAdmin && (
          <>
            <label>Pilih TPS:</label>
            <select value={selectedTps} onChange={(e) => setSelectedTps(e.target.value)} style={{ padding: '8px', width: '100%', marginBottom: '10px' }}>
              {tpsList.map(tps => (
                <option key={tps.id} value={tps.id}>{tps.name}</option>
              ))}
            </select>
          </>
        )}
        
        {/* Pesan Konfirmasi Admin */}
        {isAdmin && (
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '5px' }}>
                <p style={{ margin: 0, color: 'darkgreen', fontWeight: 'bold' }}>Jadwal ini akan dibuat atas nama Admin SiBersih.</p>
            </div>
        )}
        
        <label>Nama Area/Wilayah:</label>
        <input type="text" value={areaName} onChange={(e) => setAreaName(e.target.value)} required style={{ padding: '8px', width: '100%', marginBottom: '10px' }} />
        
        <label>Hari Pengangkutan:</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
          {daysOfWeek.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayToggle(day)}
              style={{
                padding: '8px 12px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: selectedDays.includes(day) ? '#1abc9c' : '#f0f0f0',
                color: selectedDays.includes(day) ? 'white' : '#333',
                cursor: 'pointer',
              }}
            >
              {day}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label>Jam Mulai:</label>
            <input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} required style={{ padding: '8px', width: '100%' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Jam Selesai:</label>
            <input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} required style={{ padding: '8px', width: '100%' }} />
          </div>
        </div>
        
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose} style={{ backgroundColor: '#ccc', color: '#333' }} disabled={loading}>Batal</button>
          <button type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ScheduleForm;