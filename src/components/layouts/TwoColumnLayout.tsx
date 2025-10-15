"use client";

import { Theme, LayoutContent, AnimationConfig } from "@/types";
import { EditableText } from "@/components/canvas/EditableText";
import { getBackgroundStyle } from "@/lib/themes";
import { getElementAnimation } from "@/lib/animationHelpers";

interface TwoColumnLayoutProps {
  content: LayoutContent;
  theme: Theme;
  onContentChange: (content: LayoutContent) => void;
  animationConfig?: AnimationConfig;
  onAnimationPanelOpen?: (element: keyof AnimationConfig) => void;
}

export function TwoColumnLayout({ content, theme, onContentChange, animationConfig, onAnimationPanelOpen }: TwoColumnLayoutProps) {
  const titleAnimation = getElementAnimation(animationConfig, "title");
  const leftColumnAnimation = getElementAnimation(animationConfig, "leftColumn");
  const rightColumnAnimation = getElementAnimation(animationConfig, "rightColumn");
  return (
    <div
      className="w-full h-full flex flex-col"
      style={{
        ...getBackgroundStyle(theme),
        padding: `${theme.spacing.padding}px`,
        gap: `${theme.spacing.gap}px`,
      }}
    >
      {/* Title */}
      {content.showTitle !== false && (
        <EditableText
          value={content.title || ""}
          onChange={(title) => onContentChange({ ...content, title })}
          placeholder="Enter title"
          style={{
            fontFamily: theme.typography.titleFont,
            fontSize: `${theme.typography.titleSize}px`,
            fontWeight: theme.typography.titleWeight,
            color: theme.typography.titleColor,
            lineHeight: 1.2,
          }}
          animation={titleAnimation}
          onElementClick={() => onAnimationPanelOpen?.("title")}
        />
      )}

      {/* Two Columns */}
      <div className="flex-1 flex" style={{ gap: `${theme.spacing.gap * 2}px` }}>
        {/* Left Column */}
        {content.showLeftColumn !== false && (
          <div className="flex-1 flex flex-col">
            <EditableText
              value={content.leftColumn || ""}
              onChange={(leftColumn) => onContentChange({ ...content, leftColumn })}
              placeholder="Left column content"
              className="flex-1"
              style={{
                fontFamily: theme.typography.bodyFont,
                fontSize: `${theme.typography.bodySize}px`,
                fontWeight: theme.typography.bodyWeight,
                color: theme.typography.bodyColor,
                lineHeight: 1.6,
              }}
              multiline
              animation={leftColumnAnimation}
              onElementClick={() => onAnimationPanelOpen?.("leftColumn")}
            />
          </div>
        )}

        {/* Divider - only show if both columns are visible */}
        {content.showLeftColumn !== false && content.showRightColumn !== false && (
          <div
            style={{
              width: "2px",
              backgroundColor: theme.accent,
              opacity: 0.3,
            }}
          />
        )}

        {/* Right Column */}
        {content.showRightColumn !== false && (
          <div className="flex-1 flex flex-col">
            <EditableText
              value={content.rightColumn || ""}
              onChange={(rightColumn) => onContentChange({ ...content, rightColumn })}
              placeholder="Right column content"
              className="flex-1"
              style={{
                fontFamily: theme.typography.bodyFont,
                fontSize: `${theme.typography.bodySize}px`,
                fontWeight: theme.typography.bodyWeight,
                color: theme.typography.bodyColor,
                lineHeight: 1.6,
              }}
              multiline
              animation={rightColumnAnimation}
              onElementClick={() => onAnimationPanelOpen?.("rightColumn")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
