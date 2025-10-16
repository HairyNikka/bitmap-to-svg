import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartBar, 
  faCheckCircle, 
  faTimesCircle, 
  faImage, 
  faUserPlus, 
  faSpinner,
  faCrown,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

const ExportLimitsInfo = ({ limitsInfo, isLimitsLoading }) => {
  
  // Loading State
  if (isLimitsLoading) {
    return (
      <div style={limitsInfoStyle}>
        <div style={loadingStyle}>
          <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
          กำลังโหลดข้อมูล limits...
        </div>
      </div>
    );
  }

  // ถ้า Error (ไม่เจอข้อมูล limit)
  if (!limitsInfo) {
    return (
      <div style={limitsInfoStyle}>
        <div style={errorStyle}>
          <FontAwesomeIcon icon={faTimesCircle} style={{ marginRight: '8px', color: '#ef4444' }} />
          ไม่สามารถโหลดข้อมูล limits ได้
        </div>
      </div>
    );
  }

  const { user_type, is_unlimited, daily_limit, used_today, remaining } = limitsInfo;

  // ผู้ใช้ที่ส่งออกได้ไม่จำกัด (Admin/Superuser)
  if (is_unlimited) {
    return (
      <div style={limitsInfoStyle}>
        <div style={unlimitedSectionStyle}>
          <div style={unlimitedHeaderStyle}>
            <FontAwesomeIcon icon={faCrown} style={{ color: '#fbbf24', marginRight: '8px' }} />
            <strong>สถานะ : ไม่จำกัดการส่งออก</strong>
          </div>
          <div style={unlimitedDetailStyle}>
            <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#4ade80', marginRight: '6px' }} />
            Admin/Superuser สามารถส่งออกได้ไม่จำกัด
          </div>
        </div>
        
        <div style={pngNoticeStyle}>
          <FontAwesomeIcon icon={faImage} style={{ marginRight: '8px' }} />
          <strong>PNG : ส่งออกได้ไม่จำกัด (ไม่นับครั้ง) </strong>
        </div>
      </div>
    );
  }

  // ผู้ใช้ทั่วไป User/Guest
  return (
    <div style={limitsInfoStyle}>
      <div style={limitsSectionStyle}>
        <div style={limitsHeaderStyle}>
          <FontAwesomeIcon icon={faChartBar} style={{ marginRight: '8px' }} />
          <strong>การส่งออกวันนี้: {used_today}/{daily_limit} ครั้ง</strong>
        </div>
        <div style={limitsDetailStyle}>
          {remaining > 0 ? (
            <span style={{ color: '#4ade80' }}>
              <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '6px' }} />
              เหลือ <strong>{remaining} ครั้ง</strong> (SVG, PDF, EPS)
            </span>
          ) : (
            <span style={{ color: '#ef4444' }}>
              <FontAwesomeIcon icon={faTimesCircle} style={{ marginRight: '6px' }} />
              <strong>หมดโควต้าแล้ว</strong> สำหรับ SVG, PDF, EPS
            </span>
          )}
        </div>
      </div>
      
      <div style={pngNoticeStyle}>
        <FontAwesomeIcon icon={faImage} style={{ marginRight: '8px' }} />
        <strong>PNG : ส่งออกได้ไม่จำกัด (ไม่นับครั้ง) </strong>
      </div>

      {user_type === 'guest' && (
        <div style={guestNoticeStyle}>
          <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: '8px' }} />
          <strong>เข้าสู่ระบบเพื่อเพิ่มโควต้าเป็น 10 ครั้ง/วัน</strong>
        </div>
      )}

      {/* หลอดแสดงจำนวนการส่งออก */}
      <div style={progressSectionStyle}>
        <div style={progressBarBackgroundStyle}>
          <div 
            style={{
              ...progressBarFillStyle,
              width: `${(used_today / daily_limit) * 100}%`,
              backgroundColor: remaining > 0 ? '#4ade80' : '#ef4444'
            }}
          />
        </div>
        <div style={progressTextStyle}>
          {used_today} จาก {daily_limit} ครั้ง
        </div>
      </div>
    </div>
  );
};

const limitsInfoStyle = {
  backgroundColor: '#2a2a2a',
  border: '1px solid #444',
  borderRadius: '8px',
  padding: '12px',
  marginTop: '12px',
  color: 'white',
  fontSize: '13px'
};

const loadingStyle = {
  color: '#d1d5db',
  textAlign: 'center',
  padding: '8px'
};

const errorStyle = {
  color: '#ef4444',
  textAlign: 'center',
  padding: '8px'
};

const unlimitedSectionStyle = {
  marginBottom: '8px'
};

const unlimitedHeaderStyle = {
  marginBottom: '4px',
  color: '#e5e7eb',
  display: 'flex',
  alignItems: 'center'
};

const unlimitedDetailStyle = {
  fontSize: '12px',
  color: '#d1d5db',
  display: 'flex',
  alignItems: 'center'
};

const limitsSectionStyle = {
  marginBottom: '8px'
};

const limitsHeaderStyle = {
  marginBottom: '4px',
  color: '#e5e7eb',
  display: 'flex',
  alignItems: 'center'
};

const limitsDetailStyle = {
  fontSize: '12px',
  color: '#d1d5db',
  display: 'flex',
  alignItems: 'center'
};

const pngNoticeStyle = {
  backgroundColor: '#1e40af',
  padding: '6px 8px',
  borderRadius: '4px',
  fontSize: '11px',
  color: '#dbeafe',
  marginBottom: '6px',
  display: 'flex',
  alignItems: 'center'
};

const guestNoticeStyle = {
  backgroundColor: '#3653b2ff',
  padding: '6px 8px',
  borderRadius: '4px',
  fontSize: '11px',
  color: '#fed7aa',
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center'
};

const progressSectionStyle = {
  marginTop: '8px'
};

const progressBarBackgroundStyle = {
  width: '100%',
  height: '6px',
  backgroundColor: '#374151',
  borderRadius: '3px',
  overflow: 'hidden',
  marginBottom: '4px'
};

const progressBarFillStyle = {
  height: '100%',
  transition: 'width 0.3s ease',
  borderRadius: '3px'
};

const progressTextStyle = {
  fontSize: '10px',
  color: '#9ca3af',
  textAlign: 'center'
};

export default ExportLimitsInfo;