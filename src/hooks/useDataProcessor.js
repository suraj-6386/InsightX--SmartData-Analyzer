import { useMemo } from 'react';


export function useDataProcessor(data) {
    return useMemo(() => {
        if (!data || data.length === 0) {
            return {
                rowCount: 0,
                colCount: 0,
                numericColumns: [],
                categoricalColumns: [],
                stats: {},
                missingCount: 0,
                missingPercent: 0,
            };
        }

        const columns = Object.keys(data[0]);
        const rowCount = data.length;
        const colCount = columns.length;

        
        const numericColumns = columns.filter(col => {
            const vals = data.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '');
            if (vals.length === 0) return false;
            const numericVals = vals.filter(v => !isNaN(Number(v)));
            return numericVals.length / vals.length >= 0.8;
        });

        const categoricalColumns = columns.filter(col => !numericColumns.includes(col));

        
        const stats = {};
        numericColumns.forEach(col => {
            const values = data
                .map(r => Number(r[col]))
                .filter(v => !isNaN(v))
                .sort((a, b) => a - b);

            if (values.length === 0) return;

            const sum = values.reduce((a, b) => a + b, 0);
            const mean = sum / values.length;
            const min = values[0];
            const max = values[values.length - 1];

            
            const mid = Math.floor(values.length / 2);
            const median = values.length % 2 !== 0
                ? values[mid]
                : (values[mid - 1] + values[mid]) / 2;

            
            const freq = {};
            values.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
            const mode = Number(Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b));

            
            const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);

            stats[col] = { mean, median, mode, min, max, stdDev, count: values.length, sum };
        });

        
        let missingCount = 0;
        data.forEach(row => {
            columns.forEach(col => {
                const v = row[col];
                if (v === null || v === undefined || v === '' || v === 'null' || v === 'NULL' || v === 'NaN') {
                    missingCount++;
                }
            });
        });
        const totalCells = rowCount * colCount;
        const missingPercent = totalCells > 0 ? ((missingCount / totalCells) * 100).toFixed(1) : 0;

        return { rowCount, colCount, numericColumns, categoricalColumns, stats, missingCount, missingPercent };
    }, [data]);
}

