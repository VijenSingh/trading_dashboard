import Trade from "@/models/Trade";
import { connectDB } from "@/lib/db";

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const trade = new Trade(body);
    await trade.save();
    return new Response(JSON.stringify(trade), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to create trade" }), { status: 500 });
  }
}

export async function GET(req) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const strategy = searchParams.get('strategy');
    const query = strategy ? { strategy } : {};
    const trades = await Trade.find(query);
    return new Response(JSON.stringify(trades), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch trades" }), { status: 500 });
  }
}