// src/app/api/trades/[strategy]/route.js

import Trade from "@/models/Trade";
import { connectDB } from "@/lib/db";

export async function GET(req, { params }) {
  await connectDB();
  try {
    const { strategy } = await params; // Await the params promise
    const trades = await Trade.find({ strategy });
    return new Response(JSON.stringify(trades), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch trades" }), { status: 500 });
  }
}


export async function PUT(req, { params }) {
  await connectDB();
  try {
    const { strategy } = await params; // Await the params promise
    const body = await req.json();
    const trade = await Trade.findByIdAndUpdate(strategy, body, { new: true });
    if (!trade) return new Response(JSON.stringify({ error: "Trade not found" }), { status: 404 });
    return new Response(JSON.stringify(trade), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to update trade" }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectDB();
  try {
    const { strategy } = await params; // Await the params
    const trade = await Trade.findByIdAndDelete(strategy);
    if (!trade) return new Response(JSON.stringify({ error: "Trade not found" }), { status: 404 });
    return new Response(JSON.stringify({ message: "Trade deleted" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to delete trade" }), { status: 500 });
  }
}
