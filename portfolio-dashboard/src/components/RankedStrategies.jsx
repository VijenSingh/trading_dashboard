"use client";
import React from "react";

export default function RankedStrategies() {
  // Placeholder
  const strategies = ["strategy1", "strategy2", "strategy3"];
  return (
    <div style={{ marginTop: 20 }}>
      <h3>Ranked Strategies</h3>
      <ol>
        {strategies.map(s => <li key={s}>{s}</li>)}
      </ol>
    </div>
  );
}
