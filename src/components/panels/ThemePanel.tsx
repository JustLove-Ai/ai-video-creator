"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Check, Palette } from "lucide-react";
import { Theme } from "@/types";
import { themePresets } from "@/lib/themes";

interface ThemePanelProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme, applyToAll: boolean) => void;
  onClose: () => void;
}

export function ThemePanel({ currentTheme, onThemeChange, onClose }: ThemePanelProps) {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(currentTheme);
  const [customTheme, setCustomTheme] = useState<Theme>(currentTheme);

  const handlePresetSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setCustomTheme(theme);
    // Apply to current slide immediately for preview
    onThemeChange(theme, false);
  };

  const handleApply = (applyToAll: boolean) => {
    onThemeChange(customTheme, applyToAll);
    onClose();
  };

  const updateCustomTheme = (updates: Partial<Theme>) => {
    const newTheme = { ...customTheme, ...updates };
    setCustomTheme(newTheme);
    // Apply immediately for live preview
    onThemeChange(newTheme, false);
  };

  return (
    <motion.div
      initial={{ x: 360 }}
      animate={{ x: 0 }}
      exit={{ x: 360 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed right-0 top-16 bottom-0 w-[360px] bg-card border-l border-border shadow-xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold">Choose Theme</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="presets" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="customize">Customize</TabsTrigger>
        </TabsList>

        {/* Presets Tab */}
        <TabsContent value="presets" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {themePresets.map((theme) => {
                const isActive = selectedTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handlePresetSelect(theme)}
                    className={`w-full border-2 rounded-lg overflow-hidden transition-all hover:scale-102 ${
                      isActive
                        ? "border-primary shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div
                      className="h-20 p-3 flex flex-col justify-between"
                      style={{
                        background:
                          theme.background.type === "gradient"
                            ? `linear-gradient(135deg, ${theme.background.gradientFrom} 0%, ${theme.background.gradientTo} 100%)`
                            : theme.background.color,
                      }}
                    >
                      <div
                        className="text-sm font-semibold"
                        style={{ color: theme.typography.titleColor }}
                      >
                        {theme.name}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: theme.typography.bodyColor }}
                      >
                        Sample text preview
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Customize Tab */}
        <TabsContent value="customize" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Background */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customTheme.background.color}
                    onChange={(e) =>
                      updateCustomTheme({
                        background: { ...customTheme.background, color: e.target.value },
                      })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={customTheme.background.color}
                    onChange={(e) =>
                      updateCustomTheme({
                        background: { ...customTheme.background, color: e.target.value },
                      })
                    }
                    placeholder="#FFFFFF"
                    className="flex-1"
                  />
                </div>
              </div>

              <Separator />

              {/* Typography - Title */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Title Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customTheme.typography.titleColor}
                    onChange={(e) =>
                      updateCustomTheme({
                        typography: { ...customTheme.typography, titleColor: e.target.value },
                      })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={customTheme.typography.titleColor}
                    onChange={(e) =>
                      updateCustomTheme({
                        typography: { ...customTheme.typography, titleColor: e.target.value },
                      })
                    }
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Title Size</Label>
                <Input
                  type="number"
                  value={customTheme.typography.titleSize}
                  onChange={(e) =>
                    updateCustomTheme({
                      typography: {
                        ...customTheme.typography,
                        titleSize: parseInt(e.target.value),
                      },
                    })
                  }
                  min={24}
                  max={72}
                />
              </div>

              <Separator />

              {/* Typography - Body */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Body Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customTheme.typography.bodyColor}
                    onChange={(e) =>
                      updateCustomTheme({
                        typography: { ...customTheme.typography, bodyColor: e.target.value },
                      })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={customTheme.typography.bodyColor}
                    onChange={(e) =>
                      updateCustomTheme({
                        typography: { ...customTheme.typography, bodyColor: e.target.value },
                      })
                    }
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Body Size</Label>
                <Input
                  type="number"
                  value={customTheme.typography.bodySize}
                  onChange={(e) =>
                    updateCustomTheme({
                      typography: {
                        ...customTheme.typography,
                        bodySize: parseInt(e.target.value),
                      },
                    })
                  }
                  min={12}
                  max={32}
                />
              </div>

              <Separator />

              {/* Accent Color */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customTheme.accent}
                    onChange={(e) => updateCustomTheme({ accent: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={customTheme.accent}
                    onChange={(e) => updateCustomTheme({ accent: e.target.value })}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <Separator />

              {/* Spacing */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Padding</Label>
                <Input
                  type="number"
                  value={customTheme.spacing.padding}
                  onChange={(e) =>
                    updateCustomTheme({
                      spacing: { ...customTheme.spacing, padding: parseInt(e.target.value) },
                    })
                  }
                  min={16}
                  max={96}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Gap</Label>
                <Input
                  type="number"
                  value={customTheme.spacing.gap}
                  onChange={(e) =>
                    updateCustomTheme({
                      spacing: { ...customTheme.spacing, gap: parseInt(e.target.value) },
                    })
                  }
                  min={8}
                  max={48}
                />
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button onClick={() => handleApply(false)} className="w-full" variant="outline">
          Apply to Current Slide
        </Button>
        <Button onClick={() => handleApply(true)} className="w-full gap-2">
          <Palette className="h-4 w-4" />
          Apply to All Slides
        </Button>
      </div>
    </motion.div>
  );
}
