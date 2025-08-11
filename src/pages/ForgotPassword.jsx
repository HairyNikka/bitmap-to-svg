// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserLock, 
  faEnvelope, 
  faUser, 
  faArrowRight, 
  faArrowLeft,
  faExclamation,
  faInfoCircle 
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const ForgotPassword = ({ onUserFound }) => {
  const [formData, setFormData] = useState({
    identifier: '', // username หรือ email
    identifierType: 'username' // 'username' หรือ 'email'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      identifierType: type,
      identifier: '' // Clear input when switching type
    }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.identifier.trim()) {
      setError(`กรุณาป้อน${formData.identifierType === 'username' ? 'ชื่อผู้ใช้' : 'อีเมล'}`);
      return false;
    }

    if (formData.identifierType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.identifier)) {
        setError('รูปแบบอีเมลไม่ถูกต้อง');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {};
      if (formData.identifierType === 'username') {
        payload.username = formData.identifier.trim();
      } else {
        payload.email = formData.identifier.trim();
      }

      const response = await axios.post(
        'http://localhost:8000/api/accounts/forgot-password/',
        payload,
        {
          // 🔧 เพิ่ม withCredentials เพื่อเริ่ม session
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success) {
        setSuccess('พบผู้ใช้แล้ว! กำลังไปสู่หน้าคำถามความปลอดภัย...');
        
        // ส่งข้อมูลผู้ใช้และคำถามไปยัง parent component
        setTimeout(() => {
          onUserFound({
            user_id: response.data.user_id,
            username: response.data.username,
            security_questions: response.data.security_questions
          });
        }, 1500);
      }

    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response?.status === 404) {
        setError('ไม่พบผู้ใช้ที่ตรงกับข้อมูลที่ป้อน');
      } else if (error.response?.data?.contact_admin) {
        setError(error.response.data.error);
        setSuccess('💡 ' + error.response.data.message);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <FontAwesomeIcon icon={faUserLock} style={styles.headerIcon} />
          <h2 style={styles.title}>ลืมรหัสผ่าน?</h2>
          <p style={styles.subtitle}>
            ป้อนชื่อผู้ใช้หรืออีเมลเพื่อรีเซ็ตรหัสผ่าน
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Type Selector */}
          <div style={styles.typeSelector}>
            <button
              type="button"
              onClick={() => handleTypeChange('username')}
              style={{
                ...styles.typeButton,
                ...(formData.identifierType === 'username' ? styles.typeButtonActive : {})
              }}
            >
              <FontAwesomeIcon icon={faUser} style={styles.typeIcon} />
              ชื่อผู้ใช้
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('email')}
              style={{
                ...styles.typeButton,
                ...(formData.identifierType === 'email' ? styles.typeButtonActive : {})
              }}
            >
              <FontAwesomeIcon icon={faEnvelope} style={styles.typeIcon} />
              อีเมล
            </button>
          </div>

          {/* Input Field */}
          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <FontAwesomeIcon 
                icon={formData.identifierType === 'username' ? faUser : faEnvelope} 
                style={styles.inputIcon} 
              />
              <input
                type={formData.identifierType === 'email' ? 'email' : 'text'}
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder={
                  formData.identifierType === 'username' 
                    ? 'ป้อนชื่อผู้ใช้ของคุณ' 
                    : 'ป้อนอีเมลของคุณ'
                }
                style={{
                  ...styles.input,
                  borderColor: error ? '#ef4444' : '#3a3a3a'
                }}
                disabled={loading}
              />
            </div>
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
              <FontAwesomeIcon icon={faInfoCircle} style={styles.successIcon} />
              {success}
            </div>
          )}

          {/* Info Box */}
          <div style={styles.infoBox}>
            <FontAwesomeIcon icon={faInfoCircle} style={styles.infoIcon} />
            <div style={styles.infoText}>
              <strong>หมายเหตุ:</strong> หากคุณยังไม่ได้ตั้งคำถามความปลอดภัย<br />
              กรุณาติดต่อ Superuser เพื่อรีเซ็ตรหัสผ่าน
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.identifier.trim()}
            style={{
              ...styles.submitButton,
              ...(loading || !formData.identifier.trim() ? styles.submitButtonDisabled : {})
            }}
          >
            {loading ? (
              <>
                <div style={styles.spinner}></div>
                กำลังตรวจสอบ...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faArrowRight} style={styles.buttonIcon} />
                ถัดไป
              </>
            )}
          </button>

          {/* Back to Login */}
          <Link to="/login" style={styles.backLink}>
            <FontAwesomeIcon icon={faArrowLeft} style={styles.backIcon} />
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </form>
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
    maxWidth: '420px',
    border: '1px solid #3a3a3a',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
  },

  header: {
    textAlign: 'center',
    marginBottom: '28px'
  },

  headerIcon: {
    fontSize: '32px',
    color: '#f59e0b',
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

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  typeSelector: {
    display: 'flex',
    backgroundColor: '#1a1a1a',
    borderRadius: '10px',
    padding: '4px',
    gap: '4px'
  },

  typeButton: {
    flex: 1,
    padding: '10px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#a0a0a0',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s ease'
  },

  typeButtonActive: {
    backgroundColor: '#3a3a3a',
    color: '#ffffff'
  },

  typeIcon: {
    fontSize: '12px'
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },

  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#6b7280',
    fontSize: '14px',
    zIndex: 1
  },

  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    backgroundColor: '#3a3a3a',
    border: '2px solid #3a3a3a',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
  },

  errorMessage: {
    color: '#ef4444',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
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
    padding: '8px 12px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px'
  },

  successIcon: {
    fontSize: '12px'
  },

  infoBox: {
    backgroundColor: '#1e3a8a',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start'
  },

  infoIcon: {
    color: '#93c5fd',
    fontSize: '14px',
    marginTop: '2px'
  },

  infoText: {
    color: '#dbeafe',
    fontSize: '12px',
    lineHeight: '1.4'
  },

  submitButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#f59e0b',
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
    transition: 'all 0.2s ease',
    marginTop: '4px'
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

  backLink: {
    color: '#6b7280',
    textDecoration: 'none',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '8px',
    padding: '8px',
    transition: 'color 0.2s ease'
  },

  backIcon: {
    fontSize: '11px'
  }
};

// CSS Animation for spinner
const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

export default ForgotPassword;