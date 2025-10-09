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
  Sparkles,
  Play
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Scene, Theme, LayoutType, AnnotationElement, LayoutContent } from "@/types";
import { parseScriptToLayout } from "@/lib/layouts";
import { YOUTUBE_SCRIPT_PROMPT, AI_GENERATION_SYSTEM_PROMPT } from "@/lib/constants";
import { generateYouTubeScript, generateSceneContent, generateSpeech } from "@/app/actions/openai";
import { createScene, updateScene, deleteScene, deleteAllScenes } from "@/app/actions/scenes";
import { getProject } from "@/app/actions/projects";
import { getAudioDuration } from "@/lib/audioUtils";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useTransition } from "react";
import type { Prisma } from "@prisma/client";

interface LeftSidebarProps {
  scenes: Scene[];
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  activeSceneId: string;
  setActiveSceneId: (id: string) => void;
  currentTheme: Theme;
  projectId: string;
  onVoiceChange?: (voiceId: string) => void;
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
  projectId,
  onVoiceChange,
}: LeftSidebarProps) {
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(OPENAI_VOICES[0]);

  // Notify parent when voice changes
  const handleVoiceChange = (voice: typeof OPENAI_VOICES[0]) => {
    setSelectedVoice(voice);
    if (onVoiceChange) {
      onVoiceChange(voice.id);
    }
  };
  const [aiPromptSceneId, setAiPromptSceneId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showTopicInput, setShowTopicInput] = useState(false);
  const [scriptTopic, setScriptTopic] = useState<string>("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());

  const addScene = () => {
    if (!projectId) return;

    const content = "Add content here";
    const layoutContent = parseScriptToLayout(content, "titleBody");

    startTransition(async () => {
      try {
        // Create scene in database
        const newScene = await createScene(projectId, {
          content,
          layout: "titleBody",
          layoutContent: layoutContent as Prisma.InputJsonValue,
          duration: 5,
        });

        // Convert to Scene type and add to local state
        const sceneForState: Scene = {
          id: newScene.id,
          content: newScene.content,
          duration: newScene.duration,
          layout: newScene.layout as LayoutType,
          layoutContent: newScene.layoutContent as LayoutContent,
          annotations: (newScene.annotations as unknown as AnnotationElement[]) || [],
          themeOverride: (newScene.themeOverride as unknown) as Partial<Theme> | undefined,
        };

        setScenes([...scenes, sceneForState]);
        setActiveSceneId(newScene.id);
        setEditingSceneId(newScene.id);
      } catch (error) {
        console.error("Failed to create scene:", error);
        alert("Failed to create scene. Please try again.");
      }
    });
  };

  const generateScriptWithAI = async () => {
    if (!scriptTopic.trim() || !projectId) return;

    setIsGeneratingScript(true);

    try {
      // Delete existing scenes only if there are any
      // This handles both the welcome scene and any user-created scenes
      if (scenes.length > 0) {
        await deleteAllScenes(projectId);
      }

      // Call OpenAI to generate YouTube script
      await generateYouTubeScript(scriptTopic, projectId);

      // Reload project to get the new scenes
      const project = await getProject(projectId);

      if (project) {
        // Convert Prisma scenes to Scene type
        const convertedScenes: Scene[] = project.scenes.map((s) => ({
          id: s.id,
          content: s.content,
          duration: s.duration,
          layout: s.layout as LayoutType,
          layoutContent: s.layoutContent as LayoutContent,
          annotations: (s.annotations || []) as AnnotationElement[],
          themeOverride: (s.themeOverride as unknown) as Partial<Theme> | undefined,
        }));

        setScenes(convertedScenes);
        if (convertedScenes.length > 0) {
          setActiveSceneId(convertedScenes[0].id);
        }
      }

      setShowTopicInput(false);
      setScriptTopic("");
    } catch (error) {
      console.error("Error generating script:", error);
      alert("Failed to generate script. Please try again.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const generateSceneWithAI = () => {
    setShowTopicInput(true);
  };

  const updateSceneContent = (sceneId: string, content: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const newLayoutContent = parseScriptToLayout(content, scene.layout, scene.layoutContent);

    setScenes(
      scenes.map(s =>
        s.id === sceneId
          ? {
              ...s,
              content,
              layoutContent: newLayoutContent,
            }
          : s
      )
    );

    // Save to database
    startTransition(async () => {
      try {
        await updateScene(sceneId, {
          content,
          layoutContent: newLayoutContent as Prisma.InputJsonValue,
        });
      } catch (error) {
        console.error("Failed to update scene content:", error);
      }
    });
  };

  const handleDeleteScene = (sceneId: string) => {
    const newScenes = scenes.filter(s => s.id !== sceneId);
    setScenes(newScenes);
    if (activeSceneId === sceneId && newScenes.length > 0) {
      setActiveSceneId(newScenes[0].id);
    }

    // Delete from database
    startTransition(async () => {
      try {
        await deleteScene(sceneId);
      } catch (error) {
        console.error("Failed to delete scene:", error);
      }
    });
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

    startTransition(async () => {
      try {
        const result = await generateSceneContent(aiPrompt, sceneId);

        // Update local state
        setScenes((prev: Scene[]) =>
          prev.map(s =>
            s.id === sceneId
              ? {
                  ...s,
                  content: result.narration,
                  layoutContent: {
                    ...s.layoutContent,
                    title: result.title,
                    body: result.body,
                  },
                }
              : s
          )
        );

        setAiPromptSceneId(null);
        setAiPrompt("");
      } catch (error) {
        console.error("Failed to generate scene content:", error);
        alert("Failed to generate content. Please try again.");
      } finally {
        setIsGeneratingAI(null);
      }
    });
  };

  const generateAudioForScene = async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene || !scene.content.trim()) {
      alert("Please add content to the scene before generating audio.");
      return;
    }

    setIsGeneratingAudio(sceneId);

    startTransition(async () => {
      try {
        const result = await generateSpeech(scene.content, selectedVoice.id, sceneId);

        // Calculate audio duration
        let audioDuration = scene.duration; // Default to current duration
        try {
          audioDuration = await getAudioDuration(result.url);
          // Update scene duration in database
          await updateScene(sceneId, { duration: Math.ceil(audioDuration) });
        } catch (error) {
          console.error("Failed to calculate audio duration:", error);
        }

        // Update local state with audio URL and duration
        setScenes((prev: Scene[]) =>
          prev.map(s =>
            s.id === sceneId
              ? { ...s, audioUrl: result.url, duration: Math.ceil(audioDuration) }
              : s
          )
        );
      } catch (error) {
        console.error("Failed to generate audio:", error);
        alert("Failed to generate audio. Please try again.");
      } finally {
        setIsGeneratingAudio(null);
      }
    });
  };

  const playAudio = (sceneId: string, audioUrl: string) => {
    // Stop any currently playing audio
    if (playingAudio) {
      const currentAudio = audioElements.get(playingAudio);
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    // If clicking the same audio that's playing, just stop it
    if (playingAudio === sceneId) {
      setPlayingAudio(null);
      return;
    }

    // Create or get audio element
    let audio = audioElements.get(sceneId);
    if (!audio) {
      audio = new Audio(audioUrl);
      audio.onended = () => setPlayingAudio(null);
      const newMap = new Map(audioElements);
      newMap.set(sceneId, audio);
      setAudioElements(newMap);
    }

    // Play the audio
    audio.play();
    setPlayingAudio(sceneId);
  };

  const handleRecordingComplete = async (sceneId: string, audioUrl: string, duration: number) => {
    // Update local state
    setScenes((prev: Scene[]) =>
      prev.map(s =>
        s.id === sceneId
          ? { ...s, recordedAudioUrl: audioUrl, duration }
          : s
      )
    );

    // Update database
    startTransition(async () => {
      try {
        await updateScene(sceneId, {
          recordedAudioUrl: audioUrl,
          duration,
        });
      } catch (error) {
        console.error("Failed to save recorded audio:", error);
      }
    });
  };

  const handleRecordingDelete = async (sceneId: string) => {
    // Update local state
    setScenes((prev: Scene[]) =>
      prev.map(s =>
        s.id === sceneId
          ? { ...s, recordedAudioUrl: undefined }
          : s
      )
    );

    // Update database
    startTransition(async () => {
      try {
        await updateScene(sceneId, {
          recordedAudioUrl: null,
        });
      } catch (error) {
        console.error("Failed to delete recorded audio:", error);
      }
    });
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
                onClick={() => handleVoiceChange(voice)}
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
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
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
                    ? `border-primary bg-primary/5 ${editingSceneId !== scene.id && aiPromptSceneId !== scene.id ? 'shadow-[0_0_15px_rgba(255,121,0,0.3)]' : ''}`
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
                          className="min-h-[60px] text-sm resize-none focus-visible:border-border focus-visible:ring-muted"
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
                        className="min-h-[60px] text-sm resize-none focus-visible:border-border focus-visible:ring-muted"
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
                        {/* Play recorded or AI audio */}
                        {(scene.recordedAudioUrl || scene.audioUrl) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-6 w-6 ${playingAudio === scene.id ? 'text-primary' : scene.recordedAudioUrl ? 'text-blue-500' : 'text-green-500'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              playAudio(scene.id, scene.recordedAudioUrl || scene.audioUrl!);
                            }}
                            title={playingAudio === scene.id ? "Stop audio" : "Play audio"}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        {/* Voice Recorder */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <VoiceRecorder
                            sceneId={scene.id}
                            existingAudioUrl={scene.recordedAudioUrl}
                            onRecordingComplete={(audioUrl, duration) => handleRecordingComplete(scene.id, audioUrl, duration)}
                            onRecordingDelete={() => handleRecordingDelete(scene.id)}
                          />
                        </div>
                        {/* AI Voice Generator */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-6 w-6 ${scene.audioUrl ? 'text-green-500' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            generateAudioForScene(scene.id);
                          }}
                          disabled={isGeneratingAudio === scene.id}
                          title={scene.audioUrl ? "Regenerate AI audio" : "Generate AI audio"}
                        >
                          {isGeneratingAudio === scene.id ? (
                            <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Volume2 className="h-3 w-3" />
                          )}
                        </Button>
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
                              handleDeleteScene(scene.id);
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
    </div>
  );
}