import { LayoutType, LayoutContent } from "@/types";

// Parse scene script to populate layout content
export function parseScriptToLayout(
  script: string,
  layoutType: LayoutType,
  existingContent?: LayoutContent
): LayoutContent {
  // Preserve existing content if available
  if (existingContent && Object.keys(existingContent).length > 0) {
    return existingContent;
  }

  const sentences = script
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  switch (layoutType) {
    case "cover":
      return {
        title: sentences[0] || "Untitled Slide",
        subtitle: sentences.slice(1, 3).join(". ") || "Add your subtitle here",
      };

    case "imageLeft":
    case "imageRight":
      return {
        title: sentences[0] || "Untitled Slide",
        body: sentences.slice(1).join(". ") || "Add your content here",
        imageUrl: "",
        imageBleed: true, // Default to true
      };

    case "imageBullets":
      return {
        title: sentences[0] || "Untitled Slide",
        bulletPoints:
          sentences.slice(1).length > 0
            ? sentences.slice(1, 6)
            : ["Point 1", "Point 2", "Point 3"],
        imageUrl: "",
        imageBleed: true, // Default to true
      };

    case "fullImage":
      return {
        title: sentences[0] || "Untitled Slide",
        subtitle: sentences.slice(1, 2).join(". ") || "",
        imageUrl: "",
        imageBleed: true, // Default to true
      };

    case "twoColumn":
      const midpoint = Math.ceil(sentences.slice(1).length / 2);
      return {
        title: sentences[0] || "Untitled Slide",
        leftColumn: sentences.slice(1, midpoint + 1).join(". ") || "Left column content",
        rightColumn: sentences.slice(midpoint + 1).join(". ") || "Right column content",
      };

    case "titleBody":
      return {
        title: sentences[0] || "Untitled Slide",
        body: sentences.slice(1).join(". ") || "Add your content here",
      };

    case "blank":
      return {};

    case "quote":
      return {
        quote: sentences.join(". ") || "Enter your quote here",
        quoteAuthor: "Author Name",
        imageUrl: "",
        imageBleed: true,
      };

    case "steps2":
      return {
        title: sentences[0] || "Process Steps",
        steps: [
          { title: "Step 1", description: sentences[1] || "First step description" },
          { title: "Step 2", description: sentences[2] || "Second step description" },
        ],
      };

    case "steps3":
      return {
        title: sentences[0] || "Process Steps",
        steps: [
          { title: "Step 1", description: sentences[1] || "First step description" },
          { title: "Step 2", description: sentences[2] || "Second step description" },
          { title: "Step 3", description: sentences[3] || "Third step description" },
        ],
      };

    case "steps5":
      return {
        title: sentences[0] || "Process Steps",
        steps: [
          { title: "Step 1", description: sentences[1] || "First step" },
          { title: "Step 2", description: sentences[2] || "Second step" },
          { title: "Step 3", description: sentences[3] || "Third step" },
          { title: "Step 4", description: sentences[4] || "Fourth step" },
          { title: "Step 5", description: sentences[5] || "Fifth step" },
        ],
      };

    case "imageGrid2":
      return {
        title: sentences[0] || "Image Gallery",
        imageUrl: "",
        imageUrl2: "",
        imageBleed: true,
      };

    case "imageGrid4":
      return {
        title: sentences[0] || "Image Gallery",
        imageUrl: "",
        imageUrl2: "",
        imageUrl3: "",
        imageUrl4: "",
        imageBleed: true,
      };

    case "imageGrid6":
      return {
        title: sentences[0] || "Image Gallery",
        imageUrl: "",
        imageUrl2: "",
        imageUrl3: "",
        imageUrl4: "",
        imageUrl5: "",
        imageUrl6: "",
        imageBleed: true,
      };

    case "centeredImageMedium":
    case "centeredImageLarge":
      return {
        title: sentences[0] || "Untitled Slide",
        imageUrl: "",
        imageAlignment: "center",
        imageFit: "cover",
      };

    case "imageBulletsBleedLeft":
    case "imageBulletsBleedRight":
      return {
        title: sentences[0] || "Untitled Slide",
        bulletPoints:
          sentences.slice(1).length > 0
            ? sentences.slice(1, 6)
            : ["Point 1", "Point 2", "Point 3"],
        imageUrl: "",
        imageAlignment: "center",
        imageFit: "cover",
      };

    default:
      return {
        title: sentences[0] || "Untitled Slide",
      };
  }
}

