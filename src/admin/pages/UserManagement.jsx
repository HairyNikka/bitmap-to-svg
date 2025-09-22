// admin/pages/UserManagement.jsx - Refactored version
import React from 'react';
import AdminLayout from '../components/AdminLayout';
import EditUserModal from '../components/EditUserModal'; // ใช้ modal เดิมต่อ
import { useUserManagement } from '../hooks/useUserManagement';
import UserFilters from '../components/UserManagement/UserFilters';
import UserTable from '../components/UserManagement/UserTable';
import UserPagination from '../components/UserManagement/UserPagination';
import DeleteUserModal from '../components/UserManagement/DeleteUserModal';
import { formatStatsMessage, calculateUserStats } from '../utils/UserManagement';

export default function UserManagement() {
  // ใช้ custom hook สำหรับจัดการ state และ logic
  const {
    // Data
    users,
    loading,
    error,
    currentUser,
    
    // Pagination
    currentPage,
    totalPages,
    totalUsers,
    
    // Filters
    filters,
    
    // Modals
    editModal,
    deleteModal,
    
    // Export state
    exportingActivity,
    
    // Actions
    updateFilter,
    clearFilters,
    changePage,
    nextPage,
    previousPage,
    refresh,
    exportUserActivity,
    
    // Modal actions
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    handleSaveUser,
    handleDeleteUser,
    
    // Computed values
    hasData,
    hasNextPage,
    hasPreviousPage,
    isFirstLoad,
    perPage
  } = useUserManagement();

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    updateFilter(filterName, value);
  };

  // Handle export user activity
  const handleExportUserActivity = async (userId, username) => {
    try {
      const result = await exportUserActivity(userId, username);
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('ไม่สามารถส่งออก Activity Logs ได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Handle delete user with feedback
  const handleDeleteUserWithFeedback = async () => {
    try {
      const result = await handleDeleteUser();
      if (result && result.success) {
        alert(result.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };

  // คำนวณสถิติผู้ใช้
  const userStats = calculateUserStats(users);

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
          <h1 style={styles.title}>จัดการผู้ใช้ (User Management)</h1>
          <p style={styles.subtitle}>
            {formatStatsMessage(userStats)}
            {totalUsers > 0 && (
              <span style={styles.totalCount}>
                {totalUsers.toLocaleString()} คน
              </span>
            )}
          </p>
        </div>

        {/* Filter Panel */}
        <UserFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          currentUser={currentUser}
          totalUsers={totalUsers}
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

        {/* Users Table */}
        <UserTable 
          users={users} 
          loading={loading}
          currentUser={currentUser}
          onEditUser={openEditModal}
          onDeleteUser={openDeleteModal}
          onExportUserActivity={handleExportUserActivity}
          exportingActivity={exportingActivity}
        />

        {/* Pagination */}
        <UserPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalUsers={totalUsers}
          perPage={perPage}
          onPageChange={changePage}
          onPreviousPage={previousPage}
          onNextPage={nextPage}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
        />

        {/* Edit User Modal - ใช้ modal เดิม */}
        {editModal.show && (
          <EditUserModal
            user={editModal.user}
            currentUser={currentUser}
            onSave={handleSaveUser}
            onCancel={closeEditModal}
            styles={{
              modal: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2000  // เพิ่ม z-index สูง
              }
            }}
          />
        )}

        {/* Delete User Modal - ใช้ modal ใหม่ */}
        {deleteModal.show && (
          <DeleteUserModal
            user={deleteModal.user}
            onConfirm={handleDeleteUserWithFeedback}
            onCancel={closeDeleteModal}
            loading={loading}
          />
        )}
      </div>
    </AdminLayout>
  );
}