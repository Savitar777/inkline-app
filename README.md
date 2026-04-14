# Inkline

A personal collaborative workspace for comic, manga, and webtoon creation — built for the full pipeline from script writing through artist collaboration to final export.

The app runs in two modes:

- **Offline/demo mode** — all state in localStorage, no account needed
- **Supabase mode** — auth, realtime collaboration, cloud storage, and project sync

---

## Roles

| Role | Responsibilities |
|------|-----------------|
| **Writer** | Script editing, episodes/pages/panels, script imports, project export |
| **Artist** | Artwork uploads, panel status updates, reference files |
| **Colorist** | Color passes, panel asset uploads |
| **Letterer** | Lettering overlay, speech bubble placement |

Roles are assigned at signup and cannot be self-escalated from the client.

---

## Publishing Formats

| Format | Layout | Reading Direction |
|--------|--------|------------------|
| Webtoon | Vertical scroll | LTR |
| Manhwa | Vertical scroll | LTR |
| Manga | Fixed page grid | RTL |
| Comic | Fixed page grid | LTR |

---

## Features

### Story Bible
- **Story Arcs** — define arcs with title, description, episode range, status (planning/active/completed), and linked characters
- **Locations** — document settings with name, description, and reference images
- **World Rules** — record rules of the story universe (magic systems, social hierarchies, technology)
- **Timeline** — chronological ordering of events linked to episodes
- Full offline support — Story Bible data lives in the project JSON document

### Character Bible
- **Extended profiles** — appearance, personality, goals, fears, backstory, speech patterns (for letterer reference)
- **Relationships** — map character connections (ally, rival, mentor, love interest, family, friend, enemy) with descriptions
- **Character arcs** — track how characters change across story arcs (start state → end state)
- Builds on existing character roster — color-coded dialogue tagging still works in Script Editor

### Script Editor
- Hierarchical structure: Episodes → Pages → Panels → Content Blocks
- Content block types: `dialogue`, `caption`, `sfx`
- Character roster with color coding per character
- Undo/redo (Cmd+Z / Cmd+Shift+Z) with full history stack
- **Drag-to-reorder pages** — grip handle on each page row; drag within an episode to reorder, syncs to Supabase
- **Drag-to-reorder panels** — grip handle on each panel row; drag within a page to reorder, syncs to Supabase
- **Script Import Wizard** — import TXT, MD, DOCX, or PDF files with a heuristic parser that auto-detects Episodes, Pages, Panels, dialogue, captions, and SFX. Three merge strategies: append, replace, or merge into existing structure.
- **Script statistics** — word count, dialogue/caption/SFX counts, and dialogue density bar per episode
- **Panel type tagging** — classify panels as establishing, action, dialogue, impact, or transition with color-coded badges
- **Character profile popover** — hover over a character name in dialogue blocks to see personality, speech patterns, and goals

### Collaboration
- Thread-based messaging per episode and per page range
- Real-time messages via Supabase Realtime (Postgres CDC)
- Typing indicators via Supabase Presence
- Artwork upload with panel picker — sets panel status to `draft_received`
- Panel status workflow: `draft` → `submitted` → `draft_received` → `changes_requested` / `approved`
- Team invitation by email with role assignment
- **Reference Files panel** — upload and browse per-episode reference images and documents
- **Change request notes** — structured per-panel change requests with open/resolved status tracking
- **Panel revision history** — tracks all submitted artwork versions with timestamps, uploader, and "Latest" badge
- **Side-by-side comparison** — modal showing script details alongside artwork for each panel

### Compile & Export
- Assembly preview for all four formats with zoom and DPI controls
- Lettering overlay with draggable speech bubbles and font picker (sans / serif / mono / comic)
- Per-panel approval workflow with bulk page approve
- **Export dialog** — single "Export" button opens `ExportScopeDialog` with full options
  - Export formats: **PDF**, **PNG**, **WEBP**, **ZIP (PNG sequence)**
  - Export scope: full episode or selected pages
  - Format presets: `webtoon-web` (72 DPI, ZIP), `manga-print` (300 DPI, PDF), `comic-print` (300 DPI, CMYK PDF), `manhwa-web` (72 DPI, ZIP)
  - WEBP quality slider
  - In-memory export history (last 20 exports)
- **Asset Library drawer** — browse all project files grouped by category
- **Preflight validation** — 6 checks before export: unapproved panels, open change requests, DPI mismatch, CMYK+WebP conflict, empty panels, file size estimate per DPI/format
- **Webtoon slicer** — splits long assembled images into 800px horizontal chunks with metadata for platform upload
- **Thumbnail presets** — generates 3 standard sizes (300×300, 600×600, 1200×630) with center-crop, exported as ZIP

### Production Tracker
- **Episode dashboard** — stacked status bars per episode showing panel counts by status with completion percentage
- **Page heatmap** — color-coded grid of all pages across episodes, filterable by episode, with tooltip showing page number and dominant status
- **Role workload view** — tabs for Writer / Artist / Letterer / Colorist, each showing panels currently in that role's queue with action labels
- 6 panel statuses: `draft`, `submitted`, `in_progress`, `draft_received`, `changes_requested`, `approved`

