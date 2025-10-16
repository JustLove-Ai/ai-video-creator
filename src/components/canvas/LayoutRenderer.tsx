"use client";

import { Theme, LayoutContent, LayoutType, AnimationConfig } from "@/types";
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
import { QuoteLayout } from "@/components/layouts/QuoteLayout";
import { StepsLayout } from "@/components/layouts/StepsLayout";
import { ImageGridLayout } from "@/components/layouts/ImageGridLayout";
import { CenteredImageMediumLayout } from "@/components/layouts/CenteredImageMediumLayout";
import { CenteredImageLargeLayout } from "@/components/layouts/CenteredImageLargeLayout";
import { ImageBulletsBleedLeftLayout } from "@/components/layouts/ImageBulletsBleedLeftLayout";
import { ImageBulletsBleedRightLayout } from "@/components/layouts/ImageBulletsBleedRightLayout";

interface LayoutRendererProps {
  layoutType: LayoutType;
  content: LayoutContent;
  theme: Theme;
  onContentChange: (content: LayoutContent) => void;
  onImageReplace: () => void;
  onImageRemove: () => void;
  onChartAdd: () => void;
  animationConfig?: AnimationConfig;
}

export function LayoutRenderer({
  layoutType,
  content,
  theme,
  onContentChange,
  onImageReplace,
  onImageRemove,
  onChartAdd,
  animationConfig,
}: LayoutRendererProps) {
  switch (layoutType) {
    case "cover":
      return <CoverLayout content={content} theme={theme} onContentChange={onContentChange} animationConfig={animationConfig} />;

    case "imageLeft":
      return (
        <ImageLeftLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onImageRemove={onImageRemove}
          onChartAdd={onChartAdd}
          animationConfig={animationConfig}
        />
      );

    case "imageRight":
      return (
        <ImageRightLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onImageRemove={onImageRemove}
          onChartAdd={onChartAdd}
          animationConfig={animationConfig}
        />
      );

    case "imageBullets":
      return (
        <ImageBulletsLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onImageRemove={onImageRemove}
          onChartAdd={onChartAdd}
          animationConfig={animationConfig}
        />
      );

    case "fullImage":
      return (
        <FullImageLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onImageRemove={onImageRemove}
          onChartAdd={onChartAdd}
          animationConfig={animationConfig}
        />
      );

    case "twoColumn":
      return <TwoColumnLayout content={content} theme={theme} onContentChange={onContentChange} animationConfig={animationConfig} />;

    case "titleBody":
      return <TitleBodyLayout content={content} theme={theme} onContentChange={onContentChange} animationConfig={animationConfig} />;

    case "blank":
      return <BlankLayout theme={theme} />;

    case "centeredChart":
      return (
        <CenteredChartLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onImageRemove={onImageRemove}
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
          onImageRemove={onImageRemove}
          onChartAdd={onChartAdd}
        />
      );

    case "quote":
      return (
        <QuoteLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onImageRemove={onImageRemove}
          onChartAdd={onChartAdd}
        />
      );

    case "steps2":
      return (
        <StepsLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          stepCount={2}
        />
      );

    case "steps3":
      return (
        <StepsLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          stepCount={3}
        />
      );

    case "steps5":
      return (
        <StepsLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          stepCount={5}
        />
      );

    case "imageGrid2":
      return (
        <ImageGridLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onImageRemove={onImageRemove}
          onChartAdd={onChartAdd}
          gridCount={2}
        />
      );

    case "imageGrid4":
      return (
        <ImageGridLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onImageRemove={onImageRemove}
          onChartAdd={onChartAdd}
          gridCount={4}
        />
      );

    case "imageGrid6":
      return (
        <ImageGridLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onImageRemove={onImageRemove}
          onChartAdd={onChartAdd}
          gridCount={6}
        />
      );

    case "centeredImageMedium":
      return (
        <CenteredImageMediumLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onImageRemove={onImageRemove}
          animationConfig={animationConfig}
        />
      );

    case "centeredImageLarge":
      return (
        <CenteredImageLargeLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onImageRemove={onImageRemove}
          animationConfig={animationConfig}
        />
      );

    case "imageBulletsBleedLeft":
      return (
        <ImageBulletsBleedLeftLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onImageRemove={onImageRemove}
          onChartAdd={onChartAdd}
          animationConfig={animationConfig}
        />
      );

    case "imageBulletsBleedRight":
      return (
        <ImageBulletsBleedRightLayout
          content={content}
          theme={theme}
          onContentChange={onContentChange}
          onImageReplace={onImageReplace}
          onImageRemove={onImageRemove}
          onChartAdd={onChartAdd}
          animationConfig={animationConfig}
        />
      );

    default:
      return <TitleBodyLayout content={content} theme={theme} onContentChange={onContentChange} />;
  }
}
