# Inkline Development Plan

## Current State (Updated April 2026)

Inkline is a fully functional collaborative comic/manga/webtoon workspace for writer + artist collaboration (like Bakuman). Built with React 19 + TypeScript + Tailwind CSS + Vite 8. Supabase backend with offline localStorage fallback. All 4 roles supported: writer, artist, letterer, colorist.

**All major phases are complete.** The app is production-ready with:
- Full script editing (episodes, pages, panels, content blocks, characters)
- Real-time collaboration with threads, messaging, and file uploads
- Compile & export in 4 formats (Webtoon, Manga, Comic, Manhwa)
- Auth with role-based signup and project invitation
- Undo/redo, notifications, theme toggle, responsive design
- Security hardening with RLS, rate limiting, and input validation

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

- **E3: Virtualized panel list** — For episodes with 100+ panels, consider adding `@tanstack/react-virtual` for the page list in ScriptEditor
- **Rate limiting is client-side only** — A determined attacker could bypass. For multi-tenant deployment, proxy writes through Supabase Edge Functions
- **Email notifications** — Currently in-app only. Add Resend/SendGrid for email alerts on submissions, approvals, etc.
- **Drag-to-reorder** — Panels and pages don't support drag reorder (nice-to-have)
- **Image optimization** — Consider adding thumbnails for panel grid to reduce bandwidth
- **Phase 6 (Monetization)** — Deleted from scope. This is a personal tool, not a SaaS product

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 19 + TypeScript + Tailwind CSS |
| Build | Vite 8 |
| State | React Context API (ProjectContext, WorkspaceContext, PreferencesContext) |
| Backend | Supabase (Auth + Postgres + Realtime + Storage) |
| Offline | localStorage fallback when Supabase is not configured |
| Export | jsPDF, html2canvas-pro, JSZip, FileSaver |
| Icons | Custom SVG icon library (`src/icons.tsx`) |
