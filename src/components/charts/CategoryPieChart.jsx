import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useData } from '../../context/DataContext';
import { useDataProcessor } from '../../hooks/useDataProcessor';
import ChartCard from '../ui/ChartCard';

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#e11d48', '#d97706', '#0891b2', '#db2777', '#16a34a'];

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.04) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CategoryPieChart = () => {
  const { currentData } = useData();
  const { categoricalColumns, numericColumns } = useDataProcessor(currentData);
  const [isDonut, setIsDonut] = useState(true);

  if (!currentData || currentData.length === 0) return null;

  const catCol = categoricalColumns[0];
  const numCol = numericColumns[0];
  if (!catCol) return null;

  
  const grouped = {};
  currentData.forEach(row => {
    const key = String(row[catCol] ?? 'N/A').substring(0, 25);
    if (!grouped[key]) grouped[key] = 0;
    if (numCol) {
      const v = Number(row[numCol]);
      grouped[key] += isNaN(v) ? 0 : v;
    } else {
      grouped[key]++;
    }
  });

  let pieData = Object.entries(grouped)
    .map(([name, value]) => ({ name, value: +value.toFixed(2) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); 

  const total = pieData.reduce((s, d) => s + d.value, 0);

  const rightSlot = (
    <button
      className="chart-mini-btn"
      onClick={() => setIsDonut(!isDonut)}
      title="Toggle Donut / Pie"
    >
      {isDonut ? '🥧 Pie' : '🍩 Donut'}
    </button>
  );

  return (
    <ChartCard
      title={`Distribution: ${catCol}${numCol ? ' by ' + numCol : ' (count)'}`}
      rightSlot={rightSlot}
    >
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={isDonut ? 60 : 0}
            outerRadius={105}
            labelLine={false}
            label={renderCustomLabel}
            dataKey="value"
          >
            {pieData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          {isDonut && (
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" style={{ fill: 'var(--text-primary)', fontSize: '13px', fontWeight: 700 }}>
              {total.toLocaleString()}
            </text>
          )}
          <Tooltip
            formatter={(v, name) => [v.toLocaleString(), name]}
            contentStyle={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ color: 'var(--text-muted)', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default CategoryPieChart;

