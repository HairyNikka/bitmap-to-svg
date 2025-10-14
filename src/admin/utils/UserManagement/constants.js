// admin/utils/UserManagement/constants.js
import { faUser, faUserShield, faUserTie } from '@fortawesome/free-solid-svg-icons';

// User type options for filters
export const userTypeOptions = [
  { value: '', label: 'ทุกตำแหน่ง' },
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'superuser', label: 'Super User' }
];

// Status options for filters
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

// User type styling
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

// API endpoints
export const apiEndpoints = {
  getUsers: 'http://localhost:8000/api/accounts/admin/users/',
  updateUser: (id) => `http://localhost:8000/api/accounts/admin/users/${id}/`,
  promoteUser: (id) => `http://localhost:8000/api/accounts/admin/promote-user/${id}/`,
  deleteUser: (id) => `http://localhost:8000/api/accounts/admin/users/${id}/`,
  exportUserActivity: (id) => `http://localhost:8000/api/accounts/admin/logs/?user_id=${id}`
};

// Table column configurations
export const tableColumns = [
  { key: 'user', label: 'ผู้ใช้', width: '25%' },
  { key: 'email', label: 'อีเมล', width: '25%' },
  { key: 'status', label: 'สถานะ', width: '15%' },
  { key: 'dateJoined', label: 'วันที่สมัคร', width: '15%' },
  { key: 'lastActivity', label: 'กิจกรรมล่าสุด', width: '15%' },
  { key: 'actions', label: 'การจัดการ', width: '15%' }
];

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

// Permission levels
export const permissionLevels = {
  NONE: 0,
  VIEW: 1,
  EDIT: 2,
  DELETE: 3,
  FULL: 4
};

// Action types for consistency
export const actionTypes = {
  EDIT: 'edit',
  DELETE: 'delete',
  EXPORT_ACTIVITY: 'export_activity'
};