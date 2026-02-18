import { NextRequest, NextResponse } from "next/server";
import { updateGoal } from "@/lib/db/queries";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const goal = await updateGoal(id, body);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }
    return NextResponse.json(goal);
  } catch {
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 },
    );
  }
}
