"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Menu,
  ChevronDown,
  User,
  Type,
  Image as ImageIcon,
  Shapes,
  MessageSquare,
  Bot,
  Layers,
  Eye,
  Sparkles,
  LayoutGrid,
  Palette,
  Pencil
} from "lucide-react";
import { RightPanelType } from "@/types";

interface TopToolbarProps {
  selectedTool: string | null;
  onToolSelect: (tool: string | null) => void;
  rightPanel: RightPanelType;
  onRightPanelChange: (panel: RightPanelType) => void;
  annotationMode: boolean;
  onAnnotationModeToggle: () => void;
}

const tools = [
  { id: "layout", label: "Layout", icon: LayoutGrid },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "annotations", label: "Annotate", icon: Pencil },
  { id: "avatars", label: "Avatars", icon: User },
  { id: "text", label: "Text", icon: Type },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "elements", label: "Elements", icon: Shapes },
];

export function TopToolbar({
  selectedTool,
  onToolSelect,
  rightPanel,
  onRightPanelChange,
  annotationMode,
  onAnnotationModeToggle,
}: TopToolbarProps) {
  const handleToolClick = (toolId: string) => {
    if (toolId === "layout") {
      onRightPanelChange(rightPanel === "layout" ? null : "layout");
    } else if (toolId === "theme") {
      onRightPanelChange(rightPanel === "theme" ? null : "theme");
    } else if (toolId === "annotations") {
      onAnnotationModeToggle();
    } else {
      onToolSelect(selectedTool === toolId ? null : toolId);
    }
  };

  const isToolActive = (toolId: string) => {
    if (toolId === "layout") return rightPanel === "layout";
    if (toolId === "theme") return rightPanel === "theme";
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
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Button>
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
          <span className="text-sm font-medium">Untitled Video</span>
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
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        <Button className="gap-2 bg-foreground text-background hover:bg-foreground/90">
          <Sparkles className="h-4 w-4" />
          Generate
        </Button>
      </div>
    </motion.div>
  );
}