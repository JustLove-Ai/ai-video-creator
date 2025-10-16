"use client";

import { useState, useRef, useEffect } from "react";
import { AnnotationElement, AnnotationType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

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

    // Eraser mode doesn't create new annotations
    if (activeTool === "eraser") {
      setIsDrawing(true);
      return;
    }

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
    // Handle dragging
    if (isDragging) {
      handleDragMove(e);
      return;
    }

    // Handle drawing
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
    // Handle drag end
    if (isDragging) {
      handleDragEnd();
      return;
    }

    // Handle drawing end
    if (currentAnnotation) {
      onAnnotationsChange([...annotations, currentAnnotation]);

      // If it's a text annotation, immediately enter edit mode
      if (currentAnnotation.type === "text") {
        setEditingTextId(currentAnnotation.id);
        setEditingTextValue(currentAnnotation.text || "");
      }

      setCurrentAnnotation(null);
    }
    setIsDrawing(false);
  };

  const deleteAnnotation = (id: string) => {
    onAnnotationsChange(annotations.filter((a) => a.id !== id));
    setSelectedId(null);
  };

  const handleAnnotationClick = (e: React.MouseEvent, annotationId: string) => {
    e.stopPropagation();

    // If eraser is active, delete the annotation
    if (activeTool === "eraser") {
      deleteAnnotation(annotationId);
      return;
    }

    const annotation = annotations.find((a) => a.id === annotationId);

    // If it's a text annotation and not eraser mode, enter edit mode
    if (annotation && annotation.type === "text") {
      setEditingTextId(annotationId);
      setEditingTextValue(annotation.text || "");
      setSelectedId(null);
    } else {
      // Otherwise, select it
      setSelectedId(annotationId);
    }
  };

  const handleAnnotationMouseDown = (e: React.MouseEvent, annotationId: string) => {
    // Only start dragging if no drawing tool is active
    if (activeTool && activeTool !== "eraser") return;
    if (activeTool === "eraser") return;

    e.stopPropagation();

    const annotation = annotations.find((a) => a.id === annotationId);
    if (!annotation) return;

    // Don't drag text annotations that are being edited
    if (editingTextId === annotationId) return;

    const pos = getMousePosition(e as any);
    setIsDragging(true);
    setDraggedId(annotationId);
    setDragOffset({
      x: pos.x - annotation.x,
      y: pos.y - annotation.y,
    });
  };

  const handleDragMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || !draggedId) return;

    const pos = getMousePosition(e);
    const newX = pos.x - dragOffset.x;
    const newY = pos.y - dragOffset.y;

    // Update the annotation position in real-time
    onAnnotationsChange(
      annotations.map((a) => {
        if (a.id === draggedId) {
          // For shapes with endpoints (line, arrow), adjust them too
          if (a.type === "line" || a.type === "arrow") {
            const deltaX = newX - a.x;
            const deltaY = newY - a.y;
            return {
              ...a,
              x: newX,
              y: newY,
              endX: (a.endX || a.x) + deltaX,
              endY: (a.endY || a.y) + deltaY,
            };
          }
          // For freehand, adjust all points
          if (a.type === "freehand" && a.points) {
            const deltaX = newX - a.x;
            const deltaY = newY - a.y;
            return {
              ...a,
              x: newX,
              y: newY,
              points: a.points.map((p) => ({
                x: p.x + deltaX,
                y: p.y + deltaY,
              })),
            };
          }
          // For other shapes, just move the origin
          return { ...a, x: newX, y: newY };
        }
        return a;
      })
    );
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedId(null);
  };

  const updateTextAnnotation = (id: string, newText: string) => {
    onAnnotationsChange(
      annotations.map((a) =>
        a.id === id ? { ...a, text: newText } : a
      )
    );
    setEditingTextId(null);
    setEditingTextValue("");
  };

  // Focus input when editing starts
  useEffect(() => {
    if (editingTextId && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [editingTextId]);

  const renderAnnotation = (annotation: AnnotationElement, isTemp = false) => {
    const isBeingDragged = draggedId === annotation.id;
    const isSelected = selectedId === annotation.id;

    const commonProps = {
      stroke: annotation.stroke,
      strokeWidth: annotation.strokeWidth,
      opacity: isBeingDragged ? 0.7 : annotation.opacity,
      fill: annotation.fill || "none",
    };

    const interactiveProps = isTemp ? {} : {
      onClick: (e: React.MouseEvent) => handleAnnotationClick(e, annotation.id),
      onMouseDown: (e: React.MouseEvent) => handleAnnotationMouseDown(e, annotation.id),
      className: activeTool === "eraser"
        ? "cursor-pointer hover:opacity-50"
        : !activeTool
          ? "cursor-move hover:opacity-80"
          : "cursor-pointer",
      style: {
        pointerEvents: "auto" as const,
        ...(isSelected && !isBeingDragged ? { filter: "drop-shadow(0 0 3px rgba(59, 130, 246, 0.8))" } : {}),
      },
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
            {...interactiveProps}
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
            {...interactiveProps}
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
          <g key={annotation.id} {...interactiveProps}>
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
            {...interactiveProps}
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
            {...interactiveProps}
          />
        );

      case "text":
        // If this text is being edited, render an input instead
        if (editingTextId === annotation.id) {
          return null; // The input will be rendered separately in the return JSX
        }

        return (
          <text
            key={annotation.id}
            x={annotation.x}
            y={annotation.y}
            fill={annotation.stroke}
            fontSize={annotation.fontSize || 24}
            opacity={annotation.opacity}
            fontFamily="var(--font-caveat), 'Comic Sans MS', cursive"
            fontWeight="500"
            {...interactiveProps}
          >
            {annotation.text || "Text"}
          </text>
        );

      default:
        return null;
    }
  };

  const editingAnnotation = annotations.find((a) => a.id === editingTextId);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        ref={svgRef}
        className={`w-full h-full ${activeTool ? "pointer-events-auto" : "pointer-events-none"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isDragging
            ? "grabbing"
            : activeTool === "eraser"
              ? "pointer"
              : activeTool
                ? "crosshair"
                : "default",
        }}
      >
        {annotations.map((annotation) => renderAnnotation(annotation))}
        {currentAnnotation && renderAnnotation(currentAnnotation, true)}
      </svg>

      {/* Editable text input */}
      {editingTextId && editingAnnotation && (
        <div
          className="absolute pointer-events-auto"
          style={{
            left: `${editingAnnotation.x}px`,
            top: `${editingAnnotation.y - 30}px`,
          }}
        >
          <Input
            ref={textInputRef}
            value={editingTextValue}
            onChange={(e) => setEditingTextValue(e.target.value)}
            onBlur={() => updateTextAnnotation(editingTextId, editingTextValue)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateTextAnnotation(editingTextId, editingTextValue);
              } else if (e.key === "Escape") {
                setEditingTextId(null);
                setEditingTextValue("");
              }
            }}
            className="min-w-[200px] h-10 text-lg"
            style={{
              fontFamily: "var(--font-caveat), 'Comic Sans MS', cursive",
              fontWeight: "500",
              color: editingAnnotation.stroke,
            }}
            placeholder="Enter text..."
          />
        </div>
      )}

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
