import React, { useState } from 'react';
import ChartCard from './ChartCard';

const InteractiveDashboard = ({ data }) => {
  const [xColumn, setXColumn] = useState('');
  const [yColumn, setYColumn] = useState('');

  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  const chartTypes = [
    { type: 'bar', title: 'Bar Chart' },
    { type: 'line', title: 'Line Chart' },
    { type: 'pie', title: 'Pie Chart' },
    { type: 'area', title: 'Area Chart' },
    { type: 'scatter', title: 'Scatter Plot' },
  ];

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5>Interactive Dashboard</h5>
        <div className="row mt-3">
          <div className="col-md-6">
            <select
              className="form-select"
              value={xColumn}
              onChange={(e) => setXColumn(e.target.value)}
            >
              <option value="">Select X Column</option>
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <select
              className="form-select"
              value={yColumn}
              onChange={(e) => setYColumn(e.target.value)}
            >
              <option value="">Select Y Column</option>
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          {chartTypes.map((chart, index) => (
            <div key={index} className="col-md-6 mb-4">
              <ChartCard
                data={data}
                chartType={chart.type}
                xColumn={xColumn}
                yColumn={yColumn}
                title={chart.title}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InteractiveDashboard;