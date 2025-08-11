// src/pages/SecurityQuestionsSetup.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShield, faQuestionCircle, faCheck, faExclamation } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const SecurityQuestionsSetup = ({ onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({
    question1: '',
    answer1: '',
    question2: '',
    answer2: ''
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({}); // เพิ่ม touched state
  const [isValid, setIsValid] = useState(false);

  // โหลดรายการคำถามจาก Backend
  useEffect(() => {
    fetchSecurityQuestions();
  }, []);

  // ตรวจสอบความถูกต้องของฟอร์ม (เฉพาะที่ผู้ใช้แตะแล้ว)
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [formData, touched]);

  const fetchSecurityQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/accounts/security-questions/');
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Failed to fetch security questions:', error);
      // Fallback questions ถ้า API ไม่ทำงาน
      setQuestions([
            "สีที่คุณชอบมากที่สุดคืออะไร?",
            "สัตว์ที่คุณชอบมากที่สุดคืออะไร?",
            "ชื่อโรงเรียนประถมของคุณคืออะไร?",
            "ชื่อจังหวัดที่คุณเกิดคืออะไร?",
            "อาหารโปรดของคุณคืออะไร?",
            "ชื่อหนังที่คุณชอบมากที่สุดคืออะไร?",
            "ชื่อเพลงที่คุณชอบมากที่สุดคืออะไร?"
      ]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // ตรวจสอบคำถามข้อ 1 (เฉพาะที่ผู้ใช้แตะแล้ว)
    if (touched.question1 && !formData.question1) {
      newErrors.question1 = 'กรุณาเลือกคำถามข้อ 1';
    }
    if (touched.answer1 && !formData.answer1.trim()) {
      newErrors.answer1 = 'กรุณาตอบคำถามข้อ 1';
    } else if (touched.answer1 && formData.answer1.trim().length < 2) {
      newErrors.answer1 = 'คำตอบต้องมีอย่างน้อย 2 ตัวอักษร';
    }

    // ตรวจสอบคำถามข้อ 2 (เฉพาะที่ผู้ใช้แตะแล้ว)
    if (touched.question2 && !formData.question2) {
      newErrors.question2 = 'กรุณาเลือกคำถามข้อ 2';
    }
    if (touched.answer2 && !formData.answer2.trim()) {
      newErrors.answer2 = 'กรุณาตอบคำถามข้อ 2';
    } else if (touched.answer2 && formData.answer2.trim().length < 2) {
      newErrors.answer2 = 'คำตอบต้องมีอย่างน้อย 2 ตัวอักษร';
    }

    // ตรวจสอบว่าคำถาม 2 ข้อไม่เหมือนกัน (เฉพาะเมื่อเลือกคำถามทั้ง 2 ข้อแล้ว)
    if (formData.question1 && formData.question2 && formData.question1 === formData.question2) {
      newErrors.question2 = 'กรุณาเลือกคำถามที่แตกต่างจากข้อ 1';
    }

    setErrors(newErrors);
    
    // ตรวจสอบว่าข้อมูลครบถ้วนและไม่มี error
    const isFormComplete = formData.question1 && formData.answer1.trim() && 
                          formData.question2 && formData.answer2.trim();
    const hasNoErrors = Object.keys(newErrors).length === 0;
    
    setIsValid(isFormComplete && hasNoErrors);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFocus = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched เมื่อกดส่ง
    setTouched({
      question1: true,
      answer1: true,
      question2: true,
      answer2: true
    });

    // Validate ทั้งหมดก่อนส่ง
    const allErrors = {};
    
    if (!formData.question1) {
      allErrors.question1 = 'กรุณาเลือกคำถามข้อ 1';
    }
    if (!formData.answer1.trim()) {
      allErrors.answer1 = 'กรุณาตอบคำถามข้อ 1';
    } else if (formData.answer1.trim().length < 2) {
      allErrors.answer1 = 'คำตอบต้องมีอย่างน้อย 2 ตัวอักษร';
    }

    if (!formData.question2) {
      allErrors.question2 = 'กรุณาเลือกคำถามข้อ 2';
    }
    if (!formData.answer2.trim()) {
      allErrors.answer2 = 'กรุณาตอบคำถามข้อ 2';
    } else if (formData.answer2.trim().length < 2) {
      allErrors.answer2 = 'คำตอบต้องมีอย่างน้อย 2 ตัวอักษร';
    }

    if (formData.question1 && formData.question2 && formData.question1 === formData.question2) {
      allErrors.question2 = 'กรุณาเลือกคำถามที่แตกต่างจากข้อ 1';
    }

    setErrors(allErrors);

    if (Object.keys(allErrors).length === 0) {
      onComplete({
        security_question_1: formData.question1,
        security_answer_1: formData.answer1.trim(),
        security_question_2: formData.question2,
        security_answer_2: formData.answer2.trim()
      });
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <FontAwesomeIcon icon={faShield} style={styles.loadingIcon} />
          <p style={styles.loadingText}>กำลังโหลดคำถามความปลอดภัย...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <FontAwesomeIcon icon={faShield} style={styles.headerIcon} />
        <h3 style={styles.title}>ตั้งคำถามความปลอดภัย</h3>
        <p style={styles.subtitle}>
          สำหรับรีเซ็ตรหัสผ่านในอนาคต (จำเป็น)
        </p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* คำถามข้อ 1 */}
        <div style={styles.questionGroup}>
          <div style={styles.questionHeader}>
            <FontAwesomeIcon icon={faQuestionCircle} style={styles.questionIcon} />
            <label style={styles.questionLabel}>คำถามข้อ 1</label>
          </div>
          
          <select
            value={formData.question1}
            onFocus={() => handleFocus('question1')}
            onChange={(e) => handleChange('question1', e.target.value)}
            style={{
              ...styles.select,
              borderColor: errors.question1 ? '#ef4444' : '#3a3a3a'
            }}
          >
            <option value="">เลือกคำถาม...</option>
            {questions.map((question, index) => (
              <option key={index} value={question}>{question}</option>
            ))}
          </select>
          {errors.question1 && (
            <div style={styles.errorText}>
              <FontAwesomeIcon icon={faExclamation} style={styles.errorIcon} />
              {errors.question1}
            </div>
          )}

          <input
            type="text"
            placeholder="คำตอบของคุณ..."
            value={formData.answer1}
            onFocus={() => handleFocus('answer1')}
            onChange={(e) => handleChange('answer1', e.target.value)}
            style={{
              ...styles.input,
              borderColor: errors.answer1 ? '#ef4444' : '#3a3a3a'
            }}
          />
          {errors.answer1 && (
            <div style={styles.errorText}>
              <FontAwesomeIcon icon={faExclamation} style={styles.errorIcon} />
              {errors.answer1}
            </div>
          )}
        </div>

        {/* คำถามข้อ 2 */}
        <div style={styles.questionGroup}>
          <div style={styles.questionHeader}>
            <FontAwesomeIcon icon={faQuestionCircle} style={styles.questionIcon} />
            <label style={styles.questionLabel}>คำถามข้อ 2</label>
          </div>
          
          <select
            value={formData.question2}
            onFocus={() => handleFocus('question2')}
            onChange={(e) => handleChange('question2', e.target.value)}
            style={{
              ...styles.select,
              borderColor: errors.question2 ? '#ef4444' : '#3a3a3a'
            }}
          >
            <option value="">เลือกคำถาม...</option>
            {questions.map((question, index) => (
              <option key={index} value={question}>{question}</option>
            ))}
          </select>
          {errors.question2 && (
            <div style={styles.errorText}>
              <FontAwesomeIcon icon={faExclamation} style={styles.errorIcon} />
              {errors.question2}
            </div>
          )}

          <input
            type="text"
            placeholder="คำตอบของคุณ..."
            value={formData.answer2}
            onFocus={() => handleFocus('answer2')}
            onChange={(e) => handleChange('answer2', e.target.value)}
            style={{
              ...styles.input,
              borderColor: errors.answer2 ? '#ef4444' : '#3a3a3a'
            }}
          />
          {errors.answer2 && (
            <div style={styles.errorText}>
              <FontAwesomeIcon icon={faExclamation} style={styles.errorIcon} />
              {errors.answer2}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div style={styles.infoBox}>
          <FontAwesomeIcon icon={faShield} style={styles.infoIcon} />
          <div style={styles.infoText}>
            <strong>หมายเหตุ:</strong> คำตอบจะถูกแปลงเป็นตัวพิมพ์เล็ก<br />
            กรุณาจำคำตอบให้ดี เพื่อใช้ในการรีเซ็ตรหัสผ่าน<br />
            <strong>การกรอกคำถามความปลอดภัยเป็นสิ่งจำเป็น</strong>
          </div>
        </div>

        {/* Submit Button (เอาปุ่มข้ามออก) */}
        <div style={styles.buttonContainer}>
          <button
            type="submit"
            disabled={!isValid}
            style={{
              ...styles.submitButton,
              ...(isValid ? styles.submitButtonActive : styles.submitButtonDisabled)
            }}
          >
            <FontAwesomeIcon icon={faCheck} style={styles.buttonIcon} />
            ตั้งคำถามเรียบร้อย
          </button>
        </div>
      </form>
    </div>
  );
};

// Styles
const styles = {
  container: {
    backgroundColor: '#2a2a2a',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    margin: '0 auto',
    border: '1px solid #3a3a3a'
  },
  
  loadingContainer: {
    textAlign: 'center',
    padding: '40px'
  },
  
  loadingIcon: {
    fontSize: '32px',
    color: '#4ade80',
    marginBottom: '12px'
  },
  
  loadingText: {
    color: '#e0e0e0',
    fontSize: '14px'
  },
  
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  
  headerIcon: {
    fontSize: '28px',
    color: '#4ade80',
    marginBottom: '8px'
  },
  
  title: {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 8px 0'
  },
  
  subtitle: {
    color: '#a0a0a0',
    fontSize: '14px',
    margin: 0
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
    gap: '8px',
    marginBottom: '4px'
  },
  
  questionIcon: {
    color: '#60a5fa',
    fontSize: '14px'
  },
  
  questionLabel: {
    color: '#e0e0e0',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  select: {
    padding: '10px 12px',
    backgroundColor: '#3a3a3a',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#3a3a3a',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    transition: 'border-color 0.2s ease'
  },
  
  input: {
    padding: '10px 12px',
    backgroundColor: '#3a3a3a',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#3a3a3a',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    transition: 'border-color 0.2s ease'
  },
  
  errorText: {
    color: '#ef4444',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '4px'
  },
  
  errorIcon: {
    fontSize: '10px'
  },
  
  infoBox: {
    backgroundColor: '#1e40af',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  
  infoIcon: {
    color: '#93c5fd',
    fontSize: '16px',
    marginTop: '2px'
  },
  
  infoText: {
    color: '#dbeafe',
    fontSize: '12px',
    lineHeight: '1.4'
  },
  
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '8px'
  },
  
  submitButton: {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    width: '100%',
    justifyContent: 'center'
  },
  
  submitButtonActive: {
    backgroundColor: '#4ade80',
    color: '#000000'
  },
  
  submitButtonDisabled: {
    backgroundColor: '#4a4a4a',
    color: '#9ca3af',
    cursor: 'not-allowed'
  },
  
  buttonIcon: {
    fontSize: '12px'
  }
};

export default SecurityQuestionsSetup;