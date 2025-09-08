import React, { useState, useRef } from 'react';
import UploadImage from './UploadImage/UploadImage';
import ParameterControls from './UploadImage/ParameterControls';
import PresetButtons from './UploadImage/PresetButtons';
import SvgPreview from "./SvgPreview/SvgPreview";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faArrowsRotate, faSearchPlus } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const [svgData, setSvgData] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState('');
  // Upload validation state
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [isParameterAdjusting, setIsParameterAdjusting] = useState(false);

  // Default options (ปานกลาง preset)
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

  // Reset to "ปานกลาง" preset
  const resetToMediumPreset = () => {
    setOptions({ ...defaultOptions });
    setResetTrigger(prev => prev + 1);
    setSvgData(null);
  };

  // Handle image conversion
  const handleConvertImage = () => {
    if (!hasUploadedImage) {
      alert('⚠️ กรุณาอัปโหลดรูปภาพก่อนการแปลง!');
      return;
    }
    svgRef.current?.generate();
  };

  // Handle image update with upload validation
  const handleImageUpdate = (newImageSrc) => {
    setImageSrc(newImageSrc);
    setHasUploadedImage(!!newImageSrc); // มีรูปเป็น true, null เป็น false
  };

  const handlePresetChange = (newOptions) => {
    setOptions(newOptions);
    setResetTrigger(prev => prev + 1); // ✅ บังคับให้ ParameterControls รีเฟรช
  };

  return (
    <div style={{ width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ paddingTop: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '100%', width: '100%' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', padding: '0 20px', flexWrap: 'wrap' }}>

          {/* Left side: Image Preview */}
          <div style={{ flex: 2, minWidth: '300px' }}>
            <SvgPreview
              ref={svgRef}
              imageSrc={imageSrc}
              filename={uploadedFilename}
              options={options}
              setSvgData={setSvgData}
              isParameterAdjusting={isParameterAdjusting}
            />
          </div>

          {/* Right side: Control Panel */}
          <div style={styles.controlPanel}>
            
            {/* Fixed Controls Section - อยู่ด้านบนไม่เลื่อน */}
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

              {/* Action Buttons */}
              <div style={styles.actionButtons}>
                <button
                  onClick={handleConvertImage}
                  disabled={!hasUploadedImage}
                  className={hasUploadedImage ? 'convert-button' : ''}
                  style={{
                    ...styles.convertButton,
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
            </div>

            {/* Scrollable Parameters Section - เลื่อนได้ */}
            <div style={styles.parametersBox}>

              {/* Parameter Controls Section */}
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
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const styles = {
  controlPanel: {
    width: '320px',
    maxHeight: '85vh',
    alignSelf: 'flex-start',
    marginTop: '30px',
    marginLeft: '100px',
    backgroundColor: '#1e1e1e',
    border: '1px solid #444',
    padding: '20px',
    borderRadius: '10px',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  fixedControls: {
    // ส่วนที่ไม่เลื่อน - อยู่ด้านบนเสมอ
    flexShrink: 0, // ไม่ย่อขนาด
    borderBottom: '1px solid #333',
    paddingBottom: '16px',
    marginBottom: '4px'
  },
  parametersBox: {
    // ส่วนที่เลื่อนได้
    flex: 1,
    overflowY: 'auto',
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
    flexDirection: 'row',
    gap: '10px',
    marginTop: '16px',
    flexWrap: 'wrap'
  },
  convertButton: {
    flex: 2,
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
  }
};