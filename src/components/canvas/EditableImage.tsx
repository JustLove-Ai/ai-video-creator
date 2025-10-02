"use client";

import { Image as ImageIcon, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditableImageProps {
  src?: string;
  alt?: string;
  onReplace: () => void;
  className?: string;
  style?: React.CSSProperties;
  aspectRatio?: string;
  bleed?: boolean; // When true, image fills container completely
}

export function EditableImage({
  src,
  alt = "Image",
  onReplace,
  className = "",
  style = {},
  aspectRatio = "16/9",
  bleed = false,
}: EditableImageProps) {
  if (!src) {
    return (
      <div
        className={`relative bg-muted/30 border-2 border-dashed border-muted-foreground/30 ${bleed ? '' : 'rounded-lg'} flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group ${className}`}
        style={{ ...style, aspectRatio: bleed ? undefined : aspectRatio }}
        onClick={onReplace}
      >
        <ImageIcon className="h-12 w-12 text-muted-foreground/40 group-hover:text-blue-500 transition-colors mb-3" />
        <p className="text-sm text-muted-foreground mb-4">Click to add image</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onReplace();
            }}
          >
            <Upload className="h-3 w-3" />
            Upload
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onReplace();
            }}
          >
            <Sparkles className="h-3 w-3" />
            AI Generate
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${bleed ? '' : 'rounded-lg'} overflow-hidden group cursor-pointer ${className}`}
      style={{ ...style, aspectRatio: bleed ? undefined : aspectRatio }}
      onClick={onReplace}
    >
      <img src={src} alt={alt} className={`w-full h-full ${bleed ? 'object-cover' : 'object-cover'}`} />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onReplace();
            }}
          >
            <Upload className="h-3 w-3" />
            Replace
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onReplace();
            }}
          >
            <Sparkles className="h-3 w-3" />
            AI Generate
          </Button>
        </div>
      </div>
    </div>
  );
}
