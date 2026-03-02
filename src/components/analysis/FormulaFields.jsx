import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { addCalculatedColumn, evaluateFormula } from '../../utils/pivotUtils';

const FORMULA_EXAMPLES = [
  { label: 'Profit Margin', formula: 'Revenue - Cost' },
  { label: 'Growth Rate', formula: '(New - Old) / Old * 100' },
  { label: 'Efficiency', formula: 'Output / Input * 100' },
];

const FormulaFields = ({ data: propData }) => {
  const { currentData, setCleanedData } = useData();
  const data = propData || currentData;

  const [newColName, setNewColName] = useState('');
  const [formula, setFormula] = useState('');
  const [addedCols, setAddedCols] = useState([]);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  if (!data || data.length === 0) return null;
  const columns = Object.keys(data[0]);

  const validateAndPreview = () => {
    if (!formula.trim()) { setError('Formula is empty'); return; }
    try {
      const testResult = evaluateFormula(data[0], formula, columns);
      if (testResult === 'Invalid formula' || testResult === 'Error') {
        setError('Invalid formula — check column names and operators');
        setPreview(null);
        return;
      }
      // Preview first 3 rows
      const rows = data.slice(0, 3).map(row => ({
        ...Object.fromEntries(columns.slice(0, 3).map(c => [c, row[c]])),
        [newColName || 'Result']: evaluateFormula(row, formula, columns),
      }));
      setPreview(rows);
      setError('');
    } catch {
      setError('Formula evaluation failed');
      setPreview(null);
    }
  };

  const applyFormula = () => {
    if (!newColName.trim()) { setError('Enter a column name'); return; }
    if (!formula.trim()) { setError('Enter a formula'); return; }
    if (addedCols.find(c => c.name === newColName)) {
      setError(`Column "${newColName}" already created`);
      return;
    }
    const enriched = addCalculatedColumn(data, newColName, formula);
    setCleanedData(enriched);
    setAddedCols(prev => [...prev, { name: newColName, formula }]);
    setNewColName('');
    setFormula('');
    setPreview(null);
    setError('');
  };

  const removeCol = (name) => {
    const newData = currentData.map(row => {
      const r = { ...row };
      delete r[name];
      return r;
    });
    setCleanedData(newData);
    setAddedCols(prev => prev.filter(c => c.name !== name));
  };

  return (
    <div className="formula-fields glass-card">
      <h5 className="section-heading">🧮 Formula Fields (Calculated Columns)</h5>
      <p className="section-desc">
        Create a new column from a formula using existing column names as variables.
        <span className="formula-hint">Available: {columns.join(', ')}</span>
      </p>

      {/* Example formulas */}
      <div className="formula-examples">
        {FORMULA_EXAMPLES.map(ex => (
          <button
            key={ex.label}
            className="formula-example-btn"
            onClick={() => { setNewColName(ex.label); setFormula(ex.formula); setError(''); setPreview(null); }}
          >
            <span>{ex.label}</span>
            <code>{ex.formula}</code>
          </button>
        ))}
      </div>

      <div className="formula-input-row">
        <div className="formula-input-group">
          <label>New Column Name</label>
          <input
            type="text"
            className="formula-input"
            placeholder="e.g. Profit"
            value={newColName}
            onChange={e => setNewColName(e.target.value)}
          />
        </div>
        <div className="formula-input-group formula-expr">
          <label>Formula Expression</label>
          <input
            type="text"
            className="formula-input font-mono"
            placeholder="e.g. Revenue - Cost"
            value={formula}
            onChange={e => { setFormula(e.target.value); setPreview(null); setError(''); }}
          />
        </div>
      </div>

      {error && <p className="formula-error">❌ {error}</p>}

      <div className="formula-actions">
        <button className="chart-mini-btn" onClick={validateAndPreview}>Preview</button>
        <button className="btn btn-primary btn-sm" onClick={applyFormula} disabled={!newColName || !formula}>
          ➕ Add Column
        </button>
      </div>

      {/* Preview table */}
      {preview && (
        <div className="formula-preview">
          <p className="formula-preview-label">✅ Preview (first 3 rows):</p>
          <table className="stats-preview-table">
            <thead>
              <tr>{Object.keys(preview[0]).map(k => <th key={k}>{k}</th>)}</tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i}>
                  {Object.entries(row).map(([k, v]) => (
                    <td key={k} style={k === (newColName || 'Result') ? { color: 'var(--primary-color)', fontWeight: 700 } : {}}>
                      {String(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Added columns list */}
      {addedCols.length > 0 && (
        <div className="formula-cols-list">
          <p className="formula-preview-label">Created Columns:</p>
          {addedCols.map(col => (
            <div key={col.name} className="formula-col-item">
              <span className="formula-col-name">{col.name}</span>
              <code className="formula-col-expr">{col.formula}</code>
              <button className="filter-remove-btn" onClick={() => removeCol(col.name)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormulaFields;
