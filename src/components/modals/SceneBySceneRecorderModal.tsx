"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Square, ChevronLeft, ChevronRight, SkipForward, Check, Trash2, Play } from "lucide-react";
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
  onComplete: (scenesWithAudio: Map<string, { audioUrl: string; duration: number }>) => void;
}

type RecordingState = "idle" | "recording" | "hasRecording";

export function SceneBySceneRecorderModal({
  isOpen,
  onClose,
  scenes,
  currentTheme,
  onComplete,
}: SceneBySceneRecorderModalProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioData, setAudioData] = useState<Map<string, { audioUrl: string; duration: number }>>(new Map());
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

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
    };
  }, []);

  // Reset recording state when scene changes
  useEffect(() => {
    setRecordingState("idle");
    setRecordingTime(0);
    setIsPlaying(false);

    // Check if current scene already has a recording
    if (currentScene && audioData.has(currentScene.id)) {
      setRecordingState("hasRecording");
    }
  }, [currentSceneIndex, currentScene, audioData]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        // Save recording to server
        await saveRecording(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
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

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecordingState("hasRecording");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const saveRecording = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("sceneId", currentScene.id);

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

          // Update audio data map
          setAudioData((prev) => {
            const newMap = new Map(prev);
            newMap.set(currentScene.id, { audioUrl, duration });
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

  const goToPrevious = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentSceneIndex < totalScenes - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    }
  };

  const skipScene = () => {
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
    handleClose();
  };

  const handleClose = () => {
    if (recordingState === "recording") {
      toast.warning("Please stop recording first");
      return;
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
                disabled={recordingState === "recording"}
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
                  <div className="w-full h-full max-w-5xl max-h-[600px] mx-auto">
                    <VideoCanvas
                      scene={currentScene}
                      theme={currentTheme}
                      onContentChange={() => {}}
                      onAnnotationChange={() => {}}
                      isReadOnly={true}
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
                    disabled={currentSceneIndex === 0 || recordingState === "recording"}
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
                        onClick={stopRecording}
                        size="lg"
                        variant="destructive"
                        className="gap-2 h-12"
                      >
                        <Square className="h-5 w-5 fill-current" />
                        Stop
                      </Button>
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
                        onClick={startRecording}
                        variant="outline"
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
                        disabled={recordingState === "recording"}
                      >
                        <SkipForward className="h-4 w-4 mr-1" />
                        Skip
                      </Button>
                      <Button
                        onClick={goToNext}
                        disabled={recordingState === "recording"}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleComplete}
                      disabled={recordingState === "recording"}
                      className="gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Done
                    </Button>
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
