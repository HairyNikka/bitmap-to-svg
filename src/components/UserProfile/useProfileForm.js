// src/pages/UserProfile/useProfileForm.js
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const useProfileForm = (userData, onUpdate) => {
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    securityQuestion1: '',
    securityAnswer1: '',
    securityQuestion2: '',
    securityAnswer2: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  
  const emailCheckTimeout = useRef(null);
  const previousEmail = useRef('');

  // Initialize form data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (userData) {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await axios.get('http://localhost:8000/api/accounts/user/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const fullUserData = response.data;
          previousEmail.current = fullUserData.email; // Store original email
          
          setFormData(prev => ({
            ...prev,
            email: fullUserData.email || '',
            securityQuestion1: fullUserData.security_question_1 || '',
            securityAnswer1: fullUserData.security_answer_1 || '',
            securityQuestion2: fullUserData.security_question_2 || '',
            securityAnswer2: fullUserData.security_answer_2 || ''
          }));
        } catch (error) {
          console.error('Failed to load user profile:', error);
          // Fallback to userData
          previousEmail.current = userData.email;
          setFormData(prev => ({
            ...prev,
            email: userData.email || '',
            securityQuestion1: userData.security_question_1 || '',
            securityAnswer1: userData.security_answer_1 || '',
            securityQuestion2: userData.security_question_2 || '',
            securityAnswer2: userData.security_answer_2 || ''
          }));
        }
      }
    };
    
    loadUserProfile();
  }, [userData]);

  // Fetch security questions
  useEffect(() => {
    fetchSecurityQuestions();
  }, []);

  // Add old questions to list if not present
  useEffect(() => {
    if (securityQuestions.length > 0 && userData) {
      const question1 = userData.security_question_1;
      const question2 = userData.security_question_2;
      
      const updatedQuestions = [...securityQuestions];
      
      if (question1 && !securityQuestions.includes(question1)) {
        updatedQuestions.push(question1);
      }
      if (question2 && !securityQuestions.includes(question2)) {
        updatedQuestions.push(question2);
      }
      
      if (updatedQuestions.length !== securityQuestions.length) {
        setSecurityQuestions(updatedQuestions);
      }
    }
  }, [securityQuestions, userData]);

  const fetchSecurityQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/accounts/security-questions/');
      setSecurityQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Failed to fetch security questions:', error);
      // Fallback questions
      setSecurityQuestions([
        'ชื่อเพลงที่คุณชอบมากที่สุดคืออะไร?',
        'ชื่อหนังที่คุณชอบมากที่สุดคืออะไร?',
        'สีที่คุณชอบมากที่สุดคืออะไร?',
        'เกมโปรดของคุณที่ชอบมากที่สุดคือเกมอะไร?',
        'อาหารโปรดของคุณคืออะไร?'
      ]);
    }
  };

  // Email duplicate check (debounced)
  const checkEmailAvailability = async (email) => {
    // Skip if email is same as original or empty
    if (email === previousEmail.current || !email) {
      setEmailAvailable(null);
      return;
    }

    // Skip if not valid email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailAvailable(null);
      return;
    }

    setEmailChecking(true);
    
    try {
      // Try to check with backend endpoint
      const response = await axios.get(`http://localhost:8000/api/accounts/check-email/`, {
        params: { email }
      });
    
      
      setEmailAvailable(response.data.available);
    } catch (error) {
      // If endpoint doesn't exist, skip real-time check
      // Will validate on submit instead
      console.log('Email check endpoint not available');
      setEmailAvailable(null);
    } finally {
      setEmailChecking(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Real-time email check (debounced)
    if (field === 'email') {
      if (emailCheckTimeout.current) {
        clearTimeout(emailCheckTimeout.current);
      }
      
      emailCheckTimeout.current = setTimeout(() => {
        checkEmailAvailability(value);
      }, 500);
    }
  };

  const validateForm = (section = 'all') => {
    const newErrors = {};

    // Email validation (if section is basic or all)
    if (section === 'basic' || section === 'all') {
      if (!formData.email) {
        newErrors.email = 'กรุณากรอกอีเมล';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
      } else if (emailAvailable === false) {
        newErrors.email = 'อีเมลนี้มีผู้ใช้งานแล้ว';
      }
    }

    // Password validation (if section is password or all)
    if (section === 'password' || section === 'all') {
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          newErrors.currentPassword = 'กรุณากรอกรหัสผ่านปัจจุบัน';
        }
        if (formData.newPassword.length < 8) {
          newErrors.newPassword = 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร';
        }
        if (formData.newPassword !== formData.confirmPassword) {
          newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
        }
      }
    }

    // Security questions validation (if section is security or all)
    if (section === 'security' || section === 'all') {
      if (formData.securityQuestion1 && !formData.securityAnswer1) {
        newErrors.securityAnswer1 = 'กรุณากรอกคำตอบคำถามข้อ 1';
      }
      if (formData.securityAnswer1 && formData.securityAnswer1.length < 2) {
        newErrors.securityAnswer1 = 'คำตอบต้องมีอย่างน้อย 2 ตัวอักษร';
      }
      if (formData.securityQuestion2 && !formData.securityAnswer2) {
        newErrors.securityAnswer2 = 'กรุณากรอกคำตอบคำถามข้อ 2';
      }
      if (formData.securityAnswer2 && formData.securityAnswer2.length < 2) {
        newErrors.securityAnswer2 = 'คำตอบต้องมีอย่างน้อย 2 ตัวอักษร';
      }
      
      // Security questions should be different
      if (formData.securityQuestion1 && 
          formData.securityQuestion2 && 
          formData.securityQuestion1 === formData.securityQuestion2) {
        newErrors.securityQuestion2 = 'คำถามข้อ 2 ต้องแตกต่างจากข้อ 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitProfile = async (section = 'all') => {
    if (!validateForm(section)) return false;

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const updateData = {};

      // Add data based on section
      if (section === 'basic' || section === 'all') {
        updateData.email = formData.email;
      }

      if (section === 'password' || section === 'all') {
        if (formData.newPassword) {
          updateData.current_password = formData.currentPassword;
          updateData.new_password = formData.newPassword;
        }
      }

      if (section === 'security' || section === 'all') {
        if (formData.securityQuestion1 && formData.securityAnswer1) {
          updateData.security_question_1 = formData.securityQuestion1;
          updateData.security_answer_1 = formData.securityAnswer1.trim().toLowerCase();
        }
        if (formData.securityQuestion2 && formData.securityAnswer2) {
          updateData.security_question_2 = formData.securityQuestion2;
          updateData.security_answer_2 = formData.securityAnswer2.trim().toLowerCase();
        }
      }

      await axios.put('http://localhost:8000/api/accounts/profile/', updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Reset password fields after successful update
      if (section === 'password' || section === 'all') {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }

      // Update previous email reference
      if (section === 'basic' || section === 'all') {
        previousEmail.current = formData.email;
      }

      onUpdate(); // Refresh user data
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      
      // Handle specific error responses
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.email) {
          setErrors({ email: 'อีเมลนี้มีผู้ใช้งานแล้ว' });
        } else if (errorData.current_password) {
          setErrors({ currentPassword: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
        } else {
          setErrors({ general: errorData.error || 'ข้อมูลไม่ถูกต้อง' });
        }
      } else if (error.response?.status === 401) {
        setErrors({ general: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
      } else {
        setErrors({ general: 'เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์' });
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: userData?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      securityQuestion1: userData?.security_question_1 || '',
      securityAnswer1: userData?.security_answer_1 || '',
      securityQuestion2: userData?.security_question_2 || '',
      securityAnswer2: userData?.security_answer_2 || ''
    });
    setErrors({});
    setEmailAvailable(null);
    previousEmail.current = userData?.email || '';
  };

  return {
    formData,
    loading,
    errors,
    securityQuestions,
    emailChecking,
    emailAvailable,
    handleInputChange,
    validateForm,
    submitProfile,
    resetForm
  };
};

export default useProfileForm;