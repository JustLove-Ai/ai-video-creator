"use server";

import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { YOUTUBE_SCRIPT_PROMPT, AI_GENERATION_SYSTEM_PROMPT } from "@/lib/constants";
import { Prisma } from "@prisma/client";

/**
 * Generate image using gpt-image-1 model
 * Returns base64 encoded image data suitable for Remotion
 */
export async function generateImage(prompt: string, sceneId?: string): Promise<{
  url: string;
  b64_json?: string;
}> {
  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json", // Better for Remotion
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No image data received from API");
    }

    const imageData = response.data[0];

    // Save to database if sceneId provided
    if (sceneId) {
      await prisma.scene.update({
        where: { id: sceneId },
        data: {
          imageUrl: `data:image/png;base64,${imageData.b64_json}`,
          imagePrompt: prompt,
        },
      });
      revalidatePath("/");
    }

    return {
      url: `data:image/png;base64,${imageData.b64_json}`,
      b64_json: imageData.b64_json,
    };
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate image");
  }
}

/**
 * Generate speech using OpenAI TTS
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
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd", // High quality model
      voice,
      input: text,
      response_format: "mp3",
    });

    // Convert response to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    const b64_json = buffer.toString("base64");
    const audioUrl = `data:audio/mp3;base64,${b64_json}`;

    // Save to database if sceneId provided
    if (sceneId) {
      await prisma.scene.update({
        where: { id: sceneId },
        data: {
          audioUrl,
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
            url: audioUrl,
            model: "tts-1-hd",
            prompt: text.substring(0, 500),
          },
        });
      }

      revalidatePath("/");
    }

    return { url: audioUrl, b64_json };
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
    const prompt = YOUTUBE_SCRIPT_PROMPT.replace("{topic}", topic);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: AI_GENERATION_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content generated");

    let scriptData;
    try {
      scriptData = JSON.parse(content);
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    // Handle both array and object with slides property
    const slides = Array.isArray(scriptData) ? scriptData : (scriptData as Record<string, unknown>).slides || [];

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
    console.error("Error generating YouTube script:", error);
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
