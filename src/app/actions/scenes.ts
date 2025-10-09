"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Scene, Prisma } from "@prisma/client";

/**
 * Create a new scene
 */
export async function createScene(
  projectId: string,
  data: {
    content: string;
    layout: string;
    layoutContent: Prisma.InputJsonValue;
    duration?: number;
  }
): Promise<Scene> {
  // Get the highest order number
  const lastScene = await prisma.scene.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
  });

  const order = (lastScene?.order ?? -1) + 1;

  const scene = await prisma.scene.create({
    data: {
      projectId,
      order,
      content: data.content,
      layout: data.layout,
      layoutContent: data.layoutContent,
      duration: data.duration ?? 5,
      annotations: [],
    },
  });

  revalidatePath("/");
  return scene;
}

/**
 * Update a scene
 */
export async function updateScene(
  sceneId: string,
  data: {
    content?: string;
    duration?: number;
    layout?: string;
    layoutContent?: Prisma.InputJsonValue;
    imageUrl?: string;
    imagePrompt?: string;
    audioUrl?: string;
    recordedAudioUrl?: string | null;
    voiceId?: string;
    annotations?: Prisma.InputJsonValue;
    themeOverride?: Prisma.InputJsonValue;
  }
): Promise<Scene> {
  const scene = await prisma.scene.update({
    where: { id: sceneId },
    data,
  });

  revalidatePath("/");
  return scene;
}

/**
 * Delete a scene
 */
export async function deleteScene(sceneId: string): Promise<void> {
  const scene = await prisma.scene.findUnique({
    where: { id: sceneId },
  });

  if (!scene) throw new Error("Scene not found");

  await prisma.scene.delete({
    where: { id: sceneId },
  });

  // Reorder remaining scenes
  await prisma.scene.updateMany({
    where: {
      projectId: scene.projectId,
      order: { gt: scene.order },
    },
    data: {
      order: { decrement: 1 },
    },
  });

  revalidatePath("/");
}

/**
 * Reorder scenes
 */
export async function reorderScenes(
  projectId: string,
  sceneIds: string[]
): Promise<void> {
  const updates = sceneIds.map((sceneId, index) =>
    prisma.scene.update({
      where: { id: sceneId },
      data: { order: index },
    })
  );

  await prisma.$transaction(updates);
  revalidatePath("/");
}

/**
 * Duplicate a scene
 */
export async function duplicateScene(sceneId: string): Promise<Scene> {
  const originalScene = await prisma.scene.findUnique({
    where: { id: sceneId },
  });

  if (!originalScene) throw new Error("Scene not found");

  // Get the highest order number
  const lastScene = await prisma.scene.findFirst({
    where: { projectId: originalScene.projectId },
    orderBy: { order: "desc" },
  });

  const order = (lastScene?.order ?? -1) + 1;

  const newScene = await prisma.scene.create({
    data: {
      projectId: originalScene.projectId,
      order,
      content: originalScene.content,
      duration: originalScene.duration,
      layout: originalScene.layout,
      layoutContent: originalScene.layoutContent as Prisma.InputJsonValue,
      imageUrl: originalScene.imageUrl,
      imagePrompt: originalScene.imagePrompt,
      audioUrl: originalScene.audioUrl,
      voiceId: originalScene.voiceId,
      annotations: originalScene.annotations as Prisma.InputJsonValue | undefined,
      themeOverride: originalScene.themeOverride as Prisma.InputJsonValue | undefined,
    },
  });

  revalidatePath("/");
  return newScene;
}

/**
 * Delete all scenes for a project
 */
export async function deleteAllScenes(projectId: string): Promise<void> {
  await prisma.scene.deleteMany({
    where: { projectId },
  });

  revalidatePath("/");
}
