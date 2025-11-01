// src/components/DashboardCard.jsx

import React from 'react';

function DashboardCard({ title, value, icon, iconColor, bgColor }) {
  const iconStyle = {
    color: iconColor || '#3498db',
    fontSize: '2.5rem',
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
      flex: '1 1 200px', 
      minWidth: '200px',
      textAlign: 'left', 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '140px' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#666', lineHeight: '1.2' }}>{title}</h3>
        {icon && <div style={iconStyle}>{icon}</div>}
      </div>
      <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0 0' }}>{value}</h2>
      {/* Placeholder for progress bar or details */}
      <div style={{ height: '5px', backgroundColor: bgColor || '#ddd', borderRadius: '2px', width: '100%', marginTop: 'auto' }}></div>
    </div>
  );
}

export default DashboardCard;