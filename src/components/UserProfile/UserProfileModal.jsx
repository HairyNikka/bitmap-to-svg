import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faUser,
  faEnvelope,
  faLock,
  faShieldAlt,
  faUserTie,
  faUserShield,
  faCalendarAlt,
  faCheck,
  faExclamation
} from '@fortawesome/free-solid-svg-icons';

import useProfileForm from './useProfileForm';
import BasicInfoTab from './BasicInfoTab';
import PasswordTab from './PasswordTab';
import SecurityQuestionsTab from './SecurityQuestionsTab';

const UserProfileModal = ({ isOpen, onClose, userData, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    formData,
    loading,
    errors,
    securityQuestions,
    handleInputChange,
    validateForm,
    submitProfile,
    resetForm
  } = useProfileForm(userData, onUpdate);

  const handleClose = () => {
    resetForm();
    setError('');
    setSuccess('');
    onClose();
  };

  const showError = (message) => {
    setError(message);
    setSuccess('');
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setError('');
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // ไอค่อนตามตำแหน่งผู้ใช้
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

  // สีพื้นหลังตามตำแหน่งผู้ใช้
  const getRoleBadge = () => {
    if (!userData || userData.user_type === 'user') return null;
    
    switch (userData.user_type) {
      case 'superuser':
        return { text: 'SUPER USER', bgColor: '#ffc107', textColor: '#000' };
      case 'admin':
        return { text: 'ADMIN', bgColor: '#dc3545', textColor: '#fff' };
      default:
        return null;
    }
  };

  // format วันที่
  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const { icon, color } = getUserIcon();
  const roleBadge = getRoleBadge();

  // แท็บทั้งหมด
  const tabs = [
    { id: 'basic', label: 'ข้อมูลส่วนตัว', icon: faEnvelope },
    { id: 'password', label: 'รหัสผ่าน', icon: faLock },
    { id: 'security', label: 'คำถามความปลอดภัย', icon: faShieldAlt }
  ];

  // เรนเดอร์แท็บตามแท็บที่เลือก
  const renderTabContent = () => {
    const commonProps = {
      formData,
      errors,
      loading,
      showError,
      showSuccess,
      clearMessages,
      handleInputChange,
      validateForm,
      submitProfile
    };

    switch (activeTab) {
      case 'basic':
        return <BasicInfoTab {...commonProps} userData={userData} />;
      case 'password':
        return <PasswordTab {...commonProps} />;
      case 'security':
        return <SecurityQuestionsTab {...commonProps} securityQuestions={securityQuestions} />;
      default:
        return <BasicInfoTab {...commonProps} userData={userData} />;
    }
  };

  if (!isOpen) return null;

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
      borderRadius: '12px',
      width: '90%',
      maxWidth: '900px',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
      border: '1px solid #374151',
      overflow: 'hidden'
    },
    header: {
      padding: '20px 24px',
      borderBottom: '1px solid #374151',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#ffffff',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: '#6b7280',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      transition: 'color 0.2s ease'
    },
    content: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden'
    },
    sidebar: {
      width: '280px',
      backgroundColor: '#2a2a2a',
      borderRight: '1px solid #374151',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    userSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: '20px',
      borderBottom: '1px solid #374151'
    },
    userIconContainer: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '12px',
      border: '2px solid #374151'
    },
    userIcon: {
      fontSize: '32px'
    },
    username: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '8px'
    },
    roleBadge: {
      fontSize: '10px',
      fontWeight: '600',
      textTransform: 'uppercase',
      padding: '4px 8px',
      borderRadius: '4px',
      letterSpacing: '0.5px',
      marginBottom: '12px'
    },
    userDetail: {
      fontSize: '13px',
      color: '#9ca3af',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginTop: '6px'
    },
    tabsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    tab: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '8px',
      color: '#9ca3af',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'left'
    },
    activeTab: {
      backgroundColor: '#1e1e1e',
      color: '#007bff',
      borderLeft: '3px solid #007bff'
    },
    tabIcon: {
      fontSize: '16px',
      width: '20px',
      textAlign: 'center'
    },
    mainContent: {
      flex: 1,
      padding: '24px',
      overflowY: 'auto'
    },
    errorMessage: {
      backgroundColor: '#dc3545',
      color: '#ffffff',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px'
    },
    successMessage: {
      backgroundColor: '#28a745',
      color: '#ffffff',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div style={styles.modal}>
        {/* ส่วนด้านบน */}
        <div style={styles.header}>
          <h3 style={styles.headerTitle}>แก้ไขโปรไฟล์</h3>
          <button 
            onClick={handleClose} 
            style={styles.closeButton}
            onMouseOver={(e) => e.target.style.color = '#ffffff'}
            onMouseOut={(e) => e.target.style.color = '#6b7280'}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Sidebar */}
          <div style={styles.sidebar}>
            {/* ข้อมูลส่วนตัวผู้ใช้ */}
            <div style={styles.userSection}>
              <div style={styles.userIconContainer}>
                <FontAwesomeIcon 
                  icon={icon} 
                  style={{...styles.userIcon, color: color}}
                />
              </div>
              
              <div style={styles.username}>
                {userData?.username || 'ผู้ใช้'}
              </div>
              
              {roleBadge && (
                <div style={{
                  ...styles.roleBadge,
                  backgroundColor: roleBadge.bgColor,
                  color: roleBadge.textColor
                }}>
                  {roleBadge.text}
                </div>
              )}
              
              <div style={styles.userDetail}>
                <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: '12px' }} />
                {userData?.email || 'ไม่ระบุอีเมล'}
              </div>
              
              <div style={styles.userDetail}>
                <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: '12px' }} />
                {formatDate(userData?.date_joined)}
              </div>
            </div>

            {/* แบบเลือกแท็บ */}
            <div style={styles.tabsList}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    clearMessages();
                  }}
                  style={{
                    ...styles.tab,
                    ...(activeTab === tab.id ? styles.activeTab : {})
                  }}
                  onMouseOver={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <FontAwesomeIcon icon={tab.icon} style={styles.tabIcon} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div style={styles.mainContent}>
            {/* ข้อความเมื่อเกิดข้อผิดพลาด หรือสำเร็จ */}
            {error && (
              <div style={styles.errorMessage}>
                <FontAwesomeIcon icon={faExclamation} />
                {error}
              </div>
            )}

            {success && (
              <div style={styles.successMessage}>
                <FontAwesomeIcon icon={faCheck} />
                {success}
              </div>
            )}

            {/* โชว์เนื้อหาตามแท็บที่เลือก */}
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;