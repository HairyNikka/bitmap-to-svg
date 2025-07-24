import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ setIsAuthenticated, setUsername }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/accounts/token/", {
        username: form.username,
        password: form.password,
      });

      localStorage.setItem("accessToken", res.data.access);
      localStorage.setItem("refreshToken", res.data.refresh);

      try {
        const userRes = await axios.get("http://localhost:8000/api/accounts/user/", {
          headers: { Authorization: `Bearer ${res.data.access}` }
        });
        
        localStorage.setItem("userData", JSON.stringify(userRes.data));
        
        // ✅ เพิ่ม: อัพเดท state ใน App.jsx
        if (setIsAuthenticated) setIsAuthenticated(true);
        if (setUsername) setUsername(userRes.data.username);
        
        navigate("/");
      } catch (userErr) {
        console.error("Error fetching user data:", userErr);
        
        // ✅ แม้ไม่ได้ user data ก็ยัง login ได้
        if (setIsAuthenticated) setIsAuthenticated(true);
        if (setUsername) setUsername(form.username);
        
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      
      if (err.response?.status === 401) {
        setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      } else if (err.response?.status === 400) {
        setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    card: {
      backgroundColor: '#2a2a2a',
      borderRadius: '12px',
      padding: '40px',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
    },
    title: {
      color: '#ffffff',
      fontSize: '24px',
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: '30px'
    },
    inputGroup: {
      marginBottom: '20px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: '#3a3a3a',
      border: '1px solid #4a4a4a',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.3s ease',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: '#007bff'
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: loading ? '#495057' : '#007bff',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.3s ease',
      marginTop: '10px'
    },
    buttonHover: {
      backgroundColor: loading ? '#495057' : '#0056b3'
    },
    errorAlert: {
      backgroundColor: '#dc3545',
      color: '#ffffff',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '20px',
      fontSize: '14px',
      textAlign: 'center'
    },
    linksContainer: {
      marginTop: '25px',
      textAlign: 'center'
    },
    link: {
      color: '#007bff',
      textDecoration: 'none',
      fontSize: '14px'
    },
    linkHover: {
      color: '#66b3ff'
    },
    homeLink: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      color: '#a0a0a0',
      textDecoration: 'none',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  };

  return (
    <>
      {/* CSS Reset */}
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        html, body {
          height: 100%;
        }
      `}</style>
      
      <div style={styles.container}>
        <Link to="/" style={styles.homeLink}>
          <span>🖼️</span> กลับหน้าแปลงภาพ
        </Link>

        <div style={styles.card}>
          <h1 style={styles.title}>เข้าสู่ระบบ</h1>

          {error && (
            <div style={styles.errorAlert}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <input
                type="text"
                name="username"
                placeholder="ชื่อผู้ใช้"
                value={form.username}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  ...styles.input,
                  ...(loading && { opacity: 0.7 })
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#4a4a4a'}
              />
            </div>

            <div style={styles.inputGroup}>
              <input
                type="password"
                name="password"
                placeholder="รหัสผ่าน"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  ...styles.input,
                  ...(loading && { opacity: 0.7 })
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#4a4a4a'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={styles.button}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = '#0056b3';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = '#007bff';
              }}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <div style={styles.linksContainer}>
            <p style={{ color: '#a0a0a0', margin: '0 0 8px 0', fontSize: '14px' }}>
              ยังไม่มีบัญชี?{' '}
              <Link 
                to="/register" 
                style={styles.link}
                onMouseEnter={(e) => e.target.style.color = '#66b3ff'}
                onMouseLeave={(e) => e.target.style.color = '#007bff'}
              >
                สมัครสมาชิก
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}