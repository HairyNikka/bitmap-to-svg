// admin/utils/UserManagement/formatUtils.js
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { userTypeStyles, userTypeDisplayMap } from './constants';

/**
 * ดึงข้อมูล style สำหรับ user type
 * @param {string} userType - ประเภทผู้ใช้
 * @returns {object} style object
 */
export const getUserTypeStyle = (userType) => {
  return userTypeStyles[userType] || userTypeStyles['user'];
};

/**
 * สร้าง style object สำหรับ user badge (copy จาก ActivityLogs)
 * @param {string} userType - ประเภทผู้ใช้
 * @returns {object} style object
 */
export const getUserBadgeWithRoleStyle = (userType) => {
  const roleInfo = getUserTypeStyle(userType);
  
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      alignItems: 'flex-start'
    },
    userBadge: {
      backgroundColor: roleInfo.backgroundColor,
      color: roleInfo.color,
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      width: 'fit-content'
    },
    roleText: {
      fontSize: '10px',
      color: '#a0a0a0',
      fontWeight: '400',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginLeft: '4px'
    }
  };
};

/**
 * สร้าง style object สำหรับ status badge
 * @param {boolean} isActive - สถานะการใช้งาน
 * @returns {object} style object
 */
export const getStatusBadgeStyle = (isActive) => ({
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: '600',
  backgroundColor: isActive ? '#28a745' : '#dc3545',
  color: '#ffffff'
});

/**
 * แปลงสถานะเป็นข้อความแสดงผล
 * @param {boolean} isActive - สถานะการใช้งาน
 * @returns {string} ข้อความสถานะ
 */
export const formatUserStatus = (isActive) => {
  return isActive ? 'ใช้งานได้' : 'ปิดใช้งาน';
};

/**
 * แปลงประเภทผู้ใช้เป็นข้อความแสดงผล
 * @param {string} userType - ประเภทผู้ใช้
 * @returns {string} ข้อความประเภทผู้ใช้
 */
export const formatUserType = (userType) => {
  return userTypeDisplayMap[userType] || userType;
};

/**
 * จัดรูปแบบวันที่สมัครสมาชิก
 * @param {string} dateString - วันที่ในรูปแบบ string
 * @returns {string} วันที่ที่จัดรูปแบบแล้ว
 */
export const formatJoinDate = (dateString) => {
  if (!dateString) return '-';
  
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

/**
 * จัดรูปแบบกิจกรรมล่าสุด
 * @param {object} lastActivity - ข้อมูลกิจกรรมล่าสุด
 * @returns {string} ข้อความกิจกรรมล่าสุด
 */
export const formatLastActivity = (lastActivity) => {
  if (!lastActivity || !lastActivity.action) {
    return 'ไม่มีข้อมูล';
  }
  
  // Map action เป็นข้อความภาษาไทย
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
  
  // แสดงเวลาถ้ามี
  if (lastActivity.time_ago) {
    return `${actionDisplay} (${lastActivity.time_ago})`;
  }
  
  return actionDisplay;
};

/**
 * สร้าง style สำหรับปุ่ม action
 * @param {string} actionType - ประเภทการกระทำ
 * @param {boolean} disabled - สถานะปิดใช้งาน
 * @returns {object} style object
 */
export const getActionButtonStyle = (actionType, disabled = false) => {
  const baseStyle = {
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    marginRight: '8px',
    opacity: disabled ? 0.5 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  };
  
  const colorMap = {
    edit: {
      backgroundColor: '#007bff',
      color: '#ffffff'
    },
    delete: {
      backgroundColor: '#dc3545',
      color: '#ffffff'
    },
    export: {
      backgroundColor: '#28a745',
      color: '#ffffff'
    }
  };
  
  return {
    ...baseStyle,
    ...(colorMap[actionType] || colorMap.edit)
  };
};

/**
 * จัดรูปแบบข้อมูลผู้ใช้สำหรับ export CSV
 * @param {object} user - ข้อมูลผู้ใช้
 * @returns {object} ข้อมูลที่จัดรูปแบบสำหรับ CSV
 */
export const formatUserForCSV = (user) => {
  return {
    'ชื่อผู้ใช้': user.username || '',
    'อีเมล': user.email || '',
    'ประเภท': formatUserType(user.user_type),
    'สถานะ': formatUserStatus(user.is_active),
    'วันที่สมัคร': formatJoinDate(user.date_joined),
    'กิจกรรมล่าสุด': formatLastActivity(user.last_activity),
    'วันที่เข้าสู่ระบบล่าสุด': user.last_login ? formatJoinDate(user.last_login) : 'ไม่เคยเข้าใช้'
  };
};

/**
 * คำนวณสถิติผู้ใช้
 * @param {Array} users - รายการผู้ใช้
 * @returns {object} สถิติผู้ใช้
 */
export const calculateUserStats = (users) => {
  if (!Array.isArray(users) || users.length === 0) {
    return {
      total: 0,
      active: 0,
      inactive: 0,
      byType: {
        user: 0,
        admin: 0,
        superuser: 0
      }
    };
  }
  
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    byType: {
      user: users.filter(u => u.user_type === 'user').length,
      admin: users.filter(u => u.user_type === 'admin').length,
      superuser: users.filter(u => u.user_type === 'superuser').length
    }
  };
  
  return stats;
};

/**
 * สร้างข้อความสรุปสถิติ
 * @param {object} stats - สถิติผู้ใช้
 * @returns {string} ข้อความสรุป
 */
export const formatStatsMessage = (stats) => {
  if (stats.total === 0) {
    return 'ไม่พบผู้ใช้ในระบบ';
  }
  
  return `ทั้งหมด ${stats.total.toLocaleString()} คน (ใช้งานได้ ${stats.active} คน, ปิดใช้งาน ${stats.inactive} คน)`;
};

/**
 * ตรวจสอบว่าผู้ใช้เป็นผู้ใช้ใหม่หรือไม่ (สมัครภายใน 7 วัน)
 * @param {string} dateJoined - วันที่สมัคร
 * @returns {boolean} true ถ้าเป็นผู้ใช้ใหม่
 */
export const isNewUser = (dateJoined) => {
  if (!dateJoined) return false;
  
  const joinDate = new Date(dateJoined);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return joinDate > sevenDaysAgo;
};

/**
 * สร้าง badge สำหรับผู้ใช้ใหม่
 * @param {string} dateJoined - วันที่สมัคร
 * @returns {object|null} style object หรือ null ถ้าไม่ใช่ผู้ใช้ใหม่
 */
export const getNewUserBadge = (dateJoined) => {
  if (!isNewUser(dateJoined)) return null;
  
  return {
    backgroundColor: '#17a2b8',
    color: '#ffffff',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600',
    marginLeft: '8px'
  };
};