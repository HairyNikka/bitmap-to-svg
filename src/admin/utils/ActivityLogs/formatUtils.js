// admin/utils/ActivityLogs/formatUtils.js - Complete Enhanced Version
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  actionIconMap, 
  actionColorMap, 
  defaultActionIcon, 
  defaultActionColor 
} from './constants';

/**
 * แปลงขนาดไฟล์จาก bytes เป็นรูปแบบที่อ่านง่าย
 * @param {number} bytes - ขนาดไฟล์ในหน่วย bytes
 * @returns {string} ขนาดไฟล์ที่จัดรูปแบบแล้ว
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * จัดรูปแบบรายละเอียดสำหรับ Profile Changes
 * @param {object} details - รายละเอียดของการเปลี่ยนแปลงโปรไฟล์
 * @param {string} action - ประเภทของ action
 * @returns {string|null} รายละเอียดที่จัดรูปแบบแล้ว หรือ null ถ้าไม่ใช่ profile action
 */
const formatProfileChangeDetails = (details, action) => {
  switch (action) {
    case 'profile_email_change':
      if (details.old_email && details.new_email) {
        return `เปลี่ยนจาก: ${details.old_email}\nเป็น: ${details.new_email}`;
      }
      return details.change_summary || 'เปลี่ยนอีเมล';

    case 'profile_password_change':
      return 'ผู้ใช้เปลี่ยนรหัสผ่านผ่านหน้าโปรไฟล์';

    case 'profile_security_questions_change':
      if (details.changes && Array.isArray(details.changes)) {
        const changeLines = details.changes.map(change => 
          `คำถามข้อ ${change.question_number}:\nจาก: "${change.old_question}"\nเป็น: "${change.new_question}"`
        );
        return changeLines.join('\n\n');
      }
      return details.change_summary || 'เปลี่ยนคำถามความปลอดภัย';

    default:
      return null;
  }
};

/**
 * จัดรูปแบบรายละเอียดสำหรับ Admin Actions
 * @param {object} details - รายละเอียดของการกระทำโดย admin
 * @param {string} action - ประเภทของ action
 * @returns {string|null} รายละเอียดที่จัดรูปแบบแล้ว หรือ null ถ้าไม่ใช่ admin action
 */
const formatAdminActionDetails = (details, action) => {
  switch (action) {
    case 'admin_delete_user':
      if (details.change_summary) {
        return details.change_summary;
      }
      // Fallback format
      const deleteLines = [`ลบผู้ใช้: ${details.deleted_user || details.target_user}`];
      if (details.deleted_user_type) {
        deleteLines.push(`ประเภท: ${details.deleted_user_type}`);
      }
      if (details.deleted_user_email) {
        deleteLines.push(`อีเมล: ${details.deleted_user_email}`);
      }
      if (details.deleted_by) {
        deleteLines.push(`โดย: ${details.deleted_by}`);
      }
      return deleteLines.join('\n');

    case 'admin_edit_user':
      if (details.change_summary) {
        const lines = [`แก้ไข: ${details.change_summary}`];
        if (details.target_user) {
          lines.unshift(`ผู้ใช้: ${details.target_user}`);
        }
        if (details.changed_by) {
          lines.push(`โดย: ${details.changed_by}`);
        }
        return lines.join('\n');
      }
      // Fallback format
      return `แก้ไขข้อมูลผู้ใช้: ${details.target_user || 'ไม่ระบุ'}`;

    case 'admin_promote_user':
      if (details.change_summary) {
        const lines = [details.change_summary];
        if (details.changed_by) {
          lines.push(`โดย: ${details.changed_by}`);
        }
        return lines.join('\n');
      }
      // Fallback format
      if (details.old_type && details.new_type) {
        return `เลื่อนตำแหน่ง: ${details.old_type} → ${details.new_type}`;
      }
      return `เลื่อนตำแหน่งผู้ใช้: ${details.target_user || 'ไม่ระบุ'}`;

    case 'admin_change_password':
      const passwordLines = [];
      if (details.target_user) {
        passwordLines.push(`ผู้ใช้: ${details.target_user}`);
      }
      passwordLines.push('Admin เปลี่ยนรหัสผ่านให้');
      if (details.changed_by) {
        passwordLines.push(`โดย: ${details.changed_by}`);
      }
      return passwordLines.join('\n');

    case 'admin_edit_security_questions':
      const securityLines = [];
      if (details.target_user) {
        securityLines.push(`ผู้ใช้: ${details.target_user}`);
      }
      securityLines.push('Admin แก้ไขคำถามความปลอดภัย');
      if (details.updated_by) {
        securityLines.push(`โดย: ${details.updated_by}`);
      }
      return securityLines.join('\n');

    default:
      return null;
  }
};

