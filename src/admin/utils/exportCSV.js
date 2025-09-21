// src/admin/utils/exportCSV.js
// CSV Export Utility สำหรับ Activity Logs - เป็น CSV

// 📊 Export Activity Logs เป็น CSV 
export const exportActivityLogsToCSV = async (filters, formatDetails) => {
  console.log('📊 Starting CSV export...');
  
  try {
    // ดึงข้อมูลจาก API ที่มีอยู่แล้ว
    const logsData = await fetchAllLogsData(filters);
    
    // สร้าง CSV
    const headers = ['ผู้ใช้', 'ตำแหน่ง', 'การกระทำ', 'เวลา', 'รายละเอียด'];
    const csvData = [
      headers,
      ...logsData.map(log => [
        log.user_username || 'Unknown',
        getUserTypeDisplay(log.user_type),
        log.action_display || log.action,
        log.formatted_timestamp || '',
        formatDetails ? formatDetails(log.details, log.action).replace(/,/g, ';') : (log.details || '').replace(/,/g, ';')
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // เพิ่ม BOM สำหรับ UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('✅ CSV exported successfully!');
    
    return {
      success: true,
      message: '📊 ส่งออก CSV สำเร็จ!'
    };
    
  } catch (error) {
    console.error('CSV export error:', error);
    return {
      success: false,
      message: 'ไม่สามารถส่งออกไฟล์ได้ กรุณาลองใหม่อีกครั้ง'
    };
  }
};

// แปลง user_type เป็นภาษาไทย
const getUserTypeDisplay = (userType) => {
  switch (userType) {
    case 'superuser':
      return 'ผู้ดูแลสูงสุด';
    case 'admin':
      return 'ผู้ดูแลระบบ';
    case 'user':
    default:
      return 'ผู้ใช้ทั่วไป';
  }
};

// 🔍 ดึงข้อมูล logs ทั้งหมดตาม filter (ใช้ API ที่มีอยู่แล้ว)
const fetchAllLogsData = async (filters) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  
  // แปลง date filters
  const { dateFromParam, dateToParam } = processDateFilters(filters);
  
  const params = new URLSearchParams({
    per_page: 1000, // ดึงข้อมูลเยอะๆ
    ...(filters.actionFilter && { action: filters.actionFilter }),
    ...(filters.userFilter && { user: filters.userFilter }),
    ...(filters.userTypeFilter && { user_type: filters.userTypeFilter }), // เพิ่มบรรทัดนี้
    ...(dateFromParam && { date_from: dateFromParam }),
    ...(dateToParam && { date_to: dateToParam })
  });

  console.log('🔍 Exporting with filters:', {
    action: filters.actionFilter,
    user: filters.userFilter,
    user_type: filters.userTypeFilter, // เพิ่มสำหรับ debug
    date_from: dateFromParam,
    date_to: dateToParam
  });

  const response = await fetch(`http://localhost:8000/api/accounts/admin/logs/?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch logs data');
  }

  const data = await response.json();
  console.log(`📊 Retrieved ${data.logs.length} logs for export`);
  return data.logs;
};

// ประมวลผล date filters
const processDateFilters = (filters) => {
  const { dateFilter, customDateFrom, customDateTo } = filters;
  
  let dateFromParam = customDateFrom;
  let dateToParam = customDateTo;
  
  const getBangkokDate = () => {
    const bangkok = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Bangkok"}));
    return bangkok;
  };
  
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  const today = getBangkokDate(); 
  
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
      dateFromParam = '';
      dateToParam = '';
  }
  
  return { dateFromParam, dateToParam };
};