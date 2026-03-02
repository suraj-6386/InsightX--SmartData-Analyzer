/**
 * statisticsUtils.js
 * Pure statistical computation functions for InsightX Pro Analytics Engine.
 * No dependencies — runs entirely client-side.
 */

// ─────────────────────────────────────────────────────────────────────────────
// BASIC DESCRIPTIVE STATISTICS
// ─────────────────────────────────────────────────────────────────────────────

export const mean = (values) => {
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
};

export const median = (values) => {
    if (!values || values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const mode = (values) => {
    if (!values || values.length === 0) return [];
    const freq = {};
    values.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
    const maxFreq = Math.max(...Object.values(freq));
    return Object.keys(freq)
        .filter(k => freq[k] === maxFreq)
        .map(Number);
};

export const variance = (values, population = false) => {
    if (!values || values.length < 2) return 0;
    const m = mean(values);
    const n = population ? values.length : values.length - 1;
    return values.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / n;
};

export const stdDev = (values, population = false) => {
    return Math.sqrt(variance(values, population));
};

// ─────────────────────────────────────────────────────────────────────────────
// SHAPE STATISTICS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Skewness (Fisher's moment coefficient of skewness)
 * Formula: (n / ((n-1)(n-2))) * Σ((xi - x̄) / s)³
 */
export const skewness = (values) => {
    const n = values.length;
    if (n < 3) return 0;
    const m = mean(values);
    const s = stdDev(values);
    if (s === 0) return 0;
    const cubedDeviations = values.reduce((sum, v) => sum + Math.pow((v - m) / s, 3), 0);
    return (n / ((n - 1) * (n - 2))) * cubedDeviations;
};

/**
 * Excess Kurtosis (Fisher's definition — normal distribution = 0)
 * Formula: [(n(n+1)) / ((n-1)(n-2)(n-3))] * Σ((xi - x̄)/s)⁴  −  [3(n-1)² / ((n-2)(n-3))]
 */
export const kurtosis = (values) => {
    const n = values.length;
    if (n < 4) return 0;
    const m = mean(values);
    const s = stdDev(values);
    if (s === 0) return 0;
    const fourthPower = values.reduce((sum, v) => sum + Math.pow((v - m) / s, 4), 0);
    const term1 = ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * fourthPower;
    const term2 = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
    return term1 - term2;
};

// ─────────────────────────────────────────────────────────────────────────────
// QUANTILES & PERCENTILES
// ─────────────────────────────────────────────────────────────────────────────

export const percentile = (values, p) => {
    const sorted = [...values].sort((a, b) => a - b);
    const idx = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (upper >= sorted.length) return sorted[sorted.length - 1];
    return sorted[lower] + (idx % 1) * (sorted[upper] - sorted[lower]);
};

export const quartiles = (values) => ({
    q1: percentile(values, 25),
    q2: percentile(values, 50),
    q3: percentile(values, 75),
});

// ─────────────────────────────────────────────────────────────────────────────
// OUTLIER DETECTION — IQR Method
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns IQR bounds and flags each value as outlier/normal.
 * Lower fence = Q1 - 1.5 * IQR
 * Upper fence = Q3 + 1.5 * IQR
 */
export const detectOutliers = (values) => {
    const { q1, q3 } = quartiles(values);
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;

    return {
        q1, q3, iqr, lowerFence, upperFence,
        outliers: values.filter(v => v < lowerFence || v > upperFence),
        flags: values.map(v => ({
            value: v,
            isOutlier: v < lowerFence || v > upperFence,
            direction: v < lowerFence ? 'low' : v > upperFence ? 'high' : 'normal',
        })),
        outlierCount: values.filter(v => v < lowerFence || v > upperFence).length,
        outlierPercent: +((values.filter(v => v < lowerFence || v > upperFence).length / values.length) * 100).toFixed(1),
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// FULL COLUMN SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getColumnStats — computes all statistics for a numeric array.
 * Returns a rich summary object per column.
 */
export const getColumnStats = (values) => {
    const cleaned = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    if (cleaned.length === 0) return null;

    const { q1, q2, q3 } = quartiles(cleaned);
    const outlierInfo = detectOutliers(cleaned);
    const m = mean(cleaned);
    const s = stdDev(cleaned);

    return {
        count: cleaned.length,
        sum: cleaned.reduce((a, b) => a + b, 0),
        mean: m,
        median: q2,
        mode: mode(cleaned),
        stdDev: s,
        variance: variance(cleaned),
        skewness: skewness(cleaned),
        kurtosis: kurtosis(cleaned),
        min: Math.min(...cleaned),
        max: Math.max(...cleaned),
        range: Math.max(...cleaned) - Math.min(...cleaned),
        q1, q2, q3,
        iqr: q3 - q1,
        ...outlierInfo,
        // Interpretations
        skewnessLabel: (() => {
            const sk = skewness(cleaned);
            if (Math.abs(sk) < 0.5) return 'Approximately Symmetric';
            if (sk > 0.5) return sk > 1 ? 'Highly Right-Skewed' : 'Moderately Right-Skewed';
            return sk < -1 ? 'Highly Left-Skewed' : 'Moderately Left-Skewed';
        })(),
        kurtosisLabel: (() => {
            const k = kurtosis(cleaned);
            if (Math.abs(k) < 0.5) return 'Mesokurtic (Normal)';
            return k > 0 ? 'Leptokurtic (Heavy Tails)' : 'Platykurtic (Light Tails)';
        })(),
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// NUMERIC COLUMN EXTRACTOR
// ─────────────────────────────────────────────────────────────────────────────

export const extractNumericValues = (data, column) =>
    data
        .map(row => Number(row[column]))
        .filter(v => !isNaN(v));

export const getNumericColumns = (data) => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).filter(col => {
        const vals = data.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '');
        const numericVals = vals.filter(v => !isNaN(Number(v)));
        return numericVals.length / vals.length >= 0.8;
    });
};