/**
 * จัดรูปแบบรายละเอียดสำหรับ Security & Authentication Actions
 * @param {object} details - รายละเอียดของการกระทำ
 * @param {string} action - ประเภทของ action
 * @returns {string|null} รายละเอียดที่จัดรูปแบบแล้ว หรือ null ถ้าไม่ใช่ security action
 */
const formatSecurityActionDetails = (details, action) => {
  switch (action) {
    case 'password_reset':
      const resetLines = [];
      if (details.method === 'security_questions') {
        resetLines.push('ผ่านคำถามความปลอดภัย');
      }
      if (details.success) {
        resetLines.push('รีเซ็ตรหัสผ่านสำเร็จ');
      }
      return resetLines.length > 0 ? resetLines.join('\n') : 'รีเซ็ตรหัสผ่าน';

    case 'security_questions_verified':
      if (details.reset_initiated) {
        return 'ยืนยันคำถามความปลอดภัย\nเริ่มกระบวนการรีเซ็ตรหัสผ่าน';
      }
      return 'ยืนยันคำถามความปลอดภัย';

    default:
      return null;
  }
};

/**
 * จัดรูปแบบรายละเอียดสำหรับ Export & File Actions
 * @param {object} details - รายละเอียดของการกระทำ
 * @param {string} action - ประเภทของ action
 * @returns {string|null} รายละเอียดที่จัดรูปแบบแล้ว หรือ null ถ้าไม่ใช่ file action
 */
const formatFileActionDetails = (details, action) => {
  const fileLines = [];
  
  // ชื่อไฟล์
  if (details.filename) {
    fileLines.push(`ไฟล์: ${details.filename}`);
  }
  
  // ขนาดไฟล์
  if (details.file_size) {
    const formattedSize = formatFileSize(details.file_size);
    fileLines.push(`ขนาด: ${formattedSize}`);
  }
  
  // รูปแบบการส่งออก
  if (details.export_format) {
    fileLines.push(`รูปแบบ: ${details.export_format.toUpperCase()}`);
  }
  
  // จำนวนการส่งออกที่เหลือ (สำหรับ vector exports)
  if (details.remaining_conversions !== undefined) {
    const vectorExportActions = ['export_svg', 'export_eps', 'export_pdf'];
    if (vectorExportActions.includes(action)) {
      fileLines.push(`เหลือ: ${details.remaining_conversions} ครั้ง`);
    }
  }
  
  return fileLines.length > 0 ? fileLines.join('\n') : null;
};

/**
 * จัดรูปแบบรายละเอียดสำหรับ Authentication Actions
 * @param {object} details - รายละเอียดของการกระทำ
 * @param {string} action - ประเภทของ action
 * @returns {string|null} รายละเอียดที่จัดรูปแบบแล้ว หรือ null ถ้าไม่ใช่ auth action
 */
const formatAuthActionDetails = (details, action) => {
  switch (action) {
    case 'login':
      if (details.login_method) {
        const methodDisplay = details.login_method === 'JWT' ? 'ผ่านระบบปกติ' : details.login_method;
        return `วิธี: ${methodDisplay}`;
      }
      return null;

    case 'logout':
      if (details.logout_method) {
        const logoutDisplay = details.logout_method === 'JWT' ? 'ผ่านระบบปกติ' : details.logout_method;
        return `วิธี: ${logoutDisplay}`;
      }
      return null;

    case 'register':
      const registerLines = [];
      if (details.email) {
        registerLines.push(`อีเมล: ${details.email}`);
      }
      if (details.user_type) {
        registerLines.push(`ประเภท: ${details.user_type}`);
      }
      return registerLines.length > 0 ? registerLines.join('\n') : null;

    default:
      return null;
  }
};

/**
 * จัดรูปแบบรายละเอียดของ log entry - Main function
 * @param {string|object} details - รายละเอียดที่ต้องการจัดรูปแบบ
 * @param {string} action - ประเภทของ action
 * @returns {string} รายละเอียดที่จัดรูปแบบแล้ว
 */
