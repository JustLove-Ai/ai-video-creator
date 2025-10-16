// Layout Types
export type LayoutType =
  | "cover"
  | "imageLeft"
  | "imageRight"
  | "imageBullets"
  | "fullImage"
  | "twoColumn"
  | "titleBody"
  | "blank"
  | "centeredChart"
  | "comparison"
  | "quote"
  | "steps2"
  | "steps3"
  | "steps5"
  | "imageGrid2"
  | "imageGrid4"
  | "imageGrid6"
  | "centeredImageMedium"
  | "centeredImageLarge"
  | "imageBulletsBleedLeft"
  | "imageBulletsBleedRight";

// Image alignment options
export type ImageAlignment = "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
export type ImageFit = "cover" | "contain" | "fill" | "none" | "scale-down";

// Chart Data
export interface ChartData {
  type: "bar" | "pie" | "line" | "funnel";
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
  showLegend?: boolean;
  legendPosition?: "top" | "bottom" | "left" | "right";
}

// Layout Content - different layouts use different fields
export interface LayoutContent {
  title?: string;
  subtitle?: string;
  body?: string;
  bulletPoints?: string[];
  imageUrl?: string;
  imageUrl2?: string; // For comparison layout
  imageUrl3?: string; // For image grids
  imageUrl4?: string; // For image grids
  imageUrl5?: string; // For image grids
  imageUrl6?: string; // For image grids
  leftColumn?: string;
  rightColumn?: string;
  imageBleed?: boolean; // When true, image stretches to edges (default: true)
  imageAlignment?: ImageAlignment; // Default "center"
  imageFit?: ImageFit; // Default "cover"
  chartData?: ChartData; // Chart data for chart layouts
  chartData2?: ChartData; // For comparison layout
  // Quote layout
  quote?: string;
  quoteAuthor?: string;
  // Step-by-step layouts
  steps?: Array<{ title: string; description: string }>;
  // Visibility toggles
  showTitle?: boolean; // Default true
  showSubtitle?: boolean; // Default true
  showBody?: boolean; // Default true
  showLeftColumn?: boolean; // Default true
  showRightColumn?: boolean; // Default true
}

// Theme System
export interface Theme {
  id: string;
  name: string;
  background: {
    type: "solid" | "gradient";
    color: string;
    gradientFrom?: string;
    gradientTo?: string;
  };
  typography: {
    titleFont: string;
    bodyFont: string;
    titleSize: number;
    bodySize: number;
    titleWeight: string;
    bodyWeight: string;
    titleColor: string;
    bodyColor: string;
  };
  spacing: {
    padding: number;
    gap: number;
  };
  accent: string;
}

// Annotation System
export type AnnotationType = "freehand" | "arrow" | "rectangle" | "circle" | "line" | "text" | "eraser";

export interface AnnotationElement {
  id: string;
  type: AnnotationType;
  points?: { x: number; y: number }[];  // For freehand and polylines
  x: number;
  y: number;
  width?: number;
  height?: number;
  endX?: number;  // For line and arrow
  endY?: number;
  stroke: string;
  strokeWidth: number;
  fill?: string;
  opacity: number;
  text?: string;  // For text annotations
  fontSize?: number;
}

// Scene (updated)
export interface Scene {
  id: string;
  content: string;  // Script/narration
  duration: number;
  layout: LayoutType;
  layoutContent: LayoutContent;
  annotations: AnnotationElement[];
  themeOverride?: Partial<Theme>;
  animationConfig?: AnimationConfig;  // Per-element animation settings
  imageUrl?: string;  // Base64 data URL for scene image
  audioUrl?: string;  // AI-generated TTS audio URL
  recordedAudioUrl?: string;  // User-recorded audio URL (takes priority over audioUrl)
}

// Animation System
export type AnimationType =
  | "fade"
  | "slideInLeft"
  | "slideInRight"
  | "slideInUp"
  | "slideInDown"
  | "scaleIn"
  | "rotateIn"
  | "none";

export interface ElementAnimation {
  type: AnimationType;
  duration: number; // in seconds
  delay: number; // in seconds
  easing: "linear" | "easeIn" | "easeOut" | "easeInOut" | "backOut" | "anticipate";
}

export interface AnimationConfig {
  title?: ElementAnimation;
  subtitle?: ElementAnimation;
  body?: ElementAnimation;
  image?: ElementAnimation;
  leftColumn?: ElementAnimation;
  rightColumn?: ElementAnimation;
  bulletPoints?: ElementAnimation;
}

// Default animation presets
export const DEFAULT_ANIMATIONS: Record<string, ElementAnimation> = {
  fade: { type: "fade", duration: 0.6, delay: 0, easing: "easeOut" },
  slideInLeft: { type: "slideInLeft", duration: 0.8, delay: 0, easing: "easeOut" },
  slideInRight: { type: "slideInRight", duration: 0.8, delay: 0, easing: "easeOut" },
  slideInUp: { type: "slideInUp", duration: 0.8, delay: 0, easing: "easeOut" },
  slideInDown: { type: "slideInDown", duration: 0.8, delay: 0, easing: "easeOut" },
  scaleIn: { type: "scaleIn", duration: 0.6, delay: 0, easing: "backOut" },
  rotateIn: { type: "rotateIn", duration: 0.8, delay: 0, easing: "easeOut" },
  none: { type: "none", duration: 0, delay: 0, easing: "linear" },
};

// Panel Types
export type RightPanelType = "layout" | "theme" | "animation" | "imageUpload" | "charts" | "videoSettings" | null;

// Tool Types (extended)
export type ToolType =
  | "avatars"
  | "text"
  | "media"
  | "elements"
  | "captions"
  | "ai"
  | "background"
  | "layout"
  | "theme"
  | "animation"
  | "annotations";
