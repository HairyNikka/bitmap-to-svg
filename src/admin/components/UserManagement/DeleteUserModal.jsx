// admin/components/UserManagement/DeleteUserModal.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { messages } from '../../utils/UserManagement';

const DeleteUserModal = ({
  user,
  onConfirm,
  onCancel,
  loading = false
}) => {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    if (deleting) return;
    
    setDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeleting(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    },
    modal: {
      backgroundColor: '#2a2a2a',
      borderRadius: '12px',
      padding: '0',
      maxWidth: '500px',
      width: '90%',
      border: '1px solid #3a3a3a',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
      animation: 'slideIn 0.3s ease-out'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 30px',
      borderBottom: '1px solid #3a3a3a'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    warningIcon: {
      color: '#dc3545',
      fontSize: '24px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#ffffff',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: '#a0a0a0',
      cursor: 'pointer',
      fontSize: '18px',
      padding: '4px',
      borderRadius: '4px',
      transition: 'color 0.2s'
    },
    body: {
      padding: '30px'
    },
    message: {
      color: '#e0e0e0',
      fontSize: '16px',
      lineHeight: '1.5',
      marginBottom: '20px'
    },
    userInfo: {
      backgroundColor: '#1a1a1a',
      border: '1px solid #3a3a3a',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px'
    },
    userLabel: {
      color: '#a0a0a0',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '5px'
    },
    userName: {
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '600'
    },
    userEmail: {
      color: '#a0a0a0',
      fontSize: '14px',
      marginTop: '2px'
    },
    warning: {
      backgroundColor: '#dc3545',
      color: '#ffffff',
      padding: '12px 15px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    footer: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      padding: '20px 30px',
      borderTop: '1px solid #3a3a3a',
      backgroundColor: '#1a1a1a'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: '#ffffff'
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: '#ffffff'
    },
    deleteButtonDisabled: {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed',
      opacity: 0.6
    },
    spinner: {
      width: '14px',
      height: '14px',
      border: '2px solid transparent',
      borderTop: '2px solid currentColor',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };

  if (!user) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={styles.overlay} onClick={onCancel}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <FontAwesomeIcon icon={faExclamationTriangle} style={styles.warningIcon} />
              <h3 style={styles.title}>{messages.deleteConfirmTitle}</h3>
            </div>
            <button
              onClick={onCancel}
              style={styles.closeButton}
              onMouseOver={(e) => e.target.style.color = '#ffffff'}
              onMouseOut={(e) => e.target.style.color = '#a0a0a0'}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Body */}
          <div style={styles.body}>
            <p style={styles.message}>
              คุณแน่ใจหรือไม่ที่จะลบผู้ใช้คนนี้? การกระทำนี้จะลบข้อมูลผู้ใช้ออกจากระบบอย่างถาวร
            </p>

            {/* User Info */}
            <div style={styles.userInfo}>
              <div style={styles.userLabel}>ผู้ใช้ที่จะถูกลบ</div>
              <div style={styles.userName}>{user.username}</div>
              <div style={styles.userEmail}>{user.email}</div>
            </div>

            {/* Warning */}
            <div style={styles.warning}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>{messages.deleteConfirmMessage}</span>
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button
              onClick={onCancel}
              disabled={deleting}
              style={{
                ...styles.button,
                ...styles.cancelButton,
                ...(deleting ? { opacity: 0.6, cursor: 'not-allowed' } : {})
              }}
              onMouseOver={(e) => {
                if (!deleting) {
                  e.target.style.backgroundColor = '#5a6268';
                }
              }}
              onMouseOut={(e) => {
                if (!deleting) {
                  e.target.style.backgroundColor = '#6c757d';
                }
              }}
            >
              ยกเลิก
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={deleting}
              style={{
                ...styles.button,
                ...styles.deleteButton,
                ...(deleting ? styles.deleteButtonDisabled : {})
              }}
              onMouseOver={(e) => {
                if (!deleting) {
                  e.target.style.backgroundColor = '#c82333';
                }
              }}
              onMouseOut={(e) => {
                if (!deleting) {
                  e.target.style.backgroundColor = '#dc3545';
                }
              }}
            >
              {deleting ? (
                <>
                  <div style={styles.spinner}></div>
                  กำลังลบ...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  ลบผู้ใช้
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteUserModal;