import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioBlob = formData.get("audio") as Blob;
    const sceneId = formData.get("sceneId") as string;
    const projectId = formData.get("projectId") as string;

    if (!audioBlob || !sceneId || !projectId) {
      return NextResponse.json(
        { error: "Missing audio, sceneId, or projectId" },
        { status: 400 }
      );
    }

    // Convert blob to buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure project-specific recordings directory exists
    const recordingsDir = join(process.cwd(), "public", "recordings", projectId);
    if (!existsSync(recordingsDir)) {
      await mkdir(recordingsDir, { recursive: true });
    }

    // Save file with timestamp to avoid conflicts
    const timestamp = Date.now();
    const filename = `scene-${sceneId}-${timestamp}.webm`;
    const filepath = join(recordingsDir, filename);
    await writeFile(filepath, buffer);

    // Return public URL
    const url = `/recordings/${projectId}/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error saving recording:", error);
    return NextResponse.json(
      { error: "Failed to save recording" },
      { status: 500 }
    );
  }
}
