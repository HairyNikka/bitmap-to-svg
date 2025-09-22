// admin/hooks/useUserManagement.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { apiEndpoints, paginationConfig, messages } from '../utils/UserManagement';

/**
 * Custom hook สำหรับจัดการ User Management
 * @returns {object} State และ functions สำหรับ User Management
 */
export const useUserManagement = () => {
  // Main data state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    userTypeFilter: '',
    statusFilter: ''
  });

  // Modal states
  const [editModal, setEditModal] = useState({ show: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });

  // Current user for permission checks
  const [currentUser, setCurrentUser] = useState(null);

  // Export state
  const [exportingActivity, setExportingActivity] = useState({});

  /**
   * โหลดข้อมูล current user จาก localStorage
   */
  const loadCurrentUser = useCallback(() => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  }, []);

  /**
   * สร้าง API parameters สำหรับการดึงข้อมูล
   */
  const buildApiParams = useCallback(() => {
    const { search, userTypeFilter, statusFilter } = filters;
    
    const params = new URLSearchParams({
      page: currentPage,
      per_page: paginationConfig.perPage
    });

    if (search) params.append('search', search);
    if (userTypeFilter) params.append('user_type', userTypeFilter);
    if (statusFilter) params.append('is_active', statusFilter);

    return params;
  }, [filters, currentPage]);

  /**
   * ดึงข้อมูลผู้ใช้จาก API
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('ไม่พบ authentication token');
      }
      
      const params = buildApiParams();
      
      const response = await axios.get(
        `${apiEndpoints.getUsers}?${params}`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUsers(response.data.users || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalUsers(response.data.pagination?.total || response.data.users?.length || 0);
      
    } catch (error) {
      console.error('Failed to fetch users:', error);
      
      if (error.response?.status === 401) {
        setError('ไม่มีสิทธิ์เข้าถึงข้อมูล กรุณาเข้าสู่ระบบใหม่');
      } else if (error.response?.status === 403) {
        setError('ไม่มีสิทธิ์จัดการผู้ใช้');
      } else {
        setError(messages.fetchError);
      }
      
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, [buildApiParams]);

  /**
   * อัพเดทข้อมูลผู้ใช้
   */
  const updateUser = useCallback(async (userId, userData, saveType) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('ไม่พบ authentication token');
      }

      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }

      // ตรวจสอบว่ามีการเปลี่ยน user_type หรือไม่
      const isPromoting = userData.user_type && userData.user_type !== user.user_type;

      if (saveType === 'basic') {
        if (isPromoting) {
          // ใช้ promote API
          await axios.put(
            apiEndpoints.promoteUser(userId),
            { user_type: userData.user_type },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          // ใช้ general user update API
          await axios.put(
            apiEndpoints.updateUser(userId),
            userData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      // Refresh data
      await fetchUsers();
      return Promise.resolve();
      
    } catch (error) {
      console.error('Failed to update user:', error);
      throw new Error(messages.updateError);
    }
  }, [users, fetchUsers]);

  /**
   * ลบผู้ใช้
   */
  const deleteUser = useCallback(async (userId) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('ไม่พบ authentication token');
      }

      await axios.delete(
        apiEndpoints.deleteUser(userId),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh data
      await fetchUsers();
      return Promise.resolve();
      
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw new Error(messages.deleteError);
    }
  }, [fetchUsers]);

  /**
   * ส่งออก Activity Logs ของผู้ใช้
   */
  const exportUserActivity = useCallback(async (userId, username) => {
    const exportKey = `user_${userId}`;
    setExportingActivity(prev => ({ ...prev, [exportKey]: true }));
    
    try {
      // Import exportActivityLogsToCSV และ formatDetails
      const exportCSVModule = await import('../utils/exportCSV');
      const activityLogsModule = await import('../utils/ActivityLogs');
      
      const exportActivityLogsToCSV = exportCSVModule.exportActivityLogsToCSV;
      const formatDetails = activityLogsModule.formatDetails;

      // สร้าง filters สำหรับ user specific
      const userFilters = {
        userFilter: username,
        actionFilter: '',
        userTypeFilter: '',
        dateFilter: '',
        customDateFrom: '',
        customDateTo: ''
      };

      // เรียกใช้ export function
      const result = await exportActivityLogsToCSV(userFilters, formatDetails);
      
      return {
        success: result.success,
        message: result.success 
          ? `ส่งออก Activity Logs ของ ${username} สำเร็จ`
          : result.message
      };
      
    } catch (error) {
      console.error('Export user activity error:', error);
      return {
        success: false,
        message: messages.exportActivityError
      };
    } finally {
      setExportingActivity(prev => ({ ...prev, [exportKey]: false }));
    }
  }, []);

  /**
   * อัพเดท filters และ reset หน้าแรก
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
    setCurrentPage(1);
  }, []);

  /**
   * อัพเดท filter เดียว
   */
  const updateFilter = useCallback((filterName, value) => {
    updateFilters({ [filterName]: value });
  }, [updateFilters]);

  /**
   * ล้าง filters ทั้งหมด
   */
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      userTypeFilter: '',
      statusFilter: ''
    });
    setCurrentPage(1);
  }, []);

  /**
   * เปลี่ยนหน้า
   */
  const changePage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  /**
   * ไปหน้าถัดไป
   */
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  /**
   * ไปหน้าก่อนหน้า
   */
  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  /**
   * จัดการ Edit Modal
   */
  const openEditModal = useCallback((user) => {
    setEditModal({ show: true, user });
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModal({ show: false, user: null });
  }, []);

  /**
   * จัดการ Delete Modal
   */
  const openDeleteModal = useCallback((user) => {
    setDeleteModal({ show: true, user });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ show: false, user: null });
  }, []);

  /**
   * Handle การบันทึกจาก Edit Modal
   */
  const handleSaveUser = useCallback(async (userData, saveType) => {
    if (!editModal.user) return;
    
    await updateUser(editModal.user.id, userData, saveType);
    closeEditModal();
  }, [editModal.user, updateUser, closeEditModal]);

  /**
   * Handle การลบจาก Delete Modal
   */
  const handleDeleteUser = useCallback(async () => {
    if (!deleteModal.user) return;
    
    const user = deleteModal.user;
    await deleteUser(user.id);
    closeDeleteModal();
    
    return {
      success: true,
      message: `ลบผู้ใช้ ${user.username} สำเร็จ`
    };
  }, [deleteModal.user, deleteUser, closeDeleteModal]);

  /**
   * Refresh ข้อมูล
   */
  const refresh = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Load current user และ fetch users เมื่อ component mount
  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  // Fetch users เมื่อ dependencies เปลี่ยน
  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [fetchUsers, currentUser]);

  // ส่งคืน state และ functions
  return {
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
    fetchUsers,
    updateUser,
    deleteUser,
    exportUserActivity,
    updateFilters,
    updateFilter,
    clearFilters,
    changePage,
    nextPage,
    previousPage,
    refresh,
    
    // Modal actions
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    handleSaveUser,
    handleDeleteUser,
    
    // Computed values
    hasData: users.length > 0,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    isFirstLoad: loading && users.length === 0,
    
    // Pagination config
    perPage: paginationConfig.perPage
  };
};