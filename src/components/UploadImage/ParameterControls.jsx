import React, { useState, useEffect, useRef} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faPalette, 
  faMagicWandSparkles,
  faSliders,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

const ParameterControls = ({ options, setOptions, resetTrigger }) => {
  const defaultOptions = {
    pathomit: 1,
    numberofcolors: 8,
    strokewidth: 1,
    blur: 0,
    ltres: 1,
    qtres: 1,
    mincolorratio: 0.02,
    linefilter: false,
    rightangle: false
  };

  const [localOptions, setLocalOptions] = useState(defaultOptions);
  const isUpdatingFromParent = useRef(false); // ✅ เพิ่มนี้

  // Sync with parent options
  useEffect(() => {
    if (!isUpdatingFromParent.current) {
      setOptions(localOptions);
    }
  }, [localOptions, setOptions]);

  // Reset when resetTrigger changes  
  useEffect(() => {
    if (options && Object.keys(options).length > 0) {
      isUpdatingFromParent.current = true; // ✅ ป้องกัน loop
      setLocalOptions(options);
      setTimeout(() => {
        isUpdatingFromParent.current = false; // ✅ รีเซ็ต flag
      }, 0);
    }
  }, [resetTrigger]); // ✅ ลบ options dependency

  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setLocalOptions((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value)
    }));
  };

  // Parameter configuration with grouping
  const parameterGroups = {
    quality: {
      name: "คุณภาพและรายละเอียด",
      icon: faStar,
      color: "#fbbf24",
      params: {
        pathomit: {
          label: "ละเส้นเล็ก",
          description: "ค่าสูง = เส้นน้อยลง ไฟล์เล็กลง",
          min: 0,
          max: 20,
          step: 1
        },
        ltres: {
          label: "ความละเอียดเส้น",
          description: "ค่าสูง = เส้นเรียบขึ้น แต่ใหญ่ขึ้น",
          min: 0.1,
          max: 5,
          step: 0.1
        },
        qtres: {
          label: "ความโค้งของเส้น",
          description: "ค่าสูง = เส้นโค้งนุ่มนวลขึ้น",
          min: 0.1,
          max: 5,
          step: 0.1
        }
      }
    },
    colors: {
      name: "สีและการจัดการสี",
      icon: faPalette,
      color: "#a855f7",
      params: {
        numberofcolors: {
          label: "จำนวนสี",
          description: "จำนวนสีสูงสุดที่ใช้ในผลลัพธ์",
          min: 2,
          max: 32,
          step: 1
        },
        mincolorratio: {
          label: "กรองสีที่ใช้น้อย",
          description: "ค่าสูง = กรองสีที่ใช้พื้นที่น้อยออก",
          min: 0,
          max: 0.2,
          step: 0.01
        }
      }
    },
    effects: {
      name: "เอฟเฟกต์และการปรับแต่ง",
      icon: faMagicWandSparkles,
      color: "#10b981",
      params: {
        strokewidth: {
          label: "ความหนาของเส้น",
          description: "ความหนาของเส้นขอบ",
          min: 0,
          max: 5,
          step: 0.5
        },
        blur: {
          label: "เบลอก่อนแปลง",
          description: "เบลอภาพก่อนแปลงเป็นเวกเตอร์",
          min: 0,
          max: 5,
          step: 0.1
        }
      }
    },
    advanced: {
      name: "ตัวเลือกขั้นสูง",
      icon: faSliders,
      color: "#ef4444",
      params: {
        linefilter: {
          label: "กรองเส้นซ้ำซ้อน",
          description: "ลดเส้นที่ซ้ำซ้อนกันออก",
          type: "checkbox"
        },
        rightangle: {
          label: "บังคับมุมฉาก",
          description: "แปลงเส้นโค้งเป็นมุมฉาก",
          type: "checkbox"
        }
      }
    }
  };

  const renderSlider = (groupKey, paramKey, config) => {
    const value = localOptions[paramKey] ?? (config.type === 'checkbox' ? false : config.min);
    
    return (
      <div key={paramKey} style={styles.parameterItem}>
        <div style={styles.parameterHeader}>
          <label htmlFor={paramKey} style={styles.parameterLabel}>
            {config.label}
            {config.type !== 'checkbox' && (
              <span style={styles.parameterValue}>: {value}</span>
            )}
          </label>
          
          {config.description && (
            <div style={styles.tooltip} title={config.description}>
              <FontAwesomeIcon icon={faInfoCircle} style={styles.tooltipIcon} />
            </div>
          )}
        </div>

        <div style={styles.parameterControl}>
          {config.type === 'checkbox' ? (
            <label style={styles.checkboxContainer}>
              <input
                type="checkbox"
                name={paramKey}
                id={paramKey}
                checked={value}
                onChange={handleOptionChange}
                style={styles.checkbox}
              />
              <span style={styles.checkboxLabel}>
                {value ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </span>
            </label>
          ) : (
            <input
              type="range"
              name={paramKey}
              id={paramKey}
              min={config.min}
              max={config.max}
              step={config.step}
              value={value}
              onChange={handleOptionChange}
              style={styles.slider}
            />
          )}
        </div>

        {config.description && (
          <div style={styles.parameterDescription}>
            {config.description}
          </div>
        )}
      </div>
    );
  };

  const renderGroup = (groupKey, group) => {
    return (
      <div key={groupKey} style={styles.parameterGroup}>
        <div style={styles.groupHeader}>
          <FontAwesomeIcon 
            icon={group.icon} 
            style={{...styles.groupIcon, color: group.color}} 
          />
          <h4 style={styles.groupTitle}>{group.name}</h4>
        </div>
        
        <div style={styles.groupContent}>
          {Object.entries(group.params).map(([paramKey, config]) => 
            renderSlider(groupKey, paramKey, config)
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <FontAwesomeIcon icon={faSliders} style={styles.headerIcon} />
        <h3 style={styles.headerTitle}>การตั้งค่าพารามิเตอร์</h3>
      </div>

      <div style={styles.groupsContainer}>
        {Object.entries(parameterGroups).map(([groupKey, group]) => 
          renderGroup(groupKey, group)
        )}
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    width: '100%'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid #444'
  },
  headerIcon: {
    color: '#888',
    fontSize: '16px'
  },
  headerTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '500',
    color: 'white'
  },
  groupsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  parameterGroup: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '12px'
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    paddingBottom: '6px',
    borderBottom: '1px solid #2a2a2a'
  },
  groupIcon: {
    fontSize: '14px'
  },
  groupTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '500',
    color: 'white'
  },
  groupContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  parameterItem: {
    width: '100%'
  },
  parameterHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '6px'
  },
  parameterLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'white',
    display: 'flex',
    alignItems: 'center'
  },
  parameterValue: {
    color: '#4ade80',
    marginLeft: '4px'
  },
  tooltip: {
    cursor: 'help'
  },
  tooltipIcon: {
    fontSize: '12px',
    color: '#888'
  },
  parameterControl: {
    marginBottom: '4px'
  },
  slider: {
    width: '100%',
    height: '4px',
    borderRadius: '2px',
    background: '#333',
    outline: 'none',
    cursor: 'pointer'
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontSize: '13px',
    color: '#ccc',
    cursor: 'pointer'
  },
  parameterDescription: {
    fontSize: '11px',
    color: '#888',
    fontStyle: 'italic',
    lineHeight: '1.3'
  }
};

export default ParameterControls;