"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Bot,
  Trash2,
  GripVertical,
  ChevronDown,
  Volume2,
  Edit,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Scene, Theme, LayoutType } from "@/types";
import { parseScriptToLayout } from "@/lib/layouts";
import { YOUTUBE_SCRIPT_PROMPT, AI_GENERATION_SYSTEM_PROMPT } from "@/lib/constants";

interface LeftSidebarProps {
  scenes: Scene[];
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  activeSceneId: string;
  setActiveSceneId: (id: string) => void;
  currentTheme: Theme;
}

// OpenAI TTS Voices
const OPENAI_VOICES = [
  { id: "alloy", name: "Alloy", description: "Neutral and balanced" },
  { id: "echo", name: "Echo", description: "Warm and engaging" },
  { id: "fable", name: "Fable", description: "Expressive and dynamic" },
  { id: "onyx", name: "Onyx", description: "Deep and authoritative" },
  { id: "nova", name: "Nova", description: "Energetic and upbeat" },
  { id: "shimmer", name: "Shimmer", description: "Soft and soothing" },
];

export function LeftSidebar({
  scenes,
  setScenes,
  activeSceneId,
  setActiveSceneId,
  currentTheme,
}: LeftSidebarProps) {
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(OPENAI_VOICES[0]);
  const [aiPromptSceneId, setAiPromptSceneId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null);
  const [showTopicInput, setShowTopicInput] = useState(false);
  const [scriptTopic, setScriptTopic] = useState<string>("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

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

  const generateScriptWithAI = async () => {
    if (!scriptTopic.trim()) return;

    setIsGeneratingScript(true);

    try {
      // TODO: Replace with actual API call to OpenAI or Claude
      // For now, simulating with mock data
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock AI response - this would come from the API
      const mockScriptSlides = [
        {
          section: "HOOK",
          layout: "cover" as LayoutType,
          narration: `You know that feeling when ${scriptTopic} seems impossible? What if I told you there's a better way?`,
          title: `The ${scriptTopic} Revolution`,
          subtitle: "Everything is about to change",
        },
        {
          section: "TRANSITION",
          layout: "titleBody" as LayoutType,
          narration: "So what does this actually mean for you? Let me break it down.",
          title: "Here's Why This Matters",
          body: "This isn't just theory - it's a proven approach that works.",
        },
        {
          section: "SETUP",
          layout: "titleBody" as LayoutType,
          narration: `By the end of this, you'll understand exactly how to master ${scriptTopic}. Whether you're a beginner or experienced, this approach will transform your results.`,
          title: "What You'll Learn Today",
          body: `A complete system for ${scriptTopic} that delivers real results.`,
        },
        {
          section: "PROBLEM",
          layout: "imageBullets" as LayoutType,
          narration: `Most people struggle with ${scriptTopic} because they're using outdated methods. That stops today.`,
          title: "The Problem Most People Face",
          bulletPoints: [
            "Overwhelming complexity",
            "Too many conflicting approaches",
            "No clear path to success"
          ],
        },
        {
          section: "TRANSITION",
          layout: "titleBody" as LayoutType,
          narration: "But here's the catch - you need the right framework.",
          title: "The Missing Piece",
          body: "Let's fix that right now.",
        },
        {
          section: "SOLUTION",
          layout: "imageBullets" as LayoutType,
          narration: `Here's your step-by-step system for ${scriptTopic}. Follow these steps and watch what happens.`,
          title: "Your Action Plan",
          bulletPoints: [
            "Start with the fundamentals",
            "Build momentum systematically",
            "Scale with confidence"
          ],
        },
        {
          section: "RESULT",
          layout: "titleBody" as LayoutType,
          narration: `Once you implement this, ${scriptTopic} becomes effortless. You'll wonder why you struggled before.`,
          title: "The Transformation",
          body: "From overwhelmed to unstoppable - that's the difference this makes.",
        },
        {
          section: "TRANSITION",
          layout: "titleBody" as LayoutType,
          narration: "Now that you've seen it, here's your next move.",
          title: "Ready to Take Action?",
          body: "Your journey starts now.",
        },
        {
          section: "NEXT",
          layout: "imageBullets" as LayoutType,
          narration: `Try this today: Start with step one. Don't overthink it - just begin. Want help? I'll show you exactly how in the next video.`,
          title: "What's Next",
          bulletPoints: [
            "Take action on step one today",
            "Track your progress",
            "Watch the next video for advanced strategies"
          ],
        },
      ];

      // Convert to Scene objects
      const newScenes: Scene[] = mockScriptSlides.map((slide, index) => ({
        id: `${Date.now()}-${index}`,
        content: slide.narration,
        duration: 5,
        layout: slide.layout,
        layoutContent: {
          title: slide.title || slide.title,
          subtitle: slide.subtitle,
          body: slide.body,
          bulletPoints: slide.bulletPoints,
        },
        annotations: [],
      }));

      setScenes(newScenes);
      if (newScenes.length > 0) {
        setActiveSceneId(newScenes[0].id);
      }

      setShowTopicInput(false);
      setScriptTopic("");
    } catch (error) {
      console.error("Error generating script:", error);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const generateSceneWithAI = () => {
    setShowTopicInput(true);
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

  const handleAiPromptToggle = (sceneId: string) => {
    if (aiPromptSceneId === sceneId) {
      // Close AI prompt mode
      setAiPromptSceneId(null);
      setAiPrompt("");
    } else {
      // Open AI prompt mode
      setAiPromptSceneId(sceneId);
      setEditingSceneId(null);
      setAiPrompt("");
    }
  };

  const generateSceneContentWithAI = async (sceneId: string) => {
    if (!aiPrompt.trim()) return;

    setIsGeneratingAI(sceneId);

    // Simulate AI generation - TODO: Replace with actual API call
    setTimeout(() => {
      // Simulated AI response with structured data
      const aiResponse = {
        narration: `Here's an engaging overview of ${aiPrompt}. This slide captures the key insights.`,
        title: aiPrompt.split(' ').slice(0, 5).join(' '),
        body: `Discover how ${aiPrompt} can transform your workflow and deliver exceptional results.`
      };

      const scene = scenes.find(s => s.id === sceneId);
      if (scene) {
        setScenes((prev: Scene[]) =>
          prev.map(s =>
            s.id === sceneId
              ? {
                  ...s,
                  content: aiResponse.narration,
                  layoutContent: {
                    ...s.layoutContent,
                    title: aiResponse.title,
                    body: aiResponse.body,
                  },
                }
              : s
          )
        );
      }

      setIsGeneratingAI(null);
      setAiPromptSceneId(null);
      setAiPrompt("");
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        {/* Voice Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between mb-3 h-auto py-2"
            >
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <div className="text-left">
                  <div className="text-sm font-medium">{selectedVoice.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedVoice.description}</div>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[280px]">
            {OPENAI_VOICES.map((voice) => (
              <DropdownMenuItem
                key={voice.id}
                onClick={() => setSelectedVoice(voice)}
                className="flex flex-col items-start py-2"
              >
                <div className="font-medium">{voice.name}</div>
                <div className="text-xs text-muted-foreground">{voice.description}</div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {showTopicInput ? (
          <div className="space-y-2 mb-2">
            <Textarea
              value={scriptTopic}
              onChange={(e) => setScriptTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  generateScriptWithAI();
                }
              }}
              placeholder="What's your video about? (e.g., 'How to start a business')"
              className="min-h-[80px] text-sm resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={generateScriptWithAI}
                disabled={!scriptTopic.trim() || isGeneratingScript}
                className="gap-2 flex-1"
              >
                <Sparkles className="h-3 w-3" />
                {isGeneratingScript ? "Generating..." : "Generate Script"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowTopicInput(false);
                  setScriptTopic("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
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
          </div>
        )}
      </div>

      {/* Scenes List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
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
                    {aiPromptSceneId === scene.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) {
                              generateSceneContentWithAI(scene.id);
                            }
                          }}
                          placeholder="Describe what this slide should be about..."
                          className="min-h-[60px] text-sm resize-none"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => generateSceneContentWithAI(scene.id)}
                            disabled={!aiPrompt.trim() || isGeneratingAI === scene.id}
                            className="gap-2"
                          >
                            <Sparkles className="h-3 w-3" />
                            {isGeneratingAI === scene.id ? "Generating..." : "Generate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAiPromptSceneId(null);
                              setAiPrompt("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : editingSceneId === scene.id ? (
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
                        className="text-sm text-foreground leading-relaxed cursor-text line-clamp-2"
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
                          className={`h-6 w-6 ${aiPromptSceneId === scene.id ? 'bg-primary/10 text-primary' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAiPromptToggle(scene.id);
                          }}
                        >
                          <Sparkles className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSceneId(scene.id);
                            setAiPromptSceneId(null);
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
        </div>
      </ScrollArea>
    </div>
  );
}