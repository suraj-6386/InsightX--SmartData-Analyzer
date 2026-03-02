import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [rawData, setRawData] = useState(null);
  const [cleanedData, setCleanedData] = useState(null);
  const [charts, setCharts] = useState([]);
  const [fileName, setFileName] = useState('');

  // Theme engine — persisted to localStorage
  const [theme, setThemeState] = useState(() => localStorage.getItem('ix_theme') || 'dark');
  const [primaryColor, setPrimaryColorState] = useState(() => localStorage.getItem('ix_primary') || '#7c3aed');

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ix_theme', theme);
  }, [theme]);

  // Apply primary color CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    // Compute a lighter version for hover states
    document.documentElement.style.setProperty('--primary-color-alpha', primaryColor + '33');
    localStorage.setItem('ix_primary', primaryColor);
  }, [primaryColor]);

  const setTheme = (t) => setThemeState(t);
  const setPrimaryColor = (c) => setPrimaryColorState(c);

  // Upload a file's parsed data into global state
  const loadData = (parsed, name = '') => {
    setRawData(parsed);
    setCleanedData(parsed);
    setFileName(name);
    setCharts([]);
  };

  // Charts management
  const addChart = (chartConfig) => {
    setCharts(prev => [...prev, { id: Date.now(), ...chartConfig }]);
  };

  const updateChart = (chartId, updates) => {
    setCharts(prev => prev.map(c => c.id === chartId ? { ...c, ...updates } : c));
  };

  const deleteChart = (chartId) => {
    setCharts(prev => prev.filter(c => c.id !== chartId));
  };

  const currentData = cleanedData || rawData;

  return (
    <DataContext.Provider value={{
      rawData, cleanedData, currentData, setCleanedData, loadData,
      charts, addChart, updateChart, deleteChart,
      theme, setTheme, primaryColor, setPrimaryColor,
      fileName,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
