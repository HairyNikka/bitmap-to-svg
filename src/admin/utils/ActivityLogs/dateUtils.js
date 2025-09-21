// admin/utils/ActivityLogs/dateUtils.js

/**
 * ดึงวันที่ปัจจุบันในเขตเวลาของกรุงเทพ
 * @returns {Date} วันที่ในเขตเวลากรุงเทพ
 */
export const getBangkokDate = () => {
  const bangkok = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Bangkok"}));
  return bangkok;
};

/**
 * จัดรูปแบบวันที่เป็น YYYY-MM-DD
 * @param {Date} date - วันที่ที่ต้องการจัดรูปแบบ
 * @returns {string} วันที่ในรูปแบบ YYYY-MM-DD
 */
export const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * คำนวณช่วงวันที่ตาม filter ที่เลือก
 * @param {string} dateFilter - ประเภทของ date filter
 * @param {string} customDateFrom - วันที่เริ่มต้นที่กำหนดเอง
 * @param {string} customDateTo - วันที่สิ้นสุดที่กำหนดเอง
 * @returns {object} object ที่มี dateFrom และ dateTo
 */
export const calculateDateRange = (dateFilter, customDateFrom = '', customDateTo = '') => {
  const today = getBangkokDate();
  let dateFrom = '';
  let dateTo = '';

  switch (dateFilter) {
    case 'today':
      dateFrom = formatDate(today);
      dateTo = formatDate(today);
      break;

    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      dateFrom = formatDate(yesterday);
      dateTo = formatDate(yesterday);
      break;

    case 'this_week':
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      dateFrom = formatDate(thisWeekStart);
      dateTo = formatDate(today);
      break;

    case 'last_week':
      const lastWeekEnd = new Date(today);
      lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
      const lastWeekStart = new Date(lastWeekEnd);
      lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
      dateFrom = formatDate(lastWeekStart);
      dateTo = formatDate(lastWeekEnd);
      break;

    case 'this_month':
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      dateFrom = formatDate(thisMonthStart);
      dateTo = formatDate(today);
      break;

    case 'last_month':
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      dateFrom = formatDate(lastMonthStart);
      dateTo = formatDate(lastMonthEnd);
      break;

    case 'custom':
      dateFrom = customDateFrom;
      dateTo = customDateTo;
      break;

    default:
      // ไม่มี date filter
      dateFrom = '';
      dateTo = '';
  }

  return { dateFrom, dateTo };
};

/**
 * สร้าง URL parameters สำหรับ API call
 * @param {object} filters - object ที่มี filter ต่างๆ
 * @param {number} currentPage - หน้าปัจจุบัน
 * @param {number} perPage - จำนวนรายการต่อหน้า
 * @returns {URLSearchParams} URL parameters พร้อมใช้งาน
 */
export const buildApiParams = (filters, currentPage, perPage) => {
  const { 
    actionFilter, 
    userFilter, 
    userTypeFilter,
    dateFilter, 
    customDateFrom, 
    customDateTo 
  } = filters;

  // คำนวณช่วงวันที่
  const { dateFrom, dateTo } = calculateDateRange(dateFilter, customDateFrom, customDateTo);

  // สร้าง parameters
  const params = new URLSearchParams({
    page: currentPage,
    per_page: perPage
  });

  // เพิ่ม parameters เฉพาะที่มีค่า
  if (actionFilter) params.append('action', actionFilter);
  if (userFilter) params.append('user', userFilter);
  if (userTypeFilter) params.append('user_type', userTypeFilter);
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);

  return params;
};

/**
 * ตรวจสอบว่าวันที่ที่กำหนดเองถูกต้องหรือไม่
 * @param {string} dateFrom - วันที่เริ่มต้น
 * @param {string} dateTo - วันที่สิ้นสุด
 * @returns {object} ผลการตรวจสอบ { isValid, message }
 */
export const validateCustomDateRange = (dateFrom, dateTo) => {
  if (!dateFrom || !dateTo) {
    return {
      isValid: false,
      message: 'กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุด'
    };
  }

  const startDate = new Date(dateFrom);
  const endDate = new Date(dateTo);

  if (startDate > endDate) {
    return {
      isValid: false,
      message: 'วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด'
    };
  }

  const today = getBangkokDate();
  if (endDate > today) {
    return {
      isValid: false,
      message: 'วันที่สิ้นสุดต้องไม่เกินวันที่ปัจจุบัน'
    };
  }

  // ตรวจสอบระยะห่างไม่เกิน 1 ปี
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  
  if (startDate < oneYearAgo) {
    return {
      isValid: false,
      message: 'ไม่สามารถเลือกวันที่ย้อนหลังเกิน 1 ปีได้'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * แปลงวันที่เป็นรูปแบบที่แสดงผลได้
 * @param {string} dateString - วันที่ในรูปแบบ string
 * @returns {string} วันที่ในรูปแบบที่อ่านง่าย
 */
export const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * แปลงวันที่และเวลาเป็นรูปแบบที่แสดงผลได้
 * @param {string} dateTimeString - วันที่และเวลาในรูปแบบ string
 * @returns {string} วันที่และเวลาในรูปแบบที่อ่านง่าย
 */
export const formatDisplayDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateTimeString;
  }
};

/**
 * คำนวณจำนวนวันระหว่างสองวันที่
 * @param {string} dateFrom - วันที่เริ่มต้น
 * @param {string} dateTo - วันที่สิ้นสุด
 * @returns {number} จำนวนวัน
 */
export const calculateDaysBetween = (dateFrom, dateTo) => {
  if (!dateFrom || !dateTo) return 0;
  
  const startDate = new Date(dateFrom);
  const endDate = new Date(dateTo);
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 เพื่อรวมวันแรกด้วย
};