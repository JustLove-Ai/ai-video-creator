import { RemotionLayoutRenderer } from './layouts/RemotionLayoutRenderer';
import type { Scene, Theme } from '@/types';

interface RemotionSceneProps {
  scene: Scene;
  theme: Theme;
}

/**
 * Scene renderer for Remotion that uses proper layouts
 */
export function RemotionScene({ scene, theme }: RemotionSceneProps) {
  return <RemotionLayoutRenderer scene={scene} theme={theme} />;
}
