import React from 'react';
import { useData } from '../../context/DataContext';
import { useDataProcessor } from '../../hooks/useDataProcessor';
import StatCard from '../ui/StatCard';

const RowsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
  </svg>
);
const ColsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/>
  </svg>
);
const NumericIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const SummaryStatsChart = () => {
  const { currentData } = useData();
  const { rowCount, colCount, numericColumns, missingPercent } = useDataProcessor(currentData);

  if (!currentData) return null;

  const cards = [
    { icon: <RowsIcon />, label: 'Total Rows', value: rowCount, color: '#7c3aed', subtitle: 'data entries', delay: 0 },
    { icon: <ColsIcon />, label: 'Total Columns', value: colCount, color: '#2563eb', subtitle: 'features / attributes', delay: 100 },
    { icon: <NumericIcon />, label: 'Numeric Columns', value: numericColumns.length, color: '#059669', subtitle: 'quantitative fields', delay: 200 },
    {
      icon: <AlertIcon />,
      label: 'Missing Values',
      value: `${missingPercent}%`,
      color: missingPercent > 10 ? '#e11d48' : '#d97706',
      subtitle: missingPercent > 10 ? 'High — cleaning recommended' : 'Across dataset',
      delay: 300,
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
};

export default SummaryStatsChart;

