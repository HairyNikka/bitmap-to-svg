import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const ProfileForm = ({ formData, errors, handleInputChange }) => {
  const styles = {
    section: {
      backgroundColor: '#2a2a2a',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #404040'
    },
    sectionTitle: {
      margin: '0 0 16px 0',
      color: 'white',
      fontSize: '16px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center'
    },
    sectionIcon: {
      marginRight: '8px',
      color: '#9ca3af'
    },
    field: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      color: '#d1d5db',
      fontSize: '14px',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      backgroundColor: '#374151',
      border: '1px solid #404040',
      borderRadius: '6px',
      color: 'white',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box'
    },
    inputError: {
      borderColor: '#dc2626'
    },
    error: {
      display: 'block',
      marginTop: '4px',
      color: '#ef4444',
      fontSize: '12px'
    }
  };

  return (
    <div style={styles.section}>
      <h4 style={styles.sectionTitle}>
        <FontAwesomeIcon icon={faEnvelope} style={styles.sectionIcon} />
        ข้อมูลส่วนตัว
      </h4>
      
      <div style={styles.field}>
        <label style={styles.label}>อีเมล</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          style={{
            ...styles.input,
            ...(errors.email ? styles.inputError : {})
          }}
          placeholder="กรอกอีเมลของคุณ"
        />
        {errors.email && <span style={styles.error}>{errors.email}</span>}
      </div>
    </div>
  );
};

export default ProfileForm;