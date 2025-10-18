"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bold, Italic, Underline, Type, X } from "lucide-react";
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
import { ElementAnimation } from "@/types";
import { getAnimationProps } from "@/lib/animations";

interface RichTextEditorProps {
  value: string; // HTML string
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
  align?: "left" | "center" | "right";
  animation?: ElementAnimation;
  onElementClick?: () => void;
}

const DEFAULT_COLORS = [
  "#FFFFFF", "#000000", "#FF6B6B", "#4ECDC4", "#45B7D1",
  "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85929E",
];

const COLOR_SELECT_OPTIONS = [
  { label: "White", value: "#FFFFFF" },
  { label: "Black", value: "#000000" },
  { label: "Red", value: "#FF6B6B" },
  { label: "Teal", value: "#4ECDC4" },
  { label: "Blue", value: "#45B7D1" },
  { label: "Coral", value: "#FFA07A" },
  { label: "Mint", value: "#98D8C8" },
  { label: "Yellow", value: "#F7DC6F" },
  { label: "Purple", value: "#BB8FCE" },
  { label: "Gray", value: "#85929E" },
];

const DEFAULT_FONTS = [
  "Inter", "Arial", "Helvetica", "Times New Roman", "Georgia",
  "Courier New", "Verdana", "Trebuchet MS", "Roboto", "Open Sans",
  "Montserrat", "Playfair Display", "Merriweather",
];

