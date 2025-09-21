// admin/utils/ActivityLogs/userRoleUtils.js
import { faUser, faUserShield, faUserTie } from '@fortawesome/free-solid-svg-icons';

/**
 * ดึงข้อมูล icon และสีตามตำแหน่งผู้ใช้
 * @param {string} userType - ประเภทผู้ใช้ (user, admin, superuser)
 * @returns {object} { icon, color, backgroundColor, displayName }
 */
export const getUserRoleInfo = (userType) => {
  switch (userType) {
    case 'superuser':
      return {
        icon: faUserTie,
        color: '#000000', // ข้อความสีดำ
        backgroundColor: '#eab308', // พื้นหลังสีเหลือง
        displayName: 'Super User'
      };
    case 'admin':
      return {
        icon: faUserShield,
        color: '#ffffff', // ข้อความสีขาว
        backgroundColor: '#dc2626', // พื้นหลังสีแดง
        displayName: 'Admin'
      };
    case 'user':
    default:
      return {
        icon: faUser,
        color: '#ffffff', // ข้อความสีขาว
        backgroundColor: '#6b7280', // พื้นหลังสีเทา
        displayName: 'User'
      };
  }
};

/**
 * สร้าง style object สำหรับ user badge พร้อม role
 * @param {string} userType - ประเภทผู้ใช้
 * @returns {object} style object
 */
export const getUserBadgeWithRoleStyle = (userType) => {
  const roleInfo = getUserRoleInfo(userType);
  
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      alignItems: 'flex-start' // ชิดซ้าย
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
      width: 'fit-content' // ขนาดตามเนื้อหา
    },
    roleText: {
      fontSize: '10px',
      color: '#a0a0a0',
      fontWeight: '400',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginLeft: '4px' // เยื้องนิดหน่อยให้ชิดขอบสี
    }
  };
};