import { AnimationConfig, ElementAnimation, DEFAULT_ANIMATIONS } from "@/types";

/**
 * Gets animation for a specific element with fallback to default
 */
export function getElementAnimation(
  animationConfig: AnimationConfig | undefined,
  element: keyof AnimationConfig
): ElementAnimation {
  // If config exists and has this element, use it
  if (animationConfig && animationConfig[element]) {
    return animationConfig[element]!;
  }

  // Otherwise return default fade animation
  return { ...DEFAULT_ANIMATIONS.fade };
}

/**
 * Gets full animation config with defaults for all elements
 */
export function getAnimationConfigWithDefaults(
  animationConfig: AnimationConfig | undefined,
  elements: Array<keyof AnimationConfig>
): AnimationConfig {
  const config: AnimationConfig = {};

  elements.forEach((element) => {
    config[element] = getElementAnimation(animationConfig, element);
  });

  return config;
}
