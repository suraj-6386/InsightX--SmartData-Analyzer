/**
 * pivotUtils.js
 * GroupBy, dynamic aggregations, multi-criteria filtering,
 * and safe formula/calculated-column evaluation.
 */

// ─────────────────────────────────────────────────────────────────────────────
// PIVOT / GROUP-BY ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * groupBy — groups rows by a dimension column and applies aggregation.
 * @param {Array} data — dataset rows
 * @param {string} groupCol — column to group by
 * @param {string} valueCol — column to aggregate
 * @param {'sum'|'count'|'avg'|'min'|'max'|'countDistinct'} aggFunc
 * @returns {Array} [{group, value}]
 */
export const groupBy = (data, groupCol, valueCol, aggFunc = 'sum') => {
    if (!data || !groupCol) return [];

    const groups = {};
    data.forEach(row => {
        const key = String(row[groupCol] ?? 'N/A');
        if (!groups[key]) groups[key] = [];
        if (valueCol) {
            const v = Number(row[valueCol]);
            if (!isNaN(v)) groups[key].push(v);
        } else {
            groups[key].push(1);
        }
    });

    return Object.entries(groups).map(([group, values]) => {
        let value;
        switch (aggFunc) {
            case 'sum': value = values.reduce((a, b) => a + b, 0); break;
            case 'count': value = values.length; break;
            case 'avg': value = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0; break;
            case 'min': value = Math.min(...values); break;
            case 'max': value = Math.max(...values); break;
            case 'countDistinct': value = new Set(values).size; break;
            default: value = values.reduce((a, b) => a + b, 0);
        }
        return { group, value: +value.toFixed(4) };
    }).sort((a, b) => b.value - a.value);
};

/**
 * buildPivotTable — multi-dimensional pivot.
 * @param {Array} data
 * @param {string} rowDim — row dimension column
 * @param {string} colDim — column dimension column
 * @param {string} valueCol — value to aggregate
 * @param {string} aggFunc
 * @returns {{ rows, cols, cells }} pivot matrix
 */
export const buildPivotTable = (data, rowDim, colDim, valueCol, aggFunc = 'sum') => {
    if (!data || !rowDim || !valueCol) return { rows: [], cols: [], cells: {} };

    const rowKeys = [...new Set(data.map(r => String(r[rowDim] ?? 'N/A')))];
    const colKeys = colDim
        ? [...new Set(data.map(r => String(r[colDim] ?? 'N/A')))]
        : ['Total'];

    const cells = {};
    rowKeys.forEach(rk => {
        cells[rk] = {};
        colKeys.forEach(ck => {
            const subset = data.filter(row =>
                String(row[rowDim] ?? 'N/A') === rk &&
                (!colDim || String(row[colDim] ?? 'N/A') === ck)
            );
            const values = subset.map(r => Number(r[valueCol])).filter(v => !isNaN(v));
            let value;
            switch (aggFunc) {
                case 'sum': value = values.reduce((a, b) => a + b, 0); break;
                case 'count': value = values.length; break;
                case 'avg': value = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0; break;
                case 'min': value = values.length ? Math.min(...values) : 0; break;
                case 'max': value = values.length ? Math.max(...values) : 0; break;
                default: value = values.reduce((a, b) => a + b, 0);
            }
            cells[rk][ck] = +value.toFixed(2);
        });
    });

    return { rows: rowKeys, cols: colKeys, cells };
};

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-CRITERIA FILTERING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filter condition shape:
 * { column, operator, value, type: 'numeric'|'string' }
 * Operators: '>', '<', '>=', '<=', '=', '!=', 'contains', 'startsWith', 'endsWith'
 *
 * Rule groups joined by AND or OR.
 * filterGroups: [{ logic: 'AND'|'OR', conditions: [...] }]
 */
export const applyFilter = (data, conditions, groupLogic = 'AND') => {
    if (!conditions || conditions.length === 0) return data;

    return data.filter(row => {
        const results = conditions.map(cond => evaluateCondition(row, cond));
        return groupLogic === 'OR'
            ? results.some(Boolean)
            : results.every(Boolean);
    });
};

const evaluateCondition = (row, { column, operator, value }) => {
    const cellVal = row[column];
    const numCell = Number(cellVal);
    const numVal = Number(value);
    const strCell = String(cellVal ?? '').toLowerCase();
    const strVal = String(value ?? '').toLowerCase();

    switch (operator) {
        case '>': return !isNaN(numCell) && numCell > numVal;
        case '<': return !isNaN(numCell) && numCell < numVal;
        case '>=': return !isNaN(numCell) && numCell >= numVal;
        case '<=': return !isNaN(numCell) && numCell <= numVal;
        case '=': return strCell === strVal || numCell === numVal;
        case '!=': return strCell !== strVal && numCell !== numVal;
        case 'contains': return strCell.includes(strVal);
        case 'startsWith': return strCell.startsWith(strVal);
        case 'endsWith': return strCell.endsWith(strVal);
        default: return true;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// SAFE FORMULA / CALCULATED COLUMN EVALUATOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safely evaluates a user-supplied formula against a data row.
 * Columns are substituted as variables. Uses Function constructor with
 * a strict allowlist of operations — no arbitrary JS execution.
 *
 * Example formula: "Revenue - Expenses"  →  row.Revenue - row.Expenses
 *
 * @param {Object} row — single data row
 * @param {string} formula — user-supplied expression (column names as variables)
 * @param {string[]} columns — all column names (for substitution)
 * @returns {number|string} computed value
 */
export const evaluateFormula = (row, formula, columns) => {
    try {
        // Sort by length descending to avoid partial name replacement
        const sortedCols = [...columns].sort((a, b) => b.length - a.length);

        // Replace column names with their numeric values
        let expr = formula;
        sortedCols.forEach(col => {
            const val = Number(row[col]);
            const safeVal = isNaN(val) ? 0 : val;
            // Replace whole-word occurrences of the column name
            expr = expr.replace(new RegExp(`\\b${col.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), safeVal);
        });

        // Allow only safe math characters
        if (!/^[\d\s+\-*/().,^%]+$/.test(expr)) return 'Invalid formula';

        // Replace ^ with ** for exponentiation
        expr = expr.replace(/\^/g, '**');

        // eslint-disable-next-line no-new-func
        const result = Function(`"use strict"; return (${expr})`)();
        return isNaN(result) ? 'Error' : +result.toFixed(4);
    } catch {
        return 'Error';
    }
};

/**
 * addCalculatedColumn — applies a formula to the whole dataset.
 * Returns a new dataset with the new column appended.
 */
export const addCalculatedColumn = (data, newColName, formula) => {
    if (!data || !newColName || !formula) return data;
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    return data.map(row => ({
        ...row,
        [newColName]: evaluateFormula(row, formula, columns),
    }));
};
