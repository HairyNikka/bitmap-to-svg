// src/admin/components/modals/EditUserModal/BasicInfoTab.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

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

  // ฟังก์ชันบันทึกข้อมูลพื้นฐาน
  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(basicData, 'basic');
      showSuccess('บันทึกข้อมูลพื้นฐานสำเร็จ');
    } catch (error) {
      console.error('Save basic error:', error);
      showError(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Styles สำหรับหน้านี้
  const styles = {
    formGroup: {
      marginBottom: '20px'
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
      transition: 'border-color 0.2s ease'
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
      cursor: user.id === currentUser?.id ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.3s ease',
      opacity: user.id === currentUser?.id ? 0.6 : 1
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
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
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
      transition: 'all 0.2s ease'
    }
  };

  return (
    <div>
      {/* อีเมล */}
      <div style={styles.formGroup}>
        <label style={styles.label}>อีเมล:</label>
        <input
          type="email"
          value={basicData.email}
          onChange={(e) => setBasicData({...basicData, email: e.target.value})}
          style={styles.input}
          onFocus={(e) => e.target.style.borderColor = '#007bff'}
          onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
          required
        />
      </div>

      {/* ประเภทผู้ใช้ (แสดงเฉพาะ superuser) */}
      {currentUser?.user_type === 'superuser' && (
        <div style={styles.formGroup}>
          <label style={styles.label}>ประเภทผู้ใช้:</label>
          <select
            value={basicData.user_type}
            onChange={(e) => setBasicData({...basicData, user_type: e.target.value})}
            style={styles.input}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
          >
            <option value="user">ผู้ใช้</option>
            <option value="admin">แอดมิน</option>
            <option value="superuser">ซุปเปอร์ยูสเซอร์</option>
          </select>
        </div>
      )}

      {/* สถานะบัญชี */}
      <div style={styles.formGroup}>
        <label style={styles.label}>สถานะบัญชี:</label>
        <div style={styles.toggleContainer}>
          <div
            style={styles.toggleSwitch}
            onClick={() => {
              if (user.id !== currentUser?.id) {
                setBasicData({...basicData, is_active: !basicData.is_active});
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
          {user.id === currentUser?.id && (
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
          onClick={handleSave}
          disabled={loading}
          style={styles.saveButton}
        >
          <FontAwesomeIcon icon={faCheck} />
          {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
        </button>
      </div>
    </div>
  );
}