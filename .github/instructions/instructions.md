# Project: Photo Frame Generator (Client-side)

## 1. Project Summary

This is a lightweight, local-first photo processing tool built with:

- Vue 3 (Composition API)
- Vite
- TypeScript (strict mode)
- pnpm
- exifr (EXIF parsing)
- Native Canvas API

### Core goal:
Turn a user-selected image into a stylized photo with:
- predefined frame templates
- EXIF metadata overlay
- local export (download image)

No backend is required in MVP.

---

## 2. Hard Constraints (MUST FOLLOW)

### 2.1 No backend dependency
- Do NOT introduce Go / Node API / server logic
- All processing MUST happen in browser
- Images MUST NOT be uploaded anywhere

---

### 2.2 No overengineering
Do NOT introduce unless explicitly required:
- Fabric.js
- Konva.js
- Zustand/Pinia (unless state becomes complex)
- SSR frameworks (Nuxt, Next.js)

Keep system minimal.

---

### 2.3 Local-first design
- File input is local only
- EXIF parsing is local only
- Canvas rendering is local only
- Export is download only

---

## 3. Architecture Principles

### 3.1 Strict separation of concerns

Project structure MUST follow:

```text
src/
├── components/        # UI only (no logic)
├── templates/         # frame definitions (data only)
├── utils/             # pure functions (logic only)
├── composables/       # state + orchestration
├── types/             # shared types
├── views/             # page-level composition
└── assets/
```

### 3.2 Data flow (ABSOLUTE RULE)
Image Upload
    ↓
EXIF Parse (exifr)
    ↓
Normalize Metadata
    ↓
Select Template
    ↓
Canvas Renderer
    ↓
Export Image (download)

## 4. EXIF Rules

### 4.1 Library usage
Only use: import exifr from 'exifr'

### 4.2 Normalized model
NEVER expose raw EXIF in UI.
Always convert into:
export interface PhotoMeta {
  make?: string
  model?: string
  iso?: number
  focalLength?: string
  exposureTime?: string
  fNumber?: number
  createTime?: string
}

### 4.3 Transformation rule
EXIF parsing must be done once per file
Must be cached in memory
No repeated parsing during re-render

## 5. Template System (CORE DESIGN)

### 5.1 Template must be data-driven
Each template MUST be a pure object:
export interface Template {
  id: string
  name: string
  width: number
  height: number

  background: string

  frame: {
    padding: number
    borderColor: string
    borderWidth: number
  }

  layout: {
    image: {
      x: number
      y: number
      width: number
      height: number
    }

    textBlocks: Array<{
      key: keyof PhotoMeta
      x: number
      y: number
      fontSize: number
      color: string
      fontWeight?: number
    }>
  }
}

### 5.2 Template rules
NO layout logic inside Vue components
NO conditional rendering per template in UI layer
ALL positioning must be inside template object
Templates must be reusable and static

## 6. Canvas Rendering Rules

### 6.1 Isolation rule
All canvas logic MUST live in: src/utils/canvas.ts

### 6.2 Responsibilities
Canvas module MUST handle:

drawing image
drawing frame/border
drawing text overlays
exporting final image

### 6.3 Forbidden
DO NOT:

manipulate DOM directly
write canvas logic inside Vue components
mix business logic with rendering logic

### 6.4 Export API
Must support: canvas.toBlob()
and download via: URL.createObjectURL(blob)

### 7. Component Rules

### 7.1 Component responsibilities
ImageUploader.vue
only file selection
no EXIF logic
TemplateSelector.vue
only template switching
no rendering logic
PreviewCanvas.vue
only triggers render
no drawing logic

### 7.2 Forbidden in components
EXIF parsing
Canvas drawing
Template definition
File transformation logic

All logic must move to utils/composables.

## 8. Performance Rules
Avoid unnecessary canvas re-render
Re-render only when:
image changes
template changes
metadata changes
Cache:
decoded image
parsed EXIF
computed layout

## 9. State Management Rules
Prefer ref / reactive
Use composables for orchestration
Do NOT introduce global store unless necessary

## 10. Export Rules
Default format: PNG
Optional JPG support later
Always trigger download automatically after export
Never require server-side export

## 11. Code Style Rules
Prefer Composition API (setup)
Prefer pure functions in /utils
Keep functions small and deterministic
Avoid class-based patterns
Avoid deeply nested logic in components

## 12. UI Philosophy

This is NOT:

a design tool
a Canva-like editor
a social platform

This IS:

a deterministic photo frame generator
template-driven rendering tool

UI must stay simple and functional.


## 13. Future Extensions (DO NOT IMPLEMENT NOW)

Explicitly forbidden in MVP:

drag & drop editor
template marketplace
user accounts
cloud sync
backend API
collaborative editing

## 14. Core Principle

Keep everything deterministic, local-first, and template-driven.

Simplicity is a feature.