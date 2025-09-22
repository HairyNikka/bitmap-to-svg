// admin/utils/ActivityLogs/constants.js
import { 
  faUserPlus, faSignInAlt, faSignOutAlt, faImage, 
  faFileImage, faFilePdf, faTrash, faEdit, faArrowUp, 
  faKey, faShield, faQuestionCircle, faEnvelope
} from '@fortawesome/free-solid-svg-icons';

// รายการ actions ที่เป็นไปได้
export const actionOptions = [
  { value: '', label: 'ทุกการกระทำ' },
  { value: 'register', label: 'สมัครสมาชิก' },
  { value: 'login', label: 'เข้าสู่ระบบ' },
  { value: 'logout', label: 'ออกจากระบบ' },
  { value: 'convert_image', label: 'แปลงภาพ' },
  { value: 'export_png', label: 'ส่งออก PNG' },
  { value: 'export_svg', label: 'ส่งออก SVG' },
  { value: 'export_pdf', label: 'ส่งออก PDF' },
  { value: 'export_eps', label: 'ส่งออก EPS' },
  { value: 'admin_delete_user', label: 'ลบผู้ใช้' },
  { value: 'admin_edit_user', label: 'แก้ไขข้อมูลผู้ใช้' },
  { value: 'admin_promote_user', label: 'เลื่อนตำแหน่งผู้ใช้' },
  { value: 'password_reset', label: 'เปลี่ยนรหัสผ่าน' },
  { value: 'security_questions_verified', label: 'ยืนยันคำถามความปลอดภัย' },
  { value: 'admin_change_password', label: 'เปลี่ยนรหัสผ่านโดย Admin' },
  { value: 'admin_edit_security_questions', label: 'แก้ไขคำถามความปลอดภัยโดย Admin' },
  { value: 'profile_email_change', label: 'เปลี่ยนอีเมล (ผ่านโปรไฟล์)' },
  { value: 'profile_password_change', label: 'เปลี่ยนรหัสผ่าน (ผ่านโปรไฟล์)' },
  { value: 'profile_security_questions_change', label: 'เปลี่ยนคำถามความปลอดภัย (ผ่านโปรไฟล์)' },
];

// รายการช่วงเวลาสำหรับกรอง
export const dateOptions = [
  { value: '', label: 'ทุกช่วงเวลา' },
  { value: 'today', label: 'วันนี้' },
  { value: 'yesterday', label: 'เมื่อวาน' },
  { value: 'this_week', label: 'สัปดาห์นี้' },
  { value: 'last_week', label: 'สัปดาห์ที่ผ่านมา' },
  { value: 'this_month', label: 'เดือนนี้' },
  { value: 'last_month', label: 'เดือนที่ผ่านมา' },
  { value: 'custom', label: 'กำหนดเอง' }
];

// Icon mapping สำหรับแต่ละ action
export const actionIconMap = {
  'register': faUserPlus,
  'login': faSignInAlt,
  'logout': faSignOutAlt,
  'convert_image': faImage,
  'export_png': faFileImage,
  'export_svg': faFileImage,
  'export_pdf': faFilePdf,
  'export_eps': faFileImage,
  'admin_delete_user': faTrash,
  'admin_edit_user': faEdit,
  'admin_promote_user': faArrowUp,
  'password_reset': faKey,
  'security_questions_verified': faShield,
  'admin_change_password': faEdit,
  'admin_edit_security_questions': faEdit,
  'profile_email_change': faEnvelope,
  'profile_password_change': faKey,
  'profile_security_questions_change': faQuestionCircle,
};

// Color mapping สำหรับแต่ละ action
export const actionColorMap = {
  // Admin actions
  'admin_delete_user': '#ff6b6b',
  'admin_edit_user': '#ff6b6b',
  'admin_promote_user': '#ff6b6b',
  'admin_change_password': '#ff6b6b',
  'admin_edit_security_questions': '#ff6b6b',
  
  // Export actions
  'export_png': '#28a745',
  'export_svg': '#28a745',
  'export_pdf': '#28a745',
  'export_eps': '#28a745',
  
  // Convert
  'convert_image': '#007bff',
  
  // Authentication
  'login': '#17a2b8',
  'logout': '#6c757d',
  'register': '#ffc107',
  
  // Security
  'password_reset': '#dc3545',
  'security_questions_verified': '#926d00ff',

   // Profile
  'profile_email_change': '#007bff',
  'profile_password_change': '#dc3545', 
  'profile_security_questions_change': '#ffc107',
};

// Default color สำหรับ actions ที่ไม่มีใน map
export const defaultActionColor = '#6c757d';

// Default icon สำหรับ actions ที่ไม่มีใน map  
export const defaultActionIcon = faFileImage;

// การตั้งค่า pagination
export const paginationConfig = {
  perPage: 20
};

// รายการตำแหน่งผู้ใช้สำหรับกรอง
export const userTypeOptions = [
  { value: '', label: 'ทุกตำแหน่ง' },
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'superuser', label: 'Super User' }
];

// ข้อความต่างๆ
export const messages = {
  loading: 'กำลังโหลด...',
  error: 'เกิดข้อผิดพลาด',
  noData: 'ไม่พบข้อมูล',
  fetchError: 'ไม่สามารถโหลดข้อมูล Activity Logs ได้',
  exportError: 'ไม่สามารถส่งออก CSV ได้ กรุณาลองใหม่อีกครั้ง',
  exportSuccess: 'ส่งออก CSV สำเร็จ',
  noDataToExport: 'ไม่มีข้อมูลสำหรับส่งออก'
};