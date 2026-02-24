export const calculateKPIs = (data) => {
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

  const maxValues = numericColumns.map(col => {
    const values = data.map(row => Number(row[col]));
    return { column: col, max: Math.max(...values) };
  });

  const minValues = numericColumns.map(col => {
    const values = data.map(row => Number(row[col]));
    return { column: col, min: Math.min(...values) };
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

  return {
    totalRows,
    numColumns,
    numericColumns,
    averages,
    maxValues,
    minValues,
    topCategory
  };
};

export const detectColumnTypes = (data) => {
  if (!data || data.length === 0) return { numeric: [], date: [], text: [] };

  const columns = Object.keys(data[0]);
  const numeric = [];
  const date = [];
  const text = [];

  columns.forEach(col => {
    const sampleValues = data.slice(0, 10).map(row => row[col]);

    // Check if numeric
    if (sampleValues.every(val => !isNaN(Number(val)) && val !== '')) {
      numeric.push(col);
    }
    // Check if date
    else if (sampleValues.some(val => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && val.toString().match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/);
    })) {
      date.push(col);
    }
    else {
      text.push(col);
    }
  });

  return { numeric, date, text };
};