// src/admin/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8000/api/accounts/admin/stats/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      padding: '0'
    },
    header: {
      marginBottom: '30px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#a0a0a0'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: '#2a2a2a',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #3a3a3a'
    },
    statCardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    statCardTitle: {
      fontSize: '14px',
      color: '#a0a0a0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statCardIcon: {
      fontSize: '24px'
    },
    statCardValue: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: '8px'
    },
    statCardDescription: {
      fontSize: '12px',
      color: '#a0a0a0'
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginTop: '30px'
    },
    detailCard: {
      backgroundColor: '#2a2a2a',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #3a3a3a'
    },
    detailCardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '20px'
    },
    userTypeList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    userTypeItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #3a3a3a'
    },
    userTypeLastItem: {
      borderBottom: 'none'
    },
    userTypeName: {
      fontSize: '14px',
      color: '#e0e0e0'
    },
    userTypeCount: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#007bff'
    },
    topUsersList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    topUserItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #3a3a3a'
    },
    topUserLastItem: {
      borderBottom: 'none'
    },
    topUserName: {
      fontSize: '14px',
      color: '#e0e0e0'
    },
    topUserActivity: {
      fontSize: '12px',
      color: '#a0a0a0'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '400px'
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #3a3a3a',
      borderTop: '4px solid #007bff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    errorContainer: {
      textAlign: 'center',
      padding: '40px',
      color: '#ff6b6b'
    },
    refreshButton: {
      backgroundColor: '#007bff',
      color: '#ffffff',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      marginTop: '20px'
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div style={styles.errorContainer}>
          <h3>เกิดข้อผิดพลาด</h3>
          <p>{error}</p>
          <button 
            onClick={fetchDashboardStats}
            style={styles.refreshButton}
          >
            ลองใหม่
          </button>
        </div>
      </AdminLayout>
    );
  }

  const getUserTypeDisplay = (type) => {
    const typeMap = {
      'user': 'ผู้ใช้ทั่วไป',
      'admin': 'แอดมิน',
      'superuser': 'ซุปเปอร์แอดมิน'
    };
    return typeMap[type] || type;
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>ภาพรวมการใช้งานระบบ Bitmap to SVG Converter</p>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statCardHeader}>
              <span style={styles.statCardTitle}>ผู้ใช้ทั้งหมด</span>
              <span style={styles.statCardIcon}>👥</span>
            </div>
            <div style={styles.statCardValue}>{stats?.users?.total || 0}</div>
            <div style={styles.statCardDescription}>
              {stats?.users?.active || 0} คนกำลังใช้งาน
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statCardHeader}>
              <span style={styles.statCardTitle}>การแปลงภาพ</span>
              <span style={styles.statCardIcon}>🔄</span>
            </div>
            <div style={styles.statCardValue}>{stats?.conversions?.total || 0}</div>
            <div style={styles.statCardDescription}>
              {stats?.conversions?.today || 0} ครั้งวันนี้
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statCardHeader}>
              <span style={styles.statCardTitle}>การเข้าสู่ระบบ</span>
              <span style={styles.statCardIcon}>🔐</span>
            </div>
            <div style={styles.statCardValue}>{stats?.activity?.recent_logins || 0}</div>
            <div style={styles.statCardDescription}>
              ใน 7 วันที่ผ่านมา
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statCardHeader}>
              <span style={styles.statCardTitle}>สมาชิกใหม่</span>
              <span style={styles.statCardIcon}>📈</span>
            </div>
            <div style={styles.statCardValue}>{stats?.users?.recent_registrations || 0}</div>
            <div style={styles.statCardDescription}>
              ใน 7 วันที่ผ่านมา
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={styles.detailsGrid}>
          {/* User Types Breakdown */}
          <div style={styles.detailCard}>
            <h3 style={styles.detailCardTitle}>ประเภทผู้ใช้</h3>
            <ul style={styles.userTypeList}>
              {stats?.users?.by_type?.map((item, index) => (
                <li 
                  key={item.user_type} 
                  style={index === stats.users.by_type.length - 1 ? 
                    {...styles.userTypeItem, ...styles.userTypeLastItem} : 
                    styles.userTypeItem
                  }
                >
                  <span style={styles.userTypeName}>
                    {getUserTypeDisplay(item.user_type)}
                  </span>
                  <span style={styles.userTypeCount}>{item.count}</span>
                </li>
              )) || []}
            </ul>
          </div>

          {/* Top Active Users */}
          <div style={styles.detailCard}>
            <h3 style={styles.detailCardTitle}>ผู้ใช้ที่ Active ที่สุด</h3>
            <ul style={styles.topUsersList}>
              {stats?.activity?.top_users?.slice(0, 5).map((user, index) => (
                <li 
                  key={user.user__id} 
                  style={index === Math.min(4, stats.activity.top_users.length - 1) ? 
                    {...styles.topUserItem, ...styles.topUserLastItem} : 
                    styles.topUserItem
                  }
                >
                  <span style={styles.topUserName}>{user.user__username}</span>
                  <span style={styles.topUserActivity}>
                    {user.activity_count} กิจกรรม
                  </span>
                </li>
              )) || []}
              {(!stats?.activity?.top_users || stats.activity.top_users.length === 0) && (
                <li style={styles.topUserItem}>
                  <span style={styles.topUserActivity}>ยังไม่มีข้อมูล</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}