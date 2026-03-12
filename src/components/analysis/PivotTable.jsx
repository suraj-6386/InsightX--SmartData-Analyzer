import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { groupBy } from '../../utils/pivotUtils';
import { getNumericColumns } from '../../utils/statisticsUtils';
import ChartCard from '../ui/ChartCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AGG_OPTIONS = [
  { value: 'sum', label: 'Sum' },
  { value: 'count', label: 'Count' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
];

const PivotTable = ({ data: propData }) => {
  const { currentData } = useData();
  const data = propData || currentData;

  const [groupCol, setGroupCol] = useState('');
  const [valueCol, setValueCol] = useState('');
  const [aggFunc, setAggFunc] = useState('sum');
  const [sortDir, setSortDir] = useState('desc');

  if (!data || data.length === 0) return null;

  const allCols = Object.keys(data[0]);
  const numericCols = getNumericColumns(data);
  const categoricalCols = allCols.filter(c => !numericCols.includes(c));

  const activeGroup = groupCol || categoricalCols[0] || allCols[0];
  const activeValue = valueCol || numericCols[0] || allCols[0];

  const pivotData = groupBy(data, activeGroup, activeValue, aggFunc);
  const sorted = [...pivotData].sort((a, b) =>
    sortDir === 'desc' ? b.value - a.value : a.value - b.value
  );
  const displayData = sorted.slice(0, 15);

  const total = pivotData.reduce((s, r) => s + r.value, 0);

  return (
    <ChartCard title="Pivot Table — Group By Analysis">
      {}
      <div className="pivot-controls">
        <div className="pivot-control-group">
          <label>Group By</label>
          <select className="pivot-select" value={activeGroup} onChange={e => setGroupCol(e.target.value)}>
            {allCols.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="pivot-control-group">
          <label>Value Column</label>
          <select className="pivot-select" value={activeValue} onChange={e => setValueCol(e.target.value)}>
            {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="pivot-control-group">
          <label>Aggregation</label>
          <select className="pivot-select" value={aggFunc} onChange={e => setAggFunc(e.target.value)}>
            {AGG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <button
          className="chart-mini-btn"
          onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
        >
          {sortDir === 'desc' ? '↓ Desc' : '↑ Asc'}
        </button>
      </div>

      {}
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={displayData} margin={{ top: 5, right: 15, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="group" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} angle={-20} textAnchor="end" />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
          <Bar dataKey="value" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {}
      <div className="pivot-table-wrap">
        <table className="pivot-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{activeGroup}</th>
              <th>{aggFunc.toUpperCase()}({activeValue})</th>
              <th>% of Total</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, i) => (
              <tr key={row.group}>
                <td className="pivot-rank">{i + 1}</td>
                <td><strong>{row.group}</strong></td>
                <td>{row.value.toLocaleString()}</td>
                <td>
                  <div className="pivot-pct-bar-wrap">
                    <div className="pivot-pct-bar" style={{ width: `${total > 0 ? (row.value / total * 100) : 0}%` }} />
                    <span>{total > 0 ? ((row.value / total) * 100).toFixed(1) : 0}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}><strong>Total ({pivotData.length} groups)</strong></td>
              <td><strong>{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></td>
              <td>100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </ChartCard>
  );
};

export default PivotTable;

