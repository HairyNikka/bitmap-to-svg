import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown,
  faWandSparkles,
  faTags,
  faCamera,
  faPaintBrush,
  faRocket,
  faBalanceScale,
  faFeatherAlt
} from '@fortawesome/free-solid-svg-icons';

const PresetButtons = ({ setOptions, onPresetChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('ปานกลาง');

  // Preset configurations
  const presets = {
    // Quality Presets (Original)
    'ต่ำ': {
      name: 'ต่ำ',
      description: 'ไฟล์เล็ก ประมวลผลเร็ว',
      icon: faFeatherAlt,
      color: '#10b981',
      settings: {
        pathomit: 8,
        numberofcolors: 4,
        strokewidth: 1,
        blur: 0,
        ltres: 2,
        qtres: 2,
        mincolorratio: 0.05,
        linefilter: true,
        rightangle: false
      }
    },
    'ปานกลาง': {
      name: 'ปานกลาง',
      description: 'สมดุลระหว่างคุณภาพและขนาด',
      icon: faBalanceScale,
      color: '#f59e0b',
      settings: {
        pathomit: 4,
        numberofcolors: 8,
        strokewidth: 1,
        blur: 0,
        ltres: 1,
        qtres: 1,
        mincolorratio: 0.02,
        linefilter: false,
        rightangle: false
      }
    },
    'สูง': {
      name: 'สูง',
      description: 'คุณภาพสูง รายละเอียดมาก',
      icon: faRocket,
      color: '#ef4444',
      settings: {
        pathomit: 1,
        numberofcolors: 16,
        strokewidth: 1,
        blur: 0,
        ltres: 0.5,
        qtres: 0.5,
        mincolorratio: 0.01,
        linefilter: false,
        rightangle: false
      }
    },
    
    // Type-specific Presets (New)
    'โลโก้': {
      name: 'โลโก้/ไอคอน',
      description: 'เส้นคมชัด สีน้อย เหมาะสำหรับโลโก้',
      icon: faTags,
      color: '#8b5cf6',
      settings: {
        pathomit: 0.5,
        numberofcolors: 6,
        strokewidth: 0.5,
        blur: 0,
        ltres: 0.3,
        qtres: 0.3,
        mincolorratio: 0.03,
        linefilter: true,
        rightangle: true
      }
    },
    'ภาพถ่าย': {
      name: 'ภาพถ่าย',
      description: 'รายละเอียดสูง สีเยอะ เหมาะสำหรับภาพถ่าย',
      icon: faCamera,
      color: '#06b6d4',
      settings: {
        pathomit: 0.1,
        numberofcolors: 24,
        strokewidth: 0,
        blur: 0.2,
        ltres: 0.8,
        qtres: 0.8,
        mincolorratio: 0.005,
        linefilter: false,
        rightangle: false
      }
    },
    'ภาพวาด': {
      name: 'ภาพวาด/อาร์ต',
      description: 'เส้นนุ่มนวล เหมาะสำหรับงานศิลปะ',
      icon: faPaintBrush,
      color: '#f97316',
      settings: {
        pathomit: 2,
        numberofcolors: 12,
        strokewidth: 1.5,
        blur: 0.1,
        ltres: 1.2,
        qtres: 0.7,
        mincolorratio: 0.015,
        linefilter: false,
        rightangle: false
      }
    }
  };

  const handlePresetSelect = (presetKey) => {
    const preset = presets[presetKey];
    if (preset) {
      setOptions(preset.settings);
      setSelectedPreset(presetKey);
      setIsDropdownOpen(false);
        if (onPresetChange) {
        onPresetChange(preset.settings);
        }
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectedPresetData = presets[selectedPreset];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <FontAwesomeIcon icon={faWandSparkles} style={styles.headerIcon} />
        <h3 style={styles.headerTitle}>พรีเซ็ตความละเอียด</h3>
      </div>

      <div style={styles.dropdownContainer}>
        <button 
          onClick={toggleDropdown}
          style={styles.dropdownButton}
        >
          <div style={styles.selectedPreset}>
            <FontAwesomeIcon 
              icon={selectedPresetData.icon} 
              style={{...styles.presetIcon, color: selectedPresetData.color}} 
            />
            <div style={styles.selectedPresetText}>
              <span style={styles.selectedPresetName}>
                {selectedPresetData.name}
              </span>
              <span style={styles.selectedPresetDesc}>
                {selectedPresetData.description}
              </span>
            </div>
          </div>
          <FontAwesomeIcon 
            icon={faChevronDown} 
            style={{
              ...styles.chevronIcon,
              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }} 
          />
        </button>

        {isDropdownOpen && (
          <div style={styles.dropdownMenu}>
            <div style={styles.menuSection}>
              <div style={styles.sectionTitle}>คุณภาพทั่วไป</div>
              {['ต่ำ', 'ปานกลาง', 'สูง'].map((presetKey) => {
                const preset = presets[presetKey];
                return (
                  <button
                    key={presetKey}
                    onClick={() => handlePresetSelect(presetKey)}
                    style={{
                      ...styles.menuItem,
                      backgroundColor: selectedPreset === presetKey ? '#2a2a2a' : 'transparent'
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={preset.icon} 
                      style={{...styles.menuItemIcon, color: preset.color}} 
                    />
                    <div style={styles.menuItemText}>
                      <span style={styles.menuItemName}>{preset.name}</span>
                      <span style={styles.menuItemDesc}>{preset.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={styles.menuDivider} />

            <div style={styles.menuSection}>
              <div style={styles.sectionTitle}>ประเภทภาพ</div>
              {['โลโก้', 'ภาพถ่าย', 'ภาพวาด'].map((presetKey) => {
                const preset = presets[presetKey];
                return (
                  <button
                    key={presetKey}
                    onClick={() => handlePresetSelect(presetKey)}
                    style={{
                      ...styles.menuItem,
                      backgroundColor: selectedPreset === presetKey ? '#2a2a2a' : 'transparent'
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={preset.icon} 
                      style={{...styles.menuItemIcon, color: preset.color}} 
                    />
                    <div style={styles.menuItemText}>
                      <span style={styles.menuItemName}>{preset.name}</span>
                      <span style={styles.menuItemDesc}>{preset.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Overlay to close dropdown */}
      {isDropdownOpen && (
        <div 
          style={styles.overlay}
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    marginBottom: '16px',
    position: 'relative',
    width: '100%'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
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
  dropdownContainer: {
    position: 'relative',
    width: '100%'
  },
  dropdownButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    transition: 'all 0.2s ease'
  },
  selectedPreset: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1
  },
  presetIcon: {
    fontSize: '16px'
  },
  selectedPresetText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left'
  },
  selectedPresetName: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'white'
  },
  selectedPresetDesc: {
    fontSize: '11px',
    color: '#888',
    lineHeight: '1.2'
  },
  chevronIcon: {
    fontSize: '12px',
    color: '#888',
    transition: 'transform 0.2s ease'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    border: '1px solid #444',
    borderRadius: '8px',
    marginTop: '4px',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  menuSection: {
    padding: '8px'
  },
  sectionTitle: {
    fontSize: '12px',
    color: '#888',
    fontWeight: '500',
    padding: '4px 8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  menuItem: {
    width: '100%',
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'left',
    transition: 'background-color 0.2s ease'
  },
  menuItemIcon: {
    fontSize: '14px',
    width: '16px'
  },
  menuItemText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  menuItemName: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'white'
  },
  menuItemDesc: {
    fontSize: '11px',
    color: '#888',
    lineHeight: '1.2'
  },
  menuDivider: {
    height: '1px',
    backgroundColor: '#333',
    margin: '4px 8px'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999
  }
};

export default PresetButtons;