### Tutorial & Learning
- **Contextual tip banners** — gold-bordered tips appear on first visit to Script Editor, Collaboration, and Compile & Export views; dismissable and persistent via localStorage
- **Settings → Learning tab** — module progress bar, tips toggle, content depth selector (beginner / intermediate / advanced), reset progress
- **Glossary** — searchable comic/manga terminology with alphabetical grouping, related terms navigation, and linked module references
- Tutorial module library covering: app features, panel composition, pacing, dialogue & lettering, format-specific specs, production workflow

### File Pipeline
- MIME whitelist per file category
- Magic bytes detection (PNG, JPEG, GIF, PDF, ZIP, WEBP, SVG, JSON)
- SVG sanitization — rejects `<script>`, `on*=` handlers, `javascript:` URIs, `<use href>`
- Filename sanitization — strips unsafe characters, trims to 200 chars
- Duplicate detection — SHA-256 hash of first 64 KB with circular eviction buffer
- Role-based upload permissions per category
- `StorageAdapter` interface — identical API in Supabase and offline/localStorage modes

File categories and limits:

| Category | Allowed Types | Limit |
|----------|--------------|-------|
| `panel-assets` | PNG, JPG, WEBP, GIF, SVG | 10 MB |
| `reference-files` | Images + TXT, MD, PDF, DOCX | 25 MB |
| `script-imports` | TXT, MD, PDF, DOCX | 5 MB |
| `project-files` | JSON | 2 MB |
| `avatars` | PNG, JPG, WEBP | 2 MB |
| `exports` | Any | 100 MB |

### Document Processing
- **TXT** — plain text with line count
- **Markdown** — heading extraction, HTML via `marked`
- **DOCX** — text extraction via `mammoth`
- **PDF** — text extraction via `pdfjs-dist`

All heavy libraries (mammoth, pdfjs-dist, marked, html2canvas-pro, jsPDF, JSZip) are dynamically imported to keep the initial bundle small.

### Auth & Settings
- Google OAuth + email/password via Supabase Auth
- Role is locked at signup — cannot be changed by the user
- Profile settings with file-based avatar upload
- Theme: light / dark / system
- Workspace preferences (default view, compact dashboard, platform mode)
- Keyboard shortcut cheat sheet in Settings

### UX & Polish
- Command palette (Cmd+K) with context-aware actions
- Notification center — approval and changes-requested events
- Toast feedback on all async actions
- Onboarding flow for new users
- Responsive layout (mobile / tablet / desktop) with drawer-based sidebars on mobile
- `ink-fade-in` on list items, `ink-stage-enter` on modals and view transitions
- Skeleton loading states

### Performance & Optimization (Phase 3)
- **Context split** — `ProjectDocumentContext` split into State + Actions contexts to minimize re-renders; actions context is referentially stable
- **React.memo** on 48 components (up from 6) with shallow prop comparison
- **Supabase query optimization** — field-limited selects, pagination on list endpoints (50/100 limits)
- **Realtime panel assets** — collaborators see new artwork uploads in real-time via Supabase Realtime subscription
- **localStorage debounce** — increased from 250ms to 2s with flush-on-blur/close for large project performance
- **Proactive session refresh** — 45-minute interval prevents token expiry on long sessions
- **Image lazy loading** — `loading="lazy"` on all panel artwork images
- **Terser minification** — production builds strip console logs and debugger statements
- **Vercel deployment config** — immutable cache headers for hashed assets, SPA rewrites
- **PWA manifest** — standalone app capability with theme colors

### Project Format & Schema Versioning
- Projects serialize to JSON with a `__schemaVersion` field
- Migration chain in `src/domain/migrations.ts` upgrades old documents on import
- Import validates every field with typed errors

---

## Tech Stack

- **React 19** + **TypeScript** + **Tailwind CSS** + **Vite 8**
- **Supabase** — Auth, Postgres, Realtime, Storage
- **@dnd-kit** — drag-and-drop for page and panel reordering (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)
- **@tanstack/react-virtual** — virtualized list rendering for large episode/page lists
- **Terser** — production minification with console stripping
- **Vercel** — deployment target with cache headers and SPA rewrites
- Custom SVG icon library in `src/icons.tsx` — no external icon packages
- CSS custom properties (`--ink-*`) mapped to Tailwind utility classes

---

## Project Structure

