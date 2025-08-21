"use client";

import React, { useState } from "react";
import styles from "../css/tradeForm.module.css";

function TradeForm({ onAddTrade, selectedStrategy }) {
  const [formData, setFormData] = useState({
    date: "",
    entryPrice: "",
    exitPrice: "",
    quantity: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      formData.date &&
      formData.entryPrice &&
      formData.exitPrice &&
      formData.quantity
    ) {
      setIsSubmitting(true);
      const quantity = parseInt(formData.quantity);
      const tradeData = { ...formData, quantity, strategy: selectedStrategy };
      try {
        const response = await fetch("/api/trades", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tradeData),
        });
        
        if (response.ok) {
          const newTrade = await response.json();
          onAddTrade(newTrade);
          setFormData({
            date: "",
            entryPrice: "",
            exitPrice: "",
            quantity: "",
          });
        } else {
          console.error("Error submitting trade data");
        }
      } catch (error) {
        console.error("Error submitting trade data:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      alert("Please fill in all fields");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.tradeForm}>
      <h2 className={styles.heading}>Add New Trade</h2>

      <div className={styles.formGroup}>
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Entry Price:</label>
        <input
          type="number"
          name="entryPrice"
          value={formData.entryPrice}
          onChange={handleChange}
          step="0.01"
          min="0"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Exit Price:</label>
        <input
          type="number"
          name="exitPrice"
          value={formData.exitPrice}
          onChange={handleChange}
          step="0.01"
          min="0"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Quantity:</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          required
        />
      </div>

      <button 
        type="submit" 
        className={styles.submitBtn}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Adding Trade..." : "Add Trade"}
      </button>
    </form>
  );
}

export default TradeForm;