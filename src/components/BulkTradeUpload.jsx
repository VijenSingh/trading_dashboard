"use client";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { UploadCloud, Download, CheckCircle2, XCircle, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import styles from "../css/BulkTradeUpload.module.css";

const HEADER_ALIASES = {
  date: ["date"],
  entryPrice: ["entry price", "entryprice", "entry"],
  exitPrice: ["exit price", "exitprice", "exit"],
  quantity: ["quantity", "qty"],
};

function getField(lowerRow, field) {
  for (const alias of HEADER_ALIASES[field]) {
    if (alias in lowerRow) return lowerRow[alias];
  }
  return undefined;
}

const MONTH_NAMES = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

const pad2 = (n) => String(n).padStart(2, "0");

function isValidYMD(y, m, d) {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  // Reject impossible calendar dates (e.g. day 31 in a 30-day month).
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

// Normalizes Excel/CSV date cells into the "YYYY-MM-DD" string the schema
// uses. Real date-formatted cells arrive here as a raw Excel serial number
// (see the `XLSX.read` call below, which deliberately skips `cellDates` —
// converting a serial to a JS Date and back out via its getters can drift by
// a day depending on the browser's timezone; parsing the serial directly
// with SSF is pure epoch arithmetic and has no such risk). Text cells are
// matched against ISO, month-name ("17 Jul 2025" / "Jul 17, 2025"), and
// numeric D/M/Y or M/D/Y forms. Numeric slash/dash dates are disambiguated
// when one part is > 12 (must be the day); when genuinely ambiguous (both
// parts <= 12, e.g. "2/6/2026") they're read as DD/MM — matching the
// DD/MM/YYYY display used across this app.
function normalizeDate(value) {
  if (typeof value === "number") {
    const parsed = XLSX.SSF?.parse_date_code?.(value);
    if (parsed && isValidYMD(parsed.y, parsed.m, parsed.d)) {
      return `${parsed.y}-${pad2(parsed.m)}-${pad2(parsed.d)}`;
    }
    return null;
  }

  const str = String(value ?? "").trim();
  if (!str) return null;

  // ISO: YYYY-MM-DD or YYYY/MM/DD
  let m = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m) {
    const [, y, mo, d] = m.map(Number);
    return isValidYMD(y, mo, d) ? `${y}-${pad2(mo)}-${pad2(d)}` : null;
  }

  // Month-name text: "17 Jul 2025", "17-Jul-2025", "Jul 17, 2025", "July 17 2025"
  m = str.match(/^(\d{1,2})[\s-]+([A-Za-z]+)[\s,-]+(\d{4})$/);
  if (m) {
    const mo = MONTH_NAMES[m[2].toLowerCase()];
    const [d, , y] = [Number(m[1]), null, Number(m[3])];
    return mo && isValidYMD(y, mo, d) ? `${y}-${pad2(mo)}-${pad2(d)}` : null;
  }
  m = str.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (m) {
    const mo = MONTH_NAMES[m[1].toLowerCase()];
    const [d, y] = [Number(m[2]), Number(m[3])];
    return mo && isValidYMD(y, mo, d) ? `${y}-${pad2(mo)}-${pad2(d)}` : null;
  }

  // Numeric D/M/Y or M/D/Y with - or / separators
  m = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const y = Number(m[3]);
    let day, month;
    if (a > 12 && b <= 12) { day = a; month = b; }
    else if (b > 12 && a <= 12) { day = b; month = a; }
    else { day = a; month = b; } // ambiguous -> DD/MM convention
    return isValidYMD(y, month, day) ? `${y}-${pad2(month)}-${pad2(day)}` : null;
  }

  return null;
}

function parseRow(rawRow, index) {
  const lowerRow = {};
  Object.keys(rawRow).forEach((k) => {
    lowerRow[k.trim().toLowerCase()] = rawRow[k];
  });

  const date = normalizeDate(getField(lowerRow, "date"));
  const entryPrice = Number(getField(lowerRow, "entryPrice"));
  const exitPrice = Number(getField(lowerRow, "exitPrice"));
  const quantity = Number(getField(lowerRow, "quantity"));

  const errors = [];
  if (!date) errors.push("unrecognized date — check the preview column and fix it in the sheet");
  if (!Number.isFinite(entryPrice) || entryPrice < 0) errors.push("invalid entry price");
  if (!Number.isFinite(exitPrice) || exitPrice < 0) errors.push("invalid exit price");
  if (!Number.isFinite(quantity) || quantity < 1) errors.push("invalid quantity");

  return {
    rowNumber: index + 2, // +1 for header row, +1 for 1-based display
    date,
    entryPrice,
    exitPrice,
    quantity,
    errors,
    valid: errors.length === 0,
  };
}

