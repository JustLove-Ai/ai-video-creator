import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const { dataUrl, filename, type } = await request.json();

    console.log('💾 Saving asset:', { filename, type, dataUrlLength: dataUrl?.length });

    if (!dataUrl || !filename || !type) {
      console.error('❌ Missing required fields:', { dataUrl: !!dataUrl, filename: !!filename, type: !!type });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Determine the directory based on type
    const dir = type === 'audio' ? 'audio' : 'images';
    const publicDir = join(process.cwd(), 'public', dir);

    // Create directory if it doesn't exist
    if (!existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true });
    }

    // Extract base64 data from data URL
    // Updated regex to support both "audio/mpeg" and "audio/mp3" formats
    const matches = dataUrl.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      console.error('❌ Invalid data URL format. DataUrl starts with:', dataUrl.substring(0, 50));
      return NextResponse.json(
        { error: "Invalid data URL format" },
        { status: 400 }
      );
    }

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Save file to public folder
    const filePath = join(publicDir, filename);
    await writeFile(filePath, buffer);

    // Return the public URL
    const url = `/${dir}/${filename}`;

    console.log('✅ Asset saved successfully:', url);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error saving asset:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save asset" },
      { status: 500 }
    );
  }
}
