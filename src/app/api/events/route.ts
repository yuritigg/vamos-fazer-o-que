import { NextResponse } from "next/server";
import { getApprovedEventsFromDb } from "@/lib/supabase/events";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const events = await getApprovedEventsFromDb();
  const filtered = category && category !== "todas" ? events.filter((event) => event.category === category) : events;

  return NextResponse.json({ data: filtered });
}
