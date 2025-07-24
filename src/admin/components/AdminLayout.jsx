// src/admin/components/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminLayout({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    // ตรวจสอบ token ทั้งแบบเก่าและใหม่
    const accessToken = localStorage.getItem('accessToken');
    const oldToken = localStorage.getItem('token');
    const token = accessToken || oldToken;
    
    const storedUserData = localStorage.getItem('userData');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // ดึงข้อมูล user ล่าสุด
      const response = await axios.get('http://localhost:8000/api/accounts/user/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user = response.data;
      
      // ตรวจสอบสิทธิ์ admin
      if (user.user_type !== 'admin' && user.user_type !== 'superuser') {
        alert('คุณไม่มีสิทธิ์เข้าถึงระบบจัดการ');
        navigate('/');
        return;
      }

      setUserData(user);
      localStorage.setItem('userData', JSON.stringify(user));
      
      // ถ้าใช้ token เก่า ให้อัพเดทเป็นใหม่
      if (oldToken && !accessToken) {
        localStorage.setItem('accessToken', oldToken);
      }
      
    } catch (error) {
      console.error('Admin access check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // ตรวจสอบ token ทั้งแบบเก่าและใหม่
    const accessToken = localStorage.getItem('accessToken');
    const oldToken = localStorage.getItem('token');
    const token = accessToken || oldToken;
    
    if (token) {
      try {
        await axios.post('http://localhost:8000/api/accounts/token/logout/', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Logout API failed:', error);
      }
    }

    // ลบทั้ง token เก่าและใหม่
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('token');  // ลบ token เก่าด้วย
    localStorage.removeItem('username'); // ลบ username เก่าด้วย
    
    navigate('/login');
  };

  // ย้าย styles ขึ้นมาก่อน return statements
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#ffffff'
    },
    header: {
      backgroundColor: '#2a2a2a',
      padding: '0 20px',
      borderBottom: '1px solid #3a3a3a',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    },
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '60px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '18px',
      fontWeight: '600',
      color: '#ffffff'
    },
    navigation: {
      display: 'flex',
      gap: '20px',
      alignItems: 'center'
    },
    navLink: {
      padding: '8px 16px',
      borderRadius: '6px',
      textDecoration: 'none',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      color: '#a0a0a0'
    },
    navLinkActive: {
      backgroundColor: '#007bff',
      color: '#ffffff'
    },
    navLinkHover: {
      backgroundColor: '#3a3a3a',
      color: '#ffffff'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    userBadge: {
      backgroundColor: userData?.user_type === 'superuser' ? '#ffd700' : '#ff6b6b',
      color: userData?.user_type === 'superuser' ? '#000' : '#fff',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600'
    },
    logoutButton: {
      backgroundColor: '#dc3545',
      color: '#ffffff',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#ffffff'
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #3a3a3a',
      borderTop: '4px solid #007bff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '20px'
    },
    loadingText: {
      fontSize: '16px',
      color: '#a0a0a0'
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  const getNavLinkStyle = (path) => ({
    ...styles.navLink,
    ...(location.pathname === path ? styles.navLinkActive : {})
  });

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.logo}>
              🛠️ Admin Panel
            </div>

            <nav style={styles.navigation}>
              <Link 
                to="/admin" 
                style={getNavLinkStyle('/admin')}
                onMouseEnter={(e) => {
                  if (location.pathname !== '/admin') {
                    e.target.style.backgroundColor = '#3a3a3a';
                    e.target.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== '/admin') {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#a0a0a0';
                  }
                }}
              >
                📊 Dashboard
              </Link>

              <Link 
                to="/admin/users" 
                style={getNavLinkStyle('/admin/users')}
                onMouseEnter={(e) => {
                  if (location.pathname !== '/admin/users') {
                    e.target.style.backgroundColor = '#3a3a3a';
                    e.target.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== '/admin/users') {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#a0a0a0';
                  }
                }}
              >
                👥 จัดการผู้ใช้
              </Link>

              <Link 
                to="/admin/logs" 
                style={getNavLinkStyle('/admin/logs')}
                onMouseEnter={(e) => {
                  if (location.pathname !== '/admin/logs') {
                    e.target.style.backgroundColor = '#3a3a3a';
                    e.target.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== '/admin/logs') {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#a0a0a0';
                  }
                }}
              >
                📋 Activity Logs
              </Link>

              <Link 
                to="/" 
                style={styles.navLink}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#3a3a3a';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#a0a0a0';
                }}
              >
                🖼️ กลับเว็บหลัก
              </Link>
            </nav>

            <div style={styles.userInfo}>
              <span style={styles.userBadge}>
                {userData?.user_type === 'superuser' ? 'SUPER ADMIN' : 'ADMIN'}
              </span>
              <span style={{ color: '#e0e0e0', fontSize: '14px' }}>
                {userData?.username}
              </span>
              <button 
                onClick={handleLogout}
                style={styles.logoutButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={styles.content}>
          {children}
        </main>
      </div>
    </>
  );
}