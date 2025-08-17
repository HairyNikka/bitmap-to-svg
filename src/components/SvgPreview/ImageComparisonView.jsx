// src/components/SvgPreview/ImageComparisonView.jsx
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';

export default forwardRef(function ImageComparisonView({ imageSrc, svg, cachedPng, converting }, ref) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showSvg, setShowSvg] = useState(false);
  const [svgReady, setSvgReady] = useState(false);
  const [wrapperSize, setWrapperSize] = useState(500);
  const [isMobile, setIsMobile] = useState(false);

  const svgRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const svgRenderTimeout = useRef(null);
  const moveFrame = useRef(null);

  const border = 100;

  // 📱 ฟังก์ชันคำนวณขนาดตามหน้าจอ
  const getResponsiveSize = () => {
    const width = window.innerWidth;
    if (width < 480) return { size: 280, isMobile: true };   // มือถือเล็ก
    if (width < 768) return { size: 320, isMobile: true };   // มือถือใหญ่
    if (width < 1024) return { size: 400, isMobile: false }; // แท็บเล็ต
    return { size: 500, isMobile: false }; // Desktop
  };

  // 🔄 Debounced resize handler
  const debouncedResize = useMemo(() => {
    let timeoutId;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const { size, isMobile: mobile } = getResponsiveSize();
        setWrapperSize(size);
        setIsMobile(mobile);
      }, 150);
    };
  }, []);

  // 📐 Setup responsive ตอน mount และ resize
  useEffect(() => {
    const { size, isMobile: mobile } = getResponsiveSize();
    setWrapperSize(size);
    setIsMobile(mobile);

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
    };
  }, [debouncedResize]);

  const resetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // ✅ เพิ่ม useImperativeHandle เพื่อให้ parent เรียกใช้ได้
  useImperativeHandle(ref, () => ({
    resetView
  }));

  // Reset view เมื่อมีภาพใหม่
  useEffect(() => {
    if (imageSrc) {
      resetView();
    }
  }, [imageSrc]);

  // แสดง SVG เมื่อพร้อม
  useEffect(() => {
    if (svg) {
      setShowSvg(true);
      setSvgReady(true);
    }
  }, [svg]);

  const clampPosition = (x, y) => {
    const imageSize = wrapperSize * zoom;
    const minX = wrapperSize - imageSize - border;
    const maxX = border;
    const minY = wrapperSize - imageSize - border;
    const maxY = border;
    return {
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY)),
    };
  };

  const triggerSvgDelay = () => {
    setShowSvg(false);
    setSvgReady(false);
    clearTimeout(svgRenderTimeout.current);
    svgRenderTimeout.current = setTimeout(() => {
      setShowSvg(true);
      setSvgReady(true);
    }, 300);
  };

  // 🎯 Mouse/Touch Events - รองรับทั้งสอง
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 🖱️ Mouse Events
    const handleMouseDown = (e) => {
      e.preventDefault();
      dragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!dragging.current) return;
      if (moveFrame.current) cancelAnimationFrame(moveFrame.current);
      moveFrame.current = requestAnimationFrame(() => {
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        lastPos.current = { x: e.clientX, y: e.clientY };
        setPosition(pos => clampPosition(pos.x + dx, pos.y + dy));
        triggerSvgDelay();
      });
    };

    const handleMouseUp = () => {
      dragging.current = false;
      triggerSvgDelay();
    };

    // 📱 Touch Events
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        dragging.current = true;
        const touch = e.touches[0];
        lastPos.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchMove = (e) => {
      if (!dragging.current || e.touches.length !== 1) return;
      e.preventDefault();
      if (moveFrame.current) cancelAnimationFrame(moveFrame.current);
      moveFrame.current = requestAnimationFrame(() => {
        const touch = e.touches[0];
        const dx = touch.clientX - lastPos.current.x;
        const dy = touch.clientY - lastPos.current.y;
        lastPos.current = { x: touch.clientX, y: touch.clientY };
        setPosition(pos => clampPosition(pos.x + dx, pos.y + dy));
        triggerSvgDelay();
      });
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      dragging.current = false;
      triggerSvgDelay();
    };

    // 🔍 Wheel/Pinch Events  
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => {
        const newZoom = Math.max(0.2, Math.min(z + delta, 5));
        setPosition(pos => clampPosition(pos.x, pos.y));
        return newZoom;
      });
      triggerSvgDelay();
    };

    // Event Listeners
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (svgRenderTimeout.current) clearTimeout(svgRenderTimeout.current);
      if (moveFrame.current) cancelAnimationFrame(moveFrame.current);
    };
  }, [zoom, wrapperSize]); // เพิ่ม wrapperSize dependency

  // Styles
  const styles = {
    container: {
      display: 'flex',
      gap: isMobile ? '15px' : '10px',
      flexDirection: isMobile ? 'column' : 'row',
      flexWrap: 'nowrap',
      justifyContent: 'center',
      alignItems: isMobile ? 'center' : 'flex-start',
      padding: isMobile ? '0 10px' : '0'
    },
    section: {
      alignSelf: isMobile ? 'center' : 'flex-start',
      width: isMobile ? '100%' : 'auto',
      maxWidth: isMobile ? `${wrapperSize}px` : 'none'
    },
    sectionTitle: {
      margin: 0,
      marginBottom: 8,        // เพิ่มจาก 6 เป็น 8
      marginTop: 50,           // ← เพิ่มบรรทัดนี้
      color: '#ffffff',
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: '500',
      textAlign: isMobile ? 'center' : 'left',
      position: 'relative',   // ← เพิ่มบรรทัดนี้
    },
    wrapper: {
      width: `${wrapperSize}px`,
      height: `${wrapperSize}px`,
      marginTop: '20px', 
      backgroundImage: `
        linear-gradient(to right, #333 1px, transparent 1px),
        linear-gradient(to bottom, #333 1px, transparent 1px)
      `,
      backgroundSize: isMobile ? '15px 15px' : '20px 20px',
      backgroundColor: '#1e1e1e',
      border: '1px solid #555',
      position: 'relative',
      overflow: 'hidden',
      cursor: dragging.current ? 'grabbing' : 'grab',
      borderRadius: '8px',
      margin: isMobile ? '0 auto' : '0',
      // 📱 เพิ่ม touch-action สำหรับ mobile
      touchAction: 'none',
      // 🎯 เพิ่ม user-select ป้องกันการเลือกข้อความ
      userSelect: 'none',
      WebkitUserSelect: 'none'
    },
    layer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      display: 'block',
      objectFit: 'contain',
      transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
      transformOrigin: '0 0',
      userSelect: 'none',
      WebkitUserSelect: 'none'
    },
    placeholder: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#666',
      fontSize: isMobile ? '12px' : '14px',
      textAlign: 'center',
      padding: '20px',
      pointerEvents: 'none'
    }
  };

  return (
    <div ref={containerRef} style={styles.container}>
      {/* ภาพต้นฉบับ */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>
            <FontAwesomeIcon icon={faImage} style={{ marginRight: '8px' }} />
            ต้นฉบับ
        </h4>
        <div style={styles.wrapper}>
          {imageSrc && (
          <img 
            ref={imageRef} 
            src={imageSrc} 
            alt="Original" 
            style={styles.layer} 
            draggable={false} 
          />
          )}
        </div>
      </div>

      {/* ภาพแปลงแล้ว */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>
            <FontAwesomeIcon icon={faMagicWandSparkles} style={{ marginRight: '8px' }} />
            แปลงแล้ว
        </h4>
        <div style={styles.wrapper}>
          {/* แสดง PNG cache ขณะที่ SVG กำลัง render */}
          {!showSvg && cachedPng && (
            <img 
              src={cachedPng} 
              alt="preview" 
              style={styles.layer} 
              draggable={false} 
            />
          )}
          
          {/* แสดง SVG เมื่อพร้อม */}
          {showSvg && svgReady && svg && (
            <div
              ref={svgRef}
              style={styles.layer}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
          {/* Placeholder เมื่อยังไม่มีภาพ */}
          {!svg && !cachedPng && (
            <div style={styles.placeholder}>
              {imageSrc ? 
                "กดปุ่ม \"แปลงภาพ\" เพื่อเริ่มต้น" : 
                "อัปโหลดรูปภาพเพื่อเริ่มต้น"
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
});