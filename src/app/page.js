"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import TradeForm from "@/components/TradeForm";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import Portfolio from "@/components/Portfolio";
import StrategyHeatmap from "@/components/StrategyHeatmap";

import styles from "../css/HomePage.module.css";
import { StrategiesDataProvider } from "@/context/StrategiesDataContext";
import { ToastProvider } from "@/context/ToastContext";

// Shown while a code-split chunk (JS + its CSS Module) is still being
// fetched, so a slow/racy load never flashes unstyled markup — it shows
// this skeleton instead until the real, fully-styled component is ready.
const SectionSkeleton = () => (
  <div className={styles.skeletonWrap}>
    <div className={styles.skeletonTitle} />
    <div className={styles.skeletonRow} />
    <div className={styles.skeletonRow} />
    <div className={styles.skeletonRow} />
  </div>
);

// Pulls in the xlsx parsing library — only needed if the user actually
// opens the bulk-upload panel, so keep it out of the initial bundle too.
const BulkTradeUpload = dynamic(() => import("@/components/BulkTradeUpload"), { ssr: false, loading: SectionSkeleton });

// These pull in recharts / framer-motion / lucide-react and the
// all-strategies context fetch — only needed once the Dashboard tab is
// opened, so keep them out of the initial "Data Form" bundle.
const TradeList = dynamic(() => import("@/components/TradeList"), { ssr: false, loading: SectionSkeleton });
const StrategyPerformanceChart = dynamic(() => import("@/components/StrategyPerformanceChart"), { ssr: false, loading: SectionSkeleton });
const MaximumLossProfit = dynamic(() => import("@/components/MaximumLossProfit"), { ssr: false, loading: SectionSkeleton });
const PerformanceTables = dynamic(() => import("@/components/PerformanceTables"), { ssr: false, loading: SectionSkeleton });
const DonutChartRecharts = dynamic(() => import("@/components/DonutChart"), { ssr: false, loading: SectionSkeleton });
const RankedStrategies = dynamic(() => import("@/components/RankedStrategies"), { ssr: false, loading: SectionSkeleton });

// Capital allocated across all strategies — update here if it changes.
const TOTAL_INVESTMENT = 40000;

const STRATEGY_OPTIONS = [
  { value: "strategy1", label: "Sniper BTC with SL Day Wise" },
  { value: "strategy2", label: "Sniper BTC with SL" },
  { value: "strategy3", label: "ETH Selling" },
  { value: "strategy4", label: "ETH Selling Day wise" },
  { value: "strategy5", label: "ETH Selling without SL" },
  { value: "strategy6", label: "ETH Selling without SL Day wise" },
  { value: "strategy7", label: "3PM ETH Shambhu" },
  { value: "strategy8", label: "3PM ETH Shambhu Day wise" },
  { value: "strategy9", label: "3PM ETH Vasuki without SL" },
  { value: "strategy10", label: "3PM ETH Vasuki without SL Day wise" },
  { value: "strategy11", label: "VJS" },
  { value: "strategy12", label: "SK" },
  { value: "strategy13", label: "DNS" },
  { value: "strategy14", label: "SIM" },
];

export default function HomePage() {
  return (
    <ToastProvider>
      <HomePageContent />
    </ToastProvider>
  );
}

function HomePageContent() {
  const [selectedStrategy, setSelectedStrategy] = useState("strategy1");
  const [selectedTab, setSelectedTab] = useState("dataForm");
  const [strategyData, setStrategyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDataForStrategy(selectedStrategy);
  }, [selectedStrategy]);

  const fetchDataForStrategy = async (strategy) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trades/${strategy}`);
      const data = await res.json();
      setStrategyData(data);
    } catch (err) {
      console.error("Error fetching trade data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Equity data for the strategy performance chart
  const equityData = useMemo(() => {
    let cumulativePL = 0;
    return strategyData.map((trade) => {
      const profitLoss = parseFloat(
        ((trade.exitPrice - trade.entryPrice) * parseInt(trade.quantity)).toFixed(2)
      );
      cumulativePL += profitLoss;
      return { date: trade.date, cumulativePL };
    });
  }, [strategyData]);

  const selectedStrategyLabel =
    STRATEGY_OPTIONS.find((s) => s.value === selectedStrategy)?.label || "Strategy";

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Portfolio Performance Dashboard</h1>
          <nav className={styles.nav}>
            <button
              onClick={() => setSelectedTab("dashboard")}
              className={`${styles.navButton} ${
                selectedTab === "dashboard" ? styles.navButtonActive : ""
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setSelectedTab("dataForm")}
              className={`${styles.navButton} ${
                selectedTab === "dataForm" ? styles.navButtonActive : ""
              }`}
            >
              Data Form
            </button>
          </nav>
        </div>
      </header>

      <div className={styles.mainContent}>
        {/* Strategy Selector */}
        <div className={styles.strategySelector}>
          <div className={styles.strategyHeader}>
            <div>
              <h2 className={styles.strategyTitle}>Select Trading Strategy</h2>
              <p className={styles.strategyDescription}>
                Choose a strategy to view or manage its trades
              </p>
            </div>
            <div className={styles.selectContainer}>
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className={styles.select}
              >
                {STRATEGY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className={styles.selectArrow}>
                <svg
                  className={styles.selectIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className={styles.contentArea}>
          {isLoading ? (
            <div className={styles.skeletonWrap} aria-busy="true" aria-label="Loading trades">
              <div className={styles.skeletonTitle} />
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className={styles.skeletonRow} />
              ))}
            </div>
          ) : selectedTab === "dataForm" ? (
            <div key="dataForm" className={styles.tabContent}>
              <TradeForm
                onAddTrade={(newTrade) =>
                  setStrategyData((prev) => [...prev, newTrade])
                }
                selectedStrategy={selectedStrategy}
              />
              <BulkTradeUpload
                selectedStrategy={selectedStrategy}
                onBulkAdd={(newTrades) =>
                  setStrategyData((prev) => [...prev, ...newTrades])
                }
              />
            </div>
          ) : (
            // The all-strategies fetch (14 requests) only starts once this
            // subtree mounts, i.e. once the Dashboard tab is actually opened.
            <StrategiesDataProvider>
              <div key="dashboard" className={styles.tabContent}>
                <div className={styles.tradeListSection}>
                  <h2 className={styles.sectionTitle}>
                    {selectedStrategyLabel} Performance
                  </h2>
                  <TradeList
                    trades={strategyData}
                    setTrades={setStrategyData}
                    selectedStrategy={selectedStrategy}
                  />

                  <StrategyPerformanceChart equityData={equityData} />

                  <PerformanceMetrics trades={strategyData} />
                  <MaximumLossProfit trades={strategyData} />
                  <Portfolio investment={TOTAL_INVESTMENT} />
                  <PerformanceTables trades={strategyData} />
                  <DonutChartRecharts title={"All Strategies Data"} />
                  <RankedStrategies />
                  <StrategyHeatmap
                    data={strategyData}
                    strategy={selectedStrategy}
                    years={[2023, 2024, 2025, 2026, 2027, 2028]}
                  />
                </div>
              </div>
            </StrategiesDataProvider>
          )}
        </div>
      </div>
    </div>
  );
}
