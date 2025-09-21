// admin/hooks/useActivityLogs.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { buildApiParams, paginationConfig, messages } from '../utils/ActivityLogs';

/**
 * Custom hook สำหรับจัดการ Activity Logs
 * @returns {object} State และ functions สำหรับ Activity Logs
 */
export const useActivityLogs = () => {
  // Main data state
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    actionFilter: '',
    dateFilter: '',
    userFilter: '',
    userTypeFilter: '',
    customDateFrom: '',
    customDateTo: ''
  });

  // Export state
  const [exportingCsv, setExportingCsv] = useState(false);

  /**
   * ดึงข้อมูล Activity Logs จาก API
   */
  const fetchActivityLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('ไม่พบ authentication token');
      }
      
      // สร้าง API parameters
      const params = buildApiParams(filters, currentPage, paginationConfig.perPage);
      
      const response = await axios.get(
        `http://localhost:8000/api/accounts/admin/logs/?${params}`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // อัพเดท state ด้วยข้อมูลที่ได้รับ
      setLogs(response.data.logs || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalLogs(response.data.pagination?.total || 0);
      
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      
      // จัดการ error messages
      if (error.response?.status === 401) {
        setError('ไม่มีสิทธิ์เข้าถึงข้อมูล กรุณาเข้าสู่ระบบใหม่');
      } else if (error.response?.status === 403) {
        setError('ไม่มีสิทธิ์ดูข้อมูล Activity Logs');
      } else {
        setError(messages.fetchError);
      }
      
      // Reset data เมื่อเกิด error
      setLogs([]);
      setTotalPages(1);
      setTotalLogs(0);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  /**
   * อัพเดท filters และ reset หน้าแรก
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
    setCurrentPage(1); // Reset ไปหน้าแรกเมื่อเปลี่ยน filter
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
      actionFilter: '',
      dateFilter: '',
      userFilter: '',
      userTypeFilter: '',
      customDateFrom: '',
      customDateTo: ''
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
   * Refresh ข้อมูล
   */
  const refresh = useCallback(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  /**
   * ตั้งค่า export state
   */
  const setExportState = useCallback((isExporting) => {
    setExportingCsv(isExporting);
  }, []);

  // เรียก fetchActivityLogs เมื่อ dependencies เปลี่ยน
  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  // ส่งคืน state และ functions
  return {
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
    fetchActivityLogs,
    updateFilters,
    updateFilter,
    clearFilters,
    changePage,
    nextPage,
    previousPage,
    refresh,
    setExportState,
    
    // Computed values
    hasData: logs.length > 0,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    isFirstLoad: loading && logs.length === 0,
    canExport: logs.length > 0 && !exportingCsv,
    
    // Pagination config
    perPage: paginationConfig.perPage
  };
};