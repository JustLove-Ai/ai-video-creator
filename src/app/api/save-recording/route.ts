import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioBlob = formData.get("audio") as Blob;
    const sceneId = formData.get("sceneId") as string;

    if (!audioBlob || !sceneId) {
      return NextResponse.json(
        { error: "Missing audio or sceneId" },
        { status: 400 }
      );
    }

    // Convert blob to buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure audio directory exists
    const audioDir = join(process.cwd(), "public", "audio");
    if (!existsSync(audioDir)) {
      await mkdir(audioDir, { recursive: true });
    }

    // Save file
    const filename = `scene-${sceneId}-recorded.webm`;
    const filepath = join(audioDir, filename);
    await writeFile(filepath, buffer);

    // Return public URL
    const url = `/audio/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error saving recording:", error);
    return NextResponse.json(
      { error: "Failed to save recording" },
      { status: 500 }
    );
  }
}
