import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { useActivityLogs } from '../hooks/useActivityLogs';
import FilterPanel from '../components/ActivityLogs/FilterPanel';
import LogsTable from '../components/ActivityLogs/LogsTable';
import Pagination from '../components/ActivityLogs/Pagination';

export default function ActivityLogs() {
  // ใช้ custom hook สำหรับจัดการ state และ logic
  const {
    // Data
    logs,
    loading,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    totalLogs,
    
    // Filters
    filters,
    
    // Export
    exportingCsv,
    
    // Actions
    updateFilter,
    clearFilters,
    changePage,
    nextPage,
    previousPage,
    refresh,
    setExportState,
    
    // Computed values
    hasData,
    hasNextPage,
    hasPreviousPage,
    isFirstLoad,
    perPage
  } = useActivityLogs();

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    updateFilter(filterName, value);
  };

  const styles = {
    container: {
      padding: '0'
    },
    header: {
      marginBottom: '30px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#a0a0a0',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    totalCount: {
      backgroundColor: '#007bff',
      color: '#ffffff',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '400px'
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #3a3a3a',
      borderTop: '4px solid #007bff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    errorContainer: {
      textAlign: 'center',
      padding: '40px',
      color: '#ff6b6b',
      backgroundColor: '#2a2a2a',
      borderRadius: '12px',
      border: '1px solid #3a3a3a'
    },
    errorTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#ff6b6b'
    },
    errorMessage: {
      fontSize: '14px',
      marginBottom: '20px',
      lineHeight: '1.5'
    },
    refreshButton: {
      backgroundColor: '#007bff',
      color: '#ffffff',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    }
  };

  // Loading state สำหรับการโหลดครั้งแรก
  if (isFirstLoad) {
    return (
      <AdminLayout>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error && !hasData) {
    return (
      <AdminLayout>
        <div style={styles.container}>
          <div style={styles.errorContainer}>
            <h3 style={styles.errorTitle}>เกิดข้อผิดพลาด</h3>
            <p style={styles.errorMessage}>{error}</p>
            <button 
              onClick={refresh}
              style={styles.refreshButton}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Main render
  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>บันทึกกิจกรรม (Activity Logs)</h1>
          <p style={styles.subtitle}>
            บันทึกการใช้งานระบบทั้งหมด
            {totalLogs > 0 && (
              <span style={styles.totalCount}>
                {totalLogs.toLocaleString()} รายการ
              </span>
            )}
          </p>
        </div>

        {/* เเถบฟิลเตอร์ */}
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          exportingCsv={exportingCsv}
          onExportStateChange={setExportState}
          totalLogs={totalLogs}
          hasData={hasData}
        />

        {/* Error notification (ถ้ามีข้อมูลแสดงอยู่แล้ว) */}
        {error && hasData && (
          <div style={{
            backgroundColor: '#dc3545',
            color: '#ffffff',
            padding: '10px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* ตารางข้อมูล Log */}
        <LogsTable 
          logs={logs} 
          loading={loading}
        />

        {/* การแบ่งหน้า */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalLogs={totalLogs}
          perPage={perPage}
          onPageChange={changePage}
          onPreviousPage={previousPage}
          onNextPage={nextPage}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
        />
      </div>
    </AdminLayout>
  );
}