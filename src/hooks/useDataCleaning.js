/**
 * useDataCleaning.js
 * Comprehensive data cleaning hook for InsightX Pro.
 * Handles: null removal, deduplication, null treatment, type conversion,
 * and IQR-based outlier removal/capping (Winsorization).
 */
import { useMemo, useCallback } from 'react';
import { getNumericColumns } from '../utils/statisticsUtils';

// ─── IQR Math Helpers ─────────────────────────────────────────────────────────
const getPercentile = (sorted, p) => {
    const idx = (p / 100) * (sorted.length - 1);
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    if (hi >= sorted.length) return sorted[sorted.length - 1];
    return sorted[lo] + (idx % 1) * (sorted[hi] - sorted[lo]);
};

const computeIQRBounds = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = getPercentile(sorted, 25);
    const q3 = getPercentile(sorted, 75);
    const iqr = q3 - q1;
    return {
        q1, q3, iqr,
        lowerFence: q1 - 1.5 * iqr,
        upperFence: q3 + 1.5 * iqr,
        p5: getPercentile(sorted, 5),
        p95: getPercentile(sorted, 95),
    };
};

// ─── Per-column outlier stats (for badge display) ────────────────────────────
export const countOutliers = (data) => {
    if (!data || data.length === 0) return { total: 0, byColumn: {} };
    const numericColumns = getNumericColumns(data);
    let total = 0;
    const byColumn = {};

    numericColumns.forEach(col => {
        const vals = data.map(r => Number(r[col])).filter(v => !isNaN(v));
        if (vals.length < 4) return;
        const { lowerFence, upperFence } = computeIQRBounds(vals);
        const count = vals.filter(v => v < lowerFence || v > upperFence).length;
        byColumn[col] = count;
        total += count;
    });

    return { total, byColumn };
};

