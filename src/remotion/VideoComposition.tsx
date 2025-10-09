import { AbsoluteFill, Audio, Sequence, staticFile, interpolate, useCurrentFrame } from 'remotion';
import type { Scene, Theme } from '@/types';
import { RemotionScene } from './RemotionScene';

export interface CaptionSettings {
  enabled: boolean;
  style: "full-text" | "word-by-word" | "line-by-line";
  position: "bottom" | "top" | "center";
  maxLines: number;
  highlightColor: string;
}

export interface VideoSettings {
  captions: CaptionSettings;
  transitionType: "fade" | "slide" | "wipe" | "flip" | "clockWipe" | "iris" | "none";
  transitionDirection: "from-left" | "from-right" | "from-top" | "from-bottom";
  slideAnimations: boolean;
  animationStyle: "fade" | "slide" | "zoom" | "none";
}

export interface VideoCompositionProps {
  scenes: Scene[];
  theme: Theme;
  fps: number;
  videoSettings?: VideoSettings;
}

interface SceneWithDuration extends Scene {
  durationInFrames: number;
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  scenes,
  theme,
  fps,
  videoSettings,
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

  const transitionDuration = 15; // frames for transition (0.5s at 30fps)

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {scenesWithFrames.map((scene, index) => {
        const isLastScene = index === scenesWithFrames.length - 1;

        return (
          <Sequence
            key={scene.id}
            from={scene.from}
            durationInFrames={scene.durationInFrames}
          >
            <SceneComponent
              scene={scene}
              theme={theme}
              videoSettings={videoSettings}
              transitionDuration={transitionDuration}
              isLastScene={isLastScene}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

interface SceneComponentProps {
  scene: Scene;
  theme: Theme;
  videoSettings?: VideoSettings;
  transitionDuration: number;
  isLastScene: boolean;
}

const SceneComponent: React.FC<SceneComponentProps> = ({
  scene,
  theme,
  videoSettings,
  transitionDuration,
  isLastScene,
}) => {
  const frame = useCurrentFrame();
  const sceneDuration = Math.round(scene.duration * 30); // Assuming 30 FPS

  // Calculate transition opacity (fade in at start, fade out at end)
  let opacity = 1;
  if (videoSettings?.transitionType === "fade") {
    // Fade in at start
    if (frame < transitionDuration) {
      opacity = interpolate(frame, [0, transitionDuration], [0, 1]);
    }
    // Fade out at end (only if not last scene)
    if (!isLastScene && frame > sceneDuration - transitionDuration) {
      opacity = interpolate(frame, [sceneDuration - transitionDuration, sceneDuration], [1, 0]);
    }
  }

  // Calculate transition transform (slide, wipe, etc.)
  let transform = '';
  if (videoSettings?.transitionType === "slide" && frame < transitionDuration) {
    const progress = interpolate(frame, [0, transitionDuration], [1, 0]);
    switch (videoSettings.transitionDirection) {
      case "from-left":
        transform = `translateX(${progress * -100}%)`;
        break;
      case "from-right":
        transform = `translateX(${progress * 100}%)`;
        break;
      case "from-top":
        transform = `translateY(${progress * -100}%)`;
        break;
      case "from-bottom":
        transform = `translateY(${progress * 100}%)`;
        break;
    }
  }

  return (
    <AbsoluteFill style={{ opacity, transform }}>
      {/* Render the scene */}
      <RemotionScene scene={scene} theme={theme} />

      {/* Render captions if enabled */}
      {videoSettings?.captions.enabled && scene.content && (
        <CaptionRenderer
          text={scene.content}
          settings={videoSettings.captions}
          frame={frame}
          sceneDuration={sceneDuration}
        />
      )}

      {/* Render audio if available (prioritize recorded audio over AI audio) */}
      {(scene.recordedAudioUrl || scene.audioUrl) && (
        <Audio src={staticFile(scene.recordedAudioUrl || scene.audioUrl!)} pauseWhenBuffering />
      )}
    </AbsoluteFill>
  );
};

// Caption Renderer Component
interface CaptionRendererProps {
  text: string;
  settings: CaptionSettings;
  frame: number;
  sceneDuration: number;
}

const CaptionRenderer: React.FC<CaptionRendererProps> = ({ text, settings, frame, sceneDuration }) => {
  const words = text.split(' ');
  const totalWords = words.length;

  // Calculate which word should be highlighted (for word-by-word)
  const currentWordIndex = settings.style === 'word-by-word'
    ? Math.min(Math.floor((frame / sceneDuration) * totalWords), totalWords - 1)
    : -1;

  // Position styles
  const positionStyles = {
    bottom: { justifyContent: 'flex-end', alignItems: 'center', padding: '60px' },
    top: { justifyContent: 'flex-start', alignItems: 'center', padding: '60px' },
    center: { justifyContent: 'center', alignItems: 'center', padding: '60px' },
  };

  return (
    <AbsoluteFill style={positionStyles[settings.position]}>
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
          padding: '30px 50px',
          borderRadius: '12px',
          fontSize: '48px',
          fontWeight: 600,
          maxWidth: '85%',
          textAlign: 'center',
          lineHeight: 1.5,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center',
        }}
      >
        {settings.style === 'word-by-word' ? (
          // Word-by-word with highlighting
          words.map((word, index) => (
            <span
              key={index}
              style={{
                color: index === currentWordIndex ? settings.highlightColor : 'white',
                fontWeight: index === currentWordIndex ? 700 : 600,
                transition: 'all 0.2s ease',
              }}
            >
              {word}
            </span>
          ))
        ) : settings.style === 'line-by-line' ? (
          // Line-by-line (split by max lines)
          <div style={{ width: '100%' }}>
            {splitIntoLines(text, settings.maxLines).map((line, index) => (
              <div key={index} style={{ marginBottom: index < settings.maxLines - 1 ? '16px' : 0 }}>
                {line}
              </div>
            ))}
          </div>
        ) : (
          // Full text
          <span>{text}</span>
        )}
      </div>
    </AbsoluteFill>
  );
};

// Helper function to split text into lines
function splitIntoLines(text: string, maxLines: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  const wordsPerLine = Math.ceil(words.length / maxLines);

  for (let i = 0; i < maxLines; i++) {
    const start = i * wordsPerLine;
    const end = Math.min(start + wordsPerLine, words.length);
    const line = words.slice(start, end).join(' ');
    if (line) lines.push(line);
  }

  return lines;
}
