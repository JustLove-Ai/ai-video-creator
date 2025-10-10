"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, Check } from "lucide-react";
import { LayoutType, LayoutContent } from "@/types";
import { getLayoutName, getLayoutDescription } from "@/lib/layouts";

interface LayoutPanelProps {
  currentLayout: LayoutType;
  currentContent: LayoutContent;
  onLayoutSelect: (layout: LayoutType) => void;
  onContentChange: (content: LayoutContent) => void;
  onClose: () => void;
}

const layouts: LayoutType[] = [
  "cover",
  "imageLeft",
  "imageRight",
  "imageBullets",
  "fullImage",
  "twoColumn",
  "titleBody",
  "blank",
];

export function LayoutPanel({ currentLayout, currentContent, onLayoutSelect, onContentChange, onClose }: LayoutPanelProps) {
  // Layouts that support images and can have bleed
  const supportsBleed = ["imageLeft", "imageRight", "imageBullets", "fullImage"].includes(currentLayout);

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
        <h2 className="text-lg font-semibold">Choose Layout</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Layouts Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4 grid grid-cols-2 gap-3">
          {layouts.map((layout) => {
            const isActive = currentLayout === layout;
            return (
              <button
                key={layout}
                onClick={() => {
                  onLayoutSelect(layout);
                  onClose();
                }}
                className={`relative aspect-video border-2 rounded-lg overflow-hidden transition-all hover:scale-105 ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {/* Layout Preview - Simplified visual representation */}
                <div className="w-full h-full p-2 bg-muted/20">
                  {layout === "cover" && (
                    <div className="h-full flex flex-col items-center justify-center gap-1">
                      <div className="w-3/4 h-2 bg-foreground/80 rounded"></div>
                      <div className="w-2/3 h-1.5 bg-foreground/40 rounded"></div>
                    </div>
                  )}
                  {layout === "imageLeft" && (
                    <div className="h-full flex gap-1">
                      <div className="w-2/5 bg-foreground/30 rounded"></div>
                      <div className="flex-1 flex flex-col gap-1 justify-center">
                        <div className="w-full h-2 bg-foreground/80 rounded"></div>
                        <div className="w-full h-1 bg-foreground/40 rounded"></div>
                        <div className="w-3/4 h-1 bg-foreground/40 rounded"></div>
                      </div>
                    </div>
                  )}
                  {layout === "imageRight" && (
                    <div className="h-full flex gap-1">
                      <div className="flex-1 flex flex-col gap-1 justify-center">
                        <div className="w-full h-2 bg-foreground/80 rounded"></div>
                        <div className="w-full h-1 bg-foreground/40 rounded"></div>
                        <div className="w-3/4 h-1 bg-foreground/40 rounded"></div>
                      </div>
                      <div className="w-2/5 bg-foreground/30 rounded"></div>
                    </div>
                  )}
                  {layout === "imageBullets" && (
                    <div className="h-full flex flex-col gap-1">
                      <div className="w-full h-2 bg-foreground/80 rounded"></div>
                      <div className="flex gap-1 flex-1">
                        <div className="w-2/5 bg-foreground/30 rounded"></div>
                        <div className="flex-1 flex flex-col gap-1 justify-center">
                          <div className="w-full h-1 bg-foreground/40 rounded"></div>
                          <div className="w-full h-1 bg-foreground/40 rounded"></div>
                          <div className="w-full h-1 bg-foreground/40 rounded"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {layout === "fullImage" && (
                    <div className="h-full bg-foreground/30 rounded flex items-end p-2">
                      <div className="w-full h-2 bg-white/80 rounded"></div>
                    </div>
                  )}
                  {layout === "twoColumn" && (
                    <div className="h-full flex flex-col gap-1">
                      <div className="w-full h-2 bg-foreground/80 rounded"></div>
                      <div className="flex gap-1 flex-1">
                        <div className="flex-1 flex flex-col gap-0.5">
                          <div className="w-full h-1 bg-foreground/40 rounded"></div>
                          <div className="w-full h-1 bg-foreground/40 rounded"></div>
                        </div>
                        <div className="w-0.5 bg-foreground/20"></div>
                        <div className="flex-1 flex flex-col gap-0.5">
                          <div className="w-full h-1 bg-foreground/40 rounded"></div>
                          <div className="w-full h-1 bg-foreground/40 rounded"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {layout === "titleBody" && (
                    <div className="h-full flex flex-col gap-1 justify-center">
                      <div className="w-3/4 h-2 bg-foreground/80 rounded"></div>
                      <div className="w-full h-1 bg-foreground/40 rounded"></div>
                      <div className="w-full h-1 bg-foreground/40 rounded"></div>
                      <div className="w-2/3 h-1 bg-foreground/40 rounded"></div>
                    </div>
                  )}
                  {layout === "blank" && (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-xs text-foreground/30">Blank</div>
                    </div>
                  )}
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}

                {/* Layout Name */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs font-medium text-white">{getLayoutName(layout)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Layout Settings */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="text-sm font-semibold mb-2">Layout Options</div>

        {/* Visibility Toggles based on current layout */}
        {(currentLayout === "cover" || currentLayout === "imageLeft" || currentLayout === "imageRight" ||
          currentLayout === "imageBullets" || currentLayout === "fullImage" || currentLayout === "twoColumn" ||
          currentLayout === "titleBody" || currentLayout === "centeredChart" || currentLayout === "comparison") && (
          <div className="flex items-center justify-between">
            <Label htmlFor="show-title" className="text-sm">
              Show Title
            </Label>
            <Switch
              id="show-title"
              checked={currentContent.showTitle !== false}
              onCheckedChange={(checked) => {
                onContentChange({ ...currentContent, showTitle: checked });
              }}
            />
          </div>
        )}

        {(currentLayout === "cover" || currentLayout === "fullImage") && (
          <div className="flex items-center justify-between">
            <Label htmlFor="show-subtitle" className="text-sm">
              Show Subtitle
            </Label>
            <Switch
              id="show-subtitle"
              checked={currentContent.showSubtitle !== false}
              onCheckedChange={(checked) => {
                onContentChange({ ...currentContent, showSubtitle: checked });
              }}
            />
          </div>
        )}

        {(currentLayout === "imageLeft" || currentLayout === "imageRight" || currentLayout === "titleBody") && (
          <div className="flex items-center justify-between">
            <Label htmlFor="show-body" className="text-sm">
              Show Body
            </Label>
            <Switch
              id="show-body"
              checked={currentContent.showBody !== false}
              onCheckedChange={(checked) => {
                onContentChange({ ...currentContent, showBody: checked });
              }}
            />
          </div>
        )}

        {currentLayout === "twoColumn" && (
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-left" className="text-sm">
                Show Left Column
              </Label>
              <Switch
                id="show-left"
                checked={currentContent.showLeftColumn !== false}
                onCheckedChange={(checked) => {
                  onContentChange({ ...currentContent, showLeftColumn: checked });
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-right" className="text-sm">
                Show Right Column
              </Label>
              <Switch
                id="show-right"
                checked={currentContent.showRightColumn !== false}
                onCheckedChange={(checked) => {
                  onContentChange({ ...currentContent, showRightColumn: checked });
                }}
              />
            </div>
          </>
        )}

        {currentLayout === "comparison" && (
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-left" className="text-sm">
                Show Left Label
              </Label>
              <Switch
                id="show-left"
                checked={currentContent.showLeftColumn !== false}
                onCheckedChange={(checked) => {
                  onContentChange({ ...currentContent, showLeftColumn: checked });
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-right" className="text-sm">
                Show Right Label
              </Label>
              <Switch
                id="show-right"
                checked={currentContent.showRightColumn !== false}
                onCheckedChange={(checked) => {
                  onContentChange({ ...currentContent, showRightColumn: checked });
                }}
              />
            </div>
          </>
        )}

        {/* Image Bleed Option */}
        {supportsBleed && (
          <>
            <div className="border-t border-border pt-3 mt-3"></div>
            <div className="flex items-center justify-between">
              <Label htmlFor="image-bleed" className="text-sm">
                Image Bleed
              </Label>
              <Switch
                id="image-bleed"
                checked={currentContent.imageBleed || false}
                onCheckedChange={(checked) => {
                  onContentChange({ ...currentContent, imageBleed: checked });
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Stretch image to edges without padding
            </p>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-4 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground">
          {getLayoutDescription(currentLayout)}
        </p>
      </div>
    </motion.div>
  );
}
