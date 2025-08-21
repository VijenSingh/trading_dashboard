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
        value: dateValueMap[dateStr] || null, // Use null for missing data
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }, [dates, strategies, year]);

  // Calculate monthly P&L (absolute values)
  const monthlyPL = useMemo(() => {
    const pl = {};
    
    // Initialize for all months
    for (let month = 0; month < 12; month++) {
      pl[month] = 0;
    }
    
    // Calculate P&L for each month
    heatmapData.forEach(item => {
      if (item.value !== null && item.value !== undefined) {
        const date = new Date(item.date);
        const month = date.getMonth();
        pl[month] = item.value; // This will store the last value for the month
      }
    });
    
    // Now calculate the actual P&L by comparing with previous month's end value
    const monthlyPandL = {};
    let previousMonthValue = 0;
    
    for (let month = 0; month < 12; month++) {
      if (month === 0) {
        // For January, P&L is just the value itself
        monthlyPandL[month] = pl[month];
      } else {
        // For other months, P&L is the difference from previous month's end
        monthlyPandL[month] = pl[month] - previousMonthValue;
      }
      previousMonthValue = pl[month];
    }
    
    return monthlyPandL;
  }, [heatmapData]);

  // Organize data by month for rendering
  const monthlyGridData = useMemo(() => {
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      const monthData = {
        name: new Date(year, month, 1).toLocaleString('default', { month: 'short' }),
        days: [],
        pl: monthlyPL[month] || 0
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
        const dayData = heatmapData.find(d => d.date === dateStr) || { date: dateStr, value: null };
        monthData.days.push(dayData);
      }
      
      months.push(monthData);
    }
    
    return months;
  }, [heatmapData, year, monthlyPL]);

  // Weekday labels
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Handle day hover for tooltip
  const handleDayHover = (day, event) => {
    if (day.value !== null && day.value !== undefined) {
      setSelectedDate(day);
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({ 
        x: rect.left + window.scrollX, 
        y: rect.top + window.scrollY - 40 
      });
    }
  };

  // Hide tooltip when not hovering over a day
  const handleMouseLeave = () => {
    setSelectedDate(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.title}>Portfolio Value Heatmap</h2>
          <p className={styles.subtitle}>Daily portfolio performance throughout {year}</p>
          
          <div className={styles.yearSelector}>
            <button onClick={() => setYear(year - 1)}>◀</button>
            <span>{year}</span>
            <button onClick={() => setYear(year + 1)}>▶</button>
          </div>
        </div>
        
        <div className={styles.cardBody}>
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
                <div key={monthIndex} className={styles.monthCard}>
                  <div className={styles.monthHeader}>
                    <span className={styles.monthName}>{month.name}</span>
                  </div>
                  
                  <div className={styles.calendarGrid}>
                    {month.days.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`${styles.day} ${day.value !== null ? styles.hasValue : ''}`}
                        style={{ 
                          backgroundColor: day.value !== null ? 
                            (day.value > 0 ? `rgba(0, 200, 100, ${Math.min(0.2 + Math.abs(day.value)/500, 0.9)})` : 
                             `rgba(255, 80, 80, ${Math.min(0.2 + Math.abs(day.value)/500, 0.9)})`) : 
                            '#f0f0f0'
                        }}
                        onMouseMove={(e) => handleDayHover(day, e)}
                        title={day.date && day.value !== null ? `${day.date}: ₹${day.value?.toFixed(2)}` : 'No data'}
                      />
                    ))}
                  </div>
                  
                  <div className={styles.monthStats}>
                    <div className={`${styles.monthPL} ${month.pl >= 0 ? styles.positivePL : styles.negativePL}`}>
                      {month.pl !== undefined && month.pl !== null ? 
                        `₹${month.pl >= 0 ? '+' : ''}${month.pl.toFixed(2)}` : 
                        'No data'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Tooltip */}
          {selectedDate && (
            <div 
              className={styles.tooltip}
              style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
            >
              <div className={styles.tooltipDate}>{selectedDate.date}</div>
              <div className={styles.tooltipValue}>
                {selectedDate.value !== null ? `₹${selectedDate.value?.toFixed(2)}` : 'No data'}
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.cardFooter}>
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
      </div>
    </div>
  );
};

export default PortfolioValue;