"use client";
import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector
} from "recharts";
import { motion } from "framer-motion";
import UseAllStrategiesData from "@/components/UseAllStrategiesData";
import styles from "../css/DonutChart.module.css";
import useStrategyName from "@/components/useStrategyName";

const COLORS = [
  "#00FFFF", "#36A2EB", "#FFCE56", "#8fce00", "#FF69B4",
  "#FF3C33", "#581845", "#4F5F52", "#0A4949", "#F1820C",
  "#9C27B0", "#3F51B5", "#009688", "#8BC34A", "#FFC107"
];

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;

  return (
    <g>
      {/* Zoomed slice */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
    </g>
  );
};

const DonutChartRecharts = ({ title }) => {
  const data = UseAllStrategiesData();
  const [activeIndex, setActiveIndex] = useState(null);

  const chartData = Object.keys(data).map((key) => ({
    name: useStrategyName(key),
    value: Math.abs(Number(data[key])),
    originalValue: Number(data[key]),
  }));

  console.log("55=> ", data)
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{d.name}</p>
          <p className={styles.tooltipValue}>₹{d.originalValue.toFixed(2)}</p>
          <p className={styles.tooltipPercentage}>
            {((d.value / totalValue) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = ({ payload }) => (
    <div className={styles.legendContainer}>
      {payload.map((entry, i) => (
        <div key={i} className={styles.legendItem}>
          <div
            className={styles.legendColor}
            style={{ backgroundColor: entry.color }}
          />
          <span className={styles.legendText}>{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h3 className={styles.title}>{title}</h3>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={2}
              animationBegin={200}
              animationDuration={1200}
              animationEasing="ease-out"
              label={({ percent }) =>
                percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
              }
              labelLine={false}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />

            {/* ✅ Center Text */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className={styles.centerText}
            >
              ₹{totalValue.toFixed(0)}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default DonutChartRecharts;
