"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  User,
  Volume2,
  Pause,
  Mic,
  Bot,
  Edit,
  Trash2,
  GripVertical
} from "lucide-react";

import { Scene, Theme } from "@/types";
import { parseScriptToLayout } from "@/lib/layouts";

interface LeftSidebarProps {
  scenes: Scene[];
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  activeSceneId: string;
  setActiveSceneId: (id: string) => void;
  currentTheme: Theme;
}

export function LeftSidebar({
  scenes,
  setScenes,
  activeSceneId,
  setActiveSceneId,
  currentTheme,
}: LeftSidebarProps) {
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);

  const addScene = () => {
    const content = "Type your script or use '/' for commands";
    const newScene: Scene = {
      id: Date.now().toString(),
      content,
      duration: 5,
      layout: "titleBody",
      layoutContent: parseScriptToLayout(content, "titleBody"),
      annotations: [],
    };
    setScenes([...scenes, newScene]);
    setActiveSceneId(newScene.id);
    setEditingSceneId(newScene.id);
  };

  const generateSceneWithAI = async () => {
    const content = "AI is generating your scene content...";
    const newScene: Scene = {
      id: Date.now().toString(),
      content,
      duration: 5,
      layout: "titleBody",
      layoutContent: parseScriptToLayout(content, "titleBody"),
      annotations: [],
    };
    setScenes([...scenes, newScene]);
    setActiveSceneId(newScene.id);

    // Simulate AI generation
    setTimeout(() => {
      const aiGeneratedContent = "Welcome to our innovative platform! We're excited to showcase how AI can transform your creative workflow and help you produce stunning content in minutes.";
      setScenes((prev: Scene[]) =>
        prev.map(s =>
          s.id === newScene.id
            ? {
                ...s,
                content: aiGeneratedContent,
                layoutContent: parseScriptToLayout(aiGeneratedContent, s.layout),
              }
            : s
        )
      );
    }, 2000);
  };

  const updateSceneContent = (sceneId: string, content: string) => {
    setScenes(
      scenes.map(s =>
        s.id === sceneId
          ? {
              ...s,
              content,
              layoutContent: parseScriptToLayout(content, s.layout, s.layoutContent),
            }
          : s
      )
    );
  };

  const deleteScene = (sceneId: string) => {
    const newScenes = scenes.filter(s => s.id !== sceneId);
    setScenes(newScenes);
    if (activeSceneId === sceneId && newScenes.length > 0) {
      setActiveSceneId(newScenes[0].id);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-bold">
            1
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">Annie - Lifelike</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto h-6 w-6">
            <Edit className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2">
          <Button
            onClick={addScene}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground gap-2"
          >
            <Plus className="h-4 w-4" />
            Scene
          </Button>
          <Button
            onClick={generateSceneWithAI}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground gap-2"
          >
            <Bot className="h-4 w-4" />
            AI Generate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground gap-2"
          >
            <Volume2 className="h-4 w-4" />
            Audio
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground gap-2"
          >
            <Pause className="h-4 w-4" />
            Pause
          </Button>
        </div>

        <Separator className="my-3" />

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground gap-2"
        >
          <Mic className="h-4 w-4" />
          Voice Director
        </Button>
      </div>

      {/* Scenes List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {scenes.map((scene, index) => (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className={`p-3 cursor-pointer transition-all duration-200 group ${
                  activeSceneId === scene.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                }`}
                onClick={() => setActiveSceneId(scene.id)}
              >
                <div className="flex items-start gap-2">
                  <div className="flex items-center gap-1 mt-1">
                    <GripVertical className="h-3 w-3 text-muted-foreground/50" />
                    <div className="w-5 h-5 bg-muted rounded text-xs flex items-center justify-center text-muted-foreground">
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingSceneId === scene.id ? (
                      <Textarea
                        value={scene.content}
                        onChange={(e) => updateSceneContent(scene.id, e.target.value)}
                        onBlur={() => setEditingSceneId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.ctrlKey) {
                            setEditingSceneId(null);
                          }
                        }}
                        className="min-h-[60px] text-sm resize-none"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="text-sm text-foreground leading-relaxed cursor-text"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSceneId(scene.id);
                        }}
                      >
                        {scene.content}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{scene.duration}s</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSceneId(scene.id);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {scenes.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteScene(scene.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}