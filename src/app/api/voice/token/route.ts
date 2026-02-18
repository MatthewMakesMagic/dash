import { createClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Deepgram API key not configured" },
      { status: 503 },
    );
  }

  try {
    const deepgram = createClient(apiKey);
    const { result, error } = await deepgram.auth.grantToken({
      ttl_seconds: 300, // 5 minutes - enough for a voice session
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to generate token" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      token: result.access_token,
      expires_in: result.expires_in,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 },
    );
  }
}
