import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Register from './pages/Register';
import Login from './pages/Login';
import Home from './components/Home';
import Navbar from './components/Navbar';

// 🔐 เพิ่ม Security Reset Components
import ForgotPassword from './pages/ForgotPassword';
import SecurityQuestions from './pages/SecurityQuestions';
import ResetPassword from './pages/ResetPassword';
import PasswordResetFlow from './pages/PasswordResetFlow'; // Wrapper component

// 🔧 เพิ่ม Admin Components
import AdminDashboard from './admin/pages/AdminDashboard';
import UserManagement from './admin/pages/UserManagement';
import ActivityLogs from './admin/pages/ActivityLogs';

// 🔒 Protected Route Component สำหรับ Admin
function ProtectedAdminRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('accessToken');

    if (!userData || !token) {
      setIsAuthorized(false);
      return;
    }

    try {
      const user = JSON.parse(userData);
      // ตรวจสอบว่าเป็น admin หรือ superuser
      if (user.user_type === 'admin' || user.user_type === 'superuser') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      setIsAuthorized(false);
    }
  }, []);

  // กำลังตรวจสอบสิทธิ์
  if (isAuthorized === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: '#ffffff'
      }}>
        <div>กำลังตรวจสอบสิทธิ์...</div>
      </div>
    );
  }

  // ไม่มีสิทธิ์
  if (!isAuthorized) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#ff6b6b', marginBottom: '16px' }}>
          🚫 ไม่มีสิทธิ์เข้าถึง
        </h2>
        <p style={{ color: '#a0a0a0', marginBottom: '24px' }}>
          คุณต้องเป็น Admin หรือ Superuser เท่านั้น
        </p>
        <a 
          href="/" 
          style={{
            backgroundColor: '#007bff',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none'
          }}
        >
          กลับหน้าหลัก
        </a>
      </div>
    );
  }

  return children;
}

function AppRoutes({ isAuthenticated, setIsAuthenticated, username, setUsername, handleLogout }) {
  const location = useLocation();
  
  // 🔧 เพิ่ม security reset routes ใน hideNavbar
  const hideNavbar = [
    '/login', 
    '/register', 
    '/forgot-password',
    '/reset-password',
    '/admin', 
    '/admin/users', 
    '/admin/logs'
  ].includes(location.pathname);

  // 🎨 Reset body styles สำหรับหน้าที่ไม่ต้องการ flex centering
  React.useEffect(() => {
    const needsFlexReset = [
      '/login', 
      '/register', 
      '/forgot-password',
      '/reset-password',
      '/admin', 
      '/admin/users', 
      '/admin/logs'
    ].includes(location.pathname);
    
    if (needsFlexReset) {
      // Reset body styles
      document.body.style.display = 'block';
      document.body.style.placeItems = 'unset';
    } else {
      // Restore original styles สำหรับหน้าหลัก
      document.body.style.display = 'flex';
      document.body.style.placeItems = 'center';
    }

    // Cleanup function
    return () => {
      // คืนค่าเดิมเมื่อ component unmount (optional)
    };
  }, [location.pathname]);

  return (
    <>
      {!hideNavbar && (
        <Navbar
          isAuthenticated={isAuthenticated}
          username={username}
          onLogout={handleLogout}
        />
      )}

      <Routes>
        {/* Routes เดิม */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUsername={setUsername} />} />
        
        {/* 🔐 Security Reset Routes */}
        <Route path="/forgot-password" element={<PasswordResetFlow />} />
        <Route path="/reset-password" element={<PasswordResetFlow />} />
        
        {/* 🔧 Admin Routes */}
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } />

        <Route path="/admin/users" element={
          <ProtectedAdminRoute>
            <UserManagement />
          </ProtectedAdminRoute>
        } />

        <Route path="/admin/logs" element={
          <ProtectedAdminRoute>
            <ActivityLogs />
          </ProtectedAdminRoute>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // 🔧 ปรับให้เช็คทั้ง token เก่าและใหม่
    const oldToken = localStorage.getItem('token');
    const newToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('username');
    const userData = localStorage.getItem('userData');

    // ถ้ามี JWT token ใหม่ ให้ใช้แทน
    if (newToken && userData) {
      try {
        const user = JSON.parse(userData);
        setIsAuthenticated(true);
        setUsername(user.username);
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    } 
    // fallback ไปใช้ token เก่า
    else if (oldToken && storedUser) {
      setIsAuthenticated(true);
      setUsername(storedUser);
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    
    // 🔧 ลบทั้ง token เก่าและใหม่
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  };

  return (
    <Router>
      <AppRoutes
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        username={username}
        setUsername={setUsername}
        handleLogout={handleLogout}
      />
    </Router>
  );
}