# Inkline Development Plan

## Current State (Updated April 2026)

Inkline is a fully functional collaborative comic/manga/webtoon workspace for writer + artist collaboration (like Bakuman). Built with React 19 + TypeScript + Tailwind CSS + Vite 8. Supabase backend with offline localStorage fallback. All 4 roles supported: writer, artist, letterer, colorist.

**All phases through Phase 4 are complete.** The app is optimized and production-ready with:
- Full script editing (episodes, pages, panels, content blocks, characters)
- Real-time collaboration with threads, messaging, and file uploads
- Compile & export in 4 formats (Webtoon, Manga, Comic, Manhwa)
- Auth with role-based signup and project invitation
- Undo/redo, notifications, theme toggle, responsive design
- Security hardening with RLS, rate limiting, and input validation
- Asset tagging & search (auto-tags from metadata, user tags, search/filter in Asset Library)
- Calendar scheduling (episode/page deadlines with role assignment, month-view calendar in Production Tracker)

---

## Completed Work

### Phase 1: Foundation (COMPLETE)
- [x] Centralized types in `src/types/index.ts`
- [x] Extracted components: Tag, ContentBlockView, PanelBlock, PageBlock, FormatPreview
- [x] ProjectContext + ProjectDocumentContext for shared state
- [x] Full inline editing for all script content
- [x] Add/delete episodes, pages, panels, content blocks, characters
- [x] localStorage persistence with debounced saves
- [x] JSON export/import
- [x] Accessibility: ARIA labels, tree semantics, keyboard navigation, focus management

### Phase 2: Backend & Auth (COMPLETE)
- [x] Supabase backend (Auth + Postgres + Realtime + Storage)
- [x] Full database schema with RLS policies
- [x] Email/password signup with role selection (writer/artist/letterer/colorist)
- [x] Project invitation system (invite by email)
- [x] CRUD operations synced to Supabase with offline fallback

### Security Hardening (COMPLETE)
- [x] S1: Role self-modification prevention (BEFORE UPDATE trigger)
- [x] S2: Role-specific RLS policies (writer CRUD, artist read+assets, etc.)
- [x] S3: `set search_path = ''` on security-definer functions
- [x] S4: Client-side rate limiting (write ops, messages, invites)
- [x] S5: Database resource limits (row count caps per parent)
- [x] S7: Input validation with length/count limits on import

### Phase 3: Collaboration (COMPLETE)
- [x] Submit to Artist flow with page selection
- [x] Thread creation (online and offline)
- [x] Real-time messaging with Supabase Realtime
- [x] Typing indicators
- [x] Panel artwork upload linked to specific panels
- [x] Review & approve/request changes workflow
- [x] Bulk approve per page
- [x] Unread message tracking (localStorage-based)

### Phase 4: Compile & Export (COMPLETE)
- [x] Panel assembly engine for all 4 formats
- [x] Lettering overlay with drag-to-position bubbles
- [x] Export: PDF, PNG sequence, ZIP, web bundle
- [x] DPI settings (72 web, 300 print)
- [x] Format preview with real artwork

### Phase 5: Polish & Responsive (COMPLETE)
- [x] Responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
- [x] MobileDrawer pattern for sidebars on small screens
- [x] Bottom tab bar on mobile
- [x] Touch support for LetteringOverlay (iPad/tablet)
- [x] Touch-friendly 44pt hit targets
- [x] React.memo on heavy components (PanelBlock, PageBlock, ContentBlockView)
- [x] useMemo for derived data (stats, pageTracker, deliverables)
- [x] Undo/redo with Cmd+Z / Cmd+Shift+Z
- [x] Light/dark/system theme toggle
- [x] Notification center with bell icon
- [x] Onboarding flow for new users
- [x] Letterer/colorist role-specific views and color coding
- [x] Micro-animations (ink-fade-in, ink-pop-in)
- [x] Improved empty states with guidance
- [x] Skeleton loading states
- [x] Keyboard shortcut cheat sheet in Settings
- [x] Toast notification system for error/success feedback
- [x] Command palette with search (Cmd+K)

---

## Known Limitations & Future Work

- ~~**E3: Virtualized panel list**~~ — Done. `@tanstack/react-virtual` integrated.
- **Rate limiting is client-side only** — Acceptable for personal tool. For multi-tenant, proxy writes through Supabase Edge Functions
- **Email notifications** — Currently in-app only. Add Resend/SendGrid for email alerts on submissions, approvals, etc.
- ~~**Drag-to-reorder**~~ — Done. `@dnd-kit` integrated for page and panel reordering.
- ~~**Image optimization**~~ — Done. `loading="lazy"` on all panel artwork images; realtime panel asset sync via Supabase Realtime.
- **Phase 6 (Monetization)** — Deleted from scope. This is a personal tool, not a SaaS product
- **Asset tagging/search** — Reference files are browseable but not searchable by tag
- **Episode/page templates** — No reusable layout system yet

