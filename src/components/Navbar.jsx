// ✅ Navbar ใช้ fixed ให้อยู่ติดด้านบนเสมอ พร้อม paddingTop ในเนื้อหาอื่นรองรับ
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

    // ถ้ามีข้อมูล user ใน localStorage ให้ใช้ก่อน (แต่ยังต้องอัพเดท)
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        console.log("Stored user data:", parsed); // 🔍 Debug log
        setUserData(parsed);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    // ดึงข้อมูล user ล่าสุดจาก API (บังคับให้เรียกทุกครั้ง)
    try {
      const res = await axios.get("http://localhost:8000/api/accounts/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Fresh user data from API:", res.data); // 🔍 Debug log
      setUserData(res.data);
      localStorage.setItem("userData", JSON.stringify(res.data));
    } catch (error) {
      console.error("Auth check failed:", error);
      
      // ถ้า token หมดอายุหรือไม่ถูกต้อง
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");
    
    // ✅ เรียก API logout พร้อม logging
    if (token) {
      try {
        await axios.post("http://localhost:8000/api/accounts/token/logout/", {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Logout API failed:", error);
        // ไม่เป็นไร ถึงแม้ API จะ fail ก็ยัง logout ได้
      }
    }

    // ✅ ลบข้อมูลทั้งหมดออกจาก localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    setUserData(null);
    
    // ✅ รีเฟรชหน้าหลัง logout
    window.location.reload();
  };

  // ✅ ฟังก์ชันแสดงชื่อผู้ใช้พร้อม role (เพิ่ม debug)
  const getUserDisplayName = () => {
    if (!userData) return null;

    const { username, user_type } = userData;
    console.log("getUserDisplayName - user_type:", user_type, "username:", username); // 🔍 Debug log
    
    switch (user_type) {
      case 'superuser':
        return `(Superadmin) ${username}`;
      case 'admin':
        return `(Admin) ${username}`;
      case 'user':
      default:
        return username; // ผู้ใช้ทั่วไปไม่แสดง role
    }
  };

  // ✅ ฟังก์ชันได้สีตาม role (เพิ่ม debug)
  const getUserRoleColor = () => {
    if (!userData) return "#fff";
    
    console.log("getUserRoleColor - user_type:", userData.user_type); // 🔍 Debug log
    
    switch (userData.user_type) {
      case 'superuser':
        return "#ffd700"; // สีทอง
      case 'admin':
        return "#ff6b6b"; // สีแดงอ่อน
      case 'user':
      default:
        return "#fff"; // สีขาว
    }
  };

  const styleNavbar = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#222",
    color: "#fff",
    padding: "10px 20px",
    position: "fixed", 
    top: 0,
    left: 0,
    width: '100%',
    boxSizing: 'border-box',
    zIndex: 1000,
  };

  const userInfoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "15px"
  };

  const usernameStyle = {
    color: getUserRoleColor(),
    fontWeight: userData?.user_type !== 'user' ? 'bold' : 'normal',
    fontSize: userData?.user_type !== 'user' ? '14px' : '14px'
  };

  const logoutButtonStyle = {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.3s"
  };

  return (
    <div style={styleNavbar}>
      <h3 style={{ margin: 0 }}>🖼️ Bitmap to SVG Converter</h3>
      
      <div style={userInfoStyle}>
        {loading ? (
          <span style={{ color: "#ccc" }}>กำลังโหลด...</span>
        ) : userData ? (
          <>
            <span style={usernameStyle}>
              👤 {getUserDisplayName()}
            </span>
            
            {/* ✅ แสดงข้อมูลเพิ่มเติมสำหรับ admin/superuser */}
            {userData.user_type !== 'user' && (
              <Link 
                to="/admin" 
                style={{ 
                  color: "#28a745", 
                  textDecoration: "none",
                  fontSize: "12px",
                  backgroundColor: "rgba(40, 167, 69, 0.1)",
                  padding: "4px 8px",
                  borderRadius: "3px"
                }}
              >
                🔧 จัดการระบบ
              </Link>
            )}
            
            <button 
              onClick={handleLogout}
              style={logoutButtonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = "#c82333"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#dc3545"}
            >
              ออกจากระบบ
            </button>
          </>
        ) : (
          <Link 
            to="/login" 
            style={{ 
              color: "#fff", 
              textDecoration: "none",
              backgroundColor: "#007bff",
              padding: "8px 16px",
              borderRadius: "4px"
            }}
          >
            เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </div>
  );
}