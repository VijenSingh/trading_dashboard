"use client";
import React, { useState } from "react";
import styles from "../css/StrategyHeatmap.module.css";
import useStrategyName from "@/components/useStrategyName";

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

const StrategyHeatmap = ({ data, strategy, years }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(
    years.includes(currentYear) ? currentYear : years[0]
  );

  const strategyData = data.filter((d) => d.strategy === strategy);
  const strategyName = useStrategyName(strategy);

  // Group by date → PnL
  const pnlByDate = {};
  strategyData.forEach((trade) => {
    const date = trade.date;
    const pnl = (trade.exitPrice - trade.entryPrice) * trade.quantity;
    pnlByDate[date] = (pnlByDate[date] || 0) + pnl;
  });

  // Monthly stats
  const monthlyStats = {};

  Object.keys(pnlByDate).forEach((date) => {
    const month = date.slice(0, 7); // YYYY-MM
    const pnl = pnlByDate[date];

    if (!monthlyStats[month]) {
      monthlyStats[month] = {
        totalPnl: 0,
        win: 0,
        loss: 0,
      };
    }

    monthlyStats[month].totalPnl += pnl;
    if (pnl > 0) monthlyStats[month].win++;
    if (pnl < 0) monthlyStats[month].loss++;
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{strategyName} - Heatmap</h2>

      {/* Year Tabs */}
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

      <div className={styles.grid}>
        {Array.from({ length: 12 }, (_, monthIdx) => {
          const month = monthIdx + 1;
          const monthStr = `${selectedYear}-${month
            .toString()
            .padStart(2, "0")}`;

          const days = daysInMonth(selectedYear, month);

          const win = monthlyStats[monthStr]?.win || 0;
          const loss = monthlyStats[monthStr]?.loss || 0;
          const total = win + loss;

          const winRate = total > 0 ? ((win / total) * 100).toFixed(1) : 0;

          const totalPnl = monthlyStats[monthStr]?.totalPnl || 0;

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

                  const tooltipText =
                    pnl !== 0
                      ? `${dateStr} → $${pnl.toFixed(2)}`
                      : `${dateStr} → No Trades`;

                  return (
                    <div
                      key={dateStr}
                      className={`${styles.dayCell} ${cellClass}`}
                      title={tooltipText}
                      tabIndex={0}
                    >
                      <span className={styles.tooltip}>{tooltipText}</span>
                    </div>
                  );
                })}
              </div>

              {/* 📌 NEW STATS BELOW MONTH */}
              <div className={styles.monthStats}>
                <p>Wins: {win} | Loss: {loss}</p>
                <p>Win Rate: {winRate}%</p>
                <p
                  className={
                    totalPnl >= 0 ? styles.monthProfit : styles.monthLoss
                  }
                >
                  ${totalPnl.toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StrategyHeatmap;
