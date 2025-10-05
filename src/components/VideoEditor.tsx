"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { TopToolbar } from "./TopToolbar";
import { LeftSidebar } from "./LeftSidebar";
import { VideoCanvas } from "./VideoCanvas";
import { TimelinePanel } from "./TimelinePanel";
import { LayoutPanel } from "./panels/LayoutPanel";
import { ThemePanel } from "./panels/ThemePanel";
import { ImageUploadPanel } from "./panels/ImageUploadPanel";
import { ChartsPanel } from "./panels/ChartsPanel";
import { VideoPreviewPanel } from "./panels/VideoPreviewPanel";
import { VideoSettingsPanel } from "./panels/VideoSettingsPanel";
import { ExportProgressModal } from "./panels/ExportProgressModal";
import { Scene, RightPanelType, Theme, LayoutType, ChartData } from "@/types";
import { themePresets, mergeTheme } from "@/lib/themes";
import { parseScriptToLayout, preserveContentOnLayoutChange } from "@/lib/layouts";
import { getProject, updateProject, type VideoProjectWithScenes } from "@/app/actions/projects";
import { updateScene } from "@/app/actions/scenes";
import type { Scene as PrismaScene, Prisma } from "@prisma/client";
import type { TransitionType, TransitionDirection, CaptionSettings } from "./panels/VideoSettingsPanel";

interface VideoSettings {
  captions: CaptionSettings;
  transitionType: TransitionType;
  transitionDirection: TransitionDirection;
  slideAnimations: boolean;
  animationStyle: "fade" | "slide" | "zoom" | "none";
}

interface AudioSettings {
  voice: string;
  speed: number;
  pitch: number;
}

interface VideoEditorProps {
  projectId: string;
}

