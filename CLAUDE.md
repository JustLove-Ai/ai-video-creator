# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (opens at http://localhost:3000)
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── VideoEditor.tsx     # Root component
│   ├── TopToolbar.tsx      # Tool selection
│   ├── LeftSidebar.tsx     # Scene management
│   ├── VideoCanvas.tsx     # Canvas renderer
│   ├── TimelinePanel.tsx   # Timeline
│   ├── layouts/            # 8 slide layout templates
│   ├── canvas/             # Editable components & renderers
│   ├── panels/             # Right-side panels (Layout, Theme, Image, Annotations)
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── themes.ts           # Theme presets & utilities
│   ├── layouts.ts          # Layout utilities & content parser
│   └── utils.ts            # Shared utilities
└── types/
    └── index.ts            # Centralized TypeScript types
```

TypeScript path alias: `@/*` → `./src/*`

## Architecture Overview

AI video creator with slide-based presentation system, global theming, and annotation capabilities.

### Core Components

**VideoEditor** - Root state manager
- Global state: `activeTheme`, `scenes[]`, `rightPanel`, `annotationMode`
- Handles layout changes, theme application, image uploads
- Manages panel visibility with smooth transitions

**VideoCanvas** - Slide renderer with annotation overlay
- Renders layouts via `LayoutRenderer`
- Overlay `AnnotationLayer` for drawings/shapes
- Theme merging (global + per-slide override)

**TopToolbar** - Tool selection
- Layout, Theme, Annotate, Avatars, Text, Media, Elements buttons
- Controls right panel visibility
- Annotation mode toggle

**LeftSidebar** - Scene management
- Add/edit/delete scenes
- AI generation (placeholder)
- Auto-populates layout content from script

**Right Panels** (slide from right, shift canvas)
- `LayoutPanel` - 8 layout templates with previews
- `ThemePanel` - 6 presets + customization (apply to current/all)
- `ImageUploadPanel` - Upload, AI generate, or URL
- `AnnotationToolbar` - Drawing tools (appears when annotation mode active)

### Layout System (8 Templates)

1. **Cover** - Centered title + subtitle
2. **Image Left** - Image (40%) | Text (60%)
3. **Image Right** - Text (60%) | Image (40%)
4. **Image with Bullets** - Image + bullet points
5. **Full Image** - Full-width image with overlay text
6. **Two Column** - Text | Text (50/50)
7. **Title & Body** - Title + body text
8. **Blank** - Empty canvas (for annotations)

Each layout uses `EditableText` and `EditableImage` components for inline editing.

### Theme System

**Global Theme** - Default for all slides (stored in `activeTheme`)
**Per-Slide Override** - Optional `Scene.themeOverride` (Partial<Theme>)
**Theme Merging** - `mergeTheme(globalTheme, sceneOverride)` in VideoCanvas

**Theme Properties:**
- Background (solid/gradient)
- Typography (title/body fonts, sizes, weights, colors)
- Spacing (padding, gap)
- Accent color

**Presets:** Light Minimalist (default), Professional Dark, Bold Colorful, Corporate Blue, Creative Gradient, Monochrome

### Annotation System

**Annotation Types:** freehand, arrow, rectangle, circle, line, text
**Storage:** `Scene.annotations[]` array
**Rendering:** SVG-based on `AnnotationLayer`
**Toolbar:** Color picker (8 defaults + custom hex), stroke width (2/4/6/8px)

Annotations are a separate layer (higher z-index) that sits on top of layout content.

### Data Models

**Scene** (src/types/index.ts):
```typescript
{
  id: string;
  content: string;              // Script/narration
  duration: number;
  layout: LayoutType;           // cover | imageLeft | imageRight | ...
  layoutContent: LayoutContent; // Structured content for layout zones
  annotations: AnnotationElement[];
  themeOverride?: Partial<Theme>;
}
```

**LayoutContent:**
```typescript
{
  title?: string;
  subtitle?: string;
  body?: string;
  bulletPoints?: string[];
  imageUrl?: string;
  leftColumn?: string;
  rightColumn?: string;
}
```

**AnnotationElement:**
```typescript
{
  id: string;
  type: AnnotationType;
  points?: {x, y}[];  // For freehand
  x, y, width, height, endX, endY;
  stroke, strokeWidth, fill, opacity;
  text?, fontSize?;
}
```

### State Flow

1. User edits scene script in LeftSidebar
2. Script auto-populates layout content via `parseScriptToLayout()`
3. User clicks "Layout" → opens LayoutPanel
4. Selecting layout updates `Scene.layout` + preserves existing content
5. VideoCanvas renders layout with merged theme
6. User clicks "Theme" → opens ThemePanel
7. Apply to current (sets `themeOverride`) or all (updates `activeTheme`)
8. Annotation mode overlays drawing layer on canvas

### Content Preservation

When switching layouts, `preserveContentOnLayoutChange()` maps common fields (title, body, image) to new layout structure.

## Tech Stack

- Next.js 15.5.4 with App Router
- React 19.1.0 ("use client" components)
- TypeScript 5.x (strict mode)
- TailwindCSS 4.x with @tailwindcss/postcss
- Framer Motion 12.x (page/panel transitions, animations)
- Radix UI (@radix-ui/react-*) via shadcn/ui
- Lucide React icons

## Development Notes

- Right panels slide in from right (360px width) and shift canvas via `margin-right`
- Panel animations use `AnimatePresence` + `motion.div` with `x: 360` slide
- Inline editing uses click-to-edit pattern (hover outline, click to activate)
- Image replacement opens ImageUploadPanel with Upload/AI/URL tabs
- All scenes auto-inherit global theme unless overridden
- Scene script changes trigger layout content re-parsing (non-destructive)
