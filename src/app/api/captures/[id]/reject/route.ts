import { NextResponse } from "next/server";
import { rejectCapture } from "@/lib/db/queries";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const capture = await rejectCapture(id);
    return NextResponse.json(capture);
  } catch {
    return NextResponse.json(
      { error: "Failed to reject capture" },
      { status: 500 },
    );
  }
}
