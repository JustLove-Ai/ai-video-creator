"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  ChevronUp,
  ChevronDown,
  AlertTriangle
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
  style: Record<string, unknown>;
  animation: Record<string, unknown>;
}

interface Scene {
  id: string;
  content: string;
  duration: number;
  elements: CanvasElement[];
}

interface TimelinePanelProps {
  scenes: Scene[];
  activeSceneId: string;
  setActiveSceneId: (id: string) => void;
}

export function TimelinePanel({ scenes, activeSceneId, setActiveSceneId }: TimelinePanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const totalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getSceneStartTime = (sceneId: string) => {
    let startTime = 0;
    for (const scene of scenes) {
      if (scene.id === sceneId) break;
      startTime += scene.duration;
    }
    return startTime;
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      className="bg-card border-t border-border"
      animate={{ height: isExpanded ? "240px" : "120px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Timeline Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
          <span className="text-sm font-medium">Timeline</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="h-16 flex items-center justify-center gap-4 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayback}
          className="h-10 w-10 bg-primary/10 hover:bg-primary/20"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Square className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <SkipForward className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2" />

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
          <div className="w-32 h-1 bg-muted rounded-full relative">
            <motion.div
              className="h-full bg-primary rounded-full"
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{formatTime(totalDuration)}</span>
        </div>

        <Separator orientation="vertical" className="h-6 mx-2" />

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Timeline Track */}
      <div className="flex-1 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">
            1
          </div>
          <span className="text-sm font-medium">Scene Track</span>
        </div>

        {/* Scene Blocks */}
        <div className="relative h-12 bg-muted/30 rounded overflow-hidden">
          {scenes.map((scene, index) => {
            const startPercentage = (getSceneStartTime(scene.id) / totalDuration) * 100;
            const widthPercentage = (scene.duration / totalDuration) * 100;
            const isActive = scene.id === activeSceneId;

            return (
              <motion.div
                key={scene.id}
                className={`absolute top-1 bottom-1 cursor-pointer rounded border-2 transition-all duration-200 ${
                  isActive
                    ? "bg-primary border-primary shadow-md"
                    : "bg-card border-border hover:border-primary/50"
                }`}
                style={{
                  left: `${startPercentage}%`,
                  width: `${widthPercentage}%`,
                }}
                onClick={() => setActiveSceneId(scene.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="h-full flex items-center justify-between px-2">
                  <div className="text-xs font-medium text-foreground/80 truncate">
                    Scene {index + 1}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {scene.duration}s
                  </div>
                </div>

                {/* Scene Content Preview */}
                {isExpanded && (
                  <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-card border border-border rounded shadow-sm z-10">
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {scene.content}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Playhead */}
          <motion.div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
            style={{ left: `${(currentTime / totalDuration) * 100}%` }}
            animate={{ opacity: isPlaying ? [1, 0.5, 1] : 1 }}
            transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
          />
        </div>

        {/* No Script Warning */}
        {scenes.some(scene => !scene.content || scene.content.includes("Type your script")) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 text-orange-600 text-xs"
          >
            <AlertTriangle className="h-3 w-3" />
            <span>No script</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}