// #1: สร้าง Layout Component แยกสำหรับ Authentication Pages
// ไฟล์: src/components/AuthLayout.jsx

import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children }) {
  return (
    <>
      {/* #2: CSS Reset เฉพาะ Auth Pages - ไม่กระทบหน้าอื่น */}
      <style>{`
        /* Reset เฉพาะใน AuthLayout scope */
        .auth-layout * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        /* Override global styles เฉพาะ auth pages */
        .auth-layout {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          background-color: #1a1a1a !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 20px !important;
          z-index: 9999 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
        }
        
        /* #3: ป้องกันไม่ให้ parent styles มารบกวน */
        .auth-layout > * {
          margin: 0 !important;
        }
      `}</style>

      {/* #4: Container ที่แยกออกจาก #root layout สมบูรณ์ */}
      <div className="auth-layout">
        
        {/* #5: Back to Home Link - ตำแหน่งคงที่ */}
        <Link 
          to="/" 
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            color: '#a0a0a0',
            textDecoration: 'none',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 10000,
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#ffffff'}
          onMouseLeave={(e) => e.target.style.color = '#a0a0a0'}
        >
          <span>🖼️</span> กลับหน้าแปลงภาพ
        </Link>

        {/* #6: Render children (Login/Register components) */}
        {children}
      </div>
    </>
  );
}