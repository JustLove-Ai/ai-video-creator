"use client";

import { Theme, LayoutContent } from "@/types";
import { EditableText } from "@/components/canvas/EditableText";
import { EditableMediaSlot } from "@/components/canvas/EditableMediaSlot";
import { getBackgroundStyle } from "@/lib/themes";

interface CenteredChartLayoutProps {
  content: LayoutContent;
  theme: Theme;
  onContentChange: (content: LayoutContent) => void;
  onImageReplace: () => void;
  onChartAdd: () => void;
}

export function CenteredChartLayout({
  content,
  theme,
  onContentChange,
  onImageReplace,
  onChartAdd,
}: CenteredChartLayoutProps) {
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
      <div>
        <EditableText
          value={content.title || ""}
          onChange={(title) => onContentChange({ ...content, title })}
          placeholder="Enter chart title"
          style={{
            fontFamily: theme.typography.titleFont,
            fontSize: `${theme.typography.titleSize}px`,
            fontWeight: theme.typography.titleWeight,
            color: theme.typography.titleColor,
            lineHeight: 1.2,
          }}
          align="center"
        />
      </div>

      {/* Centered Chart/Image */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <EditableMediaSlot
            imageUrl={content.imageUrl}
            chartData={content.chartData}
            onImageReplace={onImageReplace}
            onChartAdd={onChartAdd}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
