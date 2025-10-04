// src/pages/UserProfile/BasicInfoTab.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faSpinner,
  faExclamationTriangle,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

export default function BasicInfoTab({ 
  formData, 
  errors, 
  loading,
  showError,
  showSuccess,
  handleInputChange,
  validateForm,
  submitProfile,
  userData
}) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isEmailChanged, setIsEmailChanged] = useState(false);

  // Check if email has changed
  React.useEffect(() => {
    setIsEmailChanged(formData.email !== userData?.email);
  }, [formData.email, userData?.email]);

  const handleSaveClick = () => {
    if (!validateForm('basic')) return;
    setShowConfirmDialog(true);
  };

  const handleSave = async () => {
    setShowConfirmDialog(false);
    
    const success = await submitProfile('basic');
    if (success) {
      showSuccess('บันทึกข้อมูลสำเร็จ');
    } else if (errors.general) {
      showError(errors.general);
    } else if (errors.email) {
      showError(errors.email);
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
      marginBottom: '24px'
    },
    sectionTitle: {
      margin: '0 0 20px 0',
      color: '#ffffff',
      fontSize: '18px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
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
    error: {
      marginTop: '8px',
      color: '#ef4444',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    infoBox: {
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
      border: '1px solid rgba(0, 123, 255, 0.3)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px'
    },
    infoText: {
      color: '#007bff',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      lineHeight: '1.5'
    },
    changeIndicator: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '11px',
      padding: '2px 6px',
      borderRadius: '4px',
      backgroundColor: 'rgba(255, 193, 7, 0.2)',
      color: '#ffc107',
      marginLeft: '8px'
    },
    validationIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginTop: '8px',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px'
    },
    validationSuccess: {
      backgroundColor: 'rgba(40, 167, 69, 0.1)',
      border: '1px solid rgba(40, 167, 69, 0.3)',
      color: '#28a745'
    },
    validationError: {
      backgroundColor: 'rgba(220, 53, 69, 0.1)',
      border: '1px solid rgba(220, 53, 69, 0.3)',
      color: '#dc3545'
    },
    validationChecking: {
      backgroundColor: 'rgba(108, 117, 125, 0.1)',
      border: '1px solid rgba(108, 117, 125, 0.3)',
      color: '#6c757d'
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
      maxWidth: '450px',
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
      backgroundColor: '#28a745',
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

  // Get input style based on validation
  const getInputStyle = () => {
    let style = { ...styles.input };
    if (errors.email) {
      style = { ...style, ...styles.inputError };
    } else if (formData.email && /\S+@\S+\.\S+/.test(formData.email) && !isEmailChanged) {
      style = { ...style, ...styles.inputSuccess };
    }
    return style;
  };

  return (
    <div style={styles.container}>
      {/* Info Box */}
      <div style={styles.infoBox}>
        <div style={styles.infoText}>
          <FontAwesomeIcon icon={faInfoCircle} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong>การแก้ไขข้อมูลส่วนตัว</strong><br/>
            คุณสามารถเปลี่ยนอีเมลของคุณได้ กรุณาตรวจสอบให้แน่ใจว่าอีเมลถูกต้องและไม่มีผู้ใช้งานแล้ว
          </div>
        </div>
      </div>

      {/* Email Section */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>ข้อมูลส่วนตัว</h4>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>
            อีเมล:
            {isEmailChanged && (
              <span style={styles.changeIndicator}>
                <FontAwesomeIcon icon={faExclamationTriangle} size="sm" />
                มีการเปลี่ยนแปลง
              </span>
            )}
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            style={getInputStyle()}
            placeholder="example@domain.com"
          />
          
          {errors.email && (
            <span style={styles.error}>
              <FontAwesomeIcon icon={faTimesCircle} />
              {errors.email}
            </span>
          )}
          
          {/* Email validation indicator */}
          {formData.email && /\S+@\S+\.\S+/.test(formData.email) && !errors.email && (
            <div style={{
              ...styles.validationIndicator,
              ...styles.validationSuccess
            }}>
              <FontAwesomeIcon icon={faCheckCircle} />
              รูปแบบอีเมลถูกต้อง
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: '30px' }}>
        <button
          onClick={handleSaveClick}
          disabled={loading || !isEmailChanged || !!errors.email}
          style={{
            ...styles.saveButton,
            ...(loading || !isEmailChanged || !!errors.email ? styles.saveButtonDisabled : {})
          }}
          onMouseOver={(e) => {
            if (!loading && isEmailChanged && !errors.email) {
              e.target.style.backgroundColor = '#218838';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading && isEmailChanged && !errors.email) {
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
              บันทึกข้อมูล
            </>
          )}
        </button>

        {/* Status message */}
        {!isEmailChanged && !loading && (
          <div style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#6c757d',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <FontAwesomeIcon icon={faInfoCircle} />
            ไม่มีการเปลี่ยนแปลงข้อมูล
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div style={styles.confirmDialog} onClick={() => setShowConfirmDialog(false)}>
          <div style={styles.confirmDialogContent} onClick={(e) => e.stopPropagation()}>
            <h4 style={styles.confirmDialogTitle}>
              <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ffc107' }} />
              ยืนยันการแก้ไขข้อมูล
            </h4>
            <p style={styles.confirmDialogText}>
              คุณแน่ใจหรือไม่ที่จะเปลี่ยนอีเมลเป็น<br/>
              <strong>{formData.email}</strong>?
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
                onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
              >
                ยืนยันการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}