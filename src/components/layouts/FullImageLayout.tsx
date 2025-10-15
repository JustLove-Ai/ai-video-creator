"use client";

import { Theme, LayoutContent, AnimationConfig } from "@/types";
import { EditableText } from "@/components/canvas/EditableText";
import { EditableMediaSlot } from "@/components/canvas/EditableMediaSlot";
import { getElementAnimation } from "@/lib/animationHelpers";

interface FullImageLayoutProps {
  content: LayoutContent;
  theme: Theme;
  onContentChange: (content: LayoutContent) => void;
  onImageReplace: () => void;
  onChartAdd: () => void;
  animationConfig?: AnimationConfig;
  onAnimationPanelOpen?: (element: keyof AnimationConfig) => void;
}

export function FullImageLayout({
  content,
  theme,
  onContentChange,
  onImageReplace,
  onChartAdd,
  animationConfig,
  onAnimationPanelOpen,
}: FullImageLayoutProps) {
  const titleAnimation = getElementAnimation(animationConfig, "title");
  const subtitleAnimation = getElementAnimation(animationConfig, "subtitle");
  const imageAnimation = getElementAnimation(animationConfig, "image");
  return (
    <div className="w-full h-full relative">
      {/* Full Background Image/Chart */}
      <EditableMediaSlot
        imageUrl={content.imageUrl}
        chartData={content.chartData}
        onImageReplace={onImageReplace}
        onChartAdd={onChartAdd}
        className="absolute inset-0 w-full h-full"
        bleed={true}
        animation={imageAnimation}
        onElementClick={() => onAnimationPanelOpen?.("image")}
      />

      {/* Text Overlay with gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col items-center justify-end"
        style={{ padding: `${theme.spacing.padding * 1.5}px` }}
      >
        {content.showTitle !== false && (
          <EditableText
            value={content.title || ""}
            onChange={(title) => onContentChange({ ...content, title })}
            placeholder="Enter title"
            className="max-w-4xl"
            style={{
              fontFamily: theme.typography.titleFont,
              fontSize: `${theme.typography.titleSize * 1.2}px`,
              fontWeight: theme.typography.titleWeight,
              color: "#ffffff",
              lineHeight: 1.2,
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
            align="center"
            animation={titleAnimation}
            onElementClick={() => onAnimationPanelOpen?.("title")}
          />
        )}
        {content.showTitle !== false && content.showSubtitle !== false && (
          <div style={{ height: `${theme.spacing.gap}px` }} />
        )}
        {content.showSubtitle !== false && (
          <EditableText
            value={content.subtitle || ""}
            onChange={(subtitle) => onContentChange({ ...content, subtitle })}
            placeholder="Enter subtitle"
            className="max-w-3xl"
            style={{
              fontFamily: theme.typography.bodyFont,
              fontSize: `${theme.typography.bodySize * 1.2}px`,
              fontWeight: theme.typography.bodyWeight,
              color: "#e5e7eb",
              lineHeight: 1.5,
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
            align="center"
            multiline
            animation={subtitleAnimation}
            onElementClick={() => onAnimationPanelOpen?.("subtitle")}
          />
        )}
      </div>
    </div>
  );
}
