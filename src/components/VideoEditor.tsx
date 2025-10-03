"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopToolbar } from "./TopToolbar";
import { LeftSidebar } from "./LeftSidebar";
import { VideoCanvas } from "./VideoCanvas";
import { TimelinePanel } from "./TimelinePanel";
import { LayoutPanel } from "./panels/LayoutPanel";
import { ThemePanel } from "./panels/ThemePanel";
import { ImageUploadPanel } from "./panels/ImageUploadPanel";
import { ChartsPanel } from "./panels/ChartsPanel";
import { Scene, RightPanelType, Theme, LayoutType, ChartData } from "@/types";
import { themePresets, mergeTheme } from "@/lib/themes";
import { parseScriptToLayout, preserveContentOnLayoutChange } from "@/lib/layouts";

export function VideoEditor() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<RightPanelType>(null);
  const [annotationMode, setAnnotationMode] = useState(false);
  const [activeTheme, setActiveTheme] = useState<Theme>(themePresets[0]); // Light Minimalist
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: "1",
      content: "Welcome to our presentation! Today we'll explore the amazing world of AI-generated content.",
      duration: 5,
      layout: "cover",
      layoutContent: {
        title: "Welcome to our presentation!",
        subtitle: "Today we'll explore the amazing world of AI-generated content.",
      },
      annotations: [],
    },
  ]);
  const [activeSceneId, setActiveSceneId] = useState("1");
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);

  const activeScene = scenes.find((s) => s.id === activeSceneId);

  // Handle layout change
  const handleLayoutChange = (layout: LayoutType) => {
    if (!activeScene) return;

    const preservedContent = preserveContentOnLayoutChange(activeScene.layoutContent, layout);
    const newContent = parseScriptToLayout(activeScene.content, layout, preservedContent);

    setScenes((prev) =>
      prev.map((s) =>
        s.id === activeSceneId
          ? { ...s, layout, layoutContent: newContent }
          : s
      )
    );
  };

  // Handle theme change
  const handleThemeChange = (theme: Theme, applyToAll: boolean) => {
    if (applyToAll) {
      setActiveTheme(theme);
      // Remove all per-scene overrides
      setScenes((prev) => prev.map((s) => ({ ...s, themeOverride: undefined })));
    } else {
      // Apply to current scene only
      setScenes((prev) =>
        prev.map((s) =>
          s.id === activeSceneId ? { ...s, themeOverride: theme } : s
        )
      );
    }
  };

  // Handle scene update
  const handleSceneUpdate = (updatedScene: Scene) => {
    setScenes((prev) => prev.map((s) => (s.id === activeSceneId ? updatedScene : s)));
  };

  // Handle image upload/selection
  const handleImageSelect = (url: string) => {
    if (!activeScene) return;

    setScenes((prev) =>
      prev.map((s) =>
        s.id === activeSceneId
          ? {
              ...s,
              layoutContent: { ...s.layoutContent, imageUrl: url },
            }
          : s
      )
    );
  };

  // Handle chart insertion
  const handleChartInsert = (chartData: ChartData) => {
    if (!activeScene) return;

    // Check if current layout supports images/charts
    const imageLayouts: LayoutType[] = ["imageLeft", "imageRight", "imageBullets", "fullImage", "centeredChart", "comparison"];
    const needsLayoutChange = !imageLayouts.includes(activeScene.layout);

    setScenes((prev) =>
      prev.map((s) =>
        s.id === activeSceneId
          ? {
              ...s,
              layout: needsLayoutChange ? "centeredChart" : s.layout,
              layoutContent: {
                ...s.layoutContent,
                chartData,
                // Remove imageUrl when adding chart
                imageUrl: undefined,
              },
            }
          : s
      )
    );
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <TopToolbar
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        rightPanel={rightPanel}
        onRightPanelChange={setRightPanel}
        annotationMode={annotationMode}
        onAnnotationModeToggle={() => setAnnotationMode(!annotationMode)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Scene Management */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-80 bg-card border-r border-border flex flex-col overflow-hidden"
        >
          <LeftSidebar
            scenes={scenes}
            setScenes={setScenes}
            activeSceneId={activeSceneId}
            setActiveSceneId={setActiveSceneId}
            currentTheme={activeTheme}
          />
        </motion.div>

        {/* Main Canvas Area */}
        <motion.div
          className="flex-1 flex flex-col bg-muted/20 overflow-hidden"
          animate={{
            marginRight: rightPanel ? 360 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="flex-1 p-8 flex items-center justify-center"
          >
            <VideoCanvas
              activeScene={activeScene}
              activeTheme={activeTheme}
              selectedTool={selectedTool}
              annotationMode={annotationMode}
              onSceneUpdate={handleSceneUpdate}
              onImageReplace={() => setRightPanel("imageUpload")}
              onChartAdd={() => setRightPanel("charts")}
              isTimelineExpanded={isTimelineExpanded}
            />
          </motion.div>

          {/* Timeline at Bottom */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
            className="flex-shrink-0"
          >
            <TimelinePanel
              scenes={scenes}
              activeSceneId={activeSceneId}
              setActiveSceneId={setActiveSceneId}
              isExpanded={isTimelineExpanded}
              setIsExpanded={setIsTimelineExpanded}
            />
          </motion.div>
        </motion.div>

        {/* Right Panels */}
        <AnimatePresence>
          {rightPanel === "layout" && activeScene && (
            <LayoutPanel
              currentLayout={activeScene.layout}
              currentContent={activeScene.layoutContent}
              onLayoutSelect={handleLayoutChange}
              onContentChange={(content) => {
                setScenes((prev) =>
                  prev.map((s) =>
                    s.id === activeSceneId ? { ...s, layoutContent: content } : s
                  )
                );
              }}
              onClose={() => setRightPanel(null)}
            />
          )}
          {rightPanel === "theme" && (
            <ThemePanel
              currentTheme={activeScene?.themeOverride ? mergeTheme(activeTheme, activeScene.themeOverride) : activeTheme}
              onThemeChange={handleThemeChange}
              onClose={() => setRightPanel(null)}
            />
          )}
          {rightPanel === "imageUpload" && (
            <ImageUploadPanel
              onClose={() => setRightPanel(null)}
              onImageSelect={handleImageSelect}
            />
          )}
          {rightPanel === "charts" && (
            <ChartsPanel
              onClose={() => setRightPanel(null)}
              onChartInsert={handleChartInsert}
              currentTheme={activeScene?.themeOverride ? mergeTheme(activeTheme, activeScene.themeOverride) : activeTheme}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
