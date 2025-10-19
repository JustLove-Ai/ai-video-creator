"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Pause, ChevronLeft, ChevronRight, SkipForward, Check, Trash2, Play, Loader2, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Scene, Theme } from "@/types";
import { VideoCanvas } from "@/components/VideoCanvas";
import { Progress } from "@/components/ui/progress";

interface SceneBySceneRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: Scene[];
  currentTheme: Theme;
  projectId: string;
  onComplete: (scenesWithAudio: Map<string, { audioUrl: string; duration: number }>) => void;
  onPreview?: () => void;
  onExport?: () => void;
}

type RecordingState = "idle" | "recording" | "paused" | "hasRecording";

export function SceneBySceneRecorderModal({
  isOpen,
  onClose,
  scenes,
  currentTheme,
  projectId,
  onComplete,
  onPreview,
  onExport,
}: SceneBySceneRecorderModalProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioData, setAudioData] = useState<Map<string, { audioUrl: string; duration: number }>>(new Map());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingSceneIdRef = useRef<string | null>(null); // Track which scene is being recorded

  const currentScene = scenes[currentSceneIndex];
  const totalScenes = scenes.length;
  const progress = ((currentSceneIndex + 1) / totalScenes) * 100;
  const recordedCount = audioData.size;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Auto-save and navigate when scene changes
  useEffect(() => {
    const handleSceneChange = async () => {
      // If we were recording or paused, finalize the recording
      if ((recordingState === "recording" || recordingState === "paused") && mediaRecorderRef.current) {
        await finalizeRecording();
      }

      setRecordingTime(0);
      setIsPlaying(false);

      // Check if new scene already has a recording
      if (currentScene && audioData.has(currentScene.id)) {
        setRecordingState("hasRecording");
      } else {
        setRecordingState("idle");
      }
    };

    handleSceneChange();
  }, [currentSceneIndex]);

  const startRecording = async () => {
    try {
      // Reuse existing stream if available, or create new one
      let stream = streamRef.current;
      if (!stream || !stream.active) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Store the current scene ID at the time recording starts
      recordingSceneIdRef.current = currentScene.id;
      console.log('🎤 Started recording for scene:', currentScene.id);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setRecordingState("recording");
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone", {
        description: "Please check permissions."
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingState("paused");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingState("recording");
      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const finalizeRecording = async () => {
    return new Promise<void>((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
        resolve();
        return;
      }

      const recorder = mediaRecorderRef.current;

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        // Save recording in background (non-blocking)
        setIsSaving(true);
        saveRecording(audioBlob).finally(() => {
          setIsSaving(false);
        });

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        resolve();
      };

      recorder.stop();
    });
  };

  const saveRecording = async (audioBlob: Blob) => {
    // Use the scene ID that was stored when recording started
    const sceneId = recordingSceneIdRef.current;
    if (!sceneId) {
      console.error('No scene ID found for recording');
      return;
    }

    console.log('💾 Saving recording for scene:', sceneId);

    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("sceneId", sceneId);
    formData.append("projectId", projectId);

    try {
      const response = await fetch("/api/save-recording", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        // Get audio duration
        const audioUrl = data.url;
        const audio = new Audio(audioUrl);
        audio.onloadedmetadata = () => {
          const duration = Math.ceil(audio.duration);

          console.log('✅ Recording saved for scene:', sceneId, 'URL:', audioUrl);

          // Update audio data map with the correct scene ID
          setAudioData((prev) => {
            const newMap = new Map(prev);
            newMap.set(sceneId, { audioUrl, duration });
            return newMap;
          });

          toast.success("Recording saved!");
        };
      } else {
        throw new Error("Failed to save recording");
      }
    } catch (error) {
      console.error("Error saving recording:", error);
      toast.error("Failed to save recording", {
        description: "Please try again."
      });
    }
  };

  const deleteRecording = () => {
    setAudioData((prev) => {
      const newMap = new Map(prev);
      newMap.delete(currentScene.id);
      return newMap;
    });
    setRecordingState("idle");
    setIsPlaying(false);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    toast.success("Recording deleted");
  };

  const playRecording = () => {
    const recording = audioData.get(currentScene.id);
    if (!recording) return;

    if (isPlaying) {
      audioElementRef.current?.pause();
      setIsPlaying(false);
    } else {
      const audio = new Audio(recording.audioUrl);
      audioElementRef.current = audio;
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const goToPrevious = async () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1);
    }
  };

  const goToNext = async () => {
    if (currentSceneIndex < totalScenes - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    }
  };

  const skipScene = async () => {
    if (currentSceneIndex < totalScenes - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    }
  };

  const handleComplete = () => {
    if (audioData.size === 0) {
      toast.warning("No recordings to save", {
        description: "Please record at least one scene."
      });
      return;
    }

    onComplete(audioData);
    toast.success(`${audioData.size} scene(s) recorded successfully!`);
  };

  const handlePreview = () => {
    handleComplete();
    handleClose();
    onPreview?.();
  };

  const handleExport = () => {
    handleComplete();
    handleClose();
    onExport?.();
  };

  const handleClose = async () => {
    // Auto-save any active recording before closing
    if (recordingState === "recording" || recordingState === "paused") {
      await finalizeRecording();
    }

    // Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCurrentSceneIndex(0);
    setRecordingState("idle");
    setRecordingTime(0);
    setAudioData(new Map());
    setIsPlaying(false);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-8 bg-card border border-border rounded-lg shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-2xl font-semibold">Record Voice-Over</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Scene {currentSceneIndex + 1} of {totalScenes} • {recordedCount} recorded
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-4 flex-shrink-0">
              <Progress value={progress} className="h-2" />
            </div>

            {/* Content - Scene Preview */}
            <div className="flex-1 overflow-hidden p-6">
              <div className="h-full flex flex-col gap-4">
                {/* Video Canvas Preview */}
                <div className="flex-1 bg-background rounded-lg border border-border overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full max-w-5xl max-h-[600px] mx-auto flex items-center justify-center">
                    <VideoCanvas
                      activeScene={currentScene}
                      activeTheme={currentTheme}
                      selectedTool={null}
                      annotationMode={false}
                      onSceneUpdate={() => {}}
                      onImageReplace={() => {}}
                      onImageRemove={() => {}}
                      onChartAdd={() => {}}
                      isTimelineExpanded={true}
                    />
                  </div>
                </div>

                {/* Script Display */}
                <div className="bg-muted rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Script:</p>
                  <p className="text-sm leading-relaxed">{currentScene.content}</p>
                </div>
              </div>
            </div>

            {/* Footer - Controls */}
            <div className="p-6 border-t border-border bg-muted/30 flex-shrink-0">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Navigation */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={goToPrevious}
                    disabled={currentSceneIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                </div>

                {/* Center: Recording Controls */}
                <div className="flex items-center gap-3">
                  {recordingState === "idle" && (
                    <Button
                      onClick={startRecording}
                      size="lg"
                      className="gap-2 h-12 px-8"
                    >
                      <Mic className="h-5 w-5" />
                      Record
                    </Button>
                  )}

                  {recordingState === "recording" && (
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-red-500 animate-pulse min-w-[80px] text-center">
                        {formatTime(recordingTime)}
                      </div>
                      <Button
                        onClick={pauseRecording}
                        size="lg"
                        variant="outline"
                        className="gap-2 h-12"
                      >
                        <Pause className="h-5 w-5" />
                        Pause
                      </Button>
                      {isSaving && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </div>
                      )}
                    </div>
                  )}

                  {recordingState === "paused" && (
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-orange-500 min-w-[80px] text-center">
                        {formatTime(recordingTime)}
                      </div>
                      <Button
                        onClick={resumeRecording}
                        size="lg"
                        className="gap-2 h-12"
                      >
                        <Mic className="h-5 w-5" />
                        Resume
                      </Button>
                      {isSaving && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </div>
                      )}
                    </div>
                  )}

                  {recordingState === "hasRecording" && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={playRecording}
                        variant="outline"
                        size="lg"
                        className={`gap-2 ${isPlaying ? "text-primary" : ""}`}
                      >
                        <Play className="h-4 w-4" />
                        {isPlaying ? "Playing..." : "Play"}
                      </Button>
                      <Button
                        onClick={() => {
                          // Delete existing recording and start fresh
                          setAudioData((prev) => {
                            const newMap = new Map(prev);
                            newMap.delete(currentScene.id);
                            return newMap;
                          });
                          setRecordingState("idle");
                          // Auto-start recording
                          setTimeout(() => startRecording(), 100);
                        }}
                        size="lg"
                        className="gap-2"
                      >
                        <Mic className="h-4 w-4" />
                        Re-record
                      </Button>
                      <Button
                        onClick={deleteRecording}
                        variant="outline"
                        size="lg"
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                {/* Right: Navigation */}
                <div className="flex items-center gap-2">
                  {currentSceneIndex < totalScenes - 1 ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={skipScene}
                      >
                        <SkipForward className="h-4 w-4 mr-1" />
                        Skip
                      </Button>
                      <Button
                        onClick={goToNext}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </>
                  ) : (
                    <>
                      {audioData.size > 0 && (
                        <>
                          <Button
                            variant="outline"
                            onClick={handlePreview}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                          <Button
                            onClick={handleExport}
                            className="gap-2"
                            style={{ backgroundColor: '#ff7900' }}
                          >
                            <Download className="h-4 w-4" />
                            Export
                          </Button>
                        </>
                      )}
                      <Button
                        variant={audioData.size > 0 ? "ghost" : "default"}
                        onClick={() => {
                          if (audioData.size > 0) {
                            handleComplete();
                            handleClose();
                          } else {
                            handleClose();
                          }
                        }}
                        className="gap-2"
                      >
                        <Check className="h-4 w-4" />
                        {audioData.size > 0 ? "Save & Close" : "Close"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
