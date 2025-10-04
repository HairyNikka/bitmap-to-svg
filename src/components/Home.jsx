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
  
  // ✅ เพิ่ม state สำหรับ export modal และ cached PNG
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
    if (!hasUploadedImage) {
      alert('⚠️ กรุณาอัปโหลดรูปภาพก่อนการแปลง!');
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

  // ✅ เช็คว่ามี SVG ผลลัพธ์หรือยัง
  const hasSvgResult = svgData && svgData.includes('<path');

  return (
    <div style={{ width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ paddingTop: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '100%', width: '100%' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', padding: '0 0 0 20px', flexWrap: 'wrap' }}>

          {/* Left side: Image Preview */}
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
            />
          </div>

          {/* Right side: Control Panel */}
          <div style={styles.controlPanel}>
            
            {/* Fixed Controls Section */}
            <div style={styles.fixedControls}>
              {/* Upload Section */}
              <UploadImage
                setImageSrc={handleImageUpdate}
                setFilename={setUploadedFilename}
                imageSrc={imageSrc}
              />

              {/* Preset Section */}
              <PresetButtons
                setOptions={setOptions}
                onPresetChange={handlePresetChange}
              />

              {/* Action Buttons - Layout B */}
              <div style={styles.actionButtons}>
                {/* แถวที่ 1: ปุ่มแปลง + รีเซ็ต 2 ปุ่ม */}
                <div style={styles.buttonRow}>
                  <button
                    onClick={handleConvertImage}
                    disabled={!hasUploadedImage}
                    className={hasUploadedImage ? 'convert-button' : ''}
                    style={{
                      ...styles.convertButton,
                      flex: 2,
                      opacity: hasUploadedImage ? 1 : 0.5,
                      cursor: hasUploadedImage ? 'pointer' : 'not-allowed',
                      backgroundColor: hasUploadedImage ? '#1a1a1a' : '#3a3a3a',
                      color: hasUploadedImage ? 'white' : '#888',
                      border: hasUploadedImage ? '1px solid transparent' : '1px solid #555',
                      fontWeight: hasUploadedImage ? '600' : 'normal'
                    }}
                  >
                    <FontAwesomeIcon icon={faWrench} size="lg" />
                    แปลงภาพ
                  </button>

                  <button
                    onClick={resetToMediumPreset}
                    title="รีเซ็ตพรีเซ็ต"
                    style={styles.resetButton}
                  >
                    <FontAwesomeIcon icon={faArrowsRotate} size="lg" />
                  </button>

                  <button
                    onClick={() => svgRef.current?.reset()}
                    title="รีเซ็ตมุมมอง"
                    style={styles.resetButton}
                  >
                    <FontAwesomeIcon icon={faSearchPlus} size="lg" />
                  </button>
                </div>

                {/* แถวที่ 2: ปุ่มดาวน์โหลด (เต็มความกว้าง) */}
                <button
                  onClick={() => setShowExport(true)}
                  disabled={!hasSvgResult}
                  className={hasSvgResult ? 'download-button' : ''}
                  style={{
                    ...styles.downloadButton,
                    opacity: hasSvgResult ? 1 : 0.5,
                    cursor: hasSvgResult ? 'pointer' : 'not-allowed',
                    backgroundColor: hasSvgResult ? '#10b981' : '#3a3a3a',
                    color: hasSvgResult ? 'white' : '#888',
                    border: hasSvgResult ? '1px solid transparent' : '1px solid #555'
                  }}
                >
                  <FontAwesomeIcon icon={faDownload} size="lg" />
                  ดาวน์โหลด
                </button>
              </div>
            </div>

            {/* Scrollable Parameters Section */}
            <div style={styles.parametersBox}>
              <ParameterControls
                options={options}
                setOptions={setOptions}
                resetTrigger={resetTrigger}
                onParameterAdjusting={setIsParameterAdjusting}
              />
            </div>

            {/* CSS for hover effects */}
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

      {/* Export Modal */}
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

// Styles
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