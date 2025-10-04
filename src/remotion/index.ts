import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoComposition"
        component={VideoComposition}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          scenes: [],
          theme: {
            accent: '#FF7900',
            background: { type: 'solid' as const, color: '#ffffff' },
            titleFont: 'Inter',
            bodyFont: 'Inter',
            titleSize: 48,
            bodySize: 24,
            titleWeight: 700,
            bodyWeight: 400,
            titleColor: '#1a1a1a',
            bodyColor: '#666666',
            padding: 60,
            gap: 24,
          },
          fps: 30,
          videoSettings: {
            captions: {
              enabled: false,
              style: 'full-text' as const,
              position: 'bottom' as const,
              maxLines: 2,
              highlightColor: '#ff7900',
            },
            transitionType: 'none' as const,
            transitionDirection: 'from-right' as const,
            slideAnimations: false,
            animationStyle: 'none' as const,
          },
        }}
      />
    </>
  );
};
