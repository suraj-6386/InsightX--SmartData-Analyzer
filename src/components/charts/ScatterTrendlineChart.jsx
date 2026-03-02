import React, { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Line, ComposedChart, Legend
} from 'recharts';
import { useData } from '../../context/DataContext';
import { getNumericColumns, extractNumericValues } from '../../utils/statisticsUtils';
import { linearRegression, correlationLabel, correlationDirection } from '../../utils/regressionUtils';
import { useOutliers } from '../../hooks/useOutliers';
import ChartCard from '../ui/ChartCard';

const COLORS = { normal: 'var(--primary-color)', outlier: '#e11d48' };

const ScatterTrendlineChart = ({ data: propData }) => {
  const { currentData } = useData();
  const data = propData || currentData;
  const { outliers } = useOutliers(data);

  const numericColumns = data ? getNumericColumns(data) : [];
  const [xCol, setXCol] = useState('');
  const [yCol, setYCol] = useState('');
  const [showOutliers, setShowOutliers] = useState(true);

  if (!data || data.length === 0 || numericColumns.length < 2) return null;

  const activeX = xCol || numericColumns[0];
  const activeY = yCol || numericColumns[1] || numericColumns[0];

  const xVals = useMemo(() => extractNumericValues(data, activeX), [data, activeX]);
  const yVals = useMemo(() => extractNumericValues(data, activeY), [data, activeY]);
  const { slope, intercept, r2 } = useMemo(() => linearRegression(xVals, yVals), [xVals, yVals]);

  const xMin = Math.min(...xVals), xMax = Math.max(...xVals);
  const trendlinePoints = [
    { x: xMin, trend: +(slope * xMin + intercept).toFixed(4) },
    { x: xMax, trend: +(slope * xMax + intercept).toFixed(4) },
  ];

  const outliersX = outliers[activeX]?.flags || [];
  const outliersY = outliers[activeY]?.flags || [];

  const scatterData = data.slice(0, 500).map((row, i) => {
    const x = Number(row[activeX]);
    const y = Number(row[activeY]);
    if (isNaN(x) || isNaN(y)) return null;
    const isOut = (outliersX[i]?.isOutlier || outliersY[i]?.isOutlier);
    return { x, y, isOutlier: isOut };
  }).filter(Boolean);

  const normalPoints = showOutliers
    ? scatterData.filter(p => !p.isOutlier)
    : scatterData;
  const outlierPoints = scatterData.filter(p => p.isOutlier);

  const r = Math.sqrt(r2) * (slope >= 0 ? 1 : -1);

  const rightSlot = (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <select className="chart-mini-select" value={activeX} onChange={e => setXCol(e.target.value)}>
        {numericColumns.map(c => <option key={c} value={c}>X: {c}</option>)}
      </select>
      <select className="chart-mini-select" value={activeY} onChange={e => setYCol(e.target.value)}>
        {numericColumns.map(c => <option key={c} value={c}>Y: {c}</option>)}
      </select>
    </div>
  );

  return (
    <ChartCard title={`Scatter + Trendline: ${activeX} vs ${activeY}`} rightSlot={rightSlot}>
      <div className="regression-stats">
        {[
          { label: 'Slope (m)', value: slope.toFixed(4) },
          { label: 'Intercept (b)', value: intercept.toFixed(4) },
          { label: 'R² (Fit)', value: r2.toFixed(4), color: r2 > 0.7 ? '#22c55e' : r2 > 0.4 ? '#d97706' : '#e11d48' },
          { label: 'r (Pearson)', value: r.toFixed(4) },
          { label: 'Strength', value: correlationLabel(r) },
          { label: 'Direction', value: correlationDirection(r) },
        ].map(s => (
          <div key={s.label} className="regression-stat">
            <span className="reg-label">{s.label}</span>
            <span className="reg-value" style={{ color: s.color || 'var(--primary-color)' }}>{s.value}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis type="number" dataKey="x" name={activeX} domain={['auto', 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <YAxis type="number" dataKey="y" name={activeY} domain={['auto', 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }} />
          <Scatter name="Data Points" data={normalPoints} fill={COLORS.normal} fillOpacity={0.65} r={4} />
          {showOutliers && outlierPoints.length > 0 && (
            <Scatter name="Outliers" data={outlierPoints} fill={COLORS.outlier} fillOpacity={0.9} r={5} shape="diamond" />
          )}
          <Line
            data={trendlinePoints}
            type="linear"
            dataKey="trend"
            stroke="#f59e0b"
            strokeWidth={2.5}
            strokeDasharray="8 4"
            dot={false}
            name="Regression Line"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="scatter-controls">
        <label className="scatter-toggle">
          <input type="checkbox" checked={showOutliers} onChange={e => setShowOutliers(e.target.checked)} />
          <span>Highlight outliers ({outlierPoints.length})</span>
        </label>
        <span className="regression-eq">
          ŷ = {slope.toFixed(3)}x {intercept >= 0 ? '+' : ''} {intercept.toFixed(3)}
        </span>
      </div>
    </ChartCard>
  );
};

export default ScatterTrendlineChart;
