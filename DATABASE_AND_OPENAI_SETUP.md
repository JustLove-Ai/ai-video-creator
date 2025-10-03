# Database & OpenAI Integration Setup

## Overview

Integrated MongoDB (via Prisma) and OpenAI for complete database persistence and AI-powered features. Built with Remotion compatibility in mind.

## Technologies

- **Prisma** - ORM for MongoDB
- **OpenAI API** - gpt-image-1, TTS (tts-1-hd), GPT-4o
- **MongoDB** - Cloud database (MongoDB Atlas)
- **Next.js Server Actions** - Type-safe API layer

## Database Schema

### VideoProject Model
```prisma
model VideoProject {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  aspectRatio String   @default("16:9")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  scenes      Scene[]
  theme       Json?    // Global theme configuration
}
```

### Scene Model
```prisma
model Scene {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  projectId       String   @db.ObjectId
  order           Int

  // Content
  content         String   // Narration/script text
  duration        Int      @default(5)

  // Layout
  layout          String   @default("titleBody")
  layoutContent   Json     // Structured content

  // Media (Remotion-ready base64 format)
  imageUrl        String?  // data:image/png;base64,...
  imagePrompt     String?
  audioUrl        String?  // data:audio/mp3;base64,...
  voiceId         String?  // OpenAI voice ID

  // Annotations & Theme
  annotations     Json?
  themeOverride   Json?
}
```

### GeneratedAsset Model
```prisma
model GeneratedAsset {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  sceneId     String?  @db.ObjectId
  projectId   String   @db.ObjectId
  type        String   // "image" | "audio" | "video"
  url         String
  prompt      String?
  model       String?
  fileSize    Int?
  duration    Float?
  dimensions  Json?
}
```

## Server Actions

### Project Management (`src/app/actions/projects.ts`)

- `createProject(title)` - Create new video project
- `getProject(projectId)` - Get project with scenes
- `getProjects()` - List all projects
- `updateProject(projectId, data)` - Update title/theme
- `deleteProject(projectId)` - Delete project (cascades to scenes)

### Scene Management (`src/app/actions/scenes.ts`)

- `createScene(projectId, data)` - Add new scene
- `updateScene(sceneId, data)` - Update scene content/media
- `deleteScene(sceneId)` - Remove scene (auto-reorders)
- `reorderScenes(projectId, sceneIds)` - Change scene order
- `duplicateScene(sceneId)` - Clone existing scene

### OpenAI Integration (`src/app/actions/openai.ts`)

#### Image Generation (gpt-image-1)
```typescript
generateImage(prompt, sceneId?)
// Returns: { url: string, b64_json: string }
// Format: data:image/png;base64,... (Remotion-compatible)
// Size: 1024x1024
```

**Remotion Consideration:** Returns base64-encoded images that can be directly used in `<Img>` components without external hosting.

#### Text-to-Speech (tts-1-hd)
```typescript
generateSpeech(text, voice, sceneId?)
// Voices: alloy, echo, fable, onyx, nova, shimmer
// Returns: { url: string, b64_json: string }
// Format: data:audio/mp3;base64,... (Remotion-compatible)
```

**Remotion Consideration:** Base64 audio data works with `<Audio>` components. For production, consider storing in cloud storage for better performance.

#### YouTube Script Generation
```typescript
generateYouTubeScript(topic, projectId)
// Uses GPT-4o with structured prompt
// Creates 9+ scenes with: HOOK, SETUP, PROBLEM, SOLUTION, RESULT, NEXT
// Includes transition slides
// Auto-populates database with complete scene structure
```

#### Scene Content Generation
```typescript
generateSceneContent(prompt, sceneId)
// Returns: { narration, title, body }
// Updates scene in database
```

#### Batch Audio Generation
```typescript
generateProjectAudio(projectId, voice)
// Generates TTS for all scenes without audio
```

## Remotion Integration Notes

### Why Base64 Format?

1. **No External Dependencies** - Videos render without network calls
2. **Self-Contained** - All assets embedded in composition
3. **Faster Rendering** - No HTTP latency
4. **Reliable** - No 404s or expired URLs

### Remotion Best Practices Implemented

```typescript
// ✅ Use Remotion components (not native HTML)
<Img src={scene.imageUrl} />        // Not <img>
<Audio src={scene.audioUrl} />      // Not <audio>
<OffthreadVideo src={url} />        // Not <video>

// ✅ Assets are fully loaded before frame renders
// Base64 data URLs guarantee immediate availability

// ✅ Timeline synchronization
// All durations stored in database (scene.duration)
```

### Production Considerations

For production Remotion rendering:
- Large videos may benefit from cloud storage URLs instead of base64
- Consider implementing asset upload to S3/Cloudinary
- Add `generateImage(..., { storeInCloud: true })` option
- Base64 works great for prototyping and small projects

## Usage Examples

### Create a New Project
```typescript
const project = await createProject("My Video");
```

### Generate AI Script
```typescript
const scenes = await generateYouTubeScript("How to use Remotion", project.id);
// Creates 9+ scenes with narration and layout
```

### Generate Image for Scene
```typescript
const image = await generateImage(
  "Modern minimalist office workspace with laptop",
  sceneId
);
// Saves to scene.imageUrl as base64
```

### Generate Audio Narration
```typescript
const audio = await generateSpeech(
  scene.content,
  "nova", // Female voice
  sceneId
);
// Saves to scene.audioUrl as base64
```

### Batch Generate All Audio
```typescript
await generateProjectAudio(projectId, "alloy");
// Generates TTS for all scenes in project
```

## Environment Variables

Required in `.env.local`:
```env
DATABASE_URL="mongodb+srv://..."
OPENAI_API_KEY="sk-proj-..."
```

## File Structure

```
src/
├── app/actions/
│   ├── projects.ts      # Project CRUD
│   ├── scenes.ts        # Scene CRUD
│   └── openai.ts        # AI features
├── lib/
│   ├── prisma.ts        # Prisma client singleton
│   ├── openai.ts        # OpenAI client
│   └── constants.ts     # YouTube script prompt
└── generated/
    └── prisma/          # Generated Prisma types

prisma/
└── schema.prisma        # Database schema
```

## Next Steps

To integrate with UI components:

1. Import server actions in client components
2. Use React transitions for loading states
3. Call actions on button clicks/form submissions
4. Revalidate/refetch data after mutations

Example:
```typescript
"use client"
import { generateImage } from "@/app/actions/openai"
import { useTransition } from "react"

const [isPending, startTransition] = useTransition()

const handleGenerate = () => {
  startTransition(async () => {
    await generateImage(prompt, sceneId)
    // UI automatically updates via revalidatePath
  })
}
```

## API Rate Limits

- **gpt-image-1**: ~50 images/min (depends on tier)
- **TTS**: ~100 requests/min
- **GPT-4o**: 500 requests/min (depends on tier)

Implement rate limiting and caching in production.
