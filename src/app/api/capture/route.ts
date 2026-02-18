import { NextRequest, NextResponse } from "next/server";
import {
  classifyIntent,
  type CaptureContext,
} from "@/lib/llm/classify-intent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, context } = body as {
      transcript: string;
      context?: CaptureContext;
    };

    if (!transcript?.trim()) {
      return NextResponse.json(
        { error: "No transcript provided" },
        { status: 400 },
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 503 },
      );
    }

    const result = await classifyIntent(transcript, context ?? {});
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to classify intent" },
      { status: 500 },
    );
  }
}