const useDataCleaning = (data, onDataClean) => {

    // Memoized outlier counts for live badge
    const outlierInfo = useMemo(() => countOutliers(data), [data]);

    // ─────────────────────────────────────────────────────────────────────────
    // REMOVE NULLS (rows with any null/empty/undefined cell)
    // ─────────────────────────────────────────────────────────────────────────
    const handleRemoveNulls = useCallback(() => {
        const before = data.length;
        const cleaned = data.filter(row =>
            Object.values(row).every(v => v !== null && v !== undefined && v !== '' && v !== 'null' && v !== 'NULL' && v !== 'NaN')
        );
        onDataClean(cleaned, { nullsRemoved: before - cleaned.length }, 'removeNulls');
    }, [data, onDataClean]);

    // ─────────────────────────────────────────────────────────────────────────
    // REMOVE DUPLICATES
    // ─────────────────────────────────────────────────────────────────────────
    const handleRemoveDuplicates = useCallback(() => {
        const seen = new Set();
        const cleaned = data.filter(row => {
            const key = JSON.stringify(row);
            return seen.has(key) ? false : (seen.add(key), true);
        });
        onDataClean(cleaned, { duplicatesRemoved: data.length - cleaned.length }, 'removeDuplicates');
    }, [data, onDataClean]);

    // ─────────────────────────────────────────────────────────────────────────
    // TREAT NULL VALUES (fill with mean/median/mode/zero/blank or remove rows)
    // ─────────────────────────────────────────────────────────────────────────
    const handleTreatNulls = useCallback((treatment) => {
        if (!treatment) return;
        const cols = Object.keys(data[0] || {});
        let rowsAffected = 0;

        // Pre-compute column statistics for fill methods
        const colStats = {};
        if (['mean', 'median', 'mode'].includes(treatment)) {
            cols.forEach(col => {
                const valids = data.map(r => r[col]).filter(v =>
                    v !== null && v !== undefined && v !== '' && v !== 'null' && v !== 'NULL'
                );
                if (treatment === 'mean' || treatment === 'median') {
                    const nums = valids.filter(v => !isNaN(Number(v))).map(Number).sort((a, b) => a - b);
                    if (nums.length > 0) {
                        colStats[col] = {
                            mean: nums.reduce((a, b) => a + b, 0) / nums.length,
                            median: nums.length % 2 !== 0 ? nums[Math.floor(nums.length / 2)] : (nums[nums.length / 2 - 1] + nums[nums.length / 2]) / 2,
                        };
                    }
                } else if (treatment === 'mode') {
                    const freq = {};
                    valids.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
                    colStats[col] = { mode: Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] };
                }
            });
        }

        let result = data.map(row => {
            const newRow = { ...row };
            let modified = false;
            cols.forEach(col => {
                const v = row[col];
                if (v === null || v === undefined || v === '' || v === 'null' || v === 'NULL') {
                    if (treatment === 'mean' && colStats[col]?.mean !== undefined) { newRow[col] = +colStats[col].mean.toFixed(4); modified = true; }
                    else if (treatment === 'median' && colStats[col]?.median !== undefined) { newRow[col] = colStats[col].median; modified = true; }
                    else if (treatment === 'mode' && colStats[col]?.mode !== undefined) { newRow[col] = colStats[col].mode; modified = true; }
                    else if (treatment === 'zero') { newRow[col] = 0; modified = true; }
                    else if (treatment === 'blank') { newRow[col] = ''; modified = true; }
                }
            });
            if (modified) rowsAffected++;
            return newRow;
        });

        if (treatment === 'remove') {
            const before = result.length;
            result = result.filter(row =>
                !Object.values(row).some(v => v === null || v === undefined || v === '' || v === 'null' || v === 'NULL')
            );
            rowsAffected = before - result.length;
        }

        onDataClean(result, { treatment, rowsAffected }, 'treatNulls');
    }, [data, onDataClean]);

    // ─────────────────────────────────────────────────────────────────────────
    // CONVERT DATA TYPE
    // ─────────────────────────────────────────────────────────────────────────
    const handleConvertDataType = useCallback((column, targetType) => {
        if (!column || !targetType) return;
        const cleaned = data.map(row => {
            const newRow = { ...row };
            const v = row[column];
            if (v !== null && v !== undefined && v !== '') {
                switch (targetType) {
                    case 'Number': newRow[column] = Number(v); break;
                    case 'String': newRow[column] = String(v); break;
                    case 'Date': newRow[column] = new Date(v).toISOString().split('T')[0]; break;
                    case 'Boolean': newRow[column] = Boolean(v); break;
                }
            }
            return newRow;
        });
        onDataClean(cleaned, { column, targetType }, 'convertDataType');
    }, [data, onDataClean]);

    // ─────────────────────────────────────────────────────────────────────────
    // TREAT OUTLIERS — IQR Method
    //   method = 'remove' : filter out rows where any numeric col is an outlier
    //   method = 'cap'    : Winsorize — cap values at fences (preserves row count)
    //   method = 'p5p95'  : Replace with P5/P95 percentile values
    // ─────────────────────────────────────────────────────────────────────────
    const handleTreatOutliers = useCallback((method, targetCol = null) => {
        const numericColumns = targetCol ? [targetCol] : getNumericColumns(data);
        if (numericColumns.length === 0) return;

        // Pre-compute IQR bounds per column
        const bounds = {};
        numericColumns.forEach(col => {
            const vals = data.map(r => Number(r[col])).filter(v => !isNaN(v));
            if (vals.length >= 4) bounds[col] = computeIQRBounds(vals);
        });

        let result;
        let outliersHandled = 0;

        if (method === 'remove') {
            // Remove entire row if ANY numeric column contains an outlier
            result = data.filter(row => {
                const isOutlier = numericColumns.some(col => {
                    const b = bounds[col];
                    if (!b) return false;
                    const v = Number(row[col]);
                    return !isNaN(v) && (v < b.lowerFence || v > b.upperFence);
                });
                if (isOutlier) outliersHandled++;
                return !isOutlier;
            });
        } else if (method === 'cap') {
            // Winsorization: cap at lower/upper fence
            result = data.map(row => {
                const newRow = { ...row };
                numericColumns.forEach(col => {
                    const b = bounds[col];
                    if (!b) return;
                    const v = Number(row[col]);
                    if (isNaN(v)) return;
                    if (v < b.lowerFence) { newRow[col] = +b.lowerFence.toFixed(4); outliersHandled++; }
                    else if (v > b.upperFence) { newRow[col] = +b.upperFence.toFixed(4); outliersHandled++; }
                });
                return newRow;
            });
        } else if (method === 'p5p95') {
            // Replace with P5 / P95 percentiles
            result = data.map(row => {
                const newRow = { ...row };
                numericColumns.forEach(col => {
                    const b = bounds[col];
                    if (!b) return;
                    const v = Number(row[col]);
                    if (isNaN(v)) return;
                    if (v < b.lowerFence) { newRow[col] = +b.p5.toFixed(4); outliersHandled++; }
                    else if (v > b.upperFence) { newRow[col] = +b.p95.toFixed(4); outliersHandled++; }
                });
                return newRow;
            });
        }

        const methodLabel = method === 'remove' ? 'Removal' : method === 'cap' ? 'IQR Capping' : 'P5/P95 Replacement';
        onDataClean(result, {
            outliersHandled,
            method: methodLabel,
            columnsProcessed: numericColumns.length,
        }, 'treatOutliers');
    }, [data, onDataClean]);

    return {
        outlierInfo,
        handleRemoveNulls,
        handleRemoveDuplicates,
        handleTreatNulls,
        handleConvertDataType,
        handleTreatOutliers,
    };
};

export default useDataCleaning;
