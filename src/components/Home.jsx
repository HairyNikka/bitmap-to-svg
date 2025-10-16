import React, { useState, useRef } from 'react';
import UploadImage from './UploadImage/UploadImage';
import ParameterControls from './UploadImage/ParameterControls';
import PresetButtons from './UploadImage/PresetButtons';
import SvgPreview from "./SvgPreview/SvgPreview";
import ExportPreview from './ExportPreview/ExportPreview';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faArrowsRotate, faSearchPlus, faDownload } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const [svgData, setSvgData] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [isParameterAdjusting, setIsParameterAdjusting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [cachedPng, setCachedPng] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const defaultOptions = {
    pathomit: 4,
    numberofcolors: 8,
    strokewidth: 1,
    blur: 0,
    ltres: 1,
    qtres: 1,
    mincolorratio: 0.02,
    linefilter: false,
    rightangle: false
  };

  const [options, setOptions] = useState(defaultOptions);
  const [resetTrigger, setResetTrigger] = useState(0);

  const svgRef = useRef();

  const resetToMediumPreset = () => {
    setOptions({ ...defaultOptions });
    setResetTrigger(prev => prev + 1);
    setSvgData(null);
  };

  const handleConvertImage = () => {
    // ป้องกันการกดซ้ำขณะกำลังแปลง
    if (isConverting) {
      console.warn('กำลังแปลงอยู่ กรุณารอสักครู่');
      return;
    }
    
    if (!hasUploadedImage) {
      alert('กรุณาอัปโหลดรูปภาพก่อนการแปลง!');
      return;
    }
    
    svgRef.current?.generate();
  };

  const handleImageUpdate = (newImageSrc) => {
    setImageSrc(newImageSrc);
    setHasUploadedImage(!!newImageSrc);
  };

  const handlePresetChange = (newOptions) => {
    setOptions(newOptions);
    setResetTrigger(prev => prev + 1);
  };

  // เช็คว่ามี SVG ผลลัพธ์หรือยัง
  const hasSvgResult = svgData && svgData.includes('<path');

  return (
    <div style={{ width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ paddingTop: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '100%', width: '100%' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', padding: '0 0 0 20px', flexWrap: 'wrap' }}>

          {/* กล่องซ้าย Preview แสดงผลภาพ */}
          <div style={{ flex: 2, minWidth: '300px' }}>
            <SvgPreview
              ref={svgRef}
              imageSrc={imageSrc}
              filename={uploadedFilename}
              options={options}
              setSvgData={setSvgData}
              isParameterAdjusting={isParameterAdjusting}
              setCachedPng={setCachedPng}
              setNaturalSize={setNaturalSize}
              setIsConverting={setIsConverting} 
            />
          </div>

          {/* กล่องฟังก์ชันการแปลง */}
          <div style={styles.controlPanel}>
            <div style={styles.fixedControls}>
              {/* อัปโหลดรูปภาพ */}
              <UploadImage
                setImageSrc={handleImageUpdate}
                setFilename={setUploadedFilename}
                imageSrc={imageSrc}
              />

              {/* พรีเซ็ตค่าที่ตั้งไว้ */}
              <PresetButtons
                setOptions={setOptions}
                onPresetChange={handlePresetChange}
              />

              {/* ปุ่มกดต่าง ๆ */}
              <div style={styles.actionButtons}>
                {/* แถวที่ 1: ปุ่มแปลง + รีเซ็ต 2 ปุ่ม */}
                <div style={styles.buttonRow}>
                  <button
                    onClick={handleConvertImage}
                    disabled={!hasUploadedImage || isConverting} 
                    className={hasUploadedImage && !isConverting ? 'convert-button' : ''}
                    style={{
                      ...styles.convertButton,
                      flex: 2,
                      opacity: (hasUploadedImage && !isConverting) ? 1 : 0.5,
                      cursor: (hasUploadedImage && !isConverting) ? 'pointer' : 'not-allowed',
                      backgroundColor: (hasUploadedImage && !isConverting) ? '#1a1a1a' : '#3a3a3a',
                      color: (hasUploadedImage && !isConverting) ? 'white' : '#888',
                      border: (hasUploadedImage && !isConverting) ? '1px solid transparent' : '1px solid #555',
                      fontWeight: (hasUploadedImage && !isConverting) ? '600' : 'normal'
                    }}
                  >
                    <FontAwesomeIcon icon={faWrench} size="lg" />
                    {isConverting ? 'กำลังแปลง...' : 'แปลงภาพ'}
                  </button>

                  <button
                    onClick={resetToMediumPreset}
                    disabled={isConverting} 
                    title="รีเซ็ตพรีเซ็ต"
                    style={{
                      ...styles.resetButton,
                      opacity: isConverting ? 0.5 : 1,
                      cursor: isConverting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowsRotate} size="lg" />
                  </button>

                  <button
                    onClick={() => svgRef.current?.reset()}
                    disabled={isConverting} 
                    title="รีเซ็ตมุมมอง"
                    style={{
                      ...styles.resetButton,
                      opacity: isConverting ? 0.5 : 1,
                      cursor: isConverting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <FontAwesomeIcon icon={faSearchPlus} size="lg" />
                  </button>
                </div>

                {/* แถวที่ 2: ปุ่มดาวน์โหลด */}
                <button
                  onClick={() => setShowExport(true)}
                  disabled={!hasSvgResult || isConverting} 
                  className={hasSvgResult && !isConverting ? 'download-button' : ''}
                  style={{
                    ...styles.downloadButton,
                    opacity: (hasSvgResult && !isConverting) ? 1 : 0.5,
                    cursor: (hasSvgResult && !isConverting) ? 'pointer' : 'not-allowed',
                    backgroundColor: (hasSvgResult && !isConverting) ? '#10b981' : '#3a3a3a',
                    color: (hasSvgResult && !isConverting) ? 'white' : '#888',
                    border: (hasSvgResult && !isConverting) ? '1px solid transparent' : '1px solid #555'
                  }}
                >
                  <FontAwesomeIcon icon={faDownload} size="lg" />
                  {isConverting ? 'รอสักครู่...' : 'ดาวน์โหลด'}
                </button>
              </div>
            </div>

            {/* กล่องปรับค่าพารามิเตอร์ */}
            <div style={styles.parametersBox}>
              <ParameterControls
                options={options}
                setOptions={setOptions}
                resetTrigger={resetTrigger}
                onParameterAdjusting={setIsParameterAdjusting}
              />
            </div>

            <style>{`
              .convert-button {
                transition: all 0.2s ease;
                border: 1px solid transparent !important;
              }
              .convert-button:not(:disabled):hover {
                border: 1px solid #646cff !important;
                background-color: #252525 !important;
              }
              
              .download-button {
                transition: all 0.2s ease;
                border: 1px solid transparent !important;
              }
              .download-button:not(:disabled):hover {
                border: 1px solid #34d399 !important;
                background-color: #059669 !important;
              }
            `}</style>
          </div>
        </div>
      </div>

      {/* โมเดลสำหรับส่งออก */}
      {showExport && (
        <ExportPreview
          svg={svgData}
          cachedPng={cachedPng}
          filename={uploadedFilename}
          dimensions={naturalSize}
          colorCount={options.numberofcolors}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

const styles = {
  controlPanel: {
    width: '350px',
    maxHeight: 'calc(100vh - 100px)',
    alignSelf: 'flex-start',
    marginTop: '25px',
    marginLeft: '80px',
    marginRight: '0', 
    backgroundColor: '#1e1e1e',
    border: '1px solid #444',
    padding: '20px',
    borderRadius: '10px',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'sticky',           
    top: '20px',                  
    overflowY: 'auto'        
  },
  fixedControls: {
    flexShrink: 0,
    borderBottom: '1px solid #333',
    paddingBottom: '10px',
    marginBottom: '4px'
  },
  parametersBox: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '16px'
  },
  buttonRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: '10px'
  },
  convertButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  resetButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    backgroundColor: '#2a2a2a',
    color: '#ccc',
    border: '1px solid #444',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  downloadButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  }
};