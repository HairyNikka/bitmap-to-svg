// CSV Export Utility สำหรับ Activity Logs และ User Management

// Export Activity Logs เป็น CSV 
export const exportActivityLogsToCSV = async (filters, formatDetails) => {
  console.log('Starting CSV export...');
  
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
        cleanCsvCell(formatDetails ? formatDetails(log.details, log.action) : (log.details || ''))
      ])
    ];

    // ใช้ proper CSV formatting
    const csvContent = csvData.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`) // Escape quotes properly
    ).join('\n');
    
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
    
    console.log('CSV exported successfully!');
    
    return {
      success: true,
      message: 'ส่งออก CSV สำเร็จ!'
    };
    
  } catch (error) {
    console.error('CSV export error:', error);
    return {
      success: false,
      message: 'ไม่สามารถส่งออกไฟล์ได้ กรุณาลองใหม่อีกครั้ง'
    };
  }
};

// Export Users List เป็น CSV
export const exportUsersToCSV = async (users, filters = {}) => {
  console.log('Starting Users CSV export...');
  
  try {
    if (!users || users.length === 0) {
      return {
        success: false,
        message: 'ไม่มีข้อมูลผู้ใช้สำหรับส่งออก'
      };
    }
    
    // สร้าง CSV headers
    const headers = [
      'ชื่อผู้ใช้',
      'อีเมล', 
      'ประเภท',
      'สถานะ',
      'วันที่สมัคร',
      'เข้าสู่ระบบล่าสุด',
      'กิจกรรมล่าสุด'
    ];
    
    // แปลงข้อมูลผู้ใช้เป็น CSV rows
    const csvData = [
      headers,
      ...users.map(user => [
        user.username || '',
        user.email || '',
        getUserTypeDisplay(user.user_type),
        user.is_active ? 'ใช้งานได้' : 'ปิดใช้งาน',
        formatDateForCSV(user.date_joined),
        formatDateForCSV(user.last_login) || 'ไม่เคยเข้าใช้',
        formatLastActivityForCSV(user.last_activity)
      ])
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`) // Escape quotes
    ).join('\n');
    
    // เพิ่ม BOM สำหรับ UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // สร้างชื่อไฟล์
    const timestamp = new Date().toISOString().slice(0, 10);
    const filterSuffix = getFilterSuffix(filters);
    link.setAttribute('download', `users_list_${timestamp}${filterSuffix}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('Users CSV exported successfully!');
    
    return {
      success: true,
      message: `ส่งออกรายชื่อผู้ใช้ ${users.length} คน สำเร็จ!`
    };
    
  } catch (error) {
    console.error('Users CSV export error:', error);
    return {
      success: false,
      message: 'ไม่สามารถส่งออกรายชื่อผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง'
    };
  }
};

// Export User Activity Logs (สำหรับผู้ใช้คนเดียว)
export const exportUserActivityLogs = async (username, formatDetails) => {
  console.log(`Starting Activity Logs export for user: ${username}`);
  
  try {
    // สร้าง filters สำหรับผู้ใช้คนนี้
    const userFilters = {
      userFilter: username,
      actionFilter: '',
      userTypeFilter: '',
      dateFilter: '',
      customDateFrom: '',
      customDateTo: ''
    };
    
    // ใช้ function ที่มีอยู่แล้ว
    const result = await exportActivityLogsToCSV(userFilters, formatDetails);
    
    if (result.success) {
      // เปลี่ยนชื่อไฟล์ให้เฉพาะเจาะจงกับผู้ใช้
      return {
        success: true,
        message: `ส่งออก Activity Logs ของ ${username} สำเร็จ!`
      };
    }
    
    return result;
    
  } catch (error) {
    console.error(`Export user activity error for ${username}:`, error);
    return {
      success: false,
      message: `ไม่สามารถส่งออก Activity Logs ของ ${username} ได้`
    };
  }
};

//  Helper Functions 
// ทำความสะอาดข้อความสำหรับ CSV (แก้ปัญหาบรรทัดใหม่)
const cleanCsvCell = (text) => {
  if (!text) return '';
  
  return String(text)
    .replace(/\n/g, ' | ')        // เปลี่ยนบรรทัดใหม่เป็น |
    .replace(/\r/g, '')           // เอา carriage return ออก
    .replace(/,/g, ';')           // เปลี่ยน comma เป็น semicolon
    .replace(/"/g, '""')          // escape double quotes
    .trim();                      // ตัด whitespace
};

// แปลง user_type เป็นภาษาไทย
const getUserTypeDisplay = (userType) => {
  switch (userType) {
    case 'superuser':
      return 'Super User';
    case 'admin':
      return 'Admin';
    case 'user':
    default:
      return 'User';
  }
};

// ดึงข้อมูล logs ทั้งหมดตาม filter (ใช้ API ที่มีอยู่แล้ว)
const fetchAllLogsData = async (filters) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  
  // แปลง date filters
  const { dateFromParam, dateToParam } = processDateFilters(filters);
  
  const params = new URLSearchParams({
    per_page: 1000, // ดึงข้อมูลเยอะๆ
    ...(filters.actionFilter && { action: filters.actionFilter }),
    ...(filters.userFilter && { user: filters.userFilter }),
    ...(filters.userTypeFilter && { user_type: filters.userTypeFilter }),
    ...(dateFromParam && { date_from: dateFromParam }),
    ...(dateToParam && { date_to: dateToParam })
  });

  console.log('Exporting with filters:', {
    action: filters.actionFilter,
    user: filters.userFilter,
    user_type: filters.userTypeFilter,
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
  console.log(`Retrieved ${data.logs.length} logs for export`);
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

// Helper functions สำหรับ Users export
const formatDateForCSV = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

const formatLastActivityForCSV = (lastActivity) => {
  if (!lastActivity || !lastActivity.action) {
    return 'ไม่มีข้อมูล';
  }
  
  const actionMap = {
    'login': 'เข้าสู่ระบบ',
    'logout': 'ออกจากระบบ',
    'register': 'สมัครสมาชิก',
    'convert_image': 'แปลงภาพ',
    'export_png': 'ส่งออก PNG',
    'export_svg': 'ส่งออก SVG',
    'export_pdf': 'ส่งออก PDF',
    'export_eps': 'ส่งออก EPS',
    'password_reset': 'รีเซ็ตรหัสผ่าน',
    'profile_email_change': 'เปลี่ยนอีเมล',
    'profile_password_change': 'เปลี่ยนรหัสผ่าน'
  };
  
  const actionDisplay = actionMap[lastActivity.action] || lastActivity.action;
  
  if (lastActivity.time_ago) {
    return `${actionDisplay} (${lastActivity.time_ago})`;
  }
  
  return actionDisplay;
};

const getFilterSuffix = (filters) => {
  const parts = [];
  
  if (filters.search) {
    parts.push(`search_${filters.search.replace(/[^a-zA-Z0-9]/g, '_')}`);
  }
  
  if (filters.userTypeFilter) {
    parts.push(`type_${filters.userTypeFilter}`);
  }
  
  if (filters.statusFilter) {
    const statusText = filters.statusFilter === 'true' ? 'active' : 'inactive';
    parts.push(`status_${statusText}`);
  }
  
  return parts.length > 0 ? `_${parts.join('_')}` : '';
};