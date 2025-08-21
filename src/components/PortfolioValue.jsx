"use client";
import React, { useMemo, useState, useEffect } from "react";

import styles from "../css/PortfolioValue.module.css";

const PortfolioValue = ({ data }) => {
  const { dates, strategies } = data;
  const [year, setYear] = useState(2025);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Generate complete heatmap data for the entire year
  const heatmapData = useMemo(() => {
    const result = [];
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    
    // Create a map of date to total value for faster lookup
    const dateValueMap = {};
    dates.forEach((date) => {
      let totalValue = 0;
      Object.keys(strategies).forEach((strategy) => {
        const strategyData = strategies[strategy];
        if (strategyData[date] !== undefined) {
          totalValue += strategyData[date];
        }
      });
      dateValueMap[date] = totalValue;
    });

    // Generate data for every day of the year
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        value: dateValueMap[dateStr] || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }, [dates, strategies, year]);

  // Calculate monthly returns
  const monthlyReturns = useMemo(() => {
    const returns = {};
    
    // Group data by month
    const monthlyData = {};
    heatmapData.forEach(item => {
      const date = new Date(item.date);
      const month = date.getMonth();
      if (!monthlyData[month]) {
        monthlyData[month] = [];
      }
      monthlyData[month].push(item.value);
    });
    
    // Calculate return for each month
    Object.keys(monthlyData).forEach(month => {
      const values = monthlyData[month];
      if (values.length > 0) {
        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        returns[month] = ((lastValue - firstValue) / firstValue) * 100;
      }
    });
    
    return returns;
  }, [heatmapData]);

  // Organize data by month for rendering
  const monthlyGridData = useMemo(() => {
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      const monthData = {
        name: new Date(year, month, 1).toLocaleString('default', { month: 'short' }),
        days: [],
        return: monthlyReturns[month] || 0
      };
      
      // Get first day of month and how many days in month
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDay; i++) {
        monthData.days.push({ date: null, value: null });
      }
      
      // Add actual days
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayData = heatmapData.find(d => d.date === dateStr) || { date: dateStr, value: 0 };
        monthData.days.push(dayData);
      }
      
      months.push(monthData);
    }
    
    return months;
  }, [heatmapData, year, monthlyReturns]);

  // Weekday labels
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Handle day hover for tooltip
  const handleDayHover = (day, event) => {
    if (day.value !== null && day.value !== undefined) {
      setSelectedDate(day);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  // Hide tooltip when not hovering over a day
  const handleMouseLeave = () => {
    setSelectedDate(null);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Portfolio Value Heatmap</h2>
      <p className={styles.subtitle}>Daily portfolio performance throughout {year}</p>
      
      <div className={styles.yearSelector}>
        <button onClick={() => setYear(year - 1)}>◀</button>
        <span>{year}</span>
        <button onClick={() => setYear(year + 1)}>▶</button>
      </div>
      
      <div className={styles.heatmapContainer} onMouseLeave={handleMouseLeave}>
        {/* Weekday labels */}
        <div className={styles.weekdayLabels}>
          {weekdays.map(day => (
            <div key={day} className={styles.weekdayLabel}>{day}</div>
          ))}
        </div>
        
        {/* Monthly grids */}
        <div className={styles.monthlyGrids}>
          {monthlyGridData.map((month, monthIndex) => (
            <div key={monthIndex} className={styles.monthContainer}>
              <div className={styles.monthHeader}>{month.name}</div>
              
              <div className={styles.calendarGrid}>
                {month.days.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`${styles.day} ${day.value ? styles.hasValue : ''}`}
                    style={{ 
                      backgroundColor: day.value ? 
                        (day.value > 0 ? `rgba(0, 200, 100, ${Math.min(0.2 + day.value/10000, 0.9)})` : 
                         `rgba(255, 80, 80, ${Math.min(0.2 + Math.abs(day.value)/5000, 0.9)})`) : 
                        '#f0f0f0'
                    }}
                    onMouseMove={(e) => handleDayHover(day, e)}
                    title={day.date ? `${day.date}: ₹${day.value?.toFixed(2)}` : ''}
                  />
                ))}
              </div>
              
              <div className={styles.monthReturn}>
                {month.return !== undefined ? 
                  `${month.return >= 0 ? '+' : ''}${month.return.toFixed(2)}%` : 
                  'N/A'}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Tooltip */}
      {selectedDate && (
        <div 
          className={styles.tooltip}
          style={{ left: tooltipPosition.x + 10, top: tooltipPosition.y + 10 }}
        >
          <div>{selectedDate.date}</div>
          <div>₹{selectedDate.value?.toFixed(2)}</div>
        </div>
      )}
      
      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.colorPositive}></div>
          <span>Positive Returns</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.colorNegative}></div>
          <span>Negative Returns</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.colorEmpty}></div>
          <span>No Data</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioValue;