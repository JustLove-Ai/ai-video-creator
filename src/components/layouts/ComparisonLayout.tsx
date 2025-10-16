"use client";

import { Theme, LayoutContent } from "@/types";
import { EditableText } from "@/components/canvas/EditableText";
import { EditableMediaSlot } from "@/components/canvas/EditableMediaSlot";
import { getBackgroundStyle } from "@/lib/themes";

interface ComparisonLayoutProps {
  content: LayoutContent;
  theme: Theme;
  onContentChange: (content: LayoutContent) => void;
  onImageReplace: () => void;
  onImageRemove: () => void;
  onChartAdd: () => void;
}

export function ComparisonLayout({
  content,
  theme,
  onContentChange,
  onImageReplace,
  onImageRemove,
  onChartAdd,
}: ComparisonLayoutProps) {
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
        <div>
          <EditableText
            value={content.title || ""}
            onChange={(title) => onContentChange({ ...content, title })}
            placeholder="Enter comparison title"
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
      )}

      {/* Two Side-by-Side Images/Charts */}
      <div className="flex-1 flex items-center gap-6">
        {/* Left Side */}
        <div className="flex-1 flex flex-col gap-3">
          {content.showLeftColumn !== false && (
            <EditableText
              value={content.leftColumn || ""}
              onChange={(leftColumn) => onContentChange({ ...content, leftColumn })}
              placeholder="Left label (e.g., Before)"
              style={{
                fontFamily: theme.typography.bodyFont,
                fontSize: `${theme.typography.bodySize}px`,
                fontWeight: theme.typography.bodyWeight,
                color: theme.typography.bodyColor,
              }}
              align="center"
            />
          )}
          <div className="flex-1">
            <EditableMediaSlot
              imageUrl={content.imageUrl}
              chartData={content.chartData}
              onImageReplace={onImageReplace}
              onImageRemove={onImageRemove}
              onChartAdd={onChartAdd}
              className="w-full h-full"
              alignment={content.imageAlignment}
              fit={content.imageFit}
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex flex-col gap-3">
          {content.showRightColumn !== false && (
            <EditableText
              value={content.rightColumn || ""}
              onChange={(rightColumn) => onContentChange({ ...content, rightColumn })}
              placeholder="Right label (e.g., After)"
              style={{
                fontFamily: theme.typography.bodyFont,
                fontSize: `${theme.typography.bodySize}px`,
                fontWeight: theme.typography.bodyWeight,
                color: theme.typography.bodyColor,
              }}
              align="center"
            />
          )}
          <div className="flex-1">
            <EditableMediaSlot
              imageUrl={content.imageUrl2}
              chartData={content.chartData2}
              onImageReplace={onImageReplace}
              onImageRemove={onImageRemove}
              onChartAdd={onChartAdd}
              className="w-full h-full"
              alignment={content.imageAlignment}
              fit={content.imageFit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
