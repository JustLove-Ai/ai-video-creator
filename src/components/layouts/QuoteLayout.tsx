"use client";

import { Theme, LayoutContent } from "@/types";
import { EditableText } from "@/components/canvas/EditableText";
import { EditableMediaSlot } from "@/components/canvas/EditableMediaSlot";
import { getBackgroundStyle } from "@/lib/themes";
import { Quote } from "lucide-react";

interface QuoteLayoutProps {
  content: LayoutContent;
  theme: Theme;
  onContentChange: (content: LayoutContent) => void;
  onImageReplace: () => void;
  onChartAdd: () => void;
}

export function QuoteLayout({
  content,
  theme,
  onContentChange,
  onImageReplace,
  onChartAdd,
}: QuoteLayoutProps) {
  const hasBleed = content.imageBleed ?? true;

  if (hasBleed && content.imageUrl) {
    // With background image
    return (
      <div className="w-full h-full relative">
        {/* Background image */}
        <div className="absolute inset-0">
          <EditableMediaSlot
            imageUrl={content.imageUrl}
            chartData={content.chartData}
            onImageReplace={onImageReplace}
            onChartAdd={onChartAdd}
            className="w-full h-full"
            bleed={true}
            alignment={content.imageAlignment}
            fit={content.imageFit}
          />
        </div>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Quote content */}
        <div
          className="relative z-10 w-full h-full flex flex-col items-center justify-center"
          style={{ padding: `${theme.spacing.padding * 2}px` }}
        >
          <Quote className="w-16 h-16 opacity-30 mb-8" style={{ color: theme.typography.titleColor }} />

          <EditableText
            value={content.quote || ""}
            onChange={(quote) => onContentChange({ ...content, quote })}
            placeholder="Enter quote"
            style={{
              fontFamily: theme.typography.titleFont,
              fontSize: `${theme.typography.titleSize * 1.5}px`,
              fontWeight: theme.typography.titleWeight,
              color: "#ffffff",
              lineHeight: 1.4,
              textAlign: "center",
              fontStyle: "italic",
              maxWidth: "800px",
            }}
            multiline
            align="center"
          />

          <div className="mt-8 opacity-80">
            <EditableText
              value={content.quoteAuthor || ""}
              onChange={(quoteAuthor) => onContentChange({ ...content, quoteAuthor })}
              placeholder="— Author Name"
              style={{
                fontFamily: theme.typography.bodyFont,
                fontSize: `${theme.typography.bodySize * 1.2}px`,
                fontWeight: "600",
                color: "#ffffff",
                lineHeight: 1.6,
                textAlign: "center",
              }}
              align="center"
            />
          </div>
        </div>
      </div>
    );
  }

  // Without background image or non-bleed mode
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center"
      style={{
        ...getBackgroundStyle(theme),
        padding: `${theme.spacing.padding * 2}px`,
      }}
    >
      <Quote
        className="w-16 h-16 opacity-30 mb-8"
        style={{ color: theme.typography.titleColor }}
      />

      <EditableText
        value={content.quote || ""}
        onChange={(quote) => onContentChange({ ...content, quote })}
        placeholder="Enter quote"
        style={{
          fontFamily: theme.typography.titleFont,
          fontSize: `${theme.typography.titleSize * 1.5}px`,
          fontWeight: theme.typography.titleWeight,
          color: theme.typography.titleColor,
          lineHeight: 1.4,
          textAlign: "center",
          fontStyle: "italic",
          maxWidth: "800px",
        }}
        multiline
        align="center"
      />

      <div className="mt-8 opacity-80">
        <EditableText
          value={content.quoteAuthor || ""}
          onChange={(quoteAuthor) => onContentChange({ ...content, quoteAuthor })}
          placeholder="— Author Name"
          style={{
            fontFamily: theme.typography.bodyFont,
            fontSize: `${theme.typography.bodySize * 1.2}px`,
            fontWeight: "600",
            color: theme.typography.bodyColor,
            lineHeight: 1.6,
            textAlign: "center",
          }}
          align="center"
        />
      </div>
    </div>
  );
}
