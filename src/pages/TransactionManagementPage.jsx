// src/pages/TransactionManagementPage.jsx

import React from 'react';
import TransactionTable from '../components/TransactionTable';

function TransactionManagementPage() {
  return (
    <div>
      <h2>Manajemen Transaksi Global</h2>
      <p>Audit semua permintaan darurat dan setoran bank sampah di seluruh aplikasi.</p>
      <TransactionTable />
    </div>
  );
}

export default TransactionManagementPage;