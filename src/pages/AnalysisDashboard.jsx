import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useStatistics } from '../hooks/useStatistics';
import { useOutliers } from '../hooks/useOutliers';

// Chart components
import CorrelationMatrix from '../components/charts/CorrelationMatrix';
import BoxPlotChart from '../components/charts/BoxPlotChart';
import ScatterTrendlineChart from '../components/charts/ScatterTrendlineChart';
import ForecastChart from '../components/charts/ForecastChart';

// Analysis components
import PivotTable from '../components/analysis/PivotTable';
import FilterBuilder from '../components/analysis/FilterBuilder';
import FormulaFields from '../components/analysis/FormulaFields';

// ─── Stats Detail Table ────────────────────────────────────────────────────────
const StatsDetailTable = ({ stats, numericColumns }) => {
  const [sortCol, setSortCol] = useState('mean');
  const metrics = ['count', 'mean', 'median', 'stdDev', 'variance', 'skewness', 'kurtosis', 'min', 'max', 'outlierCount'];

  return (
    <div className="glass-card stats-full-card">
      <h5 className="section-heading">📊 Full Statistical Summary</h5>
      <div className="stats-full-wrap">
        <table className="stats-full-table">
          <thead>
            <tr>
              <th>Column</th>
              {metrics.map(m => (
                <th key={m} className={sortCol === m ? 'sort-active' : ''} onClick={() => setSortCol(m)} style={{ cursor: 'pointer' }}>
                  {m === 'stdDev' ? 'Std Dev' : m === 'outlierCount' ? 'Outliers' : m.charAt(0).toUpperCase() + m.slice(1)}
                </th>
              ))}
              <th>Distribution</th>
            </tr>
          </thead>
          <tbody>
            {[...numericColumns].sort((a, b) => {
              const va = stats[a]?.[sortCol] ?? 0;
              const vb = stats[b]?.[sortCol] ?? 0;
              return vb - va;
            }).map(col => {
              const s = stats[col];
              if (!s) return null;
              return (
                <tr key={col}>
                  <td><strong>{col}</strong></td>
                  <td>{s.count?.toLocaleString()}</td>
                  <td>{s.mean?.toFixed(3)}</td>
                  <td>{s.median?.toFixed(3)}</td>
                  <td>{s.stdDev?.toFixed(3)}</td>
                  <td>{s.variance?.toFixed(3)}</td>
                  <td>
                    <span className={`skewness-badge ${Math.abs(s.skewness) > 1 ? 'skewed' : 'normal'}`}>
                      {s.skewness?.toFixed(3)}
                    </span>
                  </td>
                  <td>{s.kurtosis?.toFixed(3)}</td>
                  <td>{s.min?.toFixed(2)}</td>
                  <td>{s.max?.toFixed(2)}</td>
                  <td>
                    <span className={`outlier-count-badge ${s.outlierCount > 0 ? 'has-outliers' : ''}`}>
                      {s.outlierCount ?? 0}
                    </span>
                  </td>
                  <td>
                    <div className="dist-badge">
                      <span className="dist-label">{s.skewnessLabel}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main Analysis Dashboard ───────────────────────────────────────────────────
const TABS = [
  { id: 'statistics', label: '📊 Statistics' },
  { id: 'correlation', label: '🔗 Correlation' },
  { id: 'distributions', label: '📦 Distributions' },
  { id: 'regression', label: '📈 Regression' },
  { id: 'forecast', label: '🔮 Forecast' },
  { id: 'pivot', label: '🗂️ Pivot' },
  { id: 'filter', label: '🔍 Filter' },
  { id: 'formula', label: '🧮 Formula' },
];

const AnalysisDashboard = () => {
  const { currentData } = useData();
  const { stats, numericColumns } = useStatistics(currentData);
  const { totalOutliers } = useOutliers(currentData);
  const [activeTab, setActiveTab] = useState('statistics');

  if (!currentData) {
    return (
      <div className="empty-page glass-card">
        <span style={{ fontSize: '3rem' }}>🔬</span>
        <h3>No Data Loaded</h3>
        <p>Upload a CSV or Excel file to run advanced analytics.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="analysis-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h2 className="page-title">🔬 Advanced Analysis Engine</h2>
        <div className="analysis-quick-stats">
          <span className="aq-stat">{currentData.length.toLocaleString()} rows</span>
          <span className="aq-stat">{numericColumns.length} numeric cols</span>
          {totalOutliers > 0 && (
            <span className="aq-stat aq-warn">⚠️ {totalOutliers} outliers detected</span>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="analysis-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`analysis-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'statistics' && (
          <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <StatsDetailTable stats={stats} numericColumns={numericColumns} />
          </motion.div>
        )}

        {activeTab === 'correlation' && (
          <motion.div key="corr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <CorrelationMatrix data={currentData} />
          </motion.div>
        )}

        {activeTab === 'distributions' && (
          <motion.div key="dist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <BoxPlotChart data={currentData} />
          </motion.div>
        )}

        {activeTab === 'regression' && (
          <motion.div key="reg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ScatterTrendlineChart data={currentData} />
          </motion.div>
        )}

        {activeTab === 'forecast' && (
          <motion.div key="fc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ForecastChart data={currentData} />
          </motion.div>
        )}

        {activeTab === 'pivot' && (
          <motion.div key="pivot" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <PivotTable data={currentData} />
          </motion.div>
        )}

        {activeTab === 'filter' && (
          <motion.div key="filter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <FilterBuilder data={currentData} />
          </motion.div>
        )}

        {activeTab === 'formula' && (
          <motion.div key="formula" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <FormulaFields data={currentData} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnalysisDashboard;
