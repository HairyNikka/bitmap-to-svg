// 🔄 Home.jsx ใช้ FontAwesome icon + ขนาดใหญ่ขึ้น
import React, { useState, useRef } from 'react';
import UploadImage, { defaultOptions } from './UploadImage';
import SvgPreview from './SvgPreview';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faRedo, faSearchPlus } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const [svgData, setSvgData] = useState(null);
  const [imageSrc, setImageSrc] = useState("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAVUlEQVR42mNgGAWjYBSMAgMDwz8GMJvBBRC8Z8BiMDQyQDxHIxYhwgVAF+Q/GfCVAAck6AhVwAxY2A1WQnEI8QvGQbEQK6RmW0UCQQMAM4USMhhCEZQAAAAASUVORK5CYII=");
  const [uploadedFilename, setUploadedFilename] = useState('');

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
              setImageSrc={setImageSrc}
              setOptions={setOptions}
              setMonoMode={setMonoMode}
              setFilename={setUploadedFilename}
              imageSrc={imageSrc}
              options={options}
              resetTrigger={resetTrigger}
            />

            {/* ปุ่มจัดการ */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => svgRef.current?.generate()}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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