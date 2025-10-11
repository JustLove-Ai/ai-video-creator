"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { openai } from "@/lib/openai";

/**
 * Generate image using DALL-E via API endpoint
 * Returns base64 encoded image data suitable for Remotion
 */
export async function generateImage(prompt: string, sceneId?: string): Promise<{
  url: string;
  b64_json?: string;
}> {
  try {
    // Server-side: construct URL from env or use relative path via localhost
    // The actual port is auto-detected by Next.js
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                    process.env.NEXTAUTH_URL ||
                    `http://localhost:${process.env.PORT || '3000'}`;
    const apiUrl = typeof window === 'undefined' ? `${baseUrl}/api/images` : '/api/images';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to generate image');
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
    // Server-side: construct URL from env or use relative path via localhost
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                    process.env.NEXTAUTH_URL ||
                    `http://localhost:${process.env.PORT || '3000'}`;
    const apiUrl = typeof window === 'undefined' ? `${baseUrl}/api/voices` : '/api/voices';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to generate speech');
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
    // Server-side: construct URL from env or use relative path via localhost
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                    process.env.NEXTAUTH_URL ||
                    `http://localhost:${process.env.PORT || '3000'}`;
    const apiUrl = typeof window === 'undefined' ? `${baseUrl}/api/generate-script` : '/api/generate-script';

    console.log('Fetching script from:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Script generation failed:', errorData);
      throw new Error(errorData.error || 'Failed to generate script');
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
    console.error("Error in generateYouTubeScript:", error);
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

/**
 * Parse script in EXACT mode - preserve user's text, just split into logical scenes
 */
function parseScriptExact(script: string): unknown[] {
  // Split by double line breaks (paragraphs) or section headers
  const sections = script
    .split(/\n\s*\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return sections.map((section, index) => {
    // Try to detect if first line is a header/title
    const lines = section.split('\n').map(l => l.trim());
    const firstLine = lines[0];
    const isTitle = firstLine.length < 100 && lines.length > 1;

    if (isTitle) {
      const title = firstLine;
      const restLines = lines.slice(1);

      // Check if body contains bullet points
      const hasBullets = restLines.some(line => line.match(/^[-•]\s+/));

      if (hasBullets) {
        const bulletPoints = restLines
          .filter(line => line.match(/^[-•]\s+/))
          .map(line => line.replace(/^[-•]\s+/, '').trim());

        const bodyText = restLines
          .filter(line => !line.match(/^[-•]\s+/))
          .join(' ')
          .trim();

        return {
          section: `Scene ${index + 1}`,
          layout: "imageBullets",
          narration: section,
          title,
          body: bodyText || undefined,
          bulletPoints: bulletPoints.length > 0 ? bulletPoints : undefined,
        };
      }

      const body = restLines.join(' ');
      return {
        section: `Scene ${index + 1}`,
        layout: index === 0 ? "cover" : "titleBody",
        narration: section,
        title,
        body,
      };
    }

    // No clear title, treat as body text
    return {
      section: `Scene ${index + 1}`,
      layout: "titleBody",
      narration: section,
      title: `Scene ${index + 1}`,
      body: section,
    };
  });
}

/**
 * Parse script in OUTLINE mode - use AI to enhance and structure
 */
async function parseScriptWithAI(script: string): Promise<unknown[]> {
  const AI_GENERATION_SYSTEM_PROMPT = "You are a professional content generator that creates high-quality presentation slides. Return valid JSON only.";

  const prompt = `You are a professional presentation content generator. Take the following user script/outline and transform it into a comprehensive, well-structured presentation with detailed slides.

USER'S SCRIPT:
${script}

YOUR TASK:
1. Analyze the user's content and identify key topics, sections, and flow
2. Create 10-15 professional slides that expand on their ideas
3. Use the user's core message but enhance with:
   - Better structure and organization
   - More detailed bullet points (3-5 per slide when listing)
   - Professional titles and subtitles
   - Natural narration script (2-3 sentences per slide)
   - Appropriate layouts for each type of content

LAYOUT GUIDELINES:
- **cover**: Opening slide or major section breaks
- **titleBody**: Explanations with paragraph text
- **imageBullets**: Lists of 3-5 detailed bullet points (primary layout for content)
- **imageLeft/imageRight**: Key concepts with supporting text
- **twoColumn**: Comparisons (before/after, pros/cons, etc.)

CONTENT QUALITY:
- Each slide should have substantial, valuable information
- Include specific examples and concrete details
- Provide actionable insights, not vague statements
- Use natural, conversational narration
- Maintain the user's original intent and message

Return valid JSON with this exact format:
{
  "slides": [
    {
      "section": "Introduction",
      "layout": "cover",
      "narration": "Natural voiceover script (2-3 sentences)",
      "title": "Main Slide Title",
      "subtitle": "Descriptive subtitle",
      "body": "Additional text (optional)",
      "bulletPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanations - just pure JSON.`;

  console.log('Calling OpenAI API for outline mode...');
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: AI_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });
  console.log('OpenAI API call successful');

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content generated");
  }

  let scriptData;
  try {
    scriptData = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }

  // Handle various response formats from OpenAI
  let slides: unknown[] = [];

  if (Array.isArray(scriptData)) {
    slides = scriptData;
  } else {
    const data = scriptData as Record<string, unknown>;
    slides = (data.slides as unknown[])
      || (data.script as unknown[])
      || (data.response as unknown[])
      || (data.scenes as unknown[])
      || [];

    if (slides.length === 0 && (data.section || data.narration || data.layout)) {
      slides = [scriptData];
    }
  }

  return slides;
}

/**
 * Import user script and convert to scenes
 * @param script - The user's script text
 * @param mode - "exact" (preserve text, just split) or "outline" (AI enhance)
 * @param projectId - The project to add scenes to
 */
export async function importUserScript(
  script: string,
  mode: "exact" | "outline",
  projectId: string
): Promise<unknown[]> {
  try {
    console.log('Importing script with mode:', mode);

    // Parse script based on mode (no HTTP call needed)
    let slides: unknown[] = [];
    if (mode === "exact") {
      slides = parseScriptExact(script);
    } else {
      slides = await parseScriptWithAI(script);
    }

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
    console.error("Error in importUserScript:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to import script");
  }
}
