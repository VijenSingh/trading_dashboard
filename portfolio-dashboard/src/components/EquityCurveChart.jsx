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

function EquityCurveChart({ equityData }) {
  if (!equityData || equityData.length === 0) {
    return (
      <div className="w-full mt-6 px-3">
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-6 px-3">
      <h3 className="text-center mb-4 text-xl font-semibold text-gray-800">
        📈 Equity Curve
      </h3>
      <div className="w-full rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-md transition-all hover:shadow-lg">
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={equityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString("en-GB")
              }
              angle={-35}
              textAnchor="end"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              height={60}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickFormatter={(val) => `₹${val}`}
            />
            <Tooltip
              formatter={(value) => [`₹${value}`, "Cumulative P/L"]}
              labelFormatter={(label) =>
                `Date: ${new Date(label).toLocaleDateString("en-GB")}`
              }
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                border: "1px solid #e5e7eb",
              }}
            />
            <Line
              type="monotone"
              dataKey="cumulativePL"
              stroke="#4B70C0"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, stroke: "#1D4ED8", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default EquityCurveChart;