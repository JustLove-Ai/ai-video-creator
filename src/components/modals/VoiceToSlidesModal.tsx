"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Square, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface VoiceToSlidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptionComplete: (transcription: string, mode: "exact" | "outline") => Promise<void>;
}

export function VoiceToSlidesModal({
  isOpen,
  onClose,
  onTranscriptionComplete,
}: VoiceToSlidesModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [mode, setMode] = useState<"exact" | "outline">("outline");
  const [audioUrl, setAudioUrl] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

        // Transcribe the audio
        await transcribeAudio(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
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
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to transcribe audio");
      }

      const data = await response.json();
      setTranscription(data.transcription);
      setAudioUrl(data.audioUrl);
      toast.success("Audio transcribed successfully!");
    } catch (error) {
      console.error("Failed to transcribe audio:", error);
      toast.error("Failed to transcribe audio", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleGenerateSlides = async () => {
    if (!transcription.trim()) {
      toast.warning("No transcription available");
      return;
    }

    setIsGenerating(true);

    try {
      await onTranscriptionComplete(transcription, mode);
      toast.success("Slides generated from your voice!");
      handleClose();
    } catch (error) {
      console.error("Failed to generate slides:", error);
      toast.error("Failed to generate slides", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isRecording && !isTranscribing && !isGenerating) {
      setTranscription("");
      setRecordingTime(0);
      setAudioUrl("");
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-lg shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mic className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Voice to Slides</h2>
                  <p className="text-sm text-muted-foreground">Record your voice and turn it into slides</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                disabled={isRecording || isTranscribing || isGenerating}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Recording Section */}
              <div className="space-y-4">
                <div className="text-center">
                  {!isRecording && !transcription && (
                    <Button
                      onClick={startRecording}
                      size="lg"
                      className="gap-2 h-auto py-6 px-8"
                      disabled={isTranscribing}
                    >
                      <Mic className="h-5 w-5" />
                      Start Recording
                    </Button>
                  )}

                  {isRecording && (
                    <div className="space-y-4">
                      <div className="text-6xl font-bold text-red-500 animate-pulse">
                        {formatTime(recordingTime)}
                      </div>
                      <Button
                        onClick={stopRecording}
                        size="lg"
                        variant="destructive"
                        className="gap-2"
                      >
                        <Square className="h-5 w-5 fill-current" />
                        Stop Recording
                      </Button>
                    </div>
                  )}

                  {isTranscribing && (
                    <div className="space-y-4">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                      <p className="text-muted-foreground">Transcribing your audio...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transcription Result */}
              {transcription && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Transcription</Label>
                    <div className="p-4 bg-muted rounded-lg border border-border max-h-[200px] overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">{transcription}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {transcription.length} characters
                    </p>
                  </div>

                  {/* Audio Playback */}
                  {audioUrl && (
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Your Recording</Label>
                      <audio controls className="w-full" src={audioUrl}>
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {/* Mode Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">How should AI use this?</Label>
                    <RadioGroup
                      value={mode}
                      onValueChange={(v) => setMode(v as "exact" | "outline")}
                      disabled={isGenerating}
                    >
                      <div className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="outline" id="outline-voice" className="mt-0.5" />
                        <div className="flex-1">
                          <Label htmlFor="outline-voice" className="font-medium cursor-pointer">
                            Use as Outline (Recommended)
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            AI will enhance your transcription with better structure and visual suggestions.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="exact" id="exact-voice" className="mt-0.5" />
                        <div className="flex-1">
                          <Label htmlFor="exact-voice" className="font-medium cursor-pointer">
                            Use Exact Text
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            AI will use your words exactly and just break them into logical slides.
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {transcription && (
              <div className="p-6 border-t border-border flex items-center justify-between bg-muted/30 flex-shrink-0">
                <p className="text-sm text-muted-foreground">
                  Slides will be created from your transcription
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateSlides} disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Slides...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Slides
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
