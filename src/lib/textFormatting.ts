import { TextFormatting } from "@/types";

/**
 * Applies text formatting to a base style object
 */
export function applyTextFormatting(
  baseStyle: React.CSSProperties,
  formatting?: TextFormatting
): React.CSSProperties {
  if (!formatting) return baseStyle;

  return {
    ...baseStyle,
    fontWeight: formatting.bold ? "bold" : baseStyle.fontWeight,
    fontStyle: formatting.italic ? "italic" : baseStyle.fontStyle,
    textDecoration: formatting.underline ? "underline" : baseStyle.textDecoration,
    color: formatting.color || baseStyle.color,
    fontFamily: formatting.fontFamily || baseStyle.fontFamily,
  };
}
