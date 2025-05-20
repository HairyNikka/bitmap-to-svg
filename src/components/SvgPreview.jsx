
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

  const wrapperSize = 500;

  const handleGenerate = () => {
    if (!imageSrc) return;

    setZoom(1);
    setPosition({ x: 0, y: 0 });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

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
      svgEl.setAttribute("width", "100%");
      svgEl.setAttribute("height", "100%");
      const serializer = new XMLSerializer();
      const updatedSVG = serializer.serializeToString(doc.documentElement);

      setSvg(updatedSVG);
      setSvgData(updatedSVG);
      setShowSvg(true);
    };
  };

  useEffect(() => {
    const renderCanvas = async () => {
      if (!svg || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      const v = await Canvg.fromString(ctx, svg);
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      await v.render();
    };
    renderCanvas();
  }, [svg]);

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
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.max(0.2, Math.min(z + delta, 5)));
      triggerSvgDelay();
    };

    const handleMouseDown = (e) => {
      dragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      setPosition(pos => ({ x: pos.x + dx, y: pos.y + dy }));
      triggerSvgDelay();
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
  }, []);

  const wrapperStyle = {
    width: '500px',
    height: '500px',
    background: '#fff',
    border: '1px solid #ccc',
    position: 'relative',
    overflow: 'hidden',
  };

  const layerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    display: 'block',
    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
    transformOrigin: '0 0'
  };

  const imageStyle = {
    ...layerStyle,
    objectFit: 'contain'
  };

  return (
    <div>
      <button onClick={handleGenerate} style={{ marginBottom: '10px' }}>
        🔄 แปลงใหม่
      </button>

      {imageSrc && (
        <div ref={containerRef} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <h4>🖼️ ต้นฉบับ</h4>
            <div style={wrapperStyle}>
              <img ref={imageRef} src={imageSrc} alt="Original" style={imageStyle} />
            </div>
          </div>

          <div>
            <h4>🎨 แปลงแล้ว</h4>
            <div style={wrapperStyle}>
              <canvas ref={canvasRef} width={500} height={500} style={layerStyle} />
              {showSvg && (
                <div
                  ref={svgRef}
                  style={{ ...layerStyle, visibility: svgReady ? 'visible' : 'hidden' }}
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              )}
            </div>
            {svg && svg.includes('<path') && (
              <a
                href={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
                download="converted.svg"
                style={{ display: 'inline-block', marginTop: '10px', color: 'blue' }}
              >
                ⬇️ Download SVG
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