// Get layout display name
export function getLayoutName(layoutType: LayoutType): string {
  const names: Record<LayoutType, string> = {
    cover: "Cover",
    imageLeft: "Image Left",
    imageRight: "Image Right",
    imageBullets: "Image with Bullets",
    fullImage: "Full Image",
    centeredImageMedium: "Centered Medium",
    centeredImageLarge: "Centered Large",
    twoColumn: "Two Column",
    titleBody: "Title & Body",
    blank: "Blank",
    centeredChart: "Centered Chart",
    comparison: "Comparison",
    quote: "Quote",
    steps2: "2 Steps",
    steps3: "3 Steps",
    steps5: "5 Steps",
    imageGrid2: "2 Images",
    imageGrid4: "4 Images",
    imageGrid6: "6 Images",
    imageBulletsBleedLeft: "Bullets Right Bleed",
    imageBulletsBleedRight: "Bullets Left Bleed",
  };
  return names[layoutType];
}

// Get layout description
export function getLayoutDescription(layoutType: LayoutType): string {
  const descriptions: Record<LayoutType, string> = {
    cover: "Centered title and subtitle",
    imageLeft: "Image on left, text on right",
    imageRight: "Text on left, image on right",
    imageBullets: "Image with bullet points",
    fullImage: "Full-width image with overlay text",
    centeredImageMedium: "Medium centered image with title",
    centeredImageLarge: "Large centered image with title",
    twoColumn: "Two columns of text",
    titleBody: "Large title with body text",
    blank: "Start from scratch",
    centeredChart: "Centered chart with title",
    comparison: "Side-by-side comparison",
    quote: "Large quote with author",
    steps2: "Two-step process",
    steps3: "Three-step process",
    steps5: "Five-step process",
    imageGrid2: "2-image grid layout",
    imageGrid4: "4-image grid layout",
    imageGrid6: "6-image grid layout",
    imageBulletsBleedLeft: "Full bleed image on left, title and bullets on right",
    imageBulletsBleedRight: "Title and bullets on left, full bleed image on right",
  };
  return descriptions[layoutType];
}

// Preserve content when switching layouts
export function preserveContentOnLayoutChange(
  currentContent: LayoutContent,
  newLayoutType: LayoutType
): LayoutContent {
  const preserved: LayoutContent = {};

  // Map common fields - only preserve if they have actual values (not undefined or empty string)
  if (currentContent.title !== undefined && currentContent.title !== null && currentContent.title !== "") {
    preserved.title = currentContent.title;
  }
  if (currentContent.subtitle !== undefined && currentContent.subtitle !== null && currentContent.subtitle !== "") {
    preserved.subtitle = currentContent.subtitle;
  }
  if (currentContent.body !== undefined && currentContent.body !== null && currentContent.body !== "") {
    preserved.body = currentContent.body;
  }
  if (currentContent.imageUrl !== undefined && currentContent.imageUrl !== null && currentContent.imageUrl !== "") {
    preserved.imageUrl = currentContent.imageUrl;
  }

  // Handle bullet points
  if (newLayoutType === "imageBullets" && currentContent.body && currentContent.body !== "") {
    preserved.bulletPoints = currentContent.body.split(". ").filter(Boolean);
  }
  if (currentContent.bulletPoints && currentContent.bulletPoints.length > 0) {
    preserved.bulletPoints = currentContent.bulletPoints;
  }

  // Handle two-column layout
  if (newLayoutType === "twoColumn") {
    if (currentContent.body && currentContent.body !== "") {
      const sentences = currentContent.body.split(". ").filter(Boolean);
      const midpoint = Math.ceil(sentences.length / 2);
      preserved.leftColumn = sentences.slice(0, midpoint).join(". ");
      preserved.rightColumn = sentences.slice(midpoint).join(". ");
    }
    if (currentContent.leftColumn !== undefined && currentContent.leftColumn !== null && currentContent.leftColumn !== "") {
      preserved.leftColumn = currentContent.leftColumn;
    }
    if (currentContent.rightColumn !== undefined && currentContent.rightColumn !== null && currentContent.rightColumn !== "") {
      preserved.rightColumn = currentContent.rightColumn;
    }
  }

  return preserved;
}
