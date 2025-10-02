"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Type,
  Image as ImageIcon,
  Square,
  X
} from "lucide-react";

interface CanvasElement {
  id: string;
  type: "text" | "image" | "shape";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  style: {
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    opacity?: number;
  };
  animation: {
    type: "none" | "fadeIn" | "slideInLeft" | "slideInRight" | "slideInUp" | "slideInDown" | "zoomIn";
    duration: number;
    delay: number;
  };
}

interface Scene {
  id: string;
  content: string;
  duration: number;
  elements: CanvasElement[];
}

interface VideoCanvasProps {
  activeScene?: Scene;
  selectedTool: string | null;
  onSceneUpdate: (scene: Scene) => void;
}

const animationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
  },
  slideInUp: {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
  },
  slideInDown: {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
  },
  zoomIn: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
  },
};

export function VideoCanvas({ activeScene, selectedTool, onSceneUpdate }: VideoCanvasProps) {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!activeScene) {
    return (
      <div className="w-full max-w-6xl aspect-video bg-white rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-gray-400 text-lg">No scene selected</div>
      </div>
    );
  }

  const addElement = (type: CanvasElement["type"], content: string = "") => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type,
      content: content || (type === "text" ? "New Text" : type === "shape" ? "rectangle" : ""),
      x: 50,
      y: 50,
      width: type === "text" ? 200 : 100,
      height: type === "text" ? 50 : 100,
      rotation: 0,
      style: {
        fontSize: type === "text" ? 24 : undefined,
        fontWeight: type === "text" ? "500" : undefined,
        color: type === "text" ? "#000000" : "#3b82f6",
        backgroundColor: type === "shape" ? "#e5e7eb" : "transparent",
        borderRadius: type === "shape" ? 8 : 0,
        opacity: 1,
      },
      animation: {
        type: "fadeIn",
        duration: 0.5,
        delay: 0,
      },
    };

    const updatedScene = {
      ...activeScene,
      elements: [...activeScene.elements, newElement],
    };

    onSceneUpdate(updatedScene);
    setSelectedElementId(newElement.id);
  };

  const updateElement = (elementId: string, updates: Partial<CanvasElement>) => {
    const updatedElements = activeScene.elements.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    );

    onSceneUpdate({
      ...activeScene,
      elements: updatedElements,
    });
  };

  const deleteElement = (elementId: string) => {
    const updatedElements = activeScene.elements.filter(el => el.id !== elementId);
    onSceneUpdate({
      ...activeScene,
      elements: updatedElements,
    });
    setSelectedElementId(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElementId(null);
      setEditingElementId(null);

      // Add element based on selected tool
      if (selectedTool) {
        if (selectedTool === "text") {
          addElement("text");
        } else if (selectedTool === "elements") {
          addElement("shape");
        }
      }
    }
  };

  const renderElement = (element: CanvasElement) => {
    const variants = animationVariants[element.animation.type] || animationVariants.fadeIn;
    const isSelected = selectedElementId === element.id;
    const isEditing = editingElementId === element.id;

    return (
      <motion.div
        key={element.id}
        className={`absolute cursor-move select-none group ${
          isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
        }`}
        style={{
          left: `${element.x}%`,
          top: `${element.y}%`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          transform: `rotate(${element.rotation}deg)`,
          zIndex: isSelected ? 10 : 1,
        }}
        initial={variants.initial}
        animate={variants.animate}
        transition={{
          duration: element.animation.duration,
          delay: element.animation.delay,
          ease: "easeOut",
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedElementId(element.id);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (element.type === "text") {
            setEditingElementId(element.id);
          }
        }}
      >
        {element.type === "text" && (
          <>
            {isEditing ? (
              <Input
                value={element.content}
                onChange={(e) => updateElement(element.id, { content: e.target.value })}
                onBlur={() => setEditingElementId(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setEditingElementId(null);
                  }
                }}
                className="border-none bg-transparent p-0 focus:ring-0"
                style={{
                  fontSize: `${element.style.fontSize}px`,
                  fontWeight: element.style.fontWeight,
                  color: element.style.color,
                  width: "100%",
                  height: "100%",
                }}
                autoFocus
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  fontSize: `${element.style.fontSize}px`,
                  fontWeight: element.style.fontWeight,
                  color: element.style.color,
                  opacity: element.style.opacity,
                }}
              >
                {element.content}
              </div>
            )}
          </>
        )}

        {element.type === "shape" && (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: element.style.backgroundColor,
              borderRadius: `${element.style.borderRadius}px`,
              opacity: element.style.opacity,
            }}
          />
        )}

        {element.type === "image" && (
          <div
            className="w-full h-full bg-gray-200 rounded flex items-center justify-center"
            style={{ opacity: element.style.opacity }}
          >
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}

        {/* Element Controls */}
        {isSelected && (
          <div className="absolute -top-8 left-0 flex items-center gap-1 bg-background border border-border rounded px-2 py-1 shadow-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                deleteElement(element.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-6xl">
      {/* Canvas */}
      <motion.div
        ref={canvasRef}
        className="w-full aspect-video bg-white rounded-lg shadow-lg relative overflow-hidden cursor-crosshair"
        onClick={handleCanvasClick}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence>
          {activeScene.elements.map(renderElement)}
        </AnimatePresence>

        {/* Quick Add Buttons */}
        {!selectedTool && activeScene.elements.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center space-y-4">
              <p className="text-gray-500 text-lg mb-6">Click to add elements to your scene</p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => addElement("text")}
                >
                  <Type className="h-4 w-4" />
                  Add Text
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => addElement("shape")}
                >
                  <Square className="h-4 w-4" />
                  Add Shape
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => addElement("image")}
                >
                  <ImageIcon className="h-4 w-4" />
                  Add Image
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Canvas Info */}
        <div className="absolute bottom-4 right-4 bg-black/20 text-white text-xs px-2 py-1 rounded">
          1920×1080
        </div>
      </motion.div>

      {/* Scene Content Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Type className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm mb-2">Scene Script</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {activeScene.content}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}