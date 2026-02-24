import React, { useState } from 'react';

const SidebarControls = ({ data, onAddChart, selectedChart, onUpdateChart }) => {
  const [chartType, setChartType] = useState('bar');
  const [chartConfig, setChartConfig] = useState({
    title: '',
    xAxis: '',
    yAxis: '',
    legend: '',
    size: '',
    color: '',
    aggregation: 'sum',
    orientation: 'vertical',
    smooth: false,
    stack: false,
    showLabels: true,
    radius: 50,
    innerRadius: 0,
    binCount: 10,
    showLegend: true,
    showTooltip: true
  });

  const chartTypes = [
    { value: 'bar', label: '📊 Bar Chart', category: 'basic' },
    { value: 'line', label: '📈 Line Chart', category: 'basic' },
    { value: 'pie', label: '🥧 Pie Chart', category: 'circular' },
    { value: 'area', label: '📉 Area Chart', category: 'basic' },
    { value: 'scatter', label: '🔵 Scatter Plot', category: 'correlation' },
    { value: 'donut', label: '🍩 Donut Chart', category: 'circular' },
    { value: 'stackedBar', label: '📊 Stacked Bar', category: 'comparison' },
    { value: 'multiLine', label: '📈 Multi-Line', category: 'trend' },
    { value: 'heatmap', label: '🔥 Heatmap', category: 'matrix' },
    { value: 'histogram', label: '📊 Histogram', category: 'distribution' },
    { value: 'bubble', label: '🫧 Bubble Chart', category: 'correlation' },
    { value: 'radar', label: '⭐ Radar Chart', category: 'comparison' },
    { value: 'funnel', label: '🔽 Funnel Chart', category: 'process' },
    { value: 'boxplot', label: '📦 Box Plot', category: 'distribution' },
    { value: 'combo', label: '📊 Combo Chart', category: 'mixed' }
  ];

  const columns = data ? Object.keys(data[0]) : [];
  const numericColumns = columns.filter(col =>
    data && data.every(row => !isNaN(Number(row[col])) && row[col] !== '')
  );
  const categoricalColumns = columns.filter(col => !numericColumns.includes(col));

  const handleChartTypeChange = (newType) => {
    setChartType(newType);
    // Reset config when chart type changes
    const defaultConfig = {
      xAxis: '',
      yAxis: '',
      legend: '',
      size: '',
      color: '',
      aggregation: 'sum',
      title: '',
      showLegend: true,
      showTooltip: true,
      showLabels: false,
      orientation: 'vertical',
      smooth: false,
      stack: false,
      radius: 60,
      innerRadius: 30,
      binCount: 10
    };
    setChartConfig(defaultConfig);
    if (selectedChart) {
      onUpdateChart(selectedChart.id, defaultConfig);
    }
  };

  const handleConfigChange = (field, value) => {
    const newConfig = { ...chartConfig, [field]: value };
    setChartConfig(newConfig);
    if (selectedChart) {
      onUpdateChart(selectedChart.id, newConfig);
    }
  };

  const handleAddChart = () => {
    if (!chartConfig.title) {
      alert('Please enter a chart title');
      return;
    }

    // Validate required fields based on chart type
    const requiredFields = getRequiredFields(chartType);
    const missingFields = requiredFields.filter(field => !chartConfig[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    onAddChart({
      type: chartType,
      ...chartConfig
    });

    // Reset form
    setChartConfig({
      title: '',
      xAxis: '',
      yAxis: '',
      legend: '',
      size: '',
      color: '',
      aggregation: 'sum',
      orientation: 'vertical',
      smooth: false,
      stack: false,
      showLabels: true,
      radius: 50,
      innerRadius: 0,
      binCount: 10,
      showLegend: true,
      showTooltip: true
    });
  };

  const getRequiredFields = (type) => {
    const requirements = {
      bar: ['xAxis', 'yAxis'],
      line: ['xAxis', 'yAxis'],
      pie: ['xAxis', 'yAxis'],
      area: ['xAxis', 'yAxis'],
      scatter: ['xAxis', 'yAxis'],
      donut: ['xAxis', 'yAxis'],
      stackedBar: ['xAxis', 'yAxis', 'legend'],
      multiLine: ['xAxis', 'yAxis', 'legend'],
      heatmap: ['xAxis', 'yAxis'],
      histogram: ['xAxis'],
      bubble: ['xAxis', 'yAxis', 'size'],
      radar: ['xAxis', 'yAxis'],
      funnel: ['xAxis', 'yAxis'],
      boxplot: ['xAxis', 'yAxis'],
      combo: ['xAxis', 'yAxis']
    };
    return requirements[type] || [];
  };

  const renderFieldGroup = (title, fields) => (
    <div className="field-group mb-4">
      <h6 className="field-group-title">{title}</h6>
      {fields}
    </div>
  );

  const renderConfigFields = () => {
    const fields = [];

    // Basic Configuration
    fields.push(
      renderFieldGroup('📝 Basic Settings', [
        <div key="title" className="mb-3">
          <label className="form-label fw-bold">Chart Title *</label>
          <input
            type="text"
            className="form-control"
            value={chartConfig.title}
            onChange={(e) => handleConfigChange('title', e.target.value)}
            placeholder="Enter descriptive chart title"
          />
        </div>
      ])
    );

    // Data Fields Configuration
    const dataFields = [];

    // X-Axis (required for most charts)
    if (!['pie', 'donut'].includes(chartType)) {
      dataFields.push(
        <div key="xAxis" className="mb-3">
          <label className="form-label fw-bold">X-Axis Field *</label>
          <select
            className="form-select"
            value={chartConfig.xAxis}
            onChange={(e) => handleConfigChange('xAxis', e.target.value)}
          >
            <option value="">Select field</option>
            {columns.map(col => (
              <option key={col} value={col}>
                {col} {numericColumns.includes(col) ? '(📊)' : '(📝)'}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Y-Axis (required for most charts)
    if (!['heatmap', 'radar'].includes(chartType)) {
      dataFields.push(
        <div key="yAxis" className="mb-3">
          <label className="form-label fw-bold">Y-Axis Field *</label>
          <select
            className="form-select"
            value={chartConfig.yAxis}
            onChange={(e) => handleConfigChange('yAxis', e.target.value)}
          >
            <option value="">Select field</option>
            {numericColumns.map(col => (
              <option key={col} value={col}>{col} (📊)</option>
            ))}
          </select>
        </div>
      );
    }

    // Category field for circular charts
    if (['pie', 'donut'].includes(chartType)) {
      dataFields.push(
        <div key="xAxis" className="mb-3">
          <label className="form-label fw-bold">Category Field *</label>
          <select
            className="form-select"
            value={chartConfig.xAxis}
            onChange={(e) => handleConfigChange('xAxis', e.target.value)}
          >
            <option value="">Select field</option>
            {categoricalColumns.map(col => (
              <option key={col} value={col}>{col} (📝)</option>
            ))}
          </select>
        </div>,
        <div key="yAxis" className="mb-3">
          <label className="form-label fw-bold">Value Field *</label>
          <select
            className="form-select"
            value={chartConfig.yAxis}
            onChange={(e) => handleConfigChange('yAxis', e.target.value)}
          >
            <option value="">Select field</option>
            {numericColumns.map(col => (
              <option key={col} value={col}>{col} (📊)</option>
            ))}
          </select>
        </div>
      );
    }

    // Legend field for multi-series charts
    if (['stackedBar', 'multiLine', 'radar', 'combo'].includes(chartType)) {
      dataFields.push(
        <div key="legend" className="mb-3">
          <label className="form-label fw-bold">Legend Field *</label>
          <select
            className="form-select"
            value={chartConfig.legend}
            onChange={(e) => handleConfigChange('legend', e.target.value)}
          >
            <option value="">Select field</option>
            {categoricalColumns.map(col => (
              <option key={col} value={col}>{col} (📝)</option>
            ))}
          </select>
        </div>
      );
    }

    // Size field for bubble/scatter
    if (['scatter', 'bubble'].includes(chartType)) {
      dataFields.push(
        <div key="size" className="mb-3">
          <label className="form-label fw-bold">Size Field</label>
          <select
            className="form-select"
            value={chartConfig.size}
            onChange={(e) => handleConfigChange('size', e.target.value)}
          >
            <option value="">Select field (optional)</option>
            {numericColumns.map(col => (
              <option key={col} value={col}>{col} (📊)</option>
            ))}
          </select>
        </div>
      );
    }

    // Color field for grouping
    if (['scatter', 'bubble', 'heatmap'].includes(chartType)) {
      dataFields.push(
        <div key="color" className="mb-3">
          <label className="form-label fw-bold">Color Field</label>
          <select
            className="form-select"
            value={chartConfig.color}
            onChange={(e) => handleConfigChange('color', e.target.value)}
          >
            <option value="">Select field (optional)</option>
            {categoricalColumns.map(col => (
              <option key={col} value={col}>{col} (📝)</option>
            ))}
          </select>
        </div>
      );
    }

    if (dataFields.length > 0) {
      fields.push(renderFieldGroup('📊 Data Fields', dataFields));
    }

    // Aggregation & Calculation
    if (['bar', 'line', 'area', 'stackedBar', 'multiLine', 'histogram', 'combo'].includes(chartType)) {
      fields.push(
        renderFieldGroup('🧮 Aggregation', [
          <div key="aggregation" className="mb-3">
            <label className="form-label fw-bold">Aggregation Method</label>
            <select
              className="form-select"
              value={chartConfig.aggregation}
              onChange={(e) => handleConfigChange('aggregation', e.target.value)}
            >
              <option value="sum">Sum (∑)</option>
              <option value="avg">Average (μ)</option>
              <option value="count">Count (n)</option>
              <option value="min">Minimum (min)</option>
              <option value="max">Maximum (max)</option>
              <option value="median">Median (median)</option>
            </select>
          </div>
        ])
      );
    }

    // Chart-specific options
    const chartOptions = [];

    // Orientation for bar charts
    if (['bar', 'stackedBar'].includes(chartType)) {
      chartOptions.push(
        <div key="orientation" className="mb-3">
          <label className="form-label fw-bold">Orientation</label>
          <select
            className="form-select"
            value={chartConfig.orientation}
            onChange={(e) => handleConfigChange('orientation', e.target.value)}
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </div>
      );
    }

    // Smooth line option
    if (['line', 'area', 'multiLine'].includes(chartType)) {
      chartOptions.push(
        <div key="smooth" className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="smoothCheck"
            checked={chartConfig.smooth}
            onChange={(e) => handleConfigChange('smooth', e.target.checked)}
          />
          <label className="form-check-label fw-bold" htmlFor="smoothCheck">
            Smooth Lines
          </label>
        </div>
      );
    }

    // Stack option for area charts
    if (['area', 'stackedBar'].includes(chartType)) {
      chartOptions.push(
        <div key="stack" className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="stackCheck"
            checked={chartConfig.stack}
            onChange={(e) => handleConfigChange('stack', e.target.checked)}
          />
          <label className="form-check-label fw-bold" htmlFor="stackCheck">
            Stack Values
          </label>
        </div>
      );
    }

    // Radius for circular charts
    if (['pie', 'donut'].includes(chartType)) {
      chartOptions.push(
        <div key="radius" className="mb-3">
          <label className="form-label fw-bold">Radius (%)</label>
          <input
            type="range"
            className="form-range"
            min="30"
            max="80"
            value={chartConfig.radius}
            onChange={(e) => handleConfigChange('radius', parseInt(e.target.value))}
          />
          <small className="text-muted">{chartConfig.radius}%</small>
        </div>
      );
    }

    // Inner radius for donut
    if (chartType === 'donut') {
      chartOptions.push(
        <div key="innerRadius" className="mb-3">
          <label className="form-label fw-bold">Inner Radius (%)</label>
          <input
            type="range"
            className="form-range"
            min="0"
            max="60"
            value={chartConfig.innerRadius}
            onChange={(e) => handleConfigChange('innerRadius', parseInt(e.target.value))}
          />
          <small className="text-muted">{chartConfig.innerRadius}%</small>
        </div>
      );
    }

    // Bin count for histogram
    if (chartType === 'histogram') {
      chartOptions.push(
        <div key="binCount" className="mb-3">
          <label className="form-label fw-bold">Number of Bins</label>
          <input
            type="range"
            className="form-range"
            min="5"
            max="50"
            value={chartConfig.binCount}
            onChange={(e) => handleConfigChange('binCount', parseInt(e.target.value))}
          />
          <small className="text-muted">{chartConfig.binCount} bins</small>
        </div>
      );
    }

    if (chartOptions.length > 0) {
      fields.push(renderFieldGroup('⚙️ Chart Options', chartOptions));
    }

    // Display options
    fields.push(
      renderFieldGroup('👁️ Display Options', [
        <div key="showLegend" className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="legendCheck"
            checked={chartConfig.showLegend}
            onChange={(e) => handleConfigChange('showLegend', e.target.checked)}
          />
          <label className="form-check-label fw-bold" htmlFor="legendCheck">
            Show Legend
          </label>
        </div>,
        <div key="showTooltip" className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="tooltipCheck"
            checked={chartConfig.showTooltip}
            onChange={(e) => handleConfigChange('showTooltip', e.target.checked)}
          />
          <label className="form-check-label fw-bold" htmlFor="tooltipCheck">
            Show Tooltips
          </label>
        </div>,
        <div key="showLabels" className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="labelsCheck"
            checked={chartConfig.showLabels}
            onChange={(e) => handleConfigChange('showLabels', e.target.checked)}
          />
          <label className="form-check-label fw-bold" htmlFor="labelsCheck">
            Show Data Labels
          </label>
        </div>
      ])
    );

    return fields;
  };

  return (
    <div className="sidebar-controls">
      <div className="sidebar-header">
        <h5 className="mb-0">🎨 Chart Builder</h5>
        <small className="text-muted">PowerBI-style configuration</small>
      </div>
      <div className="sidebar-content">
        <div className="mb-4">
          <label className="form-label fw-bold">Chart Type</label>
          <select
            className="form-select form-select-lg"
            value={chartType}
            onChange={(e) => handleChartTypeChange(e.target.value)}
          >
            {chartTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="config-fields">
          {renderConfigFields()}
        </div>

        <div className="d-grid">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleAddChart}
            disabled={!data}
          >
            ➕ Add Chart
          </button>
        </div>

        {selectedChart && (
          <div className="mt-3 p-3 bg-light rounded">
            <small className="text-muted">
              💡 Editing: <strong>{selectedChart.title}</strong>
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarControls;