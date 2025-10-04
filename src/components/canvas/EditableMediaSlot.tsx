"use client";

import { Image as ImageIcon } from "lucide-react";
import { ChartData } from "@/types";
import { ChartRenderer } from "./ChartRenderer";

interface EditableMediaSlotProps {
  imageUrl?: string;
  chartData?: ChartData;
  onImageReplace: () => void;
  onChartAdd?: () => void;
  className?: string;
  style?: React.CSSProperties;
  aspectRatio?: string;
  bleed?: boolean;
}

export function EditableMediaSlot({
  imageUrl,
  chartData,
  onImageReplace,
  onChartAdd,
  className = "",
  style = {},
  aspectRatio = "16/9",
  bleed = false,
}: EditableMediaSlotProps) {
  // If there's a chart, show it
  if (chartData) {
    return (
      <div
        className={`relative ${bleed ? '' : 'rounded-lg'} overflow-hidden ${className}`}
        style={{ ...style, aspectRatio: bleed ? undefined : aspectRatio }}
      >
        <ChartRenderer data={chartData} className="w-full h-full" />
      </div>
    );
  }

  // If there's an image, show it
  if (imageUrl) {
    return (
      <div
        className={`relative ${bleed ? '' : 'rounded-lg'} overflow-hidden group cursor-pointer ${className}`}
        style={{ ...style, aspectRatio: bleed ? undefined : aspectRatio }}
        onClick={onImageReplace}
      >
        <img src={imageUrl} alt="Slide media" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
  }

  // Empty state - show option to add image
  return (
    <div
      onClick={onImageReplace}
      className={`relative bg-muted/30 border-2 border-dashed border-muted-foreground/30 ${bleed ? '' : 'rounded-lg'} flex flex-col items-center justify-center hover:border-primary hover:bg-muted/50 transition-all cursor-pointer group ${className}`}
      style={{ ...style, aspectRatio: bleed ? undefined : aspectRatio }}
    >
      <ImageIcon className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
      <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors mt-2">Add Image</p>
    </div>
  );
}
