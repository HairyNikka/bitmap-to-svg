import React, { useState } from 'react';
import UploadImage from './UploadImage';
import SvgPreview from './SvgPreview';

export default function Home() {
  const [svgData, setSvgData] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [options, setOptions] = useState({
    pathomit: 8,
    numberofcolors: 8,
    strokewidth: 1,
    scale: 1,
    blur: 0
  });
  const [monoMode, setMonoMode] = useState(false);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🖼️ Bitmap to SVG Converter</h1>
      <UploadImage
        setSvgData={setSvgData}
        setImageSrc={setImageSrc}
        setOptions={setOptions}
        setMonoMode={setMonoMode}
      />
      {imageSrc && (
        <SvgPreview
          imageSrc={imageSrc}
          options={options}
          monoMode={monoMode}
          setSvgData={setSvgData}
        />
      )}
    </div>
  );
}
