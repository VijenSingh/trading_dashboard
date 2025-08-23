"use client";
import { useEffect, useState } from "react";

const useStrategyDailyPL = (strategyName) => {
  const [dailyData, setDailyData] = useState([]);
  const [monthlyTotals, setMonthlyTotals] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/trades/${strategyName}`);
        const trades = await res.json();

        // aggregate daily P&L
        const dailyMap = {};
        trades.forEach((trade) => {
          const pl = (trade.exitPrice - trade.entryPrice) * trade.quantity;
          const dateKey = new Date(trade.date).toISOString().split("T")[0];

          if (!dailyMap[dateKey]) dailyMap[dateKey] = 0;
          dailyMap[dateKey] += pl;
        });

        // Convert to array
        const dailyArray = Object.keys(dailyMap).map((date) => ({
          date,
          pl: dailyMap[date],
        }));

        // monthly totals
        const monthly = {};
        dailyArray.forEach(({ date, pl }) => {
          const monthKey = date.slice(0, 7); // "YYYY-MM"
          if (!monthly[monthKey]) monthly[monthKey] = 0;
          monthly[monthKey] += pl;
        });

        setDailyData(dailyArray);
        setMonthlyTotals(monthly);
      } catch (err) {
        console.error("Error fetching daily PL:", err);
      }
    };

    fetchData();
  }, [strategyName]);

  return { dailyData, monthlyTotals };
};

export default useStrategyDailyPL;
