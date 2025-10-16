"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pen,
  ArrowRight,
  Square,
  Circle,
  Minus,
  Type,
  Eraser,
} from "lucide-react";
import { AnnotationType } from "@/types";

interface AnnotationToolbarProps {
  activeTool: AnnotationType | null;
  onToolChange: (tool: AnnotationType | null) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  currentStrokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
}

const defaultColors = [
  "#000000", // Black
  "#ffffff", // White
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#22c55e", // Green
  "#eab308", // Yellow
  "#a855f7", // Purple
  "#ec4899", // Pink
];

const tools: { id: AnnotationType; label: string; icon: React.ReactNode }[] = [
  { id: "freehand", label: "Freehand", icon: <Pen className="h-4 w-4" /> },
  { id: "arrow", label: "Arrow", icon: <ArrowRight className="h-4 w-4" /> },
  { id: "rectangle", label: "Rectangle", icon: <Square className="h-4 w-4" /> },
  { id: "circle", label: "Circle", icon: <Circle className="h-4 w-4" /> },
  { id: "line", label: "Line", icon: <Minus className="h-4 w-4" /> },
  { id: "text", label: "Text", icon: <Type className="h-4 w-4" /> },
  { id: "eraser", label: "Eraser", icon: <Eraser className="h-4 w-4" /> },
];

export function AnnotationToolbar({
  activeTool,
  onToolChange,
  currentColor,
  onColorChange,
  currentStrokeWidth,
  onStrokeWidthChange,
}: AnnotationToolbarProps) {
  const [customColor, setCustomColor] = useState(currentColor);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    onColorChange(color);
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg p-2 flex items-center gap-2 z-10">
      <TooltipProvider>
        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === tool.id ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onToolChange(activeTool === tool.id ? null : tool.id)}
                >
                  {tool.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Color Palette */}
        <div className="flex items-center gap-1">
          {defaultColors.map((color) => (
            <Tooltip key={color}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onColorChange(color)}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    currentColor === color
                      ? "border-primary scale-110"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{color}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-6 h-6 rounded border-2 border-border hover:border-primary transition-all relative"
                style={{
                  background: `linear-gradient(135deg, red, yellow, green, blue, purple)`,
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Custom Color</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {showColorPicker && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                type="text"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                placeholder="#000000"
                className="w-24 h-8 text-xs"
              />
            </div>
          </>
        )}

        <Separator orientation="vertical" className="h-6" />

        {/* Stroke Width */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                {[2, 4, 6, 8].map((width) => (
                  <button
                    key={width}
                    onClick={() => onStrokeWidthChange(width)}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                      currentStrokeWidth === width
                        ? "bg-secondary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div
                      className="rounded-full bg-foreground"
                      style={{ width: `${width}px`, height: `${width}px` }}
                    />
                  </button>
                ))}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Stroke Width</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
