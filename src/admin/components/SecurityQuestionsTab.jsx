// src/admin/components/modals/EditUserModal/SecurityQuestionsTab.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faShieldAlt, 
  faEye, 
  faEyeSlash 
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

  // ดึงข้อมูลเมื่อเปิด tab
  useEffect(() => {
    fetchSecurityQuestions();
    fetchPredefinedQuestions();
  }, []);

  const fetchSecurityQuestions = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/accounts/admin/users/${user.id}/security-questions/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSecurityData(prev => ({
        ...prev,
        question_1: response.data.security_question_1 || '',
        answer_1: response.data.security_answer_1 || '',
        question_2: response.data.security_question_2 || '',
        answer_2: response.data.security_answer_2 || ''
      }));
    } catch (error) {
      console.error('Failed to fetch security questions:', error);
    }
  };

  const fetchPredefinedQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/accounts/security-questions/');
      setPredefinedQuestions(response.data.questions);
    } catch (error) {
      console.error('Failed to fetch predefined questions:', error);
    }
  };

  // ฟังก์ชันบันทึกคำถามความปลอดภัย
  const handleSave = async () => {
    if (!securityData.question_1 || !securityData.answer_1 || !securityData.question_2 || !securityData.answer_2) {
      showError('กรุณากรอกคำถามและคำตอบครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/accounts/admin/users/${user.id}/security-questions/update/`, {
        security_question_1: securityData.question_1,
        security_answer_1: securityData.answer_1,
        security_question_2: securityData.question_2,
        security_answer_2: securityData.answer_2
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showSuccess('บันทึกคำถามความปลอดภัยสำเร็จ');
    } catch (error) {
      console.error('Security questions update error:', error);
      showError(error.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกคำถาม');
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
    infoBox: {
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
      border: '1px solid rgba(0, 123, 255, 0.3)',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '20px'
    },
    infoText: {
      color: '#007bff',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  };

  const isFormValid = () => {
    return securityData.question_1 && 
           securityData.answer_1 && 
           securityData.question_2 && 
           securityData.answer_2;
  };

  return (
    <div>
      {/* คำถามข้อ 1 */}
      <div style={styles.formGroup}>
        <label style={styles.label}>คำถามข้อ 1:</label>
        <select
          value={securityData.question_1}
          onChange={(e) => setSecurityData({...securityData, question_1: e.target.value})}
          style={styles.input}
          onFocus={(e) => e.target.style.borderColor = '#007bff'}
          onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
        >
          <option value="">เลือกคำถาม</option>
          {predefinedQuestions.map((q, index) => (
            <option key={index} value={q}>{q}</option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>คำตอบข้อ 1:</label>
        <div style={styles.passwordField}>
          <input
            type={securityData.show_answer_1 ? "text" : "password"}
            value={securityData.answer_1}
            onChange={(e) => setSecurityData({...securityData, answer_1: e.target.value})}
            style={styles.input}
            placeholder="คำตอบของคุณ"
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
          />
          <button
            type="button"
            onClick={() => setSecurityData(prev => ({...prev, show_answer_1: !prev.show_answer_1}))}
            style={styles.eyeButton}
          >
            <FontAwesomeIcon icon={securityData.show_answer_1 ? faEyeSlash : faEye} />
          </button>
        </div>
      </div>

      {/* คำถามข้อ 2 */}
      <div style={styles.formGroup}>
        <label style={styles.label}>คำถามข้อ 2:</label>
        <select
          value={securityData.question_2}
          onChange={(e) => setSecurityData({...securityData, question_2: e.target.value})}
          style={styles.input}
          onFocus={(e) => e.target.style.borderColor = '#007bff'}
          onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
        >
          <option value="">เลือกคำถาม</option>
          {predefinedQuestions.map((q, index) => (
            <option key={index} value={q}>{q}</option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>คำตอบข้อ 2:</label>
        <div style={styles.passwordField}>
          <input
            type={securityData.show_answer_2 ? "text" : "password"}
            value={securityData.answer_2}
            onChange={(e) => setSecurityData({...securityData, answer_2: e.target.value})}
            style={styles.input}
            placeholder="คำตอบของคุณ"
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
          />
          <button
            type="button"
            onClick={() => setSecurityData(prev => ({...prev, show_answer_2: !prev.show_answer_2}))}
            style={styles.eyeButton}
          >
            <FontAwesomeIcon icon={securityData.show_answer_2 ? faEyeSlash : faEye} />
          </button>
        </div>
      </div>

      {/* Info box */}
      <div style={styles.infoBox}>
        <div style={styles.infoText}>
          <FontAwesomeIcon icon={faShieldAlt} />
          <span><strong>หมายเหตุ:</strong> คำตอบจะถูกแปลงเป็นตัวพิมพ์เล็กและไม่สนใจช่องว่าง</span>
        </div>
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
          {loading ? 'กำลังบันทึก...' : 'บันทึกคำถาม'}
        </button>
      </div>
    </div>
  );
}