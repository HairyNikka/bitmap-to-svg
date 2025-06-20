// 🔄 Home.jsx ปรับกล่องฝั่งขวาให้ความสูงเท่ากับกล่องแสดงผลภาพ และความกว้างเล็กลง
// ✅ เพิ่ม resetTrigger เพื่อบังคับให้ UploadImage sync UI slider
import React, { useState, useRef } from 'react';
import UploadImage, { defaultOptions } from './UploadImage';
import SvgPreview from './SvgPreview';

export default function Home() {
  const [svgData, setSvgData] = useState(null);
  const [imageSrc, setImageSrc] = useState("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAVUlEQVR42mNgGAWjYBSMAgMDwz8GMJvBBRC8Z8BiMDQyQDxHIxYhwgVAF+Q/GfCVAAck6AhVwAxY2A1WQnEI8QvGQbEQK6RmW0UCQQMAM4USMhhCEZQAAAAASUVORK5CYII=");
  const [options, setOptions] = useState({
    pathomit: 1,
    numberofcolors: 8,
    strokewidth: 1,
    scale: 1,
    blur: 0
  });
  const [monoMode, setMonoMode] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0); // ✅ trigger เพิ่ม

  const svgRef = useRef();

  const resetOptionsOnly = () => {
    setOptions({ ...defaultOptions });
    setResetTrigger(prev => prev + 1); // ✅ เปลี่ยน trigger เพื่อบังคับอัปเดต
    setSvgData(null); // ล้างผลลัพธ์เดิม แต่ไม่ลบภาพ
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
              options={options}
              monoMode={monoMode}
              setSvgData={setSvgData}
            />
          </div>

          {/* ฝั่งขวา: กล่องควบคุม */}
          <div
            style={{
              width: '300px',
              height: '470px',
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
              imageSrc={imageSrc}
              options={options}
              resetTrigger={resetTrigger} // ✅ ส่งเข้าไป
            />

            {/* ปุ่มจัดการ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
              <button onClick={() => svgRef.current?.generate()}>
                🔄 แปลงใหม่
              </button>
              <button onClick={() => svgRef.current?.reset()}>
                ♻️ รีเซ็ตมุมมอง
              </button>
              <button onClick={resetOptionsOnly}>
                ♻️ รีเซ็ตค่า (ไม่ลบรูป)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
