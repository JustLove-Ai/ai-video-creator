import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { YOUTUBE_SCRIPT_PROMPT, AI_GENERATION_SYSTEM_PROMPT } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

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
      // Direct array response
      slides = scriptData;
    } else {
      const data = scriptData as Record<string, unknown>;
      // Check for common property names
      slides = (data.slides as unknown[])
        || (data.script as unknown[])
        || (data.response as unknown[])
        || (data.scenes as unknown[])
        || [];

      // If no array found but we have slide-like properties, treat the whole object as a single slide
      if (slides.length === 0 && (data.section || data.narration || data.layout)) {
        slides = [scriptData];
      }
    }

    return NextResponse.json({ slides });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate script" },
      { status: 500 }
    );
  }
}
