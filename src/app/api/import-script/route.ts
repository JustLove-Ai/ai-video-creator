import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { AI_GENERATION_SYSTEM_PROMPT } from "@/lib/constants";

// Increase timeout for long-running AI generation (10 minutes)
export const maxDuration = 600;

export async function POST(request: NextRequest) {
  try {
    const { script, mode } = await request.json();

    if (!script || !mode) {
      return NextResponse.json(
        { error: "Script and mode are required" },
        { status: 400 }
      );
    }

    console.log(`Importing script with mode: ${mode}`);

    let slides: unknown[] = [];

    if (mode === "exact") {
      // EXACT MODE: Split script by paragraphs/sections without AI enhancement
      slides = parseScriptExact(script);
    } else {
      // OUTLINE MODE: Use AI to enhance and structure the script
      slides = await parseScriptWithAI(script);
    }

    return NextResponse.json({ slides });
  } catch (error) {
    console.error("Error importing script:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to import script";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
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
