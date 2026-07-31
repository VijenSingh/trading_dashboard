"use client";
import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import styles from "../css/ConfirmDialog.module.css";
import useFocusTrap from "@/hooks/useFocusTrap";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);
  const dialogRef = useRef(null);
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onCancel}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.iconWrap} data-danger={danger}>
          <AlertTriangle className={styles.icon} />
        </div>
        <h3 id="confirm-dialog-title" className={styles.title}>{title}</h3>
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            className={danger ? styles.confirmBtnDanger : styles.confirmBtn}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
