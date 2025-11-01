// src/components/DashboardChart.jsx

import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler 
} from 'chart.js';

// Wajib: Daftarkan elemen yang dibutuhkan Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- (PERBAIKAN: Definisikan warna di sini agar terjangkau) ---
// Nilai Hex warna tema
const SECONDARY_COLOR = '#1DAE9D';
const ERROR_COLOR = '#E74C3C';
// --- (AKHIR PERBAIKAN) ---

function DashboardChart({ type, title, chartData }) {
  // Kita pastikan data ada dan memiliki datasets sebelum mencoba mapping
  const assignedChartData = type === 'line' && chartData?.datasets ? {
      ...chartData,
      datasets: chartData.datasets.map((dataset, index) => ({
          ...dataset,
          // Dataset 0 (Laporan) ke 'y' (SECONDARY_COLOR)
          // Dataset 1 (Emergensi) ke 'y1' (ERROR_COLOR)
          yAxisID: index === 0 ? 'y' : 'y1',
          borderColor: index === 0 ? SECONDARY_COLOR : ERROR_COLOR,
          backgroundColor: index === 0 ? SECONDARY_COLOR + '33' : ERROR_COLOR + '33',
          fill: true, // Pastikan fill true
          tension: 0.4, // Tambahkan tension agar garis melengkung
      }))
  } : chartData;

  const options = {
    responsive: true,
    animation: false, 
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
    },
    maintainAspectRatio: false, 
    scales: {
        x: {
            grid: {
                display: false,
            }
        },
        // Y-Axis KIRI (Laporan Sampah)
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Laporan Sampah'
            },
             grid: {
                borderDash: [5, 5],
            }
        },
        // Y-Axis KANAN (Permintaan Emergensi)
        y1: {
            type: 'linear',
            display: true,
            position: 'right', // Posisikan di kanan
            title: {
              display: true,
              text: 'Permintaan Emergensi'
            },
            grid: {
                display: false, 
            }
        }
    }
  };

  return (
    <div style={{ 
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
      width: '100%',
      height: '350px',
      marginBottom: '30px'
    }}>
      {type === 'line' 
          ? <Line data={assignedChartData} options={options} /> 
          : <Bar data={chartData} options={options} />
      }
    </div>
  );
}

export default DashboardChart;