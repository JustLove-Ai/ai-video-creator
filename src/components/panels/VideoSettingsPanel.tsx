"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { X, Video, Mic, Play, Eye, Volume2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Remotion transition types
export type TransitionType = "fade" | "slide" | "wipe" | "flip" | "clockWipe" | "iris" | "none";
export type TransitionDirection = "from-left" | "from-right" | "from-top" | "from-bottom";

export interface CaptionSettings {
  enabled: boolean;
  style: "full-text" | "word-by-word" | "line-by-line";
  position: "bottom" | "top" | "center";
  maxLines: number;
  highlightColor: string;
}

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

interface VideoSettingsPanelProps {
  onClose: () => void;
  onExport: (videoSettings: VideoSettings, audioSettings: AudioSettings) => void;
  onPreview: (videoSettings: VideoSettings, audioSettings: AudioSettings) => void;
  initialVoice?: string;
}

export function VideoSettingsPanel({ onClose, onExport, onPreview, initialVoice = "alloy" }: VideoSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<"captions" | "transitions" | "audio">("captions");
  const [isPlayingVoiceSample, setIsPlayingVoiceSample] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    voice: initialVoice,
    speed: 1.0,
    pitch: 1.0,
  });

  const handleExport = () => {
    // Don't close immediately - let the export handler in parent manage the flow
    onExport(videoSettings, audioSettings);
  };

  const handlePreview = () => {
    onPreview(videoSettings, audioSettings);
  };

  const playVoiceSample = async () => {
    setIsPlayingVoiceSample(true);
    try {
      // Generate a sample sentence with the selected voice settings
      const response = await fetch("/api/voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "This is how your video narration will sound with these settings.",
          voice: audioSettings.voice,
          speed: audioSettings.speed,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.url && audioRef.current) {
          audioRef.current.src = data.url;
          audioRef.current.playbackRate = 1.0; // Speed is handled by OpenAI TTS
          await audioRef.current.play();
        }
      } else {
        console.error("Failed to generate voice sample");
        setIsPlayingVoiceSample(false);
      }
    } catch (error) {
      console.error("Failed to play voice sample:", error);
      setIsPlayingVoiceSample(false);
    }
  };

  return (
    <motion.div
      initial={{ x: 360 }}
      animate={{ x: 0 }}
      exit={{ x: 360 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed right-0 top-16 bottom-0 w-[360px] bg-card border-l border-border shadow-xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold">Export Settings</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("captions")}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
            activeTab === "captions"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Captions
        </button>
        <button
          onClick={() => setActiveTab("transitions")}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
            activeTab === "transitions"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Transitions
        </button>
        <button
          onClick={() => setActiveTab("audio")}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
            activeTab === "audio"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Audio
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {activeTab === "captions" && (
            <>
              {/* Captions Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="captions">Show Captions</Label>
                    <p className="text-xs text-muted-foreground">
                      Display subtitles during playback
                    </p>
                  </div>
                  <Switch
                    id="captions"
                    checked={videoSettings.captions.enabled}
                    onCheckedChange={(checked) =>
                      setVideoSettings({
                        ...videoSettings,
                        captions: { ...videoSettings.captions, enabled: checked },
                      })
                    }
                  />
                </div>
              </div>

              {/* Caption Settings - Only show if captions are enabled */}
              {videoSettings.captions.enabled && (
                <>
                  {/* Caption Style */}
                  <div className="space-y-2">
                    <Label htmlFor="caption-style">Caption Style</Label>
                    <Select
                      value={videoSettings.captions.style}
                      onValueChange={(value: CaptionSettings["style"]) =>
                        setVideoSettings({
                          ...videoSettings,
                          captions: { ...videoSettings.captions, style: value },
                        })
                      }
                    >
                      <SelectTrigger id="caption-style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-text">Full Text</SelectItem>
                        <SelectItem value="word-by-word">Word by Word</SelectItem>
                        <SelectItem value="line-by-line">Line by Line</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {videoSettings.captions.style === "word-by-word" && "Highlight each word as it's spoken"}
                      {videoSettings.captions.style === "line-by-line" && "Display one line at a time"}
                      {videoSettings.captions.style === "full-text" && "Show full caption text"}
                    </p>
                  </div>

                  {/* Caption Position */}
                  <div className="space-y-2">
                    <Label htmlFor="caption-position">Position</Label>
                    <Select
                      value={videoSettings.captions.position}
                      onValueChange={(value: CaptionSettings["position"]) =>
                        setVideoSettings({
                          ...videoSettings,
                          captions: { ...videoSettings.captions, position: value },
                        })
                      }
                    >
                      <SelectTrigger id="caption-position">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="top">Top</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Max Lines */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="max-lines">Maximum Lines</Label>
                      <span className="text-sm text-muted-foreground">{videoSettings.captions.maxLines}</span>
                    </div>
                    <Slider
                      id="max-lines"
                      min={1}
                      max={4}
                      step={1}
                      value={[videoSettings.captions.maxLines]}
                      onValueChange={([value]) =>
                        setVideoSettings({
                          ...videoSettings,
                          captions: { ...videoSettings.captions, maxLines: value },
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of text lines to display at once
                    </p>
                  </div>

                  {/* Highlight Color (only for word-by-word) */}
                  {videoSettings.captions.style === "word-by-word" && (
                    <div className="space-y-2">
                      <Label htmlFor="highlight-color">Highlight Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="highlight-color"
                          value={videoSettings.captions.highlightColor}
                          onChange={(e) =>
                            setVideoSettings({
                              ...videoSettings,
                              captions: { ...videoSettings.captions, highlightColor: e.target.value },
                            })
                          }
                          className="h-10 w-20 rounded border border-border cursor-pointer"
                        />
                        <span className="text-sm text-muted-foreground">
                          {videoSettings.captions.highlightColor}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Color for highlighting current word
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {activeTab === "transitions" && (
            <>
              {/* Transition Type */}
              <div className="space-y-2">
                <Label htmlFor="transition-type">Scene Transition</Label>
                <Select
                  value={videoSettings.transitionType}
                  onValueChange={(value: TransitionType) =>
                    setVideoSettings({ ...videoSettings, transitionType: value })
                  }
                >
                  <SelectTrigger id="transition-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="slide">Slide</SelectItem>
                    <SelectItem value="wipe">Wipe</SelectItem>
                    <SelectItem value="flip">Flip</SelectItem>
                    <SelectItem value="clockWipe">Clock Wipe</SelectItem>
                    <SelectItem value="iris">Iris</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Transition effect between scenes
                </p>
              </div>

              {/* Transition Direction */}
              {videoSettings.transitionType !== "none" && videoSettings.transitionType !== "fade" && (
                <div className="space-y-2">
                  <Label htmlFor="transition-direction">Transition Direction</Label>
                  <Select
                    value={videoSettings.transitionDirection}
                    onValueChange={(value: TransitionDirection) =>
                      setVideoSettings({ ...videoSettings, transitionDirection: value })
                    }
                  >
                    <SelectTrigger id="transition-direction">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="from-left">From Left</SelectItem>
                      <SelectItem value="from-right">From Right</SelectItem>
                      <SelectItem value="from-top">From Top</SelectItem>
                      <SelectItem value="from-bottom">From Bottom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Transition Preview */}
              {videoSettings.transitionType !== "none" && (
                <div className="space-y-2">
                  <Label>Transition Preview</Label>
                  <div className="relative h-20 bg-muted rounded-lg overflow-hidden border border-border">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${videoSettings.transitionType}-${videoSettings.transitionDirection}`}
                        initial={getTransitionInitial(videoSettings.transitionType, videoSettings.transitionDirection)}
                        animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotateY: 0 }}
                        exit={getTransitionExit(videoSettings.transitionType, videoSettings.transitionDirection)}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 flex items-center justify-center bg-primary/20"
                      >
                        <div className="text-sm font-medium">{videoSettings.transitionType}</div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Slide Animations */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="animations">Content Animations</Label>
                    <p className="text-xs text-muted-foreground">
                      Animate slide content on entry
                    </p>
                  </div>
                  <Switch
                    id="animations"
                    checked={videoSettings.slideAnimations}
                    onCheckedChange={(checked) =>
                      setVideoSettings({ ...videoSettings, slideAnimations: checked })
                    }
                  />
                </div>
              </div>

              {/* Animation Style */}
              {videoSettings.slideAnimations && (
                <div className="space-y-2">
                  <Label htmlFor="animation-style">Animation Style</Label>
                  <Select
                    value={videoSettings.animationStyle}
                    onValueChange={(value: VideoSettings["animationStyle"]) =>
                      setVideoSettings({ ...videoSettings, animationStyle: value })
                    }
                  >
                    <SelectTrigger id="animation-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fade">Fade In</SelectItem>
                      <SelectItem value="slide">Slide In</SelectItem>
                      <SelectItem value="zoom">Zoom In</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          {activeTab === "audio" && (
            <>
              {/* Voice Selection */}
              <div className="space-y-2">
                <Label htmlFor="voice">Voice</Label>
                <Select
                  value={audioSettings.voice}
                  onValueChange={(value) =>
                    setAudioSettings({ ...audioSettings, voice: value })
                  }
                >
                  <SelectTrigger id="voice">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alloy">Alloy</SelectItem>
                    <SelectItem value="echo">Echo</SelectItem>
                    <SelectItem value="fable">Fable</SelectItem>
                    <SelectItem value="onyx">Onyx</SelectItem>
                    <SelectItem value="nova">Nova</SelectItem>
                    <SelectItem value="shimmer">Shimmer</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose the text-to-speech voice
                </p>
              </div>

              {/* Speed Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="speed">Speed</Label>
                  <span className="text-sm text-muted-foreground">{audioSettings.speed.toFixed(1)}x</span>
                </div>
                <Slider
                  id="speed"
                  min={0.25}
                  max={4.0}
                  step={0.25}
                  value={[audioSettings.speed]}
                  onValueChange={([value]) =>
                    setAudioSettings({ ...audioSettings, speed: value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Adjust playback speed (0.25x - 4.0x)
                </p>
              </div>

              {/* Voice Sample Button */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={playVoiceSample}
                  disabled={isPlayingVoiceSample}
                >
                  <Volume2 className="h-4 w-4" />
                  {isPlayingVoiceSample ? "Playing..." : "Play Voice Sample"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Hear how the narration will sound
                </p>
              </div>

              {/* Hidden audio element for playback */}
              <audio
                ref={audioRef}
                onEnded={() => setIsPlayingVoiceSample(false)}
                style={{ display: 'none' }}
              />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer - Preview and Export Buttons */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handlePreview}
        >
          <Eye className="h-4 w-4" />
          Preview with Settings
        </Button>
        <Button
          className="w-full text-white hover:opacity-90 gap-2"
          style={{ backgroundColor: '#ff7900' }}
          onClick={handleExport}
        >
          <Video className="h-4 w-4" />
          Export Video
        </Button>
      </div>
    </motion.div>
  );
}

// Helper functions for transition preview animations
function getTransitionInitial(type: TransitionType, direction: TransitionDirection) {
  switch (type) {
    case "fade":
      return { opacity: 0 };
    case "slide":
    case "wipe":
      switch (direction) {
        case "from-left":
          return { x: -100, opacity: 0.8 };
        case "from-right":
          return { x: 100, opacity: 0.8 };
        case "from-top":
          return { y: -100, opacity: 0.8 };
        case "from-bottom":
          return { y: 100, opacity: 0.8 };
      }
      break;
    case "flip":
      return { rotateY: 90, opacity: 0 };
    case "clockWipe":
    case "iris":
      return { scale: 0, opacity: 0 };
    default:
      return { opacity: 1 };
  }
}

function getTransitionExit(type: TransitionType, direction: TransitionDirection) {
  switch (type) {
    case "fade":
      return { opacity: 0 };
    case "slide":
      switch (direction) {
        case "from-left":
          return { x: 100, opacity: 0.8 };
        case "from-right":
          return { x: -100, opacity: 0.8 };
        case "from-top":
          return { y: 100, opacity: 0.8 };
        case "from-bottom":
          return { y: -100, opacity: 0.8 };
      }
      break;
    case "wipe":
      switch (direction) {
        case "from-left":
          return { x: -100, opacity: 0 };
        case "from-right":
          return { x: 100, opacity: 0 };
        case "from-top":
          return { y: -100, opacity: 0 };
        case "from-bottom":
          return { y: 100, opacity: 0 };
      }
      break;
    case "flip":
      return { rotateY: -90, opacity: 0 };
    case "clockWipe":
    case "iris":
      return { scale: 0, opacity: 0 };
    default:
      return { opacity: 1 };
  }
}
