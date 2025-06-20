// ✅ UploadImage: เปลี่ยนเป็นไอคอน svg รูปภาพ + ปรับความสูงกล่อง drag drop ให้พอดีกับข้อความ
import React, { useState, useEffect, useRef } from 'react';

export default function UploadImage({ setSvgData, setImageSrc, setOptions, imageSrc, options, resetTrigger }) {
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

  return (
    <div style={{ marginBottom: '10px', maxWidth: '100%', width: '100%' }}>
      <div
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: '2px dashed #888',
          padding: '12px 16px', 
          textAlign: 'center',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '20px',
          backgroundColor: '#2a2a2a',
          color: '#ccc',
          fontSize: '14px',
          height: '48px', 
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

      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {Object.keys(optionLabels).map((key) => (
          <div key={key} style={{ minWidth: '250px', flex: '1' }}>
            <label htmlFor={key}>
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
