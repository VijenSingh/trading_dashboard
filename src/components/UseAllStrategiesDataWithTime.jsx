"use client";
import { useMemo } from "react";
import { useStrategiesData } from "@/context/StrategiesDataContext";

const STRATEGY_NAMES = [
  "Sniper_NF",
  "Prop_Desk_Ce_04",
  "Prop_Desk_Ce_01",
  "CE_PE",
  "Range_Breakout",
  "Suprita",
  "Shambhu",
  "Mahabuddhi",
  "Vasuki",
  "NF_Selling_Long_Term",
  "VJS",
  "SK",
  "DNS",
  "SIM",
];

const calculateDailyPL = (trades) => {
  const dailyPL = {};
  trades.forEach((trade) => {
    const date = trade.date;
    const profitLoss = (trade.exitPrice - trade.entryPrice) * trade.quantity;
    dailyPL[date] = (dailyPL[date] || 0) + profitLoss;
  });
  return dailyPL;
};

const UseAllStrategiesDataWithTime = () => {
  const { tradesByStrategy } = useStrategiesData();

  return useMemo(() => {
    const strategiesData = {};
    const allDates = new Set();

    STRATEGY_NAMES.forEach((name, index) => {
      const trades = tradesByStrategy[`strategy${index + 1}`] || [];
      const dailyPL = calculateDailyPL(trades);
      strategiesData[name] = dailyPL;
      Object.keys(dailyPL).forEach((date) => allDates.add(date));
    });

    const sortedDates = Array.from(allDates).sort();

    Object.keys(strategiesData).forEach((strategy) => {
      sortedDates.forEach((date) => {
        if (strategiesData[strategy][date] === undefined) {
          strategiesData[strategy][date] = 0;
        }
      });
    });

    return { dates: sortedDates, strategies: strategiesData };
  }, [tradesByStrategy]);
};

export default UseAllStrategiesDataWithTime;
