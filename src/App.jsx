// src/App.jsx

import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate, 
  useLocation,
} from 'react-router-dom';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Halaman-halaman
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; 
import AdminLayout from './layout/AdminLayout'; 
import ReportsManagementPage from './pages/ReportsManagementPage';
import UsersManagementPage from './pages/UsersManagementPage';
import MarketplaceManagementPage from './pages/MarketplaceManagementPage';
import TransactionManagementPage from './pages/TransactionManagementPage';
import PublicScheduleManagementPage from './pages/PublicScheduleManagementPage';
import TpsTrackerPage from './pages/TpsTrackerPage'; // <-- IMPOR FINAL

// ------------------------------------------------------------------
// Komponen Pintu Masuk Utama (Gabungan)
const RootRouter = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().role === 'Admin') {
          setUser(currentUser);
          setIsAdmin(true);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); 

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Memuat sesi...</h2>
      </div>
    );
  }

  // --- KOMPONEN PROTEKSI (WRAPPER) ---
  const ProtectedAdminRoute = ({ children }) => {
    if (!isAdmin) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return (
        <AdminLayout user={user}>
            {children}
        </AdminLayout>
    );
  };
  
  // --- LOGIKA UTAMA ROUTING ---
  return (
    <Routes>
      
      {/* 1. Rute Publik (Landing Page) */}
      <Route path="/" element={<LandingPage />} />
      
      {/* 2. Rute Login Admin */}
      <Route
        path="/login"
        element={isAdmin ? <Navigate to="/dashboard" /> : <LoginPage />}
      />
      
      {/* 3. Rute Admin (Dilindungi) */}
      
      {/* Rute Default Admin: /dashboard */}
      <Route path="/dashboard" element={<ProtectedAdminRoute><DashboardPage /></ProtectedAdminRoute>} /> 
      
      {/* /reports */}
      <Route path="/reports" element={<ProtectedAdminRoute><ReportsManagementPage /></ProtectedAdminRoute>} />
      
      {/* /users */}
      <Route path="/users" element={<ProtectedAdminRoute><UsersManagementPage /></ProtectedAdminRoute>} />
      
      {/* /marketplace */}
      <Route path="/marketplace" element={<ProtectedAdminRoute><MarketplaceManagementPage /></ProtectedAdminRoute>} />

      {/* /transactions */}
      <Route path="/transactions" element={<ProtectedAdminRoute><TransactionManagementPage /></ProtectedAdminRoute>} />
      
      {/* /schedules */}
      <Route path="/schedules" element={<ProtectedAdminRoute><PublicScheduleManagementPage /></ProtectedAdminRoute>} />

      {/* --- (RUTE PELACAK TPS FINAL) --- */}
      <Route path="/tps-tracker" element={<ProtectedAdminRoute><TpsTrackerPage /></ProtectedAdminRoute>} />

      {/* Rute Catch-all Publik (404) */}
      <Route path="*" element={<h1 style={{textAlign: 'center', marginTop: '100px'}}>404 - Halaman Tidak Ditemukan</h1>} />
    </Routes>
  );
};

// ------------------------------------------------------------------
// Komponen Utama
function App() {
  return (
    <BrowserRouter>
      <RootRouter />
    </BrowserRouter>
  );
}

export default App;