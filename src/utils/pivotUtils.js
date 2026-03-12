






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






export const evaluateFormula = (row, formula, columns) => {
    try {
        
        const sortedCols = [...columns].sort((a, b) => b.length - a.length);

        
        let expr = formula;
        sortedCols.forEach(col => {
            const val = Number(row[col]);
            const safeVal = isNaN(val) ? 0 : val;
            
            expr = expr.replace(new RegExp(`\\b${col.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), safeVal);
        });

        
        if (!/^[\d\s+\-*/().,^%]+$/.test(expr)) return 'Invalid formula';

        
        expr = expr.replace(/\^/g, '**');

        
        const result = Function(`"use strict"; return (${expr})`)();
        return isNaN(result) ? 'Error' : +result.toFixed(4);
    } catch {
        return 'Error';
    }
};


export const addCalculatedColumn = (data, newColName, formula) => {
    if (!data || !newColName || !formula) return data;
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    return data.map(row => ({
        ...row,
        [newColName]: evaluateFormula(row, formula, columns),
    }));
};

