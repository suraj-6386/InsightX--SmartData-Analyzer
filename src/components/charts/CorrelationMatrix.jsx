import React, { useState } from 'react';
import { useCorrelation } from '../../hooks/useCorrelation';
import ChartCard from '../ui/ChartCard';
import { correlationLabel, correlationDirection } from '../../utils/regressionUtils';

/**
 * CorrelationMatrix — renders a color-coded Pearson R heatmap grid.
 * Green = strong positive, Red = strong negative, Gray = negligible.
 */
const CorrelationMatrix = ({ data }) => {
  const { columns, matrix } = useCorrelation(data);
  const [selected, setSelected] = useState(null);

  if (!columns || columns.length < 2) {
    return (
      <ChartCard title="Correlation Matrix">
        <div className="analysis-empty">Need at least 2 numeric columns</div>
      </ChartCard>
    );
  }

  const getColor = (r) => {
    if (r === 1) return 'var(--primary-color)';
    const abs = Math.abs(r);
    if (r > 0) return `rgba(5, 150, 105, ${0.15 + abs * 0.75})`;   // green
    return `rgba(225, 29, 72, ${0.15 + abs * 0.75})`;               // red
  };

  const getTextColor = (r) => Math.abs(r) > 0.5 ? '#fff' : 'var(--text-primary)';

  return (
    <ChartCard title="Pearson Correlation Matrix">
      <div className="correlation-wrap">
        <div className="corr-table-wrap">
          <table className="corr-table">
            <thead>
              <tr>
                <th className="corr-th-empty" />
                {columns.map(col => (
                  <th key={col} className="corr-col-header" title={col}>
                    {col.length > 8 ? col.substring(0, 8) + '…' : col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={columns[i]}>
                  <th className="corr-row-header" title={columns[i]}>
                    {columns[i].length > 8 ? columns[i].substring(0, 8) + '…' : columns[i]}
                  </th>
                  {row.map((r, j) => (
                    <td
                      key={j}
                      className="corr-cell"
                      style={{ background: getColor(r), color: getTextColor(r) }}
                      onClick={() => setSelected({ colA: columns[i], colB: columns[j], r })}
                      title={`${columns[i]} vs ${columns[j]}: ${r}`}
                    >
                      {r.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Color scale legend */}
        <div className="corr-legend">
          <span className="corr-legend-neg">-1.0</span>
          <div className="corr-legend-bar" />
          <span className="corr-legend-pos">+1.0</span>
        </div>

        {/* Detail tooltip on click */}
        {selected && (
          <div className="corr-detail glass-card">
            <button className="corr-detail-close" onClick={() => setSelected(null)}>✕</button>
            <strong>{selected.colA} × {selected.colB}</strong>
            <div className="corr-detail-row">
              <span>Pearson R</span><strong>{selected.r.toFixed(4)}</strong>
            </div>
            <div className="corr-detail-row">
              <span>Strength</span><strong>{correlationLabel(selected.r)}</strong>
            </div>
            <div className="corr-detail-row">
              <span>Direction</span><strong>{correlationDirection(selected.r)}</strong>
            </div>
            <div className="corr-detail-row">
              <span>R²</span><strong>{(selected.r * selected.r).toFixed(4)}</strong>
            </div>
          </div>
        )}
      </div>
    </ChartCard>
  );
};

export default CorrelationMatrix;
