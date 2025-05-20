import React, { useState, useEffect } from 'react';

export default function UploadImage({ setSvgData, setImageSrc, setOptions }) {
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

  const handleReset = () => {
    setLocalOptions(defaultOptions);
    setSvgData(null);
    setImageSrc(null);
  };

  const optionLabels = {
    pathomit: "ละเส้นเล็ก (Path omit)",
    numberofcolors: "จำนวนสี (Number of colors)",
    strokewidth: "ความหนาของเส้น (Stroke width)",
    blur: "เบลอก่อนแปลง (Blur)"
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      <input type="file" accept="image/*" onChange={handleChange} />

      <div style={{ marginTop: '10px' }}>
        {Object.keys(optionLabels).map((key) => (
          <div key={key} style={{ marginBottom: '8px' }}>
            <label htmlFor={key}>
              {optionLabels[key]}: {localOptions[key]}
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
              value={localOptions[key]}
              onChange={handleOptionChange}
              style={{ width: '250px' }}
            />
          </div>
        ))}
        <button onClick={handleReset} style={{ marginTop: '10px' }}>
          ♻️ รีเซ็ตค่า
        </button>
      </div>
    </div>
  );
}
