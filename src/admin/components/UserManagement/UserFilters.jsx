// admin/components/UserManagement/UserFilters.jsx
import React from 'react';
import { userTypeOptions, statusOptions, getVisibleUserTypes } from '../../utils/UserManagement';

const UserFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  currentUser,
  totalUsers,
  hasData
}) => {
  const { search, userTypeFilter, statusFilter } = filters;

  // กรอง user type options ตามสิทธิ์ของ current user
  const visibleUserTypes = getVisibleUserTypes(currentUser);
  const filteredUserTypeOptions = userTypeOptions.filter(option => 
    option.value === '' || visibleUserTypes.includes(option.value)
  );

  const styles = {
    container: {
      backgroundColor: '#2a2a2a',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid #3a3a3a'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    title: {
      fontSize: '14px',
      color: '#a0a0a0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      margin: 0
    },
    totalCount: {
      color: '#007bff',
      fontSize: '14px',
      fontWeight: '600'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginBottom: '15px'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px'
    },
    label: {
      fontSize: '12px',
      color: '#a0a0a0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      padding: '10px 15px',
      backgroundColor: '#3a3a3a',
      border: '1px solid #4a4a4a',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '14px'
    },
    select: {
      padding: '10px 15px',
      backgroundColor: '#3a3a3a',
      border: '1px solid #4a4a4a',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '14px'
    },
    buttonContainer: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    clearButton: {
      padding: '10px 20px',
      backgroundColor: '#6c757d',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>ตัวกรองข้อมูล</h3>
        {totalUsers > 0 && (
          <div style={styles.totalCount}>
            รวม {totalUsers.toLocaleString()} คน
          </div>
        )}
      </div>

      {/* Filters Grid */}
      <div style={styles.grid}>
        {/* Search Filter */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>ค้นหาผู้ใช้</label>
          <input
            type="text"
            placeholder="ชื่อผู้ใช้หรืออีเมล..."
            value={search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            style={styles.input}
          />
        </div>

        {/* User Type Filter */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>ประเภทผู้ใช้</label>
          <select
            value={userTypeFilter}
            onChange={(e) => onFilterChange('userTypeFilter', e.target.value)}
            style={styles.select}
          >
            {filteredUserTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>สถานะ</label>
          <select
            value={statusFilter}
            onChange={(e) => onFilterChange('statusFilter', e.target.value)}
            style={styles.select}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.buttonContainer}>
        <button
          onClick={onClearFilters}
          style={styles.clearButton}
          onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
        >
          ล้างตัวกรอง
        </button>
      </div>
    </div>
  );
};

export default UserFilters;