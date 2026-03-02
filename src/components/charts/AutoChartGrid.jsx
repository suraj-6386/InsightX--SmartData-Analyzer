import React from 'react';
import { motion } from 'framer-motion';
import SummaryStatsChart from './SummaryStatsChart';
import TrendLineChart from './TrendLineChart';
import CategoryPieChart from './CategoryPieChart';
import { useData } from '../../context/DataContext';
import { useDataProcessor } from '../../hooks/useDataProcessor';
import ChartCard from '../ui/ChartCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

const AutoChartGrid = () => {
  const { currentData } = useData();
  const { numericColumns, stats } = useDataProcessor(currentData);

  if (!currentData || currentData.length === 0) return null;

  // Build stats comparison bar chart for numeric columns
  const statsBarData = numericColumns.slice(0, 6).map(col => {
    const s = stats[col] || {};
    return {
      col,
      Mean: +((s.mean) || 0).toFixed(2),
      Min: +((s.min) || 0).toFixed(2),
      Max: +((s.max) || 0).toFixed(2),
    };
  });

  return (
    <motion.div
      className="auto-chart-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {/* KPI Stats Row */}
      <SummaryStatsChart />

      {/* Auto Charts Row */}
      <div className="charts-row">
        <div className="chart-col-wide">
          <TrendLineChart />
        </div>
        <div className="chart-col-narrow">
          <CategoryPieChart />
        </div>
      </div>

      {/* Column Stats Comparison */}
      {statsBarData.length > 0 && (
        <ChartCard title="Column Statistics Comparison (Mean / Min / Max)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statsBarData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="col" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                }}
              />
              <Bar dataKey="Mean" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Min" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Max" fill="#e11d48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </motion.div>
  );
};

export default AutoChartGrid;
