// --- src/components/Navbar.jsx ---
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
    position: "sticky",
    top: 0,
    zIndex: 1000,
  };

  return (
    <div style={styleNavbar}>
      <h3>🔁 แปลงภาพ</h3>

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
