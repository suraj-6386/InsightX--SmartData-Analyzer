import React, { useState } from 'react';
import { treatOutliers } from '../utils/cleaningUtils';

const DataCleaningPanel = ({ data, onDataClean }) => {
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showTreatNullModal, setShowTreatNullModal] = useState(false);
  const [showOutlierModal, setShowOutlierModal] = useState(false);
  const [convertConfig, setConvertConfig] = useState({ column: '', targetType: '' });
  const [treatNullConfig, setTreatNullConfig] = useState({ treatment: '' });
  const [outlierConfig, setOutlierConfig] = useState({ column: '', method: '' });

  const removeNulls = () => {
    const originalLength = data.length;
    const cleaned = data.filter(row => {
      return Object.values(row).every(value =>
        value !== null && value !== undefined && value !== '' && value !== 'null' && value !== 'NULL'
      );
    });
    const nullsRemoved = originalLength - cleaned.length;
    onDataClean(cleaned, { nullsRemoved }, 'removeNulls');
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
    onDataClean(cleaned, { duplicatesRemoved }, 'removeDuplicates');
  };

  const handleConvertDataType = () => {
    if (!convertConfig.column || !convertConfig.targetType) {
      alert('Please select both column and target data type');
      return;
    }

    const cleaned = data.map(row => {
      const newRow = { ...row };
      const value = row[convertConfig.column];

      if (value !== null && value !== undefined && value !== '') {
        switch (convertConfig.targetType) {
          case 'Number':
            newRow[convertConfig.column] = Number(value);
            break;
          case 'String':
            newRow[convertConfig.column] = String(value);
            break;
          case 'Date':
            newRow[convertConfig.column] = new Date(value).toISOString().split('T')[0];
            break;
          case 'Boolean':
            newRow[convertConfig.column] = Boolean(value);
            break;
          default:
            break;
        }
      }

      return newRow;
    });

    onDataClean(cleaned, {
      column: convertConfig.column,
      targetType: convertConfig.targetType
    }, 'convertDataType');

    setShowConvertModal(false);
    setConvertConfig({ column: '', targetType: '' });
  };

  const handleTreatNulls = () => {
    if (!treatNullConfig.treatment) {
      alert('Please select a treatment method');
      return;
    }

    const columns = Object.keys(data[0]);
    let rowsAffected = 0;

    const cleaned = data.map(row => {
      const newRow = { ...row };
      let rowModified = false;

      columns.forEach(col => {
        const value = row[col];
        if (value === null || value === undefined || value === '' || value === 'null' || value === 'NULL') {
          switch (treatNullConfig.treatment) {
            case 'mean': {
              
              const numericValues = data.map(r => r[col]).filter(v =>
                v !== null && v !== undefined && v !== '' && v !== 'null' && v !== 'NULL' && !isNaN(Number(v))
              ).map(v => Number(v));
              if (numericValues.length > 0) {
                newRow[col] = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
                rowModified = true;
              }
              break;
            }
            case 'median': {
              const sortedValues = data.map(r => r[col]).filter(v =>
                v !== null && v !== undefined && v !== '' && v !== 'null' && v !== 'NULL' && !isNaN(Number(v))
              ).map(v => Number(v)).sort((a, b) => a - b);
              if (sortedValues.length > 0) {
                const mid = Math.floor(sortedValues.length / 2);
                newRow[col] = sortedValues.length % 2 !== 0 ? sortedValues[mid] : (sortedValues[mid - 1] + sortedValues[mid]) / 2;
                rowModified = true;
              }
              break;
            }
            case 'mode': {
              const valueCounts = {};
              data.forEach(r => {
                const v = r[col];
                if (v !== null && v !== undefined && v !== '' && v !== 'null' && v !== 'NULL') {
                  valueCounts[v] = (valueCounts[v] || 0) + 1;
                }
              });
              const mode = Object.keys(valueCounts).reduce((a, b) => valueCounts[a] > valueCounts[b] ? a : b);
              newRow[col] = mode;
              rowModified = true;
              break;
            }
            case 'zero':
              newRow[col] = 0;
              rowModified = true;
              break;
            case 'blank':
              newRow[col] = '';
              rowModified = true;
              break;
            case 'remove':
              
              break;
            default:
              break;
          }
        }
      });

      if (rowModified) rowsAffected++;
      return newRow;
    });

    
    let finalData = cleaned;
    if (treatNullConfig.treatment === 'remove') {
      finalData = cleaned.filter(row => {
        return !Object.values(row).some(value =>
          value === null || value === undefined || value === '' || value === 'null' || value === 'NULL'
        );
      });
      rowsAffected = cleaned.length - finalData.length;
    }

    onDataClean(finalData, {
      treatment: treatNullConfig.treatment,
      rowsAffected
    }, 'treatNulls');

    setShowTreatNullModal(false);
    setTreatNullConfig({ treatment: '' });
  };

  const handleTreatOutliers = () => {
    if (!outlierConfig.column || !outlierConfig.method) {
      alert('Please select both column and treatment method');
      return;
    }

    const { data: cleaned, treatedCount } = treatOutliers(data, outlierConfig.column, outlierConfig.method);
    onDataClean(cleaned, { column: outlierConfig.column, method: outlierConfig.method, treatedCount }, 'treatOutliers');

    setShowOutlierModal(false);
    setOutlierConfig({ column: '', method: '' });
  };

  const columns = data ? Object.keys(data[0]) : [];
  const numericColumns = columns.filter(col => {
    const vals = data?.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '');
    const numericVals = vals?.filter(v => !isNaN(Number(v)));
    return numericVals && numericVals.length / vals.length >= 0.8;
  });

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
          </div>

          <div className="col-md-6 col-lg-4">
            <button className="btn btn-outline-warning w-100" onClick={removeDuplicates}>
              🔄 Remove Duplicates
            </button>
          </div>

          <div className="col-md-6 col-lg-4">
            <button className="btn btn-outline-primary w-100" onClick={() => setShowConvertModal(true)}>
              🔄 Convert Data Type
            </button>
          </div>

          <div className="col-md-6 col-lg-4">
            <button className="btn btn-outline-success w-100" onClick={() => setShowTreatNullModal(true)}>
              🔧 Treat Null Values
            </button>
          </div>

          <div className="col-md-6 col-lg-4">
            <button className="btn btn-outline-danger w-100" onClick={() => setShowOutlierModal(true)}>
              📊 Treat Outliers
            </button>
          </div>
        </div>

        {}
        {showConvertModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Convert Data Type</h5>
                  <button type="button" className="btn-close" onClick={() => setShowConvertModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Select Column</label>
                    <select
                      className="form-select"
                      value={convertConfig.column}
                      onChange={(e) => setConvertConfig({...convertConfig, column: e.target.value})}
                    >
                      <option value="">Choose column</option>
                      {columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Target Data Type</label>
                    <select
                      className="form-select"
                      value={convertConfig.targetType}
                      onChange={(e) => setConvertConfig({...convertConfig, targetType: e.target.value})}
                    >
                      <option value="">Choose type</option>
                      <option value="Number">Number</option>
                      <option value="String">String</option>
                      <option value="Date">Date</option>
                      <option value="Boolean">Boolean</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowConvertModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={handleConvertDataType}>Convert</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {}
        {showTreatNullModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Treat Null Values</h5>
                  <button type="button" className="btn-close" onClick={() => setShowTreatNullModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Treatment Method</label>
                    <select
                      className="form-select"
                      value={treatNullConfig.treatment}
                      onChange={(e) => setTreatNullConfig({...treatNullConfig, treatment: e.target.value})}
                    >
                      <option value="">Choose treatment</option>
                      <option value="mean">Fill with Mean (numeric)</option>
                      <option value="median">Fill with Median</option>
                      <option value="mode">Fill with Mode</option>
                      <option value="zero">Fill with Zero</option>
                      <option value="blank">Fill with Blank</option>
                      <option value="remove">Remove Rows</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTreatNullModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={handleTreatNulls}>Apply Treatment</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showOutlierModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Treat Outliers (IQR Method)</h5>
                  <button type="button" className="btn-close" onClick={() => setShowOutlierModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Select Numeric Column</label>
                    <select
                      className="form-select"
                      value={outlierConfig.column}
                      onChange={(e) => setOutlierConfig({...outlierConfig, column: e.target.value})}
                    >
                      <option value="">Choose column</option>
                      {numericColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Treatment Method</label>
                    <select
                      className="form-select"
                      value={outlierConfig.method}
                      onChange={(e) => setOutlierConfig({...outlierConfig, method: e.target.value})}
                    >
                      <option value="">Choose method</option>
                      <option value="cap">Cap to Fence Values</option>
                      <option value="remove">Remove Outlier Rows</option>
                      <option value="mean">Replace with Mean</option>
                      <option value="median">Replace with Median</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowOutlierModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={handleTreatOutliers}>Apply Treatment</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataCleaningPanel;
