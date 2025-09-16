import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faUser, 
  faSave,
  faSpinner,
  faUserShield,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';

import useProfileForm from './useProfileForm';
import ProfileForm from './ProfileForm';
import PasswordForm from './PasswordForm';
import SecurityForm from './SecurityForm';

const UserProfileModal = ({ isOpen, onClose, userData, onUpdate }) => {
  const {
    formData,
    loading,
    errors,
    securityQuestions,
    handleInputChange,
    submitProfile,
    resetForm
  } = useProfileForm(userData, onUpdate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const success = await submitProfile();
    if (success) {
      alert('อัพเดทโปรไฟล์สำเร็จ');
      onClose();
    } else if (errors.general) {
      alert(`เกิดข้อผิดพลาด: ${errors.general}`);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getUserIcon = () => {
    if (!userData) return { icon: faUser, color: '#6b7280' };
    
    switch (userData.user_type) {
      case 'superuser':
        return { icon: faUserTie, color: '#eab308' };
      case 'admin':
        return { icon: faUserShield, color: '#dc2626' };
      case 'user':
      default:
        return { icon: faUser, color: '#6b7280' };
    }
  };

  const { icon, color } = getUserIcon();

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div style={styles.modal}>
        {/* Close Button */}
        <button onClick={handleClose} style={styles.closeButton}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        {/* Header */}
        <div style={styles.header}>
          <FontAwesomeIcon icon={icon} style={{...styles.headerIcon, color: color}} />
          <div>
            <h3 style={styles.title}>แก้ไขโปรไฟล์</h3>
            <p style={styles.subtitle}>ผู้ใช้: {userData?.username}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* General Error */}
          {errors.general && (
            <div style={styles.errorBox}>
              {errors.general}
            </div>
          )}

          {/* Profile Form */}
          <ProfileForm 
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
          />

          {/* Password Form */}
          <PasswordForm 
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
          />

          {/* Security Form */}
          <SecurityForm 
            formData={formData}
            errors={errors}
            securityQuestions={securityQuestions}
            handleInputChange={handleInputChange}
          />

          {/* Submit Button */}
          <div style={styles.buttonContainer}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.loadingButton : {})
              }}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }} />
                  บันทึกการเปลี่ยนแปลง
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
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  },

  modal: {
    backgroundColor: '#1e1e1e',
    padding: '24px',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '95%',
    maxHeight: '95vh',
    overflowY: 'auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
    position: 'relative',
    border: '1px solid #374151'
  },

  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '8px 12px',
    backgroundColor: '#991b1b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s ease'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #404040'
  },

  headerIcon: {
    fontSize: '24px'
  },

  title: {
    margin: 0,
    color: 'white',
    fontSize: '20px',
    fontWeight: '600'
  },

  subtitle: {
    margin: '4px 0 0 0',
    color: '#9ca3af',
    fontSize: '14px'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },

  errorBox: {
    backgroundColor: '#7f1d1d',
    color: '#fecaca',
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid #dc2626',
    fontSize: '14px'
  },

  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '16px',
    borderTop: '1px solid #404040'
  },

  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s ease',
    cursor: 'pointer'
  },

  loadingButton: {
    opacity: 0.6,
    cursor: 'not-allowed'
  }
};

export default UserProfileModal;