// ✅ Navbar ใช้ fixed ให้อยู่ติดด้านบนเสมอ พร้อม paddingTop ในเนื้อหาอื่นรองรับ
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Navbar() {
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    axios
      .get("http://localhost:8000/api/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setUsername(res.data.username))
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUsername(null);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUsername(null);
  };

  const styleNavbar = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#222",
    color: "#fff",
    padding: "10px 20px",
    position: "fixed", // จาก sticky → fixed
    top: 0,
    left: 0,
    width: '100%',
    boxSizing: 'border-box',
    zIndex: 1000,
  };

  return (
    <div style={styleNavbar}>
      <h3 style={{ margin: 0 }}>🖼️ Bitmap to SVG Converter</h3>
      <div>
        {username ? (
          <>
            <span style={{ marginRight: "10px" }}>👤 {username}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login" style={{ color: "#fff", textDecoration: "none" }}>
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
