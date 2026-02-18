import { NextResponse } from "next/server";
import { getTasks } from "@/lib/db/queries";

export async function GET() {
  try {
    const taskList = await getTasks();
    return NextResponse.json(taskList);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}
