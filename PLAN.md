# Inkline Development Plan

## Current State

Three-view prototype (Script Editor, Collaboration, Compile & Export) with dark editorial UI, custom icon library, and hardcoded mock data. Built with React 19 + TypeScript + Tailwind CSS + Vite 8. All navigation works, collapsible script hierarchy works, format preview works. No backend, no persistence, no real editing, many dead buttons.

---

## Phase 1: Foundation — Make the Prototype Real

**Goal:** Turn static mockup into a functional local app with real editing, shared state, and persistence.

### 1.1 Extract & Organize (Architecture)
- [ ] Create `src/types/index.ts` — centralize Episode, Page, Panel, ContentBlock, Character, Thread, Message types
- [ ] Extract components from monolithic views into `src/components/`:
  - `Tag.tsx`, `ContentBlockView.tsx`, `PanelBlock.tsx`, `PageBlock.tsx`
  - `FormatPreview.tsx`, `ThreadItem.tsx`, `MessageBubble.tsx`
- [ ] Create `src/data/` directory for mock data (separate data from components)

### 1.2 Shared State (Context)
- [ ] Create `src/context/ProjectContext.tsx` — holds active project, episodes, characters, active selections
- [ ] Share `activeEpisode` across all three views (selecting EP3 in editor shows EP3 threads in Collaboration and EP3 panels in Compile)
- [ ] Persist tab state, scroll position, and expanded/collapsed panels when switching views

### 1.3 Script Editor — Real Editing
- [ ] Inline editing for episode title and brief
- [ ] "Add Episode" creates a new empty episode with auto-numbered ID
- [ ] "Add Page" appends a new page to the active episode
- [ ] "Add Panel" within each page — includes shot type selector (dropdown: Wide, Medium, Close-up, Extreme Close-up)
- [ ] Add/edit/delete dialogue, caption, and SFX content blocks within panels
- [ ] "Add Character" opens a form (name, role, description, color picker)
- [ ] Drag-to-reorder panels within a page (nice-to-have, can defer)
- [ ] Delete episode/page/panel with confirmation

### 1.4 Local Persistence
- [ ] Save project state to localStorage on every change (debounced)
- [ ] Load from localStorage on app start
- [ ] "New Project" / "Load Project" controls in the nav bar
- [ ] Export project as JSON file (full script backup)
- [ ] Import project from JSON file

### 1.5 Accessibility Pass
- [ ] Add `aria-label` to all icon-only buttons
- [ ] Keyboard navigation for collapsible page/panel tree (Enter/Space to toggle)
- [ ] Improve contrast — bump `ink-muted` from #3A3A3A to #555555 for text elements
- [ ] Add `role="tree"` / `role="treeitem"` semantics to script hierarchy
- [ ] Focus management when adding/deleting items

---

## Phase 2: Backend & Auth

**Goal:** Multi-user support. Writers and artists can log in, own projects, and collaborate.

### 2.1 Tech Stack Decision
- [ ] Choose backend: **Supabase** (fastest path — auth + Postgres + real-time + file storage in one) vs. custom Node/Express + PostgreSQL
- [ ] Choose hosting: Vercel (frontend) + Supabase (backend) vs. Railway/Render (fullstack)

### 2.2 Database Schema
- [ ] `users` — id, email, name, role (writer/artist/letterer/colorist), avatar_url
- [ ] `projects` — id, title, owner_id, created_at, format (webtoon/manhwa/manga/comic)
- [ ] `project_members` — project_id, user_id, role (writer/artist/etc.), invited_at
- [ ] `episodes` — id, project_id, number, title, brief, status, created_at
- [ ] `pages` — id, episode_id, number, panel_count, layout_note
- [ ] `panels` — id, page_id, number, shot_type, description, order
- [ ] `content_blocks` — id, panel_id, type (dialogue/caption/sfx), character, text, parenthetical, order
- [ ] `characters` — id, project_id, name, role, description, color, reference_image_url
- [ ] `threads` — id, project_id, episode_id, page_range, status, created_at
- [ ] `messages` — id, thread_id, sender_id, text, attachment_url, created_at
- [ ] `panel_assets` — id, panel_id, uploaded_by, file_url, status (draft/approved/rejected), version

### 2.3 Auth
- [ ] Email/password signup + login (Supabase Auth or NextAuth)
- [ ] Role selection on signup (writer or artist)
- [ ] Project invitation system — writer invites artist by email
- [ ] Session management

### 2.4 API Layer
- [ ] CRUD endpoints for episodes, pages, panels, content blocks, characters
- [ ] Real-time subscriptions for threads/messages (Supabase Realtime or WebSockets)
- [ ] File upload endpoint for panel artwork (Supabase Storage or S3)
- [ ] Replace all mock data with API calls + loading/error states

---

## Phase 3: Collaboration — The Core Value Prop

**Goal:** The writer→artist handoff loop works end-to-end.

### 3.1 Submit to Artist Flow
- [ ] Writer clicks "Submit to Artist" → pages move to "Submitted" status
- [ ] Artist receives notification (in-app + email)
- [ ] Artist sees submitted pages with full script context (panel descriptions, dialogue, shot types)
- [ ] Artist can ask clarifying questions in the thread

