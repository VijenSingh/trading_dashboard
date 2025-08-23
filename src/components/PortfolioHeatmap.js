"use client";

import styles from "../css/PortfolioHeatmap.module.css";
import useStrategyDailyPL from "@/components/useStrategyDailyPL";


const PortfolioHeatmap = ({ strategy }) => {
  const { dailyData, monthlyTotals } = useStrategyDailyPL(strategy);

  // helper to color intensity
  const getColor = (pl) => {
    if (pl > 0) {
      return `rgba(0, 200, 0, ${Math.min(pl / 5000, 1)})`; // green shade
    } else if (pl < 0) {
      return `rgba(200, 0, 0, ${Math.min(Math.abs(pl) / 5000, 1)})`; // red shade
    }
    return "#eee"; // neutral
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{strategy} - Heatmap</h3>
      <div className={styles.grid}>
        {dailyData.map((day) => (
          <div
            key={day.date}
            className={styles.cell}
            title={`${day.date}: ₹${day.pl.toFixed(2)}`}
            style={{ backgroundColor: getColor(day.pl) }}
          ></div>
        ))}
      </div>

      <div className={styles.monthlyRow}>
        {Object.entries(monthlyTotals).map(([month, total]) => (
          <div key={month} className={styles.monthCell}>
            {month}: <span className={total >= 0 ? styles.profit : styles.loss}>
              ₹{total.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioHeatmap;
