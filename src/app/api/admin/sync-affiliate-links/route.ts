import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { syncAffiliateLinksFromRoyal } from "@/lib/sync-affiliate-links";

export async function POST() {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncAffiliateLinksFromRoyal();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
