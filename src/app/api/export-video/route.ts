import "server-only";

import { NextRequest, NextResponse } from "next/server";
import type { Scene, Theme } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { scenes, theme, videoSettings, audioSettings } = await request.json();

    if (!scenes || !theme) {
      return NextResponse.json(
        { error: "Scenes and theme are required" },
        { status: 400 }
      );
    }

    console.log("Starting video export...");

    // Dynamically import server-only packages
    const { bundle } = await import("@remotion/bundler");
    const { renderMedia, getCompositions } = await import("@remotion/renderer");
    const { mkdir } = await import("fs/promises");
    const path = await import("path");

    // Calculate total duration in frames
    const FPS = 30;
    const totalDurationInFrames = scenes.reduce((total: number, scene: Scene) => {
      return total + Math.round(scene.duration * FPS);
    }, 0);

    // 1. Create output directory in public folder
    const outputDir = path.join(process.cwd(), "public", "exports");
    await mkdir(outputDir, { recursive: true });
    const timestamp = Date.now();
    const outputPath = path.join(outputDir, `video-${timestamp}.mp4`);

    console.log("Output path:", outputPath);

    // 2. Bundle Remotion composition
    console.log("Bundling Remotion composition...");
    const bundled = await bundle({
      entryPoint: path.join(process.cwd(), "src/remotion/index.ts"),
      webpackOverride: (config) => config,
    });

    console.log("Bundled at:", bundled);

    // 3. Get all compositions
    const compositions = await getCompositions(bundled, {
      inputProps: {
        scenes,
        theme,
        fps: FPS,
        videoSettings: videoSettings || {
          captions: {
            enabled: false,
            style: "full-text",
            position: "bottom",
            maxLines: 2,
            highlightColor: "#ff7900",
          },
          transitionType: "none",
          transitionDirection: "from-right",
          slideAnimations: false,
          animationStyle: "none",
        },
      },
    });

    const composition = compositions.find((c) => c.id === "VideoComposition");

    if (!composition) {
      throw new Error("VideoComposition not found");
    }

    console.log("Found composition:", composition.id);

    // 4. Render video
    console.log("Rendering video...");
    await renderMedia({
      composition: {
        ...composition,
        durationInFrames: totalDurationInFrames,
      },
      serveUrl: bundled,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: {
        scenes,
        theme,
        fps: FPS,
        videoSettings: videoSettings || {
          captions: {
            enabled: false,
            style: "full-text",
            position: "bottom",
            maxLines: 2,
            highlightColor: "#ff7900",
          },
          transitionType: "none",
          transitionDirection: "from-right",
          slideAnimations: false,
          animationStyle: "none",
        },
      },
    });

    console.log("Video rendered successfully!");

    // 5. Return the video file URL
    const videoUrl = `/exports/video-${timestamp}.mp4`;

    return NextResponse.json({
      success: true,
      videoUrl,
      duration: totalDurationInFrames / FPS,
      sceneCount: scenes.length,
    });

  } catch (error) {
    console.error("Export video error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export video" },
      { status: 500 }
    );
  }
}
