"use client";
import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer
} from "recharts";
import styles from "../css/MaximumLossProfit.module.css";

export default function MaximumLossProfit({ trades }) {
  const safeTrades = trades ?? [];
  const pl = (t) => (t.exitPrice - t.entryPrice) * t.quantity;

  const {
    equityData,
    peakValue,
    maxDrawdownValue,
    maxDrawdownPct,
    ddStartIndex,
    ddEndIndex,
    winningStreak,
    losingStreak,
  } = useMemo(() => {
    if (safeTrades.length === 0) {
      return {
        equityData: [],
        peakValue: 0,
        maxDrawdownValue: 0,
        maxDrawdownPct: 0,
        ddStartIndex: 0,
        ddEndIndex: 0,
        winningStreak: 0,
        losingStreak: 0,
      };
    }

    // Build cumulative equity
    let cumulative = 0;
    const equity = safeTrades.map((t, i) => {
      const profit = pl(t);
      cumulative += profit;
      return { i, equity: cumulative };
    });

    if (equity.length === 0) {
      return {
        equityData: [],
        peakValue: 0,
        maxDrawdownValue: 0,
        maxDrawdownPct: 0,
        ddStartIndex: 0,
        ddEndIndex: 0,
        winningStreak: 0,
        losingStreak: 0,
      };
    }

    // Winning/Losing streaks
    let currentWin = 0, maxWin = 0;
    let currentLose = 0, maxLose = 0;
    safeTrades.forEach((t) => {
      const p = pl(t);
      if (p > 0) {
        currentWin += 1;
        currentLose = 0;
        if (currentWin > maxWin) maxWin = currentWin;
      } else if (p < 0) {
        currentLose += 1;
        currentWin = 0;
        if (currentLose > maxLose) maxLose = currentLose;
      } else {
        currentWin = 0;
        currentLose = 0;
      }
    });

    // Max Drawdown
    let runningPeak = equity[0].equity;
    let runningPeakIdx = 0;
    let bestDD = 0;
    let ddStart = 0;
    let ddEnd = 0;

    for (let i = 0; i < equity.length; i++) {
      const eq = equity[i].equity;

      if (eq > runningPeak) {
        runningPeak = eq;
        runningPeakIdx = i;
      }

      const dd = runningPeak - eq;
      if (dd > bestDD) {
        bestDD = dd;
        ddStart = runningPeakIdx;
        ddEnd = i;
      }
    }

    // Ultimate peak
    const ultimatePeak = Math.max(...equity.map((e) => e.equity));

    // Max DD %
    const maxDDPctUltimate = ultimatePeak !== 0 ? (bestDD / ultimatePeak) * 100 : 0;

    // Prepare equityData for chart
    let peakSoFar = equity[0].equity;
    const equityForChart = equity.map((pt) => {
      if (pt.equity > peakSoFar) peakSoFar = pt.equity;
      return {
        i: pt.i,
        equity: Number(pt.equity.toFixed(2)),
        peakSoFar: Number(peakSoFar.toFixed(2)),
      };
    });

    return {
      equityData: equityForChart,
      peakValue: Number(ultimatePeak.toFixed(2)),
      maxDrawdownValue: Number(bestDD.toFixed(2)),
      maxDrawdownPct: Number(maxDDPctUltimate.toFixed(2)),
      ddStartIndex: ddStart,
      ddEndIndex: ddEnd,
      winningStreak: maxWin,
      losingStreak: maxLose,
    };
  }, [safeTrades]);

  if (safeTrades.length === 0) {
    return <p className={styles.noData}>No trades to display max loss/profit.</p>;
  }

  // Other summary stats
  const maxProfit = Math.max(...safeTrades.map(pl), 0);
  const maxLoss = Math.min(...safeTrades.map(pl), 0);
  const profitTrades = safeTrades.filter((t) => pl(t) > 0).length;
  const losingTrades = safeTrades.filter((t) => pl(t) < 0).length;

  // Chart data
  const chartData = equityData.map((d) => ({
    i: d.i,
    equity: d.equity,
    drawdown: Number((d.peakSoFar - d.equity).toFixed(2)),
  }));

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Performance Analysis</h3>
      
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <h4>Profit/Loss Analysis</h4>
          <div className={styles.metricRow}>
            <span>Max Profit:</span>
            <span className={styles.positive}>${maxProfit.toFixed(2)}</span>
          </div>
          <div className={styles.metricRow}>
            <span>Max Loss:</span>
            <span className={styles.negative}>${maxLoss.toFixed(2)}</span>
          </div>
          <div className={styles.metricRow}>
            <span>Profit Trades:</span>
            <span>{profitTrades}</span>
          </div>
          <div className={styles.metricRow}>
            <span>Losing Trades:</span>
            <span>{losingTrades}</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <h4>Drawdown Analysis</h4>
          <div className={styles.metricRow}>
            <span>Peak Value:</span>
            <span>${peakValue.toFixed(2)}</span>
          </div>
          <div className={styles.metricRow}>
            <span>Max Drawdown:</span>
            <span className={styles.negative}>${maxDrawdownValue.toFixed(2)}</span>
          </div>
          <div className={styles.metricRow}>
            <span>Drawdown %:</span>
            <span className={styles.negative}>{maxDrawdownPct.toFixed(2)}%</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <h4>Streak Analysis</h4>
          <div className={styles.metricRow}>
            <span>Winning Streak:</span>
            <span className={styles.positive}>{winningStreak} trades</span>
          </div>
          <div className={styles.metricRow}>
            <span>Losing Streak:</span>
            <span className={styles.negative}>{losingStreak} trades</span>
          </div>
          <div className={styles.metricRow}>
            <span>Total Trades:</span>
            <span>{safeTrades.length}</span>
          </div>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h4 className={styles.chartTitle}>Equity Curve & Drawdown</h4>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22e06f" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22e06f" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff5c68" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#ff5c68" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis dataKey="i" tick={{ fontSize: 12, fill: "#898781" }} />
              <YAxis tick={{ fontSize: 12, fill: "#898781" }} />
              <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2a" />
              <Tooltip
                formatter={(value) => [`$${value}`, "Value"]}
                contentStyle={{
                  backgroundColor: "rgba(20, 18, 30, 0.92)",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "#ffffff",
                }}
                labelStyle={{ color: "#c3c2b7" }}
              />

              {/* Drawdown area */}
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#ff5c68"
                fill="url(#colorDrawdown)"
                name="Drawdown"
              />

              {/* Equity line */}
              <Line
                type="monotone"
                dataKey="equity"
                stroke="#22e06f"
                strokeWidth={2}
                dot={false}
                name="Equity"
              />

              {/* Highlight max DD window */}
              {ddStartIndex !== ddEndIndex && (
                <ReferenceArea
                  x1={ddStartIndex}
                  x2={ddEndIndex}
                  strokeOpacity={0.3}
                  fill="#ff5c68"
                  fillOpacity={0.15}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}