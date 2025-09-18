// src/admin/pages/UserManagement.jsx - Updated version
import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import EditUserModal from '../components/EditUserModal'; // 🆕 Import modal
import axios from 'axios';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;
  
  // Modals
  const [editModal, setEditModal] = useState({ show: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });

  // Current user data for permission checks
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchUsers();
  }, [search, userTypeFilter, statusFilter, currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: currentPage,
        per_page: perPage,
        ...(search && { search }),
        ...(userTypeFilter && { user_type: userTypeFilter }),
        ...(statusFilter && { is_active: statusFilter })
      });

      const response = await axios.get(`http://localhost:8000/api/accounts/admin/users/?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(response.data.users);
      setTotalPages(response.data.pagination.pages);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Handle saving from modal (รวมทุกประเภท)
  const handleSaveUser = async (userData, saveType) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      // ตรวจสอบว่ามีการเปลี่ยนเเปลง user_type
      const isPromoting = userData.user_type && userData.user_type !== editModal.user.user_type;

      if (saveType === 'basic') {
        if (isPromoting) {
          // ใช้ promote API แทน
          await axios.put(`http://localhost:8000/api/accounts/admin/promote-user/${editModal.user.id}/`, 
            { user_type: userData.user_type },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          // ใช้ general user update API
          await axios.put(`http://localhost:8000/api/accounts/admin/users/${editModal.user.id}/`, 
            userData, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }
      // Refresh data
      fetchUsers();
      
      // แสดงข้อความสำเร็จใน modal (modal จะจัดการเอง)
      return Promise.resolve();
      
    } catch (error) {
      console.error('Failed to update user:', error);
      throw new Error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      await axios.delete(`http://localhost:8000/api/accounts/admin/users/${deleteModal.user.id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDeleteModal({ show: false, user: null });
      fetchUsers(); // Refresh data
      alert(`ลบผู้ใช้ ${deleteModal.user.username} สำเร็จ`);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };

  const canEditUser = (user) => {
    if (currentUser?.user_type === 'superuser') return true;
    if (currentUser?.user_type === 'admin' && user.user_type === 'user') return true;
    return false;
  };

  const canDeleteUser = (user) => {
    if (user.id === currentUser?.id) return false; // ไม่ให้ลบตัวเอง
    if (currentUser?.user_type === 'superuser' && user.user_type !== 'superuser') return true;
    if (currentUser?.user_type === 'admin' && user.user_type === 'user') return true;
    return false;
  };

  const styles = {
    container: {
      padding: '0'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
      color: '#ffffff',
      margin: 0
    },
    controls: {
      display: 'flex',
      gap: '15px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    },
    searchInput: {
      padding: '10px 15px',
      backgroundColor: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '14px',
      minWidth: '200px'
    },
    select: {
      padding: '10px 15px',
      backgroundColor: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '14px'
    },
    table: {
      width: '100%',
      backgroundColor: '#2a2a2a',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #3a3a3a'
    },
    thead: {
      backgroundColor: '#3a3a3a'
    },
    th: {
      padding: '15px',
      textAlign: 'left',
      color: '#ffffff',
      fontWeight: '600',
      borderBottom: '1px solid #4a4a4a'
    },
    td: {
      padding: '15px',
      color: '#e0e0e0',
      borderBottom: '1px solid #3a3a3a'
    },
    userTypeBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600'
    },
    actionButton: {
      padding: '6px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer',
      border: 'none',
      marginRight: '8px'
    },
    editButton: {
      backgroundColor: '#007bff',
      color: '#ffffff'
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: '#ffffff'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
      marginTop: '20px'
    },
    pageButton: {
      padding: '8px 12px',
      backgroundColor: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      color: '#ffffff',
      cursor: 'pointer'
    },
    activePageButton: {
      backgroundColor: '#007bff',
      borderColor: '#007bff'
    },
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
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: '#2a2a2a',
      borderRadius: '12px',
      padding: '30px',
      maxWidth: '500px',
      width: '90%',
      border: '1px solid #3a3a3a'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '20px'
    },
    modalButtons: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
      marginTop: '20px'
    },
    modalButton: {
      padding: '10px 20px',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      border: 'none'
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: '#ffffff'
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
    }
  };
  
  const getUserTypeBadgeStyle = (userType) => ({
    ...styles.userTypeBadge,
    backgroundColor: userType === 'superuser' ? '#ffd700' : userType === 'admin' ? '#c63232ff' : '#6c757d',
    color: userType === 'superuser' ? '#000' : '#fff'
  });

  const getStatusBadgeStyle = (isActive) => ({
    ...styles.statusBadge,
    backgroundColor: isActive ? '#28a745' : '#dc3545',
    color: '#ffffff'
  });

  const getUserTypeDisplay = (type) => {
    const typeMap = {
      'user': 'ผู้ใช้ทั่วไป',
      'admin': 'แอดมิน',
      'superuser': 'ซุปเปอร์ยูสเซอร์'
    };
    return typeMap[type] || type;
  };

  if (loading && users.length === 0) {
    return (
      <AdminLayout>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <AdminLayout>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>จัดการผู้ใช้</h1>
          </div>

          {/* Controls */}
          <div style={styles.controls}>
            <input
              type="text"
              placeholder="ค้นหาผู้ใช้..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              style={styles.select}
            >
              <option value="">ทุกประเภท</option>
              <option value="user">ผู้ใช้ทั่วไป</option>
              <option value="admin">แอดมิน</option>
              {currentUser?.user_type === 'superuser' && (
                <option value="superuser">ซุปเปอร์ยูสเซอร์</option>
              )}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.select}
            >
              <option value="">ทุกสถานะ</option>
              <option value="true">ใช้งานได้</option>
              <option value="false">ถูกปิดใช้งาน</option>
            </select>
          </div>

          {/* Users Table */}
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>ชื่อผู้ใช้</th>
                <th style={styles.th}>อีเมล</th>
                <th style={styles.th}>ประเภท</th>
                <th style={styles.th}>สถานะ</th>
                <th style={styles.th}>วันที่สมัคร</th>
                <th style={styles.th}>กิจกรรมล่าสุด</th>
                <th style={styles.th}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={styles.td}>{user.username}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span style={getUserTypeBadgeStyle(user.user_type)}>
                      {getUserTypeDisplay(user.user_type)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={getStatusBadgeStyle(user.is_active)}>
                      {user.is_active ? 'ใช้งานได้' : 'ปิดใช้งาน'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(user.date_joined).toLocaleDateString('th-TH')}
                  </td>
                  <td style={styles.td}>
                    {user.last_activity?.action || 'ไม่มีข้อมูล'}
                  </td>
                  <td style={styles.td}>
                    {canEditUser(user) && (
                      <button
                        onClick={() => setEditModal({ show: true, user })}
                        style={{...styles.actionButton, ...styles.editButton}}
                      >
                        แก้ไข
                      </button>
                    )}
                    {canDeleteUser(user) && (
                      <button
                        onClick={() => setDeleteModal({ show: true, user })}
                        style={{...styles.actionButton, ...styles.deleteButton}}
                      >
                        ลบ
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={styles.pagination}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              style={{
                ...styles.pageButton,
                opacity: currentPage === 1 ? 0.5 : 1,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ก่อนหน้า
            </button>

            <span style={{ color: '#e0e0e0' }}>
              หน้า {currentPage} จาก {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              style={{
                ...styles.pageButton,
                opacity: currentPage === totalPages ? 0.5 : 1,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              ถัดไป
            </button>
          </div>

          {/* 🆕 Edit User Modal - ใช้ component ใหม่ */}
          {editModal.show && (
            <EditUserModal
              user={editModal.user}
              currentUser={currentUser}
              onSave={handleSaveUser}
              onCancel={() => setEditModal({ show: false, user: null })}
              styles={styles}
            />
          )}

          {/* Delete Confirmation Modal */}
          {deleteModal.show && (
            <div style={styles.modal}>
              <div style={styles.modalContent}>
                <h3 style={styles.modalTitle}>ยืนยันการลบผู้ใช้</h3>
                <p style={{ color: '#e0e0e0', marginBottom: '20px' }}>
                  คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ <strong>{deleteModal.user.username}</strong>?
                  <br />
                  การกระทำนี้ไม่สามารถย้อนกลับได้
                </p>
                <div style={styles.modalButtons}>
                  <button
                    onClick={() => setDeleteModal({ show: false, user: null })}
                    style={{...styles.modalButton, ...styles.cancelButton}}
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    style={{...styles.modalButton, backgroundColor: '#dc3545', color: '#ffffff'}}
                  >
                    ลบผู้ใช้
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}