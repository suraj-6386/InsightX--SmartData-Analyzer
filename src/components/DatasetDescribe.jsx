import React from 'react';

const DatasetDescribe = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">📈 Dataset Statistics</h5>
        </div>
        <div className="card-body">
          <p className="text-muted">No data available. Please upload a dataset first.</p>
        </div>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  
  const numericColumns = columns.filter(col => {
    const values = data.map(row => row[col]).filter(val => val !== null && val !== undefined && val !== '');
    const numericValues = values.filter(val => !isNaN(Number(val)));
    return numericValues.length / values.length >= 0.8;
  });

  if (numericColumns.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">📈 Dataset Statistics</h5>
        </div>
        <div className="card-body">
          <p className="text-muted">No numeric columns found for statistical analysis.</p>
        </div>
      </div>
    );
  }

  
  const statistics = numericColumns.map(col => {
    const values = data.map(row => Number(row[col])).filter(val => !isNaN(val)).sort((a, b) => a - b);
    const count = values.length;

    if (count === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / count;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / count;
    const std = Math.sqrt(variance);

    const min = Math.min(...values);
    const max = Math.max(...values);

    
    const getPercentile = (arr, p) => {
      const index = (p / 100) * (arr.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index % 1;

      if (upper >= arr.length) return arr[arr.length - 1];
      return arr[lower] * (1 - weight) + arr[upper] * weight;
    };

    const percentile25 = getPercentile(values, 25);
    const percentile50 = getPercentile(values, 50);
    const percentile75 = getPercentile(values, 75);

    return {
      column: col,
      count,
      mean: mean.toFixed(2),
      std: std.toFixed(2),
      min: min.toFixed(2),
      '25%': percentile25.toFixed(2),
      '50%': percentile50.toFixed(2),
      '75%': percentile75.toFixed(2),
      max: max.toFixed(2)
    };
  }).filter(stat => stat !== null);

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title">📈 Dataset Statistics</h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Column</th>
                <th>Count</th>
                <th>Mean</th>
                <th>Std</th>
                <th>Min</th>
                <th>25%</th>
                <th>50%</th>
                <th>75%</th>
                <th>Max</th>
              </tr>
            </thead>
            <tbody>
              {statistics.map((stat, index) => (
                <tr key={index}>
                  <td><code>{stat.column}</code></td>
                  <td>{stat.count}</td>
                  <td>{stat.mean}</td>
                  <td>{stat.std}</td>
                  <td>{stat.min}</td>
                  <td>{stat['25%']}</td>
                  <td>{stat['50%']}</td>
                  <td>{stat['75%']}</td>
                  <td>{stat.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DatasetDescribe;
