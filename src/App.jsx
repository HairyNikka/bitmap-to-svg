import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Register from './pages/Register';
import Login from './pages/Login';
import Home from './components/Home';
import Navbar from './components/Navbar';

import PasswordResetFlow from './pages/PasswordReset/PasswordResetFlow'; 

import AdminDashboard from './admin/pages/AdminDashboard';
import UserManagement from './admin/pages/UserManagement';
import ActivityLogs from './admin/pages/ActivityLogs';



function AppRoutes({ isAuthenticated, setIsAuthenticated, username, setUsername, handleLogout }) {
  const location = useLocation();
  
  const hideNavbar = [
    '/login', 
    '/register', 
    '/forgot-password',
    '/reset-password',
    '/admin', 
    '/admin/users', 
    '/admin/logs'
  ].includes(location.pathname);

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
      // คืนค่าเดิมเมื่อ component unmount
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
        {/* Route หน้าหลัก */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUsername={setUsername} />} />
        
        {/* Route หน้าลืมรหัสผ่าน */}
        <Route path="/forgot-password" element={<PasswordResetFlow />} />
        <Route path="/reset-password" element={<PasswordResetFlow />} />
        
        {/* Route สำหรับ Admin*/}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/logs" element={<ActivityLogs />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {

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
    
    // ลบทั้ง token เก่าและใหม่
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