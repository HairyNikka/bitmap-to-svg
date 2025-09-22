// admin/utils/UserManagement/permissionUtils.js
import { permissionLevels, actionTypes } from './constants';

/**
 * ตรวจสอบว่าผู้ใช้สามารถแก้ไขผู้ใช้คนอื่นได้หรือไม่
 * @param {object} currentUser - ผู้ใช้ปัจจุบัน
 * @param {object} targetUser - ผู้ใช้ที่ต้องการแก้ไข
 * @returns {boolean}
 */
export const canEditUser = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) return false;
  
  // ไม่สามารถแก้ไขตัวเองได้
  if (currentUser.id === targetUser.id) return false;
  
  // Superuser สามารถแก้ไขทุกคนได้ ยกเว้น superuser คนอื่น
  if (currentUser.user_type === 'superuser') {
    return targetUser.user_type !== 'superuser';
  }
  
  // Admin สามารถแก้ไขแค่ user ธรรมดาได้
  if (currentUser.user_type === 'admin') {
    return targetUser.user_type === 'user';
  }
  
  return false;
};

/**
 * ตรวจสอบว่าผู้ใช้สามารถลบผู้ใช้คนอื่นได้หรือไม่
 * @param {object} currentUser - ผู้ใช้ปัจจุบัน
 * @param {object} targetUser - ผู้ใช้ที่ต้องการลบ
 * @returns {boolean}
 */
export const canDeleteUser = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) return false;
  
  // ไม่สามารถลบตัวเองได้
  if (currentUser.id === targetUser.id) return false;
  
  // Superuser สามารถลบทุกคนได้ ยกเว้น superuser คนอื่น
  if (currentUser.user_type === 'superuser') {
    return targetUser.user_type !== 'superuser';
  }
  
  // Admin สามารถลบแค่ user ธรรมดาได้
  if (currentUser.user_type === 'admin') {
    return targetUser.user_type === 'user';
  }
  
  return false;
};

/**
 * ตรวจสอบว่าผู้ใช้สามารถเลื่อนตำแหน่งผู้ใช้คนอื่นได้หรือไม่
 * @param {object} currentUser - ผู้ใช้ปัจจุบัน
 * @param {object} targetUser - ผู้ใช้ที่ต้องการเลื่อนตำแหน่ง
 * @param {string} newUserType - ตำแหน่งใหม่ที่ต้องการเลื่อน
 * @returns {boolean}
 */
export const canPromoteUser = (currentUser, targetUser, newUserType) => {
  if (!currentUser || !targetUser) return false;
  
  // ไม่สามารถเลื่อนตำแหน่งตัวเองได้
  if (currentUser.id === targetUser.id) return false;
  
  // Superuser สามารถเลื่อนตำแหน่งได้
  if (currentUser.user_type === 'superuser') {
    // ไม่สามารถเลื่อนให้เป็น superuser ได้
    if (newUserType === 'superuser') return false;
    // ไม่สามารถเลื่อนตำแหน่ง superuser คนอื่นได้
    if (targetUser.user_type === 'superuser') return false;
    return true;
  }
  
  // Admin สามารถเลื่อน user ธรรมดาเป็น admin ได้
  if (currentUser.user_type === 'admin') {
    return targetUser.user_type === 'user' && newUserType === 'admin';
  }
  
  return false;
};

/**
 * ตรวจสอบว่าผู้ใช้สามารถดูข้อมูลผู้ใช้คนอื่นได้หรือไม่
 * @param {object} currentUser - ผู้ใช้ปัจจุบัน
 * @param {object} targetUser - ผู้ใช้ที่ต้องการดูข้อมูล
 * @returns {boolean}
 */
export const canViewUser = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) return false;
  
  // สามารถดูข้อมูลตัวเองได้
  if (currentUser.id === targetUser.id) return true;
  
  // Admin และ superuser สามารถดูข้อมูลผู้ใช้ได้
  return ['admin', 'superuser'].includes(currentUser.user_type);
};

/**
 * ตรวจสอบว่าผู้ใช้สามารถส่งออก Activity Logs ของผู้ใช้คนอื่นได้หรือไม่
 * @param {object} currentUser - ผู้ใช้ปัจจุบัน
 * @param {object} targetUser - ผู้ใช้ที่ต้องการส่งออก logs
 * @returns {boolean}
 */
