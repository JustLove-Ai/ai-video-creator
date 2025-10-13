import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    // Convert the audio file to a format Whisper can process
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save the recording to public/voice-record
    const timestamp = Date.now();
    const filename = `recording-${timestamp}.webm`;
    const voiceRecordDir = join(process.cwd(), "public", "voice-record");
    const filepath = join(voiceRecordDir, filename);
    await writeFile(filepath, buffer);

    // Create a File object for Whisper API
    const file = new File([buffer], filename, { type: audioFile.type });

    // Transcribe using OpenAI Whisper
    console.log("Transcribing audio with Whisper...");
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "en", // Optional: specify language or let it auto-detect
      response_format: "text",
    });

    console.log("Transcription complete");

    return NextResponse.json({
      transcription: transcription,
      audioUrl: `/voice-record/${filename}`,
    });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
