import { NextResponse } from "next/server";
import { getApprovedEventsFromDb } from "@/lib/supabase/events";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  const events = await getApprovedEventsFromDb({ category, q });

  return NextResponse.json({ data: events });
}
