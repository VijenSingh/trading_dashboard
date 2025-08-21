"use client";
import { useState, useEffect } from 'react';

const UseAllStrategiesData = () => {
  const [data, setData] = useState({
    Sniper_NF: 0,
    Prop_Desk_Ce_04: 0,
    Prop_Desk_Ce_01: 0,
    CE_PE: 0,
    Range_Breakout: 0,
    Suprita: 0,
    Shambhu: 0,
    Mahabuddhi: 0,
    Vasuki: 0,
    NF_Selling_Long_Term: 0,
    VJS: 0,
    SK: 0,
    DNS: 0,
    SIM: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Create an array of all strategy API calls
        const strategyPromises = [];
        
        for (let i = 1; i <= 14; i++) {
          strategyPromises.push(
            fetch(`/api/trades/strategy${i}`)
              .then(response => response.json())
              .catch(error => {
                console.error(`Error fetching strategy${i} data:`, error);
                return []; // Return empty array if there's an error
              })
          );
        }
        
        // Wait for all API calls to complete
        const results = await Promise.all(strategyPromises);
        
        // Calculate cumulative PL for each strategy
        const calculateCumulativePL = (trades) => {
          let cumulativePL = 0;
          trades.forEach((trade) => {
            const profitLoss = parseFloat(
              ((trade.exitPrice - trade.entryPrice) * parseInt(trade.quantity)).toFixed(2)
            );
            cumulativePL += profitLoss;
          });
          return cumulativePL;
        };

        setData({
          Sniper_NF: calculateCumulativePL(results[0]),
          Prop_Desk_Ce_04: calculateCumulativePL(results[1]),
          Prop_Desk_Ce_01: calculateCumulativePL(results[2]),
          CE_PE: calculateCumulativePL(results[3]),
          Range_Breakout: calculateCumulativePL(results[4]),
          Suprita: calculateCumulativePL(results[5]),
          Shambhu: calculateCumulativePL(results[6]),
          Mahabuddhi: calculateCumulativePL(results[7]),
          Vasuki: calculateCumulativePL(results[8]),
          NF_Selling_Long_Term: calculateCumulativePL(results[9]),
          VJS: calculateCumulativePL(results[10]),
          SK: calculateCumulativePL(results[11]),
          DNS: calculateCumulativePL(results[12]),
          SIM: calculateCumulativePL(results[13]),
        });
      } catch (error) {
        console.error('Error fetching trade data:', error);
      }
    };

    fetchData();
  }, []);

  return data;
};

export default UseAllStrategiesData;