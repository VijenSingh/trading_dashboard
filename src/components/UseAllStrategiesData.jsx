"use client";
import { useStrategiesData } from "@/context/StrategiesDataContext";

const STRATEGY_NAME_BY_ID = {
  strategy1: "Sniper_NF",
  strategy2: "Prop_Desk_Ce_04",
  strategy3: "Prop_Desk_Ce_01",
  strategy4: "CE_PE",
  strategy5: "Range_Breakout",
  strategy6: "Suprita",
  strategy7: "Shambhu",
  strategy8: "Mahabuddhi",
  strategy9: "Vasuki",
  strategy10: "NF_Selling_Long_Term",
  strategy11: "VJS",
  strategy12: "SK",
  strategy13: "DNS",
  strategy14: "SIM",
};

const calculateCumulativePL = (trades) => {
  let cumulativePL = 0;
  trades.forEach((trade) => {
    const profitLoss = parseFloat(
      ((trade.exitPrice - trade.entryPrice) * parseInt(trade.quantity)).toFixed(2)
    );
    cumulativePL += profitLoss;
  });
  return cumulativePL;
};

const UseAllStrategiesData = () => {
  const { tradesByStrategy } = useStrategiesData();

  return Object.fromEntries(
    Object.entries(STRATEGY_NAME_BY_ID).map(([id, name]) => [
      name,
      calculateCumulativePL(tradesByStrategy[id] || []),
    ])
  );
};

export default UseAllStrategiesData;
