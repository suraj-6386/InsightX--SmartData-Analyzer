export const aggregateData = (data, groupByField, valueField, aggregation = 'sum') => {
  if (!data || !groupByField || !valueField) return [];

  const grouped = {};

  data.forEach(row => {
    const groupKey = row[groupByField];
    const value = Number(row[valueField]);

    if (isNaN(value)) return; 

    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(value);
  });

  return Object.keys(grouped).map(key => {
    const values = grouped[key];
    let aggregatedValue;

    switch (aggregation) {
      case 'sum':
        aggregatedValue = values.reduce((a, b) => a + b, 0);
        break;
      case 'avg':
        aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
        break;
      case 'count':
        aggregatedValue = values.length;
        break;
      case 'min':
        aggregatedValue = Math.min(...values);
        break;
      case 'max':
        aggregatedValue = Math.max(...values);
        break;
      case 'median': {
        const sorted = values.sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        aggregatedValue = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        break;
      }
      default:
        aggregatedValue = values.reduce((a, b) => a + b, 0);
    }

    return {
      name: key,
      value: Number(aggregatedValue.toFixed(2))
    };
  });
};

export const groupByMultipleFields = (data, groupByFields, valueField, aggregation = 'sum') => {
  if (!data || !groupByFields || groupByFields.length === 0 || !valueField) return [];

  const grouped = {};

  data.forEach(row => {
    const groupKey = groupByFields.map(field => row[field]).join(' | ');
    const value = Number(row[valueField]);

    if (isNaN(value)) return;

    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(value);
  });

  return Object.keys(grouped).map(key => {
    const values = grouped[key];
    let aggregatedValue;

    switch (aggregation) {
      case 'sum':
        aggregatedValue = values.reduce((a, b) => a + b, 0);
        break;
      case 'avg':
        aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
        break;
      case 'count':
        aggregatedValue = values.length;
        break;
      case 'min':
        aggregatedValue = Math.min(...values);
        break;
      case 'max':
        aggregatedValue = Math.max(...values);
        break;
      default:
        aggregatedValue = values.reduce((a, b) => a + b, 0);
    }

    return {
      name: key,
      value: Number(aggregatedValue.toFixed(2))
    };
  });
};

export const calculateStatistics = (data, field) => {
  if (!data || !field) return null;

  const values = data.map(row => Number(row[field])).filter(val => !isNaN(val));

  if (values.length === 0) return null;

  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  const sorted = values.sort((a, b) => a - b);
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    count: values.length,
    sum: Number(sum.toFixed(2)),
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    min,
    max,
    variance: Number(variance.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2))
  };
};
