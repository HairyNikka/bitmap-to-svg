// src/admin/components/modals/EditUserModal/index.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faLock, 
  faShieldAlt, 
  faTimes,
  faCheck,
  faExclamation
} from '@fortawesome/free-solid-svg-icons';
import BasicInfoTab from './BasicInfoTab';
import PasswordTab from './PasswordTab';
import SecurityQuestionsTab from './SecurityQuestionsTab';

export default function EditUserModal({ user, currentUser, onSave, onCancel, styles }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ฟังก์ชันจัดการ messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const showError = (message) => {
    setError(message);
    setSuccess('');
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setError('');
    // ปิด modal หลังจาก 1.5 วินาที
    setTimeout(() => {
      onCancel();
    }, 1500);
  };

  // กำหนด tabs
  const tabs = [
    { id: 'basic', label: 'ข้อมูลพื้นฐาน', icon: faUser },
    { id: 'password', label: 'รหัสผ่าน', icon: faLock },
    { id: 'security', label: 'คำถามความปลอดภัย', icon: faShieldAlt }
  ];

  // Render tab content ตาม activeTab
  const renderTabContent = () => {
    const commonProps = {
      user,
      currentUser,
      loading,
      setLoading,
      showError,
      showSuccess,
      clearMessages,
      onSave
    };

    switch (activeTab) {
      case 'basic':
        return <BasicInfoTab {...commonProps} />;
      case 'password':
        return <PasswordTab {...commonProps} />;
      case 'security':
        return <SecurityQuestionsTab {...commonProps} />;
      default:
        return <BasicInfoTab {...commonProps} />;
    }
  };

  // Styles (ใช้ของเดิมจาก EditUserModal)
  const modalStyles = {
    ...styles,
    modalContent: {
      backgroundColor: '#2a2a2a',
      borderRadius: '12px',
      padding: '0',
      maxWidth: '700px',
      width: '95%',
      maxHeight: '90vh',
      overflow: 'hidden',
      border: '1px solid #3a3a3a'
    },
    modalHeader: {
      padding: '20px 24px',
      borderBottom: '1px solid #3a3a3a',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#ffffff',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: '#a0a0a0',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px'
    },
    tabContainer: {
      display: 'flex',
      backgroundColor: '#1a1a1a',
      borderBottom: '1px solid #3a3a3a'
    },
    tab: {
      flex: 1,
      padding: '16px 20px',
      backgroundColor: 'transparent',
      border: 'none',
      color: '#a0a0a0',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      borderBottom: '3px solid transparent'
    },
    activeTab: {
      color: '#007bff',
      backgroundColor: '#2a2a2a',
      borderBottomColor: '#007bff'
    },
    tabContent: {
      padding: '24px',
      minHeight: '400px',
      maxHeight: '60vh',
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
    <div style={styles.modal}>
      <div style={modalStyles.modalContent}>
        {/* Header */}
        <div style={modalStyles.modalHeader}>
          <h3 style={modalStyles.modalTitle}>แก้ไขข้อมูลผู้ใช้: {user.username}</h3>
          <button onClick={onCancel} style={modalStyles.closeButton}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Tabs */}
        <div style={modalStyles.tabContainer}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                clearMessages(); // ล้าง error/success เมื่อเปลี่ยน tab
              }}
              style={{
                ...modalStyles.tab,
                ...(activeTab === tab.id ? modalStyles.activeTab : {})
              }}
            >
              <FontAwesomeIcon icon={tab.icon} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={modalStyles.tabContent}>
          {/* Error/Success Messages */}
          {error && (
            <div style={modalStyles.errorMessage}>
              <FontAwesomeIcon icon={faExclamation} />
              {error}
            </div>
          )}

          {success && (
            <div style={modalStyles.successMessage}>
              <FontAwesomeIcon icon={faCheck} />
              {success}
            </div>
          )}

          {/* Render Active Tab */}
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}