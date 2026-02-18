import { NextRequest, NextResponse } from "next/server";
import { acceptCapture } from "@/lib/db/queries";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const editedData = body.structured_data as
      | Record<string, unknown>
      | undefined;
    const result = await acceptCapture(id, editedData);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to accept capture";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
