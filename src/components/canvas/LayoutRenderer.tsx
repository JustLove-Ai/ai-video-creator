"use client";

import { Theme, LayoutContent, LayoutType } from "@/types";
import { CoverLayout } from "@/components/layouts/CoverLayout";
import { ImageLeftLayout } from "@/components/layouts/ImageLeftLayout";
import { ImageRightLayout } from "@/components/layouts/ImageRightLayout";
import { ImageBulletsLayout } from "@/components/layouts/ImageBulletsLayout";
import { FullImageLayout } from "@/components/layouts/FullImageLayout";
import { TwoColumnLayout } from "@/components/layouts/TwoColumnLayout";
import { TitleBodyLayout } from "@/components/layouts/TitleBodyLayout";
import { BlankLayout } from "@/components/layouts/BlankLayout";
import { CenteredChartLayout } from "@/components/layouts/CenteredChartLayout";
import { ComparisonLayout } from "@/components/layouts/ComparisonLayout";

interface LayoutRendererProps {
  layoutType: LayoutType;
  content: LayoutContent;
  theme: Theme;
  onContentChange: (content: LayoutContent) => void;
  onImageReplace: () => void;
  onChartAdd: () => void;
}

export function LayoutRenderer({
  layoutType,
  content,
  theme,
  onContentChange,
  onImageReplace,
  onChartAdd,
}: LayoutRendererProps) {
  switch (layoutType) {
    case "cover":
      return <CoverLayout content={content} theme={theme} onContentChange={onContentChange} />;

    case "imageLeft":
      return (
        <ImageLeftLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onChartAdd={onChartAdd}
        />
      );

    case "imageRight":
      return (
        <ImageRightLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onChartAdd={onChartAdd}
        />
      );

    case "imageBullets":
      return (
        <ImageBulletsLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onChartAdd={onChartAdd}
        />
      );

    case "fullImage":
      return (
        <FullImageLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onChartAdd={onChartAdd}
        />
      );

    case "twoColumn":
      return <TwoColumnLayout content={content} theme={theme} onContentChange={onContentChange} />;

    case "titleBody":
      return <TitleBodyLayout content={content} theme={theme} onContentChange={onContentChange} />;

    case "blank":
      return <BlankLayout theme={theme} />;

    case "centeredChart":
      return (
        <CenteredChartLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onChartAdd={onChartAdd}
        />
      );

    case "comparison":
      return (
        <ComparisonLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onChartAdd={onChartAdd}
        />
      );

    default:
      return <TitleBodyLayout content={content} theme={theme} onContentChange={onContentChange} />;
  }
}
