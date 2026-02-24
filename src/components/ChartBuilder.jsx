import React, { useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts';

const ChartBuilder = ({ chart, data, onDelete, onSelect }) => {
  const chartRef = useRef(null);

  const aggregateData = (data, xField, yField, aggregation) => {
    const grouped = {};
    data.forEach(row => {
      const xVal = row[xField];
      const yVal = Number(row[yField]);
      if (!grouped[xVal]) {
        grouped[xVal] = [];
      }
      grouped[xVal].push(yVal);
    });

    return Object.keys(grouped).map(key => {
      const values = grouped[key];
      let aggregatedValue;
      switch (aggregation) {
        case 'sum':
          aggregatedValue = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'count':
          aggregatedValue = values.length;
          break;
        case 'min':
          aggregatedValue = Math.min(...values);
          break;
        case 'max':
          aggregatedValue = Math.max(...values);
          break;
        case 'median': {
          const sorted = values.sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          aggregatedValue = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
          break;
        }
        default:
          aggregatedValue = values.reduce((a, b) => a + b, 0);
      }
      return { name: key, value: aggregatedValue };
    });
  };

  const generateChartOption = useCallback((chart, data) => {
    const baseOption = {
      title: {
        text: chart.title,
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: chart.showTooltip ? {
        trigger: chart.type === 'pie' || chart.type === 'donut' ? 'item' : 'axis',
        formatter: chart.type === 'pie' || chart.type === 'donut' ?
          '{a} <br/>{b}: {c} ({d}%)' : '{a}: {c}'
      } : false,
      legend: chart.showLegend ? {
        data: chart.legend ? [...new Set(data.map(row => row[chart.legend]))] : [chart.yAxis],
        bottom: 0
      } : false,
    };

    switch (chart.type) {
      case 'bar':
        return {
          ...baseOption,
          xAxis: chart.orientation === 'horizontal' ? {
            type: 'value'
          } : {
            type: 'category',
            data: [...new Set(data.map(row => row[chart.xAxis]))]
          },
          yAxis: chart.orientation === 'horizontal' ? {
            type: 'category',
            data: [...new Set(data.map(row => row[chart.xAxis]))]
          } : {
            type: 'value'
          },
          series: [{
            data: aggregateData(data, chart.xAxis, chart.yAxis, chart.aggregation),
            type: 'bar',
            name: chart.yAxis,
            label: chart.showLabels ? { show: true, position: 'top' } : false
          }]
        };

      case 'line':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: [...new Set(data.map(row => row[chart.xAxis]))]
          },
          yAxis: { type: 'value' },
          series: [{
            data: aggregateData(data, chart.xAxis, chart.yAxis, chart.aggregation),
            type: 'line',
            name: chart.yAxis,
            smooth: chart.smooth,
            label: chart.showLabels ? { show: true, position: 'top' } : false
          }]
        };

      case 'pie': {
        const pieData = aggregateData(data, chart.xAxis, chart.yAxis, chart.aggregation);
        return {
          ...baseOption,
          series: [{
            data: pieData.map(item => ({ name: item.name, value: item.value })),
            type: 'pie',
            radius: `${chart.radius}%`,
            label: chart.showLabels ? {
              show: true,
              formatter: '{b}: {d}%'
            } : false,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        };
      }

      case 'area':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: [...new Set(data.map(row => row[chart.xAxis]))]
          },
          yAxis: { type: 'value' },
          series: [{
            data: aggregateData(data, chart.xAxis, chart.yAxis, chart.aggregation),
            type: 'line',
            areaStyle: chart.stack ? {} : { opacity: 0.3 },
            stack: chart.stack ? 'total' : null,
            name: chart.yAxis,
            smooth: chart.smooth,
            label: chart.showLabels ? { show: true, position: 'top' } : false
          }]
        };

      case 'scatter':
        return {
          ...baseOption,
          xAxis: { type: 'value', name: chart.xAxis },
          yAxis: { type: 'value', name: chart.yAxis },
          series: [{
            data: data.map(row => {
              const point = [Number(row[chart.xAxis]), Number(row[chart.yAxis])];
              if (chart.size) {
                point.push(Number(row[chart.size]));
              }
              return point;
            }),
            type: 'scatter',
            name: chart.yAxis,
            symbolSize: chart.size ? (val) => Math.sqrt(val) * 10 : 10,
            itemStyle: chart.color ? {
              color: (params) => {
                const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
                const colorIndex = data.findIndex(row => row[chart.xAxis] === params.data[0] && row[chart.yAxis] === params.data[1]);
                return colors[colorIndex % colors.length];
              }
            } : undefined
          }]
        };

      case 'donut': {
        const donutData = aggregateData(data, chart.xAxis, chart.yAxis, chart.aggregation);
        return {
          ...baseOption,
          series: [{
            data: donutData.map(item => ({ name: item.name, value: item.value })),
            type: 'pie',
            radius: [`${chart.innerRadius}%`, `${chart.radius}%`],
            label: chart.showLabels ? {
              show: true,
              formatter: '{b}: {d}%'
            } : false,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        };
      }

      case 'stackedBar': {
        // Group data by legend field
        const groupedData = {};
        data.forEach(row => {
          const legendVal = row[chart.legend] || 'Default';
          const xVal = row[chart.xAxis];
          const yVal = Number(row[chart.yAxis]);

          if (!groupedData[legendVal]) {
            groupedData[legendVal] = {};
          }
          if (!groupedData[legendVal][xVal]) {
            groupedData[legendVal][xVal] = [];
          }
          groupedData[legendVal][xVal].push(yVal);
        });

        const xCategories = [...new Set(data.map(row => row[chart.xAxis]))];
        const series = Object.keys(groupedData).map(legendKey => ({
          name: legendKey,
          type: 'bar',
          stack: 'total',
          data: xCategories.map(xCat => {
            const values = groupedData[legendKey][xCat] || [];
            const aggregatedValue = values.length > 0 ?
              values.reduce((a, b) => a + b, 0) / values.length : 0; // Simple average for demo
            return aggregatedValue;
          }),
          label: chart.showLabels ? { show: true, position: 'inside' } : false
        }));

        return {
          ...baseOption,
          xAxis: { type: 'category', data: xCategories },
          yAxis: { type: 'value' },
          series
        };
      }

      case 'multiLine': {
        // Group data by legend field
        const groupedData = {};
        data.forEach(row => {
          const legendVal = row[chart.legend] || 'Default';
          const xVal = row[chart.xAxis];
          const yVal = Number(row[chart.yAxis]);

          if (!groupedData[legendVal]) {
            groupedData[legendVal] = {};
          }
          groupedData[legendVal][xVal] = yVal;
        });

        const xCategories = [...new Set(data.map(row => row[chart.xAxis]))];
        const series = Object.keys(groupedData).map(legendKey => ({
          name: legendKey,
          type: 'line',
          smooth: chart.smooth,
          data: xCategories.map(xCat => groupedData[legendKey][xCat] || 0),
          label: chart.showLabels ? { show: true, position: 'top' } : false
        }));

        return {
          ...baseOption,
          xAxis: { type: 'category', data: xCategories },
          yAxis: { type: 'value' },
          series
        };
      }

      case 'radar': {
        // Simplified radar - using aggregated data as indicators
        const aggregatedData = aggregateData(data, chart.xAxis, chart.yAxis, chart.aggregation);
        const indicators = aggregatedData.map(item => ({
          name: item.name,
          max: Math.max(...aggregatedData.map(d => d.value)) * 1.2
        }));

        return {
          ...baseOption,
          radar: { indicator: indicators },
          series: [{
            type: 'radar',
            data: [{
              value: aggregatedData.map(item => item.value),
              name: chart.yAxis
            }]
          }]
        };
      }

      case 'heatmap': {
        // Simplified heatmap
        const xCategories = [...new Set(data.map(row => row[chart.xAxis]))];
        const yCategories = [...new Set(data.map(row => row[chart.yAxis]))];

        const heatmapData = [];
        xCategories.forEach((x, i) => {
          yCategories.forEach((y, j) => {
            const count = data.filter(row => row[chart.xAxis] === x && row[chart.yAxis] === y).length;
            heatmapData.push([i, j, count]);
          });
        });

        return {
          ...baseOption,
          xAxis: { type: 'category', data: xCategories },
          yAxis: { type: 'category', data: yCategories },
          visualMap: {
            min: 0,
            max: Math.max(...heatmapData.map(item => item[2])),
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '15%'
          },
          series: [{
            type: 'heatmap',
            data: heatmapData,
            label: { show: chart.showLabels }
          }]
        };
      }

      case 'histogram': {
        const values = data.map(row => Number(row[chart.xAxis])).filter(val => !isNaN(val));
        const min = Math.min(...values);
        const max = Math.max(...values);
        const binWidth = (max - min) / chart.binCount;

        const bins = [];
        for (let i = 0; i < chart.binCount; i++) {
          const binStart = min + i * binWidth;
          const binEnd = min + (i + 1) * binWidth;
          const count = values.filter(val => val >= binStart && val < binEnd).length;
          bins.push(count);
        }

        const binLabels = [];
        for (let i = 0; i < chart.binCount; i++) {
          const binStart = min + i * binWidth;
          const binEnd = min + (i + 1) * binWidth;
          binLabels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);
        }

        return {
          ...baseOption,
          xAxis: { type: 'category', data: binLabels },
          yAxis: { type: 'value' },
          series: [{
            data: bins,
            type: 'bar',
            name: 'Frequency',
            label: chart.showLabels ? { show: true, position: 'top' } : false
          }]
        };
      }

      case 'bubble': {
        return {
          ...baseOption,
          xAxis: { type: 'value', name: chart.xAxis },
          yAxis: { type: 'value', name: chart.yAxis },
          series: [{
            data: data.map(row => [
              Number(row[chart.xAxis]),
              Number(row[chart.yAxis]),
              Number(row[chart.size]) || 10
            ]),
            type: 'scatter',
            name: chart.yAxis,
            symbolSize: (val) => Math.sqrt(val[2]) * 5,
            itemStyle: chart.color ? {
              color: (params) => {
                const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];
                const colorIndex = data.findIndex(row =>
                  row[chart.xAxis] === params.data[0] &&
                  row[chart.yAxis] === params.data[1]
                );
                return colors[colorIndex % colors.length];
              }
            } : undefined
          }]
        };
      }

      case 'funnel': {
        const funnelData = aggregateData(data, chart.xAxis, chart.yAxis, chart.aggregation)
          .sort((a, b) => b.value - a.value);

        return {
          ...baseOption,
          series: [{
            type: 'funnel',
            data: funnelData.map(item => ({ name: item.name, value: item.value })),
            label: chart.showLabels ? {
              show: true,
              position: 'inside'
            } : false
          }]
        };
      }

      case 'boxplot': {
        // Simplified boxplot - calculate quartiles for each category
        const categories = [...new Set(data.map(row => row[chart.xAxis]))];
        const boxplotData = categories.map(category => {
          const values = data
            .filter(row => row[chart.xAxis] === category)
            .map(row => Number(row[chart.yAxis]))
            .sort((a, b) => a - b);

          const q1 = values[Math.floor(values.length * 0.25)];
          const median = values[Math.floor(values.length * 0.5)];
          const q3 = values[Math.floor(values.length * 0.75)];
          const min = Math.min(...values);
          const max = Math.max(...values);

          return [min, q1, median, q3, max];
        });

        return {
          ...baseOption,
          xAxis: { type: 'category', data: categories },
          yAxis: { type: 'value' },
          series: [{
            type: 'boxplot',
            data: boxplotData,
            name: chart.yAxis
          }]
        };
      }

      case 'combo': {
        // Combo chart with bar and line
        const barData = aggregateData(data, chart.xAxis, chart.yAxis, 'sum');
        const lineData = aggregateData(data, chart.xAxis, chart.yAxis, 'avg');

        return {
          ...baseOption,
          xAxis: { type: 'category', data: barData.map(item => item.name) },
          yAxis: { type: 'value' },
          series: [
            {
              data: barData.map(item => item.value),
              type: 'bar',
              name: 'Sum',
              yAxisIndex: 0,
              label: chart.showLabels ? { show: true, position: 'top' } : false
            },
            {
              data: lineData.map(item => item.value),
              type: 'line',
              name: 'Average',
              yAxisIndex: 1,
              smooth: chart.smooth,
              label: chart.showLabels ? { show: true, position: 'top' } : false
            }
          ]
        };
      }

      default:
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: [...new Set(data.map(row => row[chart.xAxis]))]
          },
          yAxis: { type: 'value' },
          series: [{
            data: aggregateData(data, chart.xAxis, chart.yAxis, chart.aggregation),
            type: 'bar',
            name: chart.yAxis,
            label: chart.showLabels ? { show: true, position: 'top' } : false
          }]
        };
    }
  }, []);

  useEffect(() => {
    if (data && data.length > 0 && chartRef.current) {
      const chartInstance = echarts.init(chartRef.current);
      const option = generateChartOption(chart, data);
      chartInstance.setOption(option, true); // Not merge to avoid issues

      const handleResize = () => chartInstance.resize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance.dispose();
      };
    }
  }, [chart, data, generateChartOption]);

  return (
    <div className="chart-card" onClick={onSelect}>
      <div className="chart-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">{chart.title}</h6>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete chart"
        >
          ×
        </button>
      </div>
      <div
        ref={chartRef}
        style={{ width: '100%', height: '350px' }}
        className="chart-container"
      ></div>
    </div>
  );
};

export default ChartBuilder;