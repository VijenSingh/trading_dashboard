"use client";
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import styles from "../css/PerformanceTables.module.css";

const PerformanceTables = ({ trades }) => {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const data = trades.map((trade) => ({
    date: trade.date,
    pnl: (trade.exitPrice - trade.entryPrice) * trade.quantity,
  }));

  const calculateDrawdown = (pnlList) => {
    let peak = 0,
      maxDrawdown = 0,
      cumulative = 0;
    pnlList.forEach((val) => {
      cumulative += val;
      if (cumulative > peak) peak = cumulative;
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });
    return maxDrawdown;
  };

  const monthData = useMemo(() => {
    const grouped = {};
    data.forEach(({ date, pnl }) => {
      const d = new Date(date);
      const month = d.getMonth();
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(pnl);
    });
    return Object.keys(grouped).map((m) => {
      const pnlList = grouped[m];
      return {
        month: monthNames[m],
        totalReturn: pnlList.reduce((a, b) => a + b, 0),
        maxProfit: Math.max(...pnlList),
        maxLoss: Math.min(...pnlList),
        maxDrawdown: calculateDrawdown(pnlList),
      };
    });
  }, [data]);

  const dayData = useMemo(() => {
    const grouped = {};
    data.forEach(({ date, pnl }) => {
      const d = new Date(date);
      const day = d.getDay();
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(pnl);
    });
    return Object.keys(grouped).map((dy) => {
      const pnlList = grouped[dy];
      return {
        day: dayNames[dy],
        totalReturn: pnlList.reduce((a, b) => a + b, 0),
        maxProfit: Math.max(...pnlList),
        maxLoss: Math.min(...pnlList),
        maxDrawdown: calculateDrawdown(pnlList),
      };
    });
  }, [data]);

  return (
    <div className={styles.container}>
      {/* Month Table */}
      <div className={styles.card}>
        <h2 className={styles.title}>📅 Month-wise Performance</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Month</th>
                <th className={styles.th}>Total Return</th>
                <th className={styles.th}>Max Profit</th>
                <th className={styles.th}>Max Loss</th>
                <th className={styles.th}>Max Drawdown</th>
              </tr>
            </thead>
            <tbody>
              {monthData.map((row, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.td}>{row.month}</td>
                  <td className={styles.td}>{row.totalReturn.toFixed(2)}</td>
                  <td className={`${styles.td} ${styles.positive}`}>{row.maxProfit.toFixed(2)}</td>
                  <td className={`${styles.td} ${styles.negative}`}>{row.maxLoss.toFixed(2)}</td>
                  <td className={styles.td}>{row.maxDrawdown.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Chart */}
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, "Value"]} />
              <Bar dataKey="totalReturn">
                {monthData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.totalReturn >= 0 ? "#38a169" : "#e53e3e"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Day Table */}
      <div className={styles.card}>
        <h2 className={styles.title}>📊 Day-of-Week Performance</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Day</th>
                <th className={styles.th}>Total Return</th>
                <th className={styles.th}>Max Profit</th>
                <th className={styles.th}>Max Loss</th>
                <th className={styles.th}>Max Drawdown</th>
              </tr>
            </thead>
            <tbody>
              {dayData.map((row, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.td}>{row.day}</td>
                  <td className={styles.td}>{row.totalReturn.toFixed(2)}</td>
                  <td className={`${styles.td} ${styles.positive}`}>{row.maxProfit.toFixed(2)}</td>
                  <td className={`${styles.td} ${styles.negative}`}>{row.maxLoss.toFixed(2)}</td>
                  <td className={styles.td}>{row.maxDrawdown.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Chart */}
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, "Value"]} />
              <Bar dataKey="totalReturn">
                {dayData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.totalReturn >= 0 ? "#38a169" : "#e53e3e"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTables;