"use client";

import { Theme, LayoutContent } from "@/types";
import { EditableText } from "@/components/canvas/EditableText";
import { getBackgroundStyle } from "@/lib/themes";

interface TitleBodyLayoutProps {
  content: LayoutContent;
  theme: Theme;
  onContentChange: (content: LayoutContent) => void;
}

export function TitleBodyLayout({ content, theme, onContentChange }: TitleBodyLayoutProps) {
  return (
    <div
      className="w-full h-full flex flex-col justify-center"
      style={{
        ...getBackgroundStyle(theme),
        padding: `${theme.spacing.padding}px`,
        gap: `${theme.spacing.gap}px`,
      }}
    >
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
        />
      )}
      {content.showBody !== false && (
        <EditableText
          value={content.body || ""}
          onChange={(body) => onContentChange({ ...content, body })}
          placeholder="Enter body text"
          style={{
            fontFamily: theme.typography.bodyFont,
            fontSize: `${theme.typography.bodySize}px`,
            fontWeight: theme.typography.bodyWeight,
            color: theme.typography.bodyColor,
            lineHeight: 1.6,
          }}
          multiline
        />
      )}
    </div>
  );
}
