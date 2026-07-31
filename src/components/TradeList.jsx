"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Download } from "lucide-react";
import EquityCurveChart from "@/components/EquityCurveChart";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/context/ToastContext";
import useFocusTrap from "@/hooks/useFocusTrap";
import { parseLocalDate } from "@/lib/date";
import styles from "../css/tradeList.module.css";

function TradeList({ trades, setTrades, selectedStrategy }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTrade, setEditTrade] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { showToast } = useToast();
  const modalRef = useRef(null);
  useFocusTrap(modalRef, isEditModalOpen);

  // Sort trades by date in ascending order
  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }, [trades]);

  // Calculate Profit/Loss + Cumulative P&L (over the full history, so the
  // running total stays correct even when the table below is date-filtered)
  const tradesWithCumulativePL = useMemo(() => {
    let cumulativePL = 0;
    return sortedTrades.map((trade) => {
      const profitLoss = parseFloat(
        ((trade.exitPrice - trade.entryPrice) * parseInt(trade.quantity)).toFixed(2)
      );
      cumulativePL += profitLoss;
      return { ...trade, profitLoss, cumulativePL };
    });
  }, [sortedTrades]);

  // Equity data for chart - already sorted by date
  const equityData = useMemo(
    () =>
      tradesWithCumulativePL.map((trade) => ({
        date: trade.date,
        cumulativePL: trade.cumulativePL,
      })),
    [tradesWithCumulativePL]
  );

  // Date-range filter for the table + CSV export (dates are stored as
  // "YYYY-MM-DD" strings, so lexicographic comparison is chronological)
  const filteredTrades = useMemo(() => {
    return tradesWithCumulativePL.filter((trade) => {
      if (fromDate && trade.date < fromDate) return false;
      if (toDate && trade.date > toDate) return false;
      return true;
    });
  }, [tradesWithCumulativePL, fromDate, toDate]);

  const isFiltered = Boolean(fromDate || toDate);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [tradesPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate]);

  const indexOfLastTrade = currentPage * tradesPerPage;
  const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
  const currentTrades = filteredTrades.slice(indexOfFirstTrade, indexOfLastTrade);

  const totalPages = Math.ceil(filteredTrades.length / tradesPerPage);

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handlePageClick = (page) => setCurrentPage(page);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers.map((number) => {
      if (
        number === 1 ||
        number === totalPages ||
        (number >= currentPage - 1 && number <= currentPage + 1)
      ) {
        return (
          <button
            key={number}
            onClick={() => handlePageClick(number)}
            className={`${styles.pageButton} ${
              number === currentPage ? styles.activePage : ""
            }`}
            aria-label={`Go to page ${number}`}
            aria-current={number === currentPage ? "page" : undefined}
          >
            {number}
          </button>
        );
      }
      if (number === currentPage - 2 || number === currentPage + 2) {
        return <span key={number} className={styles.pageEllipsis}>...</span>;
      }
      return null;
    });
  };

  const handleDeleteClick = (id) => setPendingDeleteId(id);
  const handleDeleteCancel = () => setPendingDeleteId(null);

  const handleDeleteConfirm = async () => {
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      const response = await fetch(`/api/trades/${id}`, { method: "DELETE" });
      if (response.ok) {
        setTrades((prevTrades) => prevTrades.filter((trade) => trade._id !== id));
        showToast("Trade deleted", "success");
      } else {
        showToast("Failed to delete trade. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error deleting trade:", error);
      showToast("Network error while deleting trade.", "error");
    }
  };

  const handleEdit = (trade) => {
    setEditTrade(trade);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditTrade(null);
  };

  useEffect(() => {
    if (!isEditModalOpen) return;
    modalRef.current?.querySelector("input")?.focus();

    const handleKey = (e) => {
      if (e.key === "Escape") closeEditModal();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isEditModalOpen]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTrade((prevTrade) => ({ ...prevTrade, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/trades/${editTrade._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editTrade),
      });

      if (response.ok) {
        const data = await response.json();
        setTrades((prevTrades) =>
          prevTrades.map((trade) =>
            trade._id === editTrade._id ? data : trade
          )
        );
        closeEditModal();
        showToast("Trade updated", "success");
      } else {
        showToast("Failed to update trade. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error updating trade:", error);
      showToast("Network error while updating trade.", "error");
    }
  };

  const handleExportCSV = () => {
    const header = ["Date", "Entry Price", "Exit Price", "Quantity", "Profit/Loss", "Cumulative P&L"];
    const rows = filteredTrades.map((t) => [
      t.date,
      t.entryPrice,
      t.exitPrice,
      t.quantity,
      t.profitLoss,
      t.cumulativePL.toFixed(2),
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedStrategy || "trades"}-trades.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("CSV exported", "success");
  };

  return (
    <div className={styles.tradeList}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>📊 Trade History</h2>
        <button
          type="button"
          className={styles.exportButton}
          onClick={handleExportCSV}
          disabled={filteredTrades.length === 0}
        >
          <Download className={styles.exportIcon} />
          Export CSV
        </button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterField}>
          <label htmlFor="trade-from-date">From</label>
          <input
            id="trade-from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className={styles.filterField}>
          <label htmlFor="trade-to-date">To</label>
          <input
            id="trade-to-date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        {isFiltered && (
          <button
            type="button"
            className={styles.clearFilterButton}
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
          >
            Clear filter
          </button>
        )}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.tradeTable}>
          <thead>
            <tr>
              <th>Date ↗</th>
              <th>Entry Price</th>
              <th>Exit Price</th>
              <th>Quantity</th>
              <th>Profit/Loss</th>
              <th>Cumulative P&L</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTrades.length > 0 ? (
              currentTrades.map((trade) => (
                <tr key={trade._id}>
                  <td>{parseLocalDate(trade.date).toLocaleDateString('en-GB')}</td>
                  <td>{trade.entryPrice}</td>
                  <td>{trade.exitPrice}</td>
                  <td>{trade.quantity}</td>
                  <td className={trade.profitLoss >= 0 ? styles.profit : styles.loss}>
                    {trade.profitLoss >= 0 ? '+' : ''}{trade.profitLoss}
                  </td>
                  <td>{trade.cumulativePL.toFixed(2)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.editButton}
                        onClick={() => handleEdit(trade)}
                        aria-label={`Edit trade from ${parseLocalDate(trade.date).toLocaleDateString('en-GB')}`}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteClick(trade._id)}
                        aria-label={`Delete trade from ${parseLocalDate(trade.date).toLocaleDateString('en-GB')}`}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className={styles.noTrades}>
                  {isFiltered ? "No trades in this date range" : "No trades found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Trade history pages">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={styles.navButton}
            aria-label="Previous page"
          >
            ⏮ Prev
          </button>
          {renderPageNumbers()}
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={styles.navButton}
            aria-label="Next page"
          >
            Next ⏭
          </button>
        </nav>
      )}

      {/* Equity Curve */}
      {equityData.length > 0 && (
        <div className={styles.equitySection}>
          <h3 className={styles.equityTitle}>📈 Equity Curve</h3>
          <EquityCurveChart equityData={equityData} />
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay} onClick={closeEditModal} role="presentation">
          <div
            ref={modalRef}
            className={styles.modalContent}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-trade-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="edit-trade-title" className={styles.modalTitle}>Edit Trade</h2>
            <form onSubmit={handleEditSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="edit-date">
                  Date:
                </label>
                <input
                  id="edit-date"
                  type="date"
                  name="date"
                  value={editTrade.date}
                  onChange={handleEditChange}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="edit-entryPrice">
                  Entry Price:
                </label>
                <input
                  id="edit-entryPrice"
                  type="number"
                  name="entryPrice"
                  value={editTrade.entryPrice}
                  onChange={handleEditChange}
                  className={styles.formInput}
                  step="0.01"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="edit-exitPrice">
                  Exit Price:
                </label>
                <input
                  id="edit-exitPrice"
                  type="number"
                  name="exitPrice"
                  value={editTrade.exitPrice}
                  onChange={handleEditChange}
                  className={styles.formInput}
                  step="0.01"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="edit-quantity">
                  Quantity:
                </label>
                <input
                  id="edit-quantity"
                  type="number"
                  name="quantity"
                  value={editTrade.quantity}
                  onChange={handleEditChange}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete this trade?"
        message="This action can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}

export default TradeList;
