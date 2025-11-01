// src/pages/PublicScheduleManagementPage.jsx

import React, { useState } from 'react';
import PublicScheduleTable from '../components/PublicScheduleTable';
import ScheduleForm from '../components/ScheduleForm'; // <-- IMPOR BARU

function PublicScheduleManagementPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Manajemen Jadwal Pengangkutan Umum</h2>
        <button 
          onClick={() => setShowForm(true)} 
          style={{ padding: '10px 15px', backgroundColor: '#1abc9c', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Tambah Jadwal Baru
        </button>
      </div>
      
      {/* Tampilkan form jika state showForm true */}
      {showForm && (
        <div style={{ marginBottom: '30px' }}>
          <ScheduleForm 
            onClose={() => setShowForm(false)} 
            onScheduleCreated={() => alert("Jadwal berhasil dibuat!")}
          />
          <hr style={{marginTop: '30px'}} />
        </div>
      )}

      <p>Audit jadwal rutin yang diatur oleh semua TPS.</p>
      <PublicScheduleTable />
    </div>
  );
}

export default PublicScheduleManagementPage;