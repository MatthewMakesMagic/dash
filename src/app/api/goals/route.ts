import { NextResponse } from "next/server";
import { getGoals } from "@/lib/db/queries";

export async function GET() {
  try {
    const list = await getGoals();
    return NextResponse.json(list);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 },
    );
  }
}
