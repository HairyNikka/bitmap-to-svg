import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faFile, 
  faExpandAlt, 
  faCodeBranch, 
  faPalette,
  faDownload,
  faSpinner,
  faFilePdf,
  faFileImage,
  faFileCode
} from '@fortawesome/free-solid-svg-icons';
import useExportLogic from './useExportLogic';
import ExportLimitsInfo from './ExportLimitsInfo';

const ExportPreview = ({ svg, cachedPng, onClose, filename, dimensions, colorCount }) => {
  const {
    loadingType,
    progress,
    limitsInfo,
    isLimitsLoading,
    handleDownload,
    canExport
  } = useExportLogic();

  // Memoized calculations
  const pathCount = useMemo(() => svg?.match(/<path /g)?.length || 0, [svg]);
  
  const truncateFileName = useMemo(() => {
    const maxLength = 30;
    if (!filename || filename.length <= maxLength) return filename || 'ไม่มีชื่อไฟล์';
    const dotIndex = filename.lastIndexOf('.');
    const ext = dotIndex !== -1 ? filename.slice(dotIndex) : '';
    const base = filename.slice(0, maxLength - ext.length - 3);
    return base + '...' + ext;
  }, [filename]);

  // Export handlers
  const handleExportClick = async (type) => {
    if (loadingType) return; // Prevent multiple clicks
    
    try {
      await handleDownload(type, svg, filename || 'converted');
    } catch (error) {
      alert(`${type.toUpperCase()} export failed: ${error.message}`);
    }
  };

  const exportButtons = [
    {
      type: 'png',
      label: 'PNG',
      icon: faFileImage,
      color: '#2a2a2a',
      always_enabled: true
    },
    {
      type: 'svg',
      label: 'SVG',
      icon: faFileCode,
      color: '#2a2a2a'
    },
    {
      type: 'pdf',
      label: 'PDF',
      icon: faFilePdf,
      color: '#2a2a2a'
    },
    {
      type: 'eps',
      label: 'EPS',
      icon: faFile,
      color: '#2a2a2a'
    }
  ];

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        {/* ปุ่มปิด */}
        <button onClick={onClose} style={closeButtonStyle}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        {/* หัวเรื่อง */}
        <h3 style={headerStyle}>
          <FontAwesomeIcon icon={faFile} style={{ marginRight: '8px' }} />
          ตัวอย่างภาพเวกเตอร์ & ดาวน์โหลด
        </h3>

        <div style={contentContainerStyle}>
          {/* หน้าพรีวิว */}
          <div style={previewSectionStyle}>
            <div style={previewWrapperStyle}>
              {/* เป็นไฟล์ Cached PNG ในพิ้นหลัง */}
              {cachedPng && (
                <img 
                  src={cachedPng} 
                  alt="Vector preview" 
                  style={previewLayerStyle} 
                  draggable={false} 
                />
              )}
              
              {/* SVG Layer (Foreground) */}
              <div 
                style={{ ...previewLayerStyle, pointerEvents: 'none' }} 
                dangerouslySetInnerHTML={{ __html: svg }} 
              />
            </div>
          </div>

          {/* Info & Controls Section */}
          <div style={controlsSectionStyle}>
            {/* ข้อมูลไฟล์ */}
            <div style={infoBoxStyle}>
              <div style={infoRowStyle}>
                <FontAwesomeIcon icon={faFile} style={infoIconStyle} />
                <span style={infoLabelStyle}>ไฟล์ต้นฉบับ:</span>
                <span style={infoValueStyle}>{truncateFileName}</span>
              </div>
              
              <div style={infoRowStyle}>
                <FontAwesomeIcon icon={faExpandAlt} style={infoIconStyle} />
                <span style={infoLabelStyle}>ขนาดภาพ:</span>
                <span style={infoValueStyle}>
                  {dimensions?.width} × {dimensions?.height} px
                </span>
              </div>
              
              <div style={infoRowStyle}>
                <FontAwesomeIcon icon={faCodeBranch} style={infoIconStyle} />
                <span style={infoLabelStyle}>จำนวน path:</span>
                <span style={infoValueStyle}>{pathCount}</span>
              </div>
              
              <div style={infoRowStyle}>
                <FontAwesomeIcon icon={faPalette} style={infoIconStyle} />
                <span style={infoLabelStyle}>จำนวนสี:</span>
                <span style={infoValueStyle}>{colorCount ?? '-'}</span>
              </div>
            </div>

            {/* ปุ่มส่งออก */}
            <div style={exportButtonsContainerStyle}>
              {exportButtons.map((button) => {
                const isEnabled = button.always_enabled || canExport(button.type);
                const isCurrentlyLoading = loadingType === button.type;
                
                return (
                  <button
                    key={button.type}
                    onClick={() => handleExportClick(button.type)}
                    style={{
                      ...exportButtonStyle,
                      backgroundColor: isEnabled ? button.color : '#374151',
                      cursor: isEnabled && !loadingType ? 'pointer' : 'not-allowed',
                      opacity: isEnabled ? 1 : 0.5
                    }}
                    disabled={!isEnabled || !!loadingType}
                  >
                    {isCurrentlyLoading ? (
                      <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '6px' }} />
                    ) : (
                      <FontAwesomeIcon icon={button.icon} style={{ marginRight: '6px' }} />
                    )}
                    {button.label}
                  </button>
                );
              })}
            </div>

            {/* ดึงข้อมูลลิมิตการส่งออกจากอีกไฟล์ */}
            <ExportLimitsInfo 
              limitsInfo={limitsInfo} 
              isLimitsLoading={isLimitsLoading} 
            />

            {/* หลอดโหลดการส่งออก */}
            {loadingType && (
              <div style={progressContainerStyle}>
                <div style={progressTextStyle}>
                  <FontAwesomeIcon icon={faDownload} style={{ marginRight: '6px' }} />
                  กำลังส่งออก {loadingType.toUpperCase()}...
                </div>
                <div style={progressBarBackgroundStyle}>
                  <div 
                    style={{
                      ...progressBarFillStyle,
                      width: `${progress}%`
                    }} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
  boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
  position: 'relative',
  border: '1px solid #374151'
};

const closeButtonStyle = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  padding: '8px 12px',
  backgroundColor: '#991b1b',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'background-color 0.2s ease'
};

