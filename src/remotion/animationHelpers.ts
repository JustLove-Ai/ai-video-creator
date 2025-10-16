import { useCurrentFrame, interpolate, spring } from 'remotion';
import type { ElementAnimation } from '@/types';

/**
 * Get Remotion animation styles based on ElementAnimation config
 * Uses Remotion's spring and interpolate functions
 */
export function useRemotionAnimation(animation?: ElementAnimation, fps: number = 30): React.CSSProperties {
  const frame = useCurrentFrame();

  if (!animation || animation.type === 'none') {
    return {};
  }

  const { type, duration, delay, easing } = animation;
  const delayFrames = Math.round(delay * fps);
  const durationFrames = Math.round(duration * fps);

  // Don't animate before delay
  if (frame < delayFrames) {
    return getInitialStyle(type);
  }

  // Calculate progress (0 to 1) after delay
  const animationFrame = frame - delayFrames;
  const progress = spring({
    frame: animationFrame,
    fps,
    config: {
      damping: easing === 'backOut' ? 10 : 20,
      stiffness: easing === 'easeOut' ? 100 : 200,
      mass: 1,
    },
  });

  // Clamp progress to 0-1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return getAnimatedStyle(type, clampedProgress);
}

/**
 * Get initial styles for animation start
 */
function getInitialStyle(type: string): React.CSSProperties {
  switch (type) {
    case 'fade':
      return { opacity: 0 };
    case 'slideInLeft':
      return { opacity: 0, transform: 'translateX(-100px)' };
    case 'slideInRight':
      return { opacity: 0, transform: 'translateX(100px)' };
    case 'slideInUp':
      return { opacity: 0, transform: 'translateY(100px)' };
    case 'slideInDown':
      return { opacity: 0, transform: 'translateY(-100px)' };
    case 'scaleIn':
      return { opacity: 0, transform: 'scale(0.5)' };
    case 'rotateIn':
      return { opacity: 0, transform: 'rotate(-180deg) scale(0.5)' };
    default:
      return {};
  }
}

/**
 * Get animated styles based on progress (0 to 1)
 */
function getAnimatedStyle(type: string, progress: number): React.CSSProperties {
  const opacity = progress;

  switch (type) {
    case 'fade':
      return { opacity };

    case 'slideInLeft': {
      const x = interpolate(progress, [0, 1], [-100, 0]);
      return {
        opacity,
        transform: `translateX(${x}px)`,
      };
    }

    case 'slideInRight': {
      const x = interpolate(progress, [0, 1], [100, 0]);
      return {
        opacity,
        transform: `translateX(${x}px)`,
      };
    }

    case 'slideInUp': {
      const y = interpolate(progress, [0, 1], [100, 0]);
      return {
        opacity,
        transform: `translateY(${y}px)`,
      };
    }

    case 'slideInDown': {
      const y = interpolate(progress, [0, 1], [-100, 0]);
      return {
        opacity,
        transform: `translateY(${y}px)`,
      };
    }

    case 'scaleIn': {
      const scale = interpolate(progress, [0, 1], [0.5, 1]);
      return {
        opacity,
        transform: `scale(${scale})`,
      };
    }

    case 'rotateIn': {
      const rotate = interpolate(progress, [0, 1], [-180, 0]);
      const scale = interpolate(progress, [0, 1], [0.5, 1]);
      return {
        opacity,
        transform: `rotate(${rotate}deg) scale(${scale})`,
      };
    }

    default:
      return {};
  }
}
