// src/components/Sidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        {/* --- (PERUBAHAN UTAMA DI SINI) --- */}
        <img 
          src="/LOGO SiBersih.png" 
          alt="SiBersih Logo" 
        />
        {/* --- (AKHIR PERUBAHAN) --- */}
      </div>
      <nav>
        <ul>
          <li>
            <NavLink to="/dashboard" end>Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/reports">Daftar Laporan</NavLink>
          </li>
          <li>
            <NavLink to="/users">Daftar Pengguna</NavLink>
          </li>
          <li>
            <NavLink to="/marketplace">Marketplace</NavLink>
          </li>
          <li>
            <NavLink to="/transactions">Transaksi Global</NavLink>
          </li>
          <li>
            <NavLink to="/schedules">Jadwal Umum</NavLink>
          </li>
          <li>
            <NavLink to="/tps-tracker">Pelacak TPS</NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;