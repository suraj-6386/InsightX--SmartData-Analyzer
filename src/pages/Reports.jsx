import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useData } from '../context/DataContext';
import { useDataProcessor } from '../hooks/useDataProcessor';
import { generatePDFReport } from '../services/pdfService';

const ReportsPage = () => {
  const { currentData, charts, fileName } = useData();
  const { rowCount, colCount, numericColumns, missingPercent, stats } = useDataProcessor(currentData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');

  if (!currentData) {
    return (
      <div className="empty-page glass-card">
        <span style={{ fontSize: '3rem' }}>📄</span>
        <h3>No Data Available</h3>
        <p>Upload a dataset first to generate a report.</p>
      </div>
    );
  }

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setProgress('Preparing report...');
    try {
      await new Promise(r => setTimeout(r, 200));
      setProgress('Generating PDF...');
      await generatePDFReport(currentData, charts);
      setProgress('');
    } catch (err) {
      console.error(err);
      alert('Error generating PDF: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Summary table for display
  const statsRows = numericColumns.slice(0, 8).map(col => {
    const s = stats[col] || {};
    return {
      col,
      mean: s.mean?.toFixed(2) ?? '-',
      median: s.median?.toFixed(2) ?? '-',
      std: s.stdDev?.toFixed(2) ?? '-',
      min: s.min?.toFixed(2) ?? '-',
      max: s.max?.toFixed(2) ?? '-',
    };
  });

  return (
    <motion.div
      className="reports-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h2 className="page-title">📄 Report Generation</h2>
        <p className="page-subtitle">Export a professional PDF analytics report for your dataset</p>
      </div>

      {/* Report Info Card */}
      <div className="reports-layout">
        {/* Preview Panel */}
        <div className="glass-card report-preview">
          <div className="report-preview-header">
            <div className="report-logo">IX</div>
            <div>
              <h3>InsightX Analytics Report</h3>
              <p>Professional Data Report · {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="report-info-grid">
            <div className="report-info-item">
              <span className="ri-label">Dataset</span>
              <span className="ri-value">{fileName || 'Uploaded data'}</span>
            </div>
            <div className="report-info-item">
              <span className="ri-label">Total Rows</span>
              <span className="ri-value">{rowCount.toLocaleString()}</span>
            </div>
            <div className="report-info-item">
              <span className="ri-label">Total Columns</span>
              <span className="ri-value">{colCount}</span>
            </div>
            <div className="report-info-item">
              <span className="ri-label">Numeric Columns</span>
              <span className="ri-value">{numericColumns.length}</span>
            </div>
            <div className="report-info-item">
              <span className="ri-label">Missing Values</span>
              <span className="ri-value" style={{ color: missingPercent > 10 ? '#e11d48' : 'var(--text-primary)' }}>
                {missingPercent}%
              </span>
            </div>
            <div className="report-info-item">
              <span className="ri-label">Custom Charts</span>
              <span className="ri-value">{charts.length}</span>
            </div>
          </div>

          <div className="report-sections-list">
            <h5>📋 Report Sections</h5>
            {[
              '✅ Title Page',
              '✅ Dataset Overview (rows, columns, types)',
              '✅ Column-level Statistics (mean, median, std, min, max)',
              '✅ Data Preview (first 20 rows)',
              charts.length > 0 ? `✅ Chart Summary (${charts.length} charts)` : '⬜ Chart Summary (no charts added)',
            ].map(s => <p key={s} className="report-section-item">{s}</p>)}
          </div>
        </div>

        {/* Action Panel */}
        <div className="report-actions-panel">
          <div className="glass-card action-card">
            <h5>🚀 Generate Report</h5>
            <p>Download a complete PDF with dataset overview, statistics, and chart summaries.</p>

            <motion.button
              className="btn btn-primary btn-lg generate-btn"
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              whileHover={{ scale: isGenerating ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isGenerating ? (
                <><span className="spinner" /> {progress}</>
              ) : (
                '📄 Download PDF Report'
              )}
            </motion.button>

            <p className="action-hint">Report generated entirely in-browser. No data leaves your device.</p>
          </div>

          {/* Stats Summary Table */}
          {statsRows.length > 0 && (
            <div className="glass-card stats-preview-card">
              <h5>📊 Statistics Preview</h5>
              <div className="stats-preview-table-wrap">
                <table className="stats-preview-table">
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Mean</th>
                      <th>Median</th>
                      <th>Std</th>
                      <th>Min</th>
                      <th>Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsRows.map(r => (
                      <tr key={r.col}>
                        <td><strong>{r.col}</strong></td>
                        <td>{r.mean}</td>
                        <td>{r.median}</td>
                        <td>{r.std}</td>
                        <td>{r.min}</td>
                        <td>{r.max}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ReportsPage;
