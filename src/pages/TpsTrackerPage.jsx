// src/pages/TpsTrackerPage.jsx

import React from 'react';
import TpsTrackerMap from '../components/TpsTrackerMap';

function TpsTrackerPage() {
  return (
    <div>
      <h2>Lokasi TPS Terdaftar</h2>
      <p>Peta ini menampilkan lokasi statis TPS yang telah diatur oleh petugas di aplikasi mobile.</p>
      
      {/* Kita gunakan KEY unik untuk memaksa React untuk 
        membuat ulang (remount) komponen peta setiap kali halaman ini dimuat.
        Ini mengatasi bug inisialisasi pada React-Leaflet.
      */}
      <div className="table-wrapper" style={{ padding: '0' }}>
        <TpsTrackerMap key="tps-map-render-key" /> 
      </div>
    </div>
  );
}

export default TpsTrackerPage;