import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const PasswordForm = ({ formData, errors, handleInputChange }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const styles = {
    section: {
      backgroundColor: '#2a2a2a',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #404040'
    },
    sectionTitle: {
      margin: '0 0 16px 0',
      color: 'white',
      fontSize: '16px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center'
    },
    sectionIcon: {
      marginRight: '8px',
      color: '#9ca3af'
    },
    field: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      color: '#d1d5db',
      fontSize: '14px',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      backgroundColor: '#374151',
      border: '1px solid #404040',
      borderRadius: '6px',
      color: 'white',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box'
    },
    inputError: {
      borderColor: '#dc2626'
    },
    error: {
      display: 'block',
      marginTop: '4px',
      color: '#ef4444',
      fontSize: '12px'
    },
    inputContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
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
    passwordInput: {
      paddingRight: '45px'
    }
  };

  return (
    <div style={styles.section}>
      <h4 style={styles.sectionTitle}>
        <FontAwesomeIcon icon={faLock} style={styles.sectionIcon} />
        เปลี่ยนรหัสผ่าน (ไม่บังคับ)
      </h4>
      
      <div style={styles.field}>
        <label style={styles.label}>รหัสผ่านปัจจุบัน</label>
        <div style={styles.inputContainer}>
          <input
            type={showCurrentPassword ? 'text' : 'password'}
            value={formData.currentPassword}
            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
            style={{
              ...styles.input,
              ...styles.passwordInput,
              ...(errors.currentPassword ? styles.inputError : {})
            }}
            placeholder="กรอกรหัสผ่านปัจจุบัน"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            style={styles.eyeButton}
            onMouseEnter={(e) => e.target.style.color = '#ffffff'}
            onMouseLeave={(e) => e.target.style.color = '#6c757d'}
          >
            <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} />
          </button>
        </div>
        {errors.currentPassword && <span style={styles.error}>{errors.currentPassword}</span>}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>รหัสผ่านใหม่</label>
        <div style={styles.inputContainer}>
          <input
            type={showNewPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            style={{
              ...styles.input,
              ...styles.passwordInput,
              ...(errors.newPassword ? styles.inputError : {})
            }}
            placeholder="กรอกรหัสผ่านใหม่"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            style={styles.eyeButton}
            onMouseEnter={(e) => e.target.style.color = '#ffffff'}
            onMouseLeave={(e) => e.target.style.color = '#6c757d'}
          >
            <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
          </button>
        </div>
        {errors.newPassword && <span style={styles.error}>{errors.newPassword}</span>}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>ยืนยันรหัสผ่านใหม่</label>
        <div style={styles.inputContainer}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            style={{
              ...styles.input,
              ...styles.passwordInput,
              ...(errors.confirmPassword ? styles.inputError : {})
            }}
            placeholder="ยืนยันรหัสผ่านใหม่"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeButton}
            onMouseEnter={(e) => e.target.style.color = '#ffffff'}
            onMouseLeave={(e) => e.target.style.color = '#6c757d'}
          >
            <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
          </button>
        </div>
        {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
      </div>
    </div>
  );
};

export default PasswordForm;