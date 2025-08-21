"use client";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import UseAllStrategiesData from "@/components/UseAllStrategiesData";

import styles from "../css/DonutChart.module.css";

const COLORS = [
  '#00FFFF', '#36A2EB', '#FFCE56', '#8fce00', '#FF69B4', 
  '#FF3C33', '#581845', '#4F5F52', '#0A4949', '#F1820C',
  '#9C27B0', '#3F51B5', '#009688', '#8BC34A', '#FFC107'
];

const DonutChartRecharts = ({ title }) => {
  const data = UseAllStrategiesData();
  
  const chartData = Object.keys(data).map((key, index) => ({
    name: key.replace(/_/g, ' '), // Convert underscores to spaces
    value: Math.abs(Number(data[key])), // Use absolute value for visualization
    originalValue: Number(data[key]), // Keep original for tooltip
  }));

  // Calculate total for percentage display
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{data.name}</p>
          <p className={styles.tooltipValue}>
            ₹{data.originalValue.toFixed(2)}
          </p>
          <p className={styles.tooltipPercentage}>
            {((data.value / totalValue) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className={styles.legendContainer}>
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className={styles.legendItem}>
            <div 
              className={styles.legendColor} 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className={styles.legendText}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              label={({ name, percent }) => 
                percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
              }
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Value:</span>
          <span className={styles.summaryValue}>₹{totalValue.toFixed(2)}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Strategies:</span>
          <span className={styles.summaryValue}>{chartData.length}</span>
        </div>
      </div>
    </div>
  );
};

export default DonutChartRecharts;