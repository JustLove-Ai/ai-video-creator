"use client";

import { useState, useRef, useEffect } from "react";
import { AnnotationElement, AnnotationType } from "@/types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AnnotationLayerProps {
  annotations: AnnotationElement[];
  activeTool: AnnotationType | null;
  currentColor: string;
  currentStrokeWidth: number;
  onAnnotationsChange: (annotations: AnnotationElement[]) => void;
}

export function AnnotationLayer({
  annotations,
  activeTool,
  currentColor,
  currentStrokeWidth,
  onAnnotationsChange,
}: AnnotationLayerProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<AnnotationElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getMousePosition = (e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!activeTool) return;

    const pos = getMousePosition(e);
    setIsDrawing(true);

    const newAnnotation: AnnotationElement = {
      id: Date.now().toString(),
      type: activeTool,
      x: pos.x,
      y: pos.y,
      stroke: currentColor,
      strokeWidth: currentStrokeWidth,
      opacity: 1,
      points: activeTool === "freehand" ? [pos] : undefined,
    };

    setCurrentAnnotation(newAnnotation);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !currentAnnotation) return;

    const pos = getMousePosition(e);

    if (currentAnnotation.type === "freehand") {
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [...(currentAnnotation.points || []), pos],
      });
    } else if (currentAnnotation.type === "line" || currentAnnotation.type === "arrow") {
      setCurrentAnnotation({
        ...currentAnnotation,
        endX: pos.x,
        endY: pos.y,
      });
    } else if (
      currentAnnotation.type === "rectangle" ||
      currentAnnotation.type === "circle"
    ) {
      setCurrentAnnotation({
        ...currentAnnotation,
        width: pos.x - currentAnnotation.x,
        height: pos.y - currentAnnotation.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (currentAnnotation) {
      onAnnotationsChange([...annotations, currentAnnotation]);
      setCurrentAnnotation(null);
    }
    setIsDrawing(false);
  };

  const deleteAnnotation = (id: string) => {
    onAnnotationsChange(annotations.filter((a) => a.id !== id));
    setSelectedId(null);
  };

  const renderAnnotation = (annotation: AnnotationElement, isTemp = false) => {
    const commonProps = {
      stroke: annotation.stroke,
      strokeWidth: annotation.strokeWidth,
      opacity: annotation.opacity,
      fill: annotation.fill || "none",
    };

    switch (annotation.type) {
      case "freehand":
        if (!annotation.points || annotation.points.length < 2) return null;
        const pathData = annotation.points
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
          .join(" ");
        return (
          <path
            key={annotation.id}
            d={pathData}
            {...commonProps}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "line":
        return (
          <line
            key={annotation.id}
            x1={annotation.x}
            y1={annotation.y}
            x2={annotation.endX || annotation.x}
            y2={annotation.endY || annotation.y}
            {...commonProps}
            strokeLinecap="round"
          />
        );

      case "arrow":
        const dx = (annotation.endX || annotation.x) - annotation.x;
        const dy = (annotation.endY || annotation.y) - annotation.y;
        const angle = Math.atan2(dy, dx);
        const arrowLength = 15;
        const arrowWidth = 10;

        return (
          <g key={annotation.id}>
            <line
              x1={annotation.x}
              y1={annotation.y}
              x2={annotation.endX || annotation.x}
              y2={annotation.endY || annotation.y}
              {...commonProps}
              strokeLinecap="round"
            />
            <path
              d={`
                M ${annotation.endX || annotation.x} ${annotation.endY || annotation.y}
                L ${(annotation.endX || annotation.x) - arrowLength * Math.cos(angle - Math.PI / 6)} ${(annotation.endY || annotation.y) - arrowLength * Math.sin(angle - Math.PI / 6)}
                M ${annotation.endX || annotation.x} ${annotation.endY || annotation.y}
                L ${(annotation.endX || annotation.x) - arrowLength * Math.cos(angle + Math.PI / 6)} ${(annotation.endY || annotation.y) - arrowLength * Math.sin(angle + Math.PI / 6)}
              `}
              {...commonProps}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        );

      case "rectangle":
        return (
          <rect
            key={annotation.id}
            x={Math.min(annotation.x, annotation.x + (annotation.width || 0))}
            y={Math.min(annotation.y, annotation.y + (annotation.height || 0))}
            width={Math.abs(annotation.width || 0)}
            height={Math.abs(annotation.height || 0)}
            {...commonProps}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(annotation.id);
            }}
            className="cursor-pointer"
          />
        );

      case "circle":
        const rx = Math.abs(annotation.width || 0) / 2;
        const ry = Math.abs(annotation.height || 0) / 2;
        const cx = annotation.x + (annotation.width || 0) / 2;
        const cy = annotation.y + (annotation.height || 0) / 2;
        return (
          <ellipse
            key={annotation.id}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            {...commonProps}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(annotation.id);
            }}
            className="cursor-pointer"
          />
        );

      case "text":
        return (
          <text
            key={annotation.id}
            x={annotation.x}
            y={annotation.y}
            fill={annotation.stroke}
            fontSize={annotation.fontSize || 24}
            opacity={annotation.opacity}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(annotation.id);
            }}
            className="cursor-pointer"
          >
            {annotation.text || "Text"}
          </text>
        );

      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        ref={svgRef}
        className="w-full h-full pointer-events-auto"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: activeTool ? "crosshair" : "default" }}
      >
        {annotations.map((annotation) => renderAnnotation(annotation))}
        {currentAnnotation && renderAnnotation(currentAnnotation, true)}
      </svg>

      {/* Delete button for selected annotation */}
      {selectedId && (
        <div className="absolute top-2 right-2 pointer-events-auto">
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={() => deleteAnnotation(selectedId)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
