// src/components/ExportButton.jsx

import React from 'react';

/**
 * Mengubah array of objects menjadi string CSV yang siap diunduh.
 * @param {Array<Object>} data - Data yang akan diexport.
 * @param {string} fileName - Nama file (tanpa ekstensi).
 */
function ExportButton({ data, fileName }) {
  
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';

    // 1. Ambil semua header (kunci/key) dari objek pertama
    const headers = Object.keys(data[0]);

    // 2. Format baris header (dipisahkan koma)
    const csvHeader = headers.join(',');

    // 3. Format baris data
    const csvBody = data.map(row => {
      // Untuk setiap baris, ambil nilai yang sesuai dengan urutan header
      return headers.map(header => {
        // Ambil nilai, ubah null/undefined menjadi string kosong,
        // dan bungkus dengan tanda kutip untuk menangani koma atau newline.
        const value = row[header] ?? '';
        
        // Handle Timestamp dari Firestore (kita tampilkan tanggalnya)
        if (value && value.toDate) {
            return `"${value.toDate().toLocaleString('id-ID')}"`;
        }
        
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    }).join('\n'); // Pisahkan baris dengan newline

    return `${csvHeader}\n${csvBody}`;
  };

  const handleExport = () => {
    const csv = convertToCSV(data);
    
    // 1. Buat Blob (Binary Large Object) dari string CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    
    // 2. Buat URL objek sementara
    const url = URL.createObjectURL(blob);
    
    // 3. Buat link download tersembunyi dan klik
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      // Style ini bisa disesuaikan di index.css
      style={{
        padding: '10px 15px', 
        backgroundColor: '#1DAE9D', // Warna Sekunder (Aksen)
        color: 'white', 
        border: 'none', 
        borderRadius: '5px'
      }}
      disabled={data.length === 0}
    >
      Export {fileName} ({data.length})
    </button>
  );
}

export default ExportButton;