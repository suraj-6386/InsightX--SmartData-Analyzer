import React from 'react';

const DatasetInfo = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">📊 Dataset Information</h5>
        </div>
        <div className="card-body">
          <p className="text-muted">No data available. Please upload a dataset first.</p>
        </div>
      </div>
    );
  }

  const columns = Object.keys(data[0]);
  const totalRows = data.length;
  const totalColumns = columns.length;

  
  const columnInfo = columns.map(col => {
    let dataType = 'object';
    let missingCount = 0;

    
    const sampleValues = data.slice(0, Math.min(100, data.length)).map(row => row[col]);
    const numericValues = sampleValues.filter(val => !isNaN(Number(val)) && val !== '');
    const dateValues = sampleValues.filter(val => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && val !== '';
    });

    if (numericValues.length > sampleValues.length * 0.8) {
      dataType = 'numeric';
    } else if (dateValues.length > sampleValues.length * 0.8) {
      dataType = 'date';
    }

    
    missingCount = data.filter(row => {
      const val = row[col];
      return val === null || val === undefined || val === '' || val === 'null' || val === 'NULL';
    }).length;

    return {
      name: col,
      dataType,
      missingCount,
      missingPercent: ((missingCount / totalRows) * 100).toFixed(1)
    };
  });

  
  const approxMemoryUsage = (totalRows * totalColumns * 8) / 1024; 

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title">📊 Dataset Information</h5>
      </div>
      <div className="card-body">
        <div className="info-summary">
          <div className="summary-item">
            <span className="summary-label">Total Rows:</span>
            <span className="summary-value">{totalRows.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Columns:</span>
            <span className="summary-value">{totalColumns}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Memory Usage:</span>
            <span className="summary-value">~{approxMemoryUsage.toFixed(1)} KB</span>
          </div>
        </div>

        <div className="columns-table">
          <h6>Column Details</h6>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Data Type</th>
                  <th>Missing</th>
                  <th>% Missing</th>
                </tr>
              </thead>
              <tbody>
                {columnInfo.map((col, index) => (
                  <tr key={index}>
                    <td><code>{col.name}</code></td>
                    <td>
                      <span className={`badge bg-${col.dataType === 'numeric' ? 'success' : col.dataType === 'date' ? 'info' : 'secondary'}`}>
                        {col.dataType}
                      </span>
                    </td>
                    <td>{col.missingCount}</td>
                    <td>{col.missingPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetInfo;