export default function BulkTradeUpload({ selectedStrategy, onBulkAdd }) {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (rawRows.length === 0) {
        showToast("That sheet has no data rows.", "error");
        reset();
        return;
      }

      setRows(rawRows.map(parseRow));
    } catch (err) {
      console.error("Error parsing spreadsheet:", err);
      showToast("Couldn't read that file. Is it a valid Excel/CSV file?", "error");
      reset();
    }
  };

  const reset = () => {
    setRows([]);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([["Date", "Entry Price", "Exit Price", "Quantity"]]);
    ws["!cols"] = [{ wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trades");
    const arrayBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trade-upload-template.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleConfirmUpload = async () => {
    if (validRows.length === 0) return;
    setIsUploading(true);
    try {
      const response = await fetch("/api/trades/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy: selectedStrategy,
          trades: validRows.map(({ date, entryPrice, exitPrice, quantity }) => ({
            date,
            entryPrice,
            exitPrice,
            quantity,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onBulkAdd(data.inserted);
        const skippedNote = data.skippedRows?.length ? ` (${data.skippedRows.length} skipped)` : "";
        showToast(`${data.insertedCount} trade${data.insertedCount === 1 ? "" : "s"} added${skippedNote}`, "success");
        reset();
      } else {
        const data = await response.json().catch(() => ({}));
        showToast(data.error || "Failed to upload trades. Please try again.", "error");
      }
    } catch (err) {
      console.error("Error uploading trades:", err);
      showToast("Network error while uploading trades.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Bulk Upload</h2>
      <p className={styles.hint}>
        Upload an Excel or CSV file with columns <strong>Date, Entry Price, Exit Price, Quantity</strong> —
        every row will be added to the currently selected strategy. Dates can be a real date cell
        or text like <strong>2026-02-06</strong>, <strong>06/02/2026</strong>, or{" "}
        <strong>6 Feb 2026</strong>. When a numeric date could mean either day (e.g. 2/6/2026),
        it's read as <strong>DD/MM</strong> — check the preview below to confirm before uploading.
      </p>

      {rows.length === 0 ? (
        <>
          <button type="button" className={styles.templateBtn} onClick={handleDownloadTemplate}>
            <Download className={styles.templateIcon} />
            Download Template (.xlsx)
          </button>

          <label className={styles.dropZone}>
            <UploadCloud className={styles.uploadIcon} />
            <span>Click to choose a .xlsx, .xls or .csv file</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
          </label>
        </>
      ) : (
        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <span className={styles.fileName}>{fileName}</span>
            <button type="button" className={styles.resetBtn} onClick={reset} aria-label="Remove file">
              <X className={styles.resetIcon} />
            </button>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryValid}>
              <CheckCircle2 className={styles.summaryIcon} /> {validRows.length} valid
            </span>
            {invalidRows.length > 0 && (
              <span className={styles.summaryInvalid}>
                <XCircle className={styles.summaryIcon} /> {invalidRows.length} invalid
              </span>
            )}
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Date</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.rowNumber} className={r.valid ? undefined : styles.invalidRow}>
                    <td>{r.rowNumber}</td>
                    <td>{r.date || "—"}</td>
                    <td>{Number.isFinite(r.entryPrice) ? r.entryPrice : "—"}</td>
                    <td>{Number.isFinite(r.exitPrice) ? r.exitPrice : "—"}</td>
                    <td>{Number.isFinite(r.quantity) ? r.quantity : "—"}</td>
                    <td className={r.valid ? styles.statusOk : styles.statusError}>
                      {r.valid ? "OK" : r.errors.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={reset}>
              Cancel
            </button>
            <button
              type="button"
              className={styles.uploadBtn}
              onClick={handleConfirmUpload}
              disabled={validRows.length === 0 || isUploading}
            >
              {isUploading ? "Uploading..." : `Upload ${validRows.length} trade${validRows.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
