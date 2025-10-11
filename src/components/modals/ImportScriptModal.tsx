"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ImportScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (script: string, mode: "exact" | "outline") => Promise<void>;
}

export function ImportScriptModal({ isOpen, onClose, onImport }: ImportScriptModalProps) {
  const [script, setScript] = useState("");
  const [mode, setMode] = useState<"exact" | "outline">("outline");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!script.trim()) return;

    setIsGenerating(true);
    try {
      await onImport(script, mode);
      setScript("");
      onClose();
    } catch (error) {
      console.error("Failed to generate scenes:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setScript("");
      onClose();
    }
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] bg-card border border-border rounded-lg shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Import Script</h2>
                  <p className="text-sm text-muted-foreground">Paste your script or outline to generate scenes</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose} disabled={isGenerating}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Script Input */}
              <div className="space-y-2">
                <Label htmlFor="script-input" className="text-base font-medium">
                  Your Script or Outline
                </Label>
                <Textarea
                  id="script-input"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Paste your script here... AI will automatically break it into scenes and create slides.

Example:
Introduction to AI Video Creation
Artificial intelligence is revolutionizing how we create videos...

Benefits of AI Video Tools
- Save time with automated editing
- Generate professional slides
- Add voiceovers instantly

Getting Started
First, you'll need to..."
                  className="min-h-[300px] resize-none font-mono text-sm"
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground">
                  {script.length} characters • AI will analyze and create scenes automatically
                </p>
              </div>

              {/* Mode Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">How should AI use this?</Label>
                <RadioGroup value={mode} onValueChange={(v) => setMode(v as "exact" | "outline")} disabled={isGenerating}>
                  <div className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="outline" id="outline" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="outline" className="font-medium cursor-pointer">
                        Use as Outline (Recommended)
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        AI will use your script as a guide and enhance it with better formatting, structure, and visual suggestions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="exact" id="exact" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="exact" className="font-medium cursor-pointer">
                        Use Exact Text
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        AI will use your script word-for-word and only break it into logical scenes.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex items-center justify-between bg-muted/30 flex-shrink-0">
              <p className="text-sm text-muted-foreground">
                Scenes will be created with appropriate layouts and content
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={!script.trim() || isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Scenes...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Scenes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
