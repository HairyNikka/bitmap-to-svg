// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faKey, 
  faLock, 
  faEye, 
  faEyeSlash,
  faCheck,
  faExclamation,
  faArrowLeft,
  faArrowRight,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const ResetPassword = ({ resetData, onBack }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null); // ← ย้ายเข้ามา

  // ย้าย useEffect เข้ามาใน component
  useEffect(() => {
    // เพิ่ม timer แสดงเวลาที่เหลือ (ถ้าต้องการ)
    const timer = setInterval(() => {
      // Update เวลาที่เหลือ
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear messages when user types
    if (error) setError('');
    if (success) setSuccess('');
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.newPassword) {
      setError('กรุณาป้อนรหัสผ่านใหม่');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }

    if (!formData.confirmPassword) {
      setError('กรุณายืนยันรหัสผ่าน');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('=== RESET PASSWORD DEBUG ===');
    console.log('Reset Token:', resetData.reset_token);
    console.log('New Password:', formData.newPassword);
    console.log('Confirm Password:', formData.confirmPassword);

    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        'http://localhost:8000/api/accounts/reset-password/',
        {
          reset_token: resetData.reset_token,
          new_password: formData.newPassword,
          confirm_password: formData.confirmPassword
        },
        {
          // 🔧 เพิ่ม withCredentials เพื่อส่ง session cookie
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success) {
        setSuccess('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว! กำลังไปสู่หน้าเข้าสู่ระบบ...');
        
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'รหัสผ่านเปลี่ยนแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่' 
            }
          });
        }, 3000);
      }

    } catch (error) {
      console.error('Reset password error:', error);
      console.log('Error response:', error.response?.data); 
      console.log('Error status:', error.response?.status); 
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.newPassword && formData.confirmPassword && 
                     formData.newPassword === formData.confirmPassword &&
                     formData.newPassword.length >= 6;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <FontAwesomeIcon icon={faKey} style={styles.headerIcon} />
          <h2 style={styles.title}>ตั้งรหัสผ่านใหม่</h2>
          <p style={styles.subtitle}>
            กรุณาป้อนรหัสผ่านใหม่สำหรับบัญชีของคุณ
          </p>
        </div>

        {/* User Info */}
        <div style={styles.userInfo}>
          <FontAwesomeIcon icon={faUser} style={styles.userIcon} />
          <span style={styles.username}>{resetData.username}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* New Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FontAwesomeIcon icon={faLock} style={styles.labelIcon} />
              รหัสผ่านใหม่
            </label>
            <div style={styles.inputWrapper}>
              <input
                type={showPasswords.newPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                placeholder="ป้อนรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                style={{
                  ...styles.input,
                  borderColor: error && !formData.newPassword ? '#ef4444' : 
                              formData.newPassword && formData.newPassword.length < 6 ? '#f59e0b' : '#3a3a3a'
                }}
                disabled={loading}
                minLength="6"
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('newPassword')}
                style={styles.eyeButton}
                disabled={loading}
              >
                <FontAwesomeIcon 
                  icon={showPasswords.newPassword ? faEyeSlash : faEye} 
                  style={styles.eyeIcon} 
                />
              </button>
            </div>

            {/* Simple Password Length Indicator */}
            {formData.newPassword && formData.newPassword.length < 6 && (
              <div style={styles.simpleWarning}>
                <FontAwesomeIcon icon={faExclamation} style={styles.warningIcon} />
                รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร (ปัจจุบัน: {formData.newPassword.length})
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FontAwesomeIcon icon={faLock} style={styles.labelIcon} />
              ยืนยันรหัสผ่าน
            </label>
            <div style={styles.inputWrapper}>
              <input
                type={showPasswords.confirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="ยืนยันรหัสผ่านใหม่..."
                style={{
                  ...styles.input,
                  borderColor: error && formData.newPassword !== formData.confirmPassword ? '#ef4444' : 
                              formData.confirmPassword && formData.newPassword === formData.confirmPassword ? '#10b981' : '#3a3a3a'
                }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('confirmPassword')}
                style={styles.eyeButton}
                disabled={loading}
              >
                <FontAwesomeIcon 
                  icon={showPasswords.confirmPassword ? faEyeSlash : faEye} 
                  style={styles.eyeIcon} 
                />
              </button>
            </div>

            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div style={styles.matchContainer}>
                {formData.newPassword === formData.confirmPassword ? (
                  <div style={styles.matchSuccess}>
                    <FontAwesomeIcon icon={faCheck} style={styles.matchIcon} />
                    รหัสผ่านตรงกัน
                  </div>
                ) : (
                  <div style={styles.matchError}>
                    <FontAwesomeIcon icon={faExclamation} style={styles.matchIcon} />
                    รหัสผ่านไม่ตรงกัน
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorMessage}>
              <FontAwesomeIcon icon={faExclamation} style={styles.errorIcon} />
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={styles.successMessage}>
              <FontAwesomeIcon icon={faCheck} style={styles.successIcon} />
              {success}
            </div>
          )}

          {/* Security Tips */}
          <div style={styles.tipsBox}>
            <FontAwesomeIcon icon={faCheck} style={styles.tipsIcon} />
            <div style={styles.tipsText}>
              <strong>ข้อกำหนดรหัสผ่าน:</strong><br />
              • อย่างน้อย 6 ตัวอักษร (แนะนำ 8 ตัวขึ้นไป)<br />
              • หลีกเลี่ยงข้อมูลส่วนตัวที่เดาได้ง่าย
            </div>
          </div>

          {/* Buttons */}
          <div style={styles.buttonContainer}>
            <button
              type="button"
              onClick={onBack}
              style={styles.backButton}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faArrowLeft} style={styles.buttonIcon} />
              ย้อนกลับ
            </button>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              style={{
                ...styles.submitButton,
                ...(loading || !isFormValid ? styles.submitButtonDisabled : {})
              }}
            >
              {loading ? (
                <>
                  <div style={styles.spinner}></div>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} style={styles.buttonIcon} />
                  เปลี่ยนรหัสผ่าน
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        {!loading && !success && (
          <div style={styles.footer}>
            <Link to="/login" style={styles.footerLink}>
              <FontAwesomeIcon icon={faArrowLeft} style={styles.footerIcon} />
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
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
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '450px',
    border: '1px solid #3a3a3a',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
  },

  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },

  headerIcon: {
    fontSize: '32px',
    color: '#10b981',
    marginBottom: '12px'
  },

  title: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 8px 0'
  },

  subtitle: {
    color: '#a0a0a0',
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.4'
  },

  userInfo: {
    backgroundColor: '#1e3a8a',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px'
  },

  userIcon: {
    color: '#93c5fd',
    fontSize: '14px'
  },

  username: {
    color: '#dbeafe',
    fontSize: '14px',
    fontWeight: '500'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  label: {
    color: '#e0e0e0',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  labelIcon: {
    fontSize: '12px',
    color: '#10b981'
  },

  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },

  input: {
    width: '100%',
    padding: '12px 45px 12px 14px',
    backgroundColor: '#3a3a3a',
    border: '2px solid #3a3a3a',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
  },

  eyeButton: {
    position: 'absolute',
    right: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px'
  },

  eyeIcon: {
    color: '#6b7280',
    fontSize: '14px'
  },

  strengthContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '4px'
  },

  strengthBar: {
    flex: 1,
    height: '4px',
    backgroundColor: '#4a4a4a',
    borderRadius: '2px',
    overflow: 'hidden'
  },

  strengthFill: {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease'
  },

  strengthText: {
    fontSize: '12px',
    fontWeight: '500',
    minWidth: '70px'
  },

  feedbackContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '4px'
  },

  feedbackItem: {
    color: '#f59e0b',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },

  feedbackIcon: {
    fontSize: '10px'
  },

  simpleWarning: {
    color: '#f59e0b',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '6px',
    padding: '6px 8px',
    backgroundColor: '#1f2937',
    borderRadius: '6px',
    border: '1px solid #f59e0b'
  },

  warningIcon: {
    fontSize: '10px'
  },

  matchContainer: {
    marginTop: '4px'
  },

  matchSuccess: {
    color: '#10b981',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },

  matchError: {
    color: '#ef4444',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },

  matchIcon: {
    fontSize: '10px'
  },

  errorMessage: {
    color: '#ef4444',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 14px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px'
  },

  errorIcon: {
    fontSize: '12px'
  },

  successMessage: {
    color: '#059669',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 14px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px'
  },

  successIcon: {
    fontSize: '12px'
  },

  tipsBox: {
    backgroundColor: '#1e3a8a',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start'
  },

  tipsIcon: {
    color: '#93c5fd',
    fontSize: '14px',
    marginTop: '2px'
  },

  tipsText: {
    color: '#dbeafe',
    fontSize: '12px',
    lineHeight: '1.4'
  },

  buttonContainer: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },

  backButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: '1px solid #6b7280',
    borderRadius: '10px',
    color: '#6b7280',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  },

  submitButton: {
    flex: 2,
    padding: '12px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  },

  submitButtonDisabled: {
    backgroundColor: '#4a4a4a',
    color: '#9ca3af',
    cursor: 'not-allowed'
  },

  buttonIcon: {
    fontSize: '12px'
  },

  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #ffffff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  footer: {
    textAlign: 'center',
    marginTop: '24px'
  },

  footerLink: {
    color: '#6b7280',
    textDecoration: 'none',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'color 0.2s ease'
  },

  footerIcon: {
    fontSize: '11px'
  }
};

export default ResetPassword;