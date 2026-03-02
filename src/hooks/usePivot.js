/**
 * usePivot.js — dynamic pivot table and filter hook.
 */
import { useMemo, useState, useCallback } from 'react';
import { buildPivotTable, applyFilter, addCalculatedColumn } from '../utils/pivotUtils';

export const usePivot = (data) => {
    const [pivotConfig, setPivotConfig] = useState({
        rowDim: '', colDim: '', valueCol: '', aggFunc: 'sum',
    });
    const [filterConditions, setFilterConditions] = useState([]);
    const [filterLogic, setFilterLogic] = useState('AND');
    const [calculatedCols, setCalculatedCols] = useState([]); // [{name, formula}]

    // Apply filters to raw data
    const filteredData = useMemo(() => {
        if (!data) return [];
        return applyFilter(data, filterConditions, filterLogic);
    }, [data, filterConditions, filterLogic]);

    // Apply calculated columns to filtered data
    const enrichedData = useMemo(() => {
        let result = filteredData;
        calculatedCols.forEach(({ name, formula }) => {
            result = addCalculatedColumn(result, name, formula);
        });
        return result;
    }, [filteredData, calculatedCols]);

    // Build pivot table
    const pivotResult = useMemo(() => {
        const { rowDim, colDim, valueCol, aggFunc } = pivotConfig;
        if (!rowDim || !valueCol || enrichedData.length === 0) return null;
        return buildPivotTable(enrichedData, rowDim, colDim, valueCol, aggFunc);
    }, [enrichedData, pivotConfig]);

    const addFilter = useCallback((condition) => {
        setFilterConditions(prev => [...prev, { id: Date.now(), ...condition }]);
    }, []);

    const removeFilter = useCallback((id) => {
        setFilterConditions(prev => prev.filter(c => c.id !== id));
    }, []);

    const clearFilters = useCallback(() => setFilterConditions([]), []);

    const addCalcCol = useCallback((name, formula) => {
        setCalculatedCols(prev => [...prev.filter(c => c.name !== name), { name, formula }]);
    }, []);

    const removeCalcCol = useCallback((name) => {
        setCalculatedCols(prev => prev.filter(c => c.name !== name));
    }, []);

    return {
        filteredData, enrichedData, pivotResult, pivotConfig,
        filterConditions, filterLogic, calculatedCols,
        setPivotConfig, setFilterLogic,
        addFilter, removeFilter, clearFilters,
        addCalcCol, removeCalcCol,
        filteredCount: filteredData.length,
        originalCount: data?.length ?? 0,
    };
};
