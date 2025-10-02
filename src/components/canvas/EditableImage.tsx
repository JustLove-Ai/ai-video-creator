"use client";

import { Image as ImageIcon } from "lucide-react";

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
        className={`relative bg-muted/30 border-2 border-dashed border-muted-foreground/30 ${bleed ? '' : 'rounded-lg'} flex flex-col items-center justify-center hover:border-primary hover:bg-muted/50 transition-all cursor-pointer group ${className}`}
        style={{ ...style, aspectRatio: bleed ? undefined : aspectRatio }}
        onClick={onReplace}
      >
        <ImageIcon className="h-12 w-12 text-muted-foreground/40 group-hover:text-primary transition-colors mb-3" />
        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Click to add image</p>
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
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="text-center">
          <ImageIcon className="h-8 w-8 text-white mx-auto mb-2" />
          <p className="text-white text-sm font-medium">Click to change image</p>
        </div>
      </div>
    </div>
  );
}
