"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

/**
 * Generate image using DALL-E via API endpoint
 * Returns base64 encoded image data suitable for Remotion
 */
export async function generateImage(prompt: string, sceneId?: string): Promise<{
  url: string;
  b64_json?: string;
}> {
  try {
    const baseUrl = typeof window === 'undefined'
      ? process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'
      : '';
    const response = await fetch(`${baseUrl}/api/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const data = await response.json();

    // Save to database if sceneId provided
    if (sceneId) {
      await prisma.scene.update({
        where: { id: sceneId },
        data: {
          imageUrl: data.url,
          imagePrompt: prompt,
        },
      });
      revalidatePath("/");
    }

    return {
      url: data.url,
      b64_json: data.b64_json,
    };
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate image");
  }
}

/**
 * Generate speech using OpenAI TTS via API endpoint
 * Returns base64 encoded audio data suitable for Remotion
 */
export async function generateSpeech(
  text: string,
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "alloy",
  sceneId?: string
): Promise<{
  url: string;
  b64_json: string;
}> {
  try {
    const baseUrl = typeof window === 'undefined'
      ? process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'
      : '';
    const response = await fetch(`${baseUrl}/api/voices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    const data = await response.json();

    // Save to database if sceneId provided
    if (sceneId) {
      await prisma.scene.update({
        where: { id: sceneId },
        data: {
          audioUrl: data.url,
          voiceId: voice,
        },
      });

      // Save asset reference
      const scene = await prisma.scene.findUnique({ where: { id: sceneId } });
      if (scene) {
        await prisma.generatedAsset.create({
          data: {
            projectId: scene.projectId,
            sceneId,
            type: "audio",
            url: data.url,
            model: "tts-1-hd",
            prompt: text.substring(0, 500),
          },
        });
      }

      revalidatePath("/");
    }

    return { url: data.url, b64_json: data.b64_json };
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate speech");
  }
}

/**
 * Generate YouTube script using GPT-4
 */
export async function generateYouTubeScript(topic: string, projectId: string): Promise<unknown[]> {
  try {
    const baseUrl = typeof window === 'undefined'
      ? process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'
      : '';

    const response = await fetch(`${baseUrl}/api/generate-script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate script');
    }

    const data = await response.json();
    const slides = data.slides || [];

    // Create scenes in database
    const scenes = await Promise.all(
      (slides as Array<Record<string, unknown>>).map(async (slide, index: number) => {
        return await prisma.scene.create({
          data: {
            projectId,
            order: index,
            content: (slide.narration as string) || "",
            duration: 5,
            layout: (slide.layout as string) || "titleBody",
            layoutContent: slide as Prisma.InputJsonValue,
            annotations: [],
          },
        });
      })
    );

    revalidatePath("/");
    return scenes;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to generate script");
  }
}

/**
 * Generate scene content with AI
 */
export async function generateSceneContent(
  prompt: string,
  sceneId: string
): Promise<{
  narration: string;
  title: string;
  body: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates engaging scene content for video presentations. Return a JSON object with 'narration' (the voiceover script), 'title' (a catchy title), and 'body' (supporting text).",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content generated");

    const result = JSON.parse(content);

    // Update scene in database
    await prisma.scene.update({
      where: { id: sceneId },
      data: {
        content: result.narration,
        layoutContent: {
          title: result.title,
          body: result.body,
        },
      },
    });

    revalidatePath("/");
    return result;
  } catch (error) {
    console.error("Error generating scene content:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate scene content");
  }
}

/**
 * Batch generate audio for all scenes in a project
 */
export async function generateProjectAudio(
  projectId: string,
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "alloy"
): Promise<void> {
  const scenes = await prisma.scene.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
  });

  for (const scene of scenes) {
    if (scene.content && !scene.audioUrl) {
      await generateSpeech(scene.content, voice, scene.id);
    }
  }

  revalidatePath("/");
}
