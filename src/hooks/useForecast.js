/**
 * useForecast.js — SMA + Linear Regression forecast hook.
 * @param {Array} data
 * @param {string} xCol — label/time column
 * @param {string} yCol — value column to forecast
 * @param {number} forecastN — number of forecast points (default 3)
 * @param {number} smaWindow — SMA window size (default 3)
 */
import { useMemo } from 'react';
import { buildForecastSeries, linearRegressionForecast } from '../utils/forecastingUtils';
import { extractNumericValues } from '../utils/statisticsUtils';

export const useForecast = (data, xCol, yCol, forecastN = 3, smaWindow = 3) => {
    return useMemo(() => {
        if (!data || data.length < 4 || !yCol) {
            return { series: [], trendInfo: null };
        }
        const series = buildForecastSeries(data, xCol, yCol, forecastN, smaWindow);
        const values = extractNumericValues(data, yCol);
        const trendInfo = linearRegressionForecast(values, forecastN);
        return { series, trendInfo };
    }, [data, xCol, yCol, forecastN, smaWindow]);
};
