import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import ImageTracer from 'imagetracerjs';
import { Canvg } from 'canvg';

const SvgPreview = forwardRef(({ imageSrc, options, setSvgData }, ref) => {
  const [svg, setSvg] = useState(null);
  const [showSvg, setShowSvg] = useState(false);
  const [svgReady, setSvgReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cachedPng, setCachedPng] = useState(null);

  const svgRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const svgRenderTimeout = useRef(null);
  const moveFrame = useRef(null);

  const naturalSize = useRef({ width: 0, height: 0 });
  const wrapperSize = 500;
  const border = 100;

  const resetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (imageSrc) {
      resetView();
    }
  }, [imageSrc]);

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

  const convertSvgToPng = async (svgString) => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    const v = await Canvg.fromString(ctx, svgString);
    await v.render();
    return canvas.toDataURL("image/png");
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
      headers: { 'Content-Type': 'image/svg+xml' }
    });
    if (!res.ok) return alert("PDF export failed");
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
      headers: { 'Content-Type': 'image/svg+xml' }
    });
    if (!res.ok) return alert("EPS export failed");
    const epsBlob = await res.blob();
    const url = URL.createObjectURL(epsBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "converted.eps";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    resetView();
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = async () => {
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

      svgEl.setAttribute("viewBox", `0 0 ${canvas.width} ${canvas.height}`);
      svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svgEl.setAttribute("width", `${canvas.width}`);
      svgEl.setAttribute("height", `${canvas.height}`);
      svgEl.setAttribute("style", "width: 100%; height: 100%; display: block;");

      const serializer = new XMLSerializer();
      const updatedSVG = serializer.serializeToString(doc.documentElement);

      setSvg(updatedSVG);
      setSvgData(updatedSVG);
      const pngData = await convertSvgToPng(updatedSVG);
      setCachedPng(pngData);
      setShowSvg(true);
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

  useImperativeHandle(ref, () => ({
    generate: handleGenerate,
    reset: resetView
  }));

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
    cursor: 'grab'
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
    transformOrigin: '0 0',
    userSelect: 'none'
  };

  return (
    <div style={{ marginTop: '4px' }}>
      {imageSrc && (
        <div
          ref={containerRef}
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'nowrap',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}
        >
          <div style={{ alignSelf: 'flex-start' }}>
            <h4 style={{ margin: 0, marginBottom: 6 }}>🖼️ ต้นฉบับ</h4>
            <div style={wrapperStyle}>
              <img ref={imageRef} src={imageSrc} alt="Original" style={layerStyle} draggable={false} />
            </div>
          </div>

          <div style={{ alignSelf: 'flex-start' }}>
            <h4 style={{ margin: 0, marginBottom: 6 }}>🎨 แปลงแล้ว</h4>
            <div style={wrapperStyle}>
              {!showSvg && cachedPng && (
                <img src={cachedPng} alt="preview" style={layerStyle} draggable={false} />
              )}
              {showSvg && svgReady && (
                <div
                  ref={svgRef}
                  style={layerStyle}
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
});

export default SvgPreview;
