import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const SecurityForm = ({ formData, errors, securityQuestions, handleInputChange }) => {
  const [showAnswer1, setShowAnswer1] = useState(false);
  const [showAnswer2, setShowAnswer2] = useState(false);

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
    select: {
      width: '100%',
      padding: '10px 12px',
      backgroundColor: '#374151',
      border: '1px solid #404040',
      borderRadius: '6px',
      color: 'white',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box',
      cursor: 'pointer'
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
    description: {
      fontSize: '12px',
      color: '#9ca3af',
      marginBottom: '16px',
      lineHeight: '1.4'
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
        <FontAwesomeIcon icon={faQuestionCircle} style={styles.sectionIcon} />
        คำถามความปลอดภัย
      </h4>
      
      <p style={styles.description}>
        คำถามความปลอดภัยใช้สำหรับการกู้คืนรหัสผ่าน กรุณาเลือกคำถามและตอบที่คุณจำได้แน่นอน
      </p>
      
      <div style={styles.field}>
        <label style={styles.label}>คำถามข้อ 1</label>
        <select
          value={formData.securityQuestion1}
          onChange={(e) => handleInputChange('securityQuestion1', e.target.value)}
          style={{
            ...styles.select,
            ...(errors.securityQuestion1 ? styles.inputError : {})
          }}
        >
          <option value="">เลือกคำถาม</option>
          {securityQuestions.map((question, index) => (
            <option key={index} value={question}>
              {question}
            </option>
          ))}
        </select>
        {errors.securityQuestion1 && <span style={styles.error}>{errors.securityQuestion1}</span>}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>คำตอบข้อ 1</label>
        <div style={styles.inputContainer}>
          <input
            type={showAnswer1 ? 'text' : 'password'}
            value={formData.securityAnswer1}
            onChange={(e) => handleInputChange('securityAnswer1', e.target.value)}
            style={{
              ...styles.input,
              ...styles.passwordInput,
              ...(errors.securityAnswer1 ? styles.inputError : {})
            }}
            placeholder="กรอกคำตอบ (ตัวพิมพ์เล็ก-ใหญ่ไม่สำคัญ)"
            disabled={!formData.securityQuestion1}
          />
          <button
            type="button"
            onClick={() => setShowAnswer1(!showAnswer1)}
            style={styles.eyeButton}
            disabled={!formData.securityAnswer1}
            onMouseEnter={(e) => e.target.style.color = '#ffffff'}
            onMouseLeave={(e) => e.target.style.color = '#6c757d'}
          >
            <FontAwesomeIcon icon={showAnswer1 ? faEyeSlash : faEye} />
          </button>
        </div>
        {errors.securityAnswer1 && <span style={styles.error}>{errors.securityAnswer1}</span>}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>คำถามข้อ 2</label>
        <select
          value={formData.securityQuestion2}
          onChange={(e) => handleInputChange('securityQuestion2', e.target.value)}
          style={{
            ...styles.select,
            ...(errors.securityQuestion2 ? styles.inputError : {})
          }}
        >
          <option value="">เลือกคำถาม</option>
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
        {errors.securityQuestion2 && <span style={styles.error}>{errors.securityQuestion2}</span>}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>คำตอบข้อ 2</label>
        <div style={styles.inputContainer}>
          <input
            type={showAnswer2 ? 'text' : 'password'}
            value={formData.securityAnswer2}
            onChange={(e) => handleInputChange('securityAnswer2', e.target.value)}
            style={{
              ...styles.input,
              ...styles.passwordInput,
              ...(errors.securityAnswer2 ? styles.inputError : {})
            }}
            placeholder="กรอกคำตอบ (ตัวพิมพ์เล็ก-ใหญ่ไม่สำคัญ)"
            disabled={!formData.securityQuestion2}
          />
          <button
            type="button"
            onClick={() => setShowAnswer2(!showAnswer2)}
            style={styles.eyeButton}
            disabled={!formData.securityAnswer2}
            onMouseEnter={(e) => e.target.style.color = '#ffffff'}
            onMouseLeave={(e) => e.target.style.color = '#6c757d'}
          >
            <FontAwesomeIcon icon={showAnswer2 ? faEyeSlash : faEye} />
          </button>
        </div>
        {errors.securityAnswer2 && <span style={styles.error}>{errors.securityAnswer2}</span>}
      </div>
    </div>
  );
};

export default SecurityForm;