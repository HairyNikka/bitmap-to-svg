import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout'; // #1: Import AuthLayout

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/accounts/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          email, 
          password, 
          confirm_password: confirmPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('สมัครสมาชิกสำเร็จ! กำลังเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ...');
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        if (data.username) {
          setError(data.username[0]);
        } else if (data.email) {
          setError(data.email[0]);
        } else if (data.password) {
          setError(data.password[0]);
        } else if (data.confirm_password) {
          setError(data.confirm_password[0]);
        } else if (data.error) {
          setError(data.error);
        } else {
          setError('เกิดข้อผิดพลาดในการสมัครสมาชิก');
        }
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  // #2: ลด styles ลง เพราะ positioning จัดการโดย AuthLayout แล้ว  
  const styles = {
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
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: loading || success ? '#495057' : '#28a745',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: (loading || success) ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.3s ease',
      marginTop: '10px'
    },
    successAlert: {
      backgroundColor: '#28a745',
      color: '#ffffff',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '20px',
      fontSize: '14px',
      textAlign: 'center'
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
    }
  };

  return (
    // #3: Wrap ทั้งหมดด้วย AuthLayout แทนที่จะใช้ div container
    <AuthLayout>
      <div style={styles.card}>
        <h1 style={styles.title}>สมัครสมาชิก</h1>

        {success && (
          <div style={styles.successAlert}>
            ✅ {success}
          </div>
        )}
        
        {error && (
          <div style={styles.errorAlert}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="ชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading || success}
              style={{
                ...styles.input,
                ...((loading || success) && { opacity: 0.7 })
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#4a4a4a'}
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || success}
              style={{
                ...styles.input,
                ...((loading || success) && { opacity: 0.7 })
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#4a4a4a'}
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || success}
              minLength="8"
              style={{
                ...styles.input,
                ...((loading || success) && { opacity: 0.7 })
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#4a4a4a'}
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="ยืนยันรหัสผ่าน"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || success}
              style={{
                ...styles.input,
                ...((loading || success) && { opacity: 0.7 }),
                ...(confirmPassword && password !== confirmPassword && {
                  borderColor: '#dc3545'
                })
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => {
                if (confirmPassword && password !== confirmPassword) {
                  e.target.style.borderColor = '#dc3545';
                } else {
                  e.target.style.borderColor = '#4a4a4a';
                }
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            style={styles.button}
            onMouseEnter={(e) => {
              if (!loading && !success) {
                e.target.style.backgroundColor = '#218838';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !success) {
                e.target.style.backgroundColor = '#28a745';
              }
            }}
          >
            {loading ? "กำลังสมัคร..." : success ? "สมัครเสร็จแล้ว" : "สมัครสมาชิก"}
          </button>
        </form>

        <div style={styles.linksContainer}>
          <p style={{ color: '#a0a0a0', margin: '0 0 8px 0', fontSize: '14px' }}>
            มีบัญชีอยู่แล้ว?{' '}
            <Link 
              to="/login" 
              style={styles.link}
              onMouseEnter={(e) => e.target.style.color = '#66b3ff'}
              onMouseLeave={(e) => e.target.style.color = '#007bff'}
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}