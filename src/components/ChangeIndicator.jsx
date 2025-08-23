"use client";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import styles from "../css/RankedStrategies.module.css";

const ChangeIndicator = ({ change }) => {
  const value = parseFloat(change);

  if (isNaN(value)) return <span>-</span>;

  if (value > 0) {
    return (
      <span className={`${styles.change} ${styles.positive}`}>
        <ArrowUp className={styles.icon} />
        {value}%
      </span>
    );
  } else if (value < 0) {
    return (
      <span className={`${styles.change} ${styles.negative}`}>
        <ArrowDown className={styles.icon} />
        {value}%
      </span>
    );
  } else {
    return (
      <span className={`${styles.change} ${styles.neutral}`}>
        <Minus className={styles.icon} />
        0%
      </span>
    );
  }
};

export default ChangeIndicator;
