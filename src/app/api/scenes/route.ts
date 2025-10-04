import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const { sceneId, audioUrl, duration } = await request.json();

    if (!sceneId) {
      return NextResponse.json({ error: "Scene ID is required" }, { status: 400 });
    }

    const scene = await prisma.scene.update({
      where: { id: sceneId },
      data: {
        ...(audioUrl && { audioUrl }),
        ...(duration && { duration }),
      },
    });

    return NextResponse.json({ scene });
  } catch (error) {
    console.error("Error updating scene:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update scene" },
      { status: 500 }
    );
  }
}
