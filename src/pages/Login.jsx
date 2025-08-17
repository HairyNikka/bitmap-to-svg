import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faLock, 
  faEye, 
  faEyeSlash,
  faSignInAlt,
  faExclamation,
  faCheck,
  faKey,
  faImage
} from '@fortawesome/free-solid-svg-icons';

export default function Login({ setIsAuthenticated, setUsername }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-focus username field
  useEffect(() => {
    const usernameInput = document.querySelector('input[name="username"]');
    if (usernameInput) {
      usernameInput.focus();
    }

    // Check for success message from password reset
    if (location.state?.message) {
      // แสดง success message ชั่วคราว
      const timer = setTimeout(() => {
        // Clear the state message
        navigate(location.pathname, { replace: true, state: {} });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  // Real-time validation (เฉพาะ field ที่แตะแล้ว)
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [form, touched]);

  const validateForm = () => {
    const newErrors = {};

    if (touched.username && !form.username.trim()) {
      newErrors.username = 'กรุณาป้อนชื่อผู้ใช้';
    } else if (touched.username && form.username.trim().length < 3) {
      newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
    }

    if (touched.password && !form.password) {
      newErrors.password = 'กรุณาป้อนรหัสผ่าน';
    } else if (touched.password && form.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear server error when user types
  };

  const handleFocus = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Mark all fields as touched
    setTouched({ username: true, password: true });

    // Validate before submit
    const allErrors = {};
    if (!form.username.trim()) {
      allErrors.username = 'กรุณาป้อนชื่อผู้ใช้';
    } else if (form.username.trim().length < 3) {
      allErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
    }

    if (!form.password) {
      allErrors.password = 'กรุณาป้อนรหัสผ่าน';
    } else if (form.password.length < 6) {
      allErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      setLoading(false);
      return;
    }

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
        
        if (setIsAuthenticated) setIsAuthenticated(true);
        if (setUsername) setUsername(userRes.data.username);
        
        navigate("/");
      } catch (userErr) {
        console.error("Error fetching user data:", userErr);
        
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
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError("เชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง");
      } else if (err.code === 'ERR_NETWORK') {
        setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
      } else {
        setError("เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = form.username.trim() && form.password && Object.keys(errors).length === 0;

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
      maxWidth: '450px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      border: '1px solid #3a3a3a'
    },
    title: {
      color: '#ffffff',
      fontSize: '24px',
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    },
    titleIcon: {
      color: '#4ade80'
    },
    successMessage: {
      backgroundColor: '#4ade80',
      color: '#000000',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '20px',
      fontSize: '14px',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    inputGroup: {
      marginBottom: '20px'
    },
    inputContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    inputIcon: {
      position: 'absolute',
      left: '12px',
      color: '#6c757d',
      fontSize: '14px',
      zIndex: 1
    },
    input: {
      width: '100%',
      padding: '12px 16px 12px 40px',
      backgroundColor: '#3a3a3a',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#3a3a3a',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box'
    },
    inputError: {
      borderColor: '#ef4444'
    },
    inputFocus: {
      borderColor: '#4ade80'
    },
    passwordInput: {
      paddingRight: '45px'
    },
    eyeButton: {
      position: 'absolute',
      right: '12px',
      background: 'none',
      border: 'none',
      color: '#6c757d',
      cursor: 'pointer',
      padding: '4px',
      fontSize: '14px',
      transition: 'color 0.2s ease'
    },
    errorText: {
      color: '#ef4444',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginTop: '6px'
    },
    errorIcon: {
      fontSize: '10px'
    },
    button: {
      width: '100%',
      padding: '12px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginTop: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    buttonActive: {
      backgroundColor: '#4ade80',
      color: '#000000'
    },
    buttonDisabled: {
      backgroundColor: '#4a4a4a',
      color: '#9ca3af',
      cursor: 'not-allowed'
    },
    buttonLoading: {
      backgroundColor: '#6c757d',
      color: '#ffffff',
      cursor: 'not-allowed'
    },
    buttonIcon: {
      fontSize: '14px'
    },
    spinner: {
      width: '16px',
      height: '16px',
      border: '2px solid #ffffff',
      borderTop: '2px solid transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    errorAlert: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '20px',
      fontSize: '14px',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    alertIcon: {
      fontSize: '14px'
    },
    linksContainer: {
      marginTop: '25px',
      textAlign: 'center'
    },
    linkRow: {
      marginBottom: '12px'
    },
    link: {
      color: '#007bff',
      textDecoration: 'none',
      fontSize: '14px',
      transition: 'color 0.2s ease'
    },
    forgotPasswordLink: {
      color: '#f59e0b',
      textDecoration: 'none',
      fontSize: '14px',
      transition: 'color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px'
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
      gap: '8px',
      transition: 'color 0.2s ease',
      backgroundColor: 'transparent',
      border: '1px solid #6b7280',
      borderRadius: '8px',
      padding: '8px 16px'
    },
    backIcon: {
      fontSize: '12px'
    },
  };

  return (
    <>
      <div style={styles.container}>
            <Link to="/" style={styles.homeLink}>
              <FontAwesomeIcon icon={faImage} style={styles.backIcon} />
              กลับหน้าแปลงภาพ
            </Link>
        <div style={styles.card}>
          <h1 style={styles.title}>
            <FontAwesomeIcon icon={faSignInAlt} style={styles.titleIcon} />
            เข้าสู่ระบบ
          </h1>

          {/* Success Message from Password Reset */}
          {location.state?.message && (
            <div style={styles.successMessage}>
              <FontAwesomeIcon icon={faCheck} style={styles.alertIcon} />
              {location.state.message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={styles.errorAlert}>
              <FontAwesomeIcon icon={faExclamation} style={styles.alertIcon} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username Field */}
            <div style={styles.inputGroup}>
              <div style={styles.inputContainer}>
                <FontAwesomeIcon icon={faUser} style={styles.inputIcon} />
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
                    ...(errors.username && styles.inputError),
                    ...(loading && { opacity: 0.7 })
                  }}
                  onFocus={(e) => {
                    handleFocus('username');
                    e.target.style.borderColor = '#4ade80';
                  }}
                  onBlur={(e) => {
                    if (errors.username) {
                      e.target.style.borderColor = '#ef4444';
                    } else {
                      e.target.style.borderColor = '#3a3a3a';
                    }
                  }}
                />
              </div>
              {errors.username && (
                <div style={styles.errorText}>
                  <FontAwesomeIcon icon={faExclamation} style={styles.errorIcon} />
                  {errors.username}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div style={styles.inputGroup}>
              <div style={styles.inputContainer}>
                <FontAwesomeIcon icon={faLock} style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="รหัสผ่าน"
                  value={form.password}
                  onChange={handleChange}
                  required                    
                  disabled={loading}          
                  style={{                   
                    ...styles.input,
                    ...styles.passwordInput,
                    ...(errors.password && styles.inputError),
                    ...(loading && { opacity: 0.7 })
                  }}
                  onFocus={(e) => {
                    handleFocus('password');
                    e.target.style.borderColor = '#4ade80';
                  }}
                  onBlur={(e) => {
                    if (errors.password) {
                      e.target.style.borderColor = '#ef4444';
                    } else {
                      e.target.style.borderColor = '#3a3a3a';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  disabled={loading}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.password && (
                <div style={styles.errorText}>
                  <FontAwesomeIcon icon={faExclamation} style={styles.errorIcon} />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonLoading : 
                   isFormValid ? styles.buttonActive : styles.buttonDisabled)
              }}
            >
              {loading ? (
                <>
                  <div style={styles.spinner}></div>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSignInAlt} style={styles.buttonIcon} />
                  เข้าสู่ระบบ
                </>
              )}
            </button>
          </form>

          <div style={styles.linksContainer}>
            {/* Forgot Password Link */}
            <div style={styles.linkRow}>
              <Link 
                to="/forgot-password" 
                style={styles.forgotPasswordLink}
                onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
                onMouseLeave={(e) => e.target.style.color = '#f59e0b'}
              >
                <FontAwesomeIcon icon={faKey} style={{ fontSize: '12px' }} />
                ลืมรหัสผ่าน?
              </Link>
            </div>

            {/* Register Link */}
            <div style={styles.linkRow}>
              <p style={{ color: '#a0a0a0', margin: '0', fontSize: '14px' }}>
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
      </div>
    </>
  );
}