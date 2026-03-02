/**
 * useCorrelation.js — memoized Pearson correlation matrix hook.
 */
import { useMemo } from 'react';
import { buildCorrelationMatrix } from '../utils/regressionUtils';
import { getNumericColumns } from '../utils/statisticsUtils';

export const useCorrelation = (data) => {
    return useMemo(() => {
        if (!data || data.length < 2) return { columns: [], matrix: [] };
        const numericColumns = getNumericColumns(data).slice(0, 10); // cap at 10 cols
        if (numericColumns.length < 2) return { columns: [], matrix: [] };
        return buildCorrelationMatrix(data, numericColumns);
    }, [data]);
};
