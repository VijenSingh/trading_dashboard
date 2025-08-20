"use client";
import { useEffect, useState } from "react";

const initialForm = {
  strategy: "strategy1",
  date: "",
  entryPrice: "",
  exitPrice: "",
  quantity: ""
};

export default function TradesPage() {
  const [trades, setTrades] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    const res = await fetch("/api/trades", { cache: "no-store" });
    const data = await res.json();
    setTrades(data);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    const res = await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        strategy: form.strategy,
        date: form.date,
        entryPrice: Number(form.entryPrice),
        exitPrice: Number(form.exitPrice),
        quantity: Number(form.quantity)
      })
    });
    if (res.ok) {
      setForm(initialForm);
      load();
    } else {
      alert("Failed to add");
    }
  }

  function startEdit(trade) {
    setEditingId(trade._id);
    setForm({
      strategy: trade.strategy,
      date: trade.date,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      quantity: trade.quantity
    });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const res = await fetch(`/api/trades/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        strategy: form.strategy,
        date: form.date,
        entryPrice: Number(form.entryPrice),
        exitPrice: Number(form.exitPrice),
        quantity: Number(form.quantity)
      })
    });
    if (res.ok) {
      setEditingId(null);
      setForm(initialForm);
      load();
    } else {
      alert("Failed to update");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete trade?")) return;
    const res = await fetch(`/api/trades/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <div>
      <h1>📈 Trades</h1>

      <form onSubmit={editingId ? handleUpdate : handleAdd} style={styles.form}>
        <select
          value={form.strategy}
          onChange={(e) => setForm({ ...form, strategy: e.target.value })}
          style={styles.input}
        >
          <option value="strategy1">Sniper NF</option>
          <option value="strategy2">Prop Desk Ce-04</option>
          <option value="strategy3">Prop Desk Ce-01</option>
          <option value="strategy4">CE/PE</option>
          <option value="strategy5">BTC Daily Option Selling with SL</option>
          <option value="strategy6">Suprita</option>
          <option value="strategy7">Shambhu</option>
          <option value="strategy8">Mahabuddhi</option>
          <option value="strategy9">Vasuki</option>
          <option value="strategy10">OG BTC Daily Option Selling</option>
          <option value="strategy11">VJS</option>
          <option value="strategy12">SK</option>
          <option value="strategy13">DNS</option>
          <option value="strategy14">SIM</option>
        </select>

        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          style={styles.input}
          required
        />
        <input
          type="number"
          placeholder="Entry"
          value={form.entryPrice}
          onChange={(e) => setForm({ ...form, entryPrice: e.target.value })}
          style={styles.input}
          required
        />
        <input
          type="number"
          placeholder="Exit"
          value={form.exitPrice}
          onChange={(e) => setForm({ ...form, exitPrice: e.target.value })}
          style={styles.input}
          required
        />
        <input
          type="number"
          placeholder="Qty"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.btnPrimary}>
          {editingId ? "Update" : "Add"} Trade
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }} style={styles.btnGhost}>
            Cancel
          </button>
        )}
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Entry</th>
            <th>Exit</th>
            <th>Qty</th>
            <th>Strategy</th>
            <th>P/L</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => {
            const pl = (t.exitPrice - t.entryPrice) * t.quantity;
            return (
              <tr key={t._id}>
                <td>{t.date}</td>
                <td>{t.entryPrice}</td>
                <td>{t.exitPrice}</td>
                <td>{t.quantity}</td>
                <td>{t.strategy}</td>
                <td style={{ color: pl >= 0 ? "green" : "crimson" }}>
                  {pl.toFixed(2)}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button onClick={() => startEdit(t)} style={styles.smallBtn}>Edit</button>
                  <button onClick={() => handleDelete(t._id)} style={styles.smallDanger}>Delete</button>
                </td>
              </tr>
            );
          })}
          {trades.length === 0 && (
            <tr><td colSpan="7" style={{ textAlign: "center", padding: 20 }}>No trades yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  form: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", margin: "16px 0" },
  input: { padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6 },
  btnPrimary: { padding: "8px 14px", background: "#2563eb", color: "#fff", border: 0, borderRadius: 6, cursor: "pointer" },
  btnGhost: { padding: "8px 14px", background: "#eee", color: "#111", border: 0, borderRadius: 6, cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", border: "1px solid #eee" },
  smallBtn: { padding: "6px 10px", marginRight: 6, borderRadius: 6, border: "1px solid #ddd", background: "#f8fafc", cursor: "pointer" },
  smallDanger: { padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fee2e2", color: "#991b1b", cursor: "pointer" }
};
