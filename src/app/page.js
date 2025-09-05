"use client";

import { useState, useEffect } from "react";
import TradeList from "@/components/TradeList";
import StrategyPerformanceChart from "@/components/StrategyPerformanceChart";
import TradeForm from "@/components/TradeForm";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import Portfolio from "@/components/Portfolio";
import PerformanceTables from "@/components/PerformanceTables";
import DonutChartRecharts from "@/components/DonutChart";
import PortfolioValue from "@/components/PortfolioValue";
import MaximumLossProfit from "@/components/MaximumLossProfit"; // Add this import
import UseAllStrategiesDataWithTime from "@/components/UseAllStrategiesDataWithTime";
import RankedStrategies from "@/components/RankedStrategies";
import axios from "axios";

import styles from "../css/HomePage.module.css";
import PortfolioHeatmap from "@/components/PortfolioHeatmap";
import StrategyHeatmap from "@/components/StrategyHeatmap";

export default function HomePage() {
  const [selectedStrategy, setSelectedStrategy] = useState("strategy1");
  const [selectedTab, setSelectedTab] = useState("dataForm");
  const [strategyData, setStrategyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { dates, strategies } = UseAllStrategiesDataWithTime();

  useEffect(() => {
    fetchDataForStrategy(selectedStrategy);
  }, [selectedStrategy]);

  const fetchDataForStrategy = async (strategy) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/trades/${strategy}`);
      setStrategyData(res.data);
    } catch (err) {
      console.error("Error fetching trade data:", err);
    } finally {
      setIsLoading(false);
    }
  };

    // new 

    // Calculate Profit/Loss + Cumulative P&L
  const calculateCumulativePL = () => {
    let cumulativePL = 0;
    return strategyData.map((trade) => {
      const profitLoss = parseFloat(
        ((trade.exitPrice - trade.entryPrice) * parseInt(trade.quantity)).toFixed(2)
      );
      cumulativePL += profitLoss;
      return { ...trade, profitLoss, cumulativePL };
    });
  };

  const tradesWithCumulativePL = calculateCumulativePL();

  // Equity data for chart
  const equityData = tradesWithCumulativePL.map((trade) => ({
    date: trade.date,
    cumulativePL: trade.cumulativePL,
  }));

    //end 


  const strategyOptions = [
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
                {strategyOptions.map((option) => (
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
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
            </div>
          ) : selectedTab === "dataForm" ? (
            <TradeForm
              onAddTrade={() => fetchDataForStrategy(selectedStrategy)}
              selectedStrategy={selectedStrategy}
            />
          ) : (
            <div>
              <div className={styles.tradeListSection}>
                <h2 className={styles.sectionTitle}>
                  {strategyOptions.find((s) => s.value === selectedStrategy)
                    ?.label || "Strategy"} Performance
                </h2>
                <TradeList
                  trades={strategyData}
                  selectedStrategy={selectedStrategy}
                  setTrades={setStrategyData}
                />

                <StrategyPerformanceChart equityData={equityData} />
                
                {/* PerformanceMetrics and MaximumLossProfit components */}
                <PerformanceMetrics trades={strategyData} />
                <MaximumLossProfit trades={strategyData} />
                <Portfolio investment = {40000} />
                <PerformanceTables trades={strategyData} />
                <DonutChartRecharts title={"All Strategies Data"} />
                    <RankedStrategies/>
                    {/* <PortfolioHeatmap strategy = {selectedStrategy} /> */}
                    <StrategyHeatmap  data={strategyData}
                  strategy={selectedStrategy} 
                  years={[2020, 2021, 2022, 2023, 2024, 2025]}
                  />
                 {/* <PortfolioValue data={{dates, strategies }}/> */}



              </div>

              {/* Placeholder for future components */}
              <div className={styles.placeholderGrid}>
                <div className={styles.placeholderCard}>
                  <h3 className={styles.placeholderTitle}>Portfolio Value</h3>
                  <p className={styles.placeholderText}>Component coming soon...</p>
                </div>
                <div className={styles.placeholderCard}>
                  <h3 className={styles.placeholderTitle}>Ranked Strategies</h3>
                  <p className={styles.placeholderText}>Component coming soon...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}