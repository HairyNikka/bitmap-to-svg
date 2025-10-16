import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useExportLogic = () => {
  const [loadingType, setLoadingType] = useState(null);
  const [progress, setProgress] = useState(0);
  const [limitsInfo, setLimitsInfo] = useState(null);
  const [isLimitsLoading, setIsLimitsLoading] = useState(true);

  // Guest ID Management
  const getOrCreateGuestId = useCallback(() => {
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
      guestId = 'guest-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
      localStorage.setItem('guestId', guestId);
    }
    return guestId;
  }, []);

  // ดึงข้อมูลโควตาการส่งออก
  const fetchExportLimits = useCallback(async () => {
    setIsLimitsLoading(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const guestId = getOrCreateGuestId();
      
      const headers = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['X-Guest-ID'] = guestId;
      }

      const response = await axios.get('http://localhost:8000/api/accounts/export-limits/', { headers });
      
      setLimitsInfo(response.data);

      // Update guest_id if received from backend
      if (response.data.guest_id) {
        localStorage.setItem('guestId', response.data.guest_id);
      }
    } catch (error) {
      console.error('Failed to fetch export limits:', error);
      
      // Fallback for guest users when API fails
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        setLimitsInfo({
          user_type: 'guest',
          is_unlimited: false,
          daily_limit: 3,
          used_today: 0,
          remaining: 3,
          guest_id: getOrCreateGuestId()
        });
      }
    } finally {
      setIsLimitsLoading(false);
    }
  }, [getOrCreateGuestId]);

  // Log การส่งออก
  const logExport = useCallback(async (format) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const guestId = getOrCreateGuestId();
      
      const payload = {
        format: format.toLowerCase(),
        filename: 'converted' 
      };

      // Add guest_id for guest users
      if (!token) {
        payload.guest_id = guestId;
      }

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post('http://localhost:8000/api/accounts/log-export/', payload, { headers });

      // Update guest_id if received from backend
      if (response.data.guest_id) {
        localStorage.setItem('guestId', response.data.guest_id);
      }

      // รีเฟรชขีดจำกัดหลังการส่งออก
      await fetchExportLimits();

      return {
        success: true,
        remaining: response.data.remaining_exports || 0
      };
    } catch (error) {
      console.error('Failed to log export:', error);
      
      // Handle rate limit errors
      if (error.response?.status === 429) {
        const errorData = error.response.data;
        const userType = errorData.user_type || 'guest';
        const remaining = errorData.remaining || 0;
        
        let message = `🚫 เกินจำนวนการส่งออกต่อวัน!\n`;
        if (userType === 'guest') {
          message += `Guest ได้ 3 ครั้งต่อวัน (เหลือ ${remaining} ครั้ง)\n\n`;
          message += `💡 เข้าสู่ระบบเพื่อส่งออกได้ 10 ครั้งต่อวัน`;
        } else {
          message += `User ได้ 10 ครั้งต่อวัน (เหลือ ${remaining} ครั้ง)`;
        }
        
        throw new Error(message);
      }
      
      return { success: false, remaining: 0 };
    }
  }, [getOrCreateGuestId, fetchExportLimits]);

  // หลอดโหลด
  useEffect(() => {
    let interval;
    let isMounted = true;
    
    if (loadingType && isMounted) {
      setProgress(0);
      interval = setInterval(() => {
        if (!isMounted) return;
        
        setProgress((prev) => {
          if (prev >= 95) {
            if (interval) clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);
    } else {
      setProgress(0);
    }
    
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [loadingType]);

  // ฟังก์ชันการดาวน์โหลด
  const downloadSVG = useCallback(async (svg, filename) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    return blob;
  }, []);

  const downloadPNG = useCallback(async (svg) => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create PNG blob'));
            }
          }, 'image/png');
        };
        img.onerror = () => reject(new Error('Failed to load SVG for PNG conversion'));
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  const downloadPDFOrEPS = useCallback(async (svg, type) => {
    const response = await fetch(`http://localhost:8000/convert-${type}/`, {
      method: 'POST',
      body: new Blob([svg], { type: 'image/svg+xml' }),
      headers: { 'Content-Type': 'image/svg+xml' },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to convert to ${type.toUpperCase()}`);
    }
    
    return await response.blob();
  }, []);

  // Main Download Handler
  const handleDownload = useCallback(async (type, svg, filename = 'converted') => {
    setLoadingType(type);
    
    try {
      let blob;
      
      // PNG ไม่ต้องตรวจสอบโควตาการส่งออก
      if (type === 'png') {
        await logExport(type);
        blob = await downloadPNG(svg);
      } else {
        // ถ้า SVG/PDF/EPS, ต้องตรวจสอบโควตาส่งออก
        const exportResult = await logExport(type);
        
        if (!exportResult.success) {
          return; // หยุดถ้าโควตาเกิน
        }
        
        // สร้าง blob ตามประเภทไฟล์
        if (type === 'svg') {
          blob = await downloadSVG(svg, filename);
        } else if (type === 'pdf' || type === 'eps') {
          blob = await downloadPDFOrEPS(svg, type);
        }
      }

      // โหลดไฟล์
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${type}`;
      link.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error(`${type.toUpperCase()} export failed:`, error);
      throw error; 
    } finally {
      setLoadingType(null);
      setProgress(100);
    }
  }, [logExport, downloadPNG, downloadSVG, downloadPDFOrEPS]);

  // Initialize limits on mount
  useEffect(() => {
    fetchExportLimits();
  }, [fetchExportLimits]);

  return {
    // States
    loadingType,
    progress,
    limitsInfo,
    isLimitsLoading,
    
    // Functions
    handleDownload,
    fetchExportLimits,
    
    // Computed values
    canExport: (type) => {
      if (!limitsInfo) return false;
      if (type === 'png') return true; // PNG จะโหลดได้เสมอ
      if (limitsInfo.is_unlimited) return true;
      return limitsInfo.remaining > 0;
    }
  };
};

export default useExportLogic;