import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { applyFilter } from '../../utils/pivotUtils';

const OPERATORS = [
  { value: '>', label: '> Greater than' },
  { value: '<', label: '< Less than' },
  { value: '>=', label: '>= Greater or equal' },
  { value: '<=', label: '<= Less or equal' },
  { value: '=', label: '= Equals' },
  { value: '!=', label: '≠ Not equals' },
  { value: 'contains', label: '∋ Contains' },
  { value: 'startsWith', label: '⊳ Starts with' },
  { value: 'endsWith', label: '⊲ Ends with' },
];

const FilterBuilder = ({ data: propData, onFilteredData }) => {
  const { currentData, setCleanedData } = useData();
  const data = propData || currentData;

  const [conditions, setConditions] = useState([]);
  const [logic, setLogic] = useState('AND');
  const [applied, setApplied] = useState(false);

  if (!data || data.length === 0) return null;
  const allCols = Object.keys(data[0]);

  const addCondition = () => {
    setConditions(prev => [...prev, {
      id: Date.now(), column: allCols[0], operator: '>', value: '', active: true,
    }]);
  };

  const updateCondition = (id, field, val) => {
    setConditions(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));
  };

  const removeCondition = (id) => {
    setConditions(prev => prev.filter(c => c.id !== id));
    if (conditions.length <= 1) { setApplied(false); }
  };

  const applyFilters = () => {
    const activeConditions = conditions.filter(c => c.value !== '');
    const result = applyFilter(data, activeConditions, logic);
    setCleanedData(result);
    if (onFilteredData) onFilteredData(result);
    setApplied(true);
  };

  const clearAll = () => {
    setConditions([]);
    setCleanedData(data);
    if (onFilteredData) onFilteredData(data);
    setApplied(false);
  };

  const preview = conditions.filter(c => c.value !== '');
  const activeCount = preview.length > 0 ? applyFilter(data, preview, logic).length : data.length;

  return (
    <div className="filter-builder glass-card">
      <div className="filter-header">
        <h5 className="section-heading">🔍 Multi-Criteria Filter</h5>
        <div className="filter-logic-toggle">
          {['AND', 'OR'].map(l => (
            <button
              key={l}
              className={`logic-btn ${logic === l ? 'active' : ''}`}
              onClick={() => setLogic(l)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {conditions.map((cond, idx) => (
          <motion.div
            key={cond.id}
            className="filter-row"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            {idx > 0 && <span className="filter-joiner">{logic}</span>}
            <select
              className="filter-select"
              value={cond.column}
              onChange={e => updateCondition(cond.id, 'column', e.target.value)}
            >
              {allCols.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              className="filter-select filter-op"
              value={cond.operator}
              onChange={e => updateCondition(cond.id, 'operator', e.target.value)}
            >
              {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input
              type="text"
              className="filter-value-input"
              placeholder="Value..."
              value={cond.value}
              onChange={e => updateCondition(cond.id, 'value', e.target.value)}
            />
            <button className="filter-remove-btn" onClick={() => removeCondition(cond.id)}>✕</button>
          </motion.div>
        ))}
      </AnimatePresence>

      {conditions.length === 0 && (
        <p className="filter-empty">No conditions yet. Click <strong>+ Add Condition</strong> to filter rows.</p>
      )}

      <div className="filter-actions">
        <button className="chart-mini-btn" onClick={addCondition}>+ Add Condition</button>
        {conditions.length > 0 && (
          <>
            <button className="btn btn-primary btn-sm" onClick={applyFilters}>
              Apply Filters
            </button>
            <button className="chart-mini-btn" onClick={clearAll}>Clear All</button>
          </>
        )}
      </div>

      {conditions.length > 0 && (
        <div className="filter-preview">
          <span className={applied ? 'filter-preview-applied' : 'filter-preview-pending'}>
            {applied ? '✅' : '⏳'}
          </span>
          <span>
            Preview: <strong>{activeCount.toLocaleString()}</strong> / {data.length.toLocaleString()} rows match
            {preview.length > 0 && ` (${Math.round(activeCount/data.length*100)}%)`}
          </span>
        </div>
      )}
    </div>
  );
};

export default FilterBuilder;

