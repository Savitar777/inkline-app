# Phase 3: Performance, Optimization & Polish

**Date**: 2026-04-14
**Status**: Design — awaiting approval

## Context

Inkline is feature-complete through Phase 2. Before deploying to Vercel, this phase hardens performance, data sync, mobile UX, build config, and code quality. No new features — only making existing features faster, more reliable, and production-ready.

## Sub-Phase Overview

| Sub-Phase | Focus | Risk | Est. Files |
|-----------|-------|------|------------|
| 3a | React Performance & Memoization | HIGH (context split) | ~40 |
| 3b | Supabase Data & Sync | MEDIUM (realtime, conflict) | ~5 |
| 3c | Mobile UX Polish | LOW (CSS, attrs) | ~5 |
| 3d | Build & Deploy Prep | LOW (config) | ~4 new |
| 3e | Code Quality & Final Verify | LOW (cleanup) | ~3 |

Sub-phases 3a–3d are independent and can run in any order. 3e must come last.

---

## 3a: React Performance & Memoization

### 3a.1 — Split ProjectDocumentContext

**Problem**: Single context value object (lines 607–672) with `project`, `loading`, `historySize`, and 25+ callbacks. Any state change recomputes the entire value and re-renders all 12 subscribers.

**Solution**: Split into two contexts in the same file:

- **ProjectStateContext** — `{ project, loading, canUndo, canRedo }`. Changes on every mutation.
- **ProjectActionsContext** — all 25 stable `useCallback` functions. Since all callbacks have `[]` deps (they use `setProject(current => ...)` functional updates), this value is referentially stable.

**Critical detail**: `exportProject` (line 175) closes over `project.title` directly. Refactor to read from `projectRef.current` (ref already at line 85) so it stays in the stable actions context.

**Backward compat**: Keep existing `useProjectDocument()` and `useProject()` returning merged objects. No consumer changes required for correctness. Components can optionally migrate to `useProjectState()` / `useProjectActions()` for finer-grained subscriptions.

**Files**: `src/context/ProjectDocumentContext.tsx`, `src/context/ProjectContext.tsx`

### 3a.2 — React.memo Rollout (36 components)

Wrap all unmemoized components with `React.memo()`. No custom comparators — shallow comparison is sufficient.

**Tier 1** (render loops — highest impact):
- `SortablePanelBlock`, `LetteringOverlay`, `ScriptPreviewModal`

**Tier 2** (collaboration):
- `ThreadList`, `MessageList`, `MessageInput`, `ReferencePanel`, `CollaboratorSidebar`, `UploadModal`

**Tier 3** (compile):
- `ExportOptions`, `AssetLibraryDrawer`, `PanelGrid`, `FormatPicker`, `ExportScopeDialog`

**Tier 4** (workspace/settings):
- `CommandPalette`, `ConfirmDialog`, `WorkspaceActivityRail`, `SettingsPanel`, `NotificationCenter`
- Settings tabs: `WorkspaceTab`, `ProfileTab`, `LearningTab`, `DataTab`

**Tier 5** (remaining):
- `ContextualTipBanner`, `FileUploadZone`, `ScriptImportWizard`, `SubmitToArtistModal`, `AuthGuard`, `TutorialGlossary`, `Toast`, `OnboardingFlow`, `MobileDrawer`, `Tag`
- Production: `RoleWorkloadView`, `EpisodeDashboard`, `PageHeatmap`

### 3a.3 — Extract Inline Style Constants

Move static inline style objects to module-level constants:

- `PanelGrid.tsx` line 292: gold gradient → `const GOLD_GRADIENT_STYLE`
- `MessageList.tsx` line 52: hatching pattern → `const HATCHING_STYLE`

Dynamic per-bubble styles in `LetteringOverlay` stay inline (depend on per-element computed values).

### 3a.4 — Remove Pointless useMemo

`ScriptPreviewModal.tsx` line 23: `useMemo(() => episode.pages, [episode.pages])` memoizes a reference to itself. Remove — use `episode.pages` directly.

### Verification

- `npm run build` — zero errors
- Navigate all 6 views. No visual regressions.
- React DevTools Profiler: confirm reduced re-renders on text edits in ScriptEditor.

---

## 3b: Supabase Data & Sync

### 3b.1 — Field-Limit fetchProject

`projectService.ts` line 110: Change `.select('*')` to `.select('id, title, format, owner_id')`. Only these 4 fields are used in the client mapping (lines 192–196).

### 3b.2 — Pagination on List Endpoints

Add `.limit(50)` with optional `page` parameter to:
- `listProjects()` (line 208) — both owned and memberOf queries
- `listAllProjects()` (line 603) — `.limit(100)`
- `listAllUsers()` (line 612) — `.limit(100)`

Default `page = 0` means no call-site changes needed initially. ProjectDashboard can add "load more" later.

### 3b.3 — Panel Assets Realtime Subscription

**New file**: `src/hooks/useRealtimePanelAssets.ts`

Subscribe to `panel_assets` table INSERT events. On new artwork upload, update the relevant panel's `assetUrl` in project state. Guarded by `isSupabaseConfigured`. The server side is already set up (schema.sql line 520: `alter publication supabase_realtime add table panel_assets`).

Integrate from `ProjectDocumentProvider`.

### 3b.4 — Fix localStorage Debounce

`ProjectDocumentContext.tsx` lines 153–159: Increase debounce from 250ms to 2000ms. Add `visibilitychange` and `beforeunload` listeners for flush-on-blur/close using existing `projectRef`.

### 3b.5 — Offline Conflict Detection

