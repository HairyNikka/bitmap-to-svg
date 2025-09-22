// admin/components/UserManagement/UserPagination.jsx
import React from 'react';

const UserPagination = ({
  currentPage,
  totalPages,
  totalUsers,
  perPage,
  onPageChange,
  onPreviousPage,
  onNextPage,
  hasNextPage,
  hasPreviousPage
}) => {
  // ไม่แสดง pagination ถ้ามีแค่ 1 หน้า
  if (totalPages <= 1) {
    return null;
  }

  // คำนวณรายการที่แสดงในหน้าปัจจุบัน
  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalUsers);

  // สร้างเลขหน้าที่จะแสดง
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // แสดงทุกหน้าถ้าน้อยกว่า maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // แสดงหน้าแบบ smart pagination
      const halfMax = Math.floor(maxPagesToShow / 2);
      
      if (currentPage <= halfMax + 1) {
        // ใกล้จุดเริ่มต้น
        for (let i = 1; i <= maxPagesToShow; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - halfMax) {
        // ใกล้จุดสิ้นสุด
        for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // อยู่ตรงกลาง
        for (let i = currentPage - halfMax; i <= currentPage + halfMax; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '20px',
      padding: '20px 0',
      borderTop: '1px solid #3a3a3a'
    },
    pagination: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    pageButton: {
      padding: '8px 12px',
      backgroundColor: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      color: '#ffffff',
      cursor: 'pointer',
      fontSize: '14px',
      minWidth: '40px',
      textAlign: 'center',
      transition: 'all 0.2s'
    },
    activePageButton: {
      backgroundColor: '#007bff',
      borderColor: '#007bff',
      color: '#ffffff'
    },
    disabledPageButton: {
      backgroundColor: '#1a1a1a',
      borderColor: '#2a2a2a',
      color: '#6c757d',
      cursor: 'not-allowed',
      opacity: 0.5
    },
    navButton: {
      padding: '8px 16px',
      backgroundColor: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      color: '#ffffff',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s'
    },
    disabledNavButton: {
      backgroundColor: '#1a1a1a',
      borderColor: '#2a2a2a',
      color: '#6c757d',
      cursor: 'not-allowed',
      opacity: 0.5
    },
    info: {
      color: '#a0a0a0',
      fontSize: '14px'
    },
    pageInfo: {
      color: '#e0e0e0',
      fontSize: '14px',
      margin: '0 15px'
    },
    ellipsis: {
      padding: '8px 4px',
      color: '#6c757d',
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.container}>
      {/* แสดงข้อมูลรายการ */}
      <div style={styles.info}>
        แสดง {startItem.toLocaleString()}-{endItem.toLocaleString()} จาก {totalUsers.toLocaleString()} คน
      </div>

      {/* Pagination Controls */}
      <div style={styles.pagination}>
        {/* Previous Button */}
        <button
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
          style={{
            ...styles.navButton,
            ...(!hasPreviousPage ? styles.disabledNavButton : {})
          }}
          onMouseOver={(e) => {
            if (hasPreviousPage) {
              e.target.style.backgroundColor = '#3a3a3a';
            }
          }}
          onMouseOut={(e) => {
            if (hasPreviousPage) {
              e.target.style.backgroundColor = '#2a2a2a';
            }
          }}
        >
          ← ก่อนหน้า
        </button>

        {/* แสดง ellipsis ถ้าหน้าแรกไม่อยู่ใน pageNumbers */}
        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              style={styles.pageButton}
              onMouseOver={(e) => e.target.style.backgroundColor = '#3a3a3a'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2a2a2a'}
            >
              1
            </button>
            {pageNumbers[0] > 2 && (
              <span style={styles.ellipsis}>...</span>
            )}
          </>
        )}

        {/* Page Numbers */}
        {pageNumbers.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              ...styles.pageButton,
              ...(page === currentPage ? styles.activePageButton : {})
            }}
            onMouseOver={(e) => {
              if (page !== currentPage) {
                e.target.style.backgroundColor = '#3a3a3a';
              }
            }}
            onMouseOut={(e) => {
              if (page !== currentPage) {
                e.target.style.backgroundColor = '#2a2a2a';
              }
            }}
          >
            {page}
          </button>
        ))}

        {/* แสดง ellipsis ถ้าหน้าสุดท้ายไม่อยู่ใน pageNumbers */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span style={styles.ellipsis}>...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              style={styles.pageButton}
              onMouseOver={(e) => e.target.style.backgroundColor = '#3a3a3a'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2a2a2a'}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={onNextPage}
          disabled={!hasNextPage}
          style={{
            ...styles.navButton,
            ...(!hasNextPage ? styles.disabledNavButton : {})
          }}
          onMouseOver={(e) => {
            if (hasNextPage) {
              e.target.style.backgroundColor = '#3a3a3a';
            }
          }}
          onMouseOut={(e) => {
            if (hasNextPage) {
              e.target.style.backgroundColor = '#2a2a2a';
            }
          }}
        >
          ถัดไป →
        </button>
      </div>

      {/* Page Info */}
      <div style={styles.pageInfo}>
        หน้า {currentPage} จาก {totalPages}
      </div>
    </div>
  );
};

export default UserPagination;