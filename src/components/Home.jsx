// 🔄 Home.jsx ปรับกล่องฝั่งขวาให้ความสูงเท่ากับกล่องแสดงผลภาพ และความกว้างเล็กลง
// ✅ เพิ่มภาพโปร่งใสเป็นค่า default ของ imageSrc
import React, { useState, useRef } from 'react';
import UploadImage from './UploadImage';
import SvgPreview from './SvgPreview';

export default function Home() {
  const [svgData, setSvgData] = useState(null);
  const [imageSrc, setImageSrc] = useState("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAVUlEQVR42mNgGAWjYBSMAgMDwz8GMJvBBRC8Z8BiMDQyQDxHIxYhwgVAF+Q/GfCVAAck6AhVwAxY2A1WQnEI8QvGQbEQK6RmW0UCQQMAM4USMhhCEZQAAAAASUVORK5CYII=");
  const [options, setOptions] = useState({
    pathomit: 8,
    numberofcolors: 8,
    strokewidth: 1,
    scale: 1,
    blur: 0
  });
  const [monoMode, setMonoMode] = useState(false);

  const svgRef = useRef();

  return (
    <div style={{ width: '100vw', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ paddingTop: '70px', fontFamily: 'Arial, sans-serif', maxWidth: '100%', width: '100%' }}>
        <h1 style={{ margin: '20px' }}>🖼️ Bitmap to SVG Converter</h1>

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
              width: '320px',
              height: '500px',
              overflowY: 'auto',
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
            />

            {/* ปุ่มจัดการ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => svgRef.current?.generate()}>
                🔄 แปลงใหม่
              </button>
              <button onClick={() => svgRef.current?.reset()}>
                ♻️ รีเซ็ตมุมมอง
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}