


// src/components/useStrategyName.js

export default function useStrategyName(strategy) {
  const strategyMap = {
    strategy1: "Sniper",
    strategy2: "Prop Desk Ce-04",
    strategy3: "Prop Desk Ce-01",
    strategy4: "CE/PE",
    strategy5: "BTC Daily Option Selling with SL",
    strategy6: "Suprita",
    strategy7: "Shambhu",
    strategy8: "Mahabuddhi",
    strategy9: "Vasuki",
    strategy10: "OG BTC Daily Option Selling",
    strategy11: "VJS",
    strategy12: "SK",
    strategy13: "DNS",
    strategy14: "SIM",
  };

  return strategyMap[strategy] || strategy;
}
