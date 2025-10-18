"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { ElementAnimation, TextFormatting } from "@/types";
import { getAnimationProps } from "@/lib/animations";
import { TextFormattingToolbar } from "./TextFormattingToolbar";

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
  align?: "left" | "center" | "right";
  animation?: ElementAnimation;
  onElementClick?: () => void;
  formatting?: TextFormatting;
  onFormattingChange?: (formatting: TextFormatting) => void;
}

export function EditableText({
  value,
  onChange,
  placeholder = "Click to edit",
  className = "",
  style = {},
  multiline = false,
  align = "left",
  animation,
  onElementClick,
  formatting = {},
  onFormattingChange,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const animationProps = getAnimationProps(animation);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't close if clicking on the toolbar
    if (toolbarRef.current && toolbarRef.current.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
    }
    if (e.key === "Enter" && !multiline && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    }
  };

  // Merge formatting styles with base styles
  const mergedStyle: React.CSSProperties = {
    ...style,
    fontWeight: formatting.bold ? "bold" : style.fontWeight,
    fontStyle: formatting.italic ? "italic" : style.fontStyle,
    textDecoration: formatting.underline ? "underline" : style.textDecoration,
    color: formatting.color || style.color,
    fontFamily: formatting.fontFamily || style.fontFamily,
  };

  if (isEditing) {
    return (
      <div className="relative">
        {/* Formatting Toolbar */}
        {onFormattingChange && (
          <div
            ref={toolbarRef}
            className="absolute -top-12 left-0 z-50 mb-2"
            onMouseDown={(e) => e.preventDefault()} // Prevent blur on toolbar click
          >
            <TextFormattingToolbar
              formatting={formatting}
              onChange={onFormattingChange}
            />
          </div>
        )}

        {/* Text Input */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`resize-none bg-transparent border-2 border-dashed border-blue-500 focus:ring-2 focus:ring-blue-500 ${className}`}
          style={{
            ...mergedStyle,
            textAlign: align,
            minHeight: multiline ? "100px" : "auto",
          }}
          rows={multiline ? 4 : 1}
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
        className={`cursor-text hover:outline hover:outline-2 hover:outline-dashed hover:outline-blue-400 transition-all rounded px-2 py-1 ${className}`}
        style={{
          ...mergedStyle,
          textAlign: align,
          minHeight: "1.5em",
        }}
      >
        {value || <span className="opacity-40">{placeholder}</span>}
      </div>
    </motion.div>
  );
}
