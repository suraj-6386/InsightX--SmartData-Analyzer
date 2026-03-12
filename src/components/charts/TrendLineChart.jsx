import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { useData } from '../../context/DataContext';
import { useDataProcessor } from '../../hooks/useDataProcessor';
import ChartCard from '../ui/ChartCard';

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#e11d48', '#d97706', '#0891b2'];

const TrendLineChart = () => {
  const { currentData } = useData();
  const { numericColumns, categoricalColumns } = useDataProcessor(currentData);
  const [selectedY, setSelectedY] = useState(null);

  if (!currentData || currentData.length === 0) return null;

  
  const columns = Object.keys(currentData[0]);
  const xCol = categoricalColumns[0] || columns[0];

  
  const plotCols = numericColumns.slice(0, 4);
  const activePlot = selectedY ? [selectedY] : plotCols.slice(0, 2);

  
  const grouped = {};
  currentData.forEach(row => {
    const key = String(row[xCol] ?? 'N/A').substring(0, 20);
    if (!grouped[key]) grouped[key] = { _count: 0 };
    plotCols.forEach(col => {
      const v = Number(row[col]);
      if (!isNaN(v)) {
        grouped[key][col] = (grouped[key][col] || 0) + v;
      }
    });
    grouped[key]._count++;
  });

  let chartData = Object.entries(grouped).map(([name, vals]) => {
    const entry = { name };
    plotCols.forEach(col => {
      entry[col] = vals[col] != null ? +(vals[col] / vals._count).toFixed(2) : 0;
    });
    return entry;
  });

  
  if (chartData.length > 40) chartData = chartData.slice(0, 40);

  const rightSlot = plotCols.length > 1 && (
    <select
      className="chart-mini-select"
      value={selectedY || ''}
      onChange={e => setSelectedY(e.target.value || null)}
    >
      <option value="">All series</option>
      {plotCols.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  );

  return (
    <ChartCard title={`Trend: ${activePlot.join(' & ')} by ${xCol}`} rightSlot={rightSlot}>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            angle={-30}
            textAnchor="end"
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              backdropFilter: 'blur(12px)',
              color: 'var(--text-primary)',
            }}
          />
          <Legend wrapperStyle={{ color: 'var(--text-muted)', paddingTop: '8px' }} />
          {activePlot.map((col, i) => (
            <Line
              key={col}
              type="monotone"
              dataKey={col}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2.5}
              dot={{ r: 3, fill: COLORS[i % COLORS.length] }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TrendLineChart;

