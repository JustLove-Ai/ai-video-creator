"use client";

import { Theme, LayoutContent } from "@/types";
import { EditableText } from "@/components/canvas/EditableText";
import { EditableMediaSlot } from "@/components/canvas/EditableMediaSlot";
import { getBackgroundStyle } from "@/lib/themes";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageBulletsLayoutProps {
  content: LayoutContent;
  theme: Theme;
  onContentChange: (content: LayoutContent) => void;
  onImageReplace: () => void;
  onChartAdd: () => void;
}

export function ImageBulletsLayout({
  content,
  theme,
  onContentChange,
  onImageReplace,
  onChartAdd,
}: ImageBulletsLayoutProps) {
  const bulletPoints = content.bulletPoints || ["Point 1", "Point 2", "Point 3"];
  const hasBleed = content.imageBleed;

  const updateBulletPoint = (index: number, value: string) => {
    const newBullets = [...bulletPoints];
    newBullets[index] = value;
    onContentChange({ ...content, bulletPoints: newBullets });
  };

  const addBulletPoint = () => {
    onContentChange({ ...content, bulletPoints: [...bulletPoints, "New point"] });
  };

  const removeBulletPoint = (index: number) => {
    const newBullets = bulletPoints.filter((_, i) => i !== index);
    onContentChange({ ...content, bulletPoints: newBullets });
  };

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{
        ...getBackgroundStyle(theme),
        padding: hasBleed ? '0' : `${theme.spacing.padding}px`,
        gap: hasBleed ? '0' : `${theme.spacing.gap}px`,
      }}
    >
      {/* Title */}
      {content.showTitle !== false && (
        <div style={{ padding: hasBleed ? `${theme.spacing.padding}px ${theme.spacing.padding}px 0` : '0' }}>
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
        </div>
      )}

      {/* Image and Bullets in two columns */}
      <div className="flex-1 flex items-start" style={{ gap: hasBleed ? '0' : `${theme.spacing.gap * 2}px`, padding: hasBleed ? `${theme.spacing.gap}px 0 0 0` : '0' }}>
        {/* Left: Image/Chart */}
        <div className={hasBleed ? 'w-[45%] h-full' : 'w-[45%]'}>
          <EditableMediaSlot
            imageUrl={content.imageUrl}
            chartData={content.chartData}
            onImageReplace={onImageReplace}
            onChartAdd={onChartAdd}
            className={hasBleed ? 'w-full h-full' : 'w-full'}
            aspectRatio={hasBleed ? undefined : "16/9"}
            bleed={hasBleed}
          />
        </div>

        {/* Right: Bullet Points */}
        <div className="w-[55%] flex flex-col" style={{ gap: `${theme.spacing.gap * 0.75}px`, padding: hasBleed ? `0 ${theme.spacing.padding}px 0 ${theme.spacing.gap * 2}px` : '0' }}>
          {bulletPoints.map((point, index) => (
            <div key={index} className="flex items-start gap-3 group">
              <div
                className="mt-2"
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: theme.accent,
                  flexShrink: 0,
                }}
              />
              <EditableText
                value={point}
                onChange={(value) => updateBulletPoint(index, value)}
                placeholder={`Point ${index + 1}`}
                className="flex-1"
                style={{
                  fontFamily: theme.typography.bodyFont,
                  fontSize: `${theme.typography.bodySize}px`,
                  fontWeight: theme.typography.bodyWeight,
                  color: theme.typography.bodyColor,
                  lineHeight: 1.5,
                }}
              />
              {bulletPoints.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeBulletPoint(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          {bulletPoints.length < 8 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={addBulletPoint}
              className="self-start gap-2 mt-2"
              style={{ color: theme.typography.bodyColor }}
            >
              <Plus className="h-3 w-3" />
              Add Point
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
