// admin/components/UserManagement/UserTable.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { 
  getUserBadgeWithRoleStyle,
  getStatusBadgeStyle,
  formatUserStatus,
  formatJoinDate,
  formatLastActivity,
  getActionButtonStyle,
  getNewUserBadge,
  canEditUser,
  canDeleteUser,
  canExportUserActivity
} from '../../utils/UserManagement';

const UserTable = ({ 
  users, 
  loading, 
  currentUser,
  onEditUser,
  onDeleteUser,
  onExportUserActivity,
  exportingActivity
}) => {
  const styles = {
    container: {
      width: '100%',
      backgroundColor: '#2a2a2a',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #3a3a3a'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      tableLayout: 'fixed'
    },
    thead: {
      backgroundColor: '#3a3a3a'
    },
    th: {
      padding: '15px',
      textAlign: 'left',
      color: '#ffffff',
      fontWeight: '600',
      borderBottom: '1px solid #4a4a4a',
      fontSize: '14px'
    },
    // Column specific widths
    userColumn: { width: '25%' },
    emailColumn: { width: '25%' },
    statusColumn: { width: '15%' },
    dateColumn: { width: '15%' },
    activityColumn: { width: '15%' },
    actionsColumn: { width: '15%' },
    tbody: {
      backgroundColor: '#2a2a2a'
    },
    tr: {
      borderBottom: '1px solid #3a3a3a',
      transition: 'background-color 0.2s'
    },
    td: {
      padding: '15px',
      color: '#e0e0e0',
      verticalAlign: 'top',
      fontSize: '14px',
      wordWrap: 'break-word',
      overflow: 'hidden'
    },
    emailCell: {
      fontSize: '13px',
      color: '#a0a0a0',
      wordBreak: 'break-all'
    },
    dateCell: {
      fontSize: '12px',
      color: '#a0a0a0'
    },
    activityCell: {
      fontSize: '12px',
      color: '#a0a0a0',
      lineHeight: '1.4'
    },
    actionsCell: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      alignItems: 'center'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#a0a0a0'
    },
    emptyTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#ffffff'
    },
    emptyMessage: {
      fontSize: '14px',
      lineHeight: '1.5'
    },
    loadingRow: {
      textAlign: 'center',
      padding: '40px'
    },
    loadingSpinner: {
      width: '24px',
      height: '24px',
      border: '3px solid #3a3a3a',
      borderTop: '3px solid #007bff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 10px'
    },
    loadingText: {
      color: '#a0a0a0',
      fontSize: '14px'
    }
  };

  // Loading state
  if (loading && users.length === 0) {
    return (
      <>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        <div style={styles.container}>
          <div style={styles.loadingRow}>
            <div style={styles.loadingSpinner}></div>
            <div style={styles.loadingText}>กำลังโหลดข้อมูล...</div>
          </div>
        </div>
      </>
    );
  }

  // Empty state
  if (!loading && users.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <h3 style={styles.emptyTitle}>ไม่พบผู้ใช้</h3>
          <p style={styles.emptyMessage}>
            ไม่มีผู้ใช้ที่ตรงกับเงื่อนไขที่ค้นหา<br/>
            ลองปรับเปลี่ยนตัวกรองหรือล้างตัวกรองเพื่อดูข้อมูลทั้งหมด
          </p>
        </div>
      </div>
    );
  }

  // Table with data
  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .table-row:hover {
          background-color: #333333 !important;
        }

        /* Responsive table styles */
        @media (max-width: 768px) {
          .users-table {
            font-size: 12px;
          }
          
          .users-table th,
          .users-table td {
            padding: 10px 8px !important;
          }
        }

        @media (max-width: 480px) {
          .users-table {
            font-size: 11px;
          }
          
          .users-table th,
          .users-table td {
            padding: 8px 6px !important;
          }
        }
      `}</style>
      
      <div style={styles.container}>
        <table style={styles.table} className="users-table">
          <thead style={styles.thead}>
            <tr>
              <th style={{...styles.th, ...styles.userColumn}}>ผู้ใช้</th>
              <th style={{...styles.th, ...styles.emailColumn}}>อีเมล</th>
              <th style={{...styles.th, ...styles.statusColumn}}>สถานะ</th>
              <th style={{...styles.th, ...styles.dateColumn}}>วันที่สมัคร</th>
              <th style={{...styles.th, ...styles.activityColumn}}>กิจกรรมล่าสุด</th>
              <th style={{...styles.th, ...styles.actionsColumn}}>การจัดการ</th>
            </tr>
          </thead>
          <tbody style={styles.tbody}>
            {users.map((user, index) => {
              const userBadgeStyles = getUserBadgeWithRoleStyle(user.user_type);
              const statusBadgeStyle = getStatusBadgeStyle(user.is_active);
              const newUserBadge = getNewUserBadge(user.date_joined);
              const exportKey = `user_${user.id}`;
              const isExporting = exportingActivity[exportKey];

              return (
                <tr 
                  key={user.id} 
                  className="table-row"
                  style={{
                    ...styles.tr,
                    animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`
                  }}
                >
                  {/* User Column - รวม username + user type เหมือน ActivityLogs */}
                  <td style={styles.td}>
                    <div style={userBadgeStyles.container}>
                      <div style={userBadgeStyles.userBadge}>
                        <FontAwesomeIcon 
                          icon={getUserTypeStyle(user.user_type).icon} 
                          size="sm"
                        />
                        <span>{user.username}</span>
                        {newUserBadge && (
                          <span style={newUserBadge}>ใหม่</span>
                        )}
                      </div>
                      <div style={userBadgeStyles.roleText}>
                        {getUserTypeStyle(user.user_type).displayName}
                      </div>
                    </div>
                  </td>

                  {/* Email Column */}
                  <td style={styles.td}>
                    <div style={styles.emailCell}>
                      {user.email}
                    </div>
                  </td>

                  {/* Status Column */}
                  <td style={styles.td}>
                    <span style={statusBadgeStyle}>
                      {formatUserStatus(user.is_active)}
                    </span>
                  </td>

                  {/* Date Joined Column */}
                  <td style={styles.td}>
                    <div style={styles.dateCell}>
                      {formatJoinDate(user.date_joined)}
                    </div>
                  </td>

                  {/* Last Activity Column */}
                  <td style={styles.td}>
                    <div style={styles.activityCell}>
                      {formatLastActivity(user.last_activity)}
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td style={styles.td}>
                    <div style={styles.actionsCell}>
                      {/* Edit Button */}
                      {canEditUser(currentUser, user) && (
                        <button
                          onClick={() => onEditUser(user)}
                          style={getActionButtonStyle('edit')}
                          title="แก้ไขผู้ใช้"
                        >
                          <FontAwesomeIcon icon={faEdit} size="sm" />
                          แก้ไข
                        </button>
                      )}

                      {/* Delete Button */}
                      {canDeleteUser(currentUser, user) && (
                        <button
                          onClick={() => onDeleteUser(user)}
                          style={getActionButtonStyle('delete')}
                          title="ลบผู้ใช้"
                        >
                          <FontAwesomeIcon icon={faTrash} size="sm" />
                          ลบ
                        </button>
                      )}

                      {/* Export Activity Button */}
                      {canExportUserActivity(currentUser, user) && (
                        <button
                          onClick={() => onExportUserActivity(user.id, user.username)}
                          disabled={isExporting}
                          style={{
                            ...getActionButtonStyle('export', isExporting),
                            ...(isExporting ? { opacity: 0.6, cursor: 'not-allowed' } : {})
                          }}
                          title="ส่งออก Activity Logs"
                        >
                          <FontAwesomeIcon 
                            icon={faFileExport} 
                            size="sm" 
                            spin={isExporting}
                          />
                          {isExporting ? 'กำลังส่งออก CSV..' : 'Export CSV'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Loading indicator for additional data */}
        {loading && users.length > 0 && (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            borderTop: '1px solid #3a3a3a'
          }}>
            <div style={styles.loadingText}>กำลังโหลดข้อมูลเพิ่มเติม...</div>
          </div>
        )}
      </div>
    </>
  );
};

// Import getUserTypeStyle function เพิ่มเติม
import { getUserTypeStyle } from '../../utils/UserManagement';

export default UserTable;