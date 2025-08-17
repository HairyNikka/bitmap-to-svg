// src/components/SvgPreview/SvgPreview.jsx
import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect, useMemo } from 'react';
import ImageTracer from 'imagetracerjs';
import { Canvg } from 'canvg';
import ExportPreview from '../ExportPreview/ExportPreview';
import ImageComparisonView from './ImageComparisonView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const SvgPreview = forwardRef(({ imageSrc, options, setSvgData, filename }, ref) => {
  const [svg, setSvg] = useState(null);
  const [cachedPng, setCachedPng] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buttonWidth, setButtonWidth] = useState(500);

  const naturalSize = useRef({ width: 0, height: 0 });
  const uploadedFilename = filename;

  // 📱 ฟังก์ชันคำนวณความกว้างปุ่มตามหน้าจอ
  const getButtonWidth = () => {
    const width = window.innerWidth;
    if (width < 480) return 280;   // มือถือเล็ก
    if (width < 768) return 320;   // มือถือใหญ่  
    if (width < 1024) return 400;  // แท็บเล็ต
    return 500; // Desktop
  };

  // 🔄 Debounced resize handler
  const debouncedResize = useMemo(() => {
    let timeoutId;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setButtonWidth(getButtonWidth());
      }, 150);
    };
  }, []);

  // 📐 Setup responsive ตอน mount และ resize
  useEffect(() => {
    setButtonWidth(getButtonWidth());
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
    };
  }, [debouncedResize]);

  const convertSvgToPng = async (svgString) => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    const v = await Canvg.fromString(ctx, svgString);
    await v.render();
    return canvas.toDataURL("image/png");
  };

  // ฟังก์ชันสำหรับบันทึก conversion log
  const logConversion = async (filename, fileSize) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        console.log('User not logged in, skipping conversion logging');
        return true; // อนุญาตให้แปลงต่อสำหรับ guest
      }

      const response = await axios.post('http://localhost:8000/api/accounts/log-conversion/', {
        filename: filename || 'unknown.jpg',
        file_size: fileSize || 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Conversion logged successfully:', response.data);
      return true;
    } catch (error) {
      console.error('Failed to log conversion:', error);
      
      // ถ้าเกิน limit จะได้ 429 status
      if (error.response?.status === 429) {
        alert(`เกินจำนวนการแปลงที่อนุญาตต่อวัน\nเหลือ: ${error.response.data.remaining || 0} ครั้ง`);
        return false; // ไม่อนุญาตให้แปลง
      }
      
      return true; // error อื่นๆ ให้แปลงต่อได้
    }
  };

  const handleGenerate = async () => {
    if (converting) return; // ป้องกันการคลิกซ้ำ
    setConverting(true);
    setProgress(0);

    try {
      if (!imageSrc) return;

      // Step 1: ตรวจสอบ conversion limit (10%)
      setProgress(10);
      const canProceed = await logConversion(uploadedFilename, imageSrc.length);
      if (!canProceed) {
        return; // หยุดการแปลงถ้าเกิน limit
      }

      // Step 2: โหลดและเตรียมภาพ (30%)
      setProgress(30);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      img.onload = async () => {
        try {
          const naturalWidth = img.naturalWidth;
          const naturalHeight = img.naturalHeight;
          naturalSize.current = { width: naturalWidth, height: naturalHeight };

          // Step 3: สร้าง canvas และ apply filters (50%)
          setProgress(50);
          const canvas = document.createElement('canvas');
          canvas.width = naturalWidth;
          canvas.height = naturalHeight;
          const ctx = canvas.getContext('2d');

          if (options.blur > 0) ctx.filter = `blur(${options.blur}px)`;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Step 4: แปลงเป็น SVG (70%)
          setProgress(70);
          const finalOptions = {
            ...options,
            roundcoords: 1,
            layering: 0,
            scale: 1
          };

          const result = ImageTracer.imagedataToSVG(imageData, finalOptions);

          // Step 5: ประมวลผล SVG (85%)
          setProgress(85);
          const parser = new DOMParser();
          const doc = parser.parseFromString(result, "image/svg+xml");
          const svgEl = doc.querySelector("svg");

          svgEl.setAttribute("viewBox", `0 0 ${canvas.width} ${canvas.height}`);
          svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
          svgEl.setAttribute("width", `${canvas.width}`);
          svgEl.setAttribute("height", `${canvas.height}`);
          svgEl.setAttribute("style", "width: 100%; height: 100%; display: block;");

          const serializer = new XMLSerializer();
          const updatedSVG = serializer.serializeToString(doc.documentElement);

          // Step 6: สร้าง PNG cache และเสร็จสิ้น (100%)
          setProgress(95);
          setSvg(updatedSVG);
          setSvgData(updatedSVG);
          const pngData = await convertSvgToPng(updatedSVG);
          setCachedPng(pngData);
          
          setProgress(100);
          // รอ 500ms ให้เห็น 100% แล้วค่อยซ่อน progress
          setTimeout(() => {
            setProgress(0);
          }, 500);
        } catch (error) {
          console.error('Error during conversion:', error);
          setProgress(0);
        }
      };

      img.onerror = () => {
        console.error('Failed to load image');
        setProgress(0);
      };
    } catch (error) {
      console.error('Conversion failed:', error);
      setProgress(0);
    } finally {
      setTimeout(() => {
        setConverting(false);
      }, 500); // รอให้ progress bar หาย
    }
  };

  // ✅ เพิ่ม ref สำหรับ ImageComparisonView
  const imageComparisonRef = useRef();

  const resetView = () => {
    setProgress(0);
    setConverting(false);
    // เรียก reset ของ ImageComparisonView
    imageComparisonRef.current?.resetView();
  };

  useImperativeHandle(ref, () => ({
    generate: handleGenerate,
    reset: resetView
  }));

  // Styles
  const styles = {
    container: {
      marginTop: '4px'
    },
    downloadButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: converting ? '#333' : '#1e1e1e',
      color: converting ? '#666' : 'white',
      borderRadius: '10px',
      fontSize: '16px',
      border: '1px solid #444',
      cursor: converting ? 'not-allowed' : 'pointer',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      boxShadow: '0 0 0 1px transparent',
      position: 'relative',
      overflow: 'hidden'
    },
    progressBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: '3px',
      backgroundColor: '#4ade80',
      transition: 'width 0.3s ease',
      borderRadius: '0 0 10px 10px'
    },
    spinner: {
      animation: 'spin 1s linear infinite'
    },
    loadingText: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={styles.container}>
          <>
            {/* Image Comparison View */}
            <ImageComparisonView
              ref={imageComparisonRef}
              imageSrc={imageSrc}
              svg={svg}
              cachedPng={cachedPng}
            />
            
            {/* Download Button */}
            {(converting || (svg && svg.includes('<path'))) && (
              <div style={{ 
                marginTop: '10px', 
                width: `${buttonWidth}px`, 
                margin: '10px 0 0 calc(50% + 45px)',  
                padding: '0 10px' // เพิ่ม padding สำหรับมือถือ
              }}>
                <button
                  onClick={() => setShowExport(true)}
                  disabled={converting}
                  style={{
                    ...styles.downloadButton,
                    fontSize: buttonWidth < 320 ? '14px' : '16px', // ปรับขนาดฟอนต์
                    padding: buttonWidth < 320 ? '10px' : '12px'    // ปรับ padding
                  }}
                  onMouseEnter={e => {
                    if (!converting) {
                      e.currentTarget.style.backgroundColor = '#2a2a2a';
                      e.currentTarget.style.boxShadow = '0 0 0 1px #4ade80';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!converting) {
                      e.currentTarget.style.backgroundColor = '#1e1e1e';
                      e.currentTarget.style.boxShadow = '0 0 0 1px transparent';
                    }
                  }}
                >
                  {/* Progress Bar */}
                  {converting && (
                    <div 
                      style={{
                        ...styles.progressBar,
                        width: `${progress}%`
                      }} 
                    />
                  )}
                  
                  {/* Button Content */}
                  {converting ? (
                    <div style={styles.loadingText}>
                      <FontAwesomeIcon icon={faSpinner} style={styles.spinner} />
                      กำลังแปลง... {progress}%
                    </div>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faDownload} />
                      ดาวน์โหลด
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        
        {/* Export Modal */}
        {showExport && (
          <ExportPreview
            svg={svg}
            cachedPng={cachedPng}
            filename={uploadedFilename}
            dimensions={naturalSize.current}
            colorCount={options.numberofcolors}
            onClose={() => setShowExport(false)}
          />
        )}
      </div>
    </>
  );
});

export default SvgPreview;