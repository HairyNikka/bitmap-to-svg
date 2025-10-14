// src/pages/SecurityQuestions.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faQuestionCircle, 
  faArrowRight, 
  faArrowLeft,
  faUser,
  faExclamation,
  faCheck,
  faEye,
  faEyeSlash 
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const SecurityQuestions = ({ userData, onAnswersVerified, onBack }) => {
  const [answers, setAnswers] = useState({
    answer_1: '',
    answer_2: ''
  });
  const [showAnswers, setShowAnswers] = useState({
    answer_1: false,
    answer_2: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field, value) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear messages when user types
    if (error) setError('');
    if (success) setSuccess('');
  };

  const toggleShowAnswer = (field) => {
    setShowAnswers(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!answers.answer_1.trim()) {
      setError('กรุณาตอบคำถามข้อ 1');
      return false;
    }
    if (!answers.answer_2.trim()) {
      setError('กรุณาตอบคำถามข้อ 2');
      return false;
    }
    if (answers.answer_1.trim().length < 1) {
      setError('คำตอบข้อ 1 สั้นเกินไป');
      return false;
    }
    if (answers.answer_2.trim().length < 1) {
      setError('คำตอบข้อ 2 สั้นเกินไป');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      user_id: userData.user_id,
      answer_1: answers.answer_1.trim().toLowerCase(),
      answer_2: answers.answer_2.trim().toLowerCase()
    };
    
    console.log('=== DEBUG FRONTEND ===');
    console.log('Payload:', payload);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/accounts/verify-security-answers/',
        payload,
        {
          // 🔧 เพิ่ม withCredentials เพื่อรับ session cookie
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success) {
        setSuccess('คำตอบถูกต้อง! กำลังไปสู่หน้าตั้งรหัสผ่านใหม่...');
        
        // ส่ง reset token ไปยัง parent component
        setTimeout(() => {
          onAnswersVerified({
            reset_token: response.data.reset_token,
            username: userData.username
          });
        }, 1500);
      }

    } catch (error) {
      console.error('Security answers verification error:', error);
      
      if (error.response?.data?.error) {
        setError('คำตอบไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      } else {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = answers.answer_1.trim() && answers.answer_2.trim();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <FontAwesomeIcon icon={faShieldAlt} style={styles.headerIcon} />
          <h2 style={styles.title}>ยืนยันตัวตน</h2>
          <p style={styles.subtitle}>
            ตอบคำถามความปลอดภัยเพื่อรีเซ็ตรหัสผ่าน
          </p>
        </div>

        {/* User Info */}
        <div style={styles.userInfo}>
          <FontAwesomeIcon icon={faUser} style={styles.userIcon} />
          <span style={styles.username}>{userData.username}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Question 1 */}
          <div style={styles.questionGroup}>
            <div style={styles.questionHeader}>
              <FontAwesomeIcon icon={faQuestionCircle} style={styles.questionIcon} />
              <span style={styles.questionNumber}>คำถามข้อ 1</span>
            </div>
            <div style={styles.questionText}>
              {userData.security_questions[0]}
            </div>
            <div style={styles.inputWrapper}>
              <input
                type={showAnswers.answer_1 ? "text" : "password"}
                value={answers.answer_1}
                onChange={(e) => handleChange('answer_1', e.target.value)}
                placeholder="คำตอบของคุณ..."
                style={{
                  ...styles.input,
                  borderColor: error && !answers.answer_1.trim() ? '#ef4444' : '#3a3a3a'
                }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => toggleShowAnswer('answer_1')}
                style={styles.eyeButton}
                disabled={loading}
              >
                <FontAwesomeIcon 
                  icon={showAnswers.answer_1 ? faEyeSlash : faEye} 
                  style={styles.eyeIcon} 
                />
              </button>
            </div>
          </div>

          {/* Question 2 */}
          <div style={styles.questionGroup}>
            <div style={styles.questionHeader}>
              <FontAwesomeIcon icon={faQuestionCircle} style={styles.questionIcon} />
              <span style={styles.questionNumber}>คำถามข้อ 2</span>
            </div>
            <div style={styles.questionText}>
              {userData.security_questions[1]}
            </div>
            <div style={styles.inputWrapper}>
              <input
                type={showAnswers.answer_2 ? "text" : "password"}
                value={answers.answer_2}
                onChange={(e) => handleChange('answer_2', e.target.value)}
                placeholder="คำตอบของคุณ..."
                style={{
                  ...styles.input,
                  borderColor: error && !answers.answer_2.trim() ? '#ef4444' : '#3a3a3a'
                }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => toggleShowAnswer('answer_2')}
                style={styles.eyeButton}
                disabled={loading}
              >
                <FontAwesomeIcon 
                  icon={showAnswers.answer_2 ? faEyeSlash : faEye} 
                  style={styles.eyeIcon} 
                />
              </button>
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
              <FontAwesomeIcon icon={faCheck} style={styles.successIcon} />
              {success}
            </div>
          )}

          {/* Hint Box */}
          <div style={styles.hintBox}>
            <FontAwesomeIcon icon={faShieldAlt} style={styles.hintIcon} />
            <div style={styles.hintText}>
              <strong>คำแนะนำ:</strong> คำตอบจะถูกแปลงเป็นตัวพิมพ์เล็ก<br />
              ไม่ต้องสนใจการเว้นวรรคหรือตัวพิมพ์ใหญ่-เล็ก
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
                  กำลังตรวจสอบ...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faArrowRight} style={styles.buttonIcon} />
                  ยืนยันคำตอบ
                </>
              )}
            </button>
          </div>
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
    maxWidth: '480px',
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
    marginBottom: '20px'
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

  attemptsInfo: {
    backgroundColor: '#f59e0b',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    color: '#ffffff',
    fontSize: '13px'
  },

  blockedWarning: {
    backgroundColor: '#dc2626',
    border: '1px solid #dc2626',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500'
  },

  warningIcon: {
    fontSize: '12px'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },

  questionGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  questionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  questionIcon: {
    color: '#10b981',
    fontSize: '14px'
  },

  questionNumber: {
    color: '#e0e0e0',
    fontSize: '14px',
    fontWeight: '500'
  },

  questionText: {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '400',
    lineHeight: '1.4',
    padding: '8px 0'
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

  hintBox: {
    backgroundColor: '#1e3a8a',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start'
  },

  hintIcon: {
    color: '#93c5fd',
    fontSize: '14px',
    marginTop: '2px'
  },

  hintText: {
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
  }
};

export default SecurityQuestions;