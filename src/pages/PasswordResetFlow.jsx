// src/pages/PasswordResetFlow.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import SecurityQuestions from './SecurityQuestions';
import ResetPassword from './ResetPassword';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faCircle,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

const PasswordResetFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [flowData, setFlowData] = useState({
    userData: null,    // จาก ForgotPassword
    resetToken: null,  // จาก SecurityQuestions
    username: null     // สำหรับแสดงผล
  });

  // Progress Steps
  const steps = [
    { id: 1, title: 'ค้นหาผู้ใช้', description: 'ป้อนชื่อผู้ใช้หรืออีเมล' },
    { id: 2, title: 'ยืนยันตัวตน', description: 'ตอบคำถามความปลอดภัย' },
    { id: 3, title: 'ตั้งรหัสใหม่', description: 'สร้างรหัสผ่านใหม่' }
  ];

  // Handle user found from ForgotPassword
  const handleUserFound = (userData) => {
    console.log('User found:', userData);
    setFlowData(prev => ({
      ...prev,
      userData,
      username: userData.username
    }));
    setCurrentStep(2);
  };

  // Handle security answers verified
  const handleAnswersVerified = (resetData) => {
    console.log('Answers verified:', resetData);
    setFlowData(prev => ({
      ...prev,
      resetToken: resetData.reset_token,
      username: resetData.username
    }));
    setCurrentStep(3);
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // Back to login if on first step
      navigate('/login');
    }
  };

  // Handle reset complete (from ResetPassword component)
  const handleResetComplete = () => {
    // ResetPassword component handles redirect to login
    // This is just for cleanup if needed
    setFlowData({
      userData: null,
      resetToken: null,
      username: null
    });
    setCurrentStep(1);
  };

  // Render progress indicator
  const renderProgressIndicator = () => (
    <div style={styles.progressContainer}>
      <div style={styles.progressHeader}>
        <h2 style={styles.progressTitle}>รีเซ็ตรหัสผ่าน</h2>
        <p style={styles.progressSubtitle}>
          ขั้นตอนที่ {currentStep} จาก {steps.length}
        </p>
      </div>
      
      <div style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <div key={step.id} style={styles.stepContainer}>
            {/* Step Circle */}
            <div style={styles.stepCircle}>
              <FontAwesomeIcon 
                icon={currentStep > step.id ? faCheckCircle : faCircle}
                style={{
                  ...styles.stepIcon,
                  color: currentStep >= step.id ? '#10b981' : '#6b7280'
                }}
              />
              <span style={{
                ...styles.stepNumber,
                color: currentStep >= step.id ? '#ffffff' : '#6b7280'
              }}>
                {currentStep > step.id ? '✓' : step.id}
              </span>
            </div>
            
            {/* Step Info */}
            <div style={styles.stepInfo}>
              <div style={{
                ...styles.stepTitle,
                color: currentStep >= step.id ? '#ffffff' : '#6b7280'
              }}>
                {step.title}
              </div>
              <div style={styles.stepDescription}>
                {step.description}
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div style={{
                ...styles.connector,
                backgroundColor: currentStep > step.id ? '#10b981' : '#6b7280'
              }} />
            )}
          </div>
        ))}
      </div>
      
      {/* User Info */}
      {flowData.username && (
        <div style={styles.userInfoContainer}>
          <div style={styles.userInfo}>
            👤 <strong>{flowData.username}</strong>
          </div>
        </div>
      )}
    </div>
  );

  // Render current step component
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ForgotPassword 
            onUserFound={handleUserFound}
          />
        );
      
      case 2:
        return (
          <SecurityQuestions 
            userData={flowData.userData}
            onAnswersVerified={handleAnswersVerified}
            onBack={handleBack}
          />
        );
      
      case 3:
        return (
          <ResetPassword 
            resetData={{
              reset_token: flowData.resetToken,
              username: flowData.username
            }}
            onBack={handleBack}
          />
        );
      
      default:
        return <ForgotPassword onUserFound={handleUserFound} />;
    }
  };

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <button 
        onClick={handleBack}
        style={styles.backButton}
      >
        <FontAwesomeIcon icon={faArrowLeft} style={styles.backIcon} />
        {currentStep === 1 ? 'กลับไปเข้าสู่ระบบ' : 'ขั้นตอนก่อนหน้า'}
      </button>

      {/* Progress Indicator */}
      {renderProgressIndicator()}
      
      {/* Current Step Component */}
      <div style={styles.stepContent}>
        {renderCurrentStep()}
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    padding: '20px',
    position: 'relative'
  },

  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    backgroundColor: 'transparent',
    border: '1px solid #6b7280',
    borderRadius: '8px',
    color: '#6b7280',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    zIndex: 10
  },

  backIcon: {
    fontSize: '12px'
  },

  progressContainer: {
    maxWidth: '800px',
    margin: '5px auto 5px auto',
    backgroundColor: '#2a2a2a',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #3a3a3a'
  },

  progressHeader: {
    textAlign: 'center',
    marginBottom: '24px'
  },

  progressTitle: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 8px 0'
  },

  progressSubtitle: {
    color: '#a0a0a0',
    fontSize: '14px',
    margin: 0
  },

  stepsContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: '10px'
  },

  stepContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    position: 'relative'
  },

  stepCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#3a3a3a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: '12px',
    border: '2px solid #4a4a4a'
  },

  stepIcon: {
    fontSize: '16px',
    position: 'absolute'
  },

  stepNumber: {
    fontSize: '14px',
    fontWeight: '600'
  },

  stepInfo: {
    textAlign: 'center',
    maxWidth: '150px'
  },

  stepTitle: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '4px'
  },

  stepDescription: {
    fontSize: '12px',
    color: '#a0a0a0',
    lineHeight: '1.4'
  },

  connector: {
    position: 'absolute',
    top: '20px',
    left: '50%',
    width: '100%',
    height: '2px',
    transform: 'translateX(20px)',
    zIndex: 1
  },

  userInfoContainer: {
    borderTop: '1px solid #3a3a3a',
    paddingTop: '16px',
    textAlign: 'center'
  },

  userInfo: {
    color: '#e0e0e0',
    fontSize: '14px',
    backgroundColor: '#1e3a8a',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    padding: '8px 16px',
    display: 'inline-block'
  },

  stepContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  }
};

// Add responsive styles for mobile
const mobileMediaQuery = '@media (max-width: 768px)';
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    ${mobileMediaQuery} {
      .steps-container {
        flex-direction: column !important;
        gap: 20px !important;
      }
      
      .step-container {
        flex-direction: row !important;
        text-align: left !important;
      }
      
      .connector {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default PasswordResetFlow;