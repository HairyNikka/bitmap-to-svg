import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExportPreview = ({ svg, cachedPng, onClose, filename, dimensions, colorCount }) => {
  const [loadingType, setLoadingType] = useState(null);
  const [progress, setProgress] = useState(0);

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

  // ฟังก์ชันสำหรับบันทึก export log
  const logExport = async (format) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        console.log('User not logged in, skipping export logging');
        return;
      }

      await axios.post('http://localhost:8000/api/accounts/log-export/', {
        format: format.toLowerCase(),
        filename: filename || 'converted'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log(`Export ${format.toUpperCase()} logged successfully`);
    } catch (error) {
      console.error('Failed to log export:', error);
      // ไม่ต้องแสดง error ให้ผู้ใช้เห็น เพราะไม่ใช่ core functionality
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
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted.${type}`;
      link.click();
      URL.revokeObjectURL(url);

      // 🎯 บันทึก export log หลังดาวน์โหลดสำเร็จ
      await logExport(type);
    } catch (err) {
      alert(`${type.toUpperCase()} export failed`);
    } finally {
      setLoadingType(null);
    }
  };

  // สำหรับ SVG download
  const handleSvgDownload = async () => {
    // 🎯 บันทึก export log สำหรับ SVG
    await logExport('svg');
  };

  const pathCount = svg?.match(/<path /g)?.length || 0;

  const truncateFileName = (name, maxLength = 30) => {
    if (!name || name.length <= maxLength) return name;
    const dotIndex = name.lastIndexOf('.');
    const ext = dotIndex !== -1 ? name.slice(dotIndex) : '';
    const base = name.slice(0, maxLength - ext.length - 3);
    return base + '...' + ext;
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
              <a
                href={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
                download="converted.svg"
                onClick={(e) => {
                  if (loadingType) {
                    e.preventDefault();
                  } else {
                    handleSvgDownload(); // 🎯 เรียก logging function
                  }
                }}
                style={{
                  ...buttonStyle,
                  flex: 1,
                  textDecoration: 'none',
                  textAlign: 'center',
                  pointerEvents: loadingType ? 'none' : 'auto',
                  opacity: loadingType ? 0.5 : 1,
                  cursor: loadingType ? 'not-allowed' : 'pointer'
                }}
                aria-disabled={!!loadingType}
              >
                SVG
              </a>
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