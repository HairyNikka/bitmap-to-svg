import { useState, useEffect } from 'react';
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

  // Initialize form data when userData changes
  useEffect(() => {
  const loadUserProfile = async () => {
    if (userData) {
      // ลองโหลดข้อมูลจาก API ใหม่
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('http://localhost:8000/api/accounts/user/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const fullUserData = response.data;
        console.log("Full user data from API:", fullUserData);
        
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
        // fallback to userData
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

  // Fetch security questions on mount
  useEffect(() => {
    fetchSecurityQuestions();
  }, []);

  // เมื่อ securityQuestions โหลดเสร็จ ให้ตรวจสอบว่าคำถามเก่าตรงกับใน list ไหม
  useEffect(() => {
        console.log("=== DEBUG SECURITY QUESTIONS ===");
    if (securityQuestions.length > 0 && userData) {
      const question1 = userData.security_question_1;
      const question2 = userData.security_question_2;

        console.log("question1 from userData:", question1);
        console.log("question2 from userData:", question2);
        console.log("questions list:", securityQuestions);
      
      // ถ้าคำถามเก่าไม่อยู่ใน list ให้เพิ่มเข้าไป
      const updatedQuestions = [...securityQuestions];
      
      if (question1 && !securityQuestions.includes(question1)) {
        console.log("Adding question1 to list");
        updatedQuestions.push(question1);
      }
      if (question2 && !securityQuestions.includes(question2)) {
        console.log("Adding question2 to list");
        updatedQuestions.push(question2);
      }
      
      console.log("final questions list:", updatedQuestions);
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
      setSecurityQuestions([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    // Password validation (only if changing password)
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'กรุณากรอกรหัสผ่านปัจจุบัน';
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
      }
    }

    // Security questions validation
    if (formData.securityQuestion1 && !formData.securityAnswer1) {
      newErrors.securityAnswer1 = 'กรุณากรอกคำตอบคำถามข้อ 1';
    }
    if (formData.securityQuestion2 && !formData.securityAnswer2) {
      newErrors.securityAnswer2 = 'กรุณากรอกคำตอบคำถามข้อ 2';
    }

    // Security questions should be different
    if (formData.securityQuestion1 && 
        formData.securityQuestion2 && 
        formData.securityQuestion1 === formData.securityQuestion2) {
      newErrors.securityQuestion2 = 'คำถามข้อ 2 ต้องแตกต่างจากข้อ 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitProfile = async () => {
    if (!validateForm()) return false;

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const updateData = {
        email: formData.email
      };

      // Add password data if changing password
      if (formData.newPassword) {
        updateData.current_password = formData.currentPassword;
        updateData.new_password = formData.newPassword;
      }

      // Add security questions if provided
      if (formData.securityQuestion1 && formData.securityAnswer1) {
        updateData.security_question_1 = formData.securityQuestion1;
        updateData.security_answer_1 = formData.securityAnswer1;
      }
      if (formData.securityQuestion2 && formData.securityAnswer2) {
        updateData.security_question_2 = formData.securityQuestion2;
        updateData.security_answer_2 = formData.securityAnswer2;
      }

      // TODO: Replace with actual API endpoint when backend is ready
      await axios.put('http://localhost:8000/api/accounts/profile/', updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Reset password fields after successful update
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      onUpdate(); // Refresh user data
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      
      // Handle specific error responses
      if (error.response?.status === 400) {
        setErrors({ general: error.response.data.error || 'ข้อมูลไม่ถูกต้อง' });
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
  };

  return {
    formData,
    loading,
    errors,
    securityQuestions,
    handleInputChange,
    validateForm,
    submitProfile,
    resetForm
  };
};

export default useProfileForm;