import { Variants } from "framer-motion";
import { ElementAnimation, AnimationType } from "@/types";

/**
 * Converts animation type to Framer Motion variants
 */
export function getAnimationVariants(animation: ElementAnimation): Variants {
  const { type, duration, delay, easing } = animation;

  // Map custom easing names to Framer Motion easings
  const easingMap: Record<string, any> = {
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    backOut: [0.34, 1.56, 0.64, 1],
    anticipate: "anticipate",
  };

  const baseTransition = {
    duration,
    delay,
    ease: easingMap[easing] || easingMap.easeOut,
  };

  switch (type) {
    case "fade":
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: baseTransition,
      };

    case "slideInLeft":
      return {
        initial: { opacity: 0, x: -100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 },
        transition: baseTransition,
      };

    case "slideInRight":
      return {
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 100 },
        transition: baseTransition,
      };

    case "slideInUp":
      return {
        initial: { opacity: 0, y: 100 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 100 },
        transition: baseTransition,
      };

    case "slideInDown":
      return {
        initial: { opacity: 0, y: -100 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -100 },
        transition: baseTransition,
      };

    case "scaleIn":
      return {
        initial: { opacity: 0, scale: 0.5 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.5 },
        transition: baseTransition,
      };

    case "rotateIn":
      return {
        initial: { opacity: 0, rotate: -180, scale: 0.5 },
        animate: { opacity: 1, rotate: 0, scale: 1 },
        exit: { opacity: 0, rotate: 180, scale: 0.5 },
        transition: baseTransition,
      };

    case "none":
    default:
      return {
        initial: {},
        animate: {},
        exit: {},
      };
  }
}

/**
 * Get animation props for motion component
 */
export function getAnimationProps(animation?: ElementAnimation) {
  if (!animation || animation.type === "none") {
    return {
      initial: false,
      animate: {},
    };
  }

  const { type, duration, delay, easing } = animation;

  // Map custom easing names to Framer Motion easings
  const easingMap: Record<string, any> = {
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    backOut: [0.34, 1.56, 0.64, 1],
    anticipate: "anticipate",
  };

  const transition = {
    duration,
    delay,
    ease: easingMap[easing] || easingMap.easeOut,
  };

  // Return animation config without variants (direct props)
  switch (type) {
    case "fade":
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition,
      };

    case "slideInLeft":
      return {
        initial: { opacity: 0, x: -100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 },
        transition,
      };

    case "slideInRight":
      return {
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 100 },
        transition,
      };

    case "slideInUp":
      return {
        initial: { opacity: 0, y: 100 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 100 },
        transition,
      };

    case "slideInDown":
      return {
        initial: { opacity: 0, y: -100 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -100 },
        transition,
      };

    case "scaleIn":
      return {
        initial: { opacity: 0, scale: 0.5 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.5 },
        transition,
      };

    case "rotateIn":
      return {
        initial: { opacity: 0, rotate: -180, scale: 0.5 },
        animate: { opacity: 1, rotate: 0, scale: 1 },
        exit: { opacity: 0, rotate: 180, scale: 0.5 },
        transition,
      };

    default:
      return {
        initial: {},
        animate: {},
        exit: {},
      };
  }
}
