"use client";

import { useState, useEffect } from 'react';
import { Player } from '@remotion/player';
import { VideoComposition } from '@/remotion/VideoComposition';
import type { Scene, Theme } from '@/types';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { prepareVideoAssets, type AssetPreparationProgress } from '@/lib/assetPreparation';
import { AssetPreparationModal } from './AssetPreparationModal';
import type { TransitionType, TransitionDirection, CaptionSettings } from './VideoSettingsPanel';

interface VideoSettings {
  captions: CaptionSettings;
  transitionType: TransitionType;
  transitionDirection: TransitionDirection;
  slideAnimations: boolean;
  animationStyle: "fade" | "slide" | "zoom" | "none";
}

interface VideoPreviewPanelProps {
  scenes: Scene[];
  theme: Theme;
  voice: string;
  videoSettings?: VideoSettings;
  onClose: () => void;
  onScenesUpdate?: (scenes: Scene[]) => void;
}

const FPS = 30;

export function VideoPreviewPanel({ scenes, theme, voice, videoSettings, onClose, onScenesUpdate }: VideoPreviewPanelProps) {
  const [preparedScenes, setPreparedScenes] = useState<Scene[] | null>(null);
  const [progress, setProgress] = useState<AssetPreparationProgress>({
    total: 0,
    completed: 0,
    currentTask: 'Initializing...',
    status: 'preparing',
  });
  const [isCancelled, setIsCancelled] = useState(false);

  // Prepare assets when component mounts
  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      try {
        const prepared = await prepareVideoAssets(scenes, setProgress, voice);

        // Check if cancelled during preparation
        if (cancelled || isCancelled) {
          return;
        }

        setPreparedScenes(prepared);
        // Update parent component with prepared scenes (includes audio URLs)
        if (onScenesUpdate) {
          onScenesUpdate(prepared);
        }
      } catch (error) {
        if (cancelled || isCancelled) {
          return;
        }
        console.error('Failed to prepare assets:', error);
        setProgress({
          ...progress,
          status: 'error',
          currentTask: 'Failed to prepare assets',
        });
      }
    }
    prepare();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCancel = () => {
    setIsCancelled(true);
    onClose();
  };

  // Show preparation modal while assets are being prepared
  if (!preparedScenes || progress.status === 'preparing') {
    return <AssetPreparationModal progress={progress} onCancel={handleCancel} />;
  }

  // Show error if preparation failed
  if (progress.status === 'error') {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
        <div className="bg-card rounded-lg shadow-2xl max-w-md w-full p-6">
          <h2 className="text-lg font-semibold mb-4">Preparation Failed</h2>
          <p className="text-muted-foreground mb-4">{progress.currentTask}</p>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    );
  }

  // Calculate total duration in frames
  const totalDurationInFrames = preparedScenes.reduce((total, scene) => {
    return total + Math.round(scene.duration * FPS);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
      <div className="bg-card rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Video Preview</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                alert('Export functionality coming soon!');
              }}
            >
              <Download className="h-4 w-4" />
              Export MP4
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-muted/20">
          <div className="w-full" style={{ maxWidth: '90vw' }}>
            <Player
              component={VideoComposition}
              inputProps={{
                scenes: preparedScenes,
                theme,
                fps: FPS,
                videoSettings: videoSettings || {
                  captions: {
                    enabled: false,
                    style: "full-text",
                    position: "bottom",
                    maxLines: 2,
                    highlightColor: "#ff7900",
                  },
                  transitionType: "none",
                  transitionDirection: "from-right",
                  slideAnimations: false,
                  animationStyle: "none",
                },
              }}
              durationInFrames={totalDurationInFrames}
              fps={FPS}
              compositionWidth={1920}
              compositionHeight={1080}
              style={{
                width: '100%',
                aspectRatio: '16/9',
              }}
              controls
              loop
            />
          </div>
        </div>

        {/* Info */}
        <div className="p-4 border-t border-border bg-muted/5">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>{preparedScenes.length} scenes</span>
              <span>•</span>
              <span>{(totalDurationInFrames / FPS).toFixed(1)}s duration</span>
              <span>•</span>
              <span>{FPS} FPS</span>
              <span>•</span>
              <span>1920x1080</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
