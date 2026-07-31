import Trade from "@/models/Trade";
import { connectDB } from "@/lib/db";

const MAX_ROWS = 5000;

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { strategy, trades } = body;

    if (typeof strategy !== "string" || !/^strategy\d+$/.test(strategy)) {
      return new Response(JSON.stringify({ error: "Invalid or missing strategy" }), { status: 400 });
    }
    if (!Array.isArray(trades) || trades.length === 0) {
      return new Response(JSON.stringify({ error: "trades must be a non-empty array" }), { status: 400 });
    }
    if (trades.length > MAX_ROWS) {
      return new Response(JSON.stringify({ error: `Too many rows (max ${MAX_ROWS} per upload)` }), { status: 400 });
    }

    // Re-validate every row server-side — never trust the client, even
    // though the uploader already filters bad rows before sending.
    const docs = [];
    const skippedRows = [];

    trades.forEach((t, i) => {
      const date = typeof t?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t.date) ? t.date : null;
      const entryPrice = Number(t?.entryPrice);
      const exitPrice = Number(t?.exitPrice);
      const quantity = Number(t?.quantity);

      if (
        !date ||
        !Number.isFinite(entryPrice) ||
        entryPrice < 0 ||
        !Number.isFinite(exitPrice) ||
        exitPrice < 0 ||
        !Number.isFinite(quantity) ||
        quantity < 1
      ) {
        skippedRows.push(i + 1);
        return;
      }

      docs.push({ strategy, date, entryPrice, exitPrice, quantity });
    });

    const inserted = docs.length > 0 ? await Trade.insertMany(docs) : [];

    return new Response(
      JSON.stringify({ inserted, insertedCount: inserted.length, skippedRows }),
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to bulk insert trades" }), { status: 500 });
  }
}
