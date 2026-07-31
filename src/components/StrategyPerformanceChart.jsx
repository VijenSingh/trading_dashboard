'use client';

import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { parseLocalDate } from "@/lib/date";
import styles from "../css/StrategyPerformanceChart.module.css";

function StrategyPerformanceChart({ equityData }) {
  const [selectedStrategy, setSelectedStrategy] = useState("All Strategies");
  const [showExplanation, setShowExplanation] = useState(false);

  if (!equityData || equityData.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>No data available</p>
      </div>
    );
  }

  // Calculate moving averages
  const calculateMA = (data, period, field) => {
    return data.map((item, index) => {
      if (index < period - 1) return { ...item, [`ma${period}`]: null };

      const sum = data
        .slice(index - period + 1, index + 1)
        .reduce((total, curr) => total + (curr[field] || 0), 0);

      return { ...item, [`ma${period}`]: sum / period };
    });
  };

  // Process data with moving averages
  const processedData = useMemo(() => {
    let data = [...equityData];

    // Calculate cumulative P&L if not already present
    if (data.length > 0 && !data[0].cumulativePL) {
      let runningTotal = 0;
      data = data.map(item => {
        runningTotal += item.pnl || 0;
        return { ...item, cumulativePL: runningTotal };
      });
    }

    // Calculate moving averages
    data = calculateMA(data, 5, "cumulativePL");
    data = calculateMA(data, 10, "cumulativePL");
    data = calculateMA(data, 20, "cumulativePL");

    return data;
  }, [equityData]);

  // Get unique strategies for dropdown
  const strategies = useMemo(() => {
    const uniqueStrategies = new Set();
    equityData.forEach(item => {
      if (item.strategy) uniqueStrategies.add(item.strategy);
    });
    return ["All Strategies", ...Array.from(uniqueStrategies)];
  }, [equityData]);

  // Filter data by selected strategy
  const filteredData = useMemo(() => {
    if (selectedStrategy === "All Strategies") return processedData;
    return processedData.filter(item => item.strategy === selectedStrategy);
  }, [processedData, selectedStrategy]);

  // Custom tooltip component with improved styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>
            {`Date: ${parseLocalDate(label).toLocaleDateString("en-GB")}`}
          </p>
          <div className={styles.tooltipRows}>
            {payload.map((entry, index) => (
              <p key={`item-${index}`} className={styles.tooltipRow}>
                <span
                  className={styles.tooltipSwatch}
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span className={styles.tooltipName}>{entry.name}:</span>
                <span className={styles.tooltipValue}>${entry.value.toFixed(2)}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.topRow}>
        <h3 className={styles.heading}>
          📊 Strategy Performance
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={styles.infoBtn}
            aria-label="Show explanation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.infoIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </button>
        </h3>

        <div className={styles.selectWrap}>
          <label htmlFor="strategy-select" className={styles.selectLabel}>
            Select Strategy:
          </label>
          <select
            id="strategy-select"
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            className={styles.select}
          >
            {strategies.map(strategy => (
              <option key={strategy} value={strategy}>{strategy}</option>
            ))}
          </select>
        </div>
      </div>

      {showExplanation && (
        <div className={styles.explanation}>
          <h4 className={styles.explanationTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.explanationIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            How to Read This Chart
          </h4>
          <div className={styles.explanationGrid}>
            <div>
              <p className={styles.legendLabel}>
                <span className={styles.dot} style={{ background: "#3987e5" }}></span>
                Cumulative P/L
              </p>
              <p className={styles.legendDesc}>Your total profit/loss over time</p>
            </div>
            <div>
              <p className={styles.legendLabel}>
                <span className={styles.dot} style={{ background: "#eb6834" }}></span>
                5-Day Moving Average
              </p>
              <p className={styles.legendDesc}>Short-term trend indicator</p>
            </div>
            <div>
              <p className={styles.legendLabel}>
                <span className={styles.dot} style={{ background: "#22e06f" }}></span>
                10-Day Moving Average
              </p>
              <p className={styles.legendDesc}>Medium-term trend indicator</p>
            </div>
            <div>
              <p className={styles.legendLabel}>
                <span className={styles.dot} style={{ background: "#9085e9" }}></span>
                20-Day Moving Average
              </p>
              <p className={styles.legendDesc}>Long-term trend indicator</p>
            </div>
          </div>
          <p className={styles.proTip}>
            <strong>Pro Tip:</strong> When shorter moving averages cross above longer ones,
            it may indicate an upward trend in your performance.
          </p>
        </div>
      )}

      <div className={styles.chartCard}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2a" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                parseLocalDate(date).toLocaleDateString("en-GB")
              }
              angle={-35}
              textAnchor="end"
              tick={{ fontSize: 12, fill: "#898781" }}
              height={60}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#898781" }}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ color: "#c3c2b7" }}
            />
            <Line
              type="monotone"
              dataKey="cumulativePL"
              stroke="#3987e5"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, stroke: "#9085e9", strokeWidth: 2 }}
              name="Cumulative P/L"
            />
            <Line
              type="monotone"
              dataKey="ma5"
              stroke="#eb6834"
              strokeWidth={2}
              dot={false}
              name="5-Day MA"
            />
            <Line
              type="monotone"
              dataKey="ma10"
              stroke="#22e06f"
              strokeWidth={2}
              dot={false}
              name="10-Day MA"
            />
            <Line
              type="monotone"
              dataKey="ma20"
              stroke="#9085e9"
              strokeWidth={2}
              dot={false}
              name="20-Day MA"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StrategyPerformanceChart;
