


// src/components/useStrategyName.js

export default function useStrategyName(strategy) {
  const strategyMap = {
    strategy1: "Sniper BTC with SL Day Wise",
    strategy2: "Sniper BTC with SL",
    strategy3: "ETH Selling",
    strategy4: "ETH Selling Day wise",
    strategy5: "ETH Selling without SL",
    strategy6: "ETH Selling without SL Day wise",
    strategy7: "3PM ETH Shambhu",
    strategy8: "3PM ETH Shambhu Day wise",
    strategy9: "3PM ETH Vasuki without SL",
    strategy10: "3PM ETH Vasuki without SL Day wise",
    strategy11: "VJS",
    strategy12: "SK",
    strategy13: "DNS",
    strategy14: "SIM",
  };

  return strategyMap[strategy] || strategy;
}
