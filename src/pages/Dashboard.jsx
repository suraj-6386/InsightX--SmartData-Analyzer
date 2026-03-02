import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { parseFile } from '../services/parserService';
import AutoChartGrid from '../components/charts/AutoChartGrid';
import ChartBuilder from '../components/charts/ChartBuilder';
import SidebarControls from '../components/SidebarControls';
import DataCleaningPanel from '../components/DataCleaningPanel';
import DataTable from '../components/DataTable';
import DatasetInfo from '../components/DatasetInfo';
import DatasetDescribe from '../components/DatasetDescribe';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

// ─── Upload screen shown when no data ────────────────────────────────────────
const UploadScreen = () => {
  const { loadData } = useData();

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    try {
      const parsed = await parseFile(file);
      loadData(parsed, file.name);
    } catch (err) {
      alert('Error parsing file: ' + err.message);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    multiple: false,
  });

  return (
    <motion.div
      className="upload-screen"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="upload-hero glass-card" {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="upload-icon-wrap">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
        </div>
        <h2 className="upload-title">
          {isDragActive ? '📥 Drop to Upload!' : 'Drag & Drop Your Dataset'}
        </h2>
        <p className="upload-subtitle">
          Supports <strong>.CSV</strong> and <strong>.XLSX</strong> files
        </p>
        <button className="upload-cta-btn">Browse Files</button>
        <p className="upload-hint">Or use the Upload button in the top bar</p>
      </div>

      <div className="upload-features">
        {[
          { icon: '⚡', title: 'Instant Analysis', desc: 'KPI cards and charts appear automatically' },
          { icon: '🧹', title: 'Data Cleaning', desc: 'Drop columns, handle missing values' },
          { icon: '📄', title: 'PDF Reports', desc: 'Export professional reports with one click' },
        ].map(f => (
          <div key={f.title} className="feature-pill glass-card">
            <span className="feature-pill-icon">{f.icon}</span>
            <div>
              <strong>{f.title}</strong>
              <p>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const { currentData, cleanedData, setCleanedData, charts, addChart, updateChart, deleteChart } = useData();
  const [selectedChart, setSelectedChart] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'builder' | 'table'

  const handleDataClean = (newData, cleaningResults, actionType) => {
    setCleanedData(newData);
    const msgs = {
      removeNulls: `${cleaningResults.nullsRemoved} null rows removed`,
      removeDuplicates: `${cleaningResults.duplicatesRemoved} duplicate rows removed`,
      convertDataType: `Column "${cleaningResults.column}" converted to ${cleaningResults.targetType}`,
      treatNulls: `${cleaningResults.rowsAffected} rows treated with ${cleaningResults.treatment}`,
    };
    if (msgs[actionType]) alert(msgs[actionType]);
  };

  const downloadCleanData = (format) => {
    if (!currentData || currentData.length === 0) { alert('No data available'); return; }
    if (format === 'csv') {
      const headers = Object.keys(currentData[0]);
      const csv = [headers.join(','), ...currentData.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'cleaned_data.csv';
      a.click();
    } else {
      const ws = XLSX.utils.json_to_sheet(currentData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cleaned Data');
      XLSX.writeFile(wb, 'cleaned_data.xlsx');
    }
  };

  if (!currentData) return <UploadScreen />;

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'builder', label: '🎨 Chart Builder' },
    { id: 'table', label: '📋 Data Table' },
  ];

  return (
    <motion.div
      className="dashboard-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Tab Navigation */}
      <div className="page-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`page-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <AutoChartGrid />
          </motion.div>
        )}

        {activeTab === 'builder' && (
          <motion.div key="builder" className="builder-layout" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <div className="builder-sidebar">
              <SidebarControls
                data={currentData}
                onAddChart={addChart}
                selectedChart={selectedChart}
                onUpdateChart={updateChart}
              />
            </div>
            <div className="builder-main">
              <div className="builder-toolbar">
                <h5 className="section-title">Interactive Charts ({charts.length})</h5>
                <div className="d-flex gap-2">
                  <div className="dropdown">
                    <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" disabled={!currentData}>
                      📥 Download Data
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><button className="dropdown-item" onClick={() => downloadCleanData('csv')}>📄 CSV</button></li>
                      <li><button className="dropdown-item" onClick={() => downloadCleanData('excel')}>📊 Excel</button></li>
                    </ul>
                  </div>
                </div>
              </div>
              {charts.length === 0 ? (
                <div className="no-charts-placeholder glass-card">
                  <span style={{ fontSize: '3rem' }}>📈</span>
                  <p>Configure a chart in the panel and click <strong>Add Chart</strong></p>
                </div>
              ) : (
                <div className="charts-grid">
                  {charts.map(chart => (
                    <ChartBuilder
                      key={chart.id}
                      chart={chart}
                      data={currentData}
                      onUpdate={(u) => updateChart(chart.id, u)}
                      onDelete={() => { deleteChart(chart.id); if (selectedChart?.id === chart.id) setSelectedChart(null); }}
                      onSelect={() => setSelectedChart(chart)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'table' && (
          <motion.div key="table" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <div className="row mb-4">
              <div className="col-md-6"><DatasetInfo data={currentData} /></div>
              <div className="col-md-6"><DatasetDescribe data={currentData} /></div>
            </div>
            <DataCleaningPanel data={currentData} onDataClean={handleDataClean} />
            <DataTable data={currentData} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;