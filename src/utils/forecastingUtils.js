

import { linearRegression } from './regressionUtils';






export const simpleMovingAverage = (values, window = 3, forecastN = 3) => {
    if (!values || values.length < window) {
        return { historical: values, smoothed: [], forecast: [], window };
    }

    const smoothed = [];
    for (let i = 0; i <= values.length - window; i++) {
        const slice = values.slice(i, i + window);
        smoothed.push(+(slice.reduce((a, b) => a + b, 0) / window).toFixed(4));
    }

    
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






export const linearRegressionForecast = (values, forecastN = 3) => {
    if (!values || values.length < 2) {
        return { trendLine: [], forecast: [], slope: 0, intercept: 0, r2: 0 };
    }

    const xArr = values.map((_, i) => i);
    const { slope, intercept, r2, predict } = linearRegression(xArr, values);

    
    const trendLine = values.map((_, i) => +predict(i).toFixed(4));

    
    const lastIdx = values.length - 1;
    const forecast = Array.from({ length: forecastN }, (_, i) =>
        +predict(lastIdx + 1 + i).toFixed(4)
    );

    
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






export const buildForecastSeries = (data, xCol, yCol, forecastN = 3, smaWindow = 3) => {
    const values = data.map(r => Number(r[yCol])).filter(v => !isNaN(v));
    const labels = data.map(r => String(r[xCol] ?? ''));

    const { smoothed, forecast: smaForecast } = simpleMovingAverage(values, smaWindow, forecastN);
    const { trendLine, forecastWithCI } = linearRegressionForecast(values, forecastN);

    
    const series = values.map((val, i) => ({
        label: labels[i] || `T${i + 1}`,
        actual: val,
        sma: smoothed[i - (smaWindow - 1)] ?? null,
        trend: trendLine[i] ?? null,
        type: 'historical',
    }));

    
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

