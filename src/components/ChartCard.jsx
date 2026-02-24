import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const ChartCard = ({ data, chartType, xColumn, yColumn, title }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (data && data.length > 0 && xColumn && yColumn && chartRef.current) {
      const chart = echarts.init(chartRef.current);
      const xData = data.map(row => row[xColumn]);
      const yData = data.map(row => Number(row[yColumn]));

      let option;
      const commonOption = {
        title: { text: title, left: 'center' },
        tooltip: { trigger: 'axis' },
        legend: { data: [yColumn] },
        xAxis: { type: 'category', data: xData },
        yAxis: { type: 'value' },
      };

      if (chartType === 'bar') {
        option = {
          ...commonOption,
          series: [{ data: yData, type: 'bar', name: yColumn }],
        };
      } else if (chartType === 'line') {
        option = {
          ...commonOption,
          series: [{ data: yData, type: 'line', name: yColumn }],
        };
      } else if (chartType === 'pie') {
        const pieData = xData.map((x, i) => ({ name: x, value: yData[i] }));
        option = {
          title: { text: title, left: 'center' },
          tooltip: { trigger: 'item' },
          legend: { orient: 'vertical', left: 'left' },
          series: [{ data: pieData, type: 'pie', radius: '50%' }],
        };
      } else if (chartType === 'area') {
        option = {
          ...commonOption,
          series: [{ data: yData, type: 'line', areaStyle: {}, name: yColumn }],
        };
      } else if (chartType === 'scatter') {
        option = {
          title: { text: title, left: 'center' },
          xAxis: { type: 'value' },
          yAxis: { type: 'value' },
          series: [{ data: yData.map((y, i) => [Number(xData[i]), y]), type: 'scatter', name: yColumn }],
        };
      }

      chart.setOption(option);

      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [data, chartType, xColumn, yColumn, title]);

  return (
    <div className="chart-card">
      <div ref={chartRef} style={{ width: '100%', height: '300px' }}></div>
    </div>
  );
};

export default ChartCard;