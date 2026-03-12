import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { parseFile } from '../../services/parserService';

const COLOR_PRESETS = [
  { label: 'Dark Red', value: '#8B0000' },
  { label: 'Violet', value: '#7c3aed' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Rose', value: '#e11d48' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Cyan', value: '#0891b2' },
];

const Topbar = ({ activePage, setActivePage }) => {
  const { theme, setTheme, primaryColor, setPrimaryColor, loadData, fileName } = useData();
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const parsed = await parseFile(file);
      loadData(parsed, file.name);
      setActivePage('dashboard');
    } catch (err) {
      alert('Error parsing file: ' + err.message);
    }
    e.target.value = '';
  };

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="brand-icon">
  <img src="/icon.png" alt="InsightX Logo" />
</div>
        <span className="brand-name">InsightX <span className="brand-pro">Pro</span></span>
      </div>

      {fileName && (
        <motion.div
          className="file-chip"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="file-chip-icon">📄</span>
          <span className="file-chip-name">{fileName}</span>
        </motion.div>
      )}

      <div className="topbar-actions">
        <motion.button
          className="topbar-btn upload-btn"
          onClick={() => fileInputRef.current?.click()}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
          Upload Data
        </motion.button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <div className="color-picker">
          {COLOR_PRESETS.map(c => (
            <button
              key={c.value}
              className={`color-swatch ${primaryColor === c.value ? 'active' : ''}`}
              style={{ background: c.value }}
              onClick={() => setPrimaryColor(c.value)}
              title={c.label}
            />
          ))}
        </div>

        <motion.button
          className="theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          title="Toggle dark/light mode"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </motion.button>
      </div>
    </header>
  );
};

export default Topbar;

