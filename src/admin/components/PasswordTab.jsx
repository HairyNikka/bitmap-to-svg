// src/admin/components/modals/EditUserModal/PasswordTab.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faExclamation, 
  faEye, 
  faEyeSlash 
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

export default function PasswordTab({ 
  user, 
  currentUser, 
  loading, 
  setLoading, 
  showError, 
  showSuccess 
}) {
  // State สำหรับรหัสผ่าน (ลบ current_password ออก)
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: '',
    show_new: false,
    show_confirm: false
  });

  // ฟังก์ชันเปลี่ยนรหัสผ่าน
  const handleSave = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      showError('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }

    if (passwordData.new_password.length < 6) {
      showError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/accounts/admin/users/${user.id}/password/change/`, {
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showSuccess('เปลี่ยนรหัสผ่านสำเร็จ');
      setPasswordData(prev => ({
        ...prev,
        new_password: '',
        confirm_password: ''
      }));
    } catch (error) {
      console.error('Password change error:', error);
      showError(error.response?.data?.error || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const styles = {
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      color: '#e0e0e0',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: '#1a1a1a',
      border: '2px solid #3a3a3a',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '14px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease'
    },
    passwordField: {
      position: 'relative'
    },
    eyeButton: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#6c757d',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '4px'
    },
    saveButton: {
      backgroundColor: '#28a745',
      color: '#ffffff',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease'
    },
    passwordInfoBox: {
      backgroundColor: 'rgba(255, 193, 7, 0.1)',
      border: '1px solid rgba(255, 193, 7, 0.3)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px'
    },
    infoHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '12px'
    },
    infoTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#ffc107'
    },
    infoContent: {
      margin: 0
    },
    infoText: {
      fontSize: '13px',
      color: '#e0e0e0',
      margin: '8px 0',
      lineHeight: '1.5'
    },
    matchIndicator: {
      marginTop: '8px',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  };

  const getMatchIndicatorStyle = () => {
    const isMatch = passwordData.new_password === passwordData.confirm_password;
    return {
      ...styles.matchIndicator,
      backgroundColor: isMatch ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
      color: isMatch ? '#28a745' : '#dc3545'
    };
  };

  const isFormValid = () => {
    return passwordData.new_password && 
           passwordData.confirm_password && 
           passwordData.new_password === passwordData.confirm_password;
  };

  return (
    <div>
      {/* รหัสผ่านปัจจุบัน - แจ้งเตือน */}
      <div style={styles.formGroup}>
        <div style={styles.passwordInfoBox}>
          <div style={styles.infoHeader}>
            <FontAwesomeIcon icon={faExclamation} style={{ color: '#ffc107' }} />
            <span style={styles.infoTitle}>เกี่ยวกับรหัสผ่านปัจจุบัน</span>
          </div>
          <div style={styles.infoContent}>
            <p style={styles.infoText}>
              🔒 รหัสผ่านของผู้ใช้ถูกเข้ารหัสด้วยระบบความปลอดภัยขั้นสูง ไม่สามารถดูรหัสผ่านจริงได้
            </p>
            <p style={styles.infoText}>
              ⚡ คุณสามารถตั้งรหัสผ่านใหม่ให้ผู้ใช้ได้โดยตรง โดยไม่ต้องรู้รหัสเดิม
            </p>
          </div>
        </div>
      </div>

      {/* รหัสผ่านใหม่ */}
      <div style={styles.formGroup}>
        <label style={styles.label}>รหัสผ่านใหม่:</label>
        <div style={styles.passwordField}>
          <input
            type={passwordData.show_new ? "text" : "password"}
            value={passwordData.new_password}
            onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
            style={styles.input}
            placeholder="ป้อนรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
          />
          <button
            type="button"
            onClick={() => setPasswordData(prev => ({...prev, show_new: !prev.show_new}))}
            style={styles.eyeButton}
          >
            <FontAwesomeIcon icon={passwordData.show_new ? faEyeSlash : faEye} />
          </button>
        </div>
      </div>

      {/* ยืนยันรหัสผ่าน */}
      <div style={styles.formGroup}>
        <label style={styles.label}>ยืนยันรหัสผ่าน:</label>
        <div style={styles.passwordField}>
          <input
            type={passwordData.show_confirm ? "text" : "password"}
            value={passwordData.confirm_password}
            onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
            style={styles.input}
            placeholder="ยืนยันรหัสผ่านใหม่"
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
          />
          <button
            type="button"
            onClick={() => setPasswordData(prev => ({...prev, show_confirm: !prev.show_confirm}))}
            style={styles.eyeButton}
          >
            <FontAwesomeIcon icon={passwordData.show_confirm ? faEyeSlash : faEye} />
          </button>
        </div>
        
        {/* Password match indicator */}
        {passwordData.confirm_password && (
          <div style={getMatchIndicatorStyle()}>
            <FontAwesomeIcon icon={passwordData.new_password === passwordData.confirm_password ? faCheck : faExclamation} />
            {passwordData.new_password === passwordData.confirm_password ? 
              'รหัสผ่านตรงกัน' : 'รหัสผ่านไม่ตรงกัน'}
          </div>
        )}
      </div>

      {/* ปุ่มบันทึก */}
      <div style={{ marginTop: '30px' }}>
        <button
          onClick={handleSave}
          disabled={loading || !isFormValid()}
          style={{
            ...styles.saveButton,
            opacity: (loading || !isFormValid()) ? 0.6 : 1
          }}
        >
          <FontAwesomeIcon icon={faCheck} />
          {loading ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
        </button>
      </div>
    </div>
  );
}