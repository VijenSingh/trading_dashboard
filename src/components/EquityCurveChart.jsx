'use client';

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { parseLocalDate } from "@/lib/date";
import styles from "../css/EquityCurveChart.module.css";

function EquityCurveChart({ equityData }) {
  if (!equityData || equityData.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>No data available</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <h3 className={styles.heading}>📈 Equity Curve</h3>
      <div className={styles.card}>
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={equityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2a" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                parseLocalDate(date).toLocaleDateString("en-GB")
              }
              angle={-35}
              textAnchor="end"
              tick={{ fontSize: 12, fill: "#898781" }}
              height={60}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#898781" }}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip
              formatter={(value) => [`$${value}`, "Cumulative P/L"]}
              labelFormatter={(label) =>
                `Date: ${parseLocalDate(label).toLocaleDateString("en-GB")}`
              }
              contentStyle={{
                backgroundColor: "rgba(20, 18, 30, 0.92)",
                borderRadius: "10px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#ffffff",
              }}
              labelStyle={{ color: "#c3c2b7" }}
            />
            <Line
              type="monotone"
              dataKey="cumulativePL"
              stroke="#3987e5"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, stroke: "#9085e9", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default EquityCurveChart;
