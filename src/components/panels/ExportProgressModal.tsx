"use client";

import { Loader2, Download, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportProgressModalProps {
  status: "bundling" | "rendering" | "success" | "error";
  progress?: number;
  error?: string;
  onClose: () => void;
  onDownload?: () => void;
}

export function ExportProgressModal({
  status,
  progress = 0,
  error,
  onClose,
  onDownload,
}: ExportProgressModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
      <div className="bg-card rounded-lg shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            {status === "success" ? "Export Complete" : "Exporting Video"}
          </h2>
          {status !== "rendering" && status !== "bundling" && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Status Content */}
        <div className="space-y-4">
          {status === "bundling" && (
            <>
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Preparing video bundle... This may take 30-60 seconds on first export.
                </p>
              </div>
            </>
          )}

          {status === "rendering" && (
            <>
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Rendering your video... This may take a few minutes.
                </p>
              </div>
              {progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex items-center gap-3 text-green-600">
                <Download className="h-5 w-5" />
                <p className="text-sm">
                  Your video has been exported successfully!
                </p>
              </div>
              {onDownload && (
                <Button
                  className="w-full gap-2"
                  style={{ backgroundColor: "#ff7900" }}
                  onClick={onDownload}
                >
                  <Download className="h-4 w-4" />
                  Download Video
                </Button>
              )}
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">Export failed</p>
              </div>
              {error && (
                <p className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  {error}
                </p>
              )}
              <Button variant="outline" className="w-full" onClick={onClose}>
                Close
              </Button>
            </>
          )}
        </div>

        {/* Info */}
        {(status === "bundling" || status === "rendering") && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Please don't close this window
          </p>
        )}
      </div>
    </div>
  );
}
