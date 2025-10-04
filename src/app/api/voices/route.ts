import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { text, voice } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const selectedVoice = voice || "alloy";

    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: selectedVoice,
      input: text,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const b64_json = buffer.toString("base64");
    const url = `data:audio/mp3;base64,${b64_json}`;

    return NextResponse.json({ url, b64_json });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate speech" },
      { status: 500 }
    );
  }
}
