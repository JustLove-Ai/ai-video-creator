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

interface LayoutRendererProps {
  layoutType: LayoutType;
  content: LayoutContent;
  theme: Theme;
  onContentChange: (content: LayoutContent) => void;
  onImageReplace: () => void;
}

export function LayoutRenderer({
  layoutType,
  content,
  theme,
  onContentChange,
  onImageReplace,
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
        />
      );

    case "imageRight":
      return (
        <ImageRightLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
        />
      );

    case "imageBullets":
      return (
        <ImageBulletsLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
        />
      );

    case "fullImage":
      return (
        <FullImageLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
        />
      );

    case "twoColumn":
      return <TwoColumnLayout content={content} theme={theme} onContentChange={onContentChange} />;

    case "titleBody":
      return <TitleBodyLayout content={content} theme={theme} onContentChange={onContentChange} />;

    case "blank":
      return <BlankLayout theme={theme} />;

    default:
      return <TitleBodyLayout content={content} theme={theme} onContentChange={onContentChange} />;
  }
}