export function VideoEditor({ projectId }: VideoEditorProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<RightPanelType>(null);
  const [annotationMode, setAnnotationMode] = useState(false);
  const [activeTheme, setActiveTheme] = useState<Theme>(themePresets[0]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<string>("");
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [project, setProject] = useState<VideoProjectWithScenes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<"bundling" | "rendering" | "success" | "error" | null>(null);
  const [exportError, setExportError] = useState<string>("");
  const [exportVideoUrl, setExportVideoUrl] = useState<string>("");

  // Video and Audio Settings
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    captions: {
      enabled: true,
      style: "word-by-word",
      position: "bottom",
      maxLines: 2,
      highlightColor: "#ff7900",
    },
    transitionType: "fade",
    transitionDirection: "from-right",
    slideAnimations: true,
    animationStyle: "fade",
  });

  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    voice: "alloy",
    speed: 1.0,
    pitch: 1.0,
  });

  // Load project on mount
  useEffect(() => {
    async function initializeProject() {
      try {
        const loadedProject = await getProject(projectId);

        if (!loadedProject) {
          // Project not found, redirect to home
          window.location.href = "/";
          return;
        }

        // Convert Prisma scenes to Scene type
        const convertedScenes: Scene[] = loadedProject.scenes.map((s) => ({
          id: s.id,
          content: s.content,
          duration: s.duration,
          layout: s.layout as LayoutType,
          layoutContent: s.layoutContent as unknown as Scene["layoutContent"],
          annotations: (s.annotations as unknown as Scene["annotations"]) || [],
          themeOverride: s.themeOverride as unknown as Partial<Theme> | undefined,
        }));

        setProject(loadedProject);
        setScenes(convertedScenes);
        setActiveSceneId(convertedScenes[0]?.id || "");

        // Load theme from project or use default
        if (loadedProject.theme) {
          try {
            const dbTheme = loadedProject.theme as unknown as Theme;
            // Merge with default theme to ensure all properties exist
            setActiveTheme(mergeTheme(themePresets[0], dbTheme as Partial<Theme>));
          } catch (error) {
            console.error("Failed to load theme from database, using default:", error);
            setActiveTheme(themePresets[0]);
          }
        }

        // Load video settings from project
        if (loadedProject.videoSettings) {
          try {
            const dbVideoSettings = loadedProject.videoSettings as unknown as VideoSettings;
            setVideoSettings(dbVideoSettings);
          } catch (error) {
            console.error("Failed to load video settings:", error);
          }
        }

        // Load audio settings from project
        if (loadedProject.audioSettings) {
          try {
            const dbAudioSettings = loadedProject.audioSettings as unknown as AudioSettings;
            setAudioSettings(dbAudioSettings);
            setSelectedVoice(dbAudioSettings.voice);
          } catch (error) {
            console.error("Failed to load audio settings:", error);
          }
        }
      } catch (error) {
        console.error("Failed to initialize project:", error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeProject();
  }, [projectId]);

  const activeScene = scenes.find((s) => s.id === activeSceneId);

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  // Handle layout change
  const handleLayoutChange = (layout: LayoutType) => {
    if (!activeScene) return;

    const preservedContent = preserveContentOnLayoutChange(activeScene.layoutContent, layout);
    const newContent = parseScriptToLayout(activeScene.content, layout, preservedContent);

    // Update local state immediately
    setScenes((prev) =>
      prev.map((s) =>
        s.id === activeSceneId
          ? { ...s, layout, layoutContent: newContent }
          : s
      )
    );

    // Save to database
    startTransition(async () => {
      try {
        await updateScene(activeSceneId, {
          layout,
          layoutContent: newContent as Prisma.InputJsonValue,
        });
      } catch (error) {
        console.error("Failed to update scene layout:", error);
      }
    });
  };

  // Handle theme change
  const handleThemeChange = (theme: Theme, applyToAll: boolean) => {
    if (applyToAll) {
      setActiveTheme(theme);
      setScenes((prev) => prev.map((s) => ({ ...s, themeOverride: undefined })));

      // Save to database
      startTransition(async () => {
        if (!project) return;
        try {
          await updateProject(project.id, { theme: theme as Prisma.InputJsonValue });
          // Clear all scene theme overrides
          for (const scene of scenes) {
            await updateScene(scene.id, { themeOverride: undefined });
          }
        } catch (error) {
          console.error("Failed to update theme:", error);
        }
      });
    } else {
      // Apply to current scene only
      setScenes((prev) =>
        prev.map((s) =>
          s.id === activeSceneId ? { ...s, themeOverride: theme } : s
        )
      );

      // Save to database
      startTransition(async () => {
        try {
          await updateScene(activeSceneId, { themeOverride: theme as Prisma.InputJsonValue });
        } catch (error) {
          console.error("Failed to update scene theme:", error);
        }
      });
    }
  };

  // Handle scene update
  const handleSceneUpdate = (updatedScene: Scene) => {
    setScenes((prev) => prev.map((s) => (s.id === activeSceneId ? updatedScene : s)));

    // Save to database
    startTransition(async () => {
      try {
        await updateScene(updatedScene.id, {
          content: updatedScene.content,
          duration: updatedScene.duration,
          layoutContent: updatedScene.layoutContent as Prisma.InputJsonValue,
          annotations: updatedScene.annotations as Prisma.InputJsonValue,
        });
      } catch (error) {
        console.error("Failed to update scene:", error);
      }
    });
  };

  // Handle image upload/selection
  const handleImageSelect = (url: string) => {
    if (!activeScene) return;

    setScenes((prev) =>
      prev.map((s) =>
        s.id === activeSceneId
          ? {
              ...s,
              imageUrl: url,
              layoutContent: { ...s.layoutContent, imageUrl: url },
            }
          : s
      )
    );

    // Save to database
    startTransition(async () => {
      try {
        await updateScene(activeSceneId, {
          imageUrl: url,
          layoutContent: { ...activeScene.layoutContent, imageUrl: url } as Prisma.InputJsonValue,
        });
      } catch (error) {
        console.error("Failed to update scene image:", error);
      }
    });
  };

  // Handle chart insertion
  const handleChartInsert = (chartData: ChartData) => {
    if (!activeScene) return;

    // Check if current layout supports images/charts
    const imageLayouts: LayoutType[] = ["imageLeft", "imageRight", "imageBullets", "fullImage", "centeredChart", "comparison"];
    const needsLayoutChange = !imageLayouts.includes(activeScene.layout);

    const newLayout = needsLayoutChange ? "centeredChart" : activeScene.layout;
    const newLayoutContent = {
      ...activeScene.layoutContent,
      chartData,
      imageUrl: undefined,
    };

    setScenes((prev) =>
      prev.map((s) =>
        s.id === activeSceneId
          ? {
              ...s,
              layout: newLayout,
              layoutContent: newLayoutContent,
            }
          : s
      )
    );

    // Save to database
    startTransition(async () => {
      try {
        await updateScene(activeSceneId, {
          layout: newLayout,
          layoutContent: newLayoutContent as Prisma.InputJsonValue,
        });
      } catch (error) {
        console.error("Failed to update scene with chart:", error);
      }
    });
  };

  // Handle project title update
  const handleTitleUpdate = (newTitle: string) => {
    if (!project) return;

    setProject({ ...project, title: newTitle });

    startTransition(async () => {
      try {
        await updateProject(project.id, { title: newTitle });
      } catch (error) {
        console.error("Failed to update project title:", error);
      }
    });
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
        projectTitle={project?.title || "Untitled Video"}
        onTitleUpdate={handleTitleUpdate}
        onPreview={() => setShowVideoPreview(true)}
        onExport={() => setRightPanel("videoSettings")}
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
            projectId={project?.id || ""}
            onVoiceChange={setSelectedVoice}
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
          {rightPanel === "imageUpload" && activeScene && (
            <ImageUploadPanel
              onClose={() => setRightPanel(null)}
              onImageSelect={handleImageSelect}
              imageBleed={activeScene.layoutContent.imageBleed || false}
              onImageBleedChange={(bleed) => {
                console.log('🔄 Updating image bleed:', bleed);
                const updatedLayoutContent = { ...activeScene.layoutContent, imageBleed: bleed };

                setScenes((prev) =>
                  prev.map((s) =>
                    s.id === activeSceneId
                      ? { ...s, layoutContent: updatedLayoutContent }
                      : s
                  )
                );

                // Also save to database
                startTransition(async () => {
                  try {
                    console.log('💾 Saving to database:', { sceneId: activeSceneId, layoutContent: updatedLayoutContent });
                    await updateScene(activeSceneId, {
                      layoutContent: updatedLayoutContent as Prisma.InputJsonValue,
                    });
                    toast.success(bleed ? "Image bleed enabled" : "Image bleed disabled");
                  } catch (error) {
                    console.error("Failed to update image bleed:", error);
                    toast.error("Failed to save changes");
                  }
                });
              }}
            />
          )}
          {rightPanel === "charts" && (
            <ChartsPanel
              onClose={() => setRightPanel(null)}
              onChartInsert={handleChartInsert}
              currentTheme={activeScene?.themeOverride ? mergeTheme(activeTheme, activeScene.themeOverride) : activeTheme}
            />
          )}
          {rightPanel === "videoSettings" && (
            <VideoSettingsPanel
              onClose={() => setRightPanel(null)}
              isExporting={isExporting}
              onExport={async (newVideoSettings, newAudioSettings) => {
                try {
                  setIsExporting(true);
                  setExportStatus("bundling");
                  setExportError("");

                  // Store settings in state
                  setVideoSettings(newVideoSettings);
                  setAudioSettings(newAudioSettings);

                  // Close the settings panel
                  setRightPanel(null);

                  // First, prepare all assets (convert data URLs to files)
                  const { prepareVideoAssets } = await import("@/lib/assetPreparation");

                  let preparedScenes = scenes;
                  try {
                    preparedScenes = await prepareVideoAssets(scenes, (progress) => {
                      console.log("Asset preparation progress:", progress);
                    }, newAudioSettings.voice);
                  } catch (error) {
                    console.error("Failed to prepare assets:", error);
                  }

                  // Show rendering status
                  setExportStatus("rendering");

                  const response = await fetch("/api/export-video", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      scenes: preparedScenes,
                      theme: activeTheme,
                      videoSettings: newVideoSettings,
                      audioSettings: newAudioSettings,
                    }),
                  });

                  const data = await response.json();

                  if (response.ok && data.success && data.videoUrl) {
                    setExportStatus("success");
                    setExportVideoUrl(data.videoUrl);
                    console.log("Export response:", data);
                  } else {
                    setExportStatus("error");
                    setExportError(data.error || "Failed to export video");
                  }
                } catch (error) {
                  console.error("Export error:", error);
                  setExportStatus("error");
                  setExportError(error instanceof Error ? error.message : "Failed to export video");
                } finally {
                  setIsExporting(false);
                }
              }}
              onPreview={(newVideoSettings, newAudioSettings) => {
                // Store settings in state
                setVideoSettings(newVideoSettings);
                setAudioSettings(newAudioSettings);

                // Save settings to database
                if (project) {
                  startTransition(async () => {
                    try {
                      await updateProject(project.id, {
                        videoSettings: newVideoSettings as Prisma.InputJsonValue,
                        audioSettings: newAudioSettings as Prisma.InputJsonValue,
                      });
                      console.log("Settings saved to database");
                    } catch (error) {
                      console.error("Failed to save settings:", error);
                    }
                  });
                }

                setShowVideoPreview(true);
                setRightPanel(null); // Close settings panel
              }}
              initialVoice={audioSettings.voice}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Video Preview Panel */}
      {showVideoPreview && (
        <VideoPreviewPanel
          scenes={scenes}
          theme={activeTheme}
          voice={audioSettings.voice}
          videoSettings={videoSettings}
          onClose={() => setShowVideoPreview(false)}
          onScenesUpdate={(updatedScenes) => {
            // Update local state with prepared scenes (includes audio URLs)
            setScenes(updatedScenes);
          }}
        />
      )}

      {/* Export Progress Modal */}
      {exportStatus && (
        <ExportProgressModal
          status={exportStatus}
          error={exportError}
          onClose={() => {
            setExportStatus(null);
            setExportError("");
            setExportVideoUrl("");
          }}
          onDownload={exportStatus === "success" && exportVideoUrl ? () => {
            const link = document.createElement('a');
            link.href = exportVideoUrl;
            link.download = `video-${Date.now()}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setExportStatus(null);
          } : undefined}
        />
      )}
    </div>
  );
}
