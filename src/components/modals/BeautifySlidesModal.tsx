"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wand2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface BeautifySlidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onComplete: () => void;
}

export function BeautifySlidesModal({
  isOpen,
  onClose,
  projectId,
  onComplete,
}: BeautifySlidesModalProps) {
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleBeautify = async () => {
    setIsBeautifying(true);
    setHasError(false);
    setIsComplete(false);
    setProgressMessage("Beautifying slides...");

    try {
      // Dynamic import to avoid bundling server action in client
      const { beautifySlides } = await import("@/app/actions/openai");

      // Start the beautification process (no polling)
      await beautifySlides(projectId);

      setIsComplete(true);
      setProgressMessage("All slides beautified successfully!");
      toast.success("Slides beautified!", {
        description: "Your slides now have engaging titles, optimized content, and beautiful images.",
      });

      // Wait a moment before calling onComplete to show success state
      setTimeout(() => {
        onComplete();
        handleClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to beautify slides:", error);
      setHasError(true);
      setProgressMessage("Failed to beautify slides");
      toast.error("Failed to beautify slides", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsBeautifying(false);
    }
  };

  const handleClose = () => {
    if (!isBeautifying) {
      setIsComplete(false);
      setHasError(false);
      setCurrentSlide(0);
      setTotalSlides(0);
      setProgressMessage("");
      onClose();
    }
  };

  const progressPercentage = totalSlides > 0 ? (currentSlide / totalSlides) * 100 : 0;

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border rounded-lg shadow-2xl z-50"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Beautify Slides</h2>
                  <p className="text-sm text-muted-foreground">
                    AI-powered slide optimization
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                disabled={isBeautifying}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {!isBeautifying && !isComplete && !hasError && (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                      What will be optimized:
                    </h3>
                    <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Create engaging, descriptive titles (no more "Scene 1")</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Optimize content to be concise and impactful</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Generate relevant images for all slides</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Choose layouts that work best with images</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-muted/50 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Note:</strong> Your narration (voiceover) will remain unchanged. Only the visual content will be optimized.
                    </p>
                  </div>
                </div>
              )}

              {isBeautifying && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{progressMessage}</span>
                      <span className="font-medium">
                        {currentSlide}/{totalSlides}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    This may take a few minutes depending on the number of slides...
                  </p>
                </div>
              )}

              {isComplete && (
                <div className="space-y-4 text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                      Beautification Complete!
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your slides have been optimized with engaging content and beautiful images.
                    </p>
                  </div>
                </div>
              )}

              {hasError && (
                <div className="space-y-4 text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                      Beautification Failed
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {progressMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex items-center justify-end gap-3">
              {!isBeautifying && !isComplete && (
                <>
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBeautify}
                    className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Wand2 className="h-4 w-4" />
                    Start Beautifying
                  </Button>
                </>
              )}

              {hasError && (
                <>
                  <Button variant="outline" onClick={handleClose}>
                    Close
                  </Button>
                  <Button
                    onClick={handleBeautify}
                    className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Try Again
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
