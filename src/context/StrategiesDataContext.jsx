"use client";
import { createContext, useContext, useEffect, useState } from "react";

const StrategiesDataContext = createContext(null);

export const STRATEGY_IDS = Array.from({ length: 14 }, (_, i) => `strategy${i + 1}`);

export function StrategiesDataProvider({ children }) {
  const [tradesByStrategy, setTradesByStrategy] = useState(() =>
    Object.fromEntries(STRATEGY_IDS.map((id) => [id, []]))
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      const results = await Promise.all(
        STRATEGY_IDS.map((id) =>
          fetch(`/api/trades/${id}`)
            .then((res) => res.json())
            .catch(() => [])
        )
      );
      if (cancelled) return;
      setTradesByStrategy(
        Object.fromEntries(STRATEGY_IDS.map((id, i) => [id, results[i]]))
      );
      setIsLoading(false);
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StrategiesDataContext.Provider value={{ tradesByStrategy, isLoading }}>
      {children}
    </StrategiesDataContext.Provider>
  );
}

export function useStrategiesData() {
  const ctx = useContext(StrategiesDataContext);
  if (!ctx) {
    throw new Error("useStrategiesData must be used within a StrategiesDataProvider");
  }
  return ctx;
}
