import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faPlus, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const UploadImage = ({ setImageSrc, setFilename, imageSrc }) => {
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef();

  // ฟังก์ชันสำหรับบันทึก upload log
  const logUpload = async (file) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      // ตรวจสอบว่าผู้ใช้ login อยู่หรือไม่
      if (!token) {
        console.log('ถ้าผู้ใช้ไม่ได้เข้าสู่ระบบ ไม่ต้องบันทึก log upload');
        return;
      }

      await axios.post('http://localhost:8000/api/accounts/log-upload/', {
        filename: file.name,
        file_size: file.size,
        file_type: file.type
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('อัปโหลดไฟล์สำเร็จ');
    } catch (error) {
      console.error('อัปโหลดไฟล์ไม่สำเร็จ:', error);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
    setFileName(file.name);
    
    if (typeof setFilename === 'function') {
      setFilename(file.name); 
    }

    logUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const getTruncatedFileName = (name, max = 30) => {
    if (!name) return "";
    if (name.length <= max) return name;
    const dotIndex = name.lastIndexOf(".");
    const ext = name.slice(dotIndex);
    const base = name.slice(0, max - ext.length - 3);
    return base + "..." + ext;
  };

  const isDefaultImage = imageSrc?.includes("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAU");

  return (
    <div style={styles.container}>
      {/* กล่องสำหรับอัพโหลดไฟล์ภาพ */}
      <div
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={styles.uploadArea}
      >
        <div style={styles.uploadContent}>
          {fileName && !isDefaultImage ? (
            <>
              <FontAwesomeIcon icon={faImage} style={styles.uploadIcon} />
              <span style={styles.fileName}>
                {getTruncatedFileName(fileName)}
              </span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCloudUploadAlt} style={styles.uploadIcon} />
              <span style={styles.uploadText}>
                ลากรูปมาวาง หรือคลิกเพื่อเลือกไฟล์
              </span>
            </>
          )}
        </div>
        
        <input
          type="file"
          accept="image/bmp,image/png,image/jpeg,image/jpg"
          style={styles.hiddenInput}
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
      </div>

    </div>
  );
};

const styles = {
  container: {
    marginBottom: '16px',
    width: '100%'
  },
  uploadArea: {
    border: '2px dashed #888',
    padding: '16px',
    textAlign: 'center',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: '#2a2a2a',
    color: '#ccc',
    fontSize: '14px',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    position: 'relative'
  },
  uploadContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    flexDirection: 'column'
  },
  uploadIcon: {
    fontSize: '24px',
    color: '#888',
    marginBottom: '4px'
  },
  uploadText: {
    fontSize: '14px',
    color: '#ccc'
  },
  fileName: {
    fontSize: '14px',
    color: '#4ade80',
    fontWeight: '500',
    textAlign: 'center',
    wordBreak: 'break-word'
  },
  hiddenInput: {
    display: 'none'
  }
};

export default UploadImage;