### 3.2 Artist Upload Flow
- [ ] Artist uploads draft panel artwork (drag-and-drop or file picker)
- [ ] Artwork attached to specific panel (not floating — linked to P1/Panel 2, etc.)
- [ ] Writer sees draft in Collaboration thread AND in Compile view
- [ ] Version tracking — artist can upload v2, v3 of same panel

### 3.3 Review & Approve
- [ ] Writer can approve or request changes on each panel
- [ ] "Request Changes" opens a note field (text + optional markup on image)
- [ ] Status flow per panel: Submitted → In Progress → Draft Received → Changes Requested → Approved
- [ ] Bulk approve for a full page

### 3.4 Real-Time Messaging
- [ ] Messages send and appear instantly (WebSocket/Supabase Realtime)
- [ ] Image attachments in chat (not just panel uploads)
- [ ] Typing indicators
- [ ] Read receipts (optional)

---

## Phase 4: Compile & Export — Deliver the Final Product

**Goal:** Approved panels compile into the correct comic/webtoon format and export as print-ready or web-ready files.

### 4.1 Panel Assembly Engine
- [ ] **Webtoon**: Stack panels vertically, 800px wide, auto-space based on panel aspect ratios
- [ ] **Manhwa**: Similar to webtoon, 720px wide, Korean format conventions
- [ ] **Manga**: Arrange into B5 pages, right-to-left reading order, handle variable panel grids
- [ ] **Comic**: Western page layout (6.625×10.25"), left-to-right, traditional grid
- [ ] Preview shows actual uploaded artwork (not placeholders)

### 4.2 Lettering Layer
- [ ] Overlay dialogue text on panels in correct positions
- [ ] Speech bubble generation (round for dialogue, rectangular for captions, jagged for SFX)
- [ ] Font selection per content type
- [ ] Manual bubble positioning (drag on preview)

### 4.3 Export
- [ ] PDF export (single file, all pages)
- [ ] PNG sequence export (one image per page/scroll unit)
- [ ] ZIP download for batch export
- [ ] Resolution/DPI settings (72 for web, 300 for print)
- [ ] Color profile enforcement (RGB for digital, CMYK for print manga/comic)

---

## Phase 5: Polish & Scale

**Goal:** Production-ready app. Responsive, fast, delightful.

### 5.1 Responsive Design
- [ ] Mobile layout for script reading (not editing — that stays desktop)
- [ ] Tablet layout with collapsible sidebars
- [ ] Responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)

### 5.2 Performance
- [ ] React.memo on PanelBlock, PageBlock, ContentBlockView
- [ ] useMemo for script stats calculation
- [ ] Virtualized list for long episode/panel lists (react-window or similar)
- [ ] Lazy load Collaboration and Compile views (React.lazy + Suspense)
- [ ] Image optimization — thumbnails for panel grid, full-res on click

### 5.3 UX Enhancements
- [ ] Keyboard shortcuts (Ctrl+N new panel, Ctrl+S save, Ctrl+Enter submit)
- [ ] Undo/redo (command pattern or state history)
- [ ] Search across episodes, panels, dialogue text
- [ ] Filter threads by status
- [ ] Dark/light theme toggle (light theme for daytime writing)
- [ ] Onboarding flow for new users
- [ ] Empty states with helpful prompts (not just "No pages yet")

### 5.4 Notifications
- [ ] In-app notification center (bell icon in nav)
- [ ] Email notifications for: new submission, draft received, changes requested, approved
- [ ] Configurable notification preferences per user

---

## Phase 6: Business & Launch

### 6.1 Monetization
- [ ] Free tier: 1 project, 2 collaborators, 10 episodes
- [ ] Pro tier ($12/mo): unlimited projects, 5 collaborators, export features
- [ ] Team tier ($29/mo): unlimited everything, priority support, custom branding

### 6.2 Landing Page
- [ ] Marketing site explaining the writer↔artist handoff problem
- [ ] Demo video showing the full workflow
- [ ] Waitlist or direct signup

### 6.3 Launch Targets
- [ ] Webtoon/tapas creators (largest market, vertical scroll format)
- [ ] Indie comic writers collaborating with freelance artists
- [ ] Manga studios with distributed teams

---

## Priority Order

| Phase | Effort | Impact | Do When |
|-------|--------|--------|---------|
| **Phase 1** | Medium | High | **Now** — makes the prototype usable |
| **Phase 2** | Large | Critical | After Phase 1 — unlocks multi-user |
| **Phase 3** | Large | Critical | After Phase 2 — the core product |
| **Phase 4** | Medium | High | After Phase 3 — delivers the output |
| **Phase 5** | Medium | Medium | Ongoing alongside Phases 3-4 |
| **Phase 6** | Small | High | When Phase 4 is solid |

---

## Tech Stack (Recommended)

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React 19 + TypeScript + Tailwind | Already built |
| State | Zustand | Lightweight, no boilerplate, works with React 19 |
| Backend | Supabase | Auth + DB + Realtime + Storage in one. Fastest path to multi-user |
| Hosting | Vercel (frontend) + Supabase (backend) | Free tier generous, scales well |
| File Storage | Supabase Storage (or Cloudflare R2) | Panel artwork, exports |
| Image Processing | Sharp (server-side) or Canvas API (client) | Panel assembly, thumbnail generation |
| PDF Generation | pdf-lib or Puppeteer | Export to print-ready PDF |
| Email | Resend | Transactional emails for notifications |
