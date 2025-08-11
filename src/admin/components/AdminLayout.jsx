// 🖤 Clean Dark Admin Layout - เหมือน navbar เรียบๆ
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCogs, 
  faChartLine, 
  faUsers, 
  faClipboardList, 
  faImage,
  faSignOutAlt,
  faUser,
  faUserShield,
  faUserTie,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
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
    const accessToken = localStorage.getItem('accessToken');
    const oldToken = localStorage.getItem('token');
    const token = accessToken || oldToken;
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:8000/api/accounts/user/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user = response.data;
      
      if (user.user_type !== 'admin' && user.user_type !== 'superuser') {
        alert('คุณไม่มีสิทธิ์เข้าถึงระบบจัดการ');
        navigate('/');
        return;
      }

      setUserData(user);
      localStorage.setItem('userData', JSON.stringify(user));
      
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

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    
    navigate('/login');
  };

  const getUserIcon = () => {
    if (!userData) return faUser;
    
    switch (userData.user_type) {
      case 'superuser':
        return faUserTie;
      case 'admin':
        return faUserShield;
      case 'user':
      default:
        return faUser;
    }
  };

  const getUserRoleBadge = () => {
    if (!userData) return null;
    
    const badgeStyle = {
      fontSize: '10px',
      fontWeight: '600',
      textTransform: 'uppercase',
      padding: '3px 6px',
      borderRadius: '4px',
      letterSpacing: '0.5px',
      marginLeft: '8px'
    };

    switch (userData.user_type) {
      case 'superuser':
        return (
          <span style={{
            ...badgeStyle,
            backgroundColor: '#ffc107',
            color: '#000'
          }}>
            SUPER USER
          </span>
        );
      case 'admin':
        return (
          <span style={{
            ...badgeStyle,
            backgroundColor: '#dc3545',
            color: '#fff'
          }}>
            ADMIN
          </span>
        );
      default:
        return null;
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#ffffff'
    },
    header: {
      backgroundColor: '#1a1a1a',
      borderBottom: '1px solid #333',
      padding: '0 24px',
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
    logoIcon: {
      color: '#ffffff',
      fontSize: '20px'
    },
    navigation: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    },
    navLink: {
      color: '#ffffff',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500',
      padding: '8px 12px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: 'transparent'
    },
    navLinkActive: {
      backgroundColor: '#007bff',
      color: '#ffffff'
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#2a2a2a',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #404040'
    },
    userIcon: {
      color: '#ffffff',
      fontSize: '16px'
    },
    username: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#ffffff'
    },
    logoutButton: {
      backgroundColor: '#dc3545',
      color: '#ffffff',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
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
    loadingText: {
      fontSize: '14px',
      color: '#cccccc',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>
          <FontAwesomeIcon icon={faSpinner} spin />
          กำลังตรวจสอบสิทธิ์...
        </div>
      </div>
    );
  }

  const getNavLinkStyle = (path) => ({
    ...styles.navLink,
    ...(location.pathname === path ? styles.navLinkActive : {})
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <FontAwesomeIcon icon={faCogs} style={styles.logoIcon} />
            Admin Panel
          </div>

          <nav style={styles.navigation}>
            <Link to="/admin" style={getNavLinkStyle('/admin')}>
              <FontAwesomeIcon icon={faChartLine} />
              Dashboard
            </Link>

            <Link to="/admin/users" style={getNavLinkStyle('/admin/users')}>
              <FontAwesomeIcon icon={faUsers} />
              จัดการผู้ใช้
            </Link>

            <Link to="/admin/logs" style={getNavLinkStyle('/admin/logs')}>
              <FontAwesomeIcon icon={faClipboardList} />
              Activity Logs
            </Link>

            <Link to="/" style={styles.navLink}>
              <FontAwesomeIcon icon={faImage} />
              กลับเว็บหลัก
            </Link>
          </nav>

          <div style={styles.userSection}>
            {/* User Info */}
            <div style={styles.userInfo}>
              <FontAwesomeIcon 
                icon={getUserIcon()} 
                style={styles.userIcon}
              />
              <span style={styles.username}>
                {userData?.username}
              </span>
              {getUserRoleBadge()}
            </div>
            
            {/* Logout Button */}
            <button onClick={handleLogout} style={styles.logoutButton}>
              <FontAwesomeIcon icon={faSignOutAlt} />
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
  );
}