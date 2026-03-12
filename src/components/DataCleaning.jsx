import React from 'react';

const DataCleaning = ({ data, onDataClean }) => {
  const removeNulls = () => {
    const cleaned = data.filter(row => {
      return Object.values(row).every(value => value !== null && value !== undefined && value !== '');
    });
    onDataClean(cleaned);
  };

  const removeDuplicates = () => {
    const seen = new Set();
    const cleaned = data.filter(row => {
      const key = JSON.stringify(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    onDataClean(cleaned);
  };

  const detectNumericColumns = () => {
    if (!data || data.length === 0) return;
    const columns = Object.keys(data[0]);
    const numericColumns = columns.filter(col => {
      return data.slice(0, 10).every(row => !isNaN(Number(row[col])));
    });
    alert(`Numeric columns: ${numericColumns.join(', ')}`);
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5>Data Cleaning</h5>
      </div>
      <div className="card-body">
        <button className="btn btn-primary me-2" onClick={removeNulls}>
          Remove Null Values
        </button>
        <button className="btn btn-primary me-2" onClick={removeDuplicates}>
          Remove Duplicates
        </button>
        <button className="btn btn-info" onClick={detectNumericColumns}>
          Detect Numeric Columns
        </button>
      </div>
    </div>
  );
};

export default DataCleaning;
