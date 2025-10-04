// src/pages/UserProfile/SecurityQuestionsTab.jsx
import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faShieldAlt, 
  faEye, 
  faEyeSlash,
  faSpinner,
  faExclamationTriangle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

export default function SecurityQuestionsTab({ 
  formData,
  errors,
  loading,
  showError,
  showSuccess,
  handleInputChange,
  validateForm,
  submitProfile,
  securityQuestions
}) {
  const [showAnswer1, setShowAnswer1] = useState(false);
  const [showAnswer2, setShowAnswer2] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Memoized validation
  const validation = useMemo(() => {
    const { securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2 } = formData;
    
    return {
      isQuestion1Valid: securityQuestion1.length > 0,
      isAnswer1Valid: securityAnswer1.length >= 2,
      isQuestion2Valid: securityQuestion2.length > 0,
      isAnswer2Valid: securityAnswer2.length >= 2,
      isDuplicateQuestions: securityQuestion1 && securityQuestion2 && securityQuestion1 === securityQuestion2,
      isFormValid: securityQuestion1 && securityAnswer1.length >= 2 && 
                   securityQuestion2 && securityAnswer2.length >= 2 && 
                   securityQuestion1 !== securityQuestion2
    };
  }, [formData]);

  const handleSaveClick = () => {
    if (!validateForm('security')) return;
    if (!validation.isFormValid) return;
    setShowConfirmDialog(true);
  };

  const handleSave = async () => {
    setShowConfirmDialog(false);
    
    const success = await submitProfile('security');
    if (success) {
      showSuccess('บันทึกคำถามความปลอดภัยสำเร็จ');
    } else if (errors.general) {
      showError(errors.general);
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
    select: {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: '#1a1a1a',
      border: '2px solid #3a3a3a',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '14px',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
      outline: 'none',
      cursor: 'pointer'
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
    infoBox: {
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
      border: '1px solid rgba(0, 123, 255, 0.3)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px'
    },
    infoText: {
      color: '#007bff',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
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
    validationItemError: {
      color: '#dc3545'
    },
    questionSection: {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid #3a3a3a',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '20px'
    },
    questionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px',
      color: '#007bff',
      fontSize: '16px',
      fontWeight: '600'
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
      minWidth: '180px',
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

  // Get input/select style based on validation
  const getInputStyle = (isValid, hasContent, isError = false) => {
    let style = { ...styles.input };
    if (hasContent) {
      if (isError) {
        style = { ...style, ...styles.inputError };
      } else if (isValid) {
        style = { ...style, ...styles.inputSuccess };
      }
    }
    return style;
  };

  const getSelectStyle = (isValid, hasContent) => {
    let style = { ...styles.select };
    if (hasContent) {
      if (isValid) {
        style = { ...style, ...styles.inputSuccess };
      }
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
            <strong>คำถามความปลอดภัย</strong> ใช้สำหรับการรีเซ็ตรหัสผ่านเมื่อผู้ใช้ลืมรหัสผ่าน<br/>
            คำตอบจะถูกแปลงเป็นตัวพิมพ์เล็กและไม่สนใจช่องว่าง ต้องมีอย่างน้อย 2 ตัวอักษร
          </div>
        </div>
      </div>

      {/* คำถามข้อ 1 */}
      <div style={styles.questionSection}>
        <div style={styles.questionHeader}>
          <FontAwesomeIcon icon={faShieldAlt} />
          คำถามความปลอดภัยข้อ 1
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>เลือกคำถาม:</label>
          <select
            value={formData.securityQuestion1}
            onChange={(e) => handleInputChange('securityQuestion1', e.target.value)}
            style={getSelectStyle(validation.isQuestion1Valid, formData.securityQuestion1.length > 0)}
          >
            <option value="">-- เลือกคำถาม --</option>
            {securityQuestions.map((question, index) => (
              <option 
                key={index} 
                value={question}
                disabled={question === formData.securityQuestion2}
              >
                {question}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>คำตอบ:</label>
          <div style={styles.passwordField}>
            <input
              type={showAnswer1 ? "text" : "password"}
              value={formData.securityAnswer1}
              onChange={(e) => handleInputChange('securityAnswer1', e.target.value)}
              style={getInputStyle(validation.isAnswer1Valid, formData.securityAnswer1.length > 0)}
              placeholder="คำตอบของคุณ (อย่างน้อย 2 ตัวอักษร)"
              disabled={!validation.isQuestion1Valid}
            />
            <button
              type="button"
              onClick={() => setShowAnswer1(!showAnswer1)}
              style={styles.eyeButton}
              onMouseOver={(e) => e.target.style.color = '#ffffff'}
              onMouseOut={(e) => e.target.style.color = '#6c757d'}
            >
              <FontAwesomeIcon icon={showAnswer1 ? faEyeSlash : faEye} />
            </button>
          </div>
          
          {formData.securityAnswer1 && (
            <div style={styles.validationList}>
              <div style={{
                ...styles.validationItem,
                ...(validation.isAnswer1Valid ? styles.validationItemValid : styles.validationItemInvalid)
              }}>
                <FontAwesomeIcon 
                  icon={validation.isAnswer1Valid ? faCheck : faExclamationTriangle} 
                  size="sm"
                />
                ความยาวคำตอบ: {formData.securityAnswer1.length}/2 ตัวอักษร
              </div>
            </div>
          )}

          {errors.securityAnswer1 && (
            <span style={styles.error}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              {errors.securityAnswer1}
            </span>
          )}
        </div>
      </div>

      {/* คำถามข้อ 2 */}
      <div style={styles.questionSection}>
        <div style={styles.questionHeader}>
          <FontAwesomeIcon icon={faShieldAlt} />
          คำถามความปลอดภัยข้อ 2
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>เลือกคำถาม:</label>
          <select
            value={formData.securityQuestion2}
            onChange={(e) => handleInputChange('securityQuestion2', e.target.value)}
            style={getSelectStyle(validation.isQuestion2Valid, formData.securityQuestion2.length > 0, validation.isDuplicateQuestions)}
          >
            <option value="">-- เลือกคำถาม --</option>
            {securityQuestions.map((question, index) => (
              <option 
                key={index} 
                value={question}
                disabled={question === formData.securityQuestion1}
              >
                {question}
              </option>
            ))}
          </select>
          
          {validation.isDuplicateQuestions && (
            <div style={styles.validationList}>
              <div style={{...styles.validationItem, ...styles.validationItemError}}>
                <FontAwesomeIcon icon={faExclamationTriangle} size="sm" />
                ไม่สามารถเลือกคำถามเดียวกันได้
              </div>
            </div>
          )}

          {errors.securityQuestion2 && (
            <span style={styles.error}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              {errors.securityQuestion2}
            </span>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>คำตอบ:</label>
          <div style={styles.passwordField}>
            <input
              type={showAnswer2 ? "text" : "password"}
              value={formData.securityAnswer2}
              onChange={(e) => handleInputChange('securityAnswer2', e.target.value)}
              style={getInputStyle(validation.isAnswer2Valid, formData.securityAnswer2.length > 0)}
              placeholder="คำตอบของคุณ (อย่างน้อย 2 ตัวอักษร)"
              disabled={!validation.isQuestion2Valid || validation.isDuplicateQuestions}
            />
            <button
              type="button"
              onClick={() => setShowAnswer2(!showAnswer2)}
              style={styles.eyeButton}
              onMouseOver={(e) => e.target.style.color = '#ffffff'}
              onMouseOut={(e) => e.target.style.color = '#6c757d'}
            >
              <FontAwesomeIcon icon={showAnswer2 ? faEyeSlash : faEye} />
            </button>
          </div>

          {formData.securityAnswer2 && (
            <div style={styles.validationList}>
              <div style={{
                ...styles.validationItem,
                ...(validation.isAnswer2Valid ? styles.validationItemValid : styles.validationItemInvalid)
              }}>
                <FontAwesomeIcon 
                  icon={validation.isAnswer2Valid ? faCheck : faExclamationTriangle} 
                  size="sm"
                />
                ความยาวคำตอบ: {formData.securityAnswer2.length}/2 ตัวอักษร
              </div>
            </div>
          )}

          {errors.securityAnswer2 && (
            <span style={styles.error}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              {errors.securityAnswer2}
            </span>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: '30px' }}>
        <button
          onClick={handleSaveClick}
          disabled={loading || !validation.isFormValid}
          style={{
            ...styles.saveButton,
            ...(loading || !validation.isFormValid ? styles.saveButtonDisabled : {})
          }}
          onMouseOver={(e) => {
            if (!loading && validation.isFormValid) {
              e.target.style.backgroundColor = '#218838';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading && validation.isFormValid) {
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
              บันทึกคำถาม
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
              ยืนยันการบันทึกคำถามความปลอดภัย
            </h4>
            <p style={styles.confirmDialogText}>
              คุณแน่ใจหรือไม่ที่จะอัปเดตคำถามความปลอดภัย?<br/>
              คำถามเหล่านี้จะใช้สำหรับการรีเซ็ตรหัสผ่านในอนาคต
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
                ยืนยันบันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}