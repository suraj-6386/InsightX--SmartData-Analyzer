export const chartTypeOptions = [
  { value: 'bar', label: 'Bar Chart', category: 'Basic' },
  { value: 'line', label: 'Line Chart', category: 'Basic' },
  { value: 'pie', label: 'Pie Chart', category: 'Basic' },
  { value: 'area', label: 'Area Chart', category: 'Basic' },
  { value: 'scatter', label: 'Scatter Plot', category: 'Advanced' },
  { value: 'donut', label: 'Donut Chart', category: 'Basic' },
  { value: 'stackedBar', label: 'Stacked Bar', category: 'Advanced' },
  { value: 'multiLine', label: 'Multi-Line Chart', category: 'Advanced' },
  { value: 'heatmap', label: 'Heatmap', category: 'Advanced' },
  { value: 'histogram', label: 'Histogram', category: 'Advanced' },
  { value: 'bubble', label: 'Bubble Chart', category: 'Advanced' },
  { value: 'radar', label: 'Radar Chart', category: 'Advanced' },
  { value: 'funnel', label: 'Funnel Chart', category: 'Advanced' },
  { value: 'boxplot', label: 'Box Plot', category: 'Advanced' },
  { value: 'combo', label: 'Combo Chart', category: 'Advanced' }
];

export const aggregationOptions = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'count', label: 'Count' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' }
];

export const getChartConfigFields = (chartType) => {
  const fields = [];

  
  fields.push({ key: 'title', label: 'Chart Title', type: 'text', required: true });

  
  switch (chartType) {
    case 'pie':
    case 'donut':
      fields.push(
        { key: 'categoryField', label: 'Category Field', type: 'select', required: true },
        { key: 'valueField', label: 'Value Field', type: 'select', required: true }
      );
      break;

    case 'scatter':
      fields.push(
        { key: 'xAxis', label: 'X-Axis Field', type: 'select', required: true },
        { key: 'yAxis', label: 'Y-Axis Field', type: 'select', required: true },
        { key: 'sizeField', label: 'Size Field (Optional)', type: 'select', required: false }
      );
      break;

    case 'bubble':
      fields.push(
        { key: 'xAxis', label: 'X-Axis Field', type: 'select', required: true },
        { key: 'yAxis', label: 'Y-Axis Field', type: 'select', required: true },
        { key: 'sizeField', label: 'Size Field', type: 'select', required: true }
      );
      break;

    case 'radar':
      fields.push(
        { key: 'dimensions', label: 'Dimensions', type: 'multiselect', required: true }
      );
      break;

    default:
      fields.push(
        { key: 'xAxis', label: 'X-Axis Field', type: 'select', required: true },
        { key: 'yAxis', label: 'Y-Axis Field', type: 'select', required: true },
        { key: 'aggregation', label: 'Aggregation', type: 'select', options: aggregationOptions, required: false }
      );
      break;
  }

  return fields;
};
