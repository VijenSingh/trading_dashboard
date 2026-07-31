"use client";
import { useMemo } from "react";
import { useStrategiesData } from "@/context/StrategiesDataContext";
import { parseLocalDate } from "@/lib/date";

const STRATEGY_LABELS = [
  { id: "strategy1", name: "Sniper BTC with SL Day Wise" },
  { id: "strategy2", name: "Sniper BTC with SL" },
  { id: "strategy3", name: "ETH Selling" },
  { id: "strategy4", name: "ETH Selling Day wise" },
  { id: "strategy5", name: "ETH Selling without SL" },
  { id: "strategy6", name: "ETH Selling without SL Day wise" },
  { id: "strategy7", name: "3PM ETH Shambhu" },
  { id: "strategy8", name: "3PM ETH Shambhu Day wise" },
  { id: "strategy9", name: "3PM ETH Vasuki without SL" },
  { id: "strategy10", name: "3PM ETH Vasuki without SL Day wise" },
  { id: "strategy11", name: "VJS" },
  { id: "strategy12", name: "SK" },
  { id: "strategy13", name: "DNS" },
  { id: "strategy14", name: "SIM" },
];

const calculateStats = (trades, strategyName, timeFilter) => {
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

  // Apply time filter
  const filteredTrades =
    cutoff !== null
      ? trades.filter((trade) => parseLocalDate(trade.date) >= cutoff)
      : trades;

  // Main stats
  filteredTrades.forEach((trade) => {
    const profitLoss = (trade.exitPrice - trade.entryPrice) * trade.quantity;
    totalPL += profitLoss;
    if (profitLoss > 0) wins++;
  });

  const tradesCount = filteredTrades.length;
  const winRate = tradesCount > 0 ? (wins / tradesCount) * 100 : 0;

  // Change% calculation: compares the last 7 days of trading activity against
  // the 7 days before that. Anchored to this strategy's own latest trade date
  // (not wall-clock "now") so it stays meaningful for historical/journal data
  // that isn't necessarily updated every day.
  let recentPL = 0;
  let oldPL = 0;
  let change = null;

  if (trades.length > 0) {
    const latestTradeDate = trades.reduce((max, t) => {
      const d = parseLocalDate(t.date);
      return d > max ? d : max;
    }, new Date(0));

    const sevenDaysBeforeLatest = new Date(latestTradeDate);
    sevenDaysBeforeLatest.setDate(latestTradeDate.getDate() - 7);
    const fourteenDaysBeforeLatest = new Date(latestTradeDate);
    fourteenDaysBeforeLatest.setDate(latestTradeDate.getDate() - 14);

    trades.forEach((trade) => {
      const tradeDate = parseLocalDate(trade.date);
      const p = (trade.exitPrice - trade.entryPrice) * trade.quantity;

      if (tradeDate >= sevenDaysBeforeLatest) {
        recentPL += p;
      } else if (tradeDate >= fourteenDaysBeforeLatest) {
        oldPL += p;
      }
    });

    if (oldPL !== 0) {
      change = ((recentPL - oldPL) / Math.abs(oldPL)) * 100;
    }
  }

  return {
    strategy: strategyName,
    profit: totalPL,
    trades: tradesCount,
    winRate: winRate.toFixed(1),
    change: change === null ? null : change.toFixed(2),
  };
};

const useStrategyStats = (timeFilter = "all") => {
  const { tradesByStrategy } = useStrategiesData();

  return useMemo(
    () =>
      STRATEGY_LABELS.map(({ id, name }) =>
        calculateStats(tradesByStrategy[id] || [], name, timeFilter)
      ),
    [tradesByStrategy, timeFilter]
  );
};

export default useStrategyStats;
