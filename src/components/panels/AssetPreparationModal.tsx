"use client";

import { motion } from 'framer-motion';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import type { AssetPreparationProgress } from '@/lib/assetPreparation';

interface AssetPreparationModalProps {
  progress: AssetPreparationProgress;
}

export function AssetPreparationModal({ progress }: AssetPreparationModalProps) {
  const percentage = progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-lg shadow-2xl max-w-md w-full p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {progress.status === 'preparing' && (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          )}
          {progress.status === 'ready' && (
            <Check className="h-6 w-6 text-green-500" />
          )}
          {progress.status === 'error' && (
            <AlertCircle className="h-6 w-6 text-destructive" />
          )}
          <h2 className="text-lg font-semibold">
            {progress.status === 'preparing' && 'Preparing Video Assets'}
            {progress.status === 'ready' && 'Assets Ready!'}
            {progress.status === 'error' && 'Preparation Failed'}
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>{progress.currentTask}</span>
            <span>{percentage}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Progress Details */}
        <div className="text-sm text-muted-foreground">
          {progress.completed} of {progress.total} assets processed
        </div>

        {/* Info */}
        {progress.status === 'preparing' && (
          <div className="mt-4 p-3 bg-muted/20 rounded-lg text-xs text-muted-foreground">
            <p>We're preparing your audio and images for the video preview.</p>
            <p className="mt-1">This may take a moment depending on the number of scenes.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
