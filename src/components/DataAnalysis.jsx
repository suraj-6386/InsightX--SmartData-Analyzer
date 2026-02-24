import React from 'react';

const DataAnalysis = ({ data }) => {
  if (!data || data.length === 0) return null;

  const totalRows = data.length;
  const columns = Object.keys(data[0]);
  const numColumns = columns.length;

  const numericColumns = columns.filter(col => {
    return data.every(row => !isNaN(Number(row[col])));
  });

  const averages = numericColumns.map(col => {
    const sum = data.reduce((acc, row) => acc + Number(row[col]), 0);
    return { column: col, average: (sum / totalRows).toFixed(2) };
  });

  // Simple top category for first non-numeric column
  const nonNumericColumns = columns.filter(col => !numericColumns.includes(col));
  let topCategory = null;
  if (nonNumericColumns.length > 0) {
    const col = nonNumericColumns[0];
    const counts = {};
    data.forEach(row => {
      const value = row[col];
      counts[value] = (counts[value] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(counts));
    topCategory = Object.keys(counts).find(key => counts[key] === maxCount);
  }

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5>Data Analysis</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">{totalRows}</h5>
                <p className="card-text">Total Rows</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">{numColumns}</h5>
                <p className="card-text">Columns</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">{numericColumns.length}</h5>
                <p className="card-text">Numeric Columns</p>
              </div>
            </div>
          </div>
          {topCategory && (
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">{topCategory}</h5>
                  <p className="card-text">Top Category</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <h6 className="mt-3">Averages:</h6>
        <ul>
          {averages.map(avg => (
            <li key={avg.column}>{avg.column}: {avg.average}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DataAnalysis;