---

## Phase 3: Performance, Optimization & Polish (COMPLETE)

### 3a: React Performance & Memoization (COMPLETE)
- [x] Split ProjectDocumentContext → ProjectStateContext + ProjectActionsContext (stable actions, reactive state)
- [x] Split ProjectContext → ProjectStateContext + ProjectActionsContext with backward-compat `useProject()` hook
- [x] React.memo on 48 components (up from 6)
- [x] Extract inline style constants (PanelGrid gold gradient)
- [x] Remove pointless useMemo in ScriptPreviewModal
- [x] Fix exportProject to use projectRef instead of closing over project state

### 3b: Supabase Data & Sync (COMPLETE)
- [x] Field-limited fetchProject select (`id, title, format, owner_id` instead of `*`)
- [x] Pagination on listProjects (limit 50), listAllProjects/listAllUsers (limit 100)
- [x] Realtime panel_assets subscription (`useRealtimePanelAssets` hook) — live artwork sync
- [x] localStorage debounce increased 250ms → 2000ms with flush-on-blur and flush-on-close
- [x] Proactive session refresh every 45 minutes in AuthContext
- [x] Missing DB indexes: threads.created_at, messages.created_at, panel_assets(panel_id, version)

### 3c: Mobile UX Polish (COMPLETE)
- [x] Safe-area-inset bottom padding on mobile tab bar (notch devices)
- [x] Image lazy loading on all panel artwork images
- [x] MobileDrawer animation classes moved from raw CSS keyframes to Tailwind config

### 3d: Build & Deploy Prep (COMPLETE)
- [x] Vite terser minification with drop_console + drop_debugger
- [x] Source maps disabled in production
- [x] vercel.json — immutable cache headers for assets, SPA rewrites
- [x] index.html — description meta, theme-color, Apple web app tags, DNS prefetch, manifest link
- [x] PWA manifest (public/manifest.json)

### 3e: Code Quality & Final Verify (COMPLETE)
- [x] TypeScript: zero errors
- [x] ESLint: 7 pre-existing errors (none from Phase 3)
- [x] Build: passes cleanly

---

## Phase 2: Enrichment & Pre-Production (COMPLETE)

### 2a: Story Bible + Character Bible (COMPLETE)
- [x] Story Bible view with 4 sub-tabs: Arcs, Locations, World Rules, Timeline
- [x] Character Bible with extended profiles (appearance, personality, goals, fears, backstory, speech patterns)
- [x] Character relationships (ally, rival, mentor, etc.) with descriptions
- [x] Character arc tracking across story arcs
- [x] Schema v2 migration for storyBible data
- [x] Nav tabs updated: Script Editor | Story Bible | Character Bible | Collaboration | Compile & Export
- [x] Full offline/localStorage support

### 2b: Script Editor Improvements (COMPLETE)
- [x] Script statistics panel (word count, captions, dialogue density bar)
- [x] Panel type tagging (establishing, action, dialogue, impact, transition) with color-coded badges
- [x] Inline character profile preview on hover (popover with personality, speech patterns, goals)

### 2c: Review & Collaboration Improvements (COMPLETE)
- [x] Side-by-side script/art comparison modal (script details + artwork + revision count + open CRs)
- [x] Change request notes per panel (structured ChangeRequest objects with open/resolved status, persisted to panel data)
- [x] Panel revision history modal (all submitted versions with thumbnails, timestamps, "Latest" badge)
- [x] CR badge overlay on panel grid thumbnails
- [x] Wired artwork uploads to create PanelRevision entries (online + offline)

### 2d: Export & Validation (COMPLETE)
- [x] Preflight validation engine (preflightService: size estimation, 6 validation checks)
- [x] Long-image slicing for WEBTOON uploads (webtoonSlicer: 800px horizontal chunks)
- [x] Thumbnail preset generation (thumbnailService: 3 preset sizes, ZIP export)
- [x] Export scope dialog with presets, DPI selector, WebP quality, webtoon slice toggle
- [x] Export history tracking (5 most recent)

### 2e: Production Tracker (COMPLETE)
- [x] Episode progress dashboard (stacked status bars, completion %)
- [x] Page-level status heatmap (color-coded grid, tooltip details)
- [x] Role-based workload view (per-role tabs with action labels)
- [x] Production selectors and status color system

### 2f: Tutorial & Learning (COMPLETE)
- [x] TutorialContext with localStorage persistence (completed modules, dismissed tips, difficulty)
- [x] Contextual tips system (ContextualTipBanner in editor, collab, compile views)
- [x] Glossary component with search, alphabetical grouping, related terms navigation
- [x] Learning settings tab (progress bar, tips toggle, difficulty selector, reset)
- [x] Tutorial data: modules, glossary entries, contextual tips