export const canExportUserActivity = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) return false;
  
  // Admin และ superuser สามารถส่งออก activity logs ได้
  return ['admin', 'superuser'].includes(currentUser.user_type);
};

/**
 * ดึงรายการ actions ที่ผู้ใช้สามารถทำได้กับผู้ใช้คนอื่น
 * @param {object} currentUser - ผู้ใช้ปัจจุบัน
 * @param {object} targetUser - ผู้ใช้เป้าหมาย
 * @returns {Array} รายการ actions
 */
export const getAvailableActions = (currentUser, targetUser) => {
  const actions = [];
  
  if (canEditUser(currentUser, targetUser)) {
    actions.push(actionTypes.EDIT);
  }
  
  if (canDeleteUser(currentUser, targetUser)) {
    actions.push(actionTypes.DELETE);
  }
  
  if (canExportUserActivity(currentUser, targetUser)) {
    actions.push(actionTypes.EXPORT_ACTIVITY);
  }
  
  return actions;
};

/**
 * ตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงหน้า User Management หรือไม่
 * @param {object} currentUser - ผู้ใช้ปัจจุบัน
 * @returns {boolean}
 */
export const canAccessUserManagement = (currentUser) => {
  if (!currentUser) return false;
  return ['admin', 'superuser'].includes(currentUser.user_type);
};

/**
 * ดึงตำแหน่งที่ผู้ใช้สามารถมองเห็นในระบบกรองได้
 * @param {object} currentUser - ผู้ใช้ปัจจุบัน
 * @returns {Array} รายการ user types ที่สามารถกรองได้
 */
export const getVisibleUserTypes = (currentUser) => {
  if (!currentUser) return [];
  
  if (currentUser.user_type === 'superuser') {
    return ['user', 'admin', 'superuser'];
  }
  
  if (currentUser.user_type === 'admin') {
    return ['user', 'admin'];
  }
  
  return [];
};

/**
 * ตรวจสอบระดับสิทธิ์ของผู้ใช้
 * @param {object} currentUser - ผู้ใช้ปัจจุบัน
 * @returns {number} ระดับสิทธิ์
 */
export const getUserPermissionLevel = (currentUser) => {
  if (!currentUser) return permissionLevels.NONE;
  
  switch (currentUser.user_type) {
    case 'superuser':
      return permissionLevels.FULL;
    case 'admin':
      return permissionLevels.DELETE;
    case 'user':
      return permissionLevels.VIEW;
    default:
      return permissionLevels.NONE;
  }
};

/**
 * สร้างข้อความแสดงสิทธิ์สำหรับ tooltip หรือ info
 * @param {object} currentUser - ผู้ใช้ปัจจุบัน
 * @param {object} targetUser - ผู้ใช้เป้าหมาย
 * @param {string} action - การกระทำที่ต้องการ
 * @returns {string} ข้อความอธิบายสิทธิ์
 */
export const getPermissionMessage = (currentUser, targetUser, action) => {
  if (!currentUser) return 'คุณต้องเข้าสู่ระบบก่อน';
  
  switch (action) {
    case actionTypes.EDIT:
      if (!canEditUser(currentUser, targetUser)) {
        if (currentUser.id === targetUser.id) {
          return 'ไม่สามารถแก้ไขข้อมูลตัวเองได้';
        }
        return 'คุณไม่มีสิทธิ์แก้ไขผู้ใช้คนนี้';
      }
      return 'คุณสามารถแก้ไขผู้ใช้คนนี้ได้';
      
    case actionTypes.DELETE:
      if (!canDeleteUser(currentUser, targetUser)) {
        if (currentUser.id === targetUser.id) {
          return 'ไม่สามารถลบตัวเองได้';
        }
        return 'คุณไม่มีสิทธิ์ลบผู้ใช้คนนี้';
      }
      return 'คุณสามารถลบผู้ใช้คนนี้ได้';
      
    case actionTypes.EXPORT_ACTIVITY:
      if (!canExportUserActivity(currentUser, targetUser)) {
        return 'คุณไม่มีสิทธิ์ส่งออก Activity Logs';
      }
      return 'คุณสามารถส่งออก Activity Logs ของผู้ใช้คนนี้ได้';
      
    default:
      return 'ไม่ระบุการกระทำ';
  }
};