import React, { useState } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useData } from '../context/DataContext';
import { useDataProcessor } from '../hooks/useDataProcessor';
import { generatePDFReport } from '../services/pdfService';
import ChartBuilder from '../components/charts/ChartBuilder';
import { useStatistics } from '../hooks/useStatistics';

const ReportsPage = () => {
  const { currentData, charts, fileName, updateChart } = useData();
  const { rowCount, colCount, numericColumns, missingPercent, stats: processorStats } = useDataProcessor(currentData);
  const { stats: advancedStats } = useStatistics(currentData);
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
    setProgress('Initializing engine...');
    
    try {
      await new Promise(r => setTimeout(r, 500));
      
      const chartImages = [];
      const chartElements = document.querySelectorAll('.hidden-chart-capture .chart-card-pro');
      
      if (chartElements.length > 0) {
        for (let i = 0; i < chartElements.length; i++) {
          setProgress(`Capturing visual ${i + 1} of ${chartElements.length}...`);
          const canvas = await html2canvas(chartElements[i], {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
          });
          chartImages.push(canvas.toDataURL('image/png'));
        }
      }

      setProgress('Finalizing intelligence report...');
      await generatePDFReport(currentData, chartImages, advancedStats);
      
      setProgress('');
    } catch (err) {
      console.error(err);
      alert('PDF Engine Error: ' + err.message);
    } finally {
      setIsGenerating(false);
      setProgress('');
    }
  };

  const statsRows = numericColumns.slice(0, 8).map(col => {
    const s = processorStats[col] || {};
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
        <p className="page-subtitle">Export high-resolution intelligence reports with dynamic visuals</p>
      </div>

      <div className="reports-layout">
        <div className="glass-card report-preview">
          <div className="report-preview-header">
            <div className="report-logo" style={{ background: '#991b1b' }}>IX</div>
            <div>
              <h3>InsightX Intelligence Report</h3>
              <p>Professional Analytics · {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="report-info-grid">
            <div className="report-info-item">
              <span className="ri-label">Source File</span>
              <span className="ri-value">{fileName || 'Active Stream'}</span>
            </div>
            <div className="report-info-item">
              <span className="ri-label">Total Rows</span>
              <span className="ri-value">{rowCount.toLocaleString()}</span>
            </div>
            <div className="report-info-item">
              <span className="ri-label">Dimensions</span>
              <span className="ri-value">{colCount}</span>
            </div>
            <div className="report-info-item">
              <span className="ri-label">Numeric Range</span>
              <span className="ri-value">{numericColumns.length}</span>
            </div>
            <div className="report-info-item">
              <span className="ri-label">Data Integrity</span>
              <span className="ri-value" style={{ color: missingPercent > 10 ? '#991b1b' : '#16a34a' }}>
                {(100 - missingPercent).toFixed(1)}% Clean
              </span>
            </div>
            <div className="report-info-item">
              <span className="ri-label">Visual Assets</span>
              <span className="ri-value">{charts.length}</span>
            </div>
          </div>

          <div className="report-sections-list">
            <h5>📋 Included Intelligence Layers</h5>
            {[
              '✅ Strategic Executive Summary',
              '✅ Data Topology & Dimension Audit',
              '✅ Statistical Distribution Profile',
              '✅ Tone & Style (Skewness/Kurtosis) Analysis',
              '✅ Interactive Visual Intelligence Capture',
              '✅ Granular Data Preview',
            ].map(s => <p key={s} className="report-section-item">{s}</p>)}
          </div>
        </div>

        <div className="report-actions-panel">
          <div className="glass-card action-card" style={{ borderTop: '4px solid #991b1b' }}>
            <h5>🚀 Export Professional PDF</h5>
            <p>Compile all cleaning steps, statistical models, and visual charts into a high-fidelity document.</p>

            <motion.button
              className="btn btn-primary btn-lg generate-btn"
              style={{ background: '#991b1b', border: 'none', boxShadow: '0 4px 15px rgba(153, 27, 27, 0.3)' }}
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              whileHover={{ scale: isGenerating ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isGenerating ? (
                <><span className="spinner" /> {progress}</>
              ) : (
                '📄 Generate Report'
              )}
            </motion.button>

            <p className="action-hint">High-resolution capture may take a few seconds based on chart complexity.</p>
          </div>

          {statsRows.length > 0 && (
            <div className="glass-card stats-preview-card">
              <h5>📊 Key Metric Preview</h5>
              <div className="stats-preview-table-wrap">
                <table className="stats-preview-table">
                  <thead>
                    <tr>
                      <th>Dimension</th>
                      <th>Mean</th>
                      <th>Std Dev</th>
                      <th>Min</th>
                      <th>Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsRows.map(r => (
                      <tr key={r.col}>
                        <td><strong>{r.col}</strong></td>
                        <td>{r.mean}</td>
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

      <div className="hidden-chart-capture" style={{ position: 'fixed', left: '-9999px', top: 0, width: '1200px' }}>
        {charts.map(chart => (
          <div key={chart.id} style={{ width: '800px', height: '400px', marginBottom: '20px' }}>
             <ChartBuilder
                chart={chart}
                data={currentData}
                onUpdate={(u) => updateChart(chart.id, u)}
                readOnly={true}
              />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ReportsPage;
