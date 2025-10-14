import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faEye, 
  faEyeSlash,
  faUserPlus,
  faCheck,
  faExclamation,
  faShield,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import SecurityQuestionsSetup from './SecurityQuestionsSetup';

export default function Register() {
  // Basic form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Enhanced states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [securityQuestions, setSecurityQuestions] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({}); // เพิ่ม state เช็คว่าผู้ใช้แตะ field แล้วหรือยัง
  const [emailChecking, setEmailChecking] = useState(false);  
  const [usernameChecking, setUsernameChecking] = useState(false);  
  const [emailAvailable, setEmailAvailable] = useState(null);  
  const [usernameAvailable, setUsernameAvailable] = useState(null);  

  const navigate = useNavigate();

  // useEffect สำหรับ auto-validation เมื่อ state เปลี่ยน (แต่เฉพาะที่ผู้ใช้แตะแล้ว)
  useEffect(() => {
    // ตรวจสอบเฉพาะ field ที่ผู้ใช้แตะแล้ว
    if (Object.keys(touched).length > 0) {
      validateBasicForm();
    }
  }, [username, email, password, confirmPassword, touched]);

  // Email availability check
  useEffect(() => {
    const checkEmail = setTimeout(async () => {
      if (email && touched.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailChecking(true);
        try {
          const response = await fetch(`http://localhost:8000/api/accounts/check-email/?email=${email}`);
          const data = await response.json();
          setEmailAvailable(data.available);
          
          if (!data.available) {
            setErrors(prev => ({...prev, email: 'อีเมลนี้มีผู้ใช้งานแล้ว'}));
          } else if (errors.email === 'อีเมลนี้มีผู้ใช้งานแล้ว') {
            // ลบ error ถ้าอีเมลใช้ได้แล้ว
            const newErrors = {...errors};
            delete newErrors.email;
            setErrors(newErrors);
          }
        } catch (error) {
          console.error('Email check failed:', error);
        } finally {
          setEmailChecking(false);
        }
      }
    }, 500); // debounce 500ms
  
    return () => clearTimeout(checkEmail);
  }, [email, touched.email]);

  // Username availability check
useEffect(() => {
  const checkUsername = setTimeout(async () => {
    if (username && touched.username && username.length >= 3) {
      setUsernameChecking(true);
      try {
        const response = await fetch(`http://localhost:8000/api/accounts/check-username/?username=${username}`);
        const data = await response.json();
        setUsernameAvailable(data.available);
        
        if (!data.available) {
          setErrors(prev => ({...prev, username: 'ชื่อผู้ใช้นี้มีผู้ใช้งานแล้ว'}));
        } else if (errors.username === 'ชื่อผู้ใช้นี้มีผู้ใช้งานแล้ว') {
          // ลบ error ถ้า username ใช้ได้แล้ว
          const newErrors = {...errors};
          delete newErrors.username;
          setErrors(newErrors);
        }
      } catch (error) {
        console.error('Username check failed:', error);
      } finally {
        setUsernameChecking(false);
      }
    }
  }, 500); // debounce 500ms
  
  return () => clearTimeout(checkUsername);
}, [username, touched.username]);

  // Real-time validation
  const validateBasicForm = () => {
    const newErrors = {};

    // Debug logging
    console.log('Password:', password);
    console.log('Confirm Password:', confirmPassword);
    console.log('Password length:', password.length);
    console.log('Are passwords equal?', password === confirmPassword);

    // ตรวจสอบเฉพาะ field ที่ผู้ใช้แตะแล้ว
    if (touched.username && username.length < 3) {
      newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (touched.email && !emailRegex.test(email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (touched.password && password.length < 8) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    }

    if (touched.confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    console.log('New Errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateBasicForm()) {
      setCurrentStep(2);
    }
  };

  const handleSecurityQuestionsComplete = (questionsData) => {
    setSecurityQuestions(questionsData);
    handleFinalSubmit(questionsData);
  };

  const handleFinalSubmit = async (questionsData) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/accounts/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          email, 
          password, 
          confirm_password: confirmPassword,
          ...questionsData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('สมัครสมาชิกสำเร็จ! กำลังเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ...');
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        if (data.username) {
          setError(data.username[0]);
        } else if (data.email) {
          setError(data.email[0]);
        } else if (data.password) {
          setError(data.password[0]);
        } else if (data.confirm_password) {
          setError(data.confirm_password[0]);
        } else if (data.error) {
          setError(data.error);
        } else {
          setError('เกิดข้อผิดพลาดในการสมัครสมาชิก');
        }
        setCurrentStep(1);
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
      console.error('Register error:', err);
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityQuestionsSkip = () => {
    // สำหรับกรณีที่อนุญาตให้ข้าม (ถ้า backend รองรับ)
    handleFinalSubmit({});
  };

  const spinnerKeyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
      }
  `;


  if (success) {
    return (
      <div style={styles.container}>
        <style>{spinnerKeyframes}</style>
        <div style={styles.card}>
          <div style={styles.successContainer}>
            <FontAwesomeIcon icon={faCheck} style={styles.successIcon} />
            <h2 style={styles.successTitle}>สมัครสมาชิกสำเร็จ!</h2>
            <p style={styles.successText}>{success}</p>
          </div>
        </div>
      </div>
    );
  }

  return (

    <div style={styles.container}>
            <Link to="/" style={styles.homeLink}>
              <FontAwesomeIcon icon={faImage} style={styles.backIcon} />
              กลับหน้าแปลงภาพ
            </Link>

      <div style={styles.card}>
        {/* Progress Steps */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${(currentStep / 2) * 100}%`
              }}
            />
          </div>
          <div style={styles.stepLabels}>
            <span style={{
              ...styles.stepLabel,
              ...(currentStep >= 1 && styles.stepLabelActive)
            }}>
              ข้อมูลบัญชี
            </span>
            <span style={{
              ...styles.stepLabel,
              ...(currentStep >= 2 && styles.stepLabelActive)
            }}>
              คำถามความปลอดภัย
            </span>
          </div>
        </div>

        <h1 style={styles.title}>
          <FontAwesomeIcon icon={faUserPlus} style={styles.titleIcon} />
          สมัครสมาชิก
        </h1>

        {error && (
          <div style={styles.errorAlert}>
            <FontAwesomeIcon icon={faExclamation} style={styles.alertIcon} />
            {error}
          </div>
        )}

        {currentStep === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
            {/* Username Field */}
            <div style={styles.inputGroup}>
              <div style={styles.inputContainer}>
                <FontAwesomeIcon icon={faUser} style={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="ชื่อผู้ใช้"
                  value={username}
                  onFocus={() => setTouched(prev => ({...prev, username: true}))}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    // เอา validateBasicForm() ออก - ให้ useEffect จัดการ
                  }}
                  required
                  disabled={loading}
                  style={{
                    ...styles.input,
                    ...(errors.username && styles.inputError),
                    ...(loading && { opacity: 0.7 })
                  }}
                />
              </div>
              {errors.username && (
                <div style={styles.errorText}>
                  <FontAwesomeIcon icon={faExclamation} style={styles.errorIcon} />
                  {errors.username}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div style={styles.inputGroup}>
              <div style={styles.inputContainer}>
                <FontAwesomeIcon icon={faEnvelope} style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="อีเมล"
                  value={email}
                  onFocus={() => setTouched(prev => ({...prev, email: true}))}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  required
                  disabled={loading}
                  style={{
                    ...styles.input,
                    ...(errors.email && styles.inputError),
                    ...(loading && { opacity: 0.7 })
                  }}
                />
              </div>
              {errors.email && (
                <div style={styles.errorText}>
                  <FontAwesomeIcon icon={faExclamation} style={styles.errorIcon} />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div style={styles.inputGroup}>
              <div style={styles.inputContainer}>
                <FontAwesomeIcon icon={faLock} style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
                  value={password}
                  onFocus={() => setTouched(prev => ({...prev, password: true}))}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  required
                  disabled={loading}
                  minLength="8"
                  style={{
                    ...styles.input,
                    ...(errors.password && styles.inputError),
                    ...(loading && { opacity: 0.7 })
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>

              
              {errors.password && (
                <div style={styles.errorText}>
                  <FontAwesomeIcon icon={faExclamation} style={styles.errorIcon} />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div style={styles.inputGroup}>
              <div style={styles.inputContainer}>
                <FontAwesomeIcon icon={faLock} style={styles.inputIcon} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="ยืนยันรหัสผ่าน"
                  value={confirmPassword}
                  onFocus={() => setTouched(prev => ({...prev, confirmPassword: true}))}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    // เอา setTimeout ออก - ให้ useEffect จัดการ
                  }}
                  required
                  disabled={loading}
                  style={{
                    ...styles.input,
                    ...(errors.confirmPassword && styles.inputError),
                    ...(loading && { opacity: 0.7 })
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
                {confirmPassword && password && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: password === confirmPassword ? 
                      'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                    border: password === confirmPassword ?
                      '1px solid #28a745' : '1px solid #dc3545',
                    color: password === confirmPassword ? '#28a745' : '#dc3545'
                  }}>
                    <FontAwesomeIcon icon={password === confirmPassword ? faCheck : faExclamation} />
                    {password === confirmPassword ? 'รหัสผ่านตรงกัน' : 'รหัสผ่านไม่ตรงกัน'}
                  </div>
                )}
                
                {errors.confirmPassword && (
                  <div style={styles.errorText}>
                    <FontAwesomeIcon icon={faExclamation} style={styles.errorIcon} />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={
                  loading || 
                  Object.keys(errors).length > 0 || 
                  !username || 
                  !email || 
                  !password || 
                  !confirmPassword ||
                  usernameChecking ||
                  emailChecking ||
                  usernameAvailable === false ||
                  emailAvailable === false
                }
                style={{
                  ...styles.button,
                  ...(
                    Object.keys(errors).length === 0 && 
                    username && 
                    email && 
                    password && 
                    confirmPassword &&
                    !usernameChecking &&
                    !emailChecking &&
                    usernameAvailable !== false &&
                    emailAvailable !== false
                      ? styles.buttonActive 
                      : styles.buttonDisabled
                  )
                }}
              >
                {(usernameChecking || emailChecking) ? (
                  <>
                    <div style={styles.spinner}></div>
                    กำลังตรวจสอบ...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faShield} style={styles.buttonIcon} />
                    ต่อไป - ตั้งคำถามความปลอดภัย
                  </>
                )}
              </button>
          </form>
        ) : (
          <SecurityQuestionsSetup
            onComplete={handleSecurityQuestionsComplete}
            onSkip={handleSecurityQuestionsSkip}
          />
        )}

        {currentStep === 1 && (
          <div style={styles.linksContainer}>
            <p style={{ color: '#a0a0a0', margin: '0 0 8px 0', fontSize: '14px' }}>
              มีบัญชีอยู่แล้ว?{' '}
              <Link 
                to="/login" 
                style={styles.link}
                onMouseEnter={(e) => e.target.style.color = '#66b3ff'}
                onMouseLeave={(e) => e.target.style.color = '#007bff'}
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        )}

        {currentStep === 2 && (
          <div style={styles.backButtonContainer}>
            <button
              onClick={() => setCurrentStep(1)}
              style={styles.backButton}
              disabled={loading}
            >
              กลับไปแก้ไขข้อมูลบัญชี
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    border: '1px solid #3a3a3a'
  },
  progressContainer: {
    marginBottom: '30px'
  },
  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#3a3a3a',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '12px'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    transition: 'width 0.3s ease'
  },
  stepLabels: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  stepLabel: {
    fontSize: '12px',
    color: '#6c757d',
    fontWeight: '500'
  },
  stepLabelActive: {
    color: '#4ade80'
  },
  title: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
  titleIcon: {
    color: '#4ade80'
  },
  successContainer: {
    textAlign: 'center',
    padding: '20px'
  },
  successIcon: {
    fontSize: '48px',
    color: '#4ade80',
    marginBottom: '16px'
  },
  successTitle: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '12px'
  },
  successText: {
    color: '#a0a0a0',
    fontSize: '16px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#6c757d',
    fontSize: '14px',
    zIndex: 1
  },
  input: {
    width: '100%',
    padding: '12px 16px 12px 40px',
    backgroundColor: '#3a3a3a',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#3a3a3a',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
  },
  inputError: {
    borderColor: '#ef4444'
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
  errorText: {
    color: '#ef4444',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '6px'
  },
  errorIcon: {
    fontSize: '10px'
  },

  button: {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  buttonActive: {
    backgroundColor: '#4ade80',
    color: '#000000'
  },
  buttonDisabled: {
    backgroundColor: '#4a4a4a',
    color: '#9ca3af',
    cursor: 'not-allowed'
  },
  buttonIcon: {
    fontSize: '14px'
  },
  errorAlert: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  alertIcon: {
    fontSize: '14px'
  },
  linksContainer: {
    marginTop: '25px',
    textAlign: 'center'
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s ease'
  },
  backButtonContainer: {
    marginTop: '20px',
    textAlign: 'center'
  },
  backButton: {
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #6c757d',
    borderRadius: '8px',
    color: '#6c757d',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  homeLink: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      color: '#a0a0a0',
      textDecoration: 'none',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'color 0.2s ease',
      backgroundColor: 'transparent',
      border: '1px solid #6b7280',
      borderRadius: '8px',
      padding: '8px 16px'
  },
  backIcon: {
      fontSize: '12px'
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
};