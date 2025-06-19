// อัปเดต SvgPreview.jsx ให้รองรับ download PNG/PDF/EPS และ sync zoom/position เต็มรูปแบบ
import React, { useEffect, useRef, useState } from 'react';
import ImageTracer from 'imagetracerjs';
import { Canvg } from 'canvg';

export default function SvgPreview({ imageSrc, options, setSvgData }) {
  const [svg, setSvg] = useState(null);
  const [showSvg, setShowSvg] = useState(false);
  const [svgReady, setSvgReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const svgRenderTimeout = useRef(null);

  const naturalSize = useRef({ width: 0, height: 0 });
  const wrapperSize = 500;
  const border = 100;

  const resetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

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

  const handleGenerate = () => {
    resetView();
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      naturalSize.current = { width: naturalWidth, height: naturalHeight };

      const canvas = document.createElement('canvas');
      canvas.width = naturalWidth;
      canvas.height = naturalHeight;
      const ctx = canvas.getContext('2d');

      if (options.blur > 0) ctx.filter = `blur(${options.blur}px)`;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const finalOptions = {
        ...options,
        roundcoords: 1,
        layering: 0,
        scale: 1
      };

      const result = ImageTracer.imagedataToSVG(imageData, finalOptions);

      const parser = new DOMParser();
      const doc = parser.parseFromString(result, "image/svg+xml");
      const svgEl = doc.querySelector("svg");

      // แก้ปัญหา SVG มีขนาดใหญ่ผิดปกติ และ sync zoom ให้แสดงผลเท่ากับต้นฉบับ
      svgEl.setAttribute("viewBox", `0 0 ${canvas.width} ${canvas.height}`);
      svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svgEl.setAttribute("width", `${canvas.width}`);
      svgEl.setAttribute("height", `${canvas.height}`);
      svgEl.setAttribute("style", "width: 100%; height: 100%; display: block;");

      const serializer = new XMLSerializer();
      const updatedSVG = serializer.serializeToString(doc.documentElement);

      setSvg(updatedSVG);
      setSvgData(updatedSVG);
      setShowSvg(true);
    };
  };

  const downloadPNG = async () => {
    const { width, height } = naturalSize.current;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const v = await Canvg.fromString(ctx, svg);
    await v.render();
    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "converted.png";
    link.href = pngUrl;
    link.click();
  };

  const downloadPDF = async () => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });

    const res = await fetch("http://localhost:8000/convert-pdf/", {
      method: "POST",
      body: blob,
      headers: {
        'Content-Type': 'image/svg+xml'
      }
    });

    if (!res.ok) {
      alert("PDF export failed");
      return;
    }

    const pdfBlob = await res.blob();
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "converted.pdf";
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadEPS = async () => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });

    const res = await fetch("http://localhost:8000/convert-eps/", {
      method: "POST",
      body: blob,
      headers: {
        'Content-Type': 'image/svg+xml'
      }
    });

    if (!res.ok) {
      alert("EPS export failed");
      return;
    }

    const epsBlob = await res.blob();
    const url = URL.createObjectURL(epsBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "converted.eps";
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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

    const handleMouseDown = (e) => {
      dragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
      container.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      setPosition(pos => clampPosition(pos.x + dx, pos.y + dy));
      triggerSvgDelay();
    };

    const handleMouseUp = () => {
      dragging.current = false;
      container.style.cursor = 'grab';
      triggerSvgDelay();
    };

    container.style.cursor = 'grab';
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [zoom]);

  const renderCanvas = async () => {
    if (!svg || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const v = await Canvg.fromString(ctx, svg);
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    await v.render();
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

  useEffect(() => {
    renderCanvas();
  }, [svg]);

  const wrapperStyle = {
    width: `${wrapperSize}px`,
    height: `${wrapperSize}px`,
    backgroundImage: `
      linear-gradient(to right, #eee 1px, transparent 1px),
      linear-gradient(to bottom, #eee 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'grab',
  };

  const layerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    display: 'block',
    objectFit: 'contain',
    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
    transformOrigin: '0 0'
  };

  return (
    <div>
      <button onClick={handleGenerate} style={{ marginBottom: '10px', marginRight: '10px' }}>🔄 แปลงใหม่</button>
      <button onClick={resetView} style={{ marginBottom: '10px' }}>♻️ รีเซ็ตมุมมอง</button>

      {imageSrc && (
        <div ref={containerRef} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <h4>🖼️ ต้นฉบับ</h4>
            <div style={wrapperStyle}>
              <img ref={imageRef} src={imageSrc} alt="Original" style={layerStyle} />
            </div>
          </div>

          <div>
            <h4>🎨 แปลงแล้ว</h4>
            <div style={wrapperStyle}>
              <canvas ref={canvasRef} width={500} height={500} style={layerStyle} />
              {showSvg && (
                <div
                  ref={svgRef}
                  style={{
                    ...layerStyle,
                    visibility: svgReady ? 'visible' : 'hidden',
                    overflow: 'hidden'
                  }}
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              )}
            </div>
            {svg && svg.includes('<path') && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <a
                  href={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
                  download="converted.svg"
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#595959',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none'
                  }}
                >
                  ⬇️ SVG
                </a>
                <button onClick={downloadPDF} style={{ padding: '6px 12px', backgroundColor: '#595959', color: 'white', borderRadius: '6px', border: 'none' }}>⬇️ PDF</button>
                <button onClick={downloadPNG} style={{ padding: '6px 12px', backgroundColor: '#595959', color: 'white', borderRadius: '6px', border: 'none' }}>⬇️ PNG</button>
                <button onClick={downloadEPS} style={{ padding: '6px 12px', backgroundColor: '#595959', color: 'white', borderRadius: '6px', border: 'none' }}>⬇️ EPS</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
