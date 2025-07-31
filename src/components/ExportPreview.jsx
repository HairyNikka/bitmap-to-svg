import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExportPreview = ({ svg, cachedPng, onClose, filename, dimensions, colorCount }) => {
  const [loadingType, setLoadingType] = useState(null);
  const [progress, setProgress] = useState(0);
  const [limitsInfo, setLimitsInfo] = useState(null);

  useEffect(() => {
    let interval;
    if (loadingType) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [loadingType]);

  // 🆕 ดึงข้อมูล limits เมื่อ component mount
  useEffect(() => {
    fetchExportLimits();
  }, []);

  // 🆕 Guest ID Management
  const getOrCreateGuestId = () => {
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
      guestId = 'guest-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
      localStorage.setItem('guestId', guestId);
    }
    return guestId;
  };

  // 🆕 ดึงข้อมูล export limits (แบบ Headers - Recommended)
  const fetchExportLimits = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const guestId = getOrCreateGuestId();
      
      console.log('🔍 Debug fetchExportLimits:', { token: !!token, guestId });
      
      const headers = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['X-Guest-ID'] = guestId;
      }

      console.log('🔍 Request headers:', headers);

      const response = await axios.get('http://localhost:8000/api/accounts/export-limits/', { headers });
      
      console.log('🔍 Response data:', response.data);
      
      setLimitsInfo(response.data);

      // อัปเดต guest_id ถ้าได้รับจาก backend
      if (response.data.guest_id) {
        localStorage.setItem('guestId', response.data.guest_id);
      }
    } catch (error) {
      console.error('❌ Failed to fetch export limits:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // ✅ Fallback สำหรับ guest ถ้า API ไม่ทำงาน
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        setLimitsInfo({
          user_type: 'guest',
          is_unlimited: false,
          daily_limit: 3,
          used_today: 0,
          remaining: 3,
          guest_id: getOrCreateGuestId()
        });
      }
    }
  };

  // 🔄 Updated export logging with limits checking
  const logExport = async (format) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const guestId = getOrCreateGuestId();
      
      const payload = {
        format: format.toLowerCase(),
        filename: filename || 'converted'
      };

      // เพิ่ม guest_id สำหรับ guest users
      if (!token) {
        payload.guest_id = guestId;
      }

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post('http://localhost:8000/api/accounts/log-export/', payload, { headers });

      console.log(`Export ${format.toUpperCase()} logged successfully`);
      
      // 🔄 อัปเดต guest_id ถ้าได้รับจาก backend
      if (response.data.guest_id) {
        localStorage.setItem('guestId', response.data.guest_id);
      }

      // 🆕 รีเฟรช limits หลังส่งออกสำเร็จ
      await fetchExportLimits();

      return {
        success: true,
        remaining: response.data.remaining_exports || 0
      };
    } catch (error) {
      console.error('Failed to log export:', error);
      
      // 🚫 จัดการกรณีเกิน limit
      if (error.response?.status === 429) {
        const errorData = error.response.data;
        const userType = errorData.user_type || 'guest';
        const remaining = errorData.remaining || 0;
        
        let message = `🚫 เกินจำนวนการส่งออกต่อวัน!\n`;
        if (userType === 'guest') {
          message += `Guest ได้ 3 ครั้งต่อวัน (เหลือ ${remaining} ครั้ง)\n\n`;
          message += `💡 เข้าสู่ระบบเพื่อส่งออกได้ 10 ครั้งต่อวัน`;
        } else {
          message += `User ได้ 10 ครั้งต่อวัน (เหลือ ${remaining} ครั้ง)`;
        }
        
        alert(message);
        return { success: false, remaining };
      }
      
      return { success: false, remaining: 0 };
    }
  };

  const wrapperStyle = {
    width: '500px',
    height: '500px',
    backgroundImage: `
      linear-gradient(to right, #333 1px, transparent 1px),
      linear-gradient(to bottom, #333 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
    backgroundColor: '#1e1e1e',
    border: '1px solid #555',
    position: 'relative',
    overflow: 'hidden',
  };

  const layerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'contain',
    userSelect: 'none'
  };

  const handleDownload = async (type) => {
    setLoadingType(type);
    try {
      // 🎯 PNG ไม่ต้องตรวจสอบ limit
      if (type !== 'png') {
        const exportResult = await logExport(type);
        
        if (!exportResult.success) {
          return; // หยุดถ้าเกิน limit
        }
      }

      let blob;
      if (type === 'pdf' || type === 'eps') {
        const res = await fetch(`http://localhost:8000/convert-${type}/`, {
          method: 'POST',
          body: new Blob([svg], { type: 'image/svg+xml' }),
          headers: { 'Content-Type': 'image/svg+xml' },
        });
        blob = await res.blob();
      } else if (type === 'png') {
        const img = new Image();
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
        await new Promise((resolve) => (img.onload = resolve));
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        blob = await (await fetch(dataUrl)).blob();
      } else if (type === 'svg') {
        // ✅ เพิ่มการจัดการ SVG
        blob = new Blob([svg], { type: 'image/svg+xml' });
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted.${type}`;
      link.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      alert(`${type.toUpperCase()} export failed: ${err.message}`);
    } finally {
      setLoadingType(null);
    }
  };

  const pathCount = svg?.match(/<path /g)?.length || 0;

  const truncateFileName = (name, maxLength = 30) => {
    if (!name || name.length <= maxLength) return name;
    const dotIndex = name.lastIndexOf('.');
    const ext = dotIndex !== -1 ? name.slice(dotIndex) : '';
    const base = name.slice(0, maxLength - ext.length - 3);
    return base + '...' + ext;
  };

  // 🆕 Render Limits Info UI
  const renderLimitsInfo = () => {
    console.log('🔍 renderLimitsInfo - limitsInfo:', limitsInfo); // Debug log
    
    if (!limitsInfo) {
      return (
        <div style={limitsInfoStyle}>
          <div style={{ color: '#ef4444' }}>⚠️ กำลังโหลดข้อมูล limits...</div>
        </div>
      );
    }

    const { user_type, is_unlimited, daily_limit, used_today, remaining } = limitsInfo;

    if (is_unlimited) {
      return (
        <div style={limitsInfoStyle}>
          <div style={limitsSectionStyle}>
            <div style={limitsHeaderStyle}>
              ✨ <strong>สถานะ: ไม่จำกัดการส่งออก</strong>
            </div>
            <div style={limitsDetailStyle}>
              🎉 Admin/Superuser สามารถส่งออกได้ไม่จำกัด
            </div>
          </div>
          <div style={pngNoticeStyle}>
            💡 <strong>PNG:</strong> ส่งออกได้ไม่จำกัด (ไม่นับครั้ง)
          </div>
        </div>
      );
    }

    return (
      <div style={limitsInfoStyle}>
        <div style={limitsSectionStyle}>
          <div style={limitsHeaderStyle}>
            📊 <strong>การส่งออกวันนี้: {used_today}/{daily_limit} ครั้ง</strong>
          </div>
          <div style={limitsDetailStyle}>
            {remaining > 0 ? (
              <span style={{ color: '#4ade80' }}>
                ✅ เหลือ <strong>{remaining} ครั้ง</strong> (SVG, PDF, EPS)
              </span>
            ) : (
              <span style={{ color: '#ef4444' }}>
                ❌ <strong>หมดโควต้าแล้ว</strong> สำหรับ SVG, PDF, EPS
              </span>
            )}
          </div>
        </div>
        
        <div style={pngNoticeStyle}>
          💡 <strong>PNG:</strong> ส่งออกได้ไม่จำกัด (ไม่นับครั้ง)
        </div>

        {user_type === 'guest' && (
          <div style={guestNoticeStyle}>
            🔐 <strong>เข้าสู่ระบบ</strong> เพื่อเพิ่มโควต้าเป็น <strong>10 ครั้ง/วัน</strong>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeButtonStyle}>❌</button>
        <h3 style={{ marginTop: 0, color: 'white' }}>🔍 ตัวอย่างภาพเวกเตอร์ & ดาวน์โหลด</h3>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <div style={wrapperStyle}>
              {cachedPng && <img src={cachedPng} alt="Vector preview" style={layerStyle} draggable={false} />}
              <div style={{ ...layerStyle, pointerEvents: 'none' }} dangerouslySetInnerHTML={{ __html: svg }} />
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <div style={infoBoxStyle}>
              <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                📄 ไฟล์ต้นฉบับ: {truncateFileName(filename) || '-'}
              </p>
              <p>📐 ขนาดภาพ: {dimensions?.width} × {dimensions?.height} px</p>
              <p>🧬 จำนวน path: {pathCount}</p>
              <p>🎨 จำนวนสี: {colorCount ?? '-'}</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
              <button
                onClick={() => handleDownload('png')}
                style={{
                  ...buttonStyle,
                  flex: 1,
                  pointerEvents: loadingType ? 'none' : 'auto',
                  opacity: loadingType ? 0.5 : 1,
                  cursor: loadingType ? 'not-allowed' : 'pointer'
                }}
                disabled={!!loadingType}
              >
                PNG
              </button>
              <button
                onClick={() => handleDownload('svg')}
                style={{
                  ...buttonStyle,
                  flex: 1,
                  pointerEvents: loadingType ? 'none' : 'auto',
                  opacity: loadingType ? 0.5 : 1,
                  cursor: loadingType ? 'not-allowed' : 'pointer'
                }}
                disabled={!!loadingType}
              >
                SVG
              </button>
              <button
                onClick={() => handleDownload('pdf')}
                style={{
                  ...buttonStyle,
                  flex: 1,
                  pointerEvents: loadingType ? 'none' : 'auto',
                  opacity: loadingType ? 0.5 : 1,
                  cursor: loadingType ? 'not-allowed' : 'pointer'
                }}
                disabled={!!loadingType}
              >
                PDF
              </button>
              <button
                onClick={() => handleDownload('eps')}
                style={{
                  ...buttonStyle,
                  flex: 1,
                  pointerEvents: loadingType ? 'none' : 'auto',
                  opacity: loadingType ? 0.5 : 1,
                  cursor: loadingType ? 'not-allowed' : 'pointer'
                }}
                disabled={!!loadingType}
              >
                EPS
              </button>
            </div>

            {/* 🆕 Limits Info Section */}
            {renderLimitsInfo()}

            {loadingType && (
              <div style={{ marginTop: '16px', color: 'white', textAlign: 'center' }}>
                🔄 กำลังส่งออก {loadingType.toUpperCase()}...
                <div style={{ marginTop: '8px', background: '#444', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: '#4ade80', transition: 'width 0.1s linear' }} />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// 🆕 Styles for Limits Info (Dark Theme)
const limitsInfoStyle = {
  backgroundColor: '#2a2a2a',
  border: '1px solid #444',
  borderRadius: '8px',
  padding: '12px',
  marginTop: '12px',
  color: 'white',
  fontSize: '13px'
};

const limitsSectionStyle = {
  marginBottom: '8px'
};

const limitsHeaderStyle = {
  marginBottom: '4px',
  color: '#e5e7eb'
};

const limitsDetailStyle = {
  fontSize: '12px',
  color: '#d1d5db'
};

const pngNoticeStyle = {
  backgroundColor: '#1e40af',
  padding: '6px 8px',
  borderRadius: '4px',
  fontSize: '11px',
  color: '#dbeafe',
  marginBottom: '6px'
};

const guestNoticeStyle = {
  backgroundColor: '#3653b2ff',
  padding: '6px 8px',
  borderRadius: '4px',
  fontSize: '11px',
  color: '#fed7aa'
};

// Original styles
const buttonStyle = {
  padding: '10px 0',
  backgroundColor: '#2a2a2a',
  color: 'white',
  borderRadius: '8px',
  border: '1px solid #444',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'all 0.2s ease'
};

const closeButtonStyle = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  padding: '4px 10px',
  backgroundColor: '#991b1b',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px'
};

const infoBoxStyle = {
  backgroundColor: '#2a2a2a',
  padding: '12px 16px',
  borderRadius: '10px',
  color: 'white',
  fontSize: '14px',
  marginBottom: '10px'
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999
};

const modalStyle = {
  backgroundColor: '#1e1e1e',
  padding: '24px',
  borderRadius: '12px',
  maxWidth: '1000px',
  width: '95%',
  maxHeight: '95vh',
  overflowY: 'auto',
  boxShadow: '0 2px 20px rgba(0,0,0,0.8)',
  position: 'relative'
};

export default ExportPreview;