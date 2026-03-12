import React, { useState } from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { useForecast } from '../../hooks/useForecast';
import { useData } from '../../context/DataContext';
import { getNumericColumns } from '../../utils/statisticsUtils';
import { goalSeek } from '../../utils/forecastingUtils';
import { pearsonCorrelation } from '../../utils/regressionUtils';
import ChartCard from '../ui/ChartCard';

const ForecastChart = ({ data: propData }) => {
  const { currentData } = useData();
  const data = propData || currentData;

  const numericColumns = data ? getNumericColumns(data) : [];
  const cols = data && data.length > 0 ? Object.keys(data[0]) : [];

  const [xCol, setXCol] = useState('');
  const [yCol, setYCol] = useState('');
  const [forecastN, setForecastN] = useState(3);
  const [smaWindow, setSmaWindow] = useState(3);
  const [goalTarget, setGoalTarget] = useState(10);
  const [showGoalSeek, setShowGoalSeek] = useState(false);

  if (!data || data.length < 4 || numericColumns.length === 0) return null;

  const activeX = xCol || cols[0];
  const activeY = yCol || numericColumns[0];

  const { series, trendInfo } = useForecast(data, activeX, activeY, forecastN, smaWindow);

  
  const goalResults = showGoalSeek
    ? goalSeek(
        Object.fromEntries(numericColumns.filter(c => c !== activeY).map(c => [
          c,
          pearsonCorrelation(
            data.map(r => Number(r[c])).filter(v => !isNaN(v)),
            data.map(r => Number(r[activeY])).filter(v => !isNaN(v))
          )
        ])),
        goalTarget
      )
    : [];

  const rightSlot = (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap:'wrap' }}>
      <select className="chart-mini-select" value={activeY} onChange={e => setYCol(e.target.value)}>
        {numericColumns.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select className="chart-mini-select" value={forecastN} onChange={e => setForecastN(Number(e.target.value))}>
        {[2,3,4,5,6].map(n => <option key={n} value={n}>+{n} pts</option>)}
      </select>
    </div>
  );

  const histCount = series.filter(s => s.type === 'historical').length;

  return (
    <ChartCard title={`Forecast: ${activeY} (SMA + Linear Regression)`} rightSlot={rightSlot}>
      {trendInfo && (
        <div className="forecast-stats">
          {[
            { label: 'Slope', value: trendInfo.slope?.toFixed(4) },
            { label: 'Intercept', value: trendInfo.intercept?.toFixed(4) },
            { label: 'R²', value: trendInfo.r2?.toFixed(4), color: trendInfo.r2 > 0.7 ? '#22c55e' : '#d97706' },
            { label: 'Next Forecast', value: trendInfo.forecast?.[0]?.toFixed(2), color: 'var(--primary-color)' },
          ].map(s => (
            <div key={s.label} className="forecast-stat">
              <span className="fc-label">{s.label}</span>
              <span className="fc-value" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} angle={-20} textAnchor="end" interval="preserveStartEnd" />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }} />
          <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '12px' }} />
          {}
          <Line type="monotone" dataKey="actual" stroke="var(--primary-color)" strokeWidth={2} dot={{ r: 3 }} name="Actual" connectNulls />
          {}
          <Line type="monotone" dataKey="sma" stroke="#2563eb" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="SMA" connectNulls />
          {}
          <Line type="monotone" dataKey="trend" stroke="#d97706" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="Trend" connectNulls />
          {}
          <Line type="monotone" dataKey="forecast" stroke="#22c55e" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 4, fill: '#22c55e' }} name="Forecast" connectNulls />
          {}
          <Area type="monotone" dataKey="upper" stroke="none" fill="#22c55e" fillOpacity={0.1} name="Upper CI" connectNulls />
          <Area type="monotone" dataKey="lower" stroke="none" fill="#22c55e" fillOpacity={0.05} name="Lower CI" connectNulls />
          {}
          <ReferenceLine x={series[histCount - 1]?.label} stroke="#e11d48" strokeDasharray="6 3" label={{ value: 'Forecast →', fill: '#e11d48', fontSize: 10 }} />
        </ComposedChart>
      </ResponsiveContainer>

      {}
      <div className="goal-seek-section">
        <button className="chart-mini-btn" onClick={() => setShowGoalSeek(!showGoalSeek)}>
          🎯 {showGoalSeek ? 'Hide' : 'Show'} Goal Seek
        </button>
        {showGoalSeek && (
          <div className="goal-seek-panel">
            <div className="goal-input-row">
              <label>Target increase in <strong>{activeY}</strong>:</label>
              <input
                type="number"
                className="goal-input"
                value={goalTarget}
                onChange={e => setGoalTarget(Number(e.target.value))}
                min={1} max={100}
              />
              <span>%</span>
            </div>
            <div className="goal-results">
              {goalResults.slice(0, 4).map(g => (
                <div key={g.column} className="goal-result-row">
                  <span className="goal-col">{g.column}</span>
                  <span className={`goal-dir ${g.direction.toLowerCase()}`}>{g.direction}</span>
                  <span className="goal-impact">r={g.correlation.toFixed(2)} → ~{g.estimatedImpact}% impact</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ChartCard>
  );
};

export default ForecastChart;

