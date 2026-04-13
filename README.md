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

### Script Editor
- Hierarchical structure: Episodes → Pages → Panels → Content Blocks
- Content block types: `dialogue`, `caption`, `sfx`
- Character roster with color coding per character
- Undo/redo (Cmd+Z / Cmd+Shift+Z) with full history stack
- **Drag-to-reorder pages** — grip handle on each page row; drag within an episode to reorder, syncs to Supabase
- **Drag-to-reorder panels** — grip handle on each panel row; drag within a page to reorder, syncs to Supabase
- **Script Import Wizard** — import TXT, MD, DOCX, or PDF files with a heuristic parser that auto-detects Episodes, Pages, Panels, dialogue, captions, and SFX. Three merge strategies: append, replace, or merge into existing structure.

### Collaboration
- Thread-based messaging per episode and per page range
- Real-time messages via Supabase Realtime (Postgres CDC)
- Typing indicators via Supabase Presence
- Artwork upload with panel picker — sets panel status to `draft_received`
- Panel status workflow: `draft` → `submitted` → `draft_received` → `changes_requested` / `approved`
- Team invitation by email with role assignment
- **Reference Files panel** — upload and browse per-episode reference images and documents

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
│   ├── collaboration/
│   │   ├── ReferencePanel.tsx      # Per-episode reference files
│   │   ├── UploadModal.tsx         # Artwork upload with panel picker
│   │   └── ...
│   └── compile/
│       ├── AssetLibraryDrawer.tsx  # Project-wide file browser
│       ├── ExportScopeDialog.tsx   # Export options with presets & history
│       └── ...
├── context/                        # React context providers
├── domain/
│   ├── validation.ts               # Project JSON import/export
│   ├── migrations.ts               # Schema migration chain
│   └── selectors.ts                # Pure derived-data functions
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
│   └── exportService.ts            # PDF/PNG/WEBP/ZIP export
├── types/
│   ├── index.ts                    # Domain types
│   └── files.ts                    # File pipeline types
└── views/
    ├── ScriptEditor.tsx
    ├── Collaboration.tsx
    ├── CompileExport.tsx
    └── ProjectDashboard.tsx
supabase/
    schema.sql                      # Tables, RLS, triggers, functions
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

- Rate limiting is client-side only
- Email notifications — in-app only, no Resend/SendGrid integration
