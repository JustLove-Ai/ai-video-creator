"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { ElementAnimation } from "@/types";
import { getAnimationProps } from "@/lib/animations";

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
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  const handleBlur = () => {
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

  if (isEditing) {
    return (
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`resize-none bg-transparent border-2 border-dashed border-blue-500 focus:ring-2 focus:ring-blue-500 ${className}`}
        style={{
          ...style,
          textAlign: align,
          minHeight: multiline ? "100px" : "auto",
        }}
        rows={multiline ? 4 : 1}
      />
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
          ...style,
          textAlign: align,
          minHeight: "1.5em",
        }}
      >
        {value || <span className="opacity-40">{placeholder}</span>}
      </div>
    </motion.div>
  );
}
