"use client";
import { useState, useEffect } from "react";

const UseAllStrategiesDataWithTime = () => {
  const [data, setData] = useState({
    dates: [],
    strategies: {}
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data for all strategies
        const responses = await Promise.all([
          fetch("/api/trades/strategy1"),
          fetch("/api/trades/strategy2"),
          fetch("/api/trades/strategy3"),
          fetch("/api/trades/strategy4"),
          fetch("/api/trades/strategy5"),
          fetch("/api/trades/strategy6"),
          fetch("/api/trades/strategy7"),
          fetch("/api/trades/strategy8"),
          fetch("/api/trades/strategy9"),
          fetch("/api/trades/strategy10"),
          fetch("/api/trades/strategy11"),
          fetch("/api/trades/strategy12"),
          fetch("/api/trades/strategy13"),
          fetch("/api/trades/strategy14")
        ]);

        // Check if all responses are OK
        const allResponsesOk = responses.every(response => response.ok);
        if (!allResponsesOk) {
          throw new Error("Some API requests failed");
        }

        // Parse all responses
        const responseData = await Promise.all(
          responses.map(response => response.json())
        );

        // Mapping strategy names
        const strategyNames = [
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
          "SIM"
        ];

        // Helper function to calculate daily P&L
        const calculateDailyPL = (trades) => {
          const dailyPL = {};
          trades.forEach((trade) => {
            const date = trade.date; // Assuming each trade has a `date` field
            const profitLoss =
              (trade.exitPrice - trade.entryPrice) * trade.quantity;
            dailyPL[date] = (dailyPL[date] || 0) + profitLoss;
          });
          return dailyPL;
        };

        // Aggregate data for all strategies
        const strategiesData = {};
        const allDates = new Set();

        responseData.forEach((trades, index) => {
          const dailyPL = calculateDailyPL(trades);
          strategiesData[strategyNames[index]] = dailyPL;

          // Collect all unique dates
          Object.keys(dailyPL).forEach((date) => allDates.add(date));
        });

        // Convert `allDates` to a sorted array
        const sortedDates = Array.from(allDates).sort();

        // Ensure all strategies have values for all dates (fill missing with 0)
        Object.keys(strategiesData).forEach((strategy) => {
          sortedDates.forEach((date) => {
            if (strategiesData[strategy][date] === undefined) {
              strategiesData[strategy][date] = 0;
            }
          });
        });

        setData({
          dates: sortedDates,
          strategies: strategiesData
        });
      } catch (error) {
        console.error("Error fetching trade data:", error);
        // Set empty data structure on error
        setData({
          dates: [],
          strategies: {}
        });
      }
    };

    fetchData();
  }, []);

  return data;
};

export default UseAllStrategiesDataWithTime;