"use client";

import { Theme, LayoutContent, AnimationConfig } from "@/types";
import { RichTextEditor } from "@/components/canvas/RichTextEditor";
import { getBackgroundStyle } from "@/lib/themes";
import { getElementAnimation } from "@/lib/animationHelpers";

interface CoverLayoutProps {
  content: LayoutContent;
  theme: Theme;
  onContentChange: (content: LayoutContent) => void;
  animationConfig?: AnimationConfig;
  onAnimationPanelOpen?: (element: keyof AnimationConfig) => void;
}

export function CoverLayout({ content, theme, onContentChange, animationConfig, onAnimationPanelOpen }: CoverLayoutProps) {
  // Get animations with defaults
  const titleAnimation = getElementAnimation(animationConfig, "title");
  const subtitleAnimation = getElementAnimation(animationConfig, "subtitle");
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center text-center"
      style={{
        ...getBackgroundStyle(theme),
        padding: `${theme.spacing.padding}px`,
      }}
    >
      {content.showTitle !== false && (
        <RichTextEditor
          value={content.title || ""}
          onChange={(title) => onContentChange({ ...content, title })}
          placeholder="Enter title"
          className="max-w-4xl"
          style={{
            fontFamily: theme.typography.titleFont,
            fontSize: `${theme.typography.titleSize}px`,
            fontWeight: theme.typography.titleWeight,
            color: theme.typography.titleColor,
            lineHeight: 1.2,
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
        <RichTextEditor
          value={content.subtitle || ""}
          onChange={(subtitle) => onContentChange({ ...content, subtitle })}
          placeholder="Enter subtitle"
          className="max-w-3xl"
          style={{
            fontFamily: theme.typography.bodyFont,
            fontSize: `${theme.typography.bodySize * 1.2}px`,
            fontWeight: theme.typography.bodyWeight,
            color: theme.typography.bodyColor,
            lineHeight: 1.5,
          }}
          align="center"
          multiline
          animation={subtitleAnimation}
          onElementClick={() => onAnimationPanelOpen?.("subtitle")}
        />
      )}
    </div>
  );
}
