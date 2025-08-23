
"use client";
import React, { useEffect, useMemo, useState } from "react";

import useStrategyStats from "@/components/UseStrategiesStats";
import ChangeIndicator from "@/components/ChangeIndicator";
import styles from "../css/RankedStrategies.module.css";
const RankedStrategies = () => {
  const [sortBy, setSortBy] = useState("profit");
  const [sortOrder, setSortOrder] = useState("desc");
  const [timeFilter, setTimeFilter] = useState("all"); // all | 7d | 30d | 90d
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // hook will compute profit, trades, winRate, change based on `timeFilter`
  const rawStats = useStrategyStats(timeFilter);

  useEffect(() => {
    // small UX delay for skeleton
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, [rawStats]);

  const strategies = useMemo(() => {
    let list = Array.isArray(rawStats) ? [...rawStats] : [];

    // search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((i) => i.strategy.toLowerCase().includes(q));
    }

    // sort
    list.sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      const A = a[sortBy];
      const B = b[sortBy];
      if (A < B) return -1 * dir;
      if (A > B) return 1 * dir;
      return 0;
    });

    return list;
  }, [rawStats, sortBy, sortOrder, searchTerm]);

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("desc");
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n ?? 0);

  const getMedal = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
    };

  const getChangeIcon = (c) => (c > 0 ? "↗️" : c < 0 ? "↘️" : "➡️");

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.title}>Strategy Rankings</h2>
            <div className={styles.skeletonControls}>
              <div className={styles.skelSearch} />
              <div className={styles.skelFilter} />
            </div>
          </div>
          <div className={styles.loadingContent}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.rowSkeleton}>
                <div className={styles.skelMedal} />
                <div className={styles.skelName} />
                <div className={styles.skelVal} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.title}>Strategy Rankings</h2>

          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔎</span>
              <input
                type="text"
                placeholder="Search strategies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className={styles.timeFilter}
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort("index")}>Rank</th>
                <th onClick={() => handleSort("strategy")}>
                  Strategy
                  {sortBy === "strategy" && (
                    <span className={styles.sortArrow}>
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort("profit")}>
                  Profit
                  {sortBy === "profit" && (
                    <span className={styles.sortArrow}>
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort("change")}>
                  Change
                  {sortBy === "change" && (
                    <span className={styles.sortArrow}>
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort("trades")}>
                  Trades
                  {sortBy === "trades" && (
                    <span className={styles.sortArrow}>
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort("winRate")}>
                  Win&nbsp;Rate
                  {sortBy === "winRate" && (
                    <span className={styles.sortArrow}>
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              </tr>
            </thead>

            <tbody>
              {strategies.map((item, index) => (
                <tr key={item.strategy} className={styles.row}>
                  <td className={styles.rank}>
                    <span className={styles.medal}>{getMedal(index)}</span>
                  </td>

                  <td className={styles.nameCell}>
                    <div className={styles.nameWrap}>
                      <span className={styles.name}>{item.strategy}</span>
                      <span className={`${styles.badge} ${index < 3 ? styles.premium : styles.standard}`}>
                        {index < 3 ? "Premium" : "Standard"}
                      </span>
                    </div>
                  </td>

                  <td className={`${styles.profit} ${item.profit >= 0 ? styles.positive : styles.negative}`}>
                    {formatCurrency(item.profit)}
                  </td>

                  {/* <td className={`${styles.change} ${item.change >= 0 ? styles.positive : styles.negative}`}>
                    {getChangeIcon(item.change)} {Math.abs(item.change).toFixed(2)}%
                  </td> */}
                  <td>
                  <ChangeIndicator change={item.change} />
                  </td>

                  <td className={styles.trades}>
                    <span className={styles.tradesIcon}>🔁</span>
                    {item.trades}
                  </td>

                  <td className={styles.winrate}>
                    <div className={styles.winbar}>
                      <div
                        className={styles.winfill}
                        style={{ width: `${Math.max(0, Math.min(100, item.winRate))}%` }}
                      />
                      <span className={styles.wintext}>{item.winRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {strategies.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔍</div>
              <p>No strategies found</p>
              <button className={styles.clearBtn} onClick={() => setSearchTerm("")}>
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankedStrategies;
