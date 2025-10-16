import { AbsoluteFill } from 'remotion';
import { RemotionLayoutRenderer } from './layouts/RemotionLayoutRenderer';
import { RemotionAnnotations } from './RemotionAnnotations';
import type { Scene, Theme } from '@/types';

interface RemotionSceneProps {
  scene: Scene;
  theme: Theme;
}

/**
 * Scene renderer for Remotion that uses proper layouts
 */
export function RemotionScene({ scene, theme }: RemotionSceneProps) {
  return (
    <AbsoluteFill>
      {/* Render layout */}
      <RemotionLayoutRenderer scene={scene} theme={theme} />

      {/* Render annotations on top */}
      {scene.annotations && scene.annotations.length > 0 && (
        <RemotionAnnotations annotations={scene.annotations} />
      )}
    </AbsoluteFill>
  );
}
