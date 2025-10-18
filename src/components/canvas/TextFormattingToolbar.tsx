"use client";

import { useState } from "react";
import { Bold, Italic, Underline, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface TextFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  fontFamily?: string;
}

interface TextFormattingToolbarProps {
  formatting: TextFormatting;
  onChange: (formatting: TextFormatting) => void;
  availableFonts?: string[];
}

const DEFAULT_COLORS = [
  "#FFFFFF", // White
  "#000000", // Black
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA07A", // Orange
  "#98D8C8", // Mint
  "#F7DC6F", // Yellow
  "#BB8FCE", // Purple
  "#85929E", // Gray
];

const DEFAULT_FONTS = [
  "Inter",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Comic Sans MS",
  "Impact",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Playfair Display",
  "Merriweather",
];

export function TextFormattingToolbar({
  formatting,
  onChange,
  availableFonts = DEFAULT_FONTS,
}: TextFormattingToolbarProps) {
  const [customColor, setCustomColor] = useState(formatting.color || "#000000");

  const toggleFormat = (format: keyof TextFormatting) => {
    onChange({
      ...formatting,
      [format]: !formatting[format],
    });
  };

  const handleColorChange = (color: string) => {
    onChange({
      ...formatting,
      color,
    });
  };

  const handleFontChange = (fontFamily: string) => {
    onChange({
      ...formatting,
      fontFamily,
    });
  };

  return (
    <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 shadow-lg">
      {/* Bold */}
      <Button
        variant={formatting.bold ? "secondary" : "ghost"}
        size="sm"
        onClick={() => toggleFormat("bold")}
        className="h-8 w-8 p-0"
      >
        <Bold className="h-4 w-4" />
      </Button>

      {/* Italic */}
      <Button
        variant={formatting.italic ? "secondary" : "ghost"}
        size="sm"
        onClick={() => toggleFormat("italic")}
        className="h-8 w-8 p-0"
      >
        <Italic className="h-4 w-4" />
      </Button>

      {/* Underline */}
      <Button
        variant={formatting.underline ? "secondary" : "ghost"}
        size="sm"
        onClick={() => toggleFormat("underline")}
        className="h-8 w-8 p-0"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Color Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <div
              className="w-4 h-4 rounded border border-border"
              style={{ backgroundColor: formatting.color || "#000000" }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <p className="text-sm font-medium">Text Color</p>

            {/* Default Colors */}
            <div className="grid grid-cols-5 gap-2">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`w-10 h-10 rounded border-2 transition-all hover:scale-110 ${
                    formatting.color === color
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Custom Color */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Custom Color</p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#000000"
                  className="h-8 font-mono text-sm"
                />
                <Button
                  size="sm"
                  onClick={() => handleColorChange(customColor)}
                  className="h-8"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6" />

      {/* Font Selector */}
      <Select
        value={formatting.fontFamily || "Inter"}
        onValueChange={handleFontChange}
      >
        <SelectTrigger className="h-8 w-32 text-xs">
          <Type className="h-3 w-3 mr-1" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableFonts.map((font) => (
            <SelectItem key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
