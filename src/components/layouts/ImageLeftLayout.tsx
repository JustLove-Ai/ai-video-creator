"use client";

import { Theme, LayoutContent } from "@/types";
import { EditableText } from "@/components/canvas/EditableText";
import { EditableMediaSlot } from "@/components/canvas/EditableMediaSlot";
import { getBackgroundStyle } from "@/lib/themes";

interface ImageLeftLayoutProps {
  content: LayoutContent;
  theme: Theme;
  onContentChange: (content: LayoutContent) => void;
  onImageReplace: () => void;
  onChartAdd: () => void;
}

export function ImageLeftLayout({
  content,
  theme,
  onContentChange,
  onImageReplace,
  onChartAdd,
}: ImageLeftLayoutProps) {
  const hasBleed = content.imageBleed;

  return (
    <div
      className="w-full h-full flex items-center"
      style={{
        ...getBackgroundStyle(theme),
        padding: hasBleed ? '0' : `${theme.spacing.padding}px`,
        gap: hasBleed ? '0' : `${theme.spacing.gap * 2}px`,
      }}
    >
      {/* Left: Image/Chart (40%) */}
      <div className={`${hasBleed ? 'w-[40%]' : 'w-[40%]'} h-full flex items-center`}>
        <EditableMediaSlot
          imageUrl={content.imageUrl}
          chartData={content.chartData}
          onImageReplace={onImageReplace}
          onChartAdd={onChartAdd}
          className="w-full h-full"
          aspectRatio={hasBleed ? undefined : "4/3"}
          bleed={hasBleed}
        />
      </div>

      {/* Right: Text Content (60%) */}
      <div className="w-[60%] flex flex-col justify-center" style={{ gap: `${theme.spacing.gap}px`, padding: hasBleed ? `${theme.spacing.padding}px` : '0' }}>
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
    </div>
  );
}
