"use client";
import { useState, useEffect } from "react";

const useStrategyStats = (timeFilter = "all") => {
  const [strategiesStats, setStrategiesStats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const strategyPromises = [];
        for (let i = 1; i <= 14; i++) {
          strategyPromises.push(
            fetch(`/api/trades/strategy${i}`)
              .then((res) => res.json())
              .catch(() => [])
          );
        }

        const results = await Promise.all(strategyPromises);

        console.log("results => ", results)
        const calculateStats = (trades, strategyName) => {
          let totalPL = 0;
          let wins = 0;

          const now = new Date();
          let cutoff = null;

          if (timeFilter === "7d") {
            cutoff = new Date();
            cutoff.setDate(now.getDate() - 7);
          } else if (timeFilter === "30d") {
            cutoff = new Date();
            cutoff.setDate(now.getDate() - 30);
          } else if (timeFilter === "90d") {
            cutoff = new Date();
            cutoff.setDate(now.getDate() - 90);
          }

          // ✅ Apply time filter
          const filteredTrades =
            cutoff !== null
              ? trades.filter((trade) => new Date(trade.date) >= cutoff)
              : trades;

          // ✅ Main stats
          filteredTrades.forEach((trade) => {
            const profitLoss =
              (trade.exitPrice - trade.entryPrice) * trade.quantity;
            totalPL += profitLoss;
            if (profitLoss > 0) wins++;
          });

          const tradesCount = filteredTrades.length;
          const winRate = tradesCount > 0 ? (wins / tradesCount) * 100 : 0;

          // ✅ Change% calculation (safe)
          let recentPL = 0;
          let oldPL = 0;
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);

          trades.forEach((trade) => {
            const tradeDate = new Date(trade.date);
            const pl =
              (trade.exitPrice - trade.entryPrice) * trade.quantity;

            if (tradeDate >= sevenDaysAgo) {
              recentPL += pl;
            } else {
              oldPL += pl;
            }
          });

          let change = 0;
          if (oldPL !== 0) {
            change = ((recentPL - oldPL) / Math.abs(oldPL)) * 100;
          }

          return {
            strategy: strategyName,
            profit: totalPL,
            trades: tradesCount,
            winRate: winRate.toFixed(1),
            change: change.toFixed(2),
          };
        };

        const strategiesArray = [
          { name: "Sniper BTC with SL Day Wise", trades: results[0] },
          { name: "Sniper BTC with SL", trades: results[1] },
          { name: "ETH Selling", trades: results[2] },
          { name: "ETH Selling Day wise", trades: results[3] },
          { name: "ETH Selling without SL", trades: results[4] },
          { name: "ETH Selling without SL Day wise", trades: results[5] },
          { name: "3PM ETH Shambhu", trades: results[6] },
          { name: "3PM ETH Shambhu Day wise", trades: results[7] },
          { name: "3PM ETH Vasuki without SL", trades: results[8] },
          { name: "3PM ETH Vasuki without SL Day wise", trades: results[9] },
          { name: "VJS", trades: results[10] },
          { name: "SK", trades: results[11] },
          { name: "DNS", trades: results[12] },
          { name: "SIM", trades: results[13] },
        ].map((s) => calculateStats(s.trades, s.name));

        setStrategiesStats(strategiesArray);
      } catch (err) {
        console.error("Error fetching strategies:", err);
      }
    };

    fetchData();
  }, [timeFilter]);

  return strategiesStats;
};

export default useStrategyStats;
