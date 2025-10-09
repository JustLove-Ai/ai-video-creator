"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Trash2, Check } from "lucide-react";

interface VoiceRecorderProps {
  sceneId: string;
  existingAudioUrl?: string;
  onRecordingComplete: (audioUrl: string, duration: number) => void;
  onRecordingDelete: () => void;
}

export function VoiceRecorder({
  sceneId,
  existingAudioUrl,
  onRecordingComplete,
  onRecordingDelete,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(existingAudioUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setAudioUrl(existingAudioUrl);
  }, [existingAudioUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
        const audioUrl = URL.createObjectURL(audioBlob);

        // Convert to MP3 and save to server
        const formData = new FormData();
        formData.append("audio", audioBlob);
        formData.append("sceneId", sceneId);

        try {
          const response = await fetch("/api/save-recording", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            setAudioUrl(data.url);

            // Get audio duration
            const audio = new Audio(audioUrl);
            audio.onloadedmetadata = () => {
              onRecordingComplete(data.url, Math.ceil(audio.duration));
              URL.revokeObjectURL(audioUrl);
            };
          } else {
            console.error("Failed to save recording");
          }
        } catch (error) {
          console.error("Error saving recording:", error);
        }

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
      alert("Could not access microphone. Please check permissions.");
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

  const playRecording = () => {
    if (audioUrl) {
      if (isPlaying) {
        audioElementRef.current?.pause();
        setIsPlaying(false);
      } else {
        const audio = new Audio(audioUrl);
        audioElementRef.current = audio;
        audio.play();
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
      }
    }
  };

  const deleteRecording = () => {
    setAudioUrl(undefined);
    setRecordingTime(0);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setIsPlaying(false);
    onRecordingDelete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-1">
      {!audioUrl && !isRecording && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={startRecording}
          title="Record your voice"
        >
          <Mic className="h-3 w-3" />
        </Button>
      )}

      {isRecording && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-500 animate-pulse"
            onClick={stopRecording}
            title="Stop recording"
          >
            <Square className="h-3 w-3 fill-current" />
          </Button>
          <span className="text-xs text-red-500">{formatTime(recordingTime)}</span>
        </>
      )}

      {audioUrl && !isRecording && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 ${isPlaying ? "text-primary" : "text-blue-500"}`}
            onClick={playRecording}
            title={isPlaying ? "Stop playback" : "Play recording"}
          >
            <Play className="h-3 w-3" />
          </Button>
          <div className="flex items-center">
            <Check className="h-3 w-3 text-blue-500" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={deleteRecording}
            title="Delete recording"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </>
      )}
    </div>
  );
}
