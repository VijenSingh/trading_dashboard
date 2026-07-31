import mongoose from "mongoose";

const TradeSchema = new mongoose.Schema(
  {
    strategy: { type: String, required: true },
    date: { type: String, required: true },      // aapke purane code se match
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true }
  },
  { timestamps: true }
);

// Every read goes through `{ strategy }` (optionally sorted by date) — without
// this index Mongo does a full collection scan on every request.
TradeSchema.index({ strategy: 1, date: 1 });

// Hot-reload ke time model re-define error bachane ke liye:
export default mongoose.models.Trade || mongoose.model("Trade", TradeSchema);
