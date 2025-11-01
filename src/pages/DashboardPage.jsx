// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import DashboardCard from '../components/DashboardCard'; 
import DashboardChart from '../components/DashboardChart'; 
import { FaRecycle, FaChartLine, FaTrashAlt } from 'react-icons/fa';

function DashboardPage() {
  const [metrics, setMetrics] = useState({
    totalTps: 0,
    totalReports: 0,
    totalPoints: 0,
    activeListings: 0,
  });
  const [chartData, setChartData] = useState({}); 
  const [loading, setLoading] = useState(true);

  // Warna tema (diperlukan untuk kartu)
  const primary = '#78C33E';
  const secondary = '#1DAE9D';
  const errorColor = '#e74c3c';
  
  const getMonths = () => {
      const months = [];
      const date = new Date();
      for (let i = 0; i < 6; i++) {
          months.push(date.toLocaleString('id-ID', { month: 'short' }));
          date.setMonth(date.getMonth() - 1);
      }
      return months.reverse();
  };

  useEffect(() => {
    let unsubscribeUsers, unsubscribeReports, unsubscribeMarketplace;
    const months = getMonths();

    // --- Ambil Data Metrik (Tidak Berubah) ---
    const fetchMetrics = async () => {
        const usersSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'Masyarakat')));
        let totalPoints = 0;
        usersSnapshot.forEach(doc => {
            totalPoints += doc.data().points || 0;
        });

        const tpsQuery = query(collection(db, 'users'), where('role', '==', 'TPS'));
        unsubscribeUsers = onSnapshot(tpsQuery, (snapshot) => {
            setMetrics(prev => ({ ...prev, totalTps: snapshot.size, totalPoints }));
        });

        const reportQuery = query(collection(db, 'reports'), where('status', '!=', 'Completed'));
        unsubscribeReports = onSnapshot(reportQuery, (snapshot) => {
             setMetrics(prev => ({ ...prev, totalReports: snapshot.size }));
        });
        
        const marketQuery = query(collection(db, 'marketplace_listings'), where('status', '==', 'Available'));
        unsubscribeMarketplace = onSnapshot(marketQuery, (snapshot) => {
             setMetrics(prev => ({ ...prev, activeListings: snapshot.size }));
             setLoading(false);
        });
    };
    
    // --- Ambil Data Transaksi (Untuk Grafik) ---
    const fetchChartData = async () => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const emergencyQuery = query(
            collection(db, 'emergency_requests'),
            where('createdAt', '>=', sixMonthsAgo)
        );
        const reportsQuery = query(
            collection(db, 'reports'),
            where('createdAt', '>=', sixMonthsAgo)
        );
        
        const [emergencySnap, reportsSnap] = await Promise.all([
            getDocs(emergencyQuery),
            getDocs(reportsQuery)
        ]);

        const monthlyReports = Array.from({ length: 6 }, () => 0); 
        const monthlyEmergencies = Array.from({ length: 6 }, () => 0);

        const currentMonth = new Date().getMonth();
        
        const processSnapshot = (snapshot, targetArray) => {
            snapshot.forEach(doc => {
                const docDate = doc.data().createdAt.toDate();
                const docMonth = docDate.getMonth();
                
                const monthDiff = (currentMonth - docMonth + 12) % 12; 
                if (monthDiff < 6) {
                    targetArray[5 - monthDiff]++; 
                }
            });
        };
        
        processSnapshot(emergencySnap, monthlyEmergencies);
        processSnapshot(reportsSnap, monthlyReports);
        
        // --- SET DATA CHART ---
        // (Warna dan fill sekarang diatur di DashboardChart.jsx)
        setChartData({
             labels: months,
             datasets: [
                 {
                     label: 'Laporan Sampah',
                     data: monthlyReports,
                 },
                 {
                     label: 'Permintaan Emergensi',
                     data: monthlyEmergencies,
                 },
             ],
        });
    };


    fetchMetrics();
    fetchChartData();

    return () => {
        if (unsubscribeUsers) unsubscribeUsers();
        if (unsubscribeReports) unsubscribeReports();
        if (unsubscribeMarketplace) unsubscribeMarketplace();
    };
  }, []); 

  // Data Dummy (untuk Bar Chart)
  const barData = {
    labels: ['Plastik', 'Kertas', 'Logam', 'Kaca', 'Lainnya'],
    datasets: [
      {
        label: 'Setoran Bank Sampah (Kg)',
        data: [30, 25, 18, 10, 5], 
        backgroundColor: primary,
      },
    ],
  };

  if (loading) {
    return <p>Memuat Analitik...</p>;
  }

  return (
    <div>
      <h2 style={{fontSize: '1.5rem', marginBottom: '5px'}}>Analitik Operasional SiBersih</h2>
      <p style={{marginBottom: '20px', color: '#666'}}>Ringkasan metrik utama aplikasi.</p>
      
      {/* Row Kartu Metrik */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
        <DashboardCard 
          title="Total Pengguna TPS" 
          value={metrics.totalTps} 
          icon={<FaRecycle />}
          iconColor={secondary}
          bgColor={secondary + '88'}
        />
        <DashboardCard 
          title="Laporan Aktif" 
          value={metrics.totalReports} 
          icon={<FaTrashAlt />}
          iconColor={errorColor}
          bgColor={errorColor + '88'}
        />
        <DashboardCard 
          title="Poin Diberikan (Global)" 
          value={new Intl.NumberFormat('id-ID').format(metrics.totalPoints)} 
          icon={<FaChartLine />}
          iconColor={primary}
          bgColor={primary + '88'}
        />
        <DashboardCard 
          title="Marketplace Aktif" 
          value={metrics.activeListings} 
          icon={<FaChartLine />}
          iconColor={'#333'}
          bgColor={'#ddd'}
        />
      </div>

      {/* Row Grafik (DIUBAH UNTUK BERDAMPINGAN) */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Grafik Kiri: Line Chart */}
        <div style={{ flex: '1 1 45%', minWidth: '400px' }}>
            <DashboardChart 
                type="line" 
                title="Tren Laporan dan Emergensi (6 Bulan Terakhir)" 
                chartData={chartData} 
            />
        </div>
        
        {/* Grafik Kanan: Bar Chart */}
        <div style={{ flex: '1 1 45%', minWidth: '400px' }}>
            <DashboardChart 
                type="bar" 
                title="Permintaan Jemput Berdasarkan Tipe Sampah (Contoh)" 
                chartData={barData} 
            />
        </div>
        
      </div>
    </div>
  );
}

export default DashboardPage;