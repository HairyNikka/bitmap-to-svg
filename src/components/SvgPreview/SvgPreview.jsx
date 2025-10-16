import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import ImageTracer from 'imagetracerjs';
import { Canvg } from 'canvg';
import ImageComparisonView from './ImageComparisonView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const SvgPreview = forwardRef(({ 
  imageSrc, 
  options, 
  setSvgData, 
  filename, 
  isParameterAdjusting, 
  setCachedPng, 
  setNaturalSize, 
  setIsConverting  
}, ref) => {
  const [svg, setSvg] = useState(null);
  const [cachedPng, setCachedPngLocal] = useState(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const naturalSize = useRef({ width: 0, height: 0 });
  const uploadedFilename = filename;

  //ส่งสถานะ converting ไปยัง home เพื่อล็อคปุ่ม
  useEffect(() => {
    if (setIsConverting) {
      setIsConverting(converting);
    }
  }, [converting, setIsConverting]);

  const convertSvgToPng = async (svgString) => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    const v = await Canvg.fromString(ctx, svgString);
    await v.render();
    return canvas.toDataURL("image/png");
  };

  const logConversion = async (filename, fileSize) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        console.log('ผู้ใช้ไม่ได้เข้าสู่ระบบ ไม่ต้องบันทึก log conversion');
        return true;
      }

      const response = await axios.post('http://localhost:8000/api/accounts/log-conversion/', {
        filename: filename || 'unknown.jpg',
        file_size: fileSize || 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('บันทึกการแปลงสำเร็จ:', response.data);
      return true;
    } catch (error) {
      console.error('บันทึกการแปลงไม่สำเร็จ:', error);
      
      if (error.response?.status === 429) {
        alert(`เกินจำนวนการแปลงที่อนุญาตต่อวัน\nเหลือ: ${error.response.data.remaining || 0} ครั้ง`);
        return false;
      }
      
      return true;
    }
  };

  const handleGenerate = async () => {
   
    setConverting(true); 
    setProgress(0);

    try {
      if (!imageSrc) return;

      setProgress(10);
      const canProceed = await logConversion(uploadedFilename, imageSrc.length);
      if (!canProceed) {
        setProgress(0);
        setConverting(false);
        return;
      }

      setProgress(30);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      img.onload = async () => {
        try {
          const naturalWidth = img.naturalWidth;
          const naturalHeight = img.naturalHeight;
          naturalSize.current = { width: naturalWidth, height: naturalHeight };
          
          if (setNaturalSize) {
            setNaturalSize({ width: naturalWidth, height: naturalHeight });
          }

          setProgress(50);
          const canvas = document.createElement('canvas');
          canvas.width = naturalWidth;
          canvas.height = naturalHeight;
          const ctx = canvas.getContext('2d');

          if (options.blur > 0) ctx.filter = `blur(${options.blur}px)`;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          setProgress(70);
          const finalOptions = {
            ...options,
            roundcoords: 1,
            layering: 0,
            scale: 1
          };

          const result = ImageTracer.imagedataToSVG(imageData, finalOptions);

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

          setProgress(95);
          setSvg(updatedSVG);
          setSvgData(updatedSVG);
          
          const pngData = await convertSvgToPng(updatedSVG);
          setCachedPngLocal(pngData);
          
          if (setCachedPng) {
            setCachedPng(pngData);
          }
          
          setProgress(100);
          
          // รอ 500 ms ก่อนปลดล็อค
          setTimeout(() => {
            setProgress(0);
            setConverting(false);
          }, 500);
        } catch (error) {
          console.error('เกิดข้อผิดพลาดในการแปลงภาพ:', error);
          setProgress(0);
          setConverting(false); 
        }
      };

      img.onerror = () => {
        console.error('โหลดภาพไม่สำเร็จ');
        setProgress(0);
        setConverting(false); 
      };
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการแปลงภาพ:', error);
      setProgress(0);
      setConverting(false); 
    }
  };

  const imageComparisonRef = useRef();

  const resetView = () => {
    setProgress(0);
    setConverting(false);
    imageComparisonRef.current?.resetView();
  };

  useImperativeHandle(ref, () => ({
    generate: handleGenerate,
    reset: resetView
  }));

  const styles = {
    container: {
      marginTop: '4px',
      position: 'relative'
    },
    progressContainer: {
      width: '100%',
      marginTop: '16px',
      marginLeft: '55px' 
    },
    progressBar: {
      width: '1010px', 
      height: '6px',
      backgroundColor: '#2a2a2a',
      borderRadius: '3px',
      overflow: 'hidden',
      border: '1px solid #444',
      position: 'relative'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#10b981',
      transition: 'width 0.3s ease',
      borderRadius: '3px',
      boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
    },
    progressText: {
      textAlign: 'center',
      marginTop: '8px',
      fontSize: '13px',
      color: '#888',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    spinner: {
      animation: 'spin 1s linear infinite'
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
        {/* กล่องแสดงภาพเปรียบเทียบ */}
        <ImageComparisonView
          ref={imageComparisonRef}
          imageSrc={imageSrc}
          svg={svg}
          cachedPng={cachedPng}
          isParameterAdjusting={isParameterAdjusting}
        />
        
        {/* หลอดโหลดแสดงใต้กล่อง preview */}
        {converting && (
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${progress}%`
                }}
              />
            </div>
            <div style={styles.progressText}>
              <FontAwesomeIcon icon={faSpinner} style={styles.spinner} />
              กำลังแปลง... {progress}%
            </div>
          </div>
        )}
      </div>
    </>
  );
});

export default SvgPreview;