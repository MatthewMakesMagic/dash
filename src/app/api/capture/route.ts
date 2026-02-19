import { NextRequest, NextResponse } from "next/server";
import { extractStructured } from "@/lib/llm/extract-structured";
import { createCapture } from "@/lib/db/queries";
import type { CaptureContext } from "@/lib/llm/classify-intent";

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

    const extraction = await extractStructured(transcript, context ?? {});
    const capture = await createCapture(transcript, extraction);

    return NextResponse.json({
      id: capture.id,
      ...extraction,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Capture error:", message);
    return NextResponse.json(
      { error: "Failed to process capture", detail: message },
      { status: 500 },
    );
  }
}
