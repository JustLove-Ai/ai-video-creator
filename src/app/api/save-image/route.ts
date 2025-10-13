import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const { base64Image, filename } = await request.json();

    if (!base64Image || !filename) {
      return NextResponse.json(
        { error: "Base64 image and filename are required" },
        { status: 400 }
      );
    }

    // Extract the base64 data (remove data:image/png;base64, prefix)
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Create images directory if it doesn't exist
    const imagesDir = join(process.cwd(), "public", "images");
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true });
    }

    // Save the file
    const filepath = join(imagesDir, filename);
    await writeFile(filepath, buffer);

    // Return the public URL
    const publicUrl = `/images/${filename}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Error saving image:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save image" },
      { status: 500 }
    );
  }
}
