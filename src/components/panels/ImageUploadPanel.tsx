"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload, Sparkles, Image as ImageIcon, Trash2, Edit2, Settings } from "lucide-react";
import { getImageLibrary, addImageToLibrary, deleteImageFromLibrary, ImageMetadata } from "@/lib/imageLibrary";
import { generateImage } from "@/app/actions/openai";
import { toast } from "sonner";

import type { ImageAlignment, ImageFit } from "@/types";

interface ImageUploadPanelProps {
  onClose: () => void;
  onImageSelect: (url: string) => void;
  imageBleed?: boolean;
  onImageBleedChange?: (bleed: boolean) => void;
  imageAlignment?: ImageAlignment;
  onImageAlignmentChange?: (alignment: ImageAlignment) => void;
  imageFit?: ImageFit;
  onImageFitChange?: (fit: ImageFit) => void;
}

export function ImageUploadPanel({
  onClose,
  onImageSelect,
  imageBleed = false,
  onImageBleedChange,
  imageAlignment = "center",
  onImageAlignmentChange,
  imageFit = "cover",
  onImageFitChange,
}: ImageUploadPanelProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "ai" | "library" | "settings">("library");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageLibrary, setImageLibrary] = useState<ImageMetadata[]>([]);
  const [libraryFilter, setLibraryFilter] = useState<"all" | "upload" | "ai-generated">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setImageLibrary(getImageLibrary());
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;

        // Add to library
        const metadata = addImageToLibrary({
          url,
          type: "upload",
          name: file.name,
        });

        setImageLibrary(getImageLibrary());
        onImageSelect(url);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);

    try {
      // Generate image using OpenAI
      console.log('Starting image generation...');
      const result = await generateImage(aiPrompt);
      console.log('Image generation result:', result);

      // Save the base64 image to file system
      const filename = `ai-generated-${Date.now()}.png`;
      const saveResponse = await fetch('/api/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image: result.url,
          filename,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save image to file system');
      }

      const { url: savedUrl } = await saveResponse.json();

      // Add to library with file system URL (not base64)
      const metadata = addImageToLibrary({
        url: savedUrl,
        type: "ai-generated",
        name: `AI: ${aiPrompt.slice(0, 50)}`,
        prompt: aiPrompt,
      });

      setImageLibrary(getImageLibrary());
      onImageSelect(savedUrl);
      setAiPrompt(""); // Clear prompt after successful generation
      toast.success("Image generated successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error("Failed to generate image", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLibraryImageSelect = (image: ImageMetadata) => {
    onImageSelect(image.url);
    onClose();
  };

  const handleDeleteImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteImageFromLibrary(id);
    setImageLibrary(getImageLibrary());
  };

  const handleReusePrompt = (prompt: string) => {
    setAiPrompt(prompt);
    setActiveTab("ai");
  };

  const filteredLibrary = libraryFilter === "all"
    ? imageLibrary
    : imageLibrary.filter(img => img.type === libraryFilter);

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
          onClick={() => setActiveTab("library")}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "library"
              ? "text-foreground border-b-2 border-primary bg-muted/50"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Library</span>
        </button>
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "upload"
              ? "text-foreground border-b-2 border-primary bg-muted/50"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Upload</span>
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "ai"
              ? "text-foreground border-b-2 border-primary bg-muted/50"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">AI</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "settings"
              ? "text-foreground border-b-2 border-primary bg-muted/50"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {activeTab === "library" && (
            <div className="space-y-4">
              {/* Filter buttons */}
              <div className="flex gap-2">
                <Button
                  variant={libraryFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLibraryFilter("all")}
                  className="flex-1"
                >
                  All ({imageLibrary.length})
                </Button>
                <Button
                  variant={libraryFilter === "upload" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLibraryFilter("upload")}
                  className="flex-1"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Uploads ({imageLibrary.filter(img => img.type === "upload").length})
                </Button>
                <Button
                  variant={libraryFilter === "ai-generated" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLibraryFilter("ai-generated")}
                  className="flex-1"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI ({imageLibrary.filter(img => img.type === "ai-generated").length})
                </Button>
              </div>

              {/* Image Grid */}
              {filteredLibrary.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">No images yet</p>
                  <p className="text-xs text-muted-foreground">Upload or generate images to build your library</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredLibrary.map((image) => (
                    <div
                      key={image.id}
                      className="group relative aspect-video bg-muted rounded-lg border border-border overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => handleLibraryImageSelect(image)}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay with actions */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                        {image.type === "ai-generated" && image.prompt && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="gap-1 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReusePrompt(image.prompt!);
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit Prompt
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1 text-xs"
                          onClick={(e) => handleDeleteImage(image.id, e)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                      {/* Type badge */}
                      <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 text-xs text-white flex items-center gap-1">
                        {image.type === "ai-generated" ? (
                          <>
                            <Sparkles className="h-2.5 w-2.5" />
                            AI
                          </>
                        ) : (
                          <>
                            <Upload className="h-2.5 w-2.5" />
                            Upload
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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

          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Image Fit */}
              {onImageFitChange && (
                <div className="space-y-2">
                  <Label htmlFor="image-fit" className="text-sm font-medium">
                    Image Fit
                  </Label>
                  <Select value={imageFit} onValueChange={(value) => onImageFitChange(value as ImageFit)}>
                    <SelectTrigger id="image-fit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Cover - Fill entire area</SelectItem>
                      <SelectItem value="contain">Contain - Fit within area</SelectItem>
                      <SelectItem value="fill">Fill - Stretch to fill</SelectItem>
                      <SelectItem value="none">None - Original size</SelectItem>
                      <SelectItem value="scale-down">Scale Down - Shrink if needed</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How the image should be sized within its container
                  </p>
                </div>
              )}

              {/* Image Alignment */}
              {onImageAlignmentChange && (
                <div className="space-y-2">
                  <Label htmlFor="image-alignment" className="text-sm font-medium">
                    Image Alignment
                  </Label>
                  <Select value={imageAlignment} onValueChange={(value) => onImageAlignmentChange(value as ImageAlignment)}>
                    <SelectTrigger id="image-alignment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-center">Top Center</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="center-left">Center Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="center-right">Center Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-center">Bottom Center</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Position of the image within its container
                  </p>
                </div>
              )}

              {/* Image Bleed */}
              {onImageBleedChange && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="image-bleed-settings" className="text-sm font-medium cursor-pointer">
                        Image Bleed
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Stretch image to edges without padding
                      </p>
                    </div>
                    <Switch
                      id="image-bleed-settings"
                      checked={imageBleed}
                      onCheckedChange={onImageBleedChange}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </ScrollArea>

      {/* Removed bottom Image Bleed Toggle - now in Settings tab */}
      {false && onImageBleedChange && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="image-bleed" className="text-sm font-medium cursor-pointer">
                Image Bleed
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Stretch image to edges without padding
              </p>
            </div>
            <Switch
              id="image-bleed"
              checked={imageBleed}
              onCheckedChange={onImageBleedChange}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
