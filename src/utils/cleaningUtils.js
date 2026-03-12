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

    
    const numericCount = sampleValues.filter(val => {
      const num = Number(val);
      return !isNaN(num) && val !== '' && isFinite(num);
    }).length;

    if (numericCount / sampleValues.length > 0.8) {
      numeric.push(col);
    }
    
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

export const treatOutliers = (data, column, method) => {
  const values = data.map(row => Number(row[column])).filter(v => !isNaN(v));
  if (values.length === 0) return { data, treatedCount: 0 };

  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  let treatedCount = 0;
  const cleaned = data.map(row => {
    const newRow = { ...row };
    const val = Number(row[column]);
    if (!isNaN(val) && (val < lowerFence || val > upperFence)) {
      treatedCount++;
      if (method === 'remove') {
        return null;
      } else if (method === 'cap') {
        newRow[column] = val < lowerFence ? lowerFence : upperFence;
      } else if (method === 'mean') {
        const meanVal = values.reduce((a, b) => a + b, 0) / values.length;
        newRow[column] = meanVal;
      } else if (method === 'median') {
        newRow[column] = sorted[Math.floor(sorted.length / 2)];
      }
    }
    return newRow;
  });

  const finalData = method === 'remove' ? cleaned.filter(r => r !== null) : cleaned;
  return { data: finalData, treatedCount: method === 'remove' ? treatedCount : treatedCount };
};
