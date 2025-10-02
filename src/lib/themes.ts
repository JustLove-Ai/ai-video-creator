import { Theme } from "@/types";

// Default theme presets
export const themePresets: Theme[] = [
  {
    id: "light-minimalist",
    name: "Light Minimalist",
    background: {
      type: "solid",
      color: "#FFFFFF",
    },
    typography: {
      titleFont: "system-ui, -apple-system, sans-serif",
      bodyFont: "system-ui, -apple-system, sans-serif",
      titleSize: 48,
      bodySize: 18,
      titleWeight: "700",
      bodyWeight: "400",
      titleColor: "#1a1a1a",
      bodyColor: "#4a4a4a",
    },
    spacing: {
      padding: 48,
      gap: 24,
    },
    accent: "#3b82f6",
  },
  {
    id: "professional-dark",
    name: "Professional Dark",
    background: {
      type: "solid",
      color: "#0f172a",
    },
    typography: {
      titleFont: "system-ui, -apple-system, sans-serif",
      bodyFont: "system-ui, -apple-system, sans-serif",
      titleSize: 48,
      bodySize: 18,
      titleWeight: "700",
      bodyWeight: "400",
      titleColor: "#f8fafc",
      bodyColor: "#cbd5e1",
    },
    spacing: {
      padding: 48,
      gap: 24,
    },
    accent: "#60a5fa",
  },
  {
    id: "bold-colorful",
    name: "Bold Colorful",
    background: {
      type: "gradient",
      color: "#ec4899",
      gradientFrom: "#ec4899",
      gradientTo: "#8b5cf6",
    },
    typography: {
      titleFont: "system-ui, -apple-system, sans-serif",
      bodyFont: "system-ui, -apple-system, sans-serif",
      titleSize: 56,
      bodySize: 20,
      titleWeight: "900",
      bodyWeight: "500",
      titleColor: "#ffffff",
      bodyColor: "#f3e8ff",
    },
    spacing: {
      padding: 56,
      gap: 28,
    },
    accent: "#fbbf24",
  },
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    background: {
      type: "solid",
      color: "#eff6ff",
    },
    typography: {
      titleFont: "system-ui, -apple-system, sans-serif",
      bodyFont: "system-ui, -apple-system, sans-serif",
      titleSize: 44,
      bodySize: 17,
      titleWeight: "600",
      bodyWeight: "400",
      titleColor: "#1e40af",
      bodyColor: "#475569",
    },
    spacing: {
      padding: 44,
      gap: 22,
    },
    accent: "#2563eb",
  },
  {
    id: "creative-gradient",
    name: "Creative Gradient",
    background: {
      type: "gradient",
      color: "#a855f7",
      gradientFrom: "#a855f7",
      gradientTo: "#ec4899",
    },
    typography: {
      titleFont: "system-ui, -apple-system, sans-serif",
      bodyFont: "system-ui, -apple-system, sans-serif",
      titleSize: 52,
      bodySize: 19,
      titleWeight: "800",
      bodyWeight: "400",
      titleColor: "#ffffff",
      bodyColor: "#fae8ff",
    },
    spacing: {
      padding: 52,
      gap: 26,
    },
    accent: "#fbbf24",
  },
  {
    id: "monochrome",
    name: "Monochrome",
    background: {
      type: "solid",
      color: "#000000",
    },
    typography: {
      titleFont: "system-ui, -apple-system, sans-serif",
      bodyFont: "system-ui, -apple-system, sans-serif",
      titleSize: 48,
      bodySize: 18,
      titleWeight: "700",
      bodyWeight: "400",
      titleColor: "#ffffff",
      bodyColor: "#d1d5db",
    },
    spacing: {
      padding: 48,
      gap: 24,
    },
    accent: "#9ca3af",
  },
];

// Merge theme with override
export function mergeTheme(baseTheme: Theme, override?: Partial<Theme>): Theme {
  if (!override) return baseTheme;

  return {
    ...baseTheme,
    ...override,
    background: { ...baseTheme.background, ...override.background },
    typography: { ...baseTheme.typography, ...override.typography },
    spacing: { ...baseTheme.spacing, ...override.spacing },
  };
}

// Get theme by ID
export function getThemeById(id: string): Theme {
  return themePresets.find((t) => t.id === id) || themePresets[0];
}

// Get background CSS
export function getBackgroundStyle(theme: Theme): React.CSSProperties {
  if (theme.background.type === "gradient") {
    return {
      background: `linear-gradient(135deg, ${theme.background.gradientFrom} 0%, ${theme.background.gradientTo} 100%)`,
    };
  }
  return {
    backgroundColor: theme.background.color,
  };
}
