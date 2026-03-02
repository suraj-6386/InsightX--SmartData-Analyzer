import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import useDataCleaning from '../hooks/useDataCleaning';
import { getNumericColumns } from '../utils/statisticsUtils';

// ─── Outlier Method Descriptions ──────────────────────────────────────────────
const OUTLIER_METHODS = [
  {
    id: 'remove',
    icon: '🗑️',
    label: 'Remove Outlier Rows',
    desc: 'Delete entire rows where any numeric column has a value outside Q1 − 1.5×IQR or Q3 + 1.5×IQR. Row count will decrease.',
    danger: true,
  },
  {
    id: 'cap',
    icon: '📌',
    label: 'Cap at IQR Fence (Winsorize)',
    desc: 'Replace outlier values with the nearest fence value (Q1−1.5×IQR or Q3+1.5×IQR). Row count stays the same.',
    danger: false,
  },
  {
    id: 'p5p95',
    icon: '📐',
    label: 'Replace with P5 / P95 Percentile',
    desc: 'Replace low outliers with the 5th percentile and high outliers with the 95th percentile. Smoothest distribution.',
    danger: false,
  },
];

// ─── Null Treatment Methods ───────────────────────────────────────────────────
const NULL_METHODS = [
  { id: 'mean',   label: 'Fill with Mean',   desc: 'Replace missing values with the column average (numeric cols only)' },
  { id: 'median', label: 'Fill with Median', desc: 'Replace with the middle value of the column' },
  { id: 'mode',   label: 'Fill with Mode',   desc: 'Replace with the most frequent value' },
  { id: 'zero',   label: 'Fill with Zero',   desc: 'Replace missing numeric cells with 0' },
  { id: 'blank',  label: 'Fill with Blank',  desc: 'Replace with empty string ""' },
  { id: 'remove', label: 'Remove Rows',       desc: 'Delete rows containing any null value', danger: true },
];

// ─── Action Card ──────────────────────────────────────────────────────────────
const ActionCard = ({ icon, label, desc, onClick, color = 'primary', done = false, badge = null }) => (
  <motion.button
    className={`clean-action-card clean-action-${color} ${done ? 'done' : ''}`}
    onClick={onClick}
    whileHover={{ y: -2, scale: 1.01 }}
    whileTap={{ scale: 0.97 }}
    transition={{ duration: 0.15 }}
  >
    <div className="cac-top">
      <span className="cac-icon">{done ? '✅' : icon}</span>
      {badge !== null && (
        <span className={`cac-badge ${badge > 0 ? 'warn' : 'ok'}`}>
          {badge > 0 ? `${badge} detected` : '0 detected'}
        </span>
      )}
    </div>
    <div className="cac-label">{label}</div>
    <div className="cac-desc">{desc}</div>
  </motion.button>
);

