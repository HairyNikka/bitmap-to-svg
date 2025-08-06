// src/admin/pages/ActivityLogs.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';
import { exportActivityLogsToCSV } from '../utils/exportCSV'; // 🆕 Import PDF utility

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false); // 🆕 Export loading state
  
  // Filters & Search
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const perPage = 20;

  // Custom date range
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');

  useEffect(() => {
    fetchActivityLogs();
  }, [actionFilter, dateFilter, userFilter, currentPage, customDateFrom, customDateTo]);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      // แปลง dateFilter เป็น date_from/date_to
      let dateFromParam = customDateFrom;
      let dateToParam = customDateTo;
      
      const today = new Date();
      const formatDate = (date) => date.toISOString().split('T')[0];
      
      switch (dateFilter) {
        case 'today':
          dateFromParam = formatDate(today);
          dateToParam = formatDate(today);
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          dateFromParam = formatDate(yesterday);
          dateToParam = formatDate(yesterday);
          break;
        case 'this_week':
          const thisWeekStart = new Date(today);
          thisWeekStart.setDate(today.getDate() - today.getDay());
          dateFromParam = formatDate(thisWeekStart);
          dateToParam = formatDate(today);
          break;
        case 'last_week':
          const lastWeekEnd = new Date(today);
          lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
          const lastWeekStart = new Date(lastWeekEnd);
          lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
          dateFromParam = formatDate(lastWeekStart);
          dateToParam = formatDate(lastWeekEnd);
          break;
        case 'this_month':
          const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          dateFromParam = formatDate(thisMonthStart);
          dateToParam = formatDate(today);
          break;
        case 'last_month':
          const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
          dateFromParam = formatDate(lastMonthStart);
          dateToParam = formatDate(lastMonthEnd);
          break;
        case 'custom':
          // ใช้ customDateFrom/customDateTo ที่มีอยู่แล้ว
          break;
        default:
          // ไม่มี date filter
          dateFromParam = '';
          dateToParam = '';
      }
      
      const params = new URLSearchParams({
        page: currentPage,
        per_page: perPage,
        ...(actionFilter && { action: actionFilter }),
        ...(userFilter && { user: userFilter }),
        ...(dateFromParam && { date_from: dateFromParam }),
        ...(dateToParam && { date_to: dateToParam })
      });

      const response = await axios.get(`http://localhost:8000/api/accounts/admin/logs/?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLogs(response.data.logs);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalLogs(response.data.pagination?.total || 0);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      setError('ไม่สามารถโหลดข้อมูล Activity Logs ได้');
    } finally {
      setLoading(false);
    }
  };

// 📊 Export CSV Function (เปลี่ยนจาก PDF)
const handleExportCSV = async () => {
  setExportingPdf(true); // ใช้ state เดิมก่อน
  
  try {
    const filters = {
      actionFilter,
      dateFilter,
      userFilter,
      customDateFrom,
      customDateTo
    };
    
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
    setExportingPdf(false);
  }
};

  // รายการ actions ที่เป็นไปได้
  const actionOptions = [
    { value: '', label: 'ทุกการกระทำ' },
    { value: 'register', label: '📝 สมัครสมาชิก' },
    { value: 'login', label: '🔐 เข้าสู่ระบบ' },
    { value: 'logout', label: '🚪 ออกจากระบบ' },
    { value: 'convert_image', label: '🔄 แปลงภาพ' },
    { value: 'export_png', label: '📁 ส่งออก PNG' },
    { value: 'export_svg', label: '📁 ส่งออก SVG' },
    { value: 'export_pdf', label: '📁 ส่งออก PDF' },
    { value: 'export_eps', label: '📁 ส่งออก EPS' },
    { value: 'admin_delete_user', label: '🗑️ ลบผู้ใช้' },
    { value: 'admin_edit_user', label: '✏️ แก้ไขข้อมูลผู้ใช้' },
    { value: 'admin_promote_user', label: '⬆️ เลื่อนตำแหน่งผู้ใช้' },
    { value: 'admin_view_logs', label: '👁️ ดูบันทึกการใช้งาน' }
  ];

  const dateOptions = [
    { value: '', label: 'ทุกช่วงเวลา' },
    { value: 'today', label: 'วันนี้' },
    { value: 'yesterday', label: 'เมื่อวาน' },
    { value: 'this_week', label: 'สัปดาห์นี้' },
    { value: 'last_week', label: 'สัปดาห์ที่ผ่านมา' },
    { value: 'this_month', label: 'เดือนนี้' },
    { value: 'last_month', label: 'เดือนที่ผ่านมา' },
    { value: 'custom', label: 'กำหนดเอง' }
  ];

  const getActionIcon = (action) => {
    const iconMap = {
      'register': '📝',
      'login': '🔐',
      'logout': '🚪',
      'convert_image': '🔄',
      'export_png': '📁',
      'export_svg': '📁',
      'export_pdf': '📁',
      'export_eps': '📁',
      'admin_delete_user': '🗑️',
      'admin_edit_user': '✏️',
      'admin_promote_user': '⬆️',
      'admin_view_logs': '👁️'
    };
    return iconMap[action] || '📋';
  };

  const getActionColor = (action) => {
    if (action.startsWith('admin_')) return '#ff6b6b'; // Admin actions - แดง
    if (action.includes('export_')) return '#28a745'; // Export actions - เขียว
    if (action === 'convert_image') return '#007bff'; // Convert - น้ำเงิน
    if (action === 'login') return '#17a2b8'; // Login - ฟ้า
    if (action === 'logout') return '#6c757d'; // Logout - เทา
    if (action === 'register') return '#ffc107'; // Register - เหลือง
    return '#6c757d'; // Default - เทา
  };

  const formatDetails = (details) => {
    if (!details) return '-';
    
    try {
      if (typeof details === 'string') {
        details = JSON.parse(details);
      }
      
      const detailStrings = [];
      if (details.filename) detailStrings.push(`ไฟล์: ${details.filename}`);
      if (details.file_size) detailStrings.push(`ขนาด: ${details.file_size} bytes`);
      if (details.export_format) detailStrings.push(`รูปแบบ: ${details.export_format.toUpperCase()}`);
      
      // ปรับการแสดงผล login method ให้เข้าใจง่ายขึ้น
      if (details.login_method) {
        const methodDisplay = details.login_method === 'JWT' ? 'ผ่านระบบปกติ' : details.login_method;
        detailStrings.push(`วิธี: ${methodDisplay}`);
      }
      
      if (details.logout_method) {
        const logoutDisplay = details.logout_method === 'JWT' ? 'ผ่านระบบปกติ' : details.logout_method;
        detailStrings.push(`วิธี: ${logoutDisplay}`);
      }
      
      if (details.remaining_conversions !== undefined) {
        detailStrings.push(`เหลือ: ${details.remaining_conversions} ครั้ง`);
      }
      
      return detailStrings.length > 0 ? detailStrings.join(', ') : '-';
    } catch (e) {
      return details.toString();
    }
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
    filtersContainer: {
      backgroundColor: '#2a2a2a',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid #3a3a3a'
    },
    filtersGrid: {
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
    filterLabel: {
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
      gap: '10px'
    },
    // 🆕 Button Container
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
      cursor: 'pointer'
    },
    // 🆕 Export PDF Button
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
      gap: '8px'
    },
    exportButtonDisabled: {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed',
      opacity: 0.6
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
      borderBottom: '1px solid #3a3a3a',
      verticalAlign: 'top'
    },
    actionCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    actionBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600',
      color: '#ffffff'
    },
    userBadge: {
      backgroundColor: '#495057',
      color: '#ffffff',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '12px'
    },
    timeCell: {
      fontSize: '12px'
    },
    timeAgo: {
      color: '#007bff',
      fontWeight: '600'
    },
    timestamp: {
      color: '#a0a0a0',
      marginTop: '2px'
    },
    detailsCell: {
      fontSize: '12px',
      color: '#a0a0a0',
      maxWidth: '200px',
      wordBreak: 'break-word'
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
      color: '#ff6b6b'
    },
    refreshButton: {
      backgroundColor: '#007bff',
      color: '#ffffff',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      marginTop: '20px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      color: '#a0a0a0'
    }
  };

  const clearFilters = () => {
    setActionFilter('');
    setDateFilter('');
    setUserFilter('');
    setCustomDateFrom('');
    setCustomDateTo('');
    setCurrentPage(1);
  };

  if (loading && logs.length === 0) {
    return (
      <AdminLayout>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div style={styles.errorContainer}>
          <h3>เกิดข้อผิดพลาด</h3>
          <p>{error}</p>
          <button 
            onClick={fetchActivityLogs}
            style={styles.refreshButton}
          >
            ลองใหม่
          </button>
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
            <h1 style={styles.title}>Activity Logs</h1>
            <p style={styles.subtitle}>
              บันทึกการใช้งานระบบทั้งหมด
              <span style={styles.totalCount}>{totalLogs.toLocaleString()} รายการ</span>
            </p>
          </div>

          {/* Filters */}
          <div style={styles.filtersContainer}>
            <div style={styles.filtersGrid}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>ค้นหาผู้ใช้</label>
                <input
                  type="text"
                  placeholder="ชื่อผู้ใช้..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>การกระทำ</label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  style={styles.select}
                >
                  {actionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>ช่วงเวลา</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
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

            {/* Custom Date Range */}
            {dateFilter === 'custom' && (
              <div style={styles.customDateContainer}>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>จากวันที่</label>
                  <input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>ถึงวันที่</label>
                  <input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
            )}

            {/* 🆕 Buttons Container */}
            <div style={styles.buttonContainer}>
              <button
                onClick={clearFilters}
                style={styles.clearButton}
              >
                ล้างตัวกรอง
              </button>
              
              <button
                onClick={handleExportCSV}
                disabled={exportingPdf || logs.length === 0}
                style={{
                  ...styles.exportButton,
                  ...(exportingPdf || logs.length === 0 ? styles.exportButtonDisabled : {})
                }}
              >
                {exportingPdf ? (
                  <>
                    <span>⏳</span>
                    กำลังสร้าง PDF...
                  </>
                ) : (
                  <>
                    <span>📄</span>
                    Export CSV
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Activity Logs Table */}
          {logs.length > 0 ? (
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>ผู้ใช้</th>
                  <th style={styles.th}>การกระทำ</th>
                  <th style={styles.th}>เวลา</th>
                  <th style={styles.th}>รายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={styles.td}>
                      <span style={styles.userBadge}>
                        {log.user_username || 'Unknown'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionCell}>
                        <span>{getActionIcon(log.action)}</span>
                        <span 
                          style={{
                            ...styles.actionBadge,
                            backgroundColor: getActionColor(log.action)
                          }}
                        >
                          {log.action_display}
                        </span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.timeCell}>
                        <div style={styles.timeAgo}>{log.time_ago}</div>
                        <div style={styles.timestamp}>{log.formatted_timestamp}</div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.detailsCell}>
                        {formatDetails(log.details)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={styles.emptyState}>
              <h3>ไม่พบข้อมูล</h3>
              <p>ไม่มี Activity Logs ที่ตรงกับเงื่อนไขที่ค้นหา</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
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
          )}
        </div>
      </AdminLayout>
    </>
  );
}