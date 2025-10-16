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

