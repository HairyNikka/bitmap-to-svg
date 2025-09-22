// src/admin/components/modals/EditUserModal/PasswordTab.jsx - Improved version
import React, { useState, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faExclamation, 
  faEye, 
  faEyeSlash,
  faShieldAlt,
  faSpinner
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
  // State สำหรับรหัสผ่าน
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: '',
    show_new: false,
    show_confirm: false
  });

  // State สำหรับ confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Memoized validation
  const passwordValidation = useMemo(() => {
    const { new_password, confirm_password } = passwordData;
    
    return {
      isLengthValid: new_password.length >= 8,
      isMatch: new_password && confirm_password && new_password === confirm_password,
      isFormValid: new_password.length >= 8 && new_password === confirm_password && confirm_password.length > 0
    };
  }, [passwordData.new_password, passwordData.confirm_password]);

  // Debounced input handlers for better performance
  const handlePasswordChange = useCallback((field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  }, []);

  // ฟังก์ชันยืนยันการเปลี่ยนรหัสผ่าน
  const handleSaveClick = () => {
    setShowConfirmDialog(true);
  };

  // ฟังก์ชันเปลี่ยนรหัสผ่าน
  const handleSave = async () => {
    if (!passwordValidation.isFormValid) return;

    setShowConfirmDialog(false);
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('ไม่พบ authentication token');
      }

      const response = await axios.put(
        `http://localhost:8000/api/accounts/admin/users/${user.id}/password/change/`, 
        {
          new_password: passwordData.new_password,
          confirm_password: passwordData.confirm_password
        }, 
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // 10 second timeout
        }
      );

      showSuccess('เปลี่ยนรหัสผ่านสำเร็จ');
      setPasswordData(prev => ({
        ...prev,
        new_password: '',
        confirm_password: ''
      }));

    } catch (error) {
      console.error('Password change error:', error);
      
      if (error.code === 'NETWORK_ERROR') {
        showError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      } else if (error.response?.status === 429) {
        showError('คุณพยายามเปลี่ยนรหัสผ่านบ่อยเกินไป กรุณารอสักครู่');
      } else if (error.response?.status === 400) {
        showError(error.response.data?.error || 'ข้อมูลรหัสผ่านไม่ถูกต้อง');
      } else if (error.response?.status === 403) {
        showError('คุณไม่มีสิทธิ์เปลี่ยนรหัสผ่านผู้ใช้นี้');
      } else {
        showError('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  // Styles with improved animations
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
      padding: '12px 16px 12px 16px',
      paddingRight: '48px',
      backgroundColor: '#1a1a1a',
      border: '2px solid #3a3a3a',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '14px',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease'
    },
    inputFocused: {
      borderColor: '#007bff',
      boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.1)'
    },
    inputError: {
      borderColor: '#dc3545',
      boxShadow: '0 0 0 3px rgba(220, 53, 69, 0.1)'
    },
    inputSuccess: {
      borderColor: '#28a745',
      boxShadow: '0 0 0 3px rgba(40, 167, 69, 0.1)'
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
      fontSize: '16px',
      padding: '8px',
      borderRadius: '4px',
      transition: 'color 0.2s ease'
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
      transition: 'all 0.2s ease',
      minWidth: '160px',
      justifyContent: 'center'
    },
    saveButtonDisabled: {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed',
      opacity: 0.7
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
    validationList: {
      marginTop: '8px',
      padding: '12px',
      backgroundColor: 'rgba(108, 117, 125, 0.1)',
      borderRadius: '6px',
      border: '1px solid rgba(108, 117, 125, 0.2)'
    },
    validationItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      margin: '4px 0',
      transition: 'color 0.3s ease'
    },
    validationItemValid: {
      color: '#28a745'
    },
    validationItemInvalid: {
      color: '#6c757d'
    },
    matchIndicator: {
      marginTop: '8px',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.3s ease'
    },
    matchIndicatorSuccess: {
      backgroundColor: 'rgba(40, 167, 69, 0.1)',
      border: '1px solid rgba(40, 167, 69, 0.3)',
      color: '#28a745'
    },
    matchIndicatorError: {
      backgroundColor: 'rgba(220, 53, 69, 0.1)',
      border: '1px solid rgba(220, 53, 69, 0.3)',
      color: '#dc3545'
    },
    confirmDialog: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 3000
    },
    confirmDialogContent: {
      backgroundColor: '#2a2a2a',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '400px',
      width: '90%',
      border: '1px solid #3a3a3a'
    },
    confirmDialogTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    confirmDialogText: {
      fontSize: '14px',
      color: '#e0e0e0',
      marginBottom: '20px',
      lineHeight: '1.5'
    },
    confirmDialogButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    },
    confirmButton: {
      backgroundColor: '#dc3545',
      color: '#ffffff',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: '#ffffff',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    }
  };

  // Get input style based on validation state
  const getInputStyle = (isValid, hasContent) => {
    let style = { ...styles.input };
    if (hasContent) {
      if (isValid) {
        style = { ...style, ...styles.inputSuccess };
      } else {
        style = { ...style, ...styles.inputError };
      }
    }
    return style;
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
              รหัสผ่านของผู้ใช้ถูกเข้ารหัสด้วยระบบความปลอดภัยขั้นสูง ไม่สามารถดูรหัสผ่านจริงได้
            </p>
            <p style={styles.infoText}>
              คุณสามารถตั้งรหัสผ่านใหม่ให้ผู้ใช้ได้โดยตรง โดยไม่ต้องรู้รหัสเดิม
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
            onChange={(e) => handlePasswordChange('new_password', e.target.value)}
            style={getInputStyle(passwordValidation.isLengthValid, passwordData.new_password.length > 0)}
            placeholder="ป้อนรหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
          />
          <button
            type="button"
            onClick={() => setPasswordData(prev => ({...prev, show_new: !prev.show_new}))}
            style={styles.eyeButton}
            onMouseOver={(e) => e.target.style.color = '#ffffff'}
            onMouseOut={(e) => e.target.style.color = '#6c757d'}
          >
            <FontAwesomeIcon icon={passwordData.show_new ? faEyeSlash : faEye} />
          </button>
        </div>

        {/* Password validation indicators */}
        {passwordData.new_password && (
          <div style={styles.validationList}>
            <div style={{
              ...styles.validationItem,
              ...(passwordValidation.isLengthValid ? styles.validationItemValid : styles.validationItemInvalid)
            }}>
              <FontAwesomeIcon 
                icon={passwordValidation.isLengthValid ? faCheck : faExclamation} 
                size="sm"
              />
              อย่างน้อย 8 ตัวอักษร ({passwordData.new_password.length}/8)
            </div>
          </div>
        )}
      </div>

      {/* ยืนยันรหัสผ่าน */}
      <div style={styles.formGroup}>
        <label style={styles.label}>ยืนยันรหัสผ่าน:</label>
        <div style={styles.passwordField}>
          <input
            type={passwordData.show_confirm ? "text" : "password"}
            value={passwordData.confirm_password}
            onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
            style={getInputStyle(passwordValidation.isMatch, passwordData.confirm_password.length > 0)}
            placeholder="ยืนยันรหัสผ่านใหม่"
            disabled={!passwordValidation.isLengthValid}
          />
          <button
            type="button"
            onClick={() => setPasswordData(prev => ({...prev, show_confirm: !prev.show_confirm}))}
            style={styles.eyeButton}
            onMouseOver={(e) => e.target.style.color = '#ffffff'}
            onMouseOut={(e) => e.target.style.color = '#6c757d'}
          >
            <FontAwesomeIcon icon={passwordData.show_confirm ? faEyeSlash : faEye} />
          </button>
        </div>
        
        {/* Password match indicator */}
        {passwordData.confirm_password && passwordValidation.isLengthValid && (
          <div style={{
            ...styles.matchIndicator,
            ...(passwordValidation.isMatch ? styles.matchIndicatorSuccess : styles.matchIndicatorError)
          }}>
            <FontAwesomeIcon 
              icon={passwordValidation.isMatch ? faCheck : faExclamation} 
            />
            {passwordValidation.isMatch ? 'รหัสผ่านตรงกัน' : 'รหัสผ่านไม่ตรงกัน'}
          </div>
        )}
      </div>

      {/* ปุ่มบันทึก */}
      <div style={{ marginTop: '30px' }}>
        <button
          onClick={handleSaveClick}
          disabled={loading || !passwordValidation.isFormValid}
          style={{
            ...styles.saveButton,
            ...(loading || !passwordValidation.isFormValid ? styles.saveButtonDisabled : {})
          }}
          onMouseOver={(e) => {
            if (!loading && passwordValidation.isFormValid) {
              e.target.style.backgroundColor = '#218838';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading && passwordValidation.isFormValid) {
              e.target.style.backgroundColor = '#28a745';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheck} />
              เปลี่ยนรหัสผ่าน
            </>
          )}
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div style={styles.confirmDialog} onClick={() => setShowConfirmDialog(false)}>
          <div style={styles.confirmDialogContent} onClick={(e) => e.stopPropagation()}>
            <h4 style={styles.confirmDialogTitle}>
              <FontAwesomeIcon icon={faShieldAlt} style={{ color: '#ffc107' }} />
              ยืนยันการเปลี่ยนรหัสผ่าน
            </h4>
            <p style={styles.confirmDialogText}>
              คุณแน่ใจหรือไม่ที่จะเปลี่ยนรหัสผ่านของ <strong>{user.username}</strong>?<br/>
              ผู้ใช้จะต้องใช้รหัสผ่านใหม่ในการเข้าสู่ระบบครั้งต่อไป
            </p>
            <div style={styles.confirmDialogButtons}>
              <button
                onClick={() => setShowConfirmDialog(false)}
                style={styles.cancelButton}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                style={styles.confirmButton}
              >
                ยืนยันเปลี่ยนรหัสผ่าน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}