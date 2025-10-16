import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  getActionIconData, 
  getActionBadgeStyle, 
  formatDetails,
  getUserRoleInfo,
  getUserBadgeWithRoleStyle
} from '../../utils/ActivityLogs';

const LogsTable = ({ logs, loading }) => {
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
    userColumn: {
      width: '18%'
    },
    actionColumn: {
      width: '27%'
    },
    timeColumn: {
      width: '25%'
    },
    detailsColumn: {
      width: '30%'
    },
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
    actionCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    timeCell: {
      fontSize: '12px'
    },
    timeAgo: {
      color: '#007bff',
      fontWeight: '600',
      marginBottom: '2px'
    },
    timestamp: {
      color: '#a0a0a0'
    },
    detailsCell: {
      fontSize: '12px',
      color: '#a0a0a0',
      lineHeight: '1.4',
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap'
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

  // สเตสต์การโหลดข้อมูล
  if (loading && logs.length === 0) {
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

  // สเตสต์ที่ไม่มีข้อมูล
  if (!loading && logs.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <h3 style={styles.emptyTitle}>ไม่พบข้อมูล</h3>
          <p style={styles.emptyMessage}>
            ไม่มี Activity Logs ที่ตรงกับเงื่อนไขที่ค้นหา<br/>
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
          .logs-table {
            font-size: 12px;
          }
          
          .logs-table th,
          .logs-table td {
            padding: 10px 8px !important;
          }
          
          .user-column { width: 20% !important; }
          .action-column { width: 25% !important; }
          .time-column { width: 20% !important; }
          .details-column { width: 35% !important; }
        }

        @media (max-width: 480px) {
          .logs-table {
            font-size: 11px;
          }
          
          .logs-table th,
          .logs-table td {
            padding: 8px 6px !important;
          }
        }
      `}</style>
      
      <div style={styles.container}>
        <table style={styles.table} className="logs-table">
          <thead style={styles.thead}>
            <tr>
              <th style={{...styles.th, ...styles.userColumn}} className="user-column">ผู้ใช้</th>
              <th style={{...styles.th, ...styles.actionColumn}} className="action-column">การกระทำ</th>
              <th style={{...styles.th, ...styles.timeColumn}} className="time-column">เวลา</th>
              <th style={{...styles.th, ...styles.detailsColumn}} className="details-column">รายละเอียด</th>
            </tr>
          </thead>
          <tbody style={styles.tbody}>
            {logs.map((log, index) => (
              <tr 
                key={log.id} 
                className="table-row"
                style={{
                  ...styles.tr,
                  animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`
                }}
              >
                {/* คอลัมน์ผู้ใช้ */}
                <td style={styles.td}>
                  {(() => {
                    const roleInfo = getUserRoleInfo(log.user_type || 'user');
                    const badgeStyles = getUserBadgeWithRoleStyle(log.user_type || 'user');
                    
                    return (
                      <div style={badgeStyles.container}>
                        <div style={badgeStyles.userBadge}>
                          <FontAwesomeIcon 
                            icon={roleInfo.icon} 
                            size="sm"
                          />
                          <span>{log.user_username || 'Unknown'}</span>
                        </div>
                        <div style={badgeStyles.roleText}>
                          {roleInfo.displayName}
                        </div>
                      </div>
                    );
                  })()}
                </td>

                {/* คอลัมน์การกระทำ */}
                <td style={styles.td}>
                  <div style={styles.actionCell}>
                    <span>
                      <FontAwesomeIcon 
                        icon={getActionIconData(log.action)} 
                        size="sm" 
                      />
                    </span>
                    <span style={getActionBadgeStyle(log.action)}>
                      {log.action_display}
                    </span>
                  </div>
                </td>

                {/* คอลัมน์เวลา */}
                <td style={styles.td}>
                  <div style={styles.timeCell}>
                    <div style={styles.timeAgo}>
                      {log.time_ago}
                    </div>
                    <div style={styles.timestamp}>
                      {log.formatted_timestamp}
                    </div>
                  </div>
                </td>

                {/* คอลัมน์รายละเอียด */}
                <td style={styles.td}>
                  <div style={styles.detailsCell}>
                    {formatDetails(log.details, log.action)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Loading indicator for additional data */}
        {loading && logs.length > 0 && (
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

export default LogsTable;