const FONT_SIZES = [
  { label: "Small", value: "0.875em" },
  { label: "Normal", value: "1em" },
  { label: "Large", value: "1.25em" },
  { label: "X-Large", value: "1.5em" },
  { label: "XX-Large", value: "2em" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Click to edit",
  className = "",
  style = {},
  multiline = false,
  align = "left",
  animation,
  onElementClick,
}: RichTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [customColor, setCustomColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCustomColorInput, setShowCustomColorInput] = useState(false);
  const [customColorInput, setCustomColorInput] = useState("#000000");
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<{
    startContainer: Node;
    startOffset: number;
    endContainer: Node;
    endOffset: number;
  } | null>(null);
  const animationProps = getAnimationProps(animation);

  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.focus();
      // Place cursor at end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    } else {
      // Close color picker when editing stops
      setShowColorPicker(false);
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't close if clicking on toolbar or its children
    const relatedTarget = e.relatedTarget as HTMLElement;

    // Check if clicking on toolbar
    if (toolbarRef.current?.contains(relatedTarget)) {
      return;
    }

    // Check if clicking on any popover/select content
    if (
      relatedTarget?.closest('[role="dialog"]') ||
      relatedTarget?.closest('[role="listbox"]') ||
      relatedTarget?.closest('[data-radix-popper-content-wrapper]')
    ) {
      // Keep editor focused
      setTimeout(() => {
        editorRef.current?.focus();
      }, 0);
      return;
    }

    // If color picker is open, don't close editing - keep it open
    if (showColorPicker) {
      return;
    }

    // If we reach here, user clicked outside - close editing
    setIsEditing(false);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // Store the range data instead of cloning the range object
      savedSelectionRef.current = {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset,
      };
    }
  }, []);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      editorRef.current?.blur();
    }
    if (e.key === "Enter" && !multiline && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      editorRef.current?.blur();
    }
  };

  const handleColorChange = (color: string) => {
    // DON'T close the popover - let it stay open for multiple color changes

    // Restore selection and apply color with delay
    setTimeout(() => {
      if (savedSelectionRef.current) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();

          // Reconstruct the range from saved data
          const range = document.createRange();
          range.setStart(savedSelectionRef.current.startContainer, savedSelectionRef.current.startOffset);
          range.setEnd(savedSelectionRef.current.endContainer, savedSelectionRef.current.endOffset);

          selection.addRange(range);

          // Apply color using execCommand
          document.execCommand("foreColor", false, color);

          // DON'T clear saved selection - keep it for next color change
          // savedSelectionRef.current = null;

          // Trigger input event to save changes
          handleInput();
        }
      }
    }, 50);
  };

  // NEW: Separate handler for Select-based color picker
  const handleColorSelectChange = (color: string) => {
    // Restore selection and apply color with delay (same as font)
    setTimeout(() => {
      if (savedSelectionRef.current) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();

          // Reconstruct the range from saved data
          const range = document.createRange();
          range.setStart(savedSelectionRef.current.startContainer, savedSelectionRef.current.startOffset);
          range.setEnd(savedSelectionRef.current.endContainer, savedSelectionRef.current.endOffset);
          selection.addRange(range);

          // Apply color using execCommand
          document.execCommand("foreColor", false, color);

          // Clear saved selection
          savedSelectionRef.current = null;

          // Trigger input event to save changes
          handleInput();
        }
      }
    }, 50);
  };

  const handleCustomColorApply = () => {
    setShowCustomColorInput(false);

    // Apply the custom color
    setTimeout(() => {
      if (savedSelectionRef.current) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();

          // Reconstruct the range from saved data
          const range = document.createRange();
          range.setStart(savedSelectionRef.current.startContainer, savedSelectionRef.current.startOffset);
          range.setEnd(savedSelectionRef.current.endContainer, savedSelectionRef.current.endOffset);
          selection.addRange(range);

          // Apply color using execCommand
          document.execCommand("foreColor", false, customColorInput);

          // Clear saved selection
          savedSelectionRef.current = null;

          // Trigger input event to save changes
          handleInput();
        }
      }
    }, 50);
  };

  const handleFontChange = (fontFamily: string) => {
    // Restore selection and apply font with delay
    setTimeout(() => {
      if (savedSelectionRef.current) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();

          // Reconstruct the range from saved data
          const range = document.createRange();
          range.setStart(savedSelectionRef.current.startContainer, savedSelectionRef.current.startOffset);
          range.setEnd(savedSelectionRef.current.endContainer, savedSelectionRef.current.endOffset);
          selection.addRange(range);

          // Execute command
          document.execCommand("fontName", false, fontFamily);

          // Clear saved selection
          savedSelectionRef.current = null;

          // Trigger input event to save changes
          handleInput();
        }
      }
    }, 50);
  };

  const handleFontSizeChange = (fontSize: string) => {
    // Restore selection and apply font size with delay
    setTimeout(() => {
      if (savedSelectionRef.current) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();

          // Reconstruct the range from saved data
          const range = document.createRange();
          range.setStart(savedSelectionRef.current.startContainer, savedSelectionRef.current.startOffset);
          range.setEnd(savedSelectionRef.current.endContainer, savedSelectionRef.current.endOffset);
          selection.addRange(range);

          // Create span with font size
          const span = document.createElement("span");
          span.style.fontSize = fontSize;

          try {
            range.surroundContents(span);
          } catch (e) {
            // If surroundContents fails, use alternative method
            const fragment = range.extractContents();
            span.appendChild(fragment);
            range.insertNode(span);
          }

          // Clear saved selection
          savedSelectionRef.current = null;

          // Trigger input event to save changes
          handleInput();
        }
      }
    }, 50);
  };

  if (isEditing) {
    return (
      <div className="relative">
        {/* Formatting Toolbar */}
        <div
          ref={toolbarRef}
          className="absolute -top-14 left-0 z-50 mb-2"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 shadow-lg">
            {/* Bold */}
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                execCommand("bold");
              }}
              className="h-8 w-8 p-0"
            >
              <Bold className="h-4 w-4" />
            </Button>

            {/* Italic */}
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                execCommand("italic");
              }}
              className="h-8 w-8 p-0"
            >
              <Italic className="h-4 w-4" />
            </Button>

            {/* Underline */}
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                execCommand("underline");
              }}
              className="h-8 w-8 p-0"
            >
              <Underline className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            {/* Font Size */}
            <Select
              onValueChange={handleFontSizeChange}
              onOpenChange={(open) => {
                if (open) {
                  // Save selection when opening
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    savedSelectionRef.current = {
                      startContainer: range.startContainer,
                      startOffset: range.startOffset,
                      endContainer: range.endContainer,
                      endOffset: range.endOffset,
                    };
                  }
                } else {
                  // Refocus editor when closing
                  setTimeout(() => editorRef.current?.focus(), 0);
                }
              }}
            >
              <SelectTrigger
                className="h-8 w-24 text-xs"
                onMouseDown={(e) => e.preventDefault()}
              >
                <Type className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
                {FONT_SIZES.map((size) => (
                  <SelectItem
                    key={size.value}
                    value={size.value}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6" />

            {/* Color Picker */}
            <Popover
              open={showColorPicker}
              onOpenChange={(open) => {
                setShowColorPicker(open);
                if (!open) {
                  // Refocus editor when closing
                  setTimeout(() => editorRef.current?.focus(), 0);
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="w-4 h-4 rounded border border-border bg-current" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-64"
                onMouseDown={(e) => e.preventDefault()}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Text Color</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.preventDefault();
                        setShowColorPicker(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color}
                        onMouseDown={(e) => {
                          e.preventDefault();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleColorChange(color);
                        }}
                        className="w-10 h-10 rounded border-2 border-border transition-all hover:scale-110"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Custom Color</p>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        placeholder="#000000"
                        className="h-8 font-mono text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.currentTarget.select();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onFocus={(e) => {
                          e.stopPropagation();
                          e.currentTarget.select();
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter") {
                            handleColorChange(customColor);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleColorChange(customColor);
                        }}
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

            {/* NEW: Select-based Color Picker (TESTING) */}
            <Select
              onValueChange={handleColorSelectChange}
              onOpenChange={(open) => {
                if (open) {
                  // Save selection when opening
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    savedSelectionRef.current = {
                      startContainer: range.startContainer,
                      startOffset: range.startOffset,
                      endContainer: range.endContainer,
                      endOffset: range.endOffset,
                    };
                  }
                } else {
                  // Refocus editor when closing
                  setTimeout(() => editorRef.current?.focus(), 0);
                }
              }}
            >
              <SelectTrigger
                className="h-8 w-28 text-xs"
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded border border-border bg-gradient-to-r from-red-500 to-blue-500" />
                  <SelectValue placeholder="Color" />
                </div>
              </SelectTrigger>
              <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
                {COLOR_SELECT_OPTIONS.map((color) => (
                  <SelectItem
                    key={color.value}
                    value={color.value}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border border-border"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
                <div className="px-2 py-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Custom Hex</p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={customColorInput}
                      onChange={(e) => setCustomColorInput(e.target.value)}
                      placeholder="#000000"
                      className="h-7 font-mono text-xs flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.currentTarget.select();
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") {
                          handleCustomColorApply();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCustomColorApply();
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      className="h-7 px-2 text-xs"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6" />

            {/* Font Selector */}
            <Select
              onValueChange={handleFontChange}
              onOpenChange={(open) => {
                if (open) {
                  // Save selection when opening
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    savedSelectionRef.current = {
                      startContainer: range.startContainer,
                      startOffset: range.startOffset,
                      endContainer: range.endContainer,
                      endOffset: range.endOffset,
                    };
                  }
                } else {
                  // Refocus editor when closing
                  setTimeout(() => editorRef.current?.focus(), 0);
                }
              }}
            >
              <SelectTrigger
                className="h-8 w-32 text-xs"
                onMouseDown={(e) => e.preventDefault()}
              >
                <Type className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
                {DEFAULT_FONTS.map((font) => (
                  <SelectItem
                    key={font}
                    value={font}
                    style={{ fontFamily: font }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rich Text Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          dangerouslySetInnerHTML={{ __html: value || "" }}
          className={`resize-none bg-transparent border-2 border-dashed border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded px-2 py-1 ${className}`}
          style={{
            ...style,
            textAlign: align,
            minHeight: multiline ? "100px" : "auto",
          }}
          data-placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <motion.div
      {...animationProps}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={(e) => {
          handleClick();
          if (onElementClick) {
            e.stopPropagation();
            onElementClick();
          }
        }}
        dangerouslySetInnerHTML={{ __html: value || `<span class="opacity-40">${placeholder}</span>` }}
        className={`cursor-text hover:outline hover:outline-2 hover:outline-dashed hover:outline-blue-400 transition-all rounded px-2 py-1 ${className}`}
        style={{
          ...style,
          textAlign: align,
          minHeight: "1.5em",
        }}
      />
    </motion.div>
  );
}
