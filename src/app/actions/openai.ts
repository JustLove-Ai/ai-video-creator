"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { openai } from "@/lib/openai";

/**
 * Generate image using gpt-image-1 (GPT-4o native image generation)
 * Returns base64 encoded image data suitable for Remotion
 */
export async function generateImage(prompt: string, sceneId?: string): Promise<{
  url: string;
  b64_json?: string;
}> {
  try {
    console.log('Generating image with gpt-image-1:', prompt.substring(0, 50) + '...');

    // gpt-image-1 always returns b64_json format automatically
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      n: 1,
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No image data received from API");
    }

    const imageData = response.data[0];
    const url = `data:image/png;base64,${imageData.b64_json}`;

    console.log('Image generated successfully with gpt-image-1');

    // Save to database if sceneId provided
    if (sceneId) {
      const scene = await prisma.scene.findUnique({ where: { id: sceneId } });

      await prisma.scene.update({
        where: { id: sceneId },
        data: {
          imageUrl: url,
          imagePrompt: prompt,
        },
      });

      // Save to media library (GeneratedAsset)
      if (scene) {
        await prisma.generatedAsset.create({
          data: {
            projectId: scene.projectId,
            sceneId,
            type: "image",
            url,
            prompt,
            model: "gpt-image-1",
            dimensions: { width: 1024, height: 1024 } as Prisma.InputJsonValue,
          },
        });
      }

      revalidatePath("/");
    }

    return {
      url,
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
    console.log('Generating speech with voice:', voice);

    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice,
      input: text,
      speed: 1.0,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const b64_json = buffer.toString("base64");
    const url = `data:audio/mp3;base64,${b64_json}`;

    console.log('Speech generated successfully');

    // Save to database if sceneId provided
    if (sceneId) {
      await prisma.scene.update({
        where: { id: sceneId },
        data: {
          audioUrl: url,
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
            url,
            model: "tts-1-hd",
            prompt: text.substring(0, 500),
          },
        });
      }

      revalidatePath("/");
    }

    return { url, b64_json };
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
    console.log('Generating script for topic:', topic);

    // Import constants
    const YOUTUBE_SCRIPT_PROMPT = `You are an expert presentation and video script writer who creates engaging, information-rich content.

Your task is to create a comprehensive, professional presentation with 10-15 detailed slides that deeply explore the topic.

## CONTENT QUALITY REQUIREMENTS:

### Rich, Detailed Content
- Each slide should contain substantial, valuable information
- Use 3-5 bullet points per slide when listing information
- Include specific examples, statistics, or concrete details
- Provide actionable insights, not just vague statements
- Make every slide educational and memorable

### Professional Structure
1. **Title Slide** - Compelling title + engaging subtitle
2. **Introduction** - Context, importance, and what viewers will learn (2-3 bullets)
3. **Core Content** - Break main topic into 5-8 detailed slides, each covering a specific aspect
4. **Practical Applications** - Real examples or use cases (bullets or comparisons)
5. **Key Takeaways** - Summary slide with main points
6. **Next Steps** - Clear call-to-action or further resources

## OUTPUT FORMAT:

Return valid JSON with a "slides" array. Each slide should have rich content:

{
  "slides": [
    {
      "section": "Introduction",
      "layout": "cover",
      "narration": "Natural, conversational voiceover script (2-3 sentences)",
      "title": "Main Slide Title",
      "subtitle": "Descriptive subtitle that adds context",
      "body": "Additional explanatory text when needed (1-2 sentences)",
      "bulletPoints": ["Detailed point one", "Detailed point two", "Detailed point three"]
    }
  ]
}

## LAYOUT GUIDELINES:

- **cover**: Title slides, section breaks
- **titleBody**: Explanations with paragraph text
- **imageBullets**: Lists of 3-5 detailed bullet points (primary layout for content)
- **imageLeft/imageRight**: Key concepts with supporting text
- **twoColumn**: Comparisons (before/after, pros/cons, etc.)

Now write a detailed, comprehensive script about: ${topic}`;

    const AI_GENERATION_SYSTEM_PROMPT = `You are a professional presentation content generator. Your output must be:

1. COMPREHENSIVE: 10-15 detailed slides minimum
2. RICH CONTENT: Each slide has 3-5 bullet points with specific, actionable information
3. PROFESSIONAL: Quality comparable to business presentations or educational content
4. VALID JSON ONLY: No markdown, no code blocks, no explanations - just pure JSON

Return format: {"slides": [{"section": "...", "layout": "...", "narration": "2-3 detailed sentences", "title": "...", "subtitle": "...", "body": "...", "bulletPoints": ["detailed point 1", "detailed point 2", "detailed point 3"]}, ...]}`;

    console.log('Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: AI_GENERATION_SYSTEM_PROMPT },
        { role: "user", content: YOUTUBE_SCRIPT_PROMPT },
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

// Progress tracking store (in-memory)
const beautifyProgress = new Map<string, { current: number; total: number; message: string }>();

/**
 * Get beautification progress for a project
 */
export async function getBeautifyProgress(projectId: string): Promise<{ current: number; total: number; message: string } | null> {
  return beautifyProgress.get(projectId) || null;
}

/**
 * Beautify all slides in a project
 * - Fix titles (remove "Scene 1" etc)
 * - Optimize content (not too wordy, not just copying narration)
 * - Generate images for ALL slides
 * - Choose better layouts that work with images
 * @param projectId - The project ID
 */
export async function beautifySlides(
  projectId: string
): Promise<void> {
  try {
    console.log('Starting slide beautification for project:', projectId);

    // Get all scenes
    const scenes = await prisma.scene.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
    });

    const total = scenes.length;

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const sceneNum = i + 1;

      // Update progress
      beautifyProgress.set(projectId, {
        current: sceneNum,
        total,
        message: `Beautifying slide ${sceneNum}/${total}...`
      });

      console.log(`Beautifying slide ${sceneNum}/${total}...`);

      // Step 1: Optimize slide content with AI
      const optimizedContent = await optimizeSlideContent(scene);

      // Step 2: Generate image based on content
      beautifyProgress.set(projectId, {
        current: sceneNum,
        total,
        message: `Generating image for slide ${sceneNum}/${total}...`
      });
      console.log(`Generating image for slide ${sceneNum}/${total}...`);
      const imagePrompt = generateImagePrompt(optimizedContent);
      const imageResult = await generateImage(imagePrompt);

      // Save the base64 image to file system
      const filename = `slide-${scene.id}-${Date.now()}.png`;

      // Save image directly using fs (server-side)
      const base64Data = imageResult.url.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const { writeFile, mkdir } = await import("fs/promises");
      const { join } = await import("path");
      const imagesDir = join(process.cwd(), "public", "images");

      // Ensure directory exists
      await mkdir(imagesDir, { recursive: true });

      const filepath = join(imagesDir, filename);
      await writeFile(filepath, buffer);

      const imageUrl = `/images/${filename}`;

      // Step 3: Update scene in database
      await prisma.scene.update({
        where: { id: scene.id },
        data: {
          layout: optimizedContent.layout,
          layoutContent: {
            title: optimizedContent.title,
            subtitle: optimizedContent.subtitle,
            body: optimizedContent.body,
            bulletPoints: optimizedContent.bulletPoints,
            imageUrl: imageUrl,
          } as Prisma.InputJsonValue,
          imageUrl: imageUrl,
          imagePrompt: imagePrompt,
        },
      });

      // Step 4: Save to media library (GeneratedAsset)
      await prisma.generatedAsset.create({
        data: {
          projectId,
          sceneId: scene.id,
          type: "image",
          url: imageUrl,
          prompt: imagePrompt,
          model: "gpt-image-1",
          dimensions: { width: 1024, height: 1024 } as Prisma.InputJsonValue,
        },
      });

      console.log(`Slide ${sceneNum}/${total} beautified successfully`);
    }

    // Final progress update
    beautifyProgress.set(projectId, {
      current: total,
      total,
      message: 'All slides beautified!'
    });

    console.log('All slides beautified!');

    // Clean up progress after 5 seconds
    setTimeout(() => {
      beautifyProgress.delete(projectId);
    }, 5000);

    revalidatePath("/");
  } catch (error) {
    console.error("Error beautifying slides:", error);
    beautifyProgress.delete(projectId);
    throw new Error(error instanceof Error ? error.message : "Failed to beautify slides");
  }
}