```text
src/
├── components/
│   ├── FileUploadZone.tsx          # Reusable drag-and-drop upload
│   ├── ScriptImportWizard.tsx      # 4-step script import modal
│   ├── PageBlock.tsx               # Page row with panel DnD context
│   ├── PanelBlock.tsx              # Panel row with grip drag handle
│   ├── SortablePanelBlock.tsx      # useSortable wrapper for PanelBlock
│   ├── AssemblyPreview.tsx         # Page layout renderer
│   ├── LetteringOverlay.tsx        # Draggable speech bubbles
│   ├── ContextualTipBanner.tsx     # First-visit tip banner with dismiss
│   ├── TutorialGlossary.tsx        # Searchable glossary with modal detail view
│   ├── collaboration/
│   │   ├── ReferencePanel.tsx      # Per-episode reference files
│   │   ├── UploadModal.tsx         # Artwork upload with panel picker
│   │   └── ...
│   ├── compile/
│   │   ├── AssetLibraryDrawer.tsx  # Project-wide file browser
│   │   ├── ExportScopeDialog.tsx   # Export options with presets & history
│   │   └── ...
│   ├── production/
│   │   ├── EpisodeDashboard.tsx    # Stacked status bars per episode
│   │   ├── PageHeatmap.tsx         # Color-coded page grid
│   │   └── RoleWorkloadView.tsx    # Per-role panel queue
│   └── settings/
│       └── LearningTab.tsx         # Tutorial progress, tips toggle, difficulty
├── context/
│   ├── ProjectDocumentContext.tsx  # Split: ProjectStateContext + ProjectActionsContext
│   ├── ProjectContext.tsx          # Split: ProjectStateContext + ProjectActionsContext (consumer layer)
│   ├── TutorialContext.tsx         # Tutorial progress, tips, difficulty state
│   └── ...                         # Auth, Workspace, Toast, Notification, Preferences
├── data/
│   └── tutorials/
│       ├── types.ts                # TutorialModule, GlossaryEntry, ContextualTip types
│       ├── modules.ts              # Learning module content
│       ├── glossary.ts             # Comic/manga terminology
│       └── tips.ts                 # Contextual tip definitions
├── hooks/
│   ├── useBreakpoint.ts            # Responsive breakpoint hook (useSyncExternalStore)
│   └── useRealtimePanelAssets.ts   # Realtime panel artwork sync via Supabase
├── domain/
│   ├── validation.ts               # Project JSON import/export
│   ├── migrations.ts               # Schema migration chain
│   ├── selectors.ts                # Pure derived-data functions
│   ├── productionSelectors.ts      # Episode/page/role production aggregates
│   └── statusColors.ts             # Panel status → Tailwind class map
├── lib/
│   ├── assemblyEngine.ts           # Layout engine for all 4 formats
│   └── supabase.ts                 # Supabase client + offline guard
├── services/
│   ├── projectService.ts           # Supabase CRUD + rate limiters
│   ├── fileValidationService.ts    # MIME, magic bytes, SVG, duplicates
│   ├── fileStorageService.ts       # StorageAdapter (Supabase + offline)
│   ├── fileMetadataService.ts      # uploaded_files table CRUD
│   ├── avatarService.ts            # Avatar upload
│   ├── documentProcessorService.ts # TXT/MD/DOCX/PDF extraction
│   ├── scriptImportService.ts      # Script parsing + project merge
│   ├── referenceFileService.ts     # Reference file upload/list/delete
│   ├── exportService.ts            # PDF/PNG/WEBP/ZIP export
│   ├── preflightService.ts         # Pre-export validation checks
│   ├── thumbnailService.ts         # Thumbnail preset generation + ZIP
│   └── webtoonSlicer.ts            # Long-image horizontal slicing
├── types/
│   ├── index.ts                    # Domain types
│   └── files.ts                    # File pipeline types
└── views/
    ├── ScriptEditor.tsx
    ├── StoryBible.tsx              # Story arcs, locations, world rules, timeline
    ├── CharacterBible.tsx          # Extended profiles, relationships, arcs
    ├── Collaboration.tsx
    ├── CompileExport.tsx
    ├── ProductionTracker.tsx       # Episode dashboard, heatmap, role workload
    └── ProjectDashboard.tsx
supabase/
    schema.sql                      # Tables, RLS, triggers, functions
public/
    manifest.json                   # PWA manifest
vercel.json                         # Vercel deployment config (cache, rewrites)
```

---

## Getting Started

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Offline mode

No configuration needed. The app detects a missing `VITE_SUPABASE_URL` and runs fully offline with localStorage persistence.

### Supabase mode

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User profiles and roles |
| `projects` | Project metadata |
| `project_members` | Role membership per project |
| `episodes` | Episode records |
| `threads` | Collaboration threads |
| `messages` | Thread messages |
| `panel_assets` | Artwork asset records |
| `uploaded_files` | All uploaded files with metadata and processing status |
| `script_imports` | Script import records and parser mapping results |

Row-Level Security is enabled on all tables. Access is gated by `is_project_member()`.

---

## Known Gaps

- Rate limiting is client-side only — acceptable for a personal tool; proxy writes through Supabase Edge Functions for multi-tenant hardening
- Email notifications — in-app only, no Resend/SendGrid integration
- No asset tagging or search — reference files are browseable but not searchable by tag
- No episode/page templates — every episode starts from scratch
