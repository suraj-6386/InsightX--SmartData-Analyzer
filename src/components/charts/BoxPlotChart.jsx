import React, { useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Scatter
} from 'recharts';
import { useOutliers } from '../../hooks/useOutliers';
import { useData } from '../../context/DataContext';
import { getNumericColumns, extractNumericValues } from '../../utils/statisticsUtils';
import { quartiles } from '../../utils/statisticsUtils';
import ChartCard from '../ui/ChartCard';

/**
 * BoxPlotChart — visual distribution summary (Q1, Median, Q3, fences, outliers).
 * Uses Recharts ComposedChart with reference lines to represent the box.
 */
const BoxPlotChart = ({ data: propData }) => {
  const { currentData } = useData();
  const data = propData || currentData;
  const { outliers } = useOutliers(data);
  const [selectedCol, setSelectedCol] = useState('');

  if (!data || data.length === 0) return null;
  const numericColumns = getNumericColumns(data);
  if (numericColumns.length === 0) return null;

  const col = selectedCol || numericColumns[0];
  const values = extractNumericValues(data, col);
  const { q1, q2, q3 } = quartiles(values);
  const outInfo = outliers[col] || {};
  const { lowerFence = 0, upperFence = 0, outliers: outlierVals = [] } = outInfo;
  const sorted = [...values].sort((a, b) => a - b);

  // Build distribution histogram bins (20 bins)
  const min = sorted[0], max = sorted[sorted.length - 1];
  const binCount = 20;
  const binWidth = (max - min) / binCount || 1;
  const bins = Array.from({ length: binCount }, (_, i) => {
    const lo = min + i * binWidth;
    const hi = lo + binWidth;
    const count = sorted.filter(v => v >= lo && (i === binCount - 1 ? v <= hi : v < hi)).length;
    const midpoint = +(lo + binWidth / 2).toFixed(2);
    return {
      midpoint,
      count,
      isOutlier: midpoint < lowerFence || midpoint > upperFence,
    };
  });

  const rightSlot = (
    <select
      className="chart-mini-select"
      value={col}
      onChange={e => setSelectedCol(e.target.value)}
    >
      {numericColumns.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  );

  return (
    <ChartCard title={`Box & Whisker Distribution — ${col}`} rightSlot={rightSlot}>
      <div className="boxplot-stats">
        {[
          { label: 'Min', value: sorted[0]?.toFixed(2) },
          { label: 'Q1', value: q1.toFixed(2) },
          { label: 'Median', value: q2.toFixed(2) },
          { label: 'Q3', value: q3.toFixed(2) },
          { label: 'Max', value: sorted[sorted.length - 1]?.toFixed(2) },
          { label: 'IQR', value: (q3 - q1).toFixed(2) },
          { label: 'Outliers', value: outlierVals.length, color: outlierVals.length > 0 ? '#e11d48' : '#22c55e' },
        ].map(s => (
          <div key={s.label} className="boxplot-stat">
            <span className="boxplot-stat-label">{s.label}</span>
            <span className="boxplot-stat-value" style={{ color: s.color || 'var(--primary-color)' }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={bins} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="midpoint" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <Tooltip
            formatter={(val, name) => [val, name]}
            contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }}
          />
          <Bar dataKey="count" name="Frequency"
            fill="var(--primary-color)"
            fillOpacity={0.7}
            radius={[3, 3, 0, 0]}
          />
          {/* IQR box boundaries */}
          <ReferenceLine x={q1} stroke="#2563eb" strokeDasharray="6 3" label={{ value: 'Q1', fill: '#2563eb', fontSize: 10 }} />
          <ReferenceLine x={q2} stroke="#22c55e" strokeWidth={2} label={{ value: 'Med', fill: '#22c55e', fontSize: 10 }} />
          <ReferenceLine x={q3} stroke="#2563eb" strokeDasharray="6 3" label={{ value: 'Q3', fill: '#2563eb', fontSize: 10 }} />
          {/* Outlier fences */}
          <ReferenceLine x={lowerFence} stroke="#e11d48" strokeDasharray="4 4" label={{ value: '↓Fence', fill: '#e11d48', fontSize: 9 }} />
          <ReferenceLine x={upperFence} stroke="#e11d48" strokeDasharray="4 4" label={{ value: '↑Fence', fill: '#e11d48', fontSize: 9 }} />
        </ComposedChart>
      </ResponsiveContainer>
      {outlierVals.length > 0 && (
        <div className="outlier-alert">
          <span className="outlier-badge">⚠️ {outlierVals.length} outlier{outlierVals.length > 1 ? 's' : ''} detected</span>
          <span className="outlier-vals">
            {outlierVals.slice(0, 5).map(v => v.toFixed(2)).join(', ')}{outlierVals.length > 5 ? ' ...' : ''}
          </span>
        </div>
      )}
    </ChartCard>
  );
};

export default BoxPlotChart;
