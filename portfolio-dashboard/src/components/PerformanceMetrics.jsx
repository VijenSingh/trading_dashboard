"use client";
import React from "react";

import styles from "../css/PerformanceMetrics.module.css";

export default function PerformanceMetrics({ trades }) {
  if (!trades.length) return <p className={styles.noData}>No trades to display metrics.</p>;

  const totalProfit = trades.reduce((sum, t) => sum + (t.exitPrice - t.entryPrice) * t.quantity, 0);
  const totalTrades = trades.length;
  const avgProfit = totalProfit / totalTrades;
  
  // Calculate win rate
  const winningTrades = trades.filter(t => (t.exitPrice - t.entryPrice) * t.quantity > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  return (
    <div className={styles.metricsContainer}>
      <h3 className={styles.title}>Performance Metrics</h3>
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{totalTrades}</div>
          <div className={styles.metricLabel}>Total Trades</div>
        </div>
        <div className={`${styles.metricCard} ${totalProfit >= 0 ? styles.profit : styles.loss}`}>
          <div className={styles.metricValue}>₹{totalProfit.toFixed(2)}</div>
          <div className={styles.metricLabel}>Total P&L</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>₹{avgProfit.toFixed(2)}</div>
          <div className={styles.metricLabel}>Avg. Profit/Trade</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{winRate.toFixed(1)}%</div>
          <div className={styles.metricLabel}>Win Rate</div>
        </div>
      </div>
    </div>
  );
}