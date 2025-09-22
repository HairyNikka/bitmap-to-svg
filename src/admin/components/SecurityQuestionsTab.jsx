// src/admin/components/modals/EditUserModal/SecurityQuestionsTab.jsx - Improved version
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faShieldAlt, 
  faEye, 
  faEyeSlash,
  faSpinner,
  faExclamationTriangle,
  faSync,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

export default function SecurityQuestionsTab({ 
  user, 
  currentUser, 
  loading, 
  setLoading, 
  showError, 
  showSuccess 
}) {
  // State สำหรับคำถามความปลอดภัย
  const [securityData, setSecurityData] = useState({
    question_1: '',
    answer_1: '',
    question_2: '',
    answer_2: '',
    show_answer_1: false,
    show_answer_2: false
  });

  const [predefinedQuestions, setPredefinedQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Memoized validation
  const validation = useMemo(() => {
    const { question_1, answer_1, question_2, answer_2 } = securityData;
    
    return {
      isQuestion1Valid: question_1.length > 0,
      isAnswer1Valid: answer_1.length >= 2,
      isQuestion2Valid: question_2.length > 0,
      isAnswer2Valid: answer_2.length >= 2,
      isDuplicateQuestions: question_1 && question_2 && question_1 === question_2,
      isFormValid: question_1 && answer_1.length >= 2 && question_2 && answer_2.length >= 2 && question_1 !== question_2
    };
  }, [securityData]);

  // Debounced input handlers
  const handleSecurityDataChange = useCallback((field, value) => {
    setSecurityData(prev => ({ ...prev, [field]: value }));
  }, []);

  // ดึงข้อมูลเมื่อเปิด tab
  useEffect(() => {
    fetchSecurityQuestions();
    fetchPredefinedQuestions();
  }, []);

  const fetchSecurityQuestions = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('ไม่พบ authentication token');
      }

      const response = await axios.get(
        `http://localhost:8000/api/accounts/admin/users/${user.id}/security-questions/`, 
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        }
      );
      
      setSecurityData(prev => ({
        ...prev,
        question_1: response.data.security_question_1 || '',
        answer_1: response.data.security_answer_1 || '',
        question_2: response.data.security_question_2 || '',
        answer_2: response.data.security_answer_2 || ''
      }));
    } catch (error) {
      console.error('Failed to fetch security questions:', error);
      if (retryCount < 2) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchSecurityQuestions();
        }, 2000);
      }
    }
  };

  const fetchPredefinedQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const response = await axios.get(
        'http://localhost:8000/api/accounts/security-questions/',
        { timeout: 8000 }
      );
      setPredefinedQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Failed to fetch predefined questions:', error);
      // Fallback questions
      setPredefinedQuestions([
        'ชื่อสัตว์เลี้ยงตัวแรกของคุณคืออะไร?',
        'ชื่อโรงเรียนประถมของคุณคืออะไร?',
        'ชื่อเล่นของคุณตอนเด็กคืออะไร?',
        'เมืองที่คุณเกิดคืออะไร?',
        'ชื่อเพื่อนสนิทคนแรกของคุณคืออะไร?'
      ]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  // ฟังก์ชันบันทึกคำถามความปลอดภัย
  const handleSaveClick = () => {
    setShowConfirmDialog(true);
  };

  const handleSave = async () => {
    if (!validation.isFormValid) return;

    setShowConfirmDialog(false);
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('ไม่พบ authentication token');
      }

      await axios.put(
        `http://localhost:8000/api/accounts/admin/users/${user.id}/security-questions/update/`, 
        {
          security_question_1: securityData.question_1,
          security_answer_1: securityData.answer_1.trim().toLowerCase(),
          security_question_2: securityData.question_2,
          security_answer_2: securityData.answer_2.trim().toLowerCase()
        }, 
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );

      showSuccess('บันทึกคำถามความปลอดภัยสำเร็จ');
    } catch (error) {
      console.error('Security questions update error:', error);
      
      if (error.code === 'NETWORK_ERROR') {
        showError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      } else if (error.response?.status === 429) {
        showError('คุณพยายามอัปเดตบ่อยเกินไป กรุณารอสักครู่');
      } else if (error.response?.status === 400) {
        showError(error.response.data?.error || 'ข้อมูลคำถามไม่ถูกต้อง');
      } else if (error.response?.status === 403) {
        showError('คุณไม่มีสิทธิ์แก้ไขคำถามความปลอดภัยของผู้ใช้นี้');
      } else {
        showError('เกิดข้อผิดพลาดในการบันทึกคำถาม กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  // Styles with improved design
  const styles = {
    formGroup: {
      marginBottom: '24px'
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
      transition: 'all 0.3s ease'
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
      minWidth: '180px',
      justifyContent: 'center'
    },
    saveButtonDisabled: {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed',
      opacity: 0.7
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
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      padding: '20px',
      color: '#a0a0a0'
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

  // Get input style based on validation
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

  if (questionsLoading) {
    return (
      <div style={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin />
        <span>กำลังโหลดคำถามความปลอดภัย...</span>
      </div>
    );
  }

  return (
    <div>
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
            value={securityData.question_1}
            onChange={(e) => handleSecurityDataChange('question_1', e.target.value)}
            style={getSelectStyle(validation.isQuestion1Valid, securityData.question_1.length > 0)}
          >
            <option value="">-- เลือกคำถาม --</option>
            {predefinedQuestions.map((q, index) => (
              <option 
                key={index} 
                value={q}
                disabled={q === securityData.question_2}
              >
                {q}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>คำตอบ:</label>
          <div style={styles.passwordField}>
            <input
              type={securityData.show_answer_1 ? "text" : "password"}
              value={securityData.answer_1}
              onChange={(e) => handleSecurityDataChange('answer_1', e.target.value)}
              style={getInputStyle(validation.isAnswer1Valid, securityData.answer_1.length > 0)}
              placeholder="คำตอบของคุณ (อย่างน้อย 2 ตัวอักษร)"
              disabled={!validation.isQuestion1Valid}
            />
            <button
              type="button"
              onClick={() => setSecurityData(prev => ({...prev, show_answer_1: !prev.show_answer_1}))}
              style={styles.eyeButton}
              onMouseOver={(e) => e.target.style.color = '#ffffff'}
              onMouseOut={(e) => e.target.style.color = '#6c757d'}
            >
              <FontAwesomeIcon icon={securityData.show_answer_1 ? faEyeSlash : faEye} />
            </button>
          </div>
          
          {securityData.answer_1 && (
            <div style={styles.validationList}>
              <div style={{
                ...styles.validationItem,
                ...(validation.isAnswer1Valid ? styles.validationItemValid : styles.validationItemInvalid)
              }}>
                <FontAwesomeIcon 
                  icon={validation.isAnswer1Valid ? faCheck : faExclamationTriangle} 
                  size="sm"
                />
                ความยาวคำตอบ: {securityData.answer_1.length}/2 ตัวอักษร
              </div>
            </div>
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
            value={securityData.question_2}
            onChange={(e) => handleSecurityDataChange('question_2', e.target.value)}
            style={getSelectStyle(validation.isQuestion2Valid, securityData.question_2.length > 0, validation.isDuplicateQuestions)}
          >
            <option value="">-- เลือกคำถาม --</option>
            {predefinedQuestions.map((q, index) => (
              <option 
                key={index} 
                value={q}
                disabled={q === securityData.question_1}
              >
                {q}
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
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>คำตอบ:</label>
          <div style={styles.passwordField}>
            <input
              type={securityData.show_answer_2 ? "text" : "password"}
              value={securityData.answer_2}
              onChange={(e) => handleSecurityDataChange('answer_2', e.target.value)}
              style={getInputStyle(validation.isAnswer2Valid, securityData.answer_2.length > 0)}
              placeholder="คำตอบของคุณ (อย่างน้อย 2 ตัวอักษร)"
              disabled={!validation.isQuestion2Valid || validation.isDuplicateQuestions}
            />
            <button
              type="button"
              onClick={() => setSecurityData(prev => ({...prev, show_answer_2: !prev.show_answer_2}))}
              style={styles.eyeButton}
              onMouseOver={(e) => e.target.style.color = '#ffffff'}
              onMouseOut={(e) => e.target.style.color = '#6c757d'}
            >
              <FontAwesomeIcon icon={securityData.show_answer_2 ? faEyeSlash : faEye} />
            </button>
          </div>

          {securityData.answer_2 && (
            <div style={styles.validationList}>
              <div style={{
                ...styles.validationItem,
                ...(validation.isAnswer2Valid ? styles.validationItemValid : styles.validationItemInvalid)
              }}>
                <FontAwesomeIcon 
                  icon={validation.isAnswer2Valid ? faCheck : faExclamationTriangle} 
                  size="sm"
                />
                ความยาวคำตอบ: {securityData.answer_2.length}/2 ตัวอักษร
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ปุ่มบันทึก */}
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
              คุณแน่ใจหรือไม่ที่จะอัปเดตคำถามความปลอดภัยของ <strong>{user.username}</strong>?<br/>
              คำถามเหล่านี้จะใช้สำหรับการรีเซ็ตรหัสผ่านในอนาคต
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
                ยืนยันบันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}