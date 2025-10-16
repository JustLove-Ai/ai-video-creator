"use client";

import { Theme, LayoutContent, AnimationConfig } from "@/types";
import { EditableText } from "@/components/canvas/EditableText";
import { EditableMediaSlot } from "@/components/canvas/EditableMediaSlot";
import { getBackgroundStyle } from "@/lib/themes";
import { getElementAnimation } from "@/lib/animationHelpers";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageBulletsBleedRightLayoutProps {
  content: LayoutContent;
  theme: Theme;
  onContentChange: (content: LayoutContent) => void;
  onImageReplace: () => void;
  onChartAdd: () => void;
  animationConfig?: AnimationConfig;
  onAnimationPanelOpen?: (element: keyof AnimationConfig) => void;
}

export function ImageBulletsBleedRightLayout({
  content,
  theme,
  onContentChange,
  onImageReplace,
  onChartAdd,
  animationConfig,
  onAnimationPanelOpen,
}: ImageBulletsBleedRightLayoutProps) {
  const titleAnimation = getElementAnimation(animationConfig, "title");
  const imageAnimation = getElementAnimation(animationConfig, "image");
  const bulletPointsAnimation = getElementAnimation(animationConfig, "bulletPoints");
  const bulletPoints = content.bulletPoints || ["Point 1", "Point 2", "Point 3"];

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
    <div className="w-full h-full flex" style={{ ...getBackgroundStyle(theme) }}>
      {/* Left: Title and Bullets (50%) */}
      <div
        className="w-1/2 flex flex-col justify-center"
        style={{
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
          </div>
        )}

        {/* Bullet Points */}
        <div className="flex flex-col" style={{ gap: `${theme.spacing.gap * 0.75}px` }}>
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
                animation={bulletPointsAnimation}
                onElementClick={() => onAnimationPanelOpen?.("bulletPoints")}
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

      {/* Right: Full-bleed Image (50%) */}
      <div className="w-1/2 h-full">
        <EditableMediaSlot
          imageUrl={content.imageUrl}
          chartData={content.chartData}
          onImageReplace={onImageReplace}
          onChartAdd={onChartAdd}
          className="w-full h-full"
          bleed={true}
          animation={imageAnimation}
          onElementClick={() => onAnimationPanelOpen?.("image")}
          alignment={content.imageAlignment}
          fit={content.imageFit}
        />
      </div>
    </div>
  );
}
