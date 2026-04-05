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

## Security Hardening (Do alongside Phase 2)

**Goal:** Lock down the backend so no user can escalate privileges, spam resources, corrupt other users' data, or generate runaway bills. Every item here was identified in a security audit of the current codebase.

### S1. RLS — Fix Critical Privilege Escalation (CRITICAL)
- [ ] **Prevent self-modification of `users.role`** — the current `users_update_own` policy lets a user UPDATE any column on their own row, including `role`. Add a trigger to block role changes, or restrict the UPDATE policy to only `name` and `avatar_url`:
  ```sql
  create or replace function prevent_role_change()
  returns trigger language plpgsql as $$
  begin
    if new.role is distinct from old.role then
      raise exception 'Cannot change your own role';
    end if;
    return new;
  end;
  $$;
  create trigger trg_prevent_role_change
    before update on users for each row execute procedure prevent_role_change();
  ```
- [ ] Add explicit deny INSERT policy on `users` table (`with check (false)`) — only the `handle_new_user` trigger should create rows

### S2. RLS — Tighten Shared Project Permissions (HIGH)
- [ ] Split `for all` RLS policies into role-specific policies:
  - **Writers:** full CRUD on script content (episodes, pages, panels, content_blocks, characters)
  - **Artists:** READ on script content, WRITE only on `panel_assets` and own messages
  - **Both:** CRUD on threads/messages scoped to own `sender_id` for writes
- [ ] On `messages` table, add `sender_id = auth.uid()` to the `USING` clause so members cannot edit/delete each other's messages

### S3. RLS — Harden Security-Definer Functions (MEDIUM)
- [ ] Add `set search_path = ''` to `is_project_member()` function (already done for `handle_new_user`, missing here)
- [ ] Restrict `find_user_by_email` RPC: require caller to be a project owner (pass `for_project_id` param and validate ownership), or move to an Edge Function with rate limiting

### S4. Rate Limiting — Add Backend Write Proxy (CRITICAL)
- [ ] **Create Supabase Edge Functions** to proxy all write operations (episodes, pages, panels, content_blocks, characters, threads, messages) — do NOT let the frontend call Supabase tables directly for inserts/updates/deletes
- [ ] Enforce per-user rate limits in each Edge Function:
  - Episodes: max 50 per project
  - Pages: max 100 per episode
  - Panels: max 20 per page
  - Messages: max 60 per thread per hour
  - Projects: max 10 per user (free tier), unlimited (paid)
- [ ] Add IP-based rate limiting via Cloudflare or Vercel middleware on auth endpoints (signup, login) to prevent credential stuffing
- [ ] Rate-limit the `find_user_by_email` RPC (max 10 lookups per minute per user)

### S5. Database-Level Resource Limits (HIGH)
- [ ] Add Postgres trigger functions to enforce row count caps per parent:
  ```sql
  -- Example: limit episodes per project
  create or replace function check_episode_limit()
  returns trigger language plpgsql as $$
  begin
    if (select count(*) from episodes where project_id = new.project_id) >= 50 then
      raise exception 'Episode limit reached';
    end if;
    return new;
  end;
  $$;
  create trigger trg_episode_limit
    before insert on episodes for each row execute procedure check_episode_limit();
  ```
- [ ] Add similar triggers for pages (100/episode), panels (20/page), messages (1000/thread), content_blocks (50/panel)
- [ ] Add `text` column length constraints (e.g., `brief` max 5000 chars, `message.text` max 5000 chars) to prevent storage abuse

### S6. Budget Caps & Billing Alerts (HIGH)
- [ ] Configure Supabase billing alerts in Dashboard for database size, bandwidth, and Realtime usage
- [ ] Set up a monthly spend cap or alert threshold at 80% of expected budget
- [ ] When adding any paid third-party service (AI, email, storage), always:
  1. Set a hard budget cap on the provider (OpenAI spend limit, AWS budget, etc.)
  2. Proxy through an Edge Function — never expose API keys to the frontend
  3. Log usage per user for auditing

### S7. Input Validation & Frontend Hardening (MEDIUM)
- [ ] Add Zod schema validation to `importProject` — validate all fields, enforce max lengths, reject unexpected keys
- [ ] Sanitize all user-supplied text before rendering (React handles most XSS, but validate on import)
- [ ] When adding Stripe (Phase 6): subscription status and plan tier must live on a **server-controlled table** that the user has NO write access to — never store billing state on the `users` table

### S8. Future-Proofing for Monetization (Phase 6 prerequisite)
- [ ] Create a separate `subscriptions` table with RLS that only allows SELECT for the owning user — no INSERT/UPDATE/DELETE from client
- [ ] All plan-tier checks must happen server-side (Edge Function or Postgres function) — never trust a client-side `plan` field
- [ ] Rate limit values (daily AI generations, export counts) must be stored in a server-managed `usage` table, not on any user-writable table
- [ ] When adding AI features: proxy all AI calls through Edge Functions, enforce per-user daily caps, set provider-level spend limits

### Security Priority Order

| Item | Severity | Fix When |
|------|----------|----------|
| **S1** Self-writable role | Critical | Immediately — before any production deploy |
| **S4** No rate limiting | Critical | Phase 2 — when adding the API layer |
| **S2** Shared project over-permissioning | High | Phase 2 — when refining RLS |
| **S5** Database resource limits | High | Phase 2 — when finalizing schema |
| **S6** Billing alerts | High | Phase 2 — when Supabase project goes live |
| **S3** Security-definer hardening | Medium | Phase 2 — quick fix |
| **S7** Input validation | Medium | Phase 2 — when replacing mock data |
| **S8** Monetization safeguards | Medium | Phase 6 — before adding payments |

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
