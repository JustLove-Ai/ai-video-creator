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
  | "comparison";

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
  leftColumn?: string;
  rightColumn?: string;
  imageBleed?: boolean; // When true, image stretches to edges
  chartData?: ChartData; // Chart data for chart layouts
  chartData2?: ChartData; // For comparison layout
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
export type AnnotationType = "freehand" | "arrow" | "rectangle" | "circle" | "line" | "text";

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
  imageUrl?: string;  // Base64 data URL for scene image
  audioUrl?: string;  // AI-generated TTS audio URL
  recordedAudioUrl?: string;  // User-recorded audio URL (takes priority over audioUrl)
}

// Panel Types
export type RightPanelType = "layout" | "theme" | "imageUpload" | "charts" | "videoSettings" | null;

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
  | "annotations";
