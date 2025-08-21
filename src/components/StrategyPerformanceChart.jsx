'use client';

import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

function StrategyPerformanceChart({ equityData }) {
  const [selectedStrategy, setSelectedStrategy] = useState("All Strategies");
  const [showExplanation, setShowExplanation] = useState(false);
  
  if (!equityData || equityData.length === 0) {
    return (
      <div className="w-full mt-6 px-3">
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg">No data available</p>
        </div>
      </div>
    );
  }

  // Calculate moving averages
  const calculateMA = (data, period, field) => {
    return data.map((item, index) => {
      if (index < period - 1) return { ...item, [`ma${period}`]: null };
      
      const sum = data
        .slice(index - period + 1, index + 1)
        .reduce((total, curr) => total + (curr[field] || 0), 0);
      
      return { ...item, [`ma${period}`]: sum / period };
    });
  };

  // Process data with moving averages
  const processedData = useMemo(() => {
    let data = [...equityData];
    
    // Calculate cumulative P&L if not already present
    if (data.length > 0 && !data[0].cumulativePL) {
      let runningTotal = 0;
      data = data.map(item => {
        runningTotal += item.pnl || 0;
        return { ...item, cumulativePL: runningTotal };
      });
    }
    
    // Calculate moving averages
    data = calculateMA(data, 5, "cumulativePL");
    data = calculateMA(data, 10, "cumulativePL");
    data = calculateMA(data, 20, "cumulativePL");
    
    return data;
  }, [equityData]);

  // Get unique strategies for dropdown
  const strategies = useMemo(() => {
    const uniqueStrategies = new Set();
    equityData.forEach(item => {
      if (item.strategy) uniqueStrategies.add(item.strategy);
    });
    return ["All Strategies", ...Array.from(uniqueStrategies)];
  }, [equityData]);

  // Filter data by selected strategy
  const filteredData = useMemo(() => {
    if (selectedStrategy === "All Strategies") return processedData;
    return processedData.filter(item => item.strategy === selectedStrategy);
  }, [processedData, selectedStrategy]);

  // Custom tooltip component with improved styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-xl">
          <p className="font-bold text-gray-800 mb-2">
            {`Date: ${new Date(label).toLocaleDateString("en-GB")}`}
          </p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <p 
                key={`item-${index}`} 
                className="flex items-center"
                style={{ color: entry.color }}
              >
                <span 
                  className="inline-block w-3 h-3 mr-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span className="font-medium">{entry.name}:</span>
                <span className="ml-1">₹{entry.value.toFixed(2)}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full mt-6 px-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0 flex items-center">
          📊 Strategy Performance
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
            aria-label="Show explanation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </button>
        </h3>
        
        <div className="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
          <label htmlFor="strategy-select" className="mr-2 text-gray-700 font-medium">
            Select Strategy:
          </label>
          <select
            id="strategy-select"
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {strategies.map(strategy => (
              <option key={strategy} value={strategy}>{strategy}</option>
            ))}
          </select>
        </div>
      </div>

      {showExplanation && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            How to Read This Chart
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <p className="font-medium flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                Cumulative P/L
              </p>
              <p className="ml-5">Your total profit/loss over time</p>
            </div>
            <div>
              <p className="font-medium flex items-center">
                <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                5-Day Moving Average
              </p>
              <p className="ml-5">Short-term trend indicator</p>
            </div>
            <div>
              <p className="font-medium flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                10-Day Moving Average
              </p>
              <p className="ml-5">Medium-term trend indicator</p>
            </div>
            <div>
              <p className="font-medium flex items-center">
                <span className="w-3 h-3 bg-purple-600 rounded-full mr-2"></span>
                20-Day Moving Average
              </p>
              <p className="ml-5">Long-term trend indicator</p>
            </div>
          </div>
          <p className="mt-3 text-blue-600 text-sm">
            <span className="font-semibold">Pro Tip:</span> When shorter moving averages cross above longer ones, 
            it may indicate an upward trend in your performance.
          </p>
        </div>
      )}

      <div className="w-full rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-md transition-all hover:shadow-lg">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={filteredData}>
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
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              iconSize={10}
            />
            <Line
              type="monotone"
              dataKey="cumulativePL"
              stroke="#4B70C0"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, stroke: "#1D4ED8", strokeWidth: 2 }}
              name="Cumulative P/L"
            />
            <Line
              type="monotone"
              dataKey="ma5"
              stroke="#FF7C00"
              strokeWidth={2}
              dot={false}
              strokeDasharray="3 3"
              name="5-Day MA"
            />
            <Line
              type="monotone"
              dataKey="ma10"
              stroke="#00A86B"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 4"
              name="10-Day MA"
            />
            <Line
              type="monotone"
              dataKey="ma20"
              stroke="#9F2B68"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
              name="20-Day MA"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StrategyPerformanceChart;