// ✅ UploadImage: ปรับขนาดปุ่ม Preset ให้เท่ากัน และขนาดตัวอักษรพอดีบรรทัดเดียว
import React, { useState, useEffect, useRef } from 'react';

export default function UploadImage({ setSvgData, setImageSrc, setOptions, imageSrc, options, resetTrigger, setFilename}) {
  const defaultOptions = {
    pathomit: 1,
    numberofcolors: 8,
    strokewidth: 1,
    blur: 0
  };

  const [localOptions, setLocalOptions] = useState(defaultOptions);
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    setOptions(localOptions);
  }, [localOptions, setOptions]);

  useEffect(() => {
    if (options && Object.keys(options).length > 0) {
      setLocalOptions(options);
    }
  }, [resetTrigger]);

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setLocalOptions((prev) => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
    setFileName(file.name);
      if (typeof setFilename === 'function') {
    setFilename(file.name); 
  }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const optionLabels = {
    pathomit: "ละเส้นเล็ก (Path omit)",
    numberofcolors: "จำนวนสี (Number of colors)",
    strokewidth: "ความหนาของเส้น (Stroke width)",
    blur: "เบลอก่อนแปลง (Blur)"
  };

  const getTruncatedFileName = (name, max = 30) => {
    if (!name) return "";
    if (name.length <= max) return name;
    const dotIndex = name.lastIndexOf(".");
    const ext = name.slice(dotIndex);
    const base = name.slice(0, max - ext.length - 3);
    return base + "..." + ext;
  };

  const handlePreset = (level) => {
    let newOptions;
    switch (level) {
      case 'ต่ำ':
        newOptions = { ...localOptions, pathomit: 8, numberofcolors: 4, strokewidth: 1, blur: 0 };
        break;
      case 'ปานกลาง':
        newOptions = { ...localOptions, pathomit: 4, numberofcolors: 8, strokewidth: 1, blur: 0 };
        break;
      case 'สูง':
        newOptions = { ...localOptions, pathomit: 1, numberofcolors: 16, strokewidth: 1, blur: 0 };
        break;
      default:
        return;
    }
    setLocalOptions(newOptions);
  };

  return (
    <div style={{ marginBottom: '10px', maxWidth: '100%', width: '100%' }}>
      <div
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: '2px dashed #888',
          padding: '12px',
          textAlign: 'center',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '12px',
          backgroundColor: '#2a2a2a',
          color: '#ccc',
          fontSize: '14px',
          height: '45px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {fileName
          ? `🖼️ ${getTruncatedFileName(fileName)}`
          : "➕ ลากรูปมาวาง หรือคลิกเพื่อเลือกไฟล์"}
        <input
          type="file"
          accept="image/bmp,image/png,image/jpeg,image/jpg"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
        />
      </div>

      <div style={{ marginBottom: '12px', textAlign: 'left', fontSize: '16px' }}>
        <div style={{ marginBottom: '6px', fontFamily: 'inherit', fontWeight: 'normal' }}>พรีเซ็ตความละเอียด (Detail Presets):</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {['ต่ำ', 'ปานกลาง', 'สูง'].map((level) => (
            <button
              key={level}
              onClick={() => handlePreset(level)}
              style={{
                backgroundColor: '#111',
                color: 'white',
                border: '1px solid #555',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 'normal',
                lineHeight: '2',
                fontFamily: 'inherit'
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {Object.keys(optionLabels).map((key) => (
          <div key={key} style={{ minWidth: '250px', flex: '1' }}>
            <label htmlFor={key} style={{ fontFamily: 'inherit', fontSize: '16px', fontWeight: 'normal' }}>
              {optionLabels[key]}: {localOptions[key] ?? 0}
            </label>
            <br />
            <input
              type="range"
              name={key}
              id={key}
              min={0}
              max={
                key === 'numberofcolors' ? 32 :
                key === 'strokewidth' ? 5 :
                key === 'blur' ? 5 : 20
              }
              step={key === 'blur' ? 0.1 : key === 'strokewidth' ? 0.5 : 1}
              value={localOptions[key] ?? 0}
              onChange={handleOptionChange}
              style={{ width: '100%' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export const defaultOptions = {
  pathomit: 1,
  numberofcolors: 8,
  strokewidth: 1,
  blur: 0
};
