import { NextResponse } from "next/server";
import { getReflections } from "@/lib/db/queries";

export async function GET() {
  try {
    const list = await getReflections();
    return NextResponse.json(list);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch reflections" },
      { status: 500 },
    );
  }
}
