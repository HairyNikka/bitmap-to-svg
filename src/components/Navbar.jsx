// 🖤 Clean Dark Theme Navbar - เรียบๆ ไม่มี effects ฟุ้งๆ
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faImage, 
  faUser, 
  faUserShield, 
  faUserTie, 
  faCog, 
  faSignOutAlt, 
  faSignInAlt,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import axios from "axios";

export default function Navbar() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("accessToken");
    const storedUserData = localStorage.getItem("userData");
    
    if (!token) {
      setLoading(false);
      return;
    }

    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        setUserData(parsed);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    try {
      const res = await axios.get("http://localhost:8000/api/accounts/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setUserData(res.data);
      localStorage.setItem("userData", JSON.stringify(res.data));
    } catch (error) {
      console.error("Auth check failed:", error);
      
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");
    
    if (token) {
      try {
        await axios.post("http://localhost:8000/api/accounts/token/logout/", {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Logout API failed:", error);
      }
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    setUserData(null);
    window.location.reload();
  };

  const getUserDisplayName = () => {
    if (!userData) return null;
    return userData.username;
  };

  const getUserIcon = () => {
    if (!userData) return { icon: faUser, color: '#6b7280' };
    
    switch (userData.user_type) {
      case 'superuser':
        return { icon: faUserTie, color: '#eab308' }; // สีเหลือง
      case 'admin':
        return { icon: faUserShield, color: '#dc2626' }; // สีแดง
      case 'user':
      default:
        return { icon: faUser, color: '#6b7280' }; // สีเทา
    }
  };
  const { icon, color } = getUserIcon();
  
  const getUserRoleBadge = () => {
    if (!userData || userData.user_type === 'user') return null;
    
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
    navbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#1a1a1a",
      borderBottom: "1px solid #333",
      color: "#fff",
      padding: "12px 24px",
      position: "fixed", 
      top: 0,
      left: 0,
      width: '100%',
      boxSizing: 'border-box',
      zIndex: 1000
    },

    brand: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      margin: 0,
      fontSize: "18px",
      fontWeight: "600",
      color: "#ffffff"
    },

    brandIcon: {
      color: "#ffffff",
      fontSize: "20px"
    },

    userSection: {
      display: "flex",
      alignItems: "center",
      gap: "16px"
    },

    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "#2a2a2a",
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #404040"
    },

    userIcon: {
      color: "#ffffff",
      fontSize: "16px"
    },

    username: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#ffffff"
    },

    adminLink: {
      color: "#ffffff",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: "500",
      backgroundColor: "#28a745",
      padding: "8px 12px",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    },

    logoutButton: {
      backgroundColor: "#dc3545",
      color: "#ffffff",
      border: "none",
      padding: "8px 12px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    },

    loginButton: {
      backgroundColor: "#007bff",
      color: "#ffffff",
      textDecoration: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    },

    loading: {
      color: "#cccccc",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }
  };

  return (
    <nav style={styles.navbar}>
      {/* Brand Section */}
      <h3 style={styles.brand}>
        <FontAwesomeIcon icon={faImage} style={styles.brandIcon} />
        Bitmap to Vector
      </h3>
      
      {/* User Section */}
      <div style={styles.userSection}>
        {loading ? (
          <div style={styles.loading}>
            <FontAwesomeIcon icon={faSpinner} spin />
            กำลังโหลด...
          </div>
        ) : userData ? (
          <>
            {/* User Info */}
            <div style={styles.userInfo}>
              <FontAwesomeIcon 
                icon={icon} 
                style={{...styles.userIcon, color: color}}
              />
              <span style={styles.username}>
                {getUserDisplayName()}
              </span>
              {getUserRoleBadge()}
            </div>
            
            {/* Admin Panel Link */}
            {userData.user_type !== 'user' && (
              <Link to="/admin" style={styles.adminLink}>
                <FontAwesomeIcon icon={faCog} />
                จัดการระบบ
              </Link>
            )}
            
            {/* Logout Button */}
            <button onClick={handleLogout} style={styles.logoutButton}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              ออกจากระบบ
            </button>
          </>
        ) : (
          <Link to="/login" style={styles.loginButton}>
            <FontAwesomeIcon icon={faSignInAlt} />
            เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </nav>
  );
}