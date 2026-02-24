export const removeNullValues = (data) => {
  const originalLength = data.length;
  const cleaned = data.filter(row => {
    return Object.values(row).every(value =>
      value !== null &&
      value !== undefined &&
      value !== '' &&
      value !== 'null' &&
      value !== 'NULL' &&
      value !== 'N/A' &&
      value !== 'n/a'
    );
  });
  return {
    data: cleaned,
    removedCount: originalLength - cleaned.length
  };
};

export const removeDuplicates = (data) => {
  const originalLength = data.length;
  const seen = new Set();
  const cleaned = data.filter(row => {
    const key = JSON.stringify(
      Object.keys(row)
        .sort()
        .reduce((obj, key) => {
          obj[key] = row[key];
          return obj;
        }, {})
    );
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return {
    data: cleaned,
    removedCount: originalLength - cleaned.length
  };
};

export const detectColumnTypes = (data) => {
  if (!data || data.length === 0) return { numeric: [], date: [], text: [] };

  const columns = Object.keys(data[0]);
  const numeric = [];
  const date = [];
  const text = [];

  columns.forEach(col => {
    const sampleValues = data.slice(0, Math.min(50, data.length)).map(row => row[col]);

    // Check if numeric
    const numericCount = sampleValues.filter(val => {
      const num = Number(val);
      return !isNaN(num) && val !== '' && isFinite(num);
    }).length;

    if (numericCount / sampleValues.length > 0.8) {
      numeric.push(col);
    }
    // Check if date
    else if (sampleValues.some(val => {
      if (!val || typeof val !== 'string') return false;
      const date = new Date(val);
      return !isNaN(date.getTime()) && val.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4}/);
    })) {
      date.push(col);
    }
    else {
      text.push(col);
    }
  });

  return { numeric, date, text };
};

export const cleanData = (data, options = {}) => {
  let cleanedData = [...data];
  const results = {
    nullsRemoved: 0,
    duplicatesRemoved: 0,
    originalRows: data.length
  };

  if (options.removeNulls) {
    const nullResult = removeNullValues(cleanedData);
    cleanedData = nullResult.data;
    results.nullsRemoved = nullResult.removedCount;
  }

  if (options.removeDuplicates) {
    const duplicateResult = removeDuplicates(cleanedData);
    cleanedData = duplicateResult.data;
    results.duplicatesRemoved = duplicateResult.removedCount;
  }

  results.finalRows = cleanedData.length;
  results.columnTypes = detectColumnTypes(cleanedData);

  return {
    data: cleanedData,
    results
  };
};