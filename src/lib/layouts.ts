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
      };

    case "imageBullets":
      return {
        title: sentences[0] || "Untitled Slide",
        bulletPoints:
          sentences.slice(1).length > 0
            ? sentences.slice(1, 6)
            : ["Point 1", "Point 2", "Point 3"],
        imageUrl: "",
      };

    case "fullImage":
      return {
        title: sentences[0] || "Untitled Slide",
        subtitle: sentences.slice(1, 2).join(". ") || "",
        imageUrl: "",
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
    twoColumn: "Two Column",
    titleBody: "Title & Body",
    blank: "Blank",
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
    twoColumn: "Two columns of text",
    titleBody: "Large title with body text",
    blank: "Start from scratch",
  };
  return descriptions[layoutType];
}

// Preserve content when switching layouts
export function preserveContentOnLayoutChange(
  currentContent: LayoutContent,
  newLayoutType: LayoutType
): LayoutContent {
  const preserved: LayoutContent = {};

  // Map common fields
  if (currentContent.title) preserved.title = currentContent.title;
  if (currentContent.subtitle) preserved.subtitle = currentContent.subtitle;
  if (currentContent.body) preserved.body = currentContent.body;
  if (currentContent.imageUrl) preserved.imageUrl = currentContent.imageUrl;

  // Handle bullet points
  if (newLayoutType === "imageBullets" && currentContent.body) {
    preserved.bulletPoints = currentContent.body.split(". ").filter(Boolean);
  }
  if (currentContent.bulletPoints) {
    preserved.bulletPoints = currentContent.bulletPoints;
  }

  // Handle two-column layout
  if (newLayoutType === "twoColumn") {
    if (currentContent.body) {
      const sentences = currentContent.body.split(". ").filter(Boolean);
      const midpoint = Math.ceil(sentences.length / 2);
      preserved.leftColumn = sentences.slice(0, midpoint).join(". ");
      preserved.rightColumn = sentences.slice(midpoint).join(". ");
    }
    if (currentContent.leftColumn) preserved.leftColumn = currentContent.leftColumn;
    if (currentContent.rightColumn) preserved.rightColumn = currentContent.rightColumn;
  }

  return preserved;
}
