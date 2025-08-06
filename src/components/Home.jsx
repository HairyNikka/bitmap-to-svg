// 🔄 Home.jsx ใช้ FontAwesome icon + ขนาดใหญ่ขึ้น + Upload Validation
import React, { useState, useRef } from 'react';
import UploadImage, { defaultOptions } from './UploadImage';
import SvgPreview from './SvgPreview';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faRedo, faSearchPlus } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const [svgData, setSvgData] = useState(null);
  const [imageSrc, setImageSrc] = useState("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAVUlEQVR42mNgGAWjYBSMAgMDwz8GMJvBBRC8Z8BiMDQyQDxHIxYhwgVAF+Q/GfCVAAck6AhVwAxY2A1WQnEI8QvGQbEQK6RmW0UCQQMAM4USMhhCEZQAAAAASUVORK5CYII=");
  const [uploadedFilename, setUploadedFilename] = useState('');
  
  // ✅ เพิ่ม state ตรวจสอบว่าอัปโหลดแล้วหรือยัง
  const [hasUploadedImage, setHasUploadedImage] = useState(false);

  const [options, setOptions] = useState({
    pathomit: 1,
    numberofcolors: 8,
    strokewidth: 1,
    scale: 1,
    blur: 0
  });

  const [monoMode, setMonoMode] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  const svgRef = useRef();

  const resetOptionsOnly = () => {
    setOptions({ ...defaultOptions });
    setResetTrigger(prev => prev + 1);
    setSvgData(null);
  };

  // ✅ ฟังก์ชันจัดการการแปลงภาพ
  const handleConvertImage = () => {
    if (!hasUploadedImage) {
      alert('⚠️ กรุณาอัปโหลดรูปภาพก่อนการแปลง!');
      return;
    }
    svgRef.current?.generate();
  };

  // ✅ ฟังก์ชันอัปเดต image และสถานะการอัปโหลด
  const handleImageUpdate = (newImageSrc) => {
    setImageSrc(newImageSrc);
    // ตรวจสอบว่าเป็นรูปที่อัปโหลดจริงหรือรูป default
    const isDefaultImage = newImageSrc.includes("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAU");
    setHasUploadedImage(!isDefaultImage);
  };

  return (
    <div style={{ width: '100vw', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ paddingTop: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '100%', width: '100%' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', padding: '0 20px', flexWrap: 'wrap' }}>

          {/* ฝั่งซ้าย: แสดงผลภาพ */}
          <div style={{ flex: 2, minWidth: '300px' }}>
            <SvgPreview
              ref={svgRef}
              imageSrc={imageSrc}
              filename={uploadedFilename}
              options={options}
              monoMode={monoMode}
              setSvgData={setSvgData}
            />
          </div>

          {/* ฝั่งขวา: กล่องควบคุม */}
          <div
            style={{
              width: '300px',
              height: '520px',
              overflowY: 'auto',
              alignSelf: 'flex-start',
              marginTop: '30px',
              marginLeft: '0px',
              marginRight: '30px',
              backgroundColor: '#1e1e1e',
              border: '1px solid #444',
              padding: '20px',
              borderRadius: '10px',
              color: 'white'
            }}
          >
            <UploadImage
              setSvgData={setSvgData}
              setImageSrc={handleImageUpdate} // ✅ ใช้ function ใหม่
              setOptions={setOptions}
              setMonoMode={setMonoMode}
              setFilename={setUploadedFilename}
              imageSrc={imageSrc}
              options={options}
              resetTrigger={resetTrigger}
            />

            {/* ✅ เพิ่ม CSS สำหรับ hover effect */}
            <style>{`
              .convert-button {
                transition: all 0.2s ease;
                border: 1px solid transparent !important;
              }
              .convert-button:not(:disabled):hover {
                border: 1px solid #646cff !important;
              }
            `}</style>

            {/* ปุ่มจัดการ */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={handleConvertImage}
                disabled={!hasUploadedImage}
                className={hasUploadedImage ? 'convert-button' : ''}
                style={{ 
                  flex: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  opacity: hasUploadedImage ? 1 : 0.5,
                  cursor: hasUploadedImage ? 'pointer' : 'not-allowed',
                  backgroundColor: hasUploadedImage ? '#1a1a1a' : '#3a3a3a',
                  color: hasUploadedImage ? 'white' : '#888',
                  border: hasUploadedImage ? '1px solid transparent' : '1px solid #555',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  fontWeight: hasUploadedImage ? '600' : 'normal'
                }}
              >
                <FontAwesomeIcon icon={faWrench} size="lg" /> แปลงภาพ
              </button>

              <button
                onClick={resetOptionsOnly}
                title="รีเซ็ตค่า"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <FontAwesomeIcon icon={faRedo} size="lg" />
              </button>

              <button
                onClick={() => svgRef.current?.reset()}
                title="รีเซ็ตมุมมอง"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <FontAwesomeIcon icon={faSearchPlus} size="lg" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}