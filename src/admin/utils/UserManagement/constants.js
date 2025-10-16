// admin/utils/UserManagement/constants.js
import { faUser, faUserShield, faUserTie } from '@fortawesome/free-solid-svg-icons';

// ฟิลเตอร์สำหรับเลือกประเภทผู้ใช้
export const userTypeOptions = [
  { value: '', label: 'ทุกตำแหน่ง' },
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'superuser', label: 'Super User' }
];

// ฟิลเตอร์สถานะผู้ใช้
export const statusOptions = [
  { value: '', label: 'ทุกสถานะ' },
  { value: 'true', label: 'ใช้งานได้' },
  { value: 'false', label: 'ถูกปิดใช้งาน' }
];

// User type display mapping
export const userTypeDisplayMap = {
  'user': 'User',
  'admin': 'Admin',
  'superuser': 'Super User'
};

// สไตล์ของแต่ละประเภทผู้ใช้
export const userTypeStyles = {
  'user': {
    icon: faUser,
    backgroundColor: '#6b7280',
    color: '#ffffff',
    displayName: 'User'
  },
  'admin': {
    icon: faUserShield,
    backgroundColor: '#dc2626',
    color: '#ffffff',
    displayName: 'Admin'
  },
  'superuser': {
    icon: faUserTie,
    backgroundColor: '#eab308',
    color: '#000000',
    displayName: 'Super User'
  }
};

// Pagination config
export const paginationConfig = {
  perPage: 10
};

// เรียก epi
export const apiEndpoints = {
  getUsers: 'http://localhost:8000/api/accounts/admin/users/',
  updateUser: (id) => `http://localhost:8000/api/accounts/admin/users/${id}/`,
  promoteUser: (id) => `http://localhost:8000/api/accounts/admin/promote-user/${id}/`,
  deleteUser: (id) => `http://localhost:8000/api/accounts/admin/users/${id}/`,
  exportUserActivity: (id) => `http://localhost:8000/api/accounts/admin/logs/?user_id=${id}`
};

// Messages
export const messages = {
  loading: 'กำลังโหลด...',
  error: 'เกิดข้อผิดพลาด',
  noData: 'ไม่พบข้อมูลผู้ใช้',
  fetchError: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
  updateSuccess: 'อัพเดทข้อมูลผู้ใช้สำเร็จ',
  updateError: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
  deleteSuccess: 'ลบผู้ใช้สำเร็จ',
  deleteError: 'เกิดข้อผิดพลาดในการลบผู้ใช้',
  deleteConfirmTitle: 'ยืนยันการลบผู้ใช้',
  deleteConfirmMessage: 'การกระทำนี้ไม่สามารถย้อนกลับได้',
  exportActivitySuccess: 'ส่งออก Activity Logs สำเร็จ',
  exportActivityError: 'ไม่สามารถส่งออก Activity Logs ได้'
};

