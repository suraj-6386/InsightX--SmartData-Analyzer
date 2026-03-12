
import { useMemo } from 'react';
import { getColumnStats, extractNumericValues, getNumericColumns } from '../utils/statisticsUtils';

export const useStatistics = (data) => {
    return useMemo(() => {
        if (!data || data.length === 0) {
            return { stats: {}, numericColumns: [] };
        }
        const numericColumns = getNumericColumns(data);
        const stats = {};
        numericColumns.forEach(col => {
            const values = extractNumericValues(data, col);
            stats[col] = getColumnStats(values);
        });
        return { stats, numericColumns };
    }, [data]);
};

