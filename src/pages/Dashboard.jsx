import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import DataTable from '../components/DataTable';
import DataCleaningPanel from '../components/DataCleaningPanel';
import DatasetInfo from '../components/DatasetInfo';
import DatasetDescribe from '../components/DatasetDescribe';
import ChartBuilder from '../components/ChartBuilder';
import SidebarControls from '../components/SidebarControls';
import { parseFile } from '../services/parserService';
import { generatePDFReport } from '../services/pdfService';
import * as XLSX from 'xlsx';

function Dashboard() {
  const [data, setData] = useState(null);
  const [cleanedData, setCleanedData] = useState(null);
  const [charts, setCharts] = useState([]);
  const [selectedChart, setSelectedChart] = useState(null);

  const handleFileUpload = async (file) => {
    try {
      const parsedData = await parseFile(file);
      setData(parsedData);
      setCleanedData(parsedData);
      setCharts([]);
      setSelectedChart(null);
    } catch (error) {
      alert('Error parsing file: ' + error.message);
    }
  };

  const handleDataClean = (newData, cleaningResults, actionType) => {
    setCleanedData(newData);
    // Show cleaning results for specific action only
    if (actionType === 'removeNulls') {
      if (cleaningResults.nullsRemoved > 0) {
        alert(`${cleaningResults.nullsRemoved} null rows removed`);
      } else {
        alert('No null values found');
      }
    } else if (actionType === 'removeDuplicates') {
      if (cleaningResults.duplicatesRemoved > 0) {
        alert(`${cleaningResults.duplicatesRemoved} duplicate rows removed`);
      } else {
        alert('No duplicate rows found');
      }
    } else if (actionType === 'convertDataType') {
      alert(`Column "${cleaningResults.column}" converted to ${cleaningResults.targetType}`);
    } else if (actionType === 'treatNulls') {
      alert(`${cleaningResults.rowsAffected} rows treated with ${cleaningResults.treatment}`);
    }
  };

  const handleAddChart = (chartConfig) => {
    const newChart = {
      id: Date.now(),
      ...chartConfig,
    };
    setCharts([...charts, newChart]);
  };

  const handleUpdateChart = (chartId, updates) => {
    setCharts(charts.map(chart =>
      chart.id === chartId ? { ...chart, ...updates } : chart
    ));
  };

  const handleDeleteChart = (chartId) => {
    setCharts(charts.filter(chart => chart.id !== chartId));
    if (selectedChart && selectedChart.id === chartId) {
      setSelectedChart(null);
    }
  };

  const downloadCleanData = (format) => {
    if (!currentData || currentData.length === 0) {
      alert('No data available to download');
      return;
    }

    if (format === 'csv') {
      // Download as CSV
      const headers = Object.keys(currentData[0]);
      const csvContent = [
        headers.join(','),
        ...currentData.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'cleaned_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'excel') {
      // Download as Excel
      const ws = XLSX.utils.json_to_sheet(currentData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cleaned Data');
      XLSX.writeFile(wb, 'cleaned_data.xlsx');
    }
  };

  const currentData = cleanedData || data;

  return (
    <div className="dashboard-container">
      <div className="row g-0">
        {/* Sidebar Controls */}
        <div className="col-md-3 sidebar">
          <SidebarControls
            data={currentData}
            onAddChart={handleAddChart}
            selectedChart={selectedChart}
            onUpdateChart={handleUpdateChart}
          />
        </div>

        {/* Main Content */}
        <div className="col-md-9 main-content">
          <div className="container-fluid">
            {/* File Upload */}
            {!currentData && (
              <div className="upload-section">
                <FileUpload onFileUpload={handleFileUpload} />
              </div>
            )}

            {currentData && (
              <>
                {/* Dataset Information */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <DatasetInfo data={currentData} />
                  </div>
                  <div className="col-md-6">
                    <DatasetDescribe data={currentData} />
                  </div>
                </div>

                {/* Data Cleaning */}
                <DataCleaningPanel
                  data={currentData}
                  onDataClean={handleDataClean}
                />

                {/* Data Table */}
                <DataTable data={currentData} />

                {/* Charts Dashboard */}
                <div className="charts-dashboard">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="section-title mb-0">Interactive Dashboard</h4>
                    <div className="d-flex gap-2">
                      <div className="dropdown">
                        <button
                          className="btn btn-primary dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          disabled={!currentData || currentData.length === 0}
                        >
                          📥 Download Clean Data
                        </button>
                        <ul className="dropdown-menu">
                          <li><a className="dropdown-item" href="#" onClick={() => downloadCleanData('csv')}>📄 CSV Format</a></li>
                          <li><a className="dropdown-item" href="#" onClick={() => downloadCleanData('excel')}>📊 Excel Format</a></li>
                        </ul>
                      </div>
                      <button
                        className="btn btn-success"
                        onClick={() => generatePDFReport(currentData, charts)}
                        disabled={!currentData || charts.length === 0}
                      >
                        📄 Export PDF Report
                      </button>
                    </div>
                  </div>
                  <div className="charts-grid">
                    {charts.map(chart => (
                      <ChartBuilder
                        key={chart.id}
                        chart={chart}
                        data={currentData}
                        onUpdate={(updates) => handleUpdateChart(chart.id, updates)}
                        onDelete={() => handleDeleteChart(chart.id)}
                        onSelect={() => setSelectedChart(chart)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;