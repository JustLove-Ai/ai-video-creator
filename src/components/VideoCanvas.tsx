"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Type } from "lucide-react";
import { Scene, Theme, AnnotationType } from "@/types";
import { LayoutRenderer } from "@/components/canvas/LayoutRenderer";
import { AnnotationLayer } from "@/components/canvas/AnnotationLayer";
import { AnnotationToolbar } from "@/components/panels/AnnotationToolbar";
import { mergeTheme } from "@/lib/themes";

interface VideoCanvasProps {
  activeScene?: Scene;
  activeTheme: Theme;
  selectedTool: string | null;
  annotationMode: boolean;
  onSceneUpdate: (scene: Scene) => void;
  onImageReplace: () => void;
  onChartAdd: () => void;
  isTimelineExpanded?: boolean;
  animationKey?: number; // Key to force animation replay
}

export function VideoCanvas({
  activeScene,
  activeTheme,
  selectedTool,
  annotationMode,
  onSceneUpdate,
  onImageReplace,
  onChartAdd,
  isTimelineExpanded = false,
  animationKey = 0,
}: VideoCanvasProps) {
  const [annotationTool, setAnnotationTool] = useState<AnnotationType | null>(null);
  const [annotationColor, setAnnotationColor] = useState("#000000");
  const [annotationStrokeWidth, setAnnotationStrokeWidth] = useState(4);

  if (!activeScene) {
    return (
      <div className="w-full max-w-6xl aspect-video bg-white rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-gray-400 text-lg">No scene selected</div>
      </div>
    );
  }

  // Merge global theme with per-scene override
  const effectiveTheme = mergeTheme(activeTheme, activeScene.themeOverride);

  const handleContentChange = (layoutContent: Scene["layoutContent"]) => {
    onSceneUpdate({ ...activeScene, layoutContent });
  };

  const handleAnnotationsChange = (annotations: Scene["annotations"]) => {
    onSceneUpdate({ ...activeScene, annotations });
  };

  return (
    <div className="w-full max-w-6xl">
      {/* Canvas */}
      <motion.div
        className="w-full aspect-video rounded-lg shadow-lg relative overflow-hidden"
        whileHover={{ scale: annotationMode ? 1 : 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Layout Content */}
        <LayoutRenderer
          key={animationKey} // Force re-render to replay animations
          layoutType={activeScene.layout}
          content={activeScene.layoutContent}
          theme={effectiveTheme}
          onContentChange={handleContentChange}
          onImageReplace={onImageReplace}
          onChartAdd={onChartAdd}
          animationConfig={activeScene.animationConfig}
        />

        {/* Annotation Layer (always visible if annotations exist, interactive only in annotation mode) */}
        <AnnotationLayer
          annotations={activeScene.annotations}
          activeTool={annotationMode ? annotationTool : null}
          currentColor={annotationColor}
          currentStrokeWidth={annotationStrokeWidth}
          onAnnotationsChange={handleAnnotationsChange}
        />

        {/* Annotation Toolbar (only visible in annotation mode) */}
        {annotationMode && (
          <AnnotationToolbar
            activeTool={annotationTool}
            onToolChange={setAnnotationTool}
            currentColor={annotationColor}
            onColorChange={setAnnotationColor}
            currentStrokeWidth={annotationStrokeWidth}
            onStrokeWidthChange={setAnnotationStrokeWidth}
          />
        )}

        {/* Canvas Info */}
        <div className="absolute bottom-4 right-4 bg-black/20 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          1920×1080
        </div>
      </motion.div>

      {/* Scene Content Display */}
      {!isTimelineExpanded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
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
      )}
    </div>
  );
}