/**
 * Optimize slide content using AI
 */
async function optimizeSlideContent(scene: any): Promise<{
  title: string;
  subtitle?: string;
  body?: string;
  bulletPoints?: string[];
  layout: string;
}> {
  const currentContent = scene.layoutContent as any;
  const narration = scene.content;

  const prompt = `You are a professional slide designer. Optimize this slide for maximum impact.

CURRENT SLIDE:
Title: ${currentContent?.title || 'Scene ' + scene.order}
Narration: ${narration}
Current Content: ${JSON.stringify(currentContent)}

YOUR TASK:
1. Create an ENGAGING, descriptive title (NOT "Scene 1", "Introduction", etc.)
2. Keep content CONCISE - don't just copy the narration word-for-word
3. Use bullet points for key takeaways (3-5 points max)
4. Choose the BEST layout for this content

LAYOUT OPTIONS:
- cover: Opening/closing slides (title + subtitle only)
- imageLeft: Image on left (40%), text on right (60%) - good for concepts
- imageRight: Image on right (40%), text on left (60%) - good for processes
- imageBullets: Image top, bullet points below - best for listicles
- titleBody: Simple title + paragraph - for explanations

CONTENT RULES:
✅ DO: Create punchy, descriptive titles like "3 Steps to Launch Your Business"
✅ DO: Extract KEY points from narration, not verbatim text
✅ DO: Keep body text under 100 characters
✅ DO: Choose layouts that highlight images

❌ DON'T: Use generic titles like "Scene 1", "Introduction", "Next Steps"
❌ DON'T: Copy entire narration to body text
❌ DON'T: Make slides too wordy

Return JSON ONLY:
{
  "title": "Engaging, specific title",
  "subtitle": "Optional subtitle for context",
  "body": "Brief summary (if needed)",
  "bulletPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "layout": "imageLeft|imageRight|imageBullets|titleBody|cover"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a professional slide designer who creates visually stunning, concise slides. Return ONLY valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No content generated");

  return JSON.parse(content);
}

/**
 * Generate a photorealistic image prompt based on slide content
 * The image should convey the MEANING/CONCEPT, not literally depict the text
 */
function generateImagePrompt(content: {
  title: string;
  subtitle?: string;
  body?: string;
  bulletPoints?: string[];
}): string {
  // Extract the core concept/theme from the content
  const parts = [content.title];
  if (content.subtitle) parts.push(content.subtitle);
  if (content.body) parts.push(content.body);

  const context = parts.join(' ');

  // Create a photorealistic prompt that captures the essence/feeling
  // Using gpt-image-1's enhanced photorealism capabilities
  return `Photorealistic, high-resolution image that conceptually represents: ${context}.
Professional photography, sharp focus, natural lighting, authentic real-world scene.
Convey the emotion and meaning rather than literal text.
Cinematic composition, modern aesthetic, 4K quality, vibrant but natural colors.`;
}
