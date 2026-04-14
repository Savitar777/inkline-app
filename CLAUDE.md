# Inkline — Claude Instructions

## What is Inkline

Personal (non-commercial) collaborative comic/manga/webtoon workspace for writer + artist teams. Supports 4 roles: writer, artist, letterer, colorist. Built for small teams, not multi-tenant SaaS.

## Non-Negotiables

- **No monetization** — Stripe, subscriptions, billing, and Phase 6 are permanently deleted from scope
- **No micro-services** — Do not suggest breaking the app into micro-services or Edge Function proxying unless the app goes multi-tenant
- **No speculative abstractions** — Build what the task needs; don't future-proof or add configurability beyond the ask
- **No external services** — Resend, SendGrid, analytics platforms, etc. are out of scope unless explicitly requested

## Working Style

- Henry (savitar77) is the developer. Confident engineering level — handle large architectural plans and multi-file refactors without hand-holding
- Plans first (brainstorming skill), then implementation
- Track progress with TodoWrite todos
- Run `npm run build` after each significant step; lint check before final commit
- Comfortable with large-scope PRs and bundled changes
- Prefers the recommended approach when options are presented

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 19 + TypeScript + Tailwind CSS |
| Build | Vite 8 |
| State | React Context API |
| Backend | Supabase (Auth + Postgres + Realtime + Storage) |
| Offline | localStorage fallback when Supabase is not configured |
| Export | jsPDF, html2canvas-pro, JSZip, FileSaver |
| Icons | Custom SVG library at `src/icons.tsx` — no external icon deps |

## Architecture

### Context Hierarchy
```
App
├── ToastProvider          (src/context/ToastContext.tsx)
├── NotificationProvider   (src/context/NotificationContext.tsx)
├── AuthProvider           (src/context/AuthContext.tsx)
├── PreferencesProvider    (src/context/PreferencesContext.tsx)
└── WorkspaceProvider      (src/context/WorkspaceContext.tsx)
    └── ProjectProvider    (src/context/ProjectContext.tsx)
        └── ProjectDocumentProvider (src/context/ProjectDocumentContext.tsx)
```

### Key Patterns
- **Undo/redo:** Use `setProject()` wrapper (not `setProjectRaw`) for any undoable edit
- **Theming:** CSS custom properties `--ink-*` on `:root`. Always use `ink-*` Tailwind classes — never hardcode colors or raw hex values
- **Responsive:** `useBreakpoint()` hook returns `'mobile' | 'tablet' | 'desktop'`. Sidebars use `MobileDrawer` on mobile
- **Notifications:** `addNotification()` from `useNotifications()` for workflow events
- **Offline:** When `VITE_SUPABASE_URL` is unset, all service calls are no-ops; state lives in localStorage under `inkline-project-document`

### Key Files
- `src/types/index.ts` — All domain types
- `src/types/files.ts` — File pipeline types and config constants
- `src/services/projectService.ts` — All Supabase calls + rate limiters
- `src/services/fileValidationService.ts` — MIME, magic bytes, SVG sanitization, duplicate detection
- `src/services/fileStorageService.ts` — StorageAdapter factory (Supabase + offline)
- `src/services/exportService.ts` — PDF/PNG/WEBP/ZIP export with presets and history
- `src/domain/selectors.ts` — Pure derived-data functions
- `src/domain/validation.ts` — Project JSON import/export with `__schemaVersion` + migration chain
- `src/lib/assemblyEngine.ts` — Panel assembly logic for all 4 formats

## Current Status

MVP complete. Phases 1–5 and Phase 2 enrichment complete. Phase 3 (Performance, Optimization & Polish) complete.

Phase 3 sub-phases: **3a** (React perf — context split, React.memo rollout), **3b** (Supabase optimization — field-limiting, pagination, realtime panel assets, localStorage debounce, session refresh), **3c** (Mobile UX — safe-area, image lazy loading, animation fix), **3d** (Build/deploy — terser, vercel.json, PWA manifest, meta tags), **3e** (Final verification)
