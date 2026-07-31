"use client";

import React, { useState } from "react";
import styles from "../css/tradeForm.module.css";
import { useToast } from "@/context/ToastContext";

const EMPTY_FORM = {
  date: "",
  entryPrice: "",
  exitPrice: "",
  quantity: "",
};

function validate(formData) {
  const errors = {};
  if (!formData.date) errors.date = "Date is required";
  if (!formData.entryPrice) errors.entryPrice = "Entry price is required";
  else if (Number(formData.entryPrice) < 0) errors.entryPrice = "Entry price can't be negative";
  if (!formData.exitPrice) errors.exitPrice = "Exit price is required";
  else if (Number(formData.exitPrice) < 0) errors.exitPrice = "Exit price can't be negative";
  if (!formData.quantity) errors.quantity = "Quantity is required";
  else if (Number(formData.quantity) < 1) errors.quantity = "Quantity must be at least 1";
  return errors;
}

function TradeForm({ onAddTrade, selectedStrategy }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fieldErrors = validate(formData);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

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
        setFormData(EMPTY_FORM);
        setErrors({});
        showToast("Trade added successfully", "success");
      } else {
        showToast("Failed to add trade. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error submitting trade data:", error);
      showToast("Network error while adding trade.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.tradeForm} noValidate>
      <h2 className={styles.heading}>Add New Trade</h2>

      <div className={styles.formGroup}>
        <label htmlFor="trade-date">Date:</label>
        <input
          id="trade-date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          aria-invalid={!!errors.date}
          aria-describedby={errors.date ? "trade-date-error" : undefined}
          className={errors.date ? styles.inputError : undefined}
        />
        {errors.date && (
          <span id="trade-date-error" className={styles.fieldError}>{errors.date}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="trade-entryPrice">Entry Price:</label>
        <input
          id="trade-entryPrice"
          type="number"
          name="entryPrice"
          value={formData.entryPrice}
          onChange={handleChange}
          step="0.01"
          min="0"
          aria-invalid={!!errors.entryPrice}
          aria-describedby={errors.entryPrice ? "trade-entryPrice-error" : undefined}
          className={errors.entryPrice ? styles.inputError : undefined}
        />
        {errors.entryPrice && (
          <span id="trade-entryPrice-error" className={styles.fieldError}>{errors.entryPrice}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="trade-exitPrice">Exit Price:</label>
        <input
          id="trade-exitPrice"
          type="number"
          name="exitPrice"
          value={formData.exitPrice}
          onChange={handleChange}
          step="0.01"
          min="0"
          aria-invalid={!!errors.exitPrice}
          aria-describedby={errors.exitPrice ? "trade-exitPrice-error" : undefined}
          className={errors.exitPrice ? styles.inputError : undefined}
        />
        {errors.exitPrice && (
          <span id="trade-exitPrice-error" className={styles.fieldError}>{errors.exitPrice}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="trade-quantity">Quantity:</label>
        <input
          id="trade-quantity"
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          aria-invalid={!!errors.quantity}
          aria-describedby={errors.quantity ? "trade-quantity-error" : undefined}
          className={errors.quantity ? styles.inputError : undefined}
        />
        {errors.quantity && (
          <span id="trade-quantity-error" className={styles.fieldError}>{errors.quantity}</span>
        )}
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
