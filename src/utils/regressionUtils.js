/**
 * regressionUtils.js
 * Pearson Correlation, Linear Regression (Least Squares), R² coefficient.
 * Pure math — no dependencies.
 */

import { mean } from './statisticsUtils';

// ─────────────────────────────────────────────────────────────────────────────
// PEARSON CORRELATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pearson Correlation Coefficient between two arrays.
 * r = Σ(xi - x̄)(yi - ȳ) / sqrt(Σ(xi-x̄)² · Σ(yi-ȳ)²)
 * Returns a value in [-1, 1].
 */
export const pearsonCorrelation = (xArr, yArr) => {
    const n = Math.min(xArr.length, yArr.length);
    if (n < 2) return 0;

    const x = xArr.slice(0, n);
    const y = yArr.slice(0, n);
    const mx = mean(x);
    const my = mean(y);

    let num = 0, dx2 = 0, dy2 = 0;
    for (let i = 0; i < n; i++) {
        const dx = x[i] - mx;
        const dy = y[i] - my;
        num += dx * dy;
        dx2 += dx * dx;
        dy2 += dy * dy;
    }

    const denom = Math.sqrt(dx2 * dy2);
    return denom === 0 ? 0 : +(num / denom).toFixed(4);
};

/**
 * Build a full correlation matrix for all numeric columns.
 * Returns { columns, matrix } where matrix[i][j] = r(col_i, col_j)
 */
export const buildCorrelationMatrix = (data, numericColumns) => {
    const vectors = {};
    numericColumns.forEach(col => {
        vectors[col] = data.map(r => Number(r[col])).filter(v => !isNaN(v));
    });

    const matrix = numericColumns.map(colA =>
        numericColumns.map(colB => {
            if (colA === colB) return 1;
            return pearsonCorrelation(vectors[colA], vectors[colB]);
        })
    );

    return { columns: numericColumns, matrix };
};

// ─────────────────────────────────────────────────────────────────────────────
// LINEAR REGRESSION — Ordinary Least Squares
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simple linear regression: y = slope·x + intercept
 * Uses OLS (Ordinary Least Squares).
 * 
 * m = (n·Σxy - Σx·Σy) / (n·Σx² - (Σx)²)
 * b = (Σy - m·Σx) / n
 */
export const linearRegression = (xArr, yArr) => {
    const n = Math.min(xArr.length, yArr.length);
    if (n < 2) return { slope: 0, intercept: 0, r2: 0, predict: () => 0 };

    const x = xArr.slice(0, n).map(Number);
    const y = yArr.slice(0, n).map(Number);

    const sumX = x.reduce((s, v) => s + v, 0);
    const sumY = y.reduce((s, v) => s + v, 0);
    const sumXY = x.reduce((s, v, i) => s + v * y[i], 0);
    const sumX2 = x.reduce((s, v) => s + v * v, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
    const intercept = (sumY - slope * sumX) / n;

    // R² coefficient of determination
    const yMean = mean(y);
    const ssTot = y.reduce((s, v) => s + Math.pow(v - yMean, 2), 0);
    const ssRes = y.reduce((s, v, i) => s + Math.pow(v - (slope * x[i] + intercept), 2), 0);
    const r2 = ssTot === 0 ? 1 : +(1 - ssRes / ssTot).toFixed(4);

    const predict = (xVal) => slope * xVal + intercept;

    return { slope: +slope.toFixed(6), intercept: +intercept.toFixed(6), r2, predict };
};

/**
 * Generate trendline points for scatter chart overlay.
 * Returns array of { x, trendY } for the regression line.
 */
export const getTrendlinePoints = (xArr, yArr) => {
    const { predict } = linearRegression(xArr, yArr);
    const xMin = Math.min(...xArr);
    const xMax = Math.max(...xArr);
    return [
        { x: xMin, trendY: +predict(xMin).toFixed(3) },
        { x: xMax, trendY: +predict(xMax).toFixed(3) },
    ];
};

/**
 * Get correlation strength label.
 */
export const correlationLabel = (r) => {
    const abs = Math.abs(r);
    if (abs >= 0.9) return 'Very Strong';
    if (abs >= 0.7) return 'Strong';
    if (abs >= 0.5) return 'Moderate';
    if (abs >= 0.3) return 'Weak';
    return 'Negligible';
};

export const correlationDirection = (r) =>
    r > 0.05 ? 'Positive' : r < -0.05 ? 'Negative' : 'None';