// ─── Inline Modal ─────────────────────────────────────────────────────────────
const Modal = ({ title, children, onClose }) => (
  <div className="ix-modal-overlay" onClick={onClose}>
    <motion.div
      className="ix-modal glass-card"
      initial={{ opacity: 0, scale: 0.93, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93, y: 20 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="ix-modal-header">
        <h5>{title}</h5>
        <button className="ix-modal-close" onClick={onClose}>✕</button>
      </div>
      {children}
    </motion.div>
  </div>
);

// ─── Main DataCleaning Page ───────────────────────────────────────────────────
const DataCleaningPage = () => {
  const { currentData, rawData, setCleanedData } = useData();

  const [notification, setNotification] = useState(null);
  const [doneCards, setDoneCards] = useState({});
  const [droppedCols, setDroppedCols] = useState([]);
  const [showMissing, setShowMissing] = useState(false);
  const [showOutlierModal, setShowOutlierModal] = useState(false);
  const [showNullModal, setShowNullModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertConfig, setConvertConfig] = useState({ column: '', targetType: '' });
  const [selectedOutlierCol, setSelectedOutlierCol] = useState('all');

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const markDone = (key) => {
    setDoneCards(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setDoneCards(prev => { const n = { ...prev }; delete n[key]; return n; }), 2500);
  };

  const handleDataClean = useCallback((newData, results, actionType) => {
    setCleanedData(newData);
    const msgs = {
      removeNulls:     `✅ ${results.nullsRemoved} null row${results.nullsRemoved !== 1 ? 's' : ''} removed`,
      removeDuplicates:`✅ ${results.duplicatesRemoved} duplicate${results.duplicatesRemoved !== 1 ? 's' : ''} removed`,
      convertDataType: `✅ Column "${results.column}" → ${results.targetType}`,
      treatNulls:      `✅ ${results.rowsAffected} cells treated (${results.treatment})`,
      treatOutliers:   `✅ ${results.outliersHandled} outlier${results.outliersHandled !== 1 ? 's' : ''} handled via ${results.method}`,
    };
    showNotif(msgs[actionType] || '✅ Data updated');
    markDone(actionType);
  }, [setCleanedData]);

  const {
    outlierInfo,
    handleRemoveNulls,
    handleRemoveDuplicates,
    handleTreatNulls,
    handleConvertDataType,
    handleTreatOutliers,
  } = useDataCleaning(currentData, handleDataClean);

  if (!currentData) {
    return (
      <div className="empty-page glass-card">
        <span style={{ fontSize: '3rem' }}>🧹</span>
        <h3>No Data Loaded</h3>
        <p>Upload a CSV or Excel file to start cleaning.</p>
      </div>
    );
  }

  const columns = Object.keys(currentData[0] || {});
  const numericColumns = getNumericColumns(currentData);
  const nullCount = currentData.filter(row =>
    Object.values(row).some(v => v === null || v === undefined || v === '' || v === 'null' || v === 'NULL')
  ).length;
  const dupCount = (() => {
    const seen = new Set();
    return currentData.filter(row => {
      const k = JSON.stringify(row);
      return seen.has(k) ? true : (seen.add(k), false);
    }).length;
  })();
  const sampleRows = currentData.slice(0, 12);

  const applyColumnDrop = () => {
    if (!droppedCols.length) { showNotif('⚠️ No columns selected', 'warning'); return; }
    const newData = currentData.map(row => {
      const obj = { ...row };
      droppedCols.forEach(c => delete obj[c]);
      return obj;
    });
    setCleanedData(newData);
    showNotif(`✅ Dropped ${droppedCols.length} column(s): ${droppedCols.join(', ')}`);
    markDone('dropCols');
    setDroppedCols([]);
  };

  return (
    <motion.div className="cleaning-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Toast notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`notif-toast ${notification.type}`}
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
          >
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page header */}
      <div className="page-header">
        <h2 className="page-title">🧹 Data Cleaning Studio</h2>
        <div className="cleaning-meta-row">
          <span className="clean-meta-pill">{currentData.length.toLocaleString()} rows</span>
          <span className="clean-meta-pill">{columns.length} columns</span>
          {nullCount > 0 && <span className="clean-meta-pill warn">⚠️ {nullCount} rows with nulls</span>}
          {dupCount > 0 && <span className="clean-meta-pill warn">⚠️ {dupCount} duplicates</span>}
          {outlierInfo.total > 0 && <span className="clean-meta-pill danger">🔴 {outlierInfo.total} outliers</span>}
          {outlierInfo.total === 0 && currentData.length > 0 && <span className="clean-meta-pill ok">✅ 0 outliers</span>}
        </div>
      </div>

      {/* ── Cleaning Actions Grid ── */}
      <div className="glass-card cleaning-section">
        <div className="cleaning-section-header">
          <h5 className="section-heading">⚙️ Cleaning Operations</h5>
          <span className="section-hint">Click any card to apply the operation instantly</span>
        </div>
        <div className="clean-actions-grid">
          <ActionCard
            icon="🗑️" label="Remove Null Rows" color="danger"
            desc={`Delete rows containing any missing value  •  ${nullCount} rows affected`}
            done={doneCards['removeNulls']}
            badge={nullCount}
            onClick={handleRemoveNulls}
          />
          <ActionCard
            icon="🔄" label="Remove Duplicates" color="warning"
            desc={`Delete exact duplicate rows from dataset  •  ${dupCount} duplicates found`}
            done={doneCards['removeDuplicates']}
            badge={dupCount}
            onClick={handleRemoveDuplicates}
          />
          <ActionCard
            icon="🧩" label="Treat Null Values" color="success"
            desc="Fill missing cells with Mean, Median, Mode, Zero, or remove rows"
            done={doneCards['treatNulls']}
            onClick={() => setShowNullModal(true)}
          />
          <ActionCard
            icon="🔁" label="Convert Data Type" color="primary"
            desc="Cast a column's values to Number, String, Date, or Boolean"
            done={doneCards['convertDataType']}
            onClick={() => setShowConvertModal(true)}
          />
          <ActionCard
            icon="📊" label="Treat Outliers" color="purple"
            desc="IQR-based outlier detection with removal or capping (Winsorization)"
            done={doneCards['treatOutliers']}
            badge={outlierInfo.total}
            onClick={() => setShowOutlierModal(true)}
          />
          <ActionCard
            icon="↩️" label="Reset to Original" color="muted"
            desc="Restore the dataset to the original uploaded file"
            done={false}
            onClick={() => { setCleanedData(rawData); showNotif('↩️ Dataset reset to original'); }}
          />
        </div>
      </div>

      {/* ── Drop Columns ── */}
      <div className="glass-card cleaning-section">
        <h5 className="section-heading">🗂️ Drop Columns</h5>
        <p className="section-desc">Select columns to permanently remove from the dataset.</p>
        <div className="column-chips">
          {columns.map(col => (
            <button
              key={col}
              className={`col-chip ${droppedCols.includes(col) ? 'selected' : ''}`}
              onClick={() => setDroppedCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
            >
              {droppedCols.includes(col) ? '✓ ' : ''}{col}
            </button>
          ))}
        </div>
        {droppedCols.length > 0 && (
          <div className="drop-actions">
            <p className="drop-preview">Will drop: <strong>{droppedCols.join(', ')}</strong></p>
            <button className="btn btn-danger" onClick={applyColumnDrop}>
              🗑️ Drop {droppedCols.length} Column{droppedCols.length > 1 ? 's' : ''}
            </button>
            <button className="btn btn-outline-secondary ms-2" onClick={() => setDroppedCols([])}>Cancel</button>
          </div>
        )}
      </div>

      {/* ── Missing Heatmap ── */}
      <div className="glass-card cleaning-section">
        <div className="section-heading-row">
          <h5 className="section-heading">🔍 Missing Value Heatmap</h5>
          <button className="chart-mini-btn" onClick={() => setShowMissing(!showMissing)}>
            {showMissing ? 'Hide' : 'Show'} Heatmap
          </button>
        </div>
        <AnimatePresence>
          {showMissing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="missing-heatmap-wrap">
                <table className="missing-heatmap">
                  <thead>
                    <tr>
                      <th>#</th>
                      {columns.map(col => <th key={col} title={col}>{col.substring(0, 10)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {sampleRows.map((row, ri) => (
                      <tr key={ri}>
                        <td className="row-num">{ri + 1}</td>
                        {columns.map(col => {
                          const v = row[col];
                          const empty = v === null || v === undefined || v === '' || v === 'null' || v === 'NaN';
                          return <td key={col} className={`heat-cell ${empty ? 'missing' : 'present'}`} title={empty ? 'Missing' : String(v)}>{empty ? '∅' : ''}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="heatmap-legend">
                  <span className="legend-dot present" /> Present &nbsp;
                  <span className="legend-dot missing" /> Missing (∅) &nbsp;&nbsp; Showing first {sampleRows.length} rows
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Outlier Per-Column Summary ── */}
      {outlierInfo.total > 0 && (
        <div className="glass-card cleaning-section">
          <h5 className="section-heading">📊 Outlier Summary by Column</h5>
          <div className="outlier-col-grid">
            {Object.entries(outlierInfo.byColumn).filter(([, c]) => c > 0).map(([col, count]) => (
              <div key={col} className="outlier-col-card">
                <span className="outlier-col-name">{col}</span>
                <span className="outlier-col-count">{count} outlier{count !== 1 ? 's' : ''}</span>
                <div className="outlier-col-bar" style={{ width: `${Math.min(100, count / currentData.length * 100 * 5)}%` }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ OUTLIER MODAL ══ */}
      <AnimatePresence>
        {showOutlierModal && (
          <Modal title="📊 Treat Outliers — IQR Method" onClose={() => setShowOutlierModal(false)}>
            <div className="ix-modal-body">
              <div className="modal-info-box">
                <strong>IQR Algorithm:</strong>
                <span> Lower&nbsp;=&nbsp;Q1&nbsp;−&nbsp;1.5×IQR &nbsp;|&nbsp; Upper&nbsp;=&nbsp;Q3&nbsp;+&nbsp;1.5×IQR</span>
              </div>
              <div className="modal-info-box info">
                <span>🔴 <strong>{outlierInfo.total}</strong> total outliers detected across {Object.keys(outlierInfo.byColumn).filter(k => outlierInfo.byColumn[k] > 0).length} column(s)</span>
              </div>

              <label className="modal-label">Apply to column:</label>
              <select className="ix-modal-select" value={selectedOutlierCol} onChange={e => setSelectedOutlierCol(e.target.value)}>
                <option value="all">— All Numeric Columns —</option>
                {numericColumns.map(c => (
                  <option key={c} value={c}>{c} ({outlierInfo.byColumn[c] ?? 0} outliers)</option>
                ))}
              </select>

              <label className="modal-label" style={{ marginTop: 16 }}>Choose treatment method:</label>
              <div className="outlier-method-cards">
                {OUTLIER_METHODS.map(m => (
                  <button
                    key={m.id}
                    className={`outlier-method-card ${m.danger ? 'danger' : ''}`}
                    onClick={() => {
                      handleTreatOutliers(m.id, selectedOutlierCol === 'all' ? null : selectedOutlierCol);
                      setShowOutlierModal(false);
                    }}
                  >
                    <span className="omc-icon">{m.icon}</span>
                    <div>
                      <strong className="omc-label">{m.label}</strong>
                      <p className="omc-desc">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="ix-modal-footer">
              <button className="chart-mini-btn" onClick={() => setShowOutlierModal(false)}>Cancel</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ══ TREAT NULLS MODAL ══ */}
      <AnimatePresence>
        {showNullModal && (
          <Modal title="🧩 Treat Null Values" onClose={() => setShowNullModal(false)}>
            <div className="ix-modal-body">
              <div className="modal-info-box">
                <span>⚠️ <strong>{nullCount}</strong> rows contain at least one null / empty cell</span>
              </div>
              <label className="modal-label">Choose treatment method:</label>
              <div className="null-method-list">
                {NULL_METHODS.map(m => (
                  <button
                    key={m.id}
                    className={`null-method-row ${m.danger ? 'danger' : ''}`}
                    onClick={() => { handleTreatNulls(m.id); setShowNullModal(false); }}
                  >
                    <strong>{m.label}</strong>
                    <span className="null-method-desc">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="ix-modal-footer">
              <button className="chart-mini-btn" onClick={() => setShowNullModal(false)}>Cancel</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ══ CONVERT DATA TYPE MODAL ══ */}
      <AnimatePresence>
        {showConvertModal && (
          <Modal title="🔁 Convert Data Type" onClose={() => setShowConvertModal(false)}>
            <div className="ix-modal-body">
              <label className="modal-label">Select Column</label>
              <select className="ix-modal-select" value={convertConfig.column} onChange={e => setConvertConfig(p => ({ ...p, column: e.target.value }))}>
                <option value="">Choose column…</option>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="modal-label" style={{ marginTop: 16 }}>Target Data Type</label>
              <select className="ix-modal-select" value={convertConfig.targetType} onChange={e => setConvertConfig(p => ({ ...p, targetType: e.target.value }))}>
                <option value="">Choose type…</option>
                <option value="Number">Number</option>
                <option value="String">String</option>
                <option value="Date">Date (YYYY-MM-DD)</option>
                <option value="Boolean">Boolean</option>
              </select>
            </div>
            <div className="ix-modal-footer">
              <button className="chart-mini-btn" onClick={() => setShowConvertModal(false)}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                disabled={!convertConfig.column || !convertConfig.targetType}
                onClick={() => {
                  handleConvertDataType(convertConfig.column, convertConfig.targetType);
                  setShowConvertModal(false);
                  setConvertConfig({ column: '', targetType: '' });
                }}
              >
                Convert
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DataCleaningPage;
