// src/admin/components/modals/EditUserModal/BasicInfoTab.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faSpinner,
  faExclamationTriangle,
  faInfoCircle,
  faUserTie,
  faUserShield,
  faUser
} from '@fortawesome/free-solid-svg-icons';

export default function BasicInfoTab({ 
  user, 
  currentUser, 
  loading, 
  setLoading, 
  showError, 
  showSuccess, 
  onSave 
}) {
  // State สำหรับข้อมูลพื้นฐาน
  const [basicData, setBasicData] = useState({
    email: user.email || '',
    user_type: user.user_type || 'user',
    is_active: user.is_active,
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});

  // state สำหรับเช็คอีเมล
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailCheckResult, setEmailCheckResult] = useState(null);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Memoized validation
  const validation = useMemo(() => {
    const { email, user_type } = basicData;
    
    return {
      isEmailValid: emailRegex.test(email),
      isEmailChanged: email !== user.email,
      isUserTypeChanged: user_type !== user.user_type,
      isActiveChanged: basicData.is_active !== user.is_active,
      hasChanges: email !== user.email || user_type !== user.user_type || basicData.is_active !== user.is_active,
      canChangeUserType: currentUser?.user_type === 'superuser',
      canChangeStatus: user.id !== currentUser?.id,
      isEmailAvailable: emailCheckResult?.available !== false, // ถ้ายังไม่เช็ค หรือ available = true
      isFormValid: emailRegex.test(email) && 
                   email.length > 0 && 
                  (emailCheckResult?.available !== false)
    };
  }, [basicData, user, currentUser, emailCheckResult]);

  // ✅ แก้ไข function เช็คอีเมลซ้ำ
  const checkEmailAvailability = useCallback(async (email) => {
    
    // ถ้าอีเมลเดิม ไม่ต้องเช็ค
    if (email === user.email) {
      setEmailCheckResult(null);
      return;
    }

    // ถ้าอีเมลไม่ valid ไม่ต้องเช็ค
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    if (!emailRegex.test(email)) {
      setEmailCheckResult(null);
      return;
    }

    setEmailCheckLoading(true);
    
    try {
      const apiUrl = `http://localhost:8000/api/accounts/check-email/?email=${encodeURIComponent(email)}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.available) {
        setEmailCheckResult({ 
          available: true, 
          message: 'อีเมลนี้ใช้งานได้' 
        });
      } else {
        setEmailCheckResult({ 
          available: false, 
          message: 'อีเมลนี้มีผู้ใช้งานแล้ว' 
        });
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailCheckResult({ 
        available: true,
        message: 'ไม่สามารถตรวจสอบอีเมลได้ (จะตรวจสอบอีกครั้งเมื่อบันทึก)',
        warning: true
      });
    } finally {
      setEmailCheckLoading(false);
    }
  }, []); 

  // Debounce สำหรับเช็คอีเมล
  useEffect(() => {
    // Reset ผลลัพธ์เดิมเมื่อเริ่มพิมพ์ใหม่
    setEmailCheckResult(null);
    
    // ถ้าอีเมลเป็นค่าเดิม ไม่ต้องเช็ค
    if (basicData.email === user.email) {
      return;
    }
    
    // ถ้าอีเมลว่างหรือไม่ valid ไม่ต้องเช็ค
    if (!basicData.email || !validation.isEmailValid) {
      return;
    }
    
    // รอ 1 วินาที หลังพิมพ์หยุด แล้วค่อยเช็ค
    const timer = setTimeout(() => {
      checkEmailAvailability(basicData.email);
    }, 1000);

    return () => clearTimeout(timer);
  }, [basicData.email, user.email, validation.isEmailValid]); // ✅ ลบ checkEmailAvailability ออก

  // Debounced input handlers
  const handleBasicDataChange = useCallback((field, value) => {
    setBasicData(prev => ({ ...prev, [field]: value }));
  }, []);

  // ฟังก์ชันบันทึกข้อมูลพื้นฐาน
  const handleSaveClick = () => {
    if (!validation.isFormValid || !validation.hasChanges) return;

    // Analyze changes
    const changes = {};
    if (validation.isEmailChanged) changes.email = basicData.email;
    if (validation.isUserTypeChanged) changes.user_type = basicData.user_type;
    if (validation.isActiveChanged) changes.is_active = basicData.is_active;

    setPendingChanges(changes);
    setShowConfirmDialog(true);
  };

  const handleSave = async () => {
    if (!validation.isFormValid) return;

    setShowConfirmDialog(false);
    setLoading(true);

    try {
      await onSave(basicData, 'basic');
      showSuccess('บันทึกข้อมูลพื้นฐานสำเร็จ');
    } catch (error) {
      console.error('Save basic error:', error);
      
      if (error.message.includes('already exists')) {
        showError('อีเมลนี้มีผู้ใช้งานแล้ว กรุณาใช้อีเมลอื่น');
      } else if (error.message.includes('permission')) {
        showError('คุณไม่มีสิทธิ์แก้ไขข้อมูลผู้ใช้นี้');
      } else {
        showError(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeInfo = (userType) => {
    switch (userType) {
      case 'superuser':
        return {
          icon: faUserTie,
          label: 'Super User',
          color: '#ffc107',
          description: 'สิทธิ์สูงสุดในระบบ'
        };
      case 'admin':
        return {
          icon: faUserShield,
          label: 'Admin',
          color: '#dc2626',
          description: 'จัดการผู้ใช้และระบบ'
        };
      case 'user':
      default:
        return {
          icon: faUser,
          label: 'User',
          color: '#6b7280',
          description: 'ใช้งานระบบพื้นฐาน'
        };
    }
  };

  const styles = {
    formGroup: {
      marginBottom: '24px'
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
      transition: 'all 0.3s ease'
    },
    inputFocused: {
      borderColor: '#007bff',
      boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.1)'
    },
    inputError: {
      borderColor: '#dc3545',
      boxShadow: '0 0 0 3px rgba(220, 53, 69, 0.1)'
    },
    inputSuccess: {
      borderColor: '#28a745',
      boxShadow: '0 0 0 3px rgba(40, 167, 69, 0.1)'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: '#1a1a1a',
      border: '2px solid #3a3a3a',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '14px',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease'
    },
    toggleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    toggleSwitch: {
      position: 'relative',
      width: '50px',
      height: '24px',
      backgroundColor: basicData.is_active ? '#28a745' : '#dc3545',
      borderRadius: '12px',
      cursor: validation.canChangeStatus ? 'pointer' : 'not-allowed',
      transition: 'background-color 0.3s ease',
      opacity: validation.canChangeStatus ? 1 : 0.6,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    },
    toggleHandle: {
      position: 'absolute',
      top: '2px',
      left: basicData.is_active ? '26px' : '2px',
      width: '20px',
      height: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '50%',
      transition: 'left 0.3s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
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
      transition: 'all 0.2s ease',
      minWidth: '160px',
      justifyContent: 'center'
    },
    saveButtonDisabled: {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed',
      opacity: 0.7
    },
    infoBox: {
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
      border: '1px solid rgba(0, 123, 255, 0.3)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px'
    },
    infoText: {
      color: '#007bff',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      lineHeight: '1.5'
    },
    warningBox: {
      backgroundColor: 'rgba(255, 193, 7, 0.1)',
      border: '1px solid rgba(255, 193, 7, 0.3)',
      borderRadius: '8px',
      padding: '12px',
      marginTop: '8px'
    },
    warningText: {
      color: '#ffc107',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    validationList: {
      marginTop: '8px',
      padding: '12px',
      backgroundColor: 'rgba(108, 117, 125, 0.1)',
      borderRadius: '6px',
      border: '1px solid rgba(108, 117, 125, 0.2)'
    },
    validationItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      margin: '4px 0',
      transition: 'color 0.3s ease'
    },
    validationItemValid: {
      color: '#28a745'
    },
    validationItemInvalid: {
      color: '#6c757d'
    },
    validationItemError: {
      color: '#dc3545'
    },
    changeIndicator: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '11px',
      padding: '2px 6px',
      borderRadius: '4px',
      backgroundColor: 'rgba(255, 193, 7, 0.2)',
      color: '#ffc107',
      marginLeft: '8px'
    },
    userTypePreview: {
      marginTop: '12px',
      padding: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid #3a3a3a',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    userTypeIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px'
    },
    userTypeDetails: {
      flex: 1
    },
    userTypeLabel: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '4px'
    },
    userTypeDescription: {
      fontSize: '12px',
      color: '#a0a0a0'
    },
    confirmDialog: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 3000
    },
    confirmDialogContent: {
      backgroundColor: '#2a2a2a',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '500px',
      width: '90%',
      border: '1px solid #3a3a3a'
    },
    confirmDialogTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    confirmDialogText: {
      fontSize: '14px',
      color: '#e0e0e0',
      marginBottom: '16px',
      lineHeight: '1.5'
    },
    changesList: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '20px'
    },
    changeItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    changeItemLast: {
      borderBottom: 'none'
    },
    changeLabel: {
      color: '#a0a0a0',
      fontSize: '14px'
    },
    changeValue: {
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '500'
    },
    confirmDialogButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    },
    confirmButton: {
      backgroundColor: '#28a745',
      color: '#ffffff',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: '#ffffff',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    }
  };

  // Get input style based on validation
  const getInputStyle = (isValid, hasContent) => {
    let style = { ...styles.input };
    if (hasContent) {
      if (isValid) {
        style = { ...style, ...styles.inputSuccess };
      } else {
        style = { ...style, ...styles.inputError };
      }
    }
    return style;
  };

  const currentUserTypeInfo = getUserTypeInfo(basicData.user_type);

  return (
    <div>
      {/* Info Box */}
      <div style={styles.infoBox}>
        <div style={styles.infoText}>
          <FontAwesomeIcon icon={faInfoCircle} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong>การแก้ไขข้อมูลพื้นฐาน</strong><br/>
            การเปลี่ยนแปลงข้อมูลจะมีผลทันทีหลังจากบันทึก ผู้ใช้อาจต้องเข้าสู่ระบบใหม่
          </div>
        </div>
      </div>

      {/* อีเมล */}
      <div style={styles.formGroup}>
        <label style={styles.label}>
          อีเมล:
          {validation.isEmailChanged && (
            <span style={styles.changeIndicator}>
              <FontAwesomeIcon icon={faExclamationTriangle} size="sm" />
              มีการเปลี่ยนแปลง
            </span>
          )}
        </label>
        <input
          type="email"
          value={basicData.email}
          onChange={(e) => handleBasicDataChange('email', e.target.value)}
          style={getInputStyle(validation.isEmailValid, basicData.email.length > 0)}
          placeholder="example@domain.com"
          required
        />
        
          {/* ส่วนแสดงผลการเช็คอีเมล */}
          {basicData.email && validation.isEmailValid && validation.isEmailChanged && (
            <div style={styles.validationList}>
              {emailCheckLoading ? (
                <div style={{...styles.validationItem, color: '#6c757d'}}>
                  <FontAwesomeIcon icon={faSpinner} spin size="sm" />
                  กำลังตรวจสอบอีเมล...
                </div>
              ) : emailCheckResult ? (
                <div style={{
                  ...styles.validationItem,
                  ...(emailCheckResult.available ? styles.validationItemValid : styles.validationItemError)
                }}>
                  <FontAwesomeIcon 
                    icon={emailCheckResult.available ? faCheck : faExclamationTriangle} 
                    size="sm" 
                  />
                  {emailCheckResult.message}
                </div>
              ) : null}
            </div>
          )}

        {basicData.email && !validation.isEmailValid && (
          <div style={styles.validationList}>
            <div style={{...styles.validationItem, ...styles.validationItemError}}>
              <FontAwesomeIcon icon={faExclamationTriangle} size="sm" />
              รูปแบบอีเมลไม่ถูกต้อง
            </div>
          </div>
        )}
      </div>

      {/* ประเภทผู้ใช้ (แสดงเฉพาะ superuser) */}
      {validation.canChangeUserType && (
        <div style={styles.formGroup}>
          <label style={styles.label}>
            ประเภทผู้ใช้:
            {validation.isUserTypeChanged && (
              <span style={styles.changeIndicator}>
                <FontAwesomeIcon icon={faExclamationTriangle} size="sm" />
                มีการเปลี่ยนแปลง
              </span>
            )}
          </label>
          <select
            value={basicData.user_type}
            onChange={(e) => handleBasicDataChange('user_type', e.target.value)}
            style={styles.select}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superuser">Super User</option>
          </select>

          {/* User Type Preview */}
          <div style={styles.userTypePreview}>
            <div 
              style={{
                ...styles.userTypeIcon,
                backgroundColor: currentUserTypeInfo.color + '20',
                color: currentUserTypeInfo.color
              }}
            >
              <FontAwesomeIcon icon={currentUserTypeInfo.icon} />
            </div>
            <div style={styles.userTypeDetails}>
              <div style={{...styles.userTypeLabel, color: currentUserTypeInfo.color}}>
                {currentUserTypeInfo.label}
              </div>
              <div style={styles.userTypeDescription}>
                {currentUserTypeInfo.description}
              </div>
            </div>
          </div>

          {validation.isUserTypeChanged && (
            <div style={styles.warningBox}>
              <div style={styles.warningText}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                การเปลี่ยนประเภทผู้ใช้จะส่งผลต่อสิทธิ์การเข้าถึงระบบ
              </div>
            </div>
          )}
        </div>
      )}

      {/* สถานะบัญชี */}
      <div style={styles.formGroup}>
        <label style={styles.label}>
          สถานะบัญชี:
          {validation.isActiveChanged && (
            <span style={styles.changeIndicator}>
              <FontAwesomeIcon icon={faExclamationTriangle} size="sm" />
              มีการเปลี่ยนแปลง
            </span>
          )}
        </label>
        <div style={styles.toggleContainer}>
          <div
            style={styles.toggleSwitch}
            onClick={() => {
              if (validation.canChangeStatus) {
                handleBasicDataChange('is_active', !basicData.is_active);
              }
            }}
          >
            <div style={styles.toggleHandle}></div>
          </div>
          <span style={{ 
            color: basicData.is_active ? '#28a745' : '#dc3545',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {basicData.is_active ? 'เปิดใช้งาน' : 'ระงับบัญชี'}
          </span>
          {!validation.canChangeStatus && (
            <span style={{
              fontSize: '12px',
              color: '#ffc107',
              marginLeft: '8px'
            }}>
              (ไม่สามารถระงับตัวเองได้)
            </span>
          )}
        </div>
      </div>

      {/* ปุ่มบันทึก */}
      <div style={{ marginTop: '30px' }}>
        <button
          onClick={handleSaveClick}
          disabled={loading || !validation.isFormValid || !validation.hasChanges}
          style={{
            ...styles.saveButton,
            ...(loading || !validation.isFormValid || !validation.hasChanges ? styles.saveButtonDisabled : {})
          }}
          onMouseOver={(e) => {
            if (!loading && validation.isFormValid && validation.hasChanges) {
              e.target.style.backgroundColor = '#218838';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading && validation.isFormValid && validation.hasChanges) {
              e.target.style.backgroundColor = '#28a745';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheck} />
              บันทึกข้อมูล
            </>
          )}
        </button>

        {/* Status messages */}
        {!validation.hasChanges && (
          <div style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#6c757d',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <FontAwesomeIcon icon={faInfoCircle} />
            ไม่มีการเปลี่ยนแปลงข้อมูล
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div style={styles.confirmDialog} onClick={() => setShowConfirmDialog(false)}>
          <div style={styles.confirmDialogContent} onClick={(e) => e.stopPropagation()}>
            <h4 style={styles.confirmDialogTitle}>
              <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ffc107' }} />
              ยืนยันการแก้ไขข้อมูล
            </h4>
            <p style={styles.confirmDialogText}>
              คุณแน่ใจหรือไม่ที่จะแก้ไขข้อมูลของ <strong>{user.username}</strong>?
            </p>

            {/* Changes List */}
            <div style={styles.changesList}>
              <h5 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '8px' }}>การเปลี่ยนแปลง:</h5>
              {pendingChanges.email && (
                <div style={styles.changeItem}>
                  <span style={styles.changeLabel}>อีเมล:</span>
                  <span style={styles.changeValue}>{pendingChanges.email}</span>
                </div>
              )}
              {pendingChanges.user_type && (
                <div style={styles.changeItem}>
                  <span style={styles.changeLabel}>ประเภทผู้ใช้:</span>
                  <span style={styles.changeValue}>{getUserTypeInfo(pendingChanges.user_type).label}</span>
                </div>
              )}
              {pendingChanges.hasOwnProperty('is_active') && (
                <div style={{...styles.changeItem, ...styles.changeItemLast}}>
                  <span style={styles.changeLabel}>สถานะ:</span>
                  <span style={styles.changeValue}>
                    {pendingChanges.is_active ? 'เปิดใช้งาน' : 'ระงับบัญชี'}
                  </span>
                </div>
              )}
            </div>

            <div style={styles.confirmDialogButtons}>
              <button
                onClick={() => setShowConfirmDialog(false)}
                style={styles.cancelButton}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                style={styles.confirmButton}
              >
                ยืนยันการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}