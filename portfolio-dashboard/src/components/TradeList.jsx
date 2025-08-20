"use client";

import { useState } from "react";
import EquityCurveChart from "@/components/EquityCurveChart";

import styles from "../css/tradeList.module.css";

function TradeList({ trades, selectedStrategy, setTrades }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTrade, setEditTrade] = useState(null);

  // Calculate Profit/Loss + Cumulative P&L
  const calculateCumulativePL = () => {
    let cumulativePL = 0;
    return trades.map((trade) => {
      const profitLoss = parseFloat(
        ((trade.exitPrice - trade.entryPrice) * parseInt(trade.quantity)).toFixed(2)
      );
      cumulativePL += profitLoss;
      return { ...trade, profitLoss, cumulativePL };
    });
  };

  const tradesWithCumulativePL = calculateCumulativePL();

  // Equity data for chart
  const equityData = tradesWithCumulativePL.map((trade) => ({
    date: trade.date,
    cumulativePL: trade.cumulativePL,
  }));

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [tradesPerPage] = useState(10);

  const indexOfLastTrade = currentPage * tradesPerPage;
  const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
  const currentTrades = tradesWithCumulativePL.slice(
    indexOfFirstTrade,
    indexOfLastTrade
  );

  const totalPages = Math.ceil(tradesWithCumulativePL.length / tradesPerPage);

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

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/trades/${id}?strategy=${selectedStrategy}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setTrades((prevTrades) => prevTrades.filter((trade) => trade._id !== id));
      } else {
        console.error("Error deleting trade");
      }
    } catch (error) {
      console.error("Error deleting trade:", error);
    }
  };

  const handleEdit = (trade) => {
    setEditTrade(trade);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTrade((prevTrade) => ({ ...prevTrade, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedTrade = { ...editTrade, selectedStrategy };
      const response = await fetch(`/api/trades/${editTrade._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTrade),
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrades((prevTrades) =>
          prevTrades.map((trade) =>
            trade._id === editTrade._id ? data : trade
          )
        );
        setIsEditModalOpen(false);
        setEditTrade(null);
      } else {
        console.error("Error updating trade");
      }
    } catch (error) {
      console.error("Error updating trade:", error);
    }
  };

  return (
    <div className={styles.tradeList}>
      <h2 className={styles.title}>📊 Trade History</h2>
      
      <div className={styles.tableContainer}>
        <table className={styles.tradeTable}>
          <thead>
            <tr>
              <th>Date</th>
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
                  <td>{trade.date}</td>
                  <td>{trade.entryPrice}</td>
                  <td>{trade.exitPrice}</td>
                  <td>{trade.quantity}</td>
                  <td className={trade.profitLoss >= 0 ? styles.profit : styles.loss}>
                    {trade.profitLoss}
                  </td>
                  <td>{trade.cumulativePL.toFixed(2)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button 
                        className={styles.editButton}
                        onClick={() => handleEdit(trade)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDelete(trade._id)}
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
                  No trades found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            onClick={prevPage} 
            disabled={currentPage === 1}
            className={styles.navButton}
          >
            ⏮ Prev
          </button>
          {renderPageNumbers()}
          <button 
            onClick={nextPage} 
            disabled={currentPage === totalPages}
            className={styles.navButton}
          >
            Next ⏭
          </button>
        </div>
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
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Edit Trade</h2>
            <form onSubmit={handleEditSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Date:
                </label>
                <input
                  type="date"
                  name="date"
                  value={editTrade.date}
                  onChange={handleEditChange}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Entry Price:
                </label>
                <input
                  type="number"
                  name="entryPrice"
                  value={editTrade.entryPrice}
                  onChange={handleEditChange}
                  className={styles.formInput}
                  step="0.01"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Exit Price:
                </label>
                <input
                  type="number"
                  name="exitPrice"
                  value={editTrade.exitPrice}
                  onChange={handleEditChange}
                  className={styles.formInput}
                  step="0.01"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Quantity:
                </label>
                <input
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
                  onClick={() => setIsEditModalOpen(false)}
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
    </div>
  );
}

export default TradeList;