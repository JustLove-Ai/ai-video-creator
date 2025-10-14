"use client";

import { Theme, LayoutContent } from "@/types";
import { EditableText } from "@/components/canvas/EditableText";
import { getBackgroundStyle } from "@/lib/themes";

interface StepsLayoutProps {
  content: LayoutContent;
  theme: Theme;
  onContentChange: (content: LayoutContent) => void;
  stepCount: 2 | 3 | 5;
}

export function StepsLayout({
  content,
  theme,
  onContentChange,
  stepCount,
}: StepsLayoutProps) {
  // Ensure we have the right number of steps
  const steps = content.steps || [];
  while (steps.length < stepCount) {
    steps.push({ title: `Step ${steps.length + 1}`, description: "Description" });
  }

  const handleStepChange = (index: number, field: "title" | "description", value: string) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    onContentChange({ ...content, steps: updatedSteps });
  };

  // Layout configuration based on step count
  const getGridLayout = () => {
    if (stepCount === 2) return "grid-cols-2";
    if (stepCount === 3) return "grid-cols-3";
    if (stepCount === 5) return "grid-cols-5";
    return "grid-cols-3";
  };

  const isCompactLayout = stepCount === 5;

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{
        ...getBackgroundStyle(theme),
        padding: `${theme.spacing.padding}px`,
        gap: `${theme.spacing.gap * 2}px`,
      }}
    >
      {/* Title */}
      {content.showTitle !== false && (
        <div className="text-center">
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
            align="center"
          />
        </div>
      )}

      {/* Steps Grid */}
      <div
        className={`flex-1 grid ${getGridLayout()} gap-6`}
        style={{ padding: `${theme.spacing.gap}px 0` }}
      >
        {steps.slice(0, stepCount).map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-start"
            style={{ gap: `${theme.spacing.gap}px` }}
          >
            {/* Step Number Circle */}
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: isCompactLayout ? "48px" : "64px",
                height: isCompactLayout ? "48px" : "64px",
                backgroundColor: theme.accent,
                color: "#ffffff",
                fontSize: isCompactLayout ? "20px" : "28px",
                fontWeight: "bold",
              }}
            >
              {index + 1}
            </div>

            {/* Step Title */}
            <EditableText
              value={step.title}
              onChange={(value) => handleStepChange(index, "title", value)}
              placeholder={`Step ${index + 1}`}
              style={{
                fontFamily: theme.typography.titleFont,
                fontSize: isCompactLayout ? `${theme.typography.titleSize * 0.7}px` : `${theme.typography.titleSize * 0.8}px`,
                fontWeight: theme.typography.titleWeight,
                color: theme.typography.titleColor,
                lineHeight: 1.2,
                textAlign: "center",
              }}
              align="center"
            />

            {/* Step Description */}
            <EditableText
              value={step.description}
              onChange={(value) => handleStepChange(index, "description", value)}
              placeholder="Description"
              style={{
                fontFamily: theme.typography.bodyFont,
                fontSize: isCompactLayout ? `${theme.typography.bodySize * 0.75}px` : `${theme.typography.bodySize * 0.85}px`,
                fontWeight: theme.typography.bodyWeight,
                color: theme.typography.bodyColor,
                lineHeight: 1.4,
                textAlign: "center",
              }}
              multiline
              align="center"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
