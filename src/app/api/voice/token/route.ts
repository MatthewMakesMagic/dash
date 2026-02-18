import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Deepgram API key not configured" },
      { status: 503 },
    );
  }

  // For dev/prototype: pass the API key directly.
  // In production, use Deepgram's temporary token API with a key
  // that has the "keys:write" scope enabled.
  return NextResponse.json({
    token: apiKey,
    expires_in: 3600,
  });
}
