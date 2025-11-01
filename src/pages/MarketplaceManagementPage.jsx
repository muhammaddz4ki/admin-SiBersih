// src/pages/MarketplaceManagementPage.jsx

import React from 'react';
import MarketplaceTable from '../components/MarketplaceTable';

function MarketplaceManagementPage() {
  return (
    <div>
      <h2>Manajemen Marketplace</h2>
      <p>Kelola semua barang yang dijual oleh pengguna di marketplace.</p>
      
      {/* Bungkus dengan table-wrapper untuk style */}
      <div className="table-wrapper">
        <MarketplaceTable />
      </div>
    </div>
  );
}

export default MarketplaceManagementPage;