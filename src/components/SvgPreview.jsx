import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import ImageTracer from 'imagetracerjs';
import { Canvg } from 'canvg';
import ExportPreview from './ExportPreview';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const SvgPreview = forwardRef(({ imageSrc, options, setSvgData, filename }, ref) => {
  const [svg, setSvg] = useState(null);
  const [showSvg, setShowSvg] = useState(false);
  const [svgReady, setSvgReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cachedPng, setCachedPng] = useState(null);
  const [showExport, setShowExport] = useState(false);

  const uploadedFilename = filename;
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
      linear-gradient(to right, #333 1px, transparent 1px),
      linear-gradient(to bottom, #333 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
    backgroundColor: '#1e1e1e',
    border: '1px solid #555',
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
              <div style={{ marginTop: '10px', width: `${wrapperSize}px` }}>
                <button
                  onClick={() => setShowExport(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1e1e1e',
                    color: 'white',
                    borderRadius: '10px',
                    fontSize: '16px',
                    border: '1px solid #444',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 0 0 1px transparent'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                    e.currentTarget.style.boxShadow = '0 0 0 1px #4ade80';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = '#1e1e1e';
                    e.currentTarget.style.boxShadow = '0 0 0 1px transparent';
                  }}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  ดาวน์โหลด
                </button>
              </div>
            )}
          </div>
        </div>
      )}
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
  );
});

export default SvgPreview;
