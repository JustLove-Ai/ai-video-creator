"use client";

import { Theme, LayoutContent } from "@/types";
import { EditableText } from "@/components/canvas/EditableText";
import { getBackgroundStyle } from "@/lib/themes";

interface CoverLayoutProps {
  content: LayoutContent;
  theme: Theme;
  onContentChange: (content: LayoutContent) => void;
}

export function CoverLayout({ content, theme, onContentChange }: CoverLayoutProps) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center text-center"
      style={{
        ...getBackgroundStyle(theme),
        padding: `${theme.spacing.padding}px`,
      }}
    >
      {content.showTitle !== false && (
        <EditableText
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
            color: theme.typography.bodyColor,
            lineHeight: 1.5,
          }}
          align="center"
          multiline
        />
      )}
    </div>
  );
}
