"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, Upload, Sparkles, Link as LinkIcon } from "lucide-react";

interface ImageUploadPanelProps {
  onClose: () => void;
  onImageSelect: (url: string) => void;
}

export function ImageUploadPanel({ onClose, onImageSelect }: ImageUploadPanelProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "ai" | "url">("upload");
  const [aiPrompt, setAiPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        onImageSelect(url);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      // TODO: Integrate with actual AI image generation API
      const placeholderUrl = `https://placehold.co/1920x1080/3b82f6/ffffff?text=${encodeURIComponent(aiPrompt.slice(0, 30))}`;
      onImageSelect(placeholderUrl);
      setIsGenerating(false);
      onClose();
    }, 2000);
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      onImageSelect(imageUrl);
      onClose();
    }
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
        <h2 className="text-lg font-semibold">Add Image</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "upload"
              ? "text-foreground border-b-2 border-primary bg-muted/50"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <Upload className="h-4 w-4 inline mr-2" />
          Upload
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "ai"
              ? "text-foreground border-b-2 border-primary bg-muted/50"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <Sparkles className="h-4 w-4 inline mr-2" />
          AI Generate
        </button>
        <button
          onClick={() => setActiveTab("url")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "url"
              ? "text-foreground border-b-2 border-primary bg-muted/50"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <LinkIcon className="h-4 w-4 inline mr-2" />
          URL
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {activeTab === "upload" && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-all"
              >
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-1">Click to upload</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Recent uploads</p>
                <div className="grid grid-cols-3 gap-2">
                  {/* Placeholder for recent uploads */}
                  <div className="aspect-square bg-muted rounded border border-border"></div>
                  <div className="aspect-square bg-muted rounded border border-border"></div>
                  <div className="aspect-square bg-muted rounded border border-border"></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Describe your image</label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="A futuristic city skyline at sunset with flying cars..."
                  className="min-h-[120px] resize-none"
                />
              </div>
              <Button
                onClick={handleAiGenerate}
                disabled={!aiPrompt.trim() || isGenerating}
                className="w-full gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate Image"}
              </Button>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Style presets</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setAiPrompt(aiPrompt + " realistic photo")}>
                    Realistic
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setAiPrompt(aiPrompt + " digital art")}>
                    Digital Art
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setAiPrompt(aiPrompt + " 3D render")}>
                    3D Render
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setAiPrompt(aiPrompt + " minimalist")}>
                    Minimalist
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "url" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Image URL</label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </div>
              <Button onClick={handleUrlSubmit} disabled={!imageUrl.trim()} className="w-full">
                Add Image
              </Button>
              {imageUrl && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Preview</p>
                    <div className="border border-border rounded overflow-hidden">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
