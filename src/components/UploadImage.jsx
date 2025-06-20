// ✅ UploadImage: รองรับ resetTrigger เพื่อ sync localOptions เมื่อ reset จริง
import React, { useState, useEffect } from 'react';

export default function UploadImage({ setSvgData, setImageSrc, setOptions, imageSrc, options, resetTrigger }) {
  const defaultOptions = {
    pathomit: 1,
    numberofcolors: 8,
    strokewidth: 1,
    blur: 0
  };

  const [localOptions, setLocalOptions] = useState(defaultOptions);

  useEffect(() => {
    setOptions(localOptions);
  }, [localOptions, setOptions]);

  // ✅ sync options → localOptions เมื่อ resetTrigger เปลี่ยน
  useEffect(() => {
    if (options && Object.keys(options).length > 0) {
      setLocalOptions(options);
    }
  }, [resetTrigger]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setLocalOptions((prev) => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const optionLabels = {
    pathomit: "ละเส้นเล็ก (Path omit)",
    numberofcolors: "จำนวนสี (Number of colors)",
    strokewidth: "ความหนาของเส้น (Stroke width)",
    blur: "เบลอก่อนแปลง (Blur)"
  };

  return (
    <div style={{ marginBottom: '10px', maxWidth: '100%', width: '100%' }}>
      <input type="file" accept="image/*" onChange={handleChange} />

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

// ✅ export ค่าเริ่มต้นสำหรับ reset จาก Home
export const defaultOptions = {
  pathomit: 1,
  numberofcolors: 8,
  strokewidth: 1,
  blur: 0
};
