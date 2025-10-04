import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import type { Scene, Theme } from '@/types';
import { RemotionScene } from './RemotionScene';

export interface VideoCompositionProps {
  scenes: Scene[];
  theme: Theme;
  fps: number;
}

interface SceneWithDuration extends Scene {
  durationInFrames: number;
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  scenes,
  theme,
  fps,
}) => {
  // Calculate frame position for each scene
  let currentFrame = 0;
  const scenesWithFrames: Array<SceneWithDuration & { from: number }> = scenes.map((scene) => {
    const durationInFrames = Math.round(scene.duration * fps);
    const sceneWithFrames = {
      ...scene,
      durationInFrames,
      from: currentFrame,
    };
    currentFrame += durationInFrames;
    return sceneWithFrames;
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {scenesWithFrames.map((scene, index) => (
        <Sequence
          key={scene.id}
          from={scene.from}
          durationInFrames={scene.durationInFrames}
        >
          <SceneComponent scene={scene} theme={theme} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

interface SceneComponentProps {
  scene: Scene;
  theme: Theme;
}

const SceneComponent: React.FC<SceneComponentProps> = ({ scene, theme }) => {
  return (
    <AbsoluteFill>
      {/* Render the scene */}
      <RemotionScene scene={scene} theme={theme} />

      {/* Render audio if available */}
      {scene.audioUrl && (
        <Audio
          src={staticFile(scene.audioUrl)}
          pauseWhenBuffering
        />
      )}
    </AbsoluteFill>
  );
};
