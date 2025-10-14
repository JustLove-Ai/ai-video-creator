"use client";

import { Theme, LayoutContent } from "@/types";
import { EditableText } from "@/components/canvas/EditableText";
import { EditableMediaSlot } from "@/components/canvas/EditableMediaSlot";
import { getBackgroundStyle } from "@/lib/themes";

interface ImageGridLayoutProps {
  content: LayoutContent;
  theme: Theme;
  onContentChange: (content: LayoutContent) => void;
  onImageReplace: () => void;
  onChartAdd: () => void;
  gridCount: 2 | 4 | 6;
}

export function ImageGridLayout({
  content,
  theme,
  onContentChange,
  onImageReplace,
  onChartAdd,
  gridCount,
}: ImageGridLayoutProps) {
  const hasBleed = content.imageBleed ?? true;

  // Get grid configuration
  const getGridConfig = () => {
    if (gridCount === 2) return { cols: "grid-cols-2", rows: "grid-rows-1" };
    if (gridCount === 4) return { cols: "grid-cols-2", rows: "grid-rows-2" };
    if (gridCount === 6) return { cols: "grid-cols-3", rows: "grid-rows-2" };
    return { cols: "grid-cols-2", rows: "grid-rows-1" };
  };

  const { cols, rows } = getGridConfig();

  // Image URL keys
  const imageKeys: Array<keyof LayoutContent> = [
    "imageUrl",
    "imageUrl2",
    "imageUrl3",
    "imageUrl4",
    "imageUrl5",
    "imageUrl6",
  ];

  if (hasBleed) {
    // Full bleed grid with title overlay
    return (
      <div className="w-full h-full relative">
        {/* Grid of images */}
        <div className={`absolute inset-0 grid ${cols} ${rows} gap-0`}>
          {imageKeys.slice(0, gridCount).map((key, index) => (
            <div key={index} className="w-full h-full relative group">
              <EditableMediaSlot
                imageUrl={(content[key] as string) || ""}
                onImageReplace={onImageReplace}
                onChartAdd={onChartAdd}
                className="w-full h-full"
                bleed={true}
              />
            </div>
          ))}
        </div>

        {/* Title overlay at top */}
        {content.showTitle !== false && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-8">
            <EditableText
              value={content.title || ""}
              onChange={(title) => onContentChange({ ...content, title })}
              placeholder="Enter title"
              style={{
                fontFamily: theme.typography.titleFont,
                fontSize: `${theme.typography.titleSize}px`,
                fontWeight: theme.typography.titleWeight,
                color: "#ffffff",
                lineHeight: 1.2,
                textAlign: "center",
              }}
              align="center"
            />
          </div>
        )}
      </div>
    );
  }

  // Non-bleed mode with padding
  return (
    <div
      className="w-full h-full flex flex-col"
      style={{
        ...getBackgroundStyle(theme),
        padding: `${theme.spacing.padding}px`,
        gap: `${theme.spacing.gap * 2}px`,
      }}
    >
      {/* Title */}
      {content.showTitle !== false && (
        <div className="text-center">
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
            align="center"
          />
        </div>
      )}

      {/* Grid of images */}
      <div className={`flex-1 grid ${cols} ${rows}`} style={{ gap: `${theme.spacing.gap}px` }}>
        {imageKeys.slice(0, gridCount).map((key, index) => (
          <div key={index} className="w-full h-full">
            <EditableMediaSlot
              imageUrl={(content[key] as string) || ""}
              onImageReplace={onImageReplace}
              onChartAdd={onChartAdd}
              className="w-full h-full"
              aspectRatio="4/3"
              bleed={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