const headerStyle = {
  marginTop: 0,
  marginBottom: '20px',
  color: 'white',
  fontSize: '18px',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center'
};

const contentContainerStyle = {
  display: 'flex',
  gap: '24px',
  flexWrap: 'wrap'
};

const previewSectionStyle = {
  flex: '0 0 auto'
};

const previewWrapperStyle = {
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
  borderRadius: '8px'
};

const previewLayerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'block',
  objectFit: 'contain',
  userSelect: 'none'
};

const controlsSectionStyle = {
  flex: '1 1 300px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const infoBoxStyle = {
  backgroundColor: '#2a2a2a',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #444'
};

const infoRowStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '8px',
  fontSize: '14px',
  color: 'white'
};

const infoIconStyle = {
  width: '16px',
  marginRight: '8px',
  color: '#9ca3af'
};

const infoLabelStyle = {
  minWidth: '100px',
  color: '#d1d5db'
};

const infoValueStyle = {
  color: 'white',
  fontWeight: '500',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const exportButtonsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '10px'
};

const exportButtonStyle = {
  padding: '12px 16px',
  color: 'white',
  borderRadius: '6px',
  border: 'none',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const progressContainerStyle = {
  backgroundColor: '#2a2a2a',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #444'
};

const progressTextStyle = {
  color: 'white',
  fontSize: '14px',
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center'
};

const progressBarBackgroundStyle = {
  width: '100%',
  height: '8px',
  backgroundColor: '#374151',
  borderRadius: '4px',
  overflow: 'hidden'
};

const progressBarFillStyle = {
  height: '100%',
  backgroundColor: '#4ade80',
  transition: 'width 0.1s linear',
  borderRadius: '4px'
};

// Responsive styles for mobile
const mediaQuery = '@media (max-width: 768px)';

export default ExportPreview;