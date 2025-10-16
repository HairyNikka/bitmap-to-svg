import React from 'react';
import { actionOptions, dateOptions, userTypeOptions } from '../../utils/ActivityLogs';
import { exportActivityLogsToCSV } from '../../utils/exportCSV';
import { formatDetails } from '../../utils/ActivityLogs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';

const FilterPanel = ({
  filters,
  onFilterChange,
  onClearFilters,
  exportingCsv,
  onExportStateChange,
  totalLogs,
  hasData
}) => {
  const {
    userFilter,
    actionFilter,
    userTypeFilter,
    dateFilter,
    customDateFrom,
    customDateTo
  } = filters;

  // ปุ่มส่งออก CSV
  const handleExportCSV = async () => {
    onExportStateChange(true);
    
    try {
      const result = await exportActivityLogsToCSV(filters, formatDetails);
      
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
      
    } catch (error) {
      console.error('Export error:', error);
      alert('ไม่สามารถส่งออก CSV ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      onExportStateChange(false);
    }
  };

  const styles = {
    container: {
      backgroundColor: '#2a2a2a',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid #3a3a3a'
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
    customDateContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      marginBottom: '15px'
    },
    buttonContainer: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      marginTop: '10px'
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
    },
    exportButton: {
      padding: '10px 20px',
      backgroundColor: '#28a745',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.2s'
    },
    exportButtonDisabled: {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed',
      opacity: 0.6
    }
  };

  return (
    <div style={styles.container}>
      {/* Main Filters Grid */}
      <div style={styles.grid}>
        {/* ฟิลเตอร์สำหรับค้นหาผู้ใช้ */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>ค้นหาผู้ใช้</label>
          <input
            type="text"
            placeholder="ชื่อผู้ใช้..."
            value={userFilter}
            onChange={(e) => onFilterChange('userFilter', e.target.value)}
            style={styles.input}
          />
        </div>

        {/* ฟิลเตอร์สำหรับเลือกตำแหน่งผู้ใช้ */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>ตำแหน่ง</label>
          <select
            value={userTypeFilter}
            onChange={(e) => onFilterChange('userTypeFilter', e.target.value)}
            style={styles.select}
          >
            {userTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* ฟิลเตอร์สำหรับเลือกการกระทำ */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>การกระทำ</label>
          <select
            value={actionFilter}
            onChange={(e) => onFilterChange('actionFilter', e.target.value)}
            style={styles.select}
          >
            {actionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* ฟิลเตอร์สำหรับเลือกช่วงเวลา */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>ช่วงเวลา</label>
          <select
            value={dateFilter}
            onChange={(e) => onFilterChange('dateFilter', e.target.value)}
            style={styles.select}
          >
            {dateOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* กำหนดวันที่เอง */}
      {dateFilter === 'custom' && (
        <div style={styles.customDateContainer}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>จากวันที่</label>
            <input
              type="date"
              value={customDateFrom}
              onChange={(e) => onFilterChange('customDateFrom', e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.label}>ถึงวันที่</label>
            <input
              type="date"
              value={customDateTo}
              onChange={(e) => onFilterChange('customDateTo', e.target.value)}
              style={styles.input}
            />
          </div>
        </div>
      )}

      {/* ปุ่มล้างตัวกรอง และส่งออก CSV*/}
      <div style={styles.buttonContainer}>
        <button
          onClick={onClearFilters}
          style={styles.clearButton}
          onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
        >
          ล้างตัวกรอง
        </button>
        
        <button
          onClick={handleExportCSV}
          disabled={exportingCsv || !hasData}
          style={{
            ...styles.exportButton,
            ...(exportingCsv || !hasData ? styles.exportButtonDisabled : {})
          }}
          onMouseOver={(e) => {
            if (!exportingCsv && hasData) {
              e.target.style.backgroundColor = '#218838';
            }
          }}
          onMouseOut={(e) => {
            if (!exportingCsv && hasData) {
              e.target.style.backgroundColor = '#28a745';
            }
          }}
        >
          {exportingCsv ? (
            <>
              <FontAwesomeIcon icon={faFileExport} spin />
              กำลังส่งออก CSV..
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faFileExport} />
              Export CSV
            </>
          )}
        </button>

        {/* จำนวนรายการที่แสดงอยู่ */}
        {totalLogs > 0 && (
          <div style={{
            color: '#a0a0a0',
            fontSize: '14px',
            marginLeft: 'auto'
          }}>
            รวม {totalLogs.toLocaleString()} รายการ
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;