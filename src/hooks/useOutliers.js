
import { useMemo } from 'react';
import { detectOutliers, extractNumericValues, getNumericColumns } from '../utils/statisticsUtils';

export const useOutliers = (data) => {
    return useMemo(() => {
        if (!data || data.length === 0) return { outliers: {}, totalOutliers: 0 };
        const numericColumns = getNumericColumns(data);
        const outliers = {};
        let totalOutliers = 0;
        numericColumns.forEach(col => {
            const values = extractNumericValues(data, col);
            const result = detectOutliers(values);
            outliers[col] = result;
            totalOutliers += result.outlierCount;
        });
        return { outliers, totalOutliers, numericColumns };
    }, [data]);
};

