import React, { useState } from 'react';

const DataCleaningPanel = ({ data, onDataClean }) => {
  const [cleaningResults, setCleaningResults] = useState({
    nullsRemoved: 0,
    duplicatesRemoved: 0,
    spacesTrimmed: 0,
    numericConverted: 0,
    dateConverted: 0,
    valuesFilled: 0
  });

  const removeNulls = () => {
    const originalLength = data.length;
    const cleaned = data.filter(row => {
      return Object.values(row).every(value =>
        value !== null && value !== undefined && value !== '' && value !== 'null' && value !== 'NULL'
      );
    });
    const nullsRemoved = originalLength - cleaned.length;
    const newResults = { ...cleaningResults, nullsRemoved };
    setCleaningResults(newResults);
    onDataClean(cleaned, newResults);

    if (nullsRemoved > 0) {
      alert(`${nullsRemoved} null rows removed`);
    } else {
      alert('No null values found');
    }
  };

  const removeDuplicates = () => {
    const originalLength = data.length;
    const seen = new Set();
    const cleaned = data.filter(row => {
      const key = JSON.stringify(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const duplicatesRemoved = originalLength - cleaned.length;
    const newResults = { ...cleaningResults, duplicatesRemoved };
    setCleaningResults(newResults);
    onDataClean(cleaned, newResults);

    if (duplicatesRemoved > 0) {
      alert(`${duplicatesRemoved} duplicate rows removed`);
    } else {
      alert('No duplicate rows found');
    }
  };

  const trimSpaces = () => {
    let trimmedCount = 0;
    const cleaned = data.map(row => {
      const newRow = {};
      Object.keys(row).forEach(key => {
        const value = row[key];
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed !== value) trimmedCount++;
          newRow[key] = trimmed;
        } else {
          newRow[key] = value;
        }
      });
      return newRow;
    });

    const newResults = { ...cleaningResults, spacesTrimmed: trimmedCount };
    setCleaningResults(newResults);
    onDataClean(cleaned, newResults);

    if (trimmedCount > 0) {
      alert(`${trimmedCount} spaces trimmed from string values`);
    } else {
      alert('No extra spaces found to trim');
    }
  };

  const convertNumericColumns = () => {
    if (!data || data.length === 0) return;

    const columns = Object.keys(data[0]);
    let convertedCount = 0;
    const cleaned = data.map(row => {
      const newRow = { ...row };
      columns.forEach(col => {
        const value = row[col];
        if (value !== null && value !== undefined && value !== '') {
          const numValue = Number(value);
          if (!isNaN(numValue) && value.toString() !== numValue.toString()) {
            newRow[col] = numValue;
            convertedCount++;
          }
        }
      });
      return newRow;
    });

    const newResults = { ...cleaningResults, numericConverted: convertedCount };
    setCleaningResults(newResults);
    onDataClean(cleaned, newResults);

    if (convertedCount > 0) {
      alert(`${convertedCount} values converted to numeric type`);
    } else {
      alert('No values needed numeric conversion');
    }
  };

  const convertDateColumns = () => {
    if (!data || data.length === 0) return;

    const columns = Object.keys(data[0]);
    let convertedCount = 0;
    const cleaned = data.map(row => {
      const newRow = { ...row };
      columns.forEach(col => {
        const value = row[col];
        if (value !== null && value !== undefined && value !== '') {
          const dateValue = new Date(value);
          if (!isNaN(dateValue.getTime()) && value.toString() !== dateValue.toISOString()) {
            newRow[col] = dateValue.toISOString().split('T')[0]; // Store as YYYY-MM-DD
            convertedCount++;
          }
        }
      });
      return newRow;
    });

    const newResults = { ...cleaningResults, dateConverted: convertedCount };
    setCleaningResults(newResults);
    onDataClean(cleaned, newResults);

    if (convertedCount > 0) {
      alert(`${convertedCount} values converted to date format`);
    } else {
      alert('No values needed date conversion');
    }
  };

  const fillMissingValues = () => {
    if (!data || data.length === 0) return;

    const columns = Object.keys(data[0]);
    let filledCount = 0;
    const cleaned = data.map(row => {
      const newRow = { ...row };
      columns.forEach(col => {
        const value = row[col];
        if (value === null || value === undefined || value === '' || value === 'null' || value === 'NULL') {
          // For numeric columns, fill with mean; for others, fill with 'Unknown'
          const columnValues = data.map(r => r[col]).filter(v =>
            v !== null && v !== undefined && v !== '' && v !== 'null' && v !== 'NULL'
          );

          if (columnValues.length > 0 && columnValues.every(v => !isNaN(Number(v)))) {
            // Numeric column - fill with mean
            const numericValues = columnValues.map(v => Number(v));
            const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
            newRow[col] = mean;
          } else {
            // Non-numeric column - fill with 'Unknown'
            newRow[col] = 'Unknown';
          }
          filledCount++;
        }
      });
      return newRow;
    });

    const newResults = { ...cleaningResults, valuesFilled: filledCount };
    setCleaningResults(newResults);
    onDataClean(cleaned, newResults);

    if (filledCount > 0) {
      alert(`${filledCount} missing values filled`);
    } else {
      alert('No missing values found to fill');
    }
  };

  return (
    <div className="data-cleaning-panel">
      <div className="card-header">
        <h5 className="card-title">🧹 Data Cleaning</h5>
        <small className="text-muted">Clean and prepare your data for analysis</small>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6 col-lg-4">
            <button className="btn btn-outline-danger w-100" onClick={removeNulls}>
              🗑️ Remove Null Values
            </button>
            {cleaningResults.nullsRemoved > 0 && (
              <div className="alert alert-danger small mt-2">
                {cleaningResults.nullsRemoved} null rows removed
              </div>
            )}
          </div>

          <div className="col-md-6 col-lg-4">
            <button className="btn btn-outline-warning w-100" onClick={removeDuplicates}>
              🔄 Remove Duplicates
            </button>
            {cleaningResults.duplicatesRemoved > 0 && (
              <div className="alert alert-warning small mt-2">
                {cleaningResults.duplicatesRemoved} duplicates removed
              </div>
            )}
          </div>

          <div className="col-md-6 col-lg-4">
            <button className="btn btn-outline-info w-100" onClick={trimSpaces}>
              ✂️ Trim Spaces
            </button>
            {cleaningResults.spacesTrimmed > 0 && (
              <div className="alert alert-info small mt-2">
                {cleaningResults.spacesTrimmed} spaces trimmed
              </div>
            )}
          </div>

          <div className="col-md-6 col-lg-4">
            <button className="btn btn-outline-success w-100" onClick={convertNumericColumns}>
              🔢 Convert Numeric
            </button>
            {cleaningResults.numericConverted > 0 && (
              <div className="alert alert-success small mt-2">
                {cleaningResults.numericConverted} values converted
              </div>
            )}
          </div>

          <div className="col-md-6 col-lg-4">
            <button className="btn btn-outline-primary w-100" onClick={convertDateColumns}>
              📅 Convert Dates
            </button>
            {cleaningResults.dateConverted > 0 && (
              <div className="alert alert-primary small mt-2">
                {cleaningResults.dateConverted} values converted
              </div>
            )}
          </div>

          <div className="col-md-6 col-lg-4">
            <button className="btn btn-outline-secondary w-100" onClick={fillMissingValues}>
              🔧 Fill Missing Values
            </button>
            {cleaningResults.valuesFilled > 0 && (
              <div className="alert alert-secondary small mt-2">
                {cleaningResults.valuesFilled} values filled
              </div>
            )}
          </div>
        </div>

        {(cleaningResults.nullsRemoved > 0 || cleaningResults.duplicatesRemoved > 0 ||
          cleaningResults.spacesTrimmed > 0 || cleaningResults.numericConverted > 0 ||
          cleaningResults.dateConverted > 0 || cleaningResults.valuesFilled > 0) && (
          <div className="mt-3 p-3 bg-light rounded">
            <h6>Cleaning Summary:</h6>
            <ul className="list-unstyled small mb-0">
              {cleaningResults.nullsRemoved > 0 && <li>• {cleaningResults.nullsRemoved} null rows removed</li>}
              {cleaningResults.duplicatesRemoved > 0 && <li>• {cleaningResults.duplicatesRemoved} duplicate rows removed</li>}
              {cleaningResults.spacesTrimmed > 0 && <li>• {cleaningResults.spacesTrimmed} spaces trimmed</li>}
              {cleaningResults.numericConverted > 0 && <li>• {cleaningResults.numericConverted} values converted to numeric</li>}
              {cleaningResults.dateConverted > 0 && <li>• {cleaningResults.dateConverted} values converted to dates</li>}
              {cleaningResults.valuesFilled > 0 && <li>• {cleaningResults.valuesFilled} missing values filled</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataCleaningPanel;