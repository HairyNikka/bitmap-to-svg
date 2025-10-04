// src/pages/UserProfile/PasswordTab.jsx
import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faExclamation,
  faEye, 
  faEyeSlash,
  faShieldAlt,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

export default function PasswordTab({ 
  formData,
  errors,
  loading,
  showError,
  showSuccess,
  handleInputChange,
  validateForm,
  submitProfile
}) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Memoized validation
  const passwordValidation = useMemo(() => {
    const { newPassword, confirmPassword } = formData;
    
    return {
      isLengthValid: newPassword.length >= 8,
      isMatch: newPassword && confirmPassword && newPassword === confirmPassword,
      isFormValid: newPassword.length >= 8 && newPassword === confirmPassword && confirmPassword.length > 0,
      hasCurrentPassword: formData.currentPassword.length > 0
    };
  }, [formData.newPassword, formData.confirmPassword, formData.currentPassword]);

  const handleSaveClick = () => {
    if (!validateForm('password')) return;
    if (!passwordValidation.isFormValid || !passwordValidation.hasCurrentPassword) return;
    setShowConfirmDialog(true);
  };

  const handleSave = async () => {
    setShowConfirmDialog(false);
    
    const success = await submitProfile('password');
    if (success) {
      showSuccess('เปลี่ยนรหัสผ่านสำเร็จ');
    } else if (errors.general) {
      showError(errors.general);
    } else if (errors.currentPassword) {
      showError(errors.currentPassword);
    }
  };

  const styles = {
    container: {
      maxWidth: '600px'
    },
    section: {
      backgroundColor: '#2a2a2a',
      padding: '24px',
      borderRadius: '8px',
      border: '1px solid #374151',
      marginBottom: '20px'
    },
    sectionTitle: {
      margin: '0 0 16px 0',
      color: '#ffffff',
      fontSize: '18px',
      fontWeight: '600'
    },
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
      paddingRight: '48px',
      backgroundColor: '#1a1a1a',
      border: '2px solid #3a3a3a',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '14px',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
      outline: 'none'
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
    error: {
      marginTop: '8px',
      color: '#ef4444',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
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
    passwordInfoBox: {
      backgroundColor: 'rgba(255, 193, 7, 0.1)',
      border: '1px solid rgba(255, 193, 7, 0.3)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px'
    },
    infoText: {
      fontSize: '13px',
      color: '#e0e0e0',
      margin: '8px 0',
      lineHeight: '1.5'
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
      zIndex: 10000
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
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: '#ffffff',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    }
  };

  // Get input style
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
    <div style={styles.container}>
      {/* Info Box */}
      <div style={styles.passwordInfoBox}>
        <p style={styles.infoText}>
          <strong>การเปลี่ยนรหัสผ่าน</strong><br/>
          กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่ที่คุณต้องการ รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร
        </p>
      </div>

      {/* Current Password */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>รหัสผ่านปัจจุบัน</h4>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>รหัสผ่านปัจจุบัน:</label>
          <div style={styles.passwordField}>
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              style={styles.input}
              placeholder="กรอกรหัสผ่านปัจจุบัน"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.eyeButton}
              onMouseOver={(e) => e.target.style.color = '#ffffff'}
              onMouseOut={(e) => e.target.style.color = '#6c757d'}
            >
              <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          {errors.currentPassword && (
            <span style={styles.error}>
              <FontAwesomeIcon icon={faExclamation} />
              {errors.currentPassword}
            </span>
          )}
        </div>
      </div>

      {/* New Password */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>รหัสผ่านใหม่</h4>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>รหัสผ่านใหม่:</label>
          <div style={styles.passwordField}>
            <input
              type={showNewPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              style={getInputStyle(passwordValidation.isLengthValid, formData.newPassword.length > 0)}
              placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeButton}
              onMouseOver={(e) => e.target.style.color = '#ffffff'}
              onMouseOut={(e) => e.target.style.color = '#6c757d'}
            >
              <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
            </button>
          </div>

          {/* Password validation indicators */}
          {formData.newPassword && (
            <div style={styles.validationList}>
              <div style={{
                ...styles.validationItem,
                ...(passwordValidation.isLengthValid ? styles.validationItemValid : styles.validationItemInvalid)
              }}>
                <FontAwesomeIcon 
                  icon={passwordValidation.isLengthValid ? faCheck : faExclamation} 
                  size="sm"
                />
                อย่างน้อย 8 ตัวอักษร ({formData.newPassword.length}/8)
              </div>
            </div>
          )}

          {errors.newPassword && (
            <span style={styles.error}>
              <FontAwesomeIcon icon={faExclamation} />
              {errors.newPassword}
            </span>
          )}
        </div>

        {/* Confirm Password */}
        <div style={styles.formGroup}>
          <label style={styles.label}>ยืนยันรหัสผ่านใหม่:</label>
          <div style={styles.passwordField}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              style={getInputStyle(passwordValidation.isMatch, formData.confirmPassword.length > 0)}
              placeholder="ยืนยันรหัสผ่านใหม่"
              disabled={!passwordValidation.isLengthValid}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
              onMouseOver={(e) => e.target.style.color = '#ffffff'}
              onMouseOut={(e) => e.target.style.color = '#6c757d'}
            >
              <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          
          {/* Password match indicator */}
          {formData.confirmPassword && passwordValidation.isLengthValid && (
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

          {errors.confirmPassword && (
            <span style={styles.error}>
              <FontAwesomeIcon icon={faExclamation} />
              {errors.confirmPassword}
            </span>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: '30px' }}>
        <button
          onClick={handleSaveClick}
          disabled={loading || !passwordValidation.isFormValid || !passwordValidation.hasCurrentPassword}
          style={{
            ...styles.saveButton,
            ...(loading || !passwordValidation.isFormValid || !passwordValidation.hasCurrentPassword ? styles.saveButtonDisabled : {})
          }}
          onMouseOver={(e) => {
            if (!loading && passwordValidation.isFormValid && passwordValidation.hasCurrentPassword) {
              e.target.style.backgroundColor = '#218838';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading && passwordValidation.isFormValid && passwordValidation.hasCurrentPassword) {
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
              คุณแน่ใจหรือไม่ที่จะเปลี่ยนรหัสผ่าน?<br/>
              คุณจะต้องใช้รหัสผ่านใหม่ในการเข้าสู่ระบบครั้งต่อไป
            </p>
            <div style={styles.confirmDialogButtons}>
              <button
                onClick={() => setShowConfirmDialog(false)}
                style={styles.cancelButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                style={styles.confirmButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
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