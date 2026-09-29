import { NextRequest, NextResponse } from "next/server";
import { FLOOD_ZONES_DATA, getFloodSummary } from "@/lib/floodData";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state");
  const status = searchParams.get("status");

  let zones = FLOOD_ZONES_DATA;

  if (state) {
    zones = zones.filter(
      (z) => z.state.toLowerCase() === state.toLowerCase()
    );
  }

  if (status) {
    zones = zones.filter((z) => z.status === status);
  }

  // Simulate slight level changes on each request (live feel)
  const liveZones = zones.map((z) => ({
    ...z,
    level: parseFloat(
      (z.level + (Math.random() * 0.1 - 0.05)).toFixed(2)
    ),
    lastUpdated: new Date().toISOString(),
  }));

  return NextResponse.json({
    zones: liveZones,
    summary: getFloodSummary(),
    updatedAt: new Date().toISOString(),
  });
}
