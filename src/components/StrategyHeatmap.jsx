"use client";
import React, { useState } from "react";
import styles from "../css/StrategyHeatmap.module.css";

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

const StrategyHeatmap = ({ data, strategy, years }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(
    years.includes(currentYear) ? currentYear : years[0]
  );

  // Filter data for this strategy
  const strategyData = data.filter((d) => d.strategy === strategy);

  // Group by date
  const pnlByDate = {};
  strategyData.forEach((trade) => {
    const date = trade.date;
    const pnl = (trade.exitPrice - trade.entryPrice) * trade.quantity;
    pnlByDate[date] = (pnlByDate[date] || 0) + pnl;
  });

  // Group monthly summary
  const monthlySummary = {};
  Object.keys(pnlByDate).forEach((date) => {
    const month = date.slice(0, 7); // YYYY-MM
    monthlySummary[month] = (monthlySummary[month] || 0) + pnlByDate[date];
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{strategy} - Heatmap</h2>

      {/* 🔹 Year Tabs */}
      <div className={styles.yearTabs}>
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`${styles.yearTab} ${
              year === selectedYear ? styles.activeTab : ""
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* 🔹 Heatmap Grid */}
      <div className={styles.grid}>
        {Array.from({ length: 12 }, (_, monthIdx) => {
          const month = monthIdx + 1;
          const monthStr = `${selectedYear}-${month
            .toString()
            .padStart(2, "0")}`;
          const days = daysInMonth(selectedYear, month);

          return (
            <div key={month} className={styles.monthCard}>
              <h4 className={styles.monthLabel}>
                {new Date(selectedYear, month - 1).toLocaleString("default", {
                  month: "short",
                })}
              </h4>
              <div className={styles.daysGrid}>
                {Array.from({ length: days }, (_, day) => {
                  const dateStr = `${monthStr}-${(day + 1)
                    .toString()
                    .padStart(2, "0")}`;
                  const pnl = pnlByDate[dateStr] || 0;

                  let cellClass = styles.noData;
                  if (pnl > 0) cellClass = styles.profit;
                  if (pnl < 0) cellClass = styles.loss;

                  return (
                    <div
                      key={dateStr}
                      className={`${styles.dayCell} ${cellClass}`}
                    >
                      {/* Tooltip */}
                      <span className={styles.tooltip}>
                        {pnl !== 0
                          ? `${dateStr} → ₹${pnl.toFixed(2)}`
                          : `${dateStr} → No Trades`}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p
                className={
                  monthlySummary[monthStr] >= 0
                    ? styles.monthProfit
                    : styles.monthLoss
                }
              >
                ₹{(monthlySummary[monthStr] || 0).toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StrategyHeatmap;
