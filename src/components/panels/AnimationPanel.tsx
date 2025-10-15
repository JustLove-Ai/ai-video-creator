"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, Play, RotateCcw } from "lucide-react";
import { AnimationConfig, ElementAnimation, AnimationType, DEFAULT_ANIMATIONS } from "@/types";

interface AnimationPanelProps {
  currentAnimationConfig?: AnimationConfig;
  layoutType: string;
  onAnimationChange: (config: AnimationConfig) => void;
  onClose: () => void;
  onPreview?: () => void; // Trigger animation replay
}

// Define which elements are available for each layout type
const getLayoutElements = (layoutType: string): Array<keyof AnimationConfig> => {
  const baseElements: Array<keyof AnimationConfig> = [];

  switch (layoutType) {
    case "cover":
      return ["title", "subtitle"];
    case "imageLeft":
    case "imageRight":
      return ["title", "body", "image"];
    case "imageBullets":
      return ["title", "image", "bulletPoints"];
    case "fullImage":
      return ["title", "subtitle", "image"];
    case "twoColumn":
      return ["title", "leftColumn", "rightColumn"];
    case "titleBody":
      return ["title", "body"];
    case "centeredChart":
      return ["title", "subtitle", "image"]; // chart is treated as image
    case "comparison":
      return ["title", "leftColumn", "rightColumn"];
    case "quote":
      return ["title", "body"]; // quote text as body
    case "steps2":
    case "steps3":
    case "steps5":
      return ["title", "body"]; // steps as body
    case "imageGrid2":
    case "imageGrid4":
    case "imageGrid6":
      return ["title", "image"];
    default:
      return ["title", "body"];
  }
};

const elementLabels: Record<keyof AnimationConfig, string> = {
  title: "Title",
  subtitle: "Subtitle",
  body: "Body Text",
  image: "Image",
  leftColumn: "Left Column",
  rightColumn: "Right Column",
  bulletPoints: "Bullet Points",
};

const animationPresets: Array<{ value: AnimationType; label: string }> = [
  { value: "fade", label: "Fade In" },
  { value: "slideInLeft", label: "Slide from Left" },
  { value: "slideInRight", label: "Slide from Right" },
  { value: "slideInUp", label: "Slide from Bottom" },
  { value: "slideInDown", label: "Slide from Top" },
  { value: "scaleIn", label: "Scale In" },
  { value: "rotateIn", label: "Rotate In" },
  { value: "none", label: "No Animation" },
];

const easingOptions = [
  { value: "linear", label: "Linear" },
  { value: "easeIn", label: "Ease In" },
  { value: "easeOut", label: "Ease Out" },
  { value: "easeInOut", label: "Ease In/Out" },
  { value: "backOut", label: "Back Out" },
  { value: "anticipate", label: "Anticipate" },
];

export function AnimationPanel({
  currentAnimationConfig = {},
  layoutType,
  onAnimationChange,
  onClose,
  onPreview,
}: AnimationPanelProps) {
  const [config, setConfig] = useState<AnimationConfig>(currentAnimationConfig || {});
  const [selectedElement, setSelectedElement] = useState<keyof AnimationConfig | null>(null);

  const layoutElements = getLayoutElements(layoutType);

  // Initialize default animations for elements that don't have them
  const getElementAnimation = (element: keyof AnimationConfig): ElementAnimation => {
    return (config && config[element]) || { ...DEFAULT_ANIMATIONS.fade };
  };

  const updateElementAnimation = (element: keyof AnimationConfig, updates: Partial<ElementAnimation>) => {
    const currentAnimation = getElementAnimation(element);
    const newAnimation = { ...currentAnimation, ...updates };
    const newConfig = { ...(config || {}), [element]: newAnimation };
    setConfig(newConfig);
    onAnimationChange(newConfig);
    // Trigger preview to show animation
    onPreview?.();
  };

  const applyPresetToElement = (element: keyof AnimationConfig, presetType: AnimationType) => {
    const preset = DEFAULT_ANIMATIONS[presetType];
    updateElementAnimation(element, preset);
  };

  const resetToDefaults = () => {
    const defaultConfig: AnimationConfig = {};
    layoutElements.forEach((element) => {
      defaultConfig[element] = { ...DEFAULT_ANIMATIONS.fade };
    });
    setConfig(defaultConfig);
    onAnimationChange(defaultConfig);
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
        <h2 className="text-lg font-semibold">Animations</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPreview?.()}
            title="Preview animations"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={resetToDefaults} title="Reset to defaults">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Element Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Element</Label>
            <Select
              value={selectedElement || undefined}
              onValueChange={(value) => setSelectedElement(value as keyof AnimationConfig)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an element to animate" />
              </SelectTrigger>
              <SelectContent>
                {layoutElements.map((element) => (
                  <SelectItem key={element} value={element}>
                    {elementLabels[element]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedElement && (
            <>
              <Separator />

              {/* Animation Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Animation Type</Label>
                <Select
                  value={getElementAnimation(selectedElement).type}
                  onValueChange={(value) =>
                    applyPresetToElement(selectedElement, value as AnimationType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {animationPresets.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Duration</Label>
                  <span className="text-xs text-muted-foreground">
                    {getElementAnimation(selectedElement).duration.toFixed(1)}s
                  </span>
                </div>
                <Slider
                  value={[getElementAnimation(selectedElement).duration]}
                  onValueChange={([value]) =>
                    updateElementAnimation(selectedElement, { duration: value })
                  }
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Delay */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Delay</Label>
                  <span className="text-xs text-muted-foreground">
                    {getElementAnimation(selectedElement).delay.toFixed(1)}s
                  </span>
                </div>
                <Slider
                  value={[getElementAnimation(selectedElement).delay]}
                  onValueChange={([value]) =>
                    updateElementAnimation(selectedElement, { delay: value })
                  }
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Easing */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Easing</Label>
                <Select
                  value={getElementAnimation(selectedElement).easing}
                  onValueChange={(value) =>
                    updateElementAnimation(selectedElement, {
                      easing: value as ElementAnimation["easing"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {easingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Preview Info */}
              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <div className="text-xs font-medium text-muted-foreground">Current Settings</div>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Element:</span>
                    <span className="font-medium">{elementLabels[selectedElement]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Animation:</span>
                    <span className="font-medium">
                      {animationPresets.find((p) => p.value === getElementAnimation(selectedElement).type)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Time:</span>
                    <span className="font-medium">
                      {(getElementAnimation(selectedElement).duration + getElementAnimation(selectedElement).delay).toFixed(1)}s
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* All Elements Summary */}
          {!selectedElement && layoutElements.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">All Elements</Label>
                <div className="space-y-2">
                  {layoutElements.map((element) => {
                    const animation = getElementAnimation(element);
                    const preset = animationPresets.find((p) => p.value === animation.type);
                    return (
                      <div
                        key={element}
                        className="p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedElement(element)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{elementLabels[element]}</span>
                          <Play className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {preset?.label} • {animation.duration}s
                          {animation.delay > 0 && ` • +${animation.delay}s delay`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground mb-3">
          Click on elements in the canvas to quickly select and edit their animations.
        </div>
        <Button onClick={onClose} className="w-full">
          Done
        </Button>
      </div>
    </motion.div>
  );
}
