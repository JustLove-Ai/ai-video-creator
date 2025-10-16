"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Menu,
  ChevronDown,
  User,
  Image as ImageIcon,
  Video,
  Eye,
  Download,
  LayoutGrid,
  Palette,
  Pencil,
  BarChart3,
  Save,
  Sparkles,
  Wand2,
  Zap,
  Wand
} from "lucide-react";
import { RightPanelType } from "@/types";

interface TopToolbarProps {
  selectedTool: string | null;
  onToolSelect: (tool: string | null) => void;
  rightPanel: RightPanelType;
  onRightPanelChange: (panel: RightPanelType) => void;
  annotationMode: boolean;
  onAnnotationModeToggle: () => void;
  projectTitle: string;
  onTitleUpdate: (newTitle: string) => void;
  onSave: () => void;
  onPreview: () => void;
  onExport: () => void;
  onBeautify: () => void;
}

const tools = [
  { id: "layout", label: "Layout", icon: LayoutGrid },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "animation", label: "Animation", icon: Zap },
  { id: "beautify", label: "Beautify", icon: Wand2 },
  { id: "annotations", label: "Annotate", icon: Pencil },
  { id: "avatars", label: "Avatars", icon: User },
  { id: "charts", label: "Charts", icon: BarChart3 },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "video", label: "Video", icon: Video },
];

export function TopToolbar({
  selectedTool,
  onToolSelect,
  rightPanel,
  onRightPanelChange,
  annotationMode,
  onAnnotationModeToggle,
  projectTitle,
  onTitleUpdate,
  onSave,
  onPreview,
  onExport,
  onBeautify,
}: TopToolbarProps) {
  const [videoTitle, setVideoTitle] = useState(projectTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Update local state when prop changes
  useEffect(() => {
    setVideoTitle(projectTitle);
  }, [projectTitle]);

  const handleToolClick = (toolId: string) => {
    if (toolId === "layout") {
      onRightPanelChange(rightPanel === "layout" ? null : "layout");
    } else if (toolId === "theme") {
      onRightPanelChange(rightPanel === "theme" ? null : "theme");
    } else if (toolId === "animation") {
      onRightPanelChange(rightPanel === "animation" ? null : "animation");
    } else if (toolId === "beautify") {
      onBeautify();
    } else if (toolId === "charts") {
      onRightPanelChange(rightPanel === "charts" ? null : "charts");
    } else if (toolId === "media") {
      onRightPanelChange(rightPanel === "imageUpload" ? null : "imageUpload");
    } else if (toolId === "video") {
      onRightPanelChange(rightPanel === "videoSettings" ? null : "videoSettings");
    } else if (toolId === "annotations") {
      onAnnotationModeToggle();
    } else {
      onToolSelect(selectedTool === toolId ? null : toolId);
    }
  };

  const isToolActive = (toolId: string) => {
    if (toolId === "layout") return rightPanel === "layout";
    if (toolId === "theme") return rightPanel === "theme";
    if (toolId === "animation") return rightPanel === "animation";
    if (toolId === "charts") return rightPanel === "charts";
    if (toolId === "media") return rightPanel === "imageUpload";
    if (toolId === "video") return rightPanel === "videoSettings";
    if (toolId === "annotations") return annotationMode;
    return selectedTool === toolId;
  };

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-16 bg-card border-b border-border flex items-center px-4 justify-between"
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-muted-foreground">16:9</div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-sm flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          {isEditingTitle ? (
            <Input
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                if (videoTitle.trim() && videoTitle !== projectTitle) {
                  onTitleUpdate(videoTitle);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditingTitle(false);
                  if (videoTitle.trim() && videoTitle !== projectTitle) {
                    onTitleUpdate(videoTitle);
                  }
                } else if (e.key === "Escape") {
                  setVideoTitle(projectTitle);
                  setIsEditingTitle(false);
                }
              }}
              className="h-7 w-40 text-sm font-medium focus-visible:border-border focus-visible:ring-muted"
              autoFocus
            />
          ) : (
            <span
              className="text-sm font-medium cursor-pointer hover:text-muted-foreground transition-colors"
              onClick={() => setIsEditingTitle(true)}
            >
              {videoTitle}
            </span>
          )}
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          Feedback
        </Button>
      </div>

      {/* Center Section - Tools */}
      <TooltipProvider>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = isToolActive(tool.id);

            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isSelected ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleToolClick(tool.id)}
                    className={`flex flex-col items-center gap-1 h-12 min-w-16 text-xs ${
                      isSelected
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] leading-none">{tool.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <Separator orientation="vertical" className="h-6" />
        <Button variant="outline" size="sm" className="gap-2" onClick={onSave}>
          <Save className="h-4 w-4" />
          Save
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={onPreview}>
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        <Button
          className="gap-2 text-white hover:opacity-90"
          style={{ backgroundColor: '#ff7900' }}
          onClick={onExport}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </motion.div>
  );
}