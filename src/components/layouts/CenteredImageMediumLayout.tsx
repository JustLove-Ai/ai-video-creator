"use client";

import { Theme, LayoutContent, AnimationConfig } from "@/types";
import { EditableText } from "../canvas/EditableText";
import { EditableImage } from "../canvas/EditableImage";
import { getElementAnimation } from "@/lib/animationHelpers";
import { getBackgroundStyle } from "@/lib/themes";

interface CenteredImageMediumLayoutProps {
  theme: Theme;
  content: LayoutContent;
  onContentChange: (content: LayoutContent) => void;
  onImageReplace: () => void;
  onImageRemove: () => void;
  animationConfig?: AnimationConfig;
  onAnimationPanelOpen?: (element: keyof AnimationConfig) => void;
}

export function CenteredImageMediumLayout({
  theme,
  content,
  onContentChange,
  onImageReplace,
  onImageRemove,
  animationConfig,
  onAnimationPanelOpen,
}: CenteredImageMediumLayoutProps) {
  const titleAnimation = getElementAnimation(animationConfig, "title");
  const imageAnimation = getElementAnimation(animationConfig, "image");

  return (
    <div
      className="relative h-full flex flex-col items-center justify-center"
      style={{
        ...getBackgroundStyle(theme),
        padding: `${theme.spacing.padding}px`,
        gap: `${theme.spacing.gap}px`,
      }}
    >
      {/* Title at top */}
      <div className="w-full text-center mb-8">
        <EditableText
          value={content.title || ""}
          onChange={(title) => onContentChange({ ...content, title })}
          style={{
            fontFamily: theme.typography.titleFont,
            fontSize: `${theme.typography.titleSize}px`,
            fontWeight: theme.typography.titleWeight,
            color: theme.typography.titleColor,
          }}
          placeholder="Add title..."
          multiline={false}
          align="center"
          animation={titleAnimation}
          onElementClick={() => onAnimationPanelOpen?.("title")}
        />
      </div>

      {/* Medium-sized centered image (50% width) */}
      <div className="w-1/2 flex-shrink-0">
        <EditableImage
          src={content.imageUrl}
          onReplace={onImageReplace}
          onRemove={onImageRemove}
          aspectRatio="16/9"
          alignment={content.imageAlignment || "center"}
          fit={content.imageFit || "cover"}
          animation={imageAnimation}
          onElementClick={() => onAnimationPanelOpen?.("image")}
        />
      </div>
    </div>
  );
}
