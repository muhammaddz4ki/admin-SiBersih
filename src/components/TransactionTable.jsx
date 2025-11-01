// src/components/TransactionTable.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, orderBy, query, limit, where } from 'firebase/firestore';

// Helper untuk format tanggal
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  // Pastikan itu adalah objek Timestamp sebelum memanggil toDate()
  if (timestamp.toDate) {
    return new Date(timestamp.seconds * 1000).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  return 'N/A';
};

// Helper untuk format uang/poin
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

function TransactionTable() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchedTransactions = [];
    const transactionLimit = 100; // Batasi transaksi terbaru

    // 1. Ambil data Emergency Requests (Hanya yang Selesai/On Progress)
    const emergencyQuery = query(
      collection(db, 'emergency_requests'),
      where('status', 'in', ['Completed', 'On Progress']),
      orderBy('createdAt', 'desc'),
      limit(transactionLimit)
    );

    const unsubscribeEmergency = onSnapshot(emergencyQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = { id: change.doc.id, ...change.doc.data(), type: 'Emergensi' };
        
        // Find and replace or add
        const existingIndex = fetchedTransactions.findIndex(t => t.id === data.id);
        if (existingIndex !== -1) {
            fetchedTransactions[existingIndex] = data;
        } else if (change.type === 'added') {
             fetchedTransactions.push(data);
        }
      });
      // Panggil updateState untuk memicu render
      updateState(); 
    }, (error) => console.error("Error fetching emergency requests:", error));


    // 2. Ambil data Waste Deposits (Bank Sampah)
    const depositQuery = query(
      collection(db, 'waste_deposits'),
      where('status', 'in', ['Completed', 'Pending']),
      orderBy('createdAt', 'desc'),
      limit(transactionLimit)
    );

    const unsubscribeDeposit = onSnapshot(depositQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = { id: change.doc.id, ...change.doc.data(), type: 'Bank Sampah' };
        
        // Find and replace or add
        const existingIndex = fetchedTransactions.findIndex(t => t.id === data.id);
        if (existingIndex !== -1) {
            fetchedTransactions[existingIndex] = data;
        } else if (change.type === 'added') {
            fetchedTransactions.push(data);
        }
      });
      // Panggil updateState untuk memicu render
      updateState(); 
    }, (error) => console.error("Error fetching deposit requests:", error));
    
    // Fungsi untuk memperbarui state dan mengurutkan
    const updateState = () => {
        // Urutkan ulang berdasarkan waktu (terbaru di atas)
        fetchedTransactions.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });

        // Hapus duplikat dan set state
        setTransactions([...fetchedTransactions]);
        setLoading(false);
    };

    // Cleanup listeners
    return () => {
      unsubscribeEmergency();
      unsubscribeDeposit();
    };
  }, []); 

  if (loading) {
    return <p>Memuat data transaksi global...</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Tipe Transaksi</th>
            <th>Deskripsi</th>
            <th>Pelapor/Penjual</th>
            <th>Nilai (Rp/Poin)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((trans) => (
            <tr key={trans.id}>
              <td>{formatDate(trans.createdAt)}</td>
              <td>
                <span style={{ 
                    fontWeight: 'bold', 
                    color: trans.type === 'Emergensi' ? '#e74c3c' : '#1abc9c' 
                }}>
                    {trans.type}
                </span>
              </td>
              <td>
                {trans.type === 'Emergensi' 
                    ? trans.description || 'Jemput Darurat'
                    : trans.wasteType || 'Setoran Sampah'}
              </td>
              <td>{trans.requesterEmail || trans.requesterUid}</td>
              <td>
                {trans.type === 'Emergensi'
                    ? formatCurrency(trans.fee || 0)
                    : `${trans.pointsAwarded || 'Menunggu'} Poin`}
              </td>
              <td>
                <span style={{ color: trans.status === 'Completed' ? 'green' : (trans.status === 'Pending' ? 'orange' : 'blue') }}>
                    {trans.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;