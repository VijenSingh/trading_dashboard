"use client";
import React from 'react';
import useAllStrategiesData from "@/components/UseAllStrategiesData";

import styles from '../css/Portfolio.module.css';

const Portfolio = ({ investment }) => {
  const data = useAllStrategiesData();
  
  // Sum the final cumulative profit/loss of all strategies
  const totalProfitLoss =
    data.Sniper_NF +
    data.Prop_Desk_Ce_04 +
    data.Prop_Desk_Ce_01 +
    data.CE_PE +
    data.Range_Breakout +
    data.Suprita +
    data.Shambhu +
    data.Mahabuddhi +
    data.Vasuki +
    data.NF_Selling_Long_Term +
    data.VJS +
    data.SK +
    data.DNS +
    data.SIM;

  // Calculate the percentage return
  const percentageReturn = ((totalProfitLoss / investment) * 100).toFixed(2);
  const isPositive = totalProfitLoss >= 0;

  return (
    <div className={styles.portfolioContainer}>
      <h2 className={styles.title}>Portfolio Summary</h2>
      <div className={styles.grid}>
        <KPI 
          label="Total Investment" 
          value={`₹ ${investment.toFixed(2)}`} 
          className={styles.investmentKPI}
        />
        <KPI 
          label="Total Profit/Loss" 
          value={`₹ ${totalProfitLoss.toFixed(2)}`} 
          positive={isPositive}
          negative={!isPositive}
        />
        <KPI 
          label="Portfolio Value" 
          value={`₹ ${(investment + totalProfitLoss).toFixed(2)}`} 
          className={styles.portfolioValueKPI}
        />
        <KPI 
          label="Percentage Return" 
          value={`${percentageReturn}%`} 
          positive={isPositive}
          negative={!isPositive}
        />
      </div>
      
      {/* Strategy Breakdown */}
      <div className={styles.strategyBreakdown}>
        <h3 className={styles.subtitle}>Strategy Performance</h3>
        <div className={styles.strategyGrid}>
          <StrategyKPI label="Sniper NF" value={data.Sniper_NF} />
          <StrategyKPI label="Prop Desk Ce-04" value={data.Prop_Desk_Ce_04} />
          <StrategyKPI label="Prop Desk Ce-01" value={data.Prop_Desk_Ce_01} />
          <StrategyKPI label="CE/PE" value={data.CE_PE} />
          <StrategyKPI label="Range Breakout" value={data.Range_Breakout} />
          <StrategyKPI label="Suprita" value={data.Suprita} />
          <StrategyKPI label="Shambhu" value={data.Shambhu} />
          <StrategyKPI label="Mahabuddhi" value={data.Mahabuddhi} />
          <StrategyKPI label="Vasuki" value={data.Vasuki} />
          <StrategyKPI label="NF Selling Long Term" value={data.NF_Selling_Long_Term} />
          <StrategyKPI label="VJS" value={data.VJS} />
          <StrategyKPI label="SK" value={data.SK} />
          <StrategyKPI label="DNS" value={data.DNS} />
          <StrategyKPI label="SIM" value={data.SIM} />
        </div>
      </div>
    </div>
  );
};

function KPI({ label, value, positive, negative, className = '' }) {
  return (
    <div className={`${styles.kpiBox} ${className} ${positive ? styles.positive : ''} ${negative ? styles.negative : ''}`}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={`${styles.kpiValue} ${positive ? styles.positiveValue : ''} ${negative ? styles.negativeValue : ''}`}>
        {value}
      </div>
    </div>
  );
}

function StrategyKPI({ label, value }) {
  const isPositive = value >= 0;
  return (
    <div className={styles.strategyKpi}>
      <span className={styles.strategyLabel}>{label}</span>
      <span className={`${styles.strategyValue} ${isPositive ? styles.positiveValue : styles.negativeValue}`}>
        ₹{value.toFixed(2)}
      </span>
    </div>
  );
}

export default Portfolio;