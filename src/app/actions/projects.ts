"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { VideoProject, Scene, Prisma } from "@prisma/client";

export type VideoProjectWithScenes = VideoProject & {
  scenes: Scene[];
};

/**
 * Create a new video project
 */
export async function createProject(title: string = "Untitled Video"): Promise<VideoProjectWithScenes> {
  const project = await prisma.videoProject.create({
    data: {
      title,
      theme: {
        accent: "#FF7900",
        background: { type: "solid", color: "#ffffff" },
        titleFont: "Inter",
        bodyFont: "Inter",
      },
      scenes: {
        create: {
          order: 0,
          content: "Welcome to our presentation! Today we'll explore the amazing world of AI-generated content.",
          duration: 5,
          layout: "cover",
          layoutContent: {
            title: "Welcome to our presentation!",
            subtitle: "Today we'll explore the amazing world of AI-generated content.",
          },
          annotations: [],
        },
      },
    },
    include: {
      scenes: {
        orderBy: { order: "asc" },
      },
    },
  });

  revalidatePath("/");
  return project as VideoProjectWithScenes;
}

/**
 * Get a video project by ID
 */
export async function getProject(projectId: string): Promise<VideoProjectWithScenes | null> {
  return await prisma.videoProject.findUnique({
    where: { id: projectId },
    include: {
      scenes: {
        orderBy: { order: "asc" },
      },
    },
  }) as VideoProjectWithScenes | null;
}

/**
 * Get all video projects
 */
export async function getProjects(): Promise<VideoProject[]> {
  return await prisma.videoProject.findMany({
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Update a video project
 */
export async function updateProject(
  projectId: string,
  data: { title?: string; aspectRatio?: string; theme?: Prisma.InputJsonValue }
): Promise<VideoProjectWithScenes> {
  const project = await prisma.videoProject.update({
    where: { id: projectId },
    data,
    include: {
      scenes: {
        orderBy: { order: "asc" },
      },
    },
  });

  revalidatePath("/");
  return project as VideoProjectWithScenes;
}

/**
 * Delete a video project
 */
export async function deleteProject(projectId: string): Promise<void> {
  await prisma.videoProject.delete({
    where: { id: projectId },
  });

  revalidatePath("/");
}
