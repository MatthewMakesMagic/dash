import { NextRequest, NextResponse } from "next/server";
import { getAllCaptures } from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") ?? undefined;
    const captures = await getAllCaptures(status);
    return NextResponse.json(captures);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch captures" },
      { status: 500 },
    );
  }
}