export const formatDetails = (details, action) => {
  if (!details) return '-';
  
  try {
    // แปลง string เป็น object ถ้าจำเป็น
    if (typeof details === 'string') {
      details = JSON.parse(details);
    }
    
    // ลำดับการตรวจสอบ: Profile -> Admin -> Security -> File -> Auth
    
    // 1. Profile Changes
    const profileDetail = formatProfileChangeDetails(details, action);
    if (profileDetail) return profileDetail;
    
    // 2. Admin Actions
    const adminDetail = formatAdminActionDetails(details, action);
    if (adminDetail) return adminDetail;
    
    // 3. Security Actions
    const securityDetail = formatSecurityActionDetails(details, action);
    if (securityDetail) return securityDetail;
    
    // 4. File Actions (Upload/Export/Convert)
    const fileDetail = formatFileActionDetails(details, action);
    if (fileDetail) return fileDetail;
    
    // 5. Authentication Actions
    const authDetail = formatAuthActionDetails(details, action);
    if (authDetail) return authDetail;
    
    // 6. Fallback - แสดงข้อมูลทั่วไป
    const fallbackLines = [];
    
    if (details.target_user) {
      fallbackLines.push(`ผู้ใช้: ${details.target_user}`);
    }
    
    if (details.changed_by || details.deleted_by || details.updated_by) {
      const by = details.changed_by || details.deleted_by || details.updated_by;
      fallbackLines.push(`โดย: ${by}`);
    }
    
    if (details.description) {
      fallbackLines.push(details.description);
    }
    
    return fallbackLines.length > 0 ? fallbackLines.join('\n') : '-';
    
  } catch (e) {
    // ถ้า parse ไม่ได้ ให้แสดงเป็น string ธรรมดา
    console.warn('Failed to parse log details:', e);
    return details.toString();
  }
};

/**
 * ดึง icon สำหรับ action
 * @param {string} action - ประเภทของ action
 * @returns {object} FontAwesome icon object
 */
export const getActionIconData = (action) => {
  return actionIconMap[action] || defaultActionIcon;
};

/**
 * ดึงสีสำหรับ action
 * @param {string} action - ประเภทของ action
 * @returns {string} สีในรูปแบบ hex
 */
export const getActionColor = (action) => {
  // ตรวจสอบ profile actions
  if (action.startsWith('profile_')) {
    return actionColorMap[action] || '#17a2b8'; // สีน้ำเงินอ่อน
  }
  
  // ตรวจสอบ admin actions
  if (action.startsWith('admin_')) {
    return actionColorMap[action] || '#ff6b6b'; // สีแดง
  }
  
  // ตรวจสอบ export actions
  if (action.includes('export_')) {
    return actionColorMap[action] || '#28a745'; // สีเขียว
  }
  
  // ส่งคืนสีที่กำหนดไว้หรือสีเริ่มต้น
  return actionColorMap[action] || defaultActionColor;
};

/**
 * สร้าง style object สำหรับ action badge
 * @param {string} action - ประเภทของ action
 * @returns {object} style object
 */
export const getActionBadgeStyle = (action) => ({
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#ffffff',
  backgroundColor: getActionColor(action),
  maxWidth: '140px'
});

/**
 * สร้าง style object สำหรับ user badge
 * @returns {object} style object
 */
export const getUserBadgeStyle = () => ({
  backgroundColor: '#495057',
  color: '#ffffff',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '12px'
});

/**
 * ตรวจสอบว่า action เป็นประเภท admin หรือไม่
 * @param {string} action - ประเภทของ action
 * @returns {boolean}
 */
export const isAdminAction = (action) => {
  return action.startsWith('admin_');
};

/**
 * ตรวจสอบว่า action เป็นประเภท export หรือไม่
 * @param {string} action - ประเภทของ action
 * @returns {boolean}
 */
export const isExportAction = (action) => {
  return action.includes('export_');
};

/**
 * ตรวจสอบว่า action เป็นประเภท security หรือไม่
 * @param {string} action - ประเภทของ action
 * @returns {boolean}
 */
export const isSecurityAction = (action) => {
  const securityActions = [
    'password_reset', 
    'security_questions_verified',
    'admin_change_password',
    'admin_edit_security_questions'
  ];
  return securityActions.includes(action);
};

/**
 * ตรวจสอบว่า action เป็นประเภท profile หรือไม่
 * @param {string} action - ประเภทของ action
 * @returns {boolean}
 */
export const isProfileAction = (action) => {
  return action.startsWith('profile_');
};

/**
 * ตรวจสอบว่า action เป็นประเภท authentication หรือไม่
 * @param {string} action - ประเภทของ action
 * @returns {boolean}
 */
export const isAuthAction = (action) => {
  const authActions = ['login', 'logout', 'register'];
  return authActions.includes(action);
};