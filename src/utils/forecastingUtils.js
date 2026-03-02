/**
 * forecastingUtils.js
 * Time-series forecasting: Simple Moving Average + Linear Regression Extrapolation.
 * Pure math — no external dependencies.
 */

import { linearRegression } from './regressionUtils';

// ─────────────────────────────────────────────────────────────────────────────
// SIMPLE MOVING AVERAGE (SMA)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute SMA for all points, then forecast next N points.
 * @param {number[]} values — historical data series
 * @param {number} window — SMA window size (e.g., 3, 5, 7)
 * @param {number} forecastN — number of future points to predict
 * @returns {object} { historical, smoothed, forecast, window }
 */
export const simpleMovingAverage = (values, window = 3, forecastN = 3) => {
    if (!values || values.length < window) {
        return { historical: values, smoothed: [], forecast: [], window };
    }

    const smoothed = [];
    for (let i = 0; i <= values.length - window; i++) {
        const slice = values.slice(i, i + window);
        smoothed.push(+(slice.reduce((a, b) => a + b, 0) / window).toFixed(4));
    }

    // Forecast: use the last `window` values for each future point
    const forecast = [];
    const extended = [...values];
    for (let i = 0; i < forecastN; i++) {
        const slice = extended.slice(extended.length - window);
        const next = +(slice.reduce((a, b) => a + b, 0) / window).toFixed(4);
        forecast.push(next);
        extended.push(next);
    }

    return { historical: values, smoothed, forecast, window };
};

// ─────────────────────────────────────────────────────────────────────────────
// LINEAR REGRESSION FORECAST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Use OLS linear regression on (index, value) pairs to extrapolate N future points.
 * @param {number[]} values — historical series
 * @param {number} forecastN — number of future points
 * @returns {object} { trendLine, forecast, slope, intercept, r2 }
 */
export const linearRegressionForecast = (values, forecastN = 3) => {
    if (!values || values.length < 2) {
        return { trendLine: [], forecast: [], slope: 0, intercept: 0, r2: 0 };
    }

    const xArr = values.map((_, i) => i);
    const { slope, intercept, r2, predict } = linearRegression(xArr, values);

    // Fitted values (trendline over historical data)
    const trendLine = values.map((_, i) => +predict(i).toFixed(4));

    // Forecast future points
    const lastIdx = values.length - 1;
    const forecast = Array.from({ length: forecastN }, (_, i) =>
        +predict(lastIdx + 1 + i).toFixed(4)
    );

    // Simple confidence interval: ±1.5 * std of residuals
    const residuals = values.map((v, i) => v - predict(i));
    const residStd = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / residuals.length);
    const ciWidth = 1.5 * residStd;

    const forecastWithCI = forecast.map((val, i) => ({
        index: lastIdx + 1 + i,
        value: val,
        lower: +((val - ciWidth * (i + 1) * 0.5)).toFixed(4),
        upper: +((val + ciWidth * (i + 1) * 0.5)).toFixed(4),
    }));

    return { trendLine, forecast, forecastWithCI, slope, intercept, r2, ciWidth };
};

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED FORECAST SERIES (for chart consumption)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildForecastSeries — merges historical + SMA + regression forecast
 * into a unified array suitable for Recharts.
 *
 * @param {Array} data — full dataset rows
 * @param {string} xCol — label column (x-axis)
 * @param {string} yCol — numeric value column
 * @param {number} forecastN — forecast horizon
 * @returns {Array} chart-ready series with historical, sma, regression, forecast bands
 */
export const buildForecastSeries = (data, xCol, yCol, forecastN = 3, smaWindow = 3) => {
    const values = data.map(r => Number(r[yCol])).filter(v => !isNaN(v));
    const labels = data.map(r => String(r[xCol] ?? ''));

    const { smoothed, forecast: smaForecast } = simpleMovingAverage(values, smaWindow, forecastN);
    const { trendLine, forecastWithCI } = linearRegressionForecast(values, forecastN);

    // Historical points
    const series = values.map((val, i) => ({
        label: labels[i] || `T${i + 1}`,
        actual: val,
        sma: smoothed[i - (smaWindow - 1)] ?? null,
        trend: trendLine[i] ?? null,
        type: 'historical',
    }));

    // Forecast points (appended)
    forecastWithCI.forEach((fc, i) => {
        series.push({
            label: `Forecast +${i + 1}`,
            smaForecast: smaForecast[i] ?? null,
            forecast: fc.value,
            lower: fc.lower,
            upper: fc.upper,
            type: 'forecast',
        });
    });

    return series;
};

// ─────────────────────────────────────────────────────────────────────────────
// GOAL SEEKING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * goalSeek — given a target % change in yCol, estimates which numeric
 * variables have the highest impact based on their correlation with yCol.
 *
 * @param {object} correlations — { colName: pearsonR } correlations with yCol
 * @param {number} targetPct — target change percentage (e.g., 10 for +10%)
 * @returns {Array} sorted impact estimates per variable
 */
export const goalSeek = (correlations, targetPct) => {
    return Object.entries(correlations)
        .map(([col, r]) => ({
            column: col,
            correlation: r,
            absCorrelation: Math.abs(r),
            direction: r > 0 ? 'Increase' : 'Decrease',
            estimatedImpact: +(Math.abs(r) * targetPct).toFixed(2),
            suggestion: r > 0
                ? `Increase ${col} to contribute ~${(Math.abs(r) * targetPct).toFixed(1)}% of target`
                : `Decrease ${col} to contribute ~${(Math.abs(r) * targetPct).toFixed(1)}% of target`,
        }))
        .sort((a, b) => b.absCorrelation - a.absCorrelation);
};
