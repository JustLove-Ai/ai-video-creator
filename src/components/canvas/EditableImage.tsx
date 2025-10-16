"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import { ElementAnimation, ImageAlignment, ImageFit } from "@/types";
import { getAnimationProps } from "@/lib/animations";

interface EditableImageProps {
  src?: string;
  alt?: string;
  onReplace: () => void;
  className?: string;
  style?: React.CSSProperties;
  aspectRatio?: string;
  bleed?: boolean; // When true, image fills container completely
  alignment?: ImageAlignment; // Default "center"
  fit?: ImageFit; // Default "cover"
  animation?: ElementAnimation;
  onElementClick?: () => void;
}

export function EditableImage({
  src,
  alt = "Image",
  onReplace,
  className = "",
  style = {},
  aspectRatio = "16/9",
  bleed = false,
  alignment = "center",
  fit = "cover",
  animation,
  onElementClick,
}: EditableImageProps) {
  const animationProps = getAnimationProps(animation);

  const handleClick = (e: React.MouseEvent) => {
    onReplace();
    if (onElementClick) {
      e.stopPropagation();
      onElementClick();
    }
  };

  // Convert alignment to object-position CSS property
  const getObjectPosition = (alignment: ImageAlignment): string => {
    const positionMap: Record<ImageAlignment, string> = {
      "top-left": "top left",
      "top-center": "top center",
      "top-right": "top right",
      "center-left": "center left",
      "center": "center center",
      "center-right": "center right",
      "bottom-left": "bottom left",
      "bottom-center": "bottom center",
      "bottom-right": "bottom right",
    };
    return positionMap[alignment];
  };

  if (!src) {
    return (
      <motion.div
        {...animationProps}
        className={`relative bg-muted/30 border-2 border-dashed border-muted-foreground/30 ${bleed ? '' : 'rounded-lg'} flex flex-col items-center justify-center hover:border-primary hover:bg-muted/50 transition-all cursor-pointer group ${className}`}
        style={{ ...style, aspectRatio: bleed ? undefined : aspectRatio }}
        onClick={handleClick}
      >
        <ImageIcon className="h-12 w-12 text-muted-foreground/40 group-hover:text-primary transition-colors mb-3" />
        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Click to add image</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      {...animationProps}
      className={`relative ${bleed ? '' : 'rounded-lg'} overflow-hidden group cursor-pointer ${className}`}
      style={{ ...style, aspectRatio: bleed ? undefined : aspectRatio }}
      onClick={handleClick}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full`}
        style={{
          objectFit: fit,
          objectPosition: getObjectPosition(alignment),
        }}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
        <ImageIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}