Before pushing to Supabase, fetch the project's `updated_at`. If remote timestamp is newer than local snapshot, surface an informational toast via existing `_onErrorCallback`. Does not block writes — last-write-wins with user notification.

### 3b.6 — Missing DB Indexes

Add to `supabase/schema.sql`:
```sql
CREATE INDEX idx_threads_created  ON threads      USING btree (created_at);
CREATE INDEX idx_messages_created ON messages     USING btree (created_at);
CREATE INDEX idx_pa_panel_version ON panel_assets USING btree (panel_id, version);
```

### 3b.7 — Proactive Session Refresh

`AuthContext.tsx`: Add 45-minute interval calling `supabase.auth.refreshSession()` inside the existing auth effect. Clean up in the return function.

### Verification

- `npm run build`
- With Supabase: verify project loads with field-limited query. Test localStorage by editing → closing tab → reopening. Test realtime by uploading art in one browser tab and verifying it appears in another.
- Run SQL migration in Supabase dashboard.

---

## 3c: Mobile UX Polish

### 3c.1 — Safe-Area-Inset for Bottom Tab Bar

`App.tsx` line 475: Add `pb-[env(safe-area-inset-bottom)]` to the mobile `<nav>`. Alternative: utility class in `index.css`.

### 3c.2 — Image Lazy Loading

Add `loading="lazy"` to:
- `MessageList.tsx` line 49 (message attachments)
- `PanelGrid.tsx` line 289 (panel thumbnails)

Already correct (skip): AssemblyPreview, ReferencePanel, AssetLibraryDrawer. Not applicable: upload previews, avatars.

### 3c.3 — Fix MobileDrawer Animation Classes

Move raw `@keyframes` from `index.css` (lines 83–91) into `tailwind.config.js`:

```js
// tailwind.config.js keyframes
'slide-in-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },

// tailwind.config.js animation
'slide-in-left': 'slide-in-left 200ms ease-out',
'slide-in-right': 'slide-in-right 200ms ease-out',
```

Remove inline `style` prop from MobileDrawer.tsx; remove duplicate keyframes from index.css.

### 3c.4–3c.5 — Touch Events & useBreakpoint

**No changes needed** after code review:
- LetteringOverlay touch cleanup is correct (useEffect cleanup fires on unmount even during drag).
- useBreakpoint uses `useSyncExternalStore` with comparison gate — already efficient, only fires on breakpoint transitions.

### Verification

- `npm run build`
- Test on iOS Safari (or simulator): bottom tab bar not obscured by home indicator. MobileDrawer slides in correctly. Images in PanelGrid load lazily (verify in Network tab).

---

## 3d: Build & Deploy Prep

### 3d.1 — Vite Config Optimization

`vite.config.ts`:
```ts
build: {
  sourcemap: false,
  reportCompressedSize: true,
  minify: 'terser',
  terserOptions: {
    compress: { drop_console: true, drop_debugger: true },
  },
  rollupOptions: { /* existing manualChunks */ },
}
```

**New dev dep**: `npm install -D terser`

### 3d.2 — Dynamic Import for Export Libs

**Already implemented** — `exportService.ts` uses `await import()` for html2canvas-pro, jsPDF, file-saver. No changes needed.

### 3d.3 — Create vercel.json

**New file**: `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/((?!assets/).*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/index.html",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }]
    }
  ]
}
```

### 3d.4 — index.html Enhancements

Add to `<head>`:
- `<link rel="dns-prefetch" href="https://supabase.co">`
- `<meta name="description" content="Collaborative comic and manga workspace for writer-artist teams">`
- `<meta name="theme-color" content="#0D0D0D" media="(prefers-color-scheme: dark)">`
- `<meta name="theme-color" content="#1A1A2E" media="(prefers-color-scheme: light)">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- `<link rel="manifest" href="/manifest.json">`

### 3d.5 — Basic PWA Manifest

**New file**: `public/manifest.json`
```json
{
  "name": "Inkline",
  "short_name": "Inkline",
  "description": "Collaborative comic and manga workspace",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0D0D0D",
  "theme_color": "#0D0D0D",
  "icons": [{ "src": "/favicon.svg", "type": "image/svg+xml", "sizes": "any" }]
}
```

### Verification

- `npm install -D terser && npm run build` — verify compressed sizes in output
- `npx serve dist` — verify SPA routing (deep link refresh), cache headers
- Lighthouse audit: verify PWA, meta tags, performance score

---

## 3e: Code Quality & Final Verify

### 3e.1 — Items Already Covered

- SortablePanelBlock memo (3a.2)
- Pointless useMemo removal (3a.4)
- Inline style extraction (3a.3)

### 3e.2 — Final Audit

- Run full `npm run build && npm run lint`
- Verify zero warnings, zero unused imports
- Manual smoke test of all 6 views on desktop and mobile breakpoint

---

## New Files

| File | Sub-Phase |
|------|-----------|
| `src/hooks/useRealtimePanelAssets.ts` | 3b.3 |
| `vercel.json` | 3d.3 |
| `public/manifest.json` | 3d.5 |

## New Dependencies

| Package | Type | Sub-Phase |
|---------|------|-----------|
| `terser` | devDependency | 3d.1 |

## Risk Assessment

| Item | Risk | Mitigation |
|------|------|------------|
| 3a.1 Context split | HIGH | Backward-compat merged hook; no consumer changes required |
| 3b.3 Realtime subscription | MEDIUM | Guarded by `isSupabaseConfigured`; offline mode unaffected |
| 3b.5 Conflict detection | LOW | Informational toast only; does not change write behavior |
| 3d.3 vercel.json | LOW | Additive config; verify rewrites don't break asset loading |
| Everything else | LOW | Additive memoization, CSS, config tweaks |
