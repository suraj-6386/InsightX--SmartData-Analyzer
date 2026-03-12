import React from 'react';
import { calculateKPIs } from '../services/analysisService';

const KPISection = ({ data }) => {
  const analysis = calculateKPIs(data);

  if (!analysis) return null;

  return (
    <div className="kpi-section">
      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="kpi-card">
            <span className="kpi-value">{analysis.totalRows}</span>
            <div className="kpi-label">Total Rows</div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="kpi-card">
            <span className="kpi-value">{analysis.numColumns}</span>
            <div className="kpi-label">Columns</div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="kpi-card">
            <span className="kpi-value">{analysis.numericColumns.length}</span>
            <div className="kpi-label">Numeric Fields</div>
          </div>
        </div>
        {analysis.topCategory && (
          <div className="col-md-3 mb-3">
            <div className="kpi-card">
              <span className="kpi-value">{analysis.topCategory}</span>
              <div className="kpi-label">Top Category</div>
            </div>
          </div>
        )}
        {analysis.averages.slice(0, 2).map(avg => (
          <div key={avg.column} className="col-md-3 mb-3">
            <div className="kpi-card">
              <span className="kpi-value">{avg.average}</span>
              <div className="kpi-label">Avg {avg.column}</div>
            </div>
          </div>
        ))}
        {analysis.maxValues.slice(0, 1).map(max => (
          <div key={max.column} className="col-md-3 mb-3">
            <div className="kpi-card">
              <span className="kpi-value">{max.max}</span>
              <div className="kpi-label">Max {max.column}</div>
            </div>
          </div>
        ))}
        {analysis.minValues.slice(0, 1).map(min => (
          <div key={min.column} className="col-md-3 mb-3">
            <div className="kpi-card">
              <span className="kpi-value">{min.min}</span>
              <div className="kpi-label">Min {min.column}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KPISection;
