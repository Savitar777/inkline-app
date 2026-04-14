# Inkline — Product Requirements Document

**Version:** 1.0
**Date:** April 2026
**Author:** Henry (savitar77)
**Status:** Living document

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Product Goals and Non-Goals](#2-product-goals-and-non-goals)
3. [Target Users and Personas](#3-target-users-and-personas)
4. [Jobs To Be Done](#4-jobs-to-be-done)
5. [Current State Summary](#5-current-state-summary)
6. [Core Product Modules](#6-core-product-modules)
7. [Detailed Features by Module](#7-detailed-features-by-module)
8. [Tutorial and Learning System](#8-tutorial-and-learning-system)
9. [Information Architecture](#9-information-architecture)
10. [Database / Data Model / Entities](#10-database--data-model--entities)
11. [File Pipeline / Upload / Import / Export Model](#11-file-pipeline--upload--import--export-model)
12. [Workflow Design](#12-workflow-design)
13. [UI Screens and Screen Specs](#13-ui-screens-and-screen-specs)
14. [UX Rules and Design Guidelines](#14-ux-rules-and-design-guidelines)
15. [Roles, Permissions, and Collaboration Model](#15-roles-permissions-and-collaboration-model)
16. [Validation, Review, and Preflight Rules](#16-validation-review-and-preflight-rules)
17. [Technical Architecture Guidance](#17-technical-architecture-guidance)
18. [Non-Functional Requirements](#18-non-functional-requirements)
19. [MVP vs Phase 2 vs Phase 3](#19-mvp-vs-phase-2-vs-phase-3)
20. [Risks, Tradeoffs, and Open Questions](#20-risks-tradeoffs-and-open-questions)
21. [Success Metrics](#21-success-metrics)
22. [Final Recommendations](#22-final-recommendations)

**Appendices**

- [A. Suggested Supabase Schema Outline](#appendix-a-suggested-supabase-schema-outline)
- [B. Suggested Storage Bucket Structure](#appendix-b-suggested-storage-bucket-structure)
- [C. Suggested Analytics and Event Tracking Plan](#appendix-c-suggested-analytics-and-event-tracking-plan)
- [D. Suggested Onboarding Flow](#appendix-d-suggested-onboarding-flow)
- [E. Suggested Tutorial Architecture](#appendix-e-suggested-tutorial-architecture)
- [F. Suggested Visual Example Library Structure](#appendix-f-suggested-visual-example-library-structure)
- [G. Suggested Empty-State Copy Ideas](#appendix-g-suggested-empty-state-copy-ideas)
- [H. Suggested Future AI-Assisted Features](#appendix-h-suggested-future-ai-assisted-features)

---

# 1. Product Overview

## 1.1 What Inkline Is Now

Inkline is a personal collaborative workspace for comic, manga, manhwa, and webtoon creation. It covers the full production pipeline from script writing through artist collaboration to final export. The application runs as a React single-page application with two operating modes:

- **Supabase mode** — full authentication, real-time collaboration, cloud storage, and project synchronization across team members.
- **Offline/demo mode** — all state persisted in localStorage, no account required, suitable for solo writing or environments without network access.

The app supports four publishing formats (webtoon, manhwa, manga, and comic), four production roles (writer, artist, colorist, letterer) plus an admin role, and a hierarchical content model of Projects containing Episodes, Pages, Panels, and Content Blocks. It already includes a functional script editor with character roster and color-coding, thread-based collaboration with real-time messaging, a compile-and-export pipeline with lettering overlay and speech bubble placement, a validated file upload pipeline with MIME checking and SVG sanitization, and a script import wizard that can ingest TXT, Markdown, DOCX, and PDF files.

## 1.2 What Inkline Should Become Next

Inkline should evolve from a script-to-export pipeline into a complete creative production studio. The next evolution adds three major capabilities:

1. **Pre-production planning** — A Story Bible and Character Bible that let the writer develop narrative arcs, world-building details, character relationships, visual design references, and location descriptions before writing a single panel. Pre-production is where creative quality is won or lost, and the app should treat it as a first-class workflow rather than something that happens outside the tool.

2. **Production tracking and pipeline visibility** — A dashboard view that shows where every episode, page, and panel sits in the production pipeline (script → thumbnails → sketch → ink → color → letter → review → approved), who is responsible for the current step, and what is blocking forward progress.

3. **Built-in tutorial and learning system** — An integrated teaching layer that helps creators understand not just how to use the app, but how storytelling, panel composition, pacing, readability, and format-specific conventions actually work. This system uses visual examples, annotated illustrations, interactive previews, and contextual guidance to make the app self-teaching.

## 1.3 Core Value Proposition

Inkline is the workspace where a writer and their team take a comic idea from concept to publish-ready output without leaving the tool. It understands the creative process: that stories start with ideas and characters, move through scripts and panel plans, pass through art production stages, require review and revision, and must ultimately export in format-correct, platform-compliant outputs.

## 1.4 Why Inkline Is Differentiated

| Alternative | What it does well | What it lacks |
|---|---|---|
| Google Docs / Notion | Flexible text editing | No panel structure, no format awareness, no visual production pipeline, no export |
| Celtx / Final Draft | Screenplay formatting | No comic/webtoon format model, no visual asset pipeline, no collaboration on artwork |
| Clip Studio Paint / Procreate | Digital art creation | No script editing, no hierarchical episode/page/panel structure, no multi-role collaboration |
| Figma / Canva | Visual design and layout | No narrative structure, no production workflow, no comic-specific export presets |
| Trello / Linear | Task management | No content creation, no format-aware compilation, no script-to-panel mapping |
| MediBang / CLIP STUDIO PAINT EX | Manga page layout | Limited collaboration, no integrated script editor, no pre-production planning |

Inkline occupies a unique space because it combines narrative authoring, visual production tracking, format-aware compilation, and team collaboration into a single tool purpose-built for sequential art.

## 1.5 Product Vision

Inkline should feel like a personal studio — the kind of workspace where a writer opens the app, picks up exactly where they left off, and moves fluidly between writing, reviewing artwork, giving feedback, and preparing exports. The tool should understand the rhythms of comic creation: long stretches of writing, bursts of visual review, careful lettering passes, and the satisfaction of exporting a finished episode.

The vision is not "everything for everyone." Inkline does not need to be an art tool (that is what Clip Studio, Procreate, and Photoshop are for). It does not need to be a publishing platform (that is what WEBTOON, Tapas, and self-hosted sites are for). It needs to be the connective tissue — the workspace that holds the story together, tracks production, facilitates handoffs, and produces clean output.

## 1.6 Product Principles

1. **Writer-first, team-enabled.** The writer is the primary user. The app should feel like a writer's workspace that collaborators can plug into, not a project management tool with a script editor bolted on.

2. **Format-native, not format-agnostic.** The app understands that a webtoon page is a vertical scroll, a manga page is a B5 grid read right-to-left, and a comic page is a US-standard grid read left-to-right. This knowledge should inform every feature — from pacing advice to export presets to layout previews.

3. **Pre-production is production.** Story bibles, character sheets, world-building notes, and arc plans are not optional extras — they are where creative quality is established. The app should make pre-production feel as important as script writing.

4. **Teach the craft, not just the tool.** Many creators, especially first-time webtoon or manga creators, do not know what "impact panel" means, how to pace a cliffhanger, or why dialogue density affects mobile readability. The app should help them learn these concepts through visual examples and contextual guidance.

5. **Mobile-first, vertical-first.** The dominant comic format today is the vertical-scroll webtoon read on a phone. The app should default to this mental model — preview panels vertically, warn about mobile readability, and treat landscape/grid formats as supported alternatives.

6. **Production is a pipeline, not a to-do list.** Panels move through stages (draft → submitted → in progress → received → changes requested → approved). The app should make this pipeline visible, trackable, and unambiguous.

7. **Offline is a first-class mode.** A writer on a plane, in a coffee shop without WiFi, or simply preferring local work should be able to use Inkline with full script editing and export capability.

8. **Simple until you need depth.** The app should not overwhelm new users with production controls, format specifications, or advanced export options. Features should reveal themselves progressively — the onboarding experience should be welcoming, not intimidating.

## 1.7 Non-Commercial Declaration

Inkline is a personal internal team tool. It is not a monetized SaaS product, and this PRD explicitly excludes:

- Subscription tiers, billing, or payment processing
- Public user registration or marketplace features
- Advertising, sponsorship, or affiliate integrations
- Third-party API platform or developer ecosystem
- Multi-tenant infrastructure or tenant isolation
- Usage-based metering or quota-gated features

All features described in this document are designed for a single team using a single deployment. Architectural decisions should optimize for simplicity and creative utility, not scalability to thousands of concurrent users.

---

# 2. Product Goals and Non-Goals

## 2.1 Product Goals

### Primary Goals

| Goal | Description |
|---|---|
| **Complete creative pipeline** | Support every stage from concept through export in a single tool, eliminating the need to context-switch between separate writing, tracking, and collaboration tools |
| **Format-aware production** | Embed knowledge of webtoon, manhwa, manga, and comic conventions into the editing, preview, and export experience so that creators produce format-correct output |
| **Effective collaboration** | Enable a small team (2–6 people) to work together on scripts, artwork, and revisions with clear handoffs, real-time feedback, and approval workflows |
| **Pre-production depth** | Provide structured tools for story planning, character development, world-building, and arc mapping that feed into the script editor and production pipeline |
| **Self-teaching product** | Help users learn storytelling craft, panel composition, pacing techniques, and format conventions through in-app visual examples and contextual guidance |
| **Clean, validated exports** | Produce publish-ready outputs that meet platform specifications (dimensions, file sizes, color profiles) with preflight validation that catches issues before export |
| **Sustainable production workflow** | Support ongoing serialized production — not just a single episode — with templates, asset reuse, consistency tools, and progress tracking across seasons/arcs |

### Secondary Goals

| Goal | Description |
|---|---|
| **Offline reliability** | Maintain full script editing, local preview, and JSON export capability without network access |
| **Reduced production friction** | Minimize repetitive setup, manual tracking, and context-switching through smart defaults, templates, and progressive disclosure |
| **Accessibility** | Meet WCAG 2.1 AA standards for color contrast, keyboard navigation, and screen reader support |
| **Performance at scale** | Handle projects with 50+ episodes and hundreds of panels without degraded editing performance |

## 2.2 Non-Goals

| Non-Goal | Rationale |
|---|---|
| Subscriptions, billing, or payment processing | Personal team tool, not a commercial product |
| Public creator marketplace or discovery | No audience-facing features needed |
| Ad monetization or sponsorship integrations | Not a revenue-generating platform |
| Social features (follows, likes, comments from readers) | This is a production tool, not a reading platform |
| Built-in art creation tools (brushes, drawing canvas) | Artists use dedicated tools like Clip Studio or Procreate; Inkline receives their output |
| Mobile native app (iOS/Android) | The responsive web app is sufficient; native wrappers add maintenance burden without proportional value |
| Multi-tenant SaaS infrastructure | Single-deployment tool for one team |
| Third-party plugin/extension ecosystem | Complexity not justified for team use |
| AI-generated artwork or AI writing replacement | AI assistance should enhance workflows (suggestions, analysis), not replace creative work |
| Hosting or publishing reader-facing content | Export handles output; distribution happens on external platforms |

---

# 3. Target Users and Personas

## 3.1 Persona: Solo Writer-Creator

**Name:** Mina
**Role:** Writer (also learning art fundamentals)
**Background:** Aspiring webtoon creator working on her first series. Has strong story ideas but limited understanding of panel composition, pacing conventions, and production workflows. Works primarily from her laptop and phone.

**Goals:**
- Write and structure her webtoon script in a format that maps to actual panels and pages
- Learn what good panel composition and vertical pacing look like through examples
- Produce a clean vertical-scroll export she can submit to WEBTOON Canvas
- Track her own progress across episodes without a project management tool

**Frustrations:**
- Google Docs doesn't understand panel structure — she has to manually format everything
- She doesn't know what "impact panel" or "establishing shot" means in practice
- Export from other tools doesn't match WEBTOON's dimension requirements
- No single tool handles both writing and production planning

**Ideal Inkline Flow:**
1. Creates a webtoon project, walks through onboarding
2. Explores tutorials on vertical pacing and panel types
3. Writes her first episode in the script editor with dialogue, captions, and SFX
4. Uses the Story Bible to plan her character arcs
5. Reviews format preview to understand how her script maps to visual output
6. Exports a test episode to check dimensions and readability

## 3.2 Persona: Writer Collaborating with Artist

**Name:** Henry
**Role:** Writer (primary), working with one artist
**Background:** Experienced storyteller building a manhwa series. Writes detailed scripts with panel descriptions, shot directions, and character acting notes. Partners with a freelance artist who draws in Clip Studio Paint and delivers panel artwork as PNG files.

**Goals:**
- Write scripts that clearly communicate visual intent to the artist
- Submit script batches to the artist and track which panels have received artwork
- Review artwork in context — see the panel description alongside the submitted art
- Request changes on specific panels with clear notes
- Compile approved panels into a format-correct export

**Frustrations:**
- Communicating panel-level feedback through email or Discord is chaotic
- Tracking which of 200+ panels are done, pending, or need revision requires a spreadsheet
- Stitching artwork into vertical scroll format manually is tedious and error-prone
- No tool connects his script structure to the artist's visual output

**Ideal Inkline Flow:**
1. Writes Episode 12 in the script editor with detailed panel descriptions
2. Submits pages 1-8 to the artist via the collaboration view
3. Artist uploads panel artwork, which Inkline maps to the correct panels
4. Henry reviews each panel in the compile view, approves or requests changes
5. Artist resubmits revised panels; Henry approves the full page
6. Henry compiles the approved episode and exports as manhwa-web ZIP

## 3.3 Persona: Small Comic/Webtoon Team

**Name:** Studio Vertex (4 people)
**Roles:** Writer, Artist, Colorist, Letterer
**Background:** A small team producing a bi-weekly webtoon. They have established workflows but struggle with coordination. The writer scripts 3-4 episodes ahead, the artist works on pencils and inks, the colorist adds color passes, and the letterer places speech bubbles and sound effects.

**Goals:**
- Maintain a production pipeline where each team member knows what is waiting for them
- Pass work through stages without miscommunication about which version is current
- Maintain character and visual consistency across 50+ episodes
- Produce weekly exports on a reliable schedule

**Frustrations:**
- File sharing through Google Drive loses context — which panel is which?
- The letterer needs to know character speaking styles but doesn't have access to the story bible
- Status tracking happens in Slack threads that get buried
- Export settings differ between team members, leading to inconsistent output

**Ideal Inkline Flow:**
1. Writer maintains the Story Bible and Character Bible as living references
2. Writer scripts episodes, artist sees assignments in the collaboration view
3. Artist uploads inked panels; colorist picks up approved inks for coloring
4. Letterer uses the lettering overlay to place speech bubbles based on the script
5. Writer reviews the fully assembled episode in compile view
6. Export runs with the team's standard preset (webtoon-web, 72 DPI, RGB, ZIP)

## 3.4 Persona: Editor / Reviewer

**Name:** Jordan
**Role:** Writer or Admin (acting as editor)
**Background:** A more experienced creator who reviews work from other team members. May be the project owner or a senior collaborator who provides story and art direction feedback.

**Goals:**
- Review submitted artwork in the context of the script
- Provide specific, panel-level feedback with change request notes
- Track revision cycles and ensure quality before export approval
- Maintain story consistency across episodes

**Frustrations:**
- Reviewing artwork without the script side-by-side requires constant context-switching
- Change requests get lost in messaging threads
- No clear record of what was approved versus what was a draft
- Hard to compare multiple revision versions of the same panel

**Ideal Inkline Flow:**
1. Opens the collaboration view and sees which episodes have pending reviews
2. Clicks into an episode thread, reviews artwork panel-by-panel
3. Approves panels that meet quality standards
4. Requests changes on panels that need revision, with specific notes
5. Tracks revision status until all panels are approved
6. Confirms export readiness before the writer runs the final compile

---

# 4. Jobs To Be Done

## 4.1 Concept Planning

| Job | Trigger | Desired Outcome |
|---|---|---|
| Capture a series concept | "I have an idea for a new webtoon" | A project exists with title, format, and a place to develop the idea |
| Choose the right format | "Should this be a webtoon or manga?" | Understanding of how format affects pacing, layout, reading direction, and export |
| Plan the overall narrative arc | "I need to map out the full story" | Story arcs documented with episode ranges, turning points, and arc relationships |

## 4.2 Story Development

| Job | Trigger | Desired Outcome |
|---|---|---|
| Build a story bible | "I need to keep track of world rules and settings" | A living reference document with locations, world rules, timeline, and themes |
| Plan story arcs | "How do my character arcs intersect with the plot?" | Visual arc mapping across episodes with linked characters and plot points |
| Outline episode structure | "I need to break this arc into episodes" | Episode list with briefs, page estimates, and arc linkages |

## 4.3 Character Development

| Job | Trigger | Desired Outcome |
|---|---|---|
| Create a character profile | "I need to define this character" | A rich character entry with name, role, description, personality, speech patterns, relationships, and visual color |
| Document character appearance | "The artist needs to know how to draw them" | Character design sheet with reference images, annotations, and visual notes |
| Track character relationships | "These two characters have a complicated dynamic" | Relationship map showing connections, types, and evolution across arcs |

## 4.4 Script Writing

| Job | Trigger | Desired Outcome |
|---|---|---|
| Write a structured script | "I need to write Episode 12" | Episode with pages, panels, and content blocks in the correct hierarchy |
| Import an existing script | "I already wrote this in Word/Google Docs" | Structured import that maps existing text to episodes, pages, panels, and dialogue |
| Write dialogue with character voice | "Each character should sound different" | Dialogue blocks tagged to characters with color-coding for easy scanning |
| Add panel directions | "I need to tell the artist what to draw" | Panel descriptions with shot type, action description, and visual notes |

## 4.5 Panel Planning

| Job | Trigger | Desired Outcome |
|---|---|---|
| Plan page layout | "How should these panels flow on this page?" | Layout notes per page with panel count and composition guidance |
| Understand pacing impact | "This moment needs to hit hard" | Knowledge of impact panels, splash pages, spacing, and timing techniques |
| Validate panel density | "Is this page too crowded?" | Feedback on panel count, dialogue density, and readability per page |

## 4.6 Asset Management

| Job | Trigger | Desired Outcome |
|---|---|---|
| Upload and organize artwork | "The artist sent panel artwork" | Artwork filed to the correct panel with version tracking and status updates |
| Store reference materials | "I need to share visual references with the team" | Reference images and documents organized per episode, accessible to all roles |
| Reuse assets across episodes | "We use this background in every chapter" | Asset tagging and search that makes recurring assets easy to find and reuse |

## 4.7 Collaboration

| Job | Trigger | Desired Outcome |
|---|---|---|
| Hand off work to another role | "Pages 1-8 are ready for the artist" | Submission creates a thread, notifies the artist, and moves panels to submitted status |
| Give panel-level feedback | "Panel 3 needs a wider shot" | Change request attached to a specific panel with clear notes |
| Discuss creative decisions | "Should we change the scene transition here?" | Thread-based conversation tied to specific episodes and page ranges |
| Track who is working on what | "Is the colorist done with Episode 10?" | Production visibility showing assignment and status per role |

## 4.8 Review

| Job | Trigger | Desired Outcome |
|---|---|---|
| Review submitted artwork | "The artist uploaded new panels" | Side-by-side view of script description and submitted artwork |
| Approve or request changes | "This panel looks good / needs revision" | Clear approval status per panel with revision history |
| Track revision cycles | "How many rounds has this panel gone through?" | Revision count and history visible per panel |

## 4.9 Compile and Export

| Job | Trigger | Desired Outcome |
|---|---|---|
| Preview assembled output | "What will this episode look like published?" | Format-correct preview with panels assembled per the target format |
| Place speech bubbles and lettering | "I need to add dialogue to the artwork" | Lettering overlay with draggable bubbles, font choices, and character tagging |
| Export in the correct format | "I need a ZIP of vertical panels for WEBTOON" | Export with correct dimensions, DPI, color profile, and file packaging |
| Verify export readiness | "Is everything approved and ready to go?" | Preflight checklist showing any blocking issues before export |

## 4.10 Publishing Preparation

| Job | Trigger | Desired Outcome |
|---|---|---|
| Validate platform requirements | "Will this pass WEBTOON's upload requirements?" | Dimension, file size, and format validation against platform specs |
| Generate thumbnails | "I need a cover image for this episode" | Thumbnail generation at platform-required dimensions |
| Check dialogue readability | "Can readers actually read this on mobile?" | Readability analysis for font size, text density, and contrast on mobile screens |
| Review across episodes | "Is the quality consistent across the arc?" | Cross-episode consistency checks for character design, color palette, and lettering style |

## 4.11 Tutorial and Learning

| Job | Trigger | Desired Outcome |
|---|---|---|
| Understand a storytelling concept | "What is an impact panel?" | Visual example with annotation showing what it looks like and when to use it |
| Learn app features | "How do I use the lettering overlay?" | Step-by-step walkthrough with contextual highlighting |
| Compare format conventions | "How does manga pacing differ from webtoon?" | Side-by-side visual comparison of the same scene in different formats |
| Improve from warnings | "The app says my dialogue density is too high" | Tutorial surface that explains the warning, shows good vs bad examples, and suggests improvements |

---

# 5. Current State Summary

## 5.1 Existing Strengths

Inkline already has a solid foundation that should not be rebuilt. The following systems are working and well-implemented:

**Script Editor** — The hierarchical content model (Episode → Page → Panel → ContentBlock) is clean and extensible. Content blocks support dialogue, caption, and SFX types with character tagging and color-coding. Undo/redo works correctly with ref-based history stacks and reactive `canUndo`/`canRedo` state. The script import wizard handles four document formats with heuristic parsing and three merge strategies.

**Collaboration** — Thread-based messaging with real-time updates via Supabase Realtime works reliably. Typing indicators use Supabase Presence channels. Artwork upload with panel picker correctly updates panel status. The reference files panel provides per-episode document and image browsing.

**Compile and Export** — The assembly engine correctly handles all four format types with accurate dimensions, gutters, and reading direction. The lettering overlay supports draggable speech bubbles with font selection. Export produces PDF, PNG, WebP, and ZIP outputs with format-specific presets. In-memory export history tracks the last 20 exports.

**File Pipeline** — Comprehensive validation including MIME whitelisting, magic byte detection, SVG sanitization, filename sanitization, duplicate detection via SHA-256, and role-based upload permissions. The StorageAdapter abstraction cleanly separates Supabase storage from localStorage fallback.

**Authentication and Security** — Google OAuth and email/password auth via Supabase Auth. Role-locked at signup with database trigger enforcement. Row-level security on all 13 tables. Client-side rate limiting on writes, messages, invites, and uploads.

**UI/UX Foundation** — Responsive design with mobile/tablet/desktop breakpoints. Dark/light/system theme support via CSS custom properties. Command palette (Cmd+K) for feature discovery. Notification center. Onboarding flow for new users. Keyboard shortcuts with cheat sheet.

## 5.2 Existing Systems Already Present

| System | Implementation | Location |
|---|---|---|
| Content hierarchy | Project → Episode → Page → Panel → ContentBlock | `src/types/index.ts` |
| File categories | 6 categories with MIME/size/role rules | `src/types/files.ts` |
| Panel status workflow | 6-state lifecycle (draft → approved) | `src/types/index.ts` |
| Format specifications | 4 formats with dimensions, DPI, reading direction | `src/lib/assemblyEngine.ts` |
| Export presets | webtoon-web, manhwa-web, manga-print, comic-print | `src/services/exportService.ts` |
| Schema versioning | Version-tagged JSON with migration chain | `src/domain/validation.ts`, `src/domain/migrations.ts` |
| Search system | Multi-scope search across scripts, collaboration, assets, characters | `src/types/index.ts` (SearchScope, ProjectSearchResult) |
| Activity metrics | Panel status aggregation, unread counts, export readiness percentage | `src/domain/selectors.ts` |
| Project serialization | JSON export/import with version migration | `src/domain/validation.ts` |
| Rate limiting | Sliding-window client-side limiters for writes (30/10s), messages (20/60s), invites (10/60s), uploads (10/60s) | `src/services/projectService.ts`, `src/services/fileMetadataService.ts` |

## 5.3 Known Gaps

| Gap | Impact | Recommended Fix |
|---|---|---|
| ~~No virtualized rendering for large panel counts~~ | ~~Performance degrades with 100+ panels~~ | ~~DONE — @tanstack/react-virtual integrated~~ |
| ~~No drag-to-reorder for panels or pages~~ | ~~Writers cannot rearrange~~ | ~~DONE — @dnd-kit integrated~~ |
| ~~ExportScopeDialog not wired as primary export UI~~ | ~~Not the default~~ | ~~DONE — wired as primary export flow~~ |
| Client-side-only rate limiting | Rate limits can be bypassed by a determined user | Acceptable for a personal tool; server-side limits only matter at multi-tenant scale |
| No email notifications | Team members must check the app for updates | Add optional email notifications via Resend or SendGrid |
| ~~No pre-production tools (Story Bible, Character Bible)~~ | ~~Writers plan outside~~ | ~~DONE — Phase 2a~~ |
| ~~No production pipeline visibility~~ | ~~No dashboard~~ | ~~DONE — Phase 2e~~ |
| ~~No tutorial or learning system~~ | ~~Users must already understand concepts~~ | ~~DONE — Phase 2f~~ |
| No asset tagging or search | Reference files and assets are browseable but not searchable by tag | Add tagging system to Asset Library |
| No template/reusable layout system | Every episode starts from scratch | Add templates for recurring page/panel structures |

## 5.4 Areas to Expand Rather Than Rebuild

**Character System** — The existing `characters` table has id, name, role, desc, and color. This should be expanded with additional fields (appearance, personality, speech patterns, arc notes) and new related tables (relationships, design sheets) rather than replacing the current model.

**Collaboration** — The thread-and-message system works well. Expansion should add review-specific features (side-by-side script/art view, revision history, change request tracking) on top of the existing thread infrastructure.

**Export Pipeline** — The current export is functional. Expansion should add preflight validation, thumbnail preset generation, long-image slicing for WEBTOON uploads, and the ExportScopeDialog as the primary UI — not a rewrite of the rendering engine.

**File Pipeline** — The validation system is comprehensive. Expansion should add image dimension analysis (for readability warnings), thumbnail generation, and batch upload — not a rearchitecture of the StorageAdapter.

**Settings** — Current settings cover theme, workspace preferences, and keyboard shortcuts. Expansion should add notification preferences, export defaults, and tutorial settings — not a settings framework redesign.

---

# 6. Core Product Modules

The following 14 modules define the major functional areas of Inkline. Some are already implemented; others are proposed expansions. Each module is described with its purpose, primary users, key objects, current state, and recommended expansion.

## 6.1 Workspace Dashboard

**Purpose:** Entry point for all projects. Shows the user's project list, activity summary, and quick actions.
**Primary Users:** All roles
**Key Objects:** Project list, user profile, activity feed
**Current State:** Implemented as `ProjectDashboard.tsx`. Shows project grid with create/open actions, admin panel for user management, and triggers onboarding for new users.
**Recommended Expansion:** Add cross-project activity summary (unread messages, pending reviews, upcoming deadlines). Add recent activity feed showing last-touched episodes and panels. Add project archiving.

## 6.2 Series Manager / Project Dashboard

**Purpose:** Overview of a single project/series. Shows episode list, team members, production progress, and quick navigation to any part of the project.
**Primary Users:** Writer, Admin
**Key Objects:** Project, Episode list, Team roster, Production stats
**Current State:** Partially exists within the nav bar (project title, tab navigation) and the WorkspaceActivityRail (pending reviews, export readiness, unread counts).
**Recommended Expansion:** Dedicated project overview screen showing: episode grid with status indicators, team members with roles, production progress bars, Story Bible and Character Bible entry points, and project-level settings (format, export defaults).

## 6.3 Story Bible

**Purpose:** Central repository for narrative planning. Holds story arcs, world-building details, location descriptions, timeline events, and thematic notes.
**Primary Users:** Writer (primary), all roles (read access)
**Key Objects:** Story Arc, Location, World Rule, Timeline Event, Theme Note
**Current State:** Not implemented. Writers currently plan stories outside the app.
**Recommended Expansion:** Build a dedicated Story Bible module with: arc editor (title, description, episode range, status), location manager (name, description, reference images), world rules list (rules the story universe follows), timeline view (chronological event ordering), and thematic notes. All data should be project-level and visible to all team members.

## 6.4 Character Bible

**Purpose:** Deep character development and design reference. Goes beyond the current character roster to include personality traits, speech patterns, relationship maps, visual design sheets, and arc tracking per character.
**Primary Users:** Writer (author), Artist (visual reference), Letterer (speech patterns)
**Key Objects:** Character Profile, Character Design Sheet, Character Relationship, Character Arc
**Current State:** Basic character roster exists with id, name, role, desc, and color. Characters are used for dialogue tagging and color-coding in the script editor.
**Recommended Expansion:** Extend the character model with: detailed profiles (appearance, personality, goals, fears, speech patterns, character voice notes), design sheets (uploaded reference images with annotations), relationship graph (connections between characters with types and descriptions), character arcs (how each character changes across story arcs), and visual consistency checklist (key visual traits that artists must maintain).

## 6.5 Script Editor

**Purpose:** Core writing workspace for authoring episodes, pages, panels, and content blocks.
**Primary Users:** Writer (primary)
**Key Objects:** Episode, Page, Panel, ContentBlock, Character
**Current State:** Fully implemented. Supports the full hierarchy with dialogue/caption/SFX blocks, character color-coding, undo/redo, script import wizard, and submission to artist workflow.
**Recommended Expansion:** Add drag-to-reorder for pages and panels. Add virtualized rendering for large episodes (100+ panels). Add page layout notes with pacing guidance. Add inline character profile preview on hover. Add script statistics (word count, dialogue density, panel count per page).

## 6.6 Episode / Page / Panel Planner

**Purpose:** Visual planning layer for page composition and panel flow. Helps writers think about layout, pacing, and visual rhythm before writing detailed panel descriptions.
**Primary Users:** Writer (primary), Artist (reference)
**Key Objects:** Page layout template, Panel composition, Pacing note
**Current State:** Not implemented as a separate planner. Page layout notes exist as a text field on the Page entity.
**Recommended Expansion:** Add a visual page planner that shows: page thumbnail grid with panel count indicators, suggested panel compositions (grid, L-shape, full-bleed, etc.), pacing annotations (slow, fast, impact, transition), and page-turn/scroll planning for cliffhanger placement. This module acts as a planning complement to the script editor — the writer sketches layout intent here, then writes detailed scripts per panel.

## 6.7 Vertical Pacing and Layout Assistant

**Purpose:** Format-aware analysis and guidance for page and panel composition. Provides real-time feedback on pacing, panel density, dialogue readability, and scroll flow.
**Primary Users:** Writer (primary)
**Key Objects:** Pacing analysis, Readability score, Layout recommendation
**Current State:** Not implemented. The assembly engine understands format dimensions but does not provide pacing feedback.
**Recommended Expansion:** Build an analysis layer that evaluates: panels per page relative to format norms, dialogue density (words per panel, characters per bubble), estimated mobile reading time per page, scroll distance between dramatic beats (webtoon/manhwa), page-turn reveal placement (manga/comic), and empty space/breathing room usage. Provide feedback as contextual hints in the script editor, not a separate screen.

## 6.8 Asset Library

**Purpose:** Centralized management for all project files — panel artwork, reference images, documents, exports, and reusable assets.
**Primary Users:** All roles
**Key Objects:** UploadedFile, Asset tag, Asset variant, File metadata
**Current State:** Partially implemented. AssetLibraryDrawer in compile view shows project files grouped by category. FileUploadZone handles drag-and-drop with validation. ReferencePanel shows per-episode reference files.
**Recommended Expansion:** Add asset tagging (e.g., "background," "character-A," "chapter-cover"). Add search within the asset library. Add asset variants (multiple versions of the same asset with version labels). Add batch upload support. Add cross-episode asset reuse with linking (use asset from Episode 5 in Episode 12 without re-uploading). Add thumbnail previews for all image assets.

## 6.9 Collaboration / Review

**Purpose:** Team communication, work handoffs, artwork review, and approval workflow.
**Primary Users:** All roles
**Key Objects:** Thread, Message, Panel status, Change request, Approval record
**Current State:** Fully implemented. Thread-based messaging with real-time updates, typing indicators, artwork upload with panel picker, panel status workflow (6 states), team invitation by email, and reference file panel.
**Recommended Expansion:** Add side-by-side script/artwork comparison in review mode. Add panel revision history (see all submitted versions of a panel). Add change request notes attached to specific panels (not just thread messages). Add batch approval (approve all panels on a page at once). Add notification preferences per team member. Add optional email notifications for submissions and approvals.

## 6.10 Production Pipeline Tracker

**Purpose:** Dashboard showing production progress across all episodes, pages, and panels. Answers "where is everything in the pipeline?" at a glance.
**Primary Users:** Writer (primary), Admin
**Key Objects:** Production status aggregation, Role assignment, Milestone
**Current State:** Partially exists in WorkspaceActivityRail (pending reviews, export readiness percentage, unread counts) and in the ProjectActivitySummary selector (panel status aggregation).
**Recommended Expansion:** Build a dedicated production dashboard showing: episode-level progress bars (percentage of panels approved), page-level status grid (heatmap of panel statuses), bottleneck identification (which role is holding up progress), production timeline with milestones, and assignment tracking (who is responsible for the current step on each panel).

## 6.11 Compile and Preview

**Purpose:** Assemble panels into format-correct output and preview the final result before export.
**Primary Users:** Writer (primary), Letterer
**Key Objects:** Assembly preview, Lettering overlay, Bubble data, Format specification
**Current State:** Fully implemented. Assembly preview for all four formats with zoom and DPI controls. Lettering overlay with draggable speech bubbles. Per-panel approval workflow. Format picker.
**Recommended Expansion:** Add mobile preview mode (simulate phone viewport for webtoon readability checking). Add comparison view (preview same content in multiple formats). Add readability overlay (highlight text that may be too small on mobile). Wire ExportScopeDialog as the primary export UI.

## 6.12 Export / Publish Prep

**Purpose:** Generate final output files and validate them against publishing platform requirements.
**Primary Users:** Writer (primary)
**Key Objects:** Export job, Export preset, Preflight result, Platform validation rule
**Current State:** Functional export to PDF, PNG, WebP, and ZIP with four presets. DPI and scope controls. In-memory export history.
**Recommended Expansion:** Add preflight validation (check all panels approved, no empty dialogue, correct dimensions, file sizes within platform limits). Add long-image slicing for WEBTOON uploads (split vertical strip into ≤1280px segments). Add thumbnail generation at standard platform dimensions. Add export readiness summary before export. Add platform-specific validation profiles (WEBTOON Canvas requirements, Tapas requirements, print specifications).

## 6.13 Tutorial and Learning Center

**Purpose:** In-app education system that teaches storytelling concepts, format conventions, production workflows, and app features through visual examples and guided walkthroughs.
**Primary Users:** All roles (especially new creators)
**Key Objects:** Tutorial module, Tutorial step, Visual example, Concept glossary entry, Learning progress
**Current State:** Basic onboarding flow (4 steps covering welcome, script editor, collaboration, and compile/export). No tutorial system beyond initial onboarding.
**Recommended Expansion:** Build a comprehensive learning system (see Section 8 for full specification).

## 6.14 Settings / Preferences / Keyboard Help

**Purpose:** User and workspace configuration. Profile management, theme, layout preferences, keyboard shortcuts, and data management.
**Primary Users:** All roles
**Key Objects:** User profile, Preferences, Theme, Keyboard shortcut, Backup
**Current State:** Implemented with three tabs: Profile (name, avatar), Workspace (default view, compact dashboard, platform mode, theme), Data (export/import JSON).
**Recommended Expansion:** Add notification preferences (which events trigger in-app and email notifications). Add export defaults (preferred preset, DPI, format). Add tutorial preferences (show contextual tips, reset tutorial progress). Add collaboration preferences (typing indicator visibility, message notification sound).

---

# 7. Detailed Features by Module

## 7.1 Workspace Dashboard

### Existing Features (Keep)
- Project grid with create, open, and delete actions
- Project creation modal with title and format selector
- Admin panel for managing users and projects (admin role only)
- Onboarding flow trigger for new users
- Settings access from the dashboard

### Missing Features (Add)

| Feature | Priority | Rationale |
|---|---|---|
| Cross-project activity summary | High | Writer needs to see all pending reviews, unread messages, and recent changes across all projects from the dashboard without opening each one |
| Recent activity feed | Medium | Quick access to "pick up where you left off" with last-edited episodes and panels |
| Project archiving | Low | Completed or paused projects should be movable to an archive state rather than deleted |
| Project duplication | Low | Creating a new project based on an existing template (structure only, no content) |

## 7.2 Series Manager / Project Dashboard

### Existing Features (Keep)
- Project title editing in nav bar
- Tab navigation (Script Editor, Collaboration, Compile & Export)
- WorkspaceActivityRail with pending reviews, export readiness, and unread counts

### Missing Features (Add)

| Feature | Priority | Rationale |
|---|---|---|
| Episode grid with status indicators | High | Visual overview of all episodes showing draft/in-progress/approved status per episode |
| Team roster panel | High | See all team members, their roles, and their current assignment focus |
| Production progress bars | High | Episode-level and project-level progress based on panel approval percentages |
| Story Bible entry point | High | Direct navigation to Story Bible from the project dashboard |
| Character Bible entry point | High | Direct navigation to Character Bible from the project dashboard |
| Format info card | Medium | Quick reference showing project format, dimensions, reading direction, and export preset |
| Project-level settings | Medium | Format, default export preset, team invitation settings |

## 7.3 Story Bible

### Existing Features
None — this is a new module.

### Features to Build

| Feature | Priority | Rationale |
|---|---|---|
| Story Arc editor | High | Define arcs with title, description, episode range, status (planning/active/completed), and linked characters. Essential for narrative planning. |
| Location manager | High | Define settings with name, description, and reference images. Artists need location references for visual consistency. |
| World Rules list | Medium | Document rules of the story universe (magic systems, social hierarchies, technology levels). Prevents continuity errors. |
| Timeline view | Medium | Chronological ordering of story events across episodes. Helps track causality and chronology in complex narratives. |
| Theme and motif notes | Low | Free-form notes on thematic elements and recurring motifs. Useful for maintaining thematic consistency across long series. |
| Arc-to-episode linking | High | Connect story arcs to specific episode ranges so writers can see which arcs are active in which episodes |
| Story Bible search | Medium | Full-text search across all Story Bible entries for quick reference during writing |
| Story Bible export | Low | Export the Story Bible as a standalone document for sharing with team members who prefer offline reading |

## 7.4 Character Bible

### Existing Features (Keep)
- Character roster with id, name, role, desc, and color
- Character color-coding in script editor dialogue blocks
- Character sidebar in script editor with add/edit/delete
- Character search results in command palette

### Missing Features (Add)

| Feature | Priority | Rationale |
|---|---|---|
| Extended character profile | High | Appearance, personality traits, goals, fears, backstory, and character voice notes. Writers need these for consistent character voice; artists need appearance details. |
| Speech pattern notes | High | How the character talks — formal/casual, catchphrases, accent notes, vocabulary level. Essential for letterers and for maintaining consistent character voice in dialogue. |
| Character design sheet | High | Upload reference images (character turnarounds, expression sheets, costume variations) with annotations. Artists use these as the primary visual reference. |
| Character relationship graph | Medium | Define relationships between characters (ally, rival, mentor, love interest, etc.) with optional descriptions. Helps writers track relationship dynamics. |
| Character arc tracking | Medium | How each character changes across story arcs — start state, catalysts, end state per arc. Supports intentional character development. |
| Visual consistency checklist | Medium | List of key visual traits (hair color, eye color, distinguishing marks, clothing) that artists must maintain across panels. Prevents visual inconsistency. |
| Character comparison view | Low | Side-by-side character profiles for comparison. Useful when developing characters that should contrast or complement each other. |

## 7.5 Script Editor

### Existing Features (Keep)
- Episode sidebar with episode list and creation
- Page and panel hierarchy with add/delete/edit
- Content block types: dialogue, caption, SFX
- Character tagging with color-coded labels
- Parenthetical notes on dialogue blocks
- Panel shot type and description fields
- Undo/redo with full history stack (Cmd+Z / Cmd+Shift+Z)
- Script import wizard (TXT, MD, DOCX, PDF with 3 merge strategies)
- Script preview modal
- Submit to artist workflow
- Mobile drawer for episode sidebar on mobile
- Keyboard shortcuts (Shift+E new episode, Shift+P new page, Shift+N new panel)

### Missing Features (Add)

| Feature | Priority | Rationale |
|---|---|---|
| Drag-to-reorder panels | High | Writers frequently restructure panel order during editing. Currently requires delete and recreate. |
| Drag-to-reorder pages | High | Same as above — page order changes are common during revision. |
| Virtualized panel rendering | High | Episodes with 100+ panels cause UI slowdown. `@tanstack/react-virtual` is already a dependency. |
| Script statistics panel | Medium | Word count per episode/page/panel, dialogue density, panel count per page, and content type breakdown. Helps writers self-assess pacing. |
| Inline character profile preview | Medium | Hover over a character name in a dialogue block to see their profile summary (appearance, speech patterns). Reduces context-switching to character bible. |
| Page layout notes with guidance | Medium | Expand the page layout note field with suggestions: "This page has 8 panels — most webtoon pages work best with 3-5 for readability." |
| Panel type tagging | Medium | Tag panels as "establishing," "action," "dialogue," "impact," "transition," etc. Enables pacing analysis and tutorial connections. |
| Episode template creation | Low | Save an episode's structure (page count, panel count per page, content types) as a reusable template for future episodes. |
| Autosave indicator | Low | Visual confirmation that changes are saved (or pending save) to reduce anxiety about data loss. |

## 7.6 Episode / Page / Panel Planner

### Existing Features
- Page layout note (text field on Page entity)

### Features to Build

| Feature | Priority | Rationale |
|---|---|---|
| Page thumbnail grid | High | Visual overview of all pages in an episode showing panel count and basic layout. Helps writers see the structural rhythm. |
| Pacing annotations | Medium | Tag pages/panels with pacing labels (slow, building, climax, cooldown, transition). Enables pacing analysis across the episode. |
| Panel composition suggestions | Medium | When adding panels to a page, suggest common composition patterns (2-panel dialogue, 3-panel action sequence, full-bleed impact). Links to tutorial examples. |
| Scroll distance calculator | Medium | For webtoon/manhwa formats, estimate scroll distance between dramatic beats. Helps writers understand reader experience. |
| Page-turn planning (manga/comic) | Medium | Highlight which panels fall on page-turn reveals. Critical for manga/comic pacing where the page turn is a dramatic tool. |
| Episode outline view | Low | Condensed view showing just page briefs and panel summaries — useful for reviewing structure without diving into full content. |

## 7.7 Vertical Pacing and Layout Assistant

### Features to Build

| Feature | Priority | Rationale |
|---|---|---|
| Panel density feedback | High | Contextual hint when a page has too many or too few panels relative to format norms. E.g., "Webtoon pages typically have 3-5 panels for comfortable mobile reading." |
| Dialogue density analysis | High | Word count per panel and per page with readability indicators. Warns when dialogue exceeds comfortable reading density for the format. |
| Mobile readability estimate | High | Simulate how text will appear at mobile viewport size. Flag text that may be too small or dialogue bubbles that may overlap. |
| Impact panel detection | Medium | When a panel is tagged as "impact" or has minimal dialogue, suggest formatting approaches (extra vertical spacing before/after, full-width treatment). |
| Scene transition spacing | Medium | Recommend vertical spacing between scene changes in webtoon/manhwa formats. Scene transitions need breathing room to signal the shift to readers. |
| Pacing rhythm visualization | Low | Abstract visualization of pacing across an episode — showing the fast/slow rhythm as a waveform. Helps writers identify monotonous pacing. |

## 7.8 Asset Library

### Existing Features (Keep)
- AssetLibraryDrawer grouped by file category
- FileUploadZone with drag-and-drop and validation
- ReferencePanel for per-episode reference browsing
- Full file validation pipeline (MIME, magic bytes, SVG, filename, duplicate)
- Role-based upload permissions per category

### Missing Features (Add)

| Feature | Priority | Rationale |
|---|---|---|
| Asset tagging | High | Add user-defined tags (e.g., "background," "character-mina," "chapter-cover") for organization and search. |
| Asset search | High | Search assets by tag, filename, episode, and file type. Current browsing only supports category grouping. |
| Batch upload | Medium | Upload multiple files at once with progress tracking. Artists often deliver batches of panel artwork. |
| Asset variants / versioning | Medium | Track multiple versions of the same asset (e.g., sketch → ink → color of the same panel). Show version history and allow rollback. |
| Cross-episode asset linking | Medium | Reference an asset from one episode in another without re-uploading. Useful for recurring backgrounds and character expressions. |
| Thumbnail generation | Medium | Auto-generate thumbnails for image assets at multiple resolutions. Speeds up library browsing. |
| Usage tracking | Low | Show where each asset is used (which panels, which episodes). Prevents accidental deletion of in-use assets. |

## 7.9 Collaboration / Review

### Existing Features (Keep)
- Thread-based messaging per episode and page range
- Real-time message updates via Supabase Realtime
- Typing indicators via Supabase Presence
- Artwork upload with panel picker
- Panel status workflow (draft → submitted → in_progress → draft_received → changes_requested → approved)
- Team invitation by email with role assignment
- Reference file panel per episode
- Unread message counters
- Collaborator sidebar with online status

### Missing Features (Add)

| Feature | Priority | Rationale |
|---|---|---|
| Side-by-side script/art comparison | High | During review, show the panel's script description alongside the submitted artwork. This is the core review experience — "does the art match the script?" |
| Change request notes per panel | High | Attach specific feedback to individual panels rather than relying on thread messages. Creates a clear revision record. |
| Panel revision history | High | See all submitted versions of a panel with timestamps and submitter. Enables comparison between revisions. |
| Batch page approval | Medium | "Approve all panels on this page" action for efficient review when the whole page meets quality standards. |
| Email notifications | Medium | Optional email alerts for submissions, approvals, change requests, and messages. Reduces reliance on checking the app. |
| Notification preferences | Medium | Per-user settings for which events trigger in-app vs email notifications, and quiet hours. |
| Review assignment | Low | Explicitly assign panels or pages to a reviewer. Currently, review is implicit (whoever opens the compile view). |
| Review summary | Low | At export time, show a summary of the review cycle: how many rounds of revision, which panels had the most changes, average review turnaround time. |

## 7.10 Production Pipeline Tracker

### Features to Build

| Feature | Priority | Rationale |
|---|---|---|
| Episode progress dashboard | High | Visual grid showing all episodes with progress bars based on panel approval status. The primary "where is everything?" view. |
| Page-level status heatmap | High | For each episode, a grid of pages colored by aggregate panel status (all draft = gray, all approved = green, mixed = amber). |
| Role-based workload view | Medium | Filter the tracker by role to answer "what is waiting for the artist?" or "what does the letterer have in queue?" |
| Bottleneck identification | Medium | Highlight panels or pages that have been in a non-approved status for the longest time. Surfaces stalled work. |
| Production milestones | Medium | Define target dates for episode completion and track actual vs target. Not a project management tool, but simple milestones for personal tracking. |
| Production timeline | Low | Gantt-style view of episodes with planned vs actual completion dates. Useful for serialized publication schedules. |
| Assignment tracking | Low | Record which team member is currently responsible for each panel at its current production stage. |

## 7.11 Compile and Preview

### Existing Features (Keep)
- Assembly preview for all four formats
- Format picker (webtoon, manhwa, manga, comic)
- Lettering overlay with draggable speech bubbles
- Font picker (sans, serif, mono, comic)
- Per-panel approval/rejection workflow
- Zoom and DPI controls
- Panel grid view with status indicators
- Changes request modal with notes
- Progress tracking (approved/pending/missing panels)

### Missing Features (Add)

| Feature | Priority | Rationale |
|---|---|---|
| Mobile preview mode | High | Simulate phone viewport (375px width) to check how the assembled output looks on a mobile device. Critical for webtoon/manhwa creators. |
| Wire ExportScopeDialog as primary export UI | High | The ExportScopeDialog component already exists with format/scope/preset/DPI/history controls but is not the default export flow. Wire it in. |
| Readability overlay | Medium | Highlight dialogue text that falls below minimum readable font size at the target DPI and viewing size. |
| Multi-format comparison | Medium | Preview the same episode in two different formats side by side. Useful when deciding between webtoon and manhwa, or when creating multi-format releases. |
| Panel-level notes in preview | Medium | Show the script description as a tooltip/overlay on each panel in the preview. Helps verify art-to-script alignment without switching views. |
| Scrolling preview for vertical formats | Low | Continuous scroll preview that simulates the actual reading experience for webtoon/manhwa, rather than showing individual pages. |

## 7.12 Export / Publish Prep

### Existing Features (Keep)
- Export to PDF, PNG, WebP, ZIP
- Four export presets (webtoon-web, manhwa-web, manga-print, comic-print)
- Export scope (episode, page, panel, project)
- DPI and color profile settings
- In-memory export history (last 20)
- WebP quality slider
- Canvas rendering via html2canvas-pro
- File download via file-saver

### Missing Features (Add)

| Feature | Priority | Rationale |
|---|---|---|
| Preflight validation | High | Before export, check: all panels approved, no empty content blocks, correct dimensions, no missing artwork. Show blocking/warning/info results. |
| Long-image slicing | High | For WEBTOON uploads, automatically slice the vertical strip into segments ≤1280px tall. WEBTOON requires individual panel images, not one continuous strip. |
| Thumbnail preset generation | Medium | Auto-generate episode thumbnails at standard platform sizes (WEBTOON: 160×151 mobile, 436×436 desktop; Tapas: 300×300). |
| Platform validation profiles | Medium | Preconfigured validation rules for WEBTOON Canvas (max file size, dimensions, format), Tapas, and generic print. |
| Export readiness summary | Medium | Dashboard showing which episodes are export-ready (all panels approved, no validation warnings) and which are not. |
| Export to CBZ/CBR | Low | Comic archive format for digital readers. Package pages as a CBZ file with metadata. |
| Export batch processing | Low | Export multiple episodes in a single operation with consistent settings. Useful for batch publishing. |

## 7.13 Tutorial and Learning Center

See Section 8 for full specification.

## 7.14 Settings / Preferences / Keyboard Help

### Existing Features (Keep)
- Profile tab: name, avatar, email display, role badge
- Workspace tab: default view, remember last view, compact dashboard, platform mode, theme
- Data tab: export/import project JSON, backup/restore
- Keyboard shortcut cheat sheet

### Missing Features (Add)

| Feature | Priority | Rationale |
|---|---|---|
| Notification preferences | Medium | Choose which events trigger in-app notifications and (eventually) email notifications. |
| Export defaults | Medium | Set preferred export preset, DPI, and output format as project-level defaults. |
| Tutorial preferences | Low | Show/hide contextual tips, reset tutorial progress, choose tutorial depth (beginner/intermediate/advanced). |
| Collaboration preferences | Low | Typing indicator visibility, message notification sounds, auto-scroll to new messages. |
| Keyboard shortcut customization | Low | Allow users to remap keyboard shortcuts. Current shortcuts are hardcoded. |

---

# 8. Tutorial and Learning System

The tutorial and learning system is a core product module, not an optional add-on. Inkline should not assume that users already understand storytelling concepts, format conventions, or production workflows. The system teaches both "how to use the app" and "how the craft works."

## 8.1 Design Philosophy

**Teach by showing, not telling.** Every concept should have a visual example. If the app refers to an "impact panel," the user should be able to see what one looks like — annotated with callouts explaining what makes it effective.

**Contextual, not classroom.** Tutorials should appear where they are relevant — in the script editor when writing panels, in the compile view when reviewing layouts, in the export dialog when checking dimensions. The Tutorial Center is for self-directed exploration; contextual tips are for just-in-time learning.

**Progressive, not overwhelming.** New users should see beginner-level guidance. As they use the app more, advanced concepts surface. Users should never feel like the tutorial system is in the way.

**Format-aware.** Tutorials about pacing, layout, and readability should be specific to the user's chosen format. Webtoon pacing advice differs fundamentally from manga pacing advice.

**Role-aware.** A writer needs tutorials about dialogue density, pacing, and scene transitions. An artist needs tutorials about panel composition, visual flow, and format specifications. A letterer needs tutorials about text readability, bubble placement, and font selection.

## 8.2 Tutorial Content Categories

### Category 1: App Features
How to use Inkline's tools and workflows.

| Topic | Content | Visual Support |
|---|---|---|
| Getting started | Project creation, choosing a format, navigating the workspace | Annotated screenshots of each view |
| Script editor basics | Creating episodes, pages, panels, and content blocks | Step-by-step walkthrough with UI highlights |
| Character management | Adding characters, assigning colors, tagging dialogue | Before/after of a script with character color-coding |
| Script importing | Uploading and mapping external scripts | Side-by-side of original document and imported structure |
| Collaboration basics | Creating threads, messaging, submitting work | Simulated conversation flow |
| Artwork review | Reviewing panels, approving, requesting changes | Annotated review interface |
| Lettering overlay | Placing speech bubbles, choosing fonts, positioning text | Example panel with overlaid bubbles |
| Export workflow | Choosing presets, running preflight, exporting | Export dialog with callouts |
| Keyboard shortcuts | All available shortcuts with context | Interactive shortcut reference |

### Category 2: Panel Composition
How panels are structured and composed in sequential art.

| Topic | Content | Visual Support |
|---|---|---|
| Panel types | Establishing, action, dialogue, reaction, impact, transition | Side-by-side examples of each type with annotations |
| Panel shapes | Rectangular, borderless, inset, full-bleed, tilted | Visual examples of each shape in context |
| Panel count per page | How panel density affects pacing and readability | Comparison: 2-panel page vs 6-panel page vs 10-panel page |
| Gutters and spacing | How space between panels creates rhythm and timing | Examples of tight gutters (fast pace) vs wide gutters (slow pace) |
| Reading flow | How the eye moves through panels in LTR vs RTL layouts | Annotated flow diagrams for webtoon, manga, and comic |

### Category 3: Pacing and Storytelling

| Topic | Content | Visual Support |
|---|---|---|
| Decompression and compression | Spreading a moment across many panels vs condensing action into few | Same scene shown in 3 panels vs 8 panels |
| Impact panels | Using large, sparse panels for emotional or dramatic emphasis | Example impact panels with annotations on why they work |
| Page-turn reveals | Placing surprises on the first panel of a new page (manga/comic) | Before/after page layout showing the reveal placement |
| Vertical pacing (webtoon) | Using scroll distance and vertical spacing to control reading speed | Annotated vertical strip showing spacing techniques |
| Scene transitions | Techniques for moving between scenes (hard cut, fade, establishing shot) | Examples of each transition type |
| Cliffhanger placement | Where to end an episode for maximum reader engagement | Example episode endings with analysis |
| Silence and negative space | Using empty panels and white space for emotional effect | Examples of effective silence in sequential art |

### Category 4: Dialogue and Readability

| Topic | Content | Visual Support |
|---|---|---|
| Dialogue density | How many words per panel is comfortable to read on mobile | Side-by-side: over-dense panel vs well-paced panel |
| Bubble placement | Where to place speech bubbles relative to characters and reading flow | Annotated examples of good vs poor bubble placement |
| Font size for mobile | Minimum readable font sizes at webtoon DPI and mobile viewport | Simulated mobile view at different font sizes |
| Caption usage | When to use captions vs dialogue vs narration | Examples of each in context |
| Sound effects (SFX) | How SFX integrate with artwork and contribute to pacing | Examples of integrated SFX styles |

### Category 5: Format-Specific Conventions

| Topic | Content | Visual Support |
|---|---|---|
| Webtoon conventions | Vertical scroll, 800px width, RGB, mobile-first reading | Annotated example of a webtoon episode strip |
| Manhwa conventions | Similar to webtoon with Korean stylistic differences | Side-by-side webtoon vs manhwa comparison |
| Manga conventions | B5 page, RTL reading, grayscale, page-turn pacing | Annotated manga page with reading direction markers |
| Comic conventions | US standard page, LTR reading, CMYK for print | Annotated comic page with bleed and safe area markers |
| Format comparison | Same scene in all four formats | Side-by-side four-panel comparison |

### Category 6: Production Workflow

| Topic | Content | Visual Support |
|---|---|---|
| Production stages | Script → Thumbnail → Sketch → Ink → Color → Letter → Review → Export | Flowchart with example artwork at each stage |
| Thumbnail stage | Rough layout sketches showing panel placement and composition | Example thumbnails with annotations |
| Sketch to ink | How sketches become clean linework | Before/after comparison |
| Coloring approaches | Flat color, cel-shading, painted style, grayscale | Examples of each coloring approach |
| Lettering best practices | Speech bubble types, font selection, readability rules | Annotated lettering examples |
| Review cycles | How to give and receive effective feedback | Example change request with constructive notes |

## 8.3 Tutorial Delivery Mechanisms

### 8.3.1 Tutorial Center (Dedicated Screen)
A browseable library of all tutorial content organized by category and difficulty level.

**Structure:**
- Category cards on the landing page (Panel Composition, Pacing, Dialogue, Formats, Production, App Features)
- Each category contains ordered modules
- Each module contains steps (text + visual examples + optional interactive elements)
- Progress tracking shows completed modules and suggested next modules
- Difficulty badges: Beginner, Intermediate, Advanced
- Format tags: which formats each tutorial applies to
- Role tags: which roles benefit most from each tutorial
- Estimated reading time per module

### 8.3.2 Contextual Tips
Short, dismissible hints that appear inline in the UI based on context.

**Trigger Examples:**
- Adding a 7th panel to a page → "Webtoon pages typically have 3-5 panels for comfortable mobile reading. Learn about panel density."
- Writing a dialogue block with 100+ words → "Long dialogue blocks can be hard to read on mobile. Consider breaking this into multiple exchanges."
- First time opening the lettering overlay → "Speech bubbles should be placed near the speaking character. See lettering best practices."
- First export with all panels approved → "Great work! All panels are approved. Here's what to check before exporting."

**Behavior:**
- Each tip has a unique ID and can be dismissed permanently
- Tips can be re-enabled from Tutorial Preferences in Settings
- Tips should appear at most once per session per trigger
- Tips link to the full tutorial module for deeper learning
- Tips are stored in localStorage for both offline and online modes

### 8.3.3 Visual Example Gallery
A browseable collection of annotated visual examples.

**Each example includes:**
- An annotated image (with numbered callouts or highlighted regions)
- A title and short description
- The concept it illustrates
- Good vs bad comparison when applicable
- The format(s) it applies to
- Links to related tutorial modules

**Gallery organization:**
- By concept (panel types, pacing, dialogue, transitions, etc.)
- By format (webtoon, manhwa, manga, comic)
- By difficulty level
- Searchable by keyword

### 8.3.4 Interactive Previews
Where possible, tutorials should include interactive elements.

**Examples:**
- Drag a slider to change panel spacing and see how it affects pacing perception
- Toggle between 3-panel and 6-panel page layouts to compare density
- Click through a sequence of panels to experience pacing at reading speed
- Compare the same dialogue at different font sizes at simulated mobile viewport
- Preview the same scene in webtoon vs manga format

### 8.3.5 Glossary and Concept Library
A searchable dictionary of terms used throughout the app and in comic/webtoon production.

**Entry structure:**
- Term name
- Definition (clear, concise, jargon-free)
- Visual example (when applicable)
- Related terms
- Related tutorial modules
- Format applicability

**Example entries:**
- **Impact panel** — A large panel (often full-width or full-page) used to emphasize a dramatic moment. Impact panels use scale and negative space to make the reader pause. [Visual example] [See: Pacing and Storytelling > Impact Panels]
- **Gutter** — The space between panels. Wider gutters slow the reading pace; narrower gutters create urgency. [Visual example] [See: Panel Composition > Gutters and Spacing]
- **Decompression** — A storytelling technique where a single moment or action is spread across many panels, slowing the perceived pace and adding weight to the scene. [Visual example]

## 8.4 Role-Specific Tutorial Paths

### Writer Path
1. Getting started → Project creation and format selection
2. Script editor basics → Writing your first episode
3. Panel types → Understanding what you are asking the artist to draw
4. Dialogue density → Writing for mobile readability
5. Pacing and storytelling → Controlling reader experience through panel structure
6. Scene transitions → Moving between scenes effectively
7. Story Bible → Planning your narrative before writing
8. Character development → Creating consistent, compelling characters
9. Collaboration → Working with your artist
10. Export → Preparing your work for publishing

### Artist Path
1. Getting started → Understanding the workspace and your role
2. Collaboration → Receiving scripts and uploading artwork
3. Panel composition → Translating script descriptions into visual panels
4. Format specifications → Understanding dimensions, DPI, and color profiles
5. Reference files → Using references shared by the writer
6. Review workflow → Receiving feedback and submitting revisions

### Colorist Path
1. Getting started → Your role in the production pipeline
2. Collaboration → Receiving inked artwork and uploading colored versions
3. Color profiles → RGB vs CMYK and when each applies
4. Format-specific coloring → Webtoon (bright, saturated) vs manga (grayscale) conventions

### Letterer Path
1. Getting started → Your role in the production pipeline
2. Lettering overlay → Placing speech bubbles and text
3. Font selection → Choosing appropriate fonts for different contexts
4. Readability → Ensuring text is readable at target viewport sizes
5. SFX integration → Placing sound effects that complement the artwork

## 8.5 Tutorial Triggers and Behavior Rules

### Trigger Types

| Trigger | When | Example |
|---|---|---|
| First-use | User accesses a feature for the first time | First time opening Script Editor → offer editor walkthrough |
| Threshold | User crosses a quantitative boundary | More than 6 panels on one page → panel density tip |
| Error-adjacent | User encounters or nearly encounters a validation issue | Export with unapproved panels → explain approval workflow |
| Milestone | User completes a significant action | First episode exported → "Congratulations! Here are tips for your next episode" |
| Scheduled | Time-based or session-based | Third session → "Have you explored the Story Bible?" |

### Anti-Annoyance Rules

1. **Never show the same tip twice in a session** unless the user explicitly requests it
2. **Never interrupt the user mid-action** — tips appear in non-blocking positions (sidebar, toast area, or inline hint)
3. **Always provide a "Don't show again" option** on every tip
4. **Never require tutorial completion** to use any feature — tutorials are educational, not gatekeeping
5. **Limit to one tip per view transition** — don't stack multiple tips when the user switches views
6. **Respect "Tutorial mode: off"** — if the user disables contextual tips in settings, respect it completely
7. **Decay tip frequency over time** — show more tips in early sessions, fewer as the user gains experience
8. **Never auto-play video or audio** — all tutorial content is text and images, with user-initiated interactive elements

## 8.6 Tutorial System: Offline and Online Behavior

### Offline Mode
- All tutorial text content and structure shipped as part of the app bundle (JSON files in the build)
- Visual example images bundled as static assets (compressed for minimal bundle impact)
- Tutorial progress tracked in localStorage under `inkline:tutorial-progress`
- Glossary available offline
- Interactive previews work offline (they use app components, not external services)

### Online Mode (Supabase)
- Tutorial content is the same (bundled with the app), ensuring consistent experience
- Tutorial progress synced to Supabase `tutorial_progress` table for cross-device persistence
- Visual example images may additionally be served from Supabase storage for higher-resolution versions
- Team-level tutorial visibility: admin can see which team members have completed which tutorials

## 8.7 Tutorial Content Management

Tutorial content is authored as structured JSON files in the codebase, not as user-editable database records. This ensures:

- Tutorials are versioned alongside the app code
- Content is reviewed through the normal code review process
- Tutorials are guaranteed to work offline
- No CMS dependency or external content management

**File structure:**
```
src/tutorials/
├── modules/          # Tutorial module definitions (JSON)
├── glossary/         # Glossary entries (JSON)
├── examples/         # Visual example metadata (JSON)
└── assets/           # Visual example images (PNG/SVG, optimized)
```

Each tutorial module JSON file contains:
```
{
  "id": "panel-composition-basics",
  "title": "Panel Composition Basics",
  "category": "panel-composition",
  "difficulty": "beginner",
  "estimatedMinutes": 8,
  "formats": ["webtoon", "manhwa", "manga", "comic"],
  "roles": ["writer", "artist"],
  "steps": [
    {
      "type": "text",
      "content": "..."
    },
    {
      "type": "visual-example",
      "exampleId": "panel-types-overview",
      "caption": "..."
    },
    {
      "type": "comparison",
      "goodExample": "...",
      "badExample": "...",
      "explanation": "..."
    }
  ]
}
```

---

# 9. Information Architecture

## 9.1 Top-Level Navigation

```
Inkline App
├── Auth (Login / Signup)
├── Workspace Dashboard
│   ├── Project list
│   ├── Create project
│   ├── Admin panel (admin only)
│   └── Settings
└── Project Workspace (after selecting a project)
    ├── Nav Bar
    │   ├── Back to dashboard
    │   ├── Project title
    │   ├── Main tabs (Script Editor, Collaboration, Compile & Export)
    │   ├── Bible tabs (Story Bible, Character Bible) [Phase 2]
    │   ├── Production Tracker [Phase 2]
    │   ├── Command palette (Cmd+K)
    │   ├── Notification center
    │   └── Profile menu
    ├── Script Editor
    │   ├── Episode sidebar
    │   ├── Page/Panel hierarchy
    │   ├── Content block editor
    │   ├── Character sidebar
    │   └── Pacing hints (inline) [Phase 2]
    ├── Collaboration
    │   ├── Thread list
    │   ├── Message view
    │   ├── Artwork upload
    │   ├── Reference panel
    │   └── Review comparison [Phase 2]
    ├── Compile & Export
    │   ├── Format picker
    │   ├── Assembly preview
    │   ├── Lettering overlay
    │   ├── Panel approval grid
    │   ├── Export dialog
    │   └── Asset library drawer
    ├── Story Bible [Phase 2]
    │   ├── Arc editor
    │   ├── Location manager
    │   ├── World rules
    │   └── Timeline
    ├── Character Bible [Phase 2]
    │   ├── Character profiles
    │   ├── Design sheets
    │   ├── Relationship graph
    │   └── Arc tracking
    ├── Production Tracker [Phase 2]
    │   ├── Episode progress grid
    │   ├── Page status heatmap
    │   └── Role workload view
    └── Tutorial Center
        ├── Category browser
        ├── Module viewer
        ├── Visual example gallery
        ├── Glossary
        └── Progress tracker
```

## 9.2 Object Hierarchy

```
Workspace
└── Project / Series
    ├── Story Bible
    │   ├── Story Arc → links to Episodes and Characters
    │   ├── Location → has reference images
    │   ├── World Rule
    │   └── Timeline Event → links to Episodes
    ├── Character Bible
    │   ├── Character Profile → extends existing Character
    │   │   ├── Design Sheet → has reference images
    │   │   ├── Character Arc → links to Story Arcs
    │   │   └── Relationship → links to other Characters
    │   └── Visual Consistency Checklist
    ├── Episodes
    │   ├── Episode
    │   │   ├── Pages
    │   │   │   ├── Page
    │   │   │   │   ├── Panels
    │   │   │   │   │   ├── Panel → has Content Blocks, Asset, Status
    │   │   │   │   │   └── Content Block (dialogue / caption / sfx)
    │   │   │   │   └── Layout Note
    │   │   │   └── ...
    │   │   ├── Threads → has Messages
    │   │   └── Reference Files
    │   └── ...
    ├── Asset Library
    │   ├── Panel Assets
    │   ├── Reference Files
    │   ├── Script Imports
    │   └── Exports
    └── Team
        ├── Project Members → User with Role
        └── Invitations
```

## 9.3 Scope Mapping

| Level | What Lives Here | Who Manages It |
|---|---|---|
| **Workspace** | Project list, user profile, cross-project activity | All users (own projects) |
| **Project** | Format, team roster, story bible, character bible, asset library | Writer, Admin |
| **Episode** | Pages, threads, reference files, production status | Writer (structure), all roles (content) |
| **Page** | Panels, layout notes, pacing annotations | Writer |
| **Panel** | Content blocks, artwork, status, approval, lettering bubbles | Writer (script), Artist/Colorist (art), Letterer (bubbles) |
| **Character** | Profile, design sheets, relationships, arcs | Writer (primary), Artist (design sheets) |
| **Asset** | File data, tags, variants, usage references | Role-dependent (see file permissions) |
| **Export** | Job record, preset, scope, output file | Writer (initiate), all (access results) |
| **Tutorial** | Module content, progress, glossary | System (content), User (progress) |

---

# 10. Database / Data Model / Entities

## 10.1 Current Entities (13 Tables)

These entities exist today in the Supabase schema and should be preserved as-is unless noted.

### User
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | Matches `auth.users.id` |
| email | text | Unique |
| name | text | Display name |
| role | user_role enum | writer, artist, letterer, colorist, admin |
| avatar_url | text | Public URL to avatar image |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Relationships:** Owns many Projects. Member of many Projects via ProjectMember. Sends many Messages.
**Offline:** Mocked as a demo user with writer role.

### Project
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| title | text | Max 200 chars |
| format | project_format enum | webtoon, manhwa, manga, comic |
| owner_id | UUID (FK → users) | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Relationships:** Has many Episodes, Characters, Threads. Has many Members via ProjectMember.
**Offline:** Stored in localStorage as full JSON document.

### ProjectMember
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| project_id | UUID (FK → projects) | |
| user_id | UUID (FK → users) | |
| role | user_role enum | Role within this project |
| invited_at | timestamptz | |

**Relationships:** Joins User to Project with role.

### Episode
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| project_id | UUID (FK → projects) | |
| number | integer | Episode number |
| title | text | |
| brief | text | Max 5000 chars |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Relationships:** Has many Pages. Has many Threads. Has many Reference Files.
**Constraints:** Max 50 per project (database trigger).

### Page
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| episode_id | UUID (FK → episodes) | |
| number | integer | Page number |
| layout_note | text | |

**Relationships:** Has many Panels.
**Constraints:** Max 100 per episode (database trigger).

### Panel
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| page_id | UUID (FK → pages) | |
| number | integer | Panel number |
| shot | text | Shot type description |
| description | text | Max 5000 chars |
| order | integer | Sort order |
| status | panel_status enum | draft, submitted, in_progress, draft_received, changes_requested, approved |
| asset_url | text | URL to panel artwork |

**Relationships:** Has many ContentBlocks. Has many PanelAssets (versions).
**Constraints:** Max 20 per page (database trigger).

### ContentBlock
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| panel_id | UUID (FK → panels) | |
| type | content_type enum | dialogue, caption, sfx |
| character | text | Character name (for dialogue) |
| parenthetical | text | Acting direction |
| text | text | Max 10000 chars |
| order | integer | Sort order |

**Constraints:** Max 50 per panel (database trigger).

### Character
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| project_id | UUID (FK → projects) | |
| name | text | |
| role | text | Character's role in the story |
| description | text | |
| color | text | Hex color for script editor tagging |

**Constraints:** Max 100 per project (database trigger).

### Thread
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| project_id | UUID (FK → projects) | |
| episode_id | text | Episode reference |
| label | text | Thread title |
| page_range | text | Which pages this thread covers |
| status | thread_status enum | submitted, in_progress, draft_received, approved |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Relationships:** Has many Messages.
**Constraints:** Max 50 per project (database trigger).

### Message
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| thread_id | UUID (FK → threads) | |
| sender_id | UUID (FK → users) | |
| text | text | Max 5000 chars |
| attachment_url | text | URL to attached file |
| created_at | timestamptz | |

**Constraints:** Max 1000 per thread (database trigger).
**Realtime:** Enabled for live messaging.

### PanelAsset
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| panel_id | UUID (FK → panels) | |
| uploaded_by | UUID (FK → users) | |
| file_url | text | |
| status | text | |
| version | integer | |
| created_at | timestamptz | |

**Realtime:** Enabled for live artwork updates.

### UploadedFile
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| project_id | text | |
| category | text | panel-assets, reference-files, script-imports, project-files, avatars, exports |
| original_name | text | Sanitized filename |
| storage_path | text | Path in storage bucket |
| public_url | text | |
| mime_type | text | |
| size_bytes | integer | |
| uploaded_by | text | |
| uploaded_at | text | |
| status | text | pending, validating, processing, uploading, complete, error, offline |
| error_message | text | |
| metadata | JSONB | width, height, thumbnailUrl, pageCount, wordCount, panelId, episodeId, etc. |

**Offline:** Stored in localStorage under `inkline-file-records-{projectId}`.

### ScriptImport
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| project_id | text | |
| file_id | text | FK to UploadedFile |
| format | text | txt, md, docx, pdf |
| mode | text | structured, reference |
| raw_text | text | Extracted text content |
| mapping_result | JSONB | Episodes/pages/panels detected, unmapped lines, warnings |
| imported_at | text | |
| imported_by | text | |

## 10.2 Proposed New Entities (Phase 2 and Phase 3)

### StoryArc (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| project_id | UUID (FK → projects) | |
| title | text | Arc name |
| description | text | Arc summary |
| arc_type | text | main, subplot, character, thematic |
| status | text | planning, active, completed |
| start_episode | integer | First episode of arc |
| end_episode | integer | Last episode of arc (null if ongoing) |
| sort_order | integer | Display order |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Relationships:** Links to Characters (many-to-many via CharacterArc). Spans Episodes.
**Offline:** Stored as part of Project JSON document.

### CharacterArc (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| character_id | UUID (FK → characters) | |
| story_arc_id | UUID (FK → story_arcs) | |
| start_state | text | Character's state at the beginning of this arc |
| catalyst | text | What changes the character |
| end_state | text | Character's state at the end of this arc |
| notes | text | Additional development notes |

**Relationships:** Joins Character to StoryArc.

### CharacterProfile (Phase 2)
Extends the existing Character entity with rich metadata. Implemented as additional columns on the `characters` table or a companion `character_profiles` table.

| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| character_id | UUID (FK → characters) | One-to-one |
| appearance | text | Physical description |
| personality | text | Personality traits and quirks |
| goals | text | What the character wants |
| fears | text | What the character avoids or dreads |
| backstory | text | Relevant history |
| speech_patterns | text | How the character talks — vocabulary, formality, catchphrases |
| voice_notes | text | Notes for letterer about character's speech style |
| visual_checklist | JSONB | Array of {trait, description} for visual consistency |

### CharacterRelationship (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| project_id | UUID (FK → projects) | |
| character_a_id | UUID (FK → characters) | |
| character_b_id | UUID (FK → characters) | |
| relationship_type | text | ally, rival, mentor, protege, love_interest, family, antagonist, neutral |
| description | text | Nature of the relationship |
| evolution_notes | text | How the relationship changes over the story |

### CharacterDesignSheet (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| character_id | UUID (FK → characters) | |
| title | text | Sheet label (e.g., "Front view," "Expressions," "Costume A") |
| image_url | text | URL to uploaded reference image |
| annotations | JSONB | Array of {x, y, label, note} callouts on the image |
| sort_order | integer | Display order |
| uploaded_at | timestamptz | |

### Location (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| project_id | UUID (FK → projects) | |
| name | text | Location name |
| description | text | Description of the location |
| significance | text | Why this location matters to the story |
| first_appearance | integer | First episode number |
| reference_images | JSONB | Array of {url, caption} |
| created_at | timestamptz | |

### WorldRule (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| project_id | UUID (FK → projects) | |
| title | text | Rule name |
| description | text | What the rule is |
| category | text | magic, technology, social, physical, other |
| sort_order | integer | |

### TimelineEvent (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| project_id | UUID (FK → projects) | |
| title | text | Event name |
| description | text | What happened |
| story_date | text | In-story date/time reference |
| episode_id | UUID (FK → episodes) | Which episode features this event |
| sort_order | integer | Chronological ordering |

### ProductionTask (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| project_id | UUID (FK → projects) | |
| episode_id | UUID (FK → episodes) | |
| page_id | UUID | Optional — task may be episode-level |
| panel_id | UUID | Optional — task may be page-level |
| assignee_id | UUID (FK → users) | Who is responsible |
| stage | text | script, thumbnail, sketch, ink, color, letter, review |
| status | text | pending, in_progress, completed, blocked |
| notes | text | Task-specific notes |
| due_date | date | Optional target date |
| completed_at | timestamptz | |
| created_at | timestamptz | |

### ProductionMilestone (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| project_id | UUID (FK → projects) | |
| title | text | Milestone name (e.g., "Episode 10 release") |
| target_date | date | |
| completed_at | timestamptz | Null until achieved |
| notes | text | |

### TutorialProgress (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| module_id | text | Matches tutorial module JSON id |
| completed_steps | integer[] | Array of completed step indices |
| started_at | timestamptz | |
| completed_at | timestamptz | Null until all steps complete |

**Offline:** Stored in localStorage under `inkline:tutorial-progress`.

### DismissedTip (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| tip_id | text | Unique tip identifier |
| dismissed_at | timestamptz | |

**Offline:** Stored in localStorage under `inkline:dismissed-tips`.

### AssetTag (Phase 3)
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| file_id | UUID (FK → uploaded_files) | |
| tag | text | User-defined tag |
| created_at | timestamptz | |

### Template (Phase 3)
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| project_id | UUID (FK → projects) | |
| template_type | text | episode, page, panel_layout |
| name | text | Template label |
| description | text | What this template is for |
| content | JSONB | Structure snapshot (e.g., page count, panel counts, content type patterns) |
| created_at | timestamptz | |

### ChangeRequest (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| panel_id | UUID (FK → panels) | |
| requested_by | UUID (FK → users) | |
| notes | text | What needs to change |
| status | text | open, resolved, dismissed |
| resolved_at | timestamptz | |
| created_at | timestamptz | |

### PanelRevision (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| panel_id | UUID (FK → panels) | |
| version | integer | Sequential version number |
| asset_url | text | URL to this revision's artwork |
| uploaded_by | UUID (FK → users) | |
| change_request_id | UUID (FK → change_requests) | Which change request prompted this revision (optional) |
| notes | text | Submitter's notes about this revision |
| created_at | timestamptz | |

## 10.3 Entity Relationship Summary

```
User ──owns──> Project
User ──member──> ProjectMember ──belongs──> Project
Project ──has──> Episode ──has──> Page ──has──> Panel ──has──> ContentBlock
Project ──has──> Character
Project ──has──> Thread ──has──> Message
Project ──has──> StoryArc ──spans──> Episodes
Project ──has──> Location
Project ──has──> WorldRule
Project ──has──> TimelineEvent ──references──> Episode
Character ──extends──> CharacterProfile
Character ──has──> CharacterDesignSheet
Character ──participates──> CharacterArc ──belongs──> StoryArc
Character ──relates──> CharacterRelationship ──relates──> Character
Panel ──has──> PanelAsset (versions)
Panel ──has──> PanelRevision (history)
Panel ──has──> ChangeRequest
Project ──has──> UploadedFile
Project ──has──> ScriptImport
Project ──has──> ProductionTask ──assigned──> User
Project ──has──> ProductionMilestone
User ──tracks──> TutorialProgress
User ──dismisses──> DismissedTip
UploadedFile ──tagged──> AssetTag
Project ──has──> Template
```

---

# 11. File Pipeline / Upload / Import / Export Model

## 11.1 Current Pipeline Foundation

The existing file pipeline is comprehensive and should be preserved. It implements six validation layers executed in sequence:

1. **Role permission check** — Verifies the uploader's role is authorized for the file category
2. **File size enforcement** — Rejects files exceeding category limits (2 MB–100 MB depending on category)
3. **MIME type whitelisting** — Only allows explicitly approved MIME types per category
4. **Magic byte detection** — Reads the first bytes of the file to verify the actual file type matches the claimed MIME type (PNG, JPEG, GIF, PDF, ZIP/DOCX, WebP, SVG, JSON)
5. **SVG safety scan** — For SVG files, rejects those containing `<script>`, `on*=` event handlers, `javascript:` URIs, or `<use href>` external references
6. **Duplicate detection** — Computes SHA-256 hash of the first 64 KB and checks against a circular-eviction buffer (500 hashes per project)

Additionally, filename sanitization strips unsafe characters and trims to 200 characters.

## 11.2 Supported File Types

### Images
| Format | MIME | Use Cases | Notes |
|---|---|---|---|
| PNG | image/png | Panel artwork, references, character design sheets | Primary art format; lossless |
| JPEG | image/jpeg | Panel artwork, references, photos | Lossy; common for photos and scanned art |
| WebP | image/webp | Panel artwork, optimized web output | Modern format; good for web exports |
| GIF | image/gif | References, animated effects | Limited to 256 colors; use sparingly |
| SVG | image/svg+xml | Icons, vector references, logos | Sanitized on upload; never used for panel art |

### Documents
| Format | MIME | Use Cases | Notes |
|---|---|---|---|
| TXT | text/plain | Script import, notes | Line count extracted on import |
| Markdown | text/markdown | Script import, formatted notes | Headings extracted; HTML rendered via `marked` |
| DOCX | application/vnd...wordprocessingml | Script import | Text extracted via `mammoth`; dynamic import |
| PDF | application/pdf | Script import, reference documents | Text extracted via `pdfjs-dist`; quality graded as full/partial/failed |

### Data
| Format | MIME | Use Cases | Notes |
|---|---|---|---|
| JSON | application/json | Project export/import | Schema-versioned with migration chain |

## 11.3 Upload Purpose and Behavior by Category

### panel-assets (10 MB limit)
**Purpose:** Artwork for individual panels — the core visual content of the comic.
**Allowed Types:** PNG, JPEG, WebP, GIF, SVG
**Allowed Roles:** Artist, Colorist
**Upload Flow:** Artist uploads artwork → file validated → stored in `panel-artwork` bucket → panel status updated to `draft_received` → writer notified
**Preview:** Full preview in compile view; thumbnail in panel grid
**Processing:** None currently. Phase 2 should add automatic thumbnail generation.

### reference-files (25 MB limit)
**Purpose:** Visual and textual references shared with the team — mood boards, style guides, location photos, research documents.
**Allowed Types:** All images + TXT, MD, PDF, DOCX
**Allowed Roles:** All roles
**Upload Flow:** User uploads reference → file validated → stored in `reference-files` bucket (private, signed URLs) → visible in Reference Panel per episode
**Preview:** Image preview for images; filename and type icon for documents
**Processing:** None. Documents could support text extraction for search in a future phase.

### script-imports (5 MB limit)
**Purpose:** External scripts being imported into the Inkline structure.
**Allowed Types:** TXT, MD, PDF, DOCX
**Allowed Roles:** Writer, Admin
**Upload Flow:** Writer selects file in Script Import Wizard → file validated → text extracted by documentProcessorService → heuristic parser maps content to episodes/pages/panels → user confirms mapping → structure applied to project
**Processing:** Full text extraction with format-specific handling. PDF extraction quality is graded.

### project-files (2 MB limit)
**Purpose:** JSON project exports for backup and portability.
**Allowed Types:** JSON only
**Allowed Roles:** Writer, Admin
**Upload Flow:** User imports JSON → file validated → JSON parsed → schema version checked → migrations applied if needed → project structure loaded
**Processing:** Schema validation, version detection, and migration chain execution.

### avatars (2 MB limit)
**Purpose:** User profile images.
**Allowed Types:** PNG, JPEG, WebP
**Allowed Roles:** All roles
**Upload Flow:** User selects image in profile settings → validated → uploaded to `avatars` bucket (public) → user record updated with URL
**Processing:** None. Phase 2 could add resize/crop.

### exports (100 MB limit)
**Purpose:** Generated output files from the export pipeline.
**Allowed Types:** Any (output from export engine)
**Allowed Roles:** All roles (read); Writer (generate)
**Upload Flow:** Export engine generates output → file stored in `exports` bucket (private, signed URLs) → export job record created → user downloads via signed URL
**Processing:** Generated by assemblyEngine + html2canvas-pro + jsPDF/JSZip.

## 11.4 Storage Strategy

### Supabase Mode
- **Public buckets** (panel-artwork, avatars, project-files): Direct URL access, 3600s cache control
- **Private buckets** (reference-files, script-imports, exports): Signed URLs with 1-hour expiry
- **Path convention:** `{projectId}/{category}/{timestamp}-{sanitizedFilename}`
- **Bucket-to-category mapping:** Each file category maps to a specific bucket

### Offline Mode
- **localStorage storage** with data URLs
- **5 MB per-project limit** per bucket (browser localStorage constraint)
- **Circular eviction** of file hash buffer at 500 entries per project
- **File metadata** stored under `inkline-file-records-{projectId}`
- **No signed URLs** — data URLs are returned directly

## 11.5 Export Pipeline

### Current Export Capabilities
| Output | Engine | DPI | Color | Notes |
|---|---|---|---|---|
| PDF | jsPDF + html2canvas-pro | 72 or 300 | RGB or CMYK | Multi-page for grid formats; continuous for vertical |
| PNG (single) | html2canvas-pro | 72 or 300 | RGB | Single image with DPI scaling |
| PNG (sequence) | html2canvas-pro | 72 or 300 | RGB | One PNG per page |
| WebP | html2canvas-pro | 72 or 300 | RGB | Quality slider support |
| WebP (sequence) | html2canvas-pro | 72 or 300 | RGB | One WebP per page |
| ZIP | JSZip + html2canvas-pro | 72 or 300 | RGB | PNG sequence + JSON manifest |
| JSON | Native | N/A | N/A | Schema-versioned project backup |

### Export Presets
| Preset | DPI | Color | Output | Use Case |
|---|---|---|---|---|
| webtoon-web | 72 | RGB | ZIP | WEBTOON Canvas upload |
| manhwa-web | 72 | RGB | ZIP | Manhwa web platform upload |
| manga-print | 300 | RGB | PDF | Print-quality manga output |
| comic-print | 300 | CMYK | PDF | Print-quality comic output |

### Proposed Export Enhancements

**Long-image slicing (Phase 2):**
WEBTOON and similar platforms require individual image uploads, not continuous strips. The export pipeline should:
1. Render the full vertical strip for a webtoon/manhwa episode
2. Slice into segments of configurable height (default: 1280px, max recommended by WEBTOON)
3. Ensure slicing occurs at panel boundaries (never mid-panel)
4. Package sliced segments into a ZIP with sequential naming (001.png, 002.png, etc.)

**Thumbnail generation (Phase 2):**
Generate episode thumbnails at standard platform dimensions:
- WEBTOON mobile: 160 × 151 px
- WEBTOON desktop: 436 × 436 px
- Tapas: 300 × 300 px
- Generic square: 512 × 512 px
- Generic wide: 1200 × 630 px (for social sharing)

Thumbnails are generated from the first panel of the episode or a user-selected "cover panel."

**Preflight validation (Phase 2):**
Before initiating export, run a validation pass:
- All panels in scope have `status: approved`
- No content blocks have empty text
- Panel artwork exists for all panels in scope
- Output dimensions match the target platform
- Estimated file sizes are within platform limits
- Dialogue density is within readable limits for the target format

See Section 16 for the complete validation framework.

## 11.6 Document Import Pipeline

### Current Import Flow
1. User opens Script Import Wizard from the script editor
2. Selects a file (TXT, MD, DOCX, or PDF)
3. File is validated (MIME, size, role permissions)
4. Text is extracted by the appropriate processor:
   - TXT: raw text with line count
   - MD: text with heading extraction and HTML rendering
   - DOCX: text extraction via mammoth (with warnings for unsupported formatting)
   - PDF: page-by-page text extraction via pdfjs-dist (quality: full/partial/failed)
5. Extracted text is parsed by the heuristic script parser:
   - Detects EPISODE/EP markers
   - Detects PAGE markers
   - Detects PANEL markers
   - Identifies DIALOGUE (CHARACTER: text), CAPTION, and SFX blocks
6. User reviews the mapping result (episodes, pages, panels detected; unmapped lines; warnings)
7. User selects merge strategy: replace, append, or merge
8. Structure is applied to the project

### Import Modes
- **Structured:** Full parsing into episodes/pages/panels/content blocks
- **Reference:** Raw text attached to episode brief (first 5000 chars)

---

# 12. Workflow Design

## 12.1 Creating a New Series / Project

**Trigger:** User clicks "New Project" on the Workspace Dashboard

**Steps:**
1. User enters project title
2. User selects format (webtoon, manhwa, manga, comic) — the app should show a brief format comparison with visual previews if the user is unsure
3. Project is created with the selected format
4. User is taken to the Project Workspace with the Script Editor view open
5. If this is the user's first project, the onboarding flow triggers (4-step tour)
6. An empty Episode 1 is auto-created to reduce the "blank page" barrier
7. Tutorial Center suggests "Getting Started with [format]" module

**Offline behavior:** Project is created in localStorage. All subsequent steps work identically.

## 12.2 Setting Format Type

**Trigger:** Project creation or format change (if supported)

**Steps:**
1. User selects from four formats: webtoon (800px vertical, LTR, 72 DPI, RGB), manhwa (720px vertical, LTR, 72 DPI, RGB), manga (B5 grid, RTL, 300 DPI, grayscale), comic (US standard grid, LTR, 300 DPI, CMYK)
2. The app applies format-specific defaults: page dimensions, panel grid layout, reading direction, DPI, color profile, and export preset
3. The assembly engine uses the selected format's `FORMAT_SPECS` for all previews and exports
4. Pacing and readability guidance adjusts to the selected format's conventions

**Format change caveat:** Changing format mid-project affects assembly layout and export but not content structure. Panels, dialogue, and page hierarchy remain unchanged. The assembly engine re-renders with the new format specs.

## 12.3 Building the Story Bible

**Trigger:** Writer wants to plan the narrative before or during writing

**Steps:**
1. Writer navigates to Story Bible (Phase 2: new tab in project navigation)
2. Creates Story Arcs with titles, descriptions, and episode ranges
3. Adds Locations with descriptions and reference images
4. Defines World Rules (magic systems, technology, social structures)
5. Creates Timeline Events linked to specific episodes
6. Links Characters to Story Arcs (which characters are central to which arcs)
7. Reviews the arc overview to ensure narrative coherence

**Output:** A living reference that the writer and team can consult during writing and production. Story arcs appear in the episode editor as context for which arcs are active in the current episode.

## 12.4 Building Character Sheets and Design Sheets

**Trigger:** Writer or artist needs to develop a character's profile and visual reference

**Steps:**
1. Writer creates or selects a character in the Character Bible
2. Writer fills in extended profile: appearance, personality, goals, fears, speech patterns, backstory
3. Artist uploads design sheet images (turnarounds, expressions, costumes)
4. Artist adds annotations to design sheets (callout markers on specific visual traits)
5. Writer defines character relationships (links to other characters with relationship types)
6. Writer maps character arcs (how the character changes across story arcs)
7. Writer adds visual consistency checklist (key traits the artist must maintain)

**Output:** A comprehensive character reference that all team members can access. The letterer uses speech pattern notes; the artist uses design sheets and consistency checklists; the colorist uses color palette references.

## 12.5 Writing and Importing a Script

**Trigger:** Writer is ready to write an episode

**Writing flow:**
1. Writer selects or creates an episode
2. Adds pages to the episode (or they are auto-created from templates)
3. Adds panels to each page with shot descriptions and action descriptions
4. Adds content blocks to each panel: dialogue (with character tags), captions, and SFX
5. Reorders pages and panels as needed (drag-to-reorder in Phase 2)
6. Reviews script statistics (word count, panel count, dialogue density)

**Import flow:**
1. Writer clicks "Import Script" in the script editor toolbar
2. Script Import Wizard opens (4-step modal)
3. Step 1: Upload file (TXT, MD, DOCX, or PDF)
4. Step 2: Preview extracted text with parser results
5. Step 3: Review mapping (episodes, pages, panels detected; unmapped lines; warnings)
6. Step 4: Select merge strategy (replace, append, merge) and confirm
7. Imported structure appears in the episode sidebar

## 12.6 Mapping Script to Pages and Panels

**Trigger:** Writer has written panel descriptions and wants to plan visual layout

**Steps:**
1. Writer reviews page layout notes — each page has a layout note field for composition guidance
2. Pacing assistant (Phase 2) provides contextual feedback: "This page has 8 panels — webtoon pages typically have 3-5 for comfortable reading"
3. Writer tags panels with types: establishing, action, dialogue, reaction, impact, transition
4. For vertical formats: the pacing assistant estimates scroll distance between dramatic beats
5. For grid formats: the planner shows which panels fall on page-turn reveals

## 12.7 Planning Vertical Pacing

**Trigger:** Writer working on a webtoon or manhwa episode

**Steps:**
1. Writer opens the episode in the script editor
2. Pacing hints appear inline based on panel count, dialogue density, and panel type tags
3. Writer can open the pacing visualization (Phase 2) to see an abstract representation of the episode's rhythm
4. The system suggests spacing between scenes: "Consider adding vertical breathing room before this scene transition"
5. Impact panels are flagged for full-width treatment with extra vertical spacing
6. Writer adjusts panel order and page breaks based on pacing feedback

## 12.8 Sending Work to Artists / Colorists / Letterers

**Trigger:** Writer has completed a script section and wants to hand it off

**Steps:**
1. Writer selects pages in the script editor
2. Clicks "Submit to Artist" (Shift+Enter)
3. A collaboration thread is created for the submission with: episode reference, page range, and initial message
4. Submitted panels move to `submitted` status
5. The artist receives a notification (in-app; email in Phase 2)
6. Artist opens the Collaboration view, sees the thread
7. Artist reviews panel descriptions and reference files
8. Artist draws panels externally (Clip Studio, Procreate, etc.)
9. Artist uploads completed artwork via the collaboration view, selecting which panel each image belongs to
10. Panels move to `draft_received` status; writer is notified

**Colorist handoff:** Same flow but triggered after inks are approved. Artist or writer submits approved inks to colorist.

**Letterer handoff:** After colored (or inked, for grayscale) panels are approved, the letterer uses the lettering overlay in the compile view to place speech bubbles based on the script's dialogue blocks.

## 12.9 Uploading Assets and References

**Trigger:** Any team member needs to share visual materials

**Panel artwork upload:**
1. Artist opens Collaboration view for the relevant episode thread
2. Uses the artwork upload modal with panel picker
3. Selects the panel(s) the artwork belongs to
4. File is validated (MIME, size, magic bytes, role permissions)
5. Artwork is stored and panel status is updated

**Reference file upload:**
1. Any team member opens the Reference Panel in the collaboration view
2. Drags files into the upload zone or clicks to browse
3. Files are validated and stored in the `reference-files` bucket
4. Reference files appear in the episode's Reference Panel for all team members

## 12.10 Review and Revision Loop

**Trigger:** Artist has submitted panel artwork

**Steps:**
1. Writer/reviewer opens the Compile & Export view
2. Selects the episode and reviews the panel grid
3. For each panel:
   a. Views the submitted artwork alongside the panel description (side-by-side in Phase 2)
   b. If the panel meets quality standards: clicks "Approve" → panel status moves to `approved`
   c. If changes are needed: clicks "Request Changes" → enters change request notes → panel status moves to `changes_requested` → artist is notified
4. Artist sees the change request in the collaboration thread
5. Artist creates a revised version and re-uploads
6. Panel moves back to `draft_received`; revision history is preserved (Phase 2)
7. Writer reviews the new version
8. Loop continues until the panel is approved

**Batch approval:** When all panels on a page are acceptable, the writer can approve the entire page at once (Phase 2).

## 12.11 Approval Flow

**Panel-level approval states:**

```
draft → submitted → in_progress → draft_received → approved
                                 ↓                    ↑
                        changes_requested ─────────────┘
```

**Rules:**
- Only writers and admins can approve or request changes
- Artists and colorists can move panels from `submitted` to `in_progress` (started working)
- Approval is per-panel, not per-page or per-episode
- Batch approval applies approval to all panels on a page simultaneously
- A panel cannot be exported until it reaches `approved` status (preflight enforcement)

## 12.12 Compile and Preview

**Trigger:** Writer wants to see how the episode will look in the target format

**Steps:**
1. Writer opens Compile & Export view
2. Selects the episode
3. The assembly engine renders panels according to the project's format:
   - Webtoon/Manhwa: Vertical stack, single column, panels stacked with gutters
   - Manga: Grid layout with RTL reading order, 2 columns × 3 rows per page
   - Comic: Grid layout with LTR reading order, 2 columns × 3 rows per page
4. Writer can zoom, adjust DPI preview, and toggle lettering overlay
5. Lettering overlay shows speech bubbles generated from content blocks
6. Writer can drag bubbles to adjust position, change font, and modify text
7. Mobile preview mode (Phase 2) simulates phone viewport for readability checking
8. Writer identifies any issues and returns to the script editor or requests changes from the artist

## 12.13 Export and Publish Prep

**Trigger:** Episode is approved and ready for export

**Steps:**
1. Writer opens Export dialog (ExportScopeDialog, to be wired as primary UI)
2. Preflight validation runs (Phase 2):
   - Checks all panels approved
   - Checks no empty content blocks
   - Checks artwork exists for all panels
   - Checks dimensions and file sizes
   - Reports blocking errors, warnings, and info items
3. Writer resolves any blocking errors
4. Writer selects export preset (or customizes: format, DPI, color profile, scope)
5. Export engine generates output:
   - Renders via html2canvas-pro
   - Applies format-specific processing (grayscale for manga, CMYK for comic print)
   - Packages output (PDF, ZIP, or individual images)
6. For WEBTOON uploads: long-image slicer cuts vertical strip into ≤1280px segments (Phase 2)
7. Thumbnail is generated at platform-required dimensions (Phase 2)
8. Export job is recorded in history
9. User downloads the output

## 12.14 First 3 Episodes Launch Workflow

**Trigger:** Creator is preparing to launch a new series on a platform

**Steps:**
1. Writer completes scripts for Episodes 1-3
2. Submits all three episodes through the art pipeline
3. All panels go through review and approval
4. Writer runs preflight on all three episodes
5. Platform validation (Phase 2) checks WEBTOON/Tapas requirements for all three
6. Export each episode with the appropriate preset
7. Generate thumbnails for each episode
8. Writer uploads exported files to the target platform
9. Review summary (Phase 2) shows production metrics for the launch batch

**Why 3 episodes?** Most webtoon platforms recommend launching with 3 episodes to give readers enough content to evaluate the series. The app should support batch operations across episode sets for this workflow.

## 12.15 Ongoing Serialized Production Workflow

**Trigger:** Series is live and publishing on a regular schedule

**Steady-state cycle per episode:**
1. Writer writes new episode script (references Story Bible and Character Bible for consistency)
2. Writer submits to artist
3. Artist produces artwork (parallel: writer starts next episode's script)
4. Artwork review and revision cycle
5. Colorist pass (if applicable)
6. Letterer pass
7. Final review and approval
8. Preflight and export
9. Upload to platform
10. Start next cycle

**Production Tracker (Phase 2)** shows the status of each episode in this pipeline, highlighting which episodes are in which stage and where bottlenecks exist.

## 12.16 Tutorial-Assisted First-Time-User Workflow

**Trigger:** User creates their first project in Inkline

**Steps:**
1. User signs up (or enters offline mode)
2. Creates first project — format selection includes a brief visual comparison of the four formats
3. Onboarding flow triggers (4-step tour of main views)
4. Script Editor opens with an empty Episode 1
5. Contextual tip: "Start by creating your first page. Shift+P to add a page."
6. After creating first panel: "Add dialogue, captions, or sound effects to bring your panel to life."
7. After first content block: "Want to learn about effective panel composition? [View tutorial]"
8. Tutorial Center is highlighted in the navigation with a "New" badge
9. Suggested learning path appears based on user's role (writer, artist, etc.)
10. Subsequent sessions show progressively fewer tips as the user gains familiarity

---

# 13. UI Screens and Screen Specs

## 13.1 Auth Screens

### Login Screen
**Purpose:** Authenticate existing users.
**Primary Actions:** Email/password login, Google OAuth sign-in, navigate to signup.
**Major Components:** Email input, password input, Google sign-in button, error message area, forgot password link.
**States:** Default, loading (during auth), error (invalid credentials).
**Responsive:** Centered card layout; same on mobile and desktop.

### Signup Screen
**Purpose:** Register new users with role selection.
**Primary Actions:** Create account with email/password, select role.
**Major Components:** Email input, password input, name input, role selector (writer/artist/colorist/letterer), submit button.
**States:** Default, loading, error (validation failures, duplicate email).
**Responsive:** Centered card layout; same on mobile and desktop.
**Tutorial Surface:** Brief description of each role's responsibilities next to the role selector.

## 13.2 Workspace Home

**Purpose:** Entry point showing all user's projects and global actions.
**Primary Actions:** Create project, open project, access settings, view admin panel.
**Major Components:** Project grid/list, create project button, user profile badge, settings icon, admin panel toggle (admin only).
**States:** Default (projects exist), empty (no projects — triggers onboarding), loading (fetching projects).
**Empty State:** "Welcome to Inkline. Create your first project to get started." with prominent create button and a "Take a tour" link.
**Collaboration States:** Shows unread notification count badge.
**Responsive:** Grid layout on desktop (3-4 columns), 2 columns on tablet, single column on mobile.
**Tutorial Surface:** Onboarding flow for new users; "Getting Started" tutorial link in empty state.

## 13.3 Series Setup Wizard

**Purpose:** Guide the user through creating a new project with format selection.
**Primary Actions:** Enter title, select format, create project.
**Major Components:** Title input, format cards (webtoon/manhwa/manga/comic) with visual previews showing dimensions, reading direction, and example layout, create button.
**States:** Default, format selected (shows format details), creating (loading).
**Tutorial Surface:** Each format card includes a brief description of the format's conventions. "Not sure which format? [Compare formats]" link to tutorial.

## 13.4 Project Dashboard (within workspace)

**Purpose:** Overview of the selected project — episodes, team, progress, and navigation to all modules.
**Primary Actions:** Navigate to Script Editor, Collaboration, Compile, Story Bible, Character Bible, Production Tracker.
**Major Components:** Episode list with status indicators, team roster, production progress bars, Story Bible/Character Bible entry points, format info card.
**States:** Default, empty (no episodes), loading.
**Empty State:** "This project has no episodes yet. Start writing in the Script Editor." with navigation button.
**Responsive:** Dashboard cards stack vertically on mobile.

## 13.5 Story Bible Screen

**Purpose:** View and edit all pre-production narrative planning: arcs, locations, world rules, timeline.
**Primary Actions:** Create/edit story arcs, add locations, define world rules, place timeline events.
**Major Components:** Tab navigation (Arcs, Locations, World Rules, Timeline), content list for each tab, detail/edit panel, reference image gallery for locations.
**States:** Default, empty per tab, editing, loading.
**Empty State per tab:** "No story arcs yet. Story arcs help you plan the big picture of your narrative." with create button.
**Responsive:** List/detail split on desktop; list with drill-in on mobile.
**Tutorial Surface:** "What is a Story Bible?" help link. Contextual tips when creating first arc.

## 13.6 Character Bible Screen

**Purpose:** Deep character management with profiles, design sheets, relationships, and arc tracking.
**Primary Actions:** Create/edit character profiles, upload design sheets, define relationships, track character arcs.
**Major Components:** Character list sidebar, profile detail view, design sheet gallery, relationship graph (visual), arc timeline per character.
**States:** Default, character selected, editing, empty.
**Empty State:** "No characters yet. Characters bring your story to life." with create button.
**Responsive:** List/detail on desktop; list with drill-in on mobile.
**Tutorial Surface:** "Writing compelling characters" tutorial link. Inline help for speech patterns and visual checklists.

## 13.7 Character Design Sheet Screen

**Purpose:** Detailed view of a character's visual reference with uploaded images and annotations.
**Primary Actions:** Upload reference images, add annotation callouts, reorder sheets.
**Major Components:** Image viewer with zoom/pan, annotation layer (callout markers), sheet title and notes, upload zone.
**States:** Default (has images), empty (no images), annotating, uploading.
**Responsive:** Full-width image viewer on all sizes; annotations scale with image.

## 13.8 Episode Editor (Script Editor)

**Purpose:** Core script writing workspace.
**Primary Actions:** Create/edit episodes, pages, panels, content blocks; manage characters; submit to artist; import scripts.
**Major Components:** Episode sidebar, page/panel hierarchy, content block editor, character sidebar, toolbar (import, preview, submit, undo/redo), pacing hints (Phase 2).
**States:** Default, episode selected, editing content block, character editing, import wizard open, preview modal open.
**Empty State (no episodes):** "Create your first episode to start writing. Shift+E to add an episode."
**Collaboration States:** Shows panel submission status indicators.
**Responsive:** Sidebar becomes MobileDrawer on mobile; single-column content editing on mobile.
**Tutorial Surface:** Contextual tips for first-time actions (creating pages, panels, content blocks). Panel density hints. Dialogue density warnings.

## 13.9 Panel Planner (Phase 2)

**Purpose:** Visual page/panel layout planning with composition and pacing tools.
**Primary Actions:** View page thumbnails, annotate pacing, set panel types, plan page breaks.
**Major Components:** Page thumbnail grid, panel composition suggester, pacing annotation toolbar, scroll distance estimator (webtoon).
**States:** Default, page selected, annotating.
**Responsive:** Horizontal scroll on mobile for thumbnail grid.
**Tutorial Surface:** "Understanding panel composition" and "Pacing your story" tutorial links.

## 13.10 Collaboration View

**Purpose:** Team communication, work submission, and artwork review.
**Primary Actions:** View threads, send messages, upload artwork, browse references.
**Major Components:** Thread list sidebar, message area, message input with file upload, collaborator sidebar, reference panel.
**States:** Default, thread selected, typing, uploading, empty (no threads).
**Empty State:** "No collaboration threads yet. Submit pages from the Script Editor to start."
**Responsive:** Thread list as MobileDrawer on mobile; full-width message area.
**Tutorial Surface:** "Working with your team" tutorial link for first-time collaborators.

## 13.11 Reference Files View

**Purpose:** Browse and manage reference materials per episode.
**Primary Actions:** Upload references, browse by episode, view/download files.
**Major Components:** Episode filter, image grid, document list, upload zone.
**States:** Default, empty, uploading.
**Responsive:** Grid reduces columns on mobile.

## 13.12 Asset Library

**Purpose:** Browse all project files with filtering, tagging, and search.
**Primary Actions:** Browse by category, search by tag/name, view file details, upload new assets.
**Major Components:** Category tabs, search input, asset grid with thumbnails, file detail panel, tag editor.
**States:** Default, filtered, searching, empty, file detail view.
**Empty State:** "No assets uploaded yet. Assets appear here as your team adds artwork and references."
**Responsive:** Drawer on desktop; full-screen on mobile.

## 13.13 Review / Approval Screen

**Purpose:** Focused artwork review with script/art comparison.
**Primary Actions:** Approve panels, request changes, compare revisions.
**Major Components:** Panel artwork display, panel description sidebar (script), approve/reject buttons, change request notes input, revision history (Phase 2).
**States:** Default, reviewing panel, change request open, all approved.
**Responsive:** Stacked layout on mobile (artwork above, script below).
**Tutorial Surface:** "Giving effective feedback" tutorial link.

## 13.14 Compile Preview Screen

**Purpose:** Preview assembled output in the target format before export.
**Primary Actions:** Toggle lettering overlay, adjust zoom, switch format preview, initiate export.
**Major Components:** Assembly canvas, format picker, zoom/DPI controls, lettering overlay toggle, panel status indicators, export button.
**States:** Default, lettering overlay active, mobile preview mode (Phase 2).
**Responsive:** Full-width canvas; zoom controls in toolbar.

## 13.15 Export Dialog

**Purpose:** Configure and execute export with preflight validation.
**Primary Actions:** Select preset, customize settings, run preflight, export.
**Major Components:** Preset selector, scope selector (episode/page/panel/project), DPI input, color profile display, output format selector, preflight results panel (Phase 2), export button, export history.
**States:** Default, preset selected, preflight running, preflight results shown, exporting, export complete.
**Error State:** Preflight blocking errors shown with resolution guidance.
**Tutorial Surface:** "Understanding export presets" and "Platform requirements" tutorial links.

## 13.16 Export History

**Purpose:** View past exports with download links and job metadata.
**Primary Actions:** View export details, re-download, re-export with same settings.
**Major Components:** Export list (last 20), export detail card (scope, preset, DPI, format, timestamp, status).
**States:** Default, empty.

## 13.17 Launch Readiness Screen (Phase 2)

**Purpose:** Pre-launch checklist showing whether a batch of episodes is ready for publishing.
**Primary Actions:** View readiness per episode, run batch preflight, resolve blocking issues.
**Major Components:** Episode readiness grid, per-episode preflight summary, batch export button.
**States:** All ready, issues found, loading.
**Tutorial Surface:** "Preparing for launch" tutorial module.

## 13.18 Tutorial Center

**Purpose:** Self-directed learning hub for storytelling concepts, format conventions, and app features.
**Primary Actions:** Browse categories, view modules, track progress, search glossary.
**Major Components:** Category cards, module list, step viewer, visual example gallery, glossary search, progress tracker.
**States:** Default (browsing), module open, step viewing, search results.
**Responsive:** Card grid on desktop; single column on mobile.

## 13.19 Settings

**Purpose:** User preferences, profile management, data management, and notification/tutorial configuration.
**Primary Actions:** Edit profile, change theme, manage preferences, export/import data, configure notifications, manage tutorials.
**Major Components:** Tab navigation (Profile, Workspace, Notifications, Data, Tutorial), form controls per tab.
**States:** Default, editing, saving.
**Responsive:** Tabs become accordion sections on mobile.

---

# 14. UX Rules and Design Guidelines

## 14.1 Mobile-First Preview Philosophy

The primary reading device for webtoon and manhwa content is a smartphone. Every preview, readability check, and format validation should consider mobile viewport (375px width) as the primary target.

- **Assembly preview** defaults to a mobile-proportioned viewport for vertical formats
- **Readability warnings** are calibrated against mobile font size thresholds
- **Dialogue density** limits are based on comfortable mobile reading
- **Panel spacing** recommendations account for thumb-scroll interaction patterns
- **Export previews** show a "simulated mobile view" toggle

## 14.2 Vertical Pacing Visualization

For webtoon and manhwa formats, vertical distance IS pacing. The UI should help writers understand this:

- **Scroll distance indicators** in the script editor showing estimated pixel height per page
- **Spacing recommendations** between scenes, impacts, and transitions
- **Breathing room markers** where the reader needs visual rest
- **Pacing rhythm** represented as a dense/sparse visualization alongside the episode

## 14.3 Drag-and-Drop Expectations

Drag-and-drop interactions should be:
- **Predictable:** Drag targets are clearly indicated; drop zones highlight on hover
- **Reversible:** Every drag-to-reorder action is undoable with Cmd+Z
- **Accessible:** Keyboard alternatives exist for all drag operations (move up/move down buttons)
- **Touch-friendly:** Touch targets are at least 44px; long-press initiates drag on touch devices
- **Constrained:** Items can only be dragged within their valid scope (panels within a page, pages within an episode)

## 14.4 Annotation Patterns

When users add notes, change requests, or feedback:
- **Annotations are non-destructive** — they don't modify the underlying content
- **Annotations are attributable** — every note shows who wrote it and when
- **Annotations are resolvable** — change requests can be marked as resolved
- **Annotations are contextual** — they are attached to specific panels, pages, or elements

## 14.5 Approval Patterns

The approval workflow follows a clear visual language:
- **Draft** — Gray: no action taken
- **Submitted** — Blue: awaiting review
- **In Progress** — Amber: work underway
- **Draft Received** — Purple: artwork received, pending review
- **Changes Requested** — Red/Orange: revision needed
- **Approved** — Green: ready for export

Status colors are consistent across all views (script editor, collaboration, compile, production tracker).

## 14.6 Readability Feedback

When the system detects readability issues:
- **Info level** — Subtle hint text, easily dismissed ("This page has 6 panels — consider 3-5 for webtoon")
- **Warning level** — Amber indicator with tooltip ("Dialogue block has 120 words — may be hard to read on mobile")
- **Blocking level** — Red indicator that prevents export ("Panel artwork missing for 3 panels")

Feedback is actionable: every warning links to either the relevant content for editing or a tutorial explaining the issue.

## 14.7 Visual Warning Hierarchy

| Level | Color | Icon | Behavior | Example |
|---|---|---|---|---|
| Info | Muted text / ink-muted | Info circle | Dismissible tip, no action required | "Tip: Impact panels work best at full width" |
| Warning | Amber / ink-warning | Warning triangle | Shown in preflight, doesn't block export | "Panel 5 has high dialogue density" |
| Error | Red / ink-error | Error circle | Blocks export, must be resolved | "3 panels have no artwork uploaded" |
| Success | Green / ink-success | Checkmark | Confirmation of completed action | "All panels approved — ready for export" |

## 14.8 Empty State Behavior

Every list, grid, and collection view must have a well-designed empty state that:
1. **Explains** what will appear here once content exists
2. **Guides** the user to the action that will populate it
3. **Encourages** rather than frustrates — use friendly, creator-oriented language
4. **Connects** to relevant tutorials when the feature may be unfamiliar

See Appendix G for specific empty state copy suggestions.

## 14.9 Progressive Disclosure

Features are revealed as the user needs them:

| User Journey Stage | Visible Features | Hidden Features |
|---|---|---|
| First project | Script editor basics, character roster, basic export | Advanced export options, production tracker, batch operations |
| First collaboration | Thread creation, messaging, basic artwork upload | Batch approval, revision history, email notifications |
| Experienced use | All features visible | Tutorial tips reduced, advanced shortcuts available |

Progressive disclosure is implemented through:
- **Contextual tips** that appear on first use of a feature area
- **Collapsible sections** in complex dialogs (export options, preferences)
- **"Advanced" toggles** for power-user settings
- **Empty states** that guide users to the next natural action

## 14.10 Creator-Friendly Wording

The app uses language that respects the creative process:

| Instead of | Use |
|---|---|
| "Task," "ticket," "item" | "Panel," "page," "episode" |
| "Assign to" | "Send to artist" |
| "Complete" / "close" | "Approve" |
| "Bug," "defect" | "Change request," "revision" |
| "User" | "Creator," "writer," "artist" |
| "Content" | "Script," "dialogue," "artwork" |
| "Deploy" | "Export," "publish prep" |

## 14.11 Accessibility

- **WCAG 2.1 AA** compliance target
- **Color contrast:** All text meets 4.5:1 ratio; large text meets 3:1
- **Keyboard navigation:** All features accessible via keyboard; focus indicators visible
- **Screen reader support:** All interactive elements have `aria-label`; icon-only buttons have accessible names
- **Reduced motion:** `prefers-reduced-motion` disables `ink-fade-in`, `ink-pop-in`, and `ink-stage-enter` animations
- **Touch targets:** Minimum 44px on touch devices (detected via `pointer: coarse`)
- **Focus management:** Modal and drawer components trap focus; returning focus to trigger on close

## 14.12 Responsive Behavior

| Breakpoint | Layout Behavior |
|---|---|
| Mobile (< 640px) | Single-column layout. Sidebars become MobileDrawer (bottom sheet). Bottom tab bar for main navigation. Compact toolbars. |
| Tablet (640–1024px) | Two-column layout where applicable. Collapsible sidebars. Top tab bar. |
| Desktop (> 1024px) | Full multi-column layout. Persistent sidebars. Expanded toolbars. WorkspaceActivityRail visible. |

Detected via `useBreakpoint()` hook returning `'mobile' | 'tablet' | 'desktop'`.

## 14.13 Offline-Friendly Interaction Design

- **No spinners for local operations** — localStorage reads/writes are synchronous
- **Optimistic UI** — actions appear to succeed immediately; sync errors surface as toasts
- **Offline indicators** — subtle badge showing offline mode when Supabase is not configured
- **Graceful degradation** — collaboration features (messaging, real-time updates) are hidden in offline mode rather than showing error states
- **Data portability** — JSON export/import works in both modes, enabling transition between offline and online

---

# 15. Roles, Permissions, and Collaboration Model

## 15.1 Role Definitions

### Writer
The primary creative role. Owns the narrative, script structure, and production decisions.

**Can create:** Projects, episodes, pages, panels, content blocks, characters, story arcs, locations, world rules, timeline events, threads, templates
**Can edit:** All script content (episodes, pages, panels, content blocks), all story bible and character bible content, project settings
**Can upload:** Script imports, reference files, project files, avatars, exports
**Can approve:** Panels (approve, request changes)
**Can export:** All export operations
**Can comment:** All threads and messages
**Tutorial focus:** Storytelling, pacing, dialogue, character development, collaboration, export

### Artist
The visual production role. Creates panel artwork based on the writer's script.

**Can create:** None (content structure is writer-managed)
**Can edit:** Panel status (move from submitted → in_progress), panel artwork (upload/replace asset)
**Can upload:** Panel assets, reference files, avatars
**Can approve:** Cannot approve panels (this is the writer's responsibility)
**Can export:** Can download exports
**Can comment:** All threads and messages
**Tutorial focus:** Panel composition, format specifications, reference usage, review workflow

### Colorist
Adds color to inked artwork.

**Can create:** None
**Can edit:** Panel artwork (upload colored version, update asset)
**Can upload:** Panel assets, reference files, avatars
**Can approve:** Cannot approve panels
**Can export:** Can download exports
**Can comment:** All threads and messages
**Tutorial focus:** Color profiles, format-specific coloring, collaboration workflow

### Letterer
Places text, speech bubbles, and sound effects on approved artwork.

**Can create:** None (in terms of script structure)
**Can edit:** Lettering overlay (speech bubble placement, font selection, text positioning)
**Can upload:** Reference files, avatars
**Can approve:** Cannot approve panels
**Can export:** Can download exports
**Can comment:** All threads and messages
**Tutorial focus:** Text readability, bubble placement, font selection, SFX integration

### Admin
Elevated writer role with user and project management capabilities.

**Can create:** Everything a writer can create
**Can edit:** Everything a writer can edit, plus user roles and project membership
**Can upload:** All categories
**Can approve:** Panels (same as writer)
**Can manage:** User roles, project members, admin panel
**Tutorial focus:** Same as writer, plus team management

## 15.2 Permission Matrix

| Action | Writer | Artist | Colorist | Letterer | Admin |
|---|---|---|---|---|---|
| Create project | Yes | No | No | No | Yes |
| Edit project settings | Yes | No | No | No | Yes |
| Invite team members | Yes | No | No | No | Yes |
| Create/edit episodes | Yes | No | No | No | Yes |
| Create/edit pages | Yes | No | No | No | Yes |
| Create/edit panels | Yes | No | No | No | Yes |
| Create/edit content blocks | Yes | No | No | No | Yes |
| Create/edit characters | Yes | No | No | No | Yes |
| Edit Story Bible | Yes | Read | Read | Read | Yes |
| Edit Character Bible (text) | Yes | Read | Read | Read | Yes |
| Upload design sheets | Yes | Yes | No | No | Yes |
| Upload panel artwork | No | Yes | Yes | No | No |
| Upload reference files | Yes | Yes | Yes | Yes | Yes |
| Upload scripts | Yes | No | No | No | Yes |
| Approve/reject panels | Yes | No | No | No | Yes |
| Edit lettering overlay | Yes | No | No | Yes | Yes |
| Initiate export | Yes | No | No | No | Yes |
| Download exports | Yes | Yes | Yes | Yes | Yes |
| Send messages | Yes | Yes | Yes | Yes | Yes |
| View all content | Yes | Yes | Yes | Yes | Yes |
| Manage users | No | No | No | No | Yes |

## 15.3 Permission Enforcement

**Database level (Supabase RLS):**
- All 13 current tables have row-level security enabled
- `is_project_member(_project_id)` helper function verifies membership
- `get_member_role(_project_id)` returns the user's role for fine-grained checks
- `is_admin()` checks for admin role
- `prevent_role_change()` trigger blocks client-side role escalation
- New Phase 2 tables must follow the same RLS patterns

**Application level:**
- File upload permissions checked via `CATEGORY_ROLE_PERMISSIONS` in `src/types/files.ts`
- UI elements hidden or disabled based on role (e.g., "Submit to Artist" only visible to writers)
- Rate limiters apply equally to all roles

**Principle:** Roles should never be self-escalated from the client. The database triggers and RLS policies are the authoritative enforcement layer.

## 15.4 Collaboration Model

### Handoff Pattern
Work flows through the team in a defined sequence:

```
Writer (script) → Artist (inks) → Colorist (color) → Letterer (text) → Writer (review) → Export
```

Each handoff creates or updates a collaboration thread. The receiving role sees the work in their view and can begin their phase.

### Communication Pattern
All team communication happens through threads:
- Threads are scoped to episodes and page ranges
- Messages support text and image attachments
- Real-time updates via Supabase Realtime
- Typing indicators show who is composing a message
- Unread counts are tracked per thread

### Review Pattern
Review is always writer-initiated:
- Writer opens the review interface (compile view)
- Reviews each panel against its script description
- Approves or requests changes
- Change requests include notes attached to specific panels (Phase 2)
- Revision history tracks all versions (Phase 2)

---

# 16. Validation, Review, and Preflight Rules

## 16.1 Validation Framework

Validation operates at three levels: **field-level** (during editing), **file-level** (during upload), and **preflight-level** (before export). Each validation result is classified as info, warning, or blocking error.

## 16.2 Field-Level Validation (During Editing)

| Rule | Scope | Level | Message |
|---|---|---|---|
| Project title > 200 chars | Project | Blocking | "Project title must be 200 characters or fewer" |
| Episode brief > 5000 chars | Episode | Blocking | "Episode brief must be 5000 characters or fewer" |
| Panel description > 5000 chars | Panel | Blocking | "Panel description must be 5000 characters or fewer" |
| Content block text > 10000 chars | ContentBlock | Blocking | "Content block text must be 10000 characters or fewer" |
| Message text > 5000 chars | Message | Blocking | "Message must be 5000 characters or fewer" |
| Episodes > 50 per project | Episode | Blocking | "Maximum 50 episodes per project" |
| Pages > 100 per episode | Page | Blocking | "Maximum 100 pages per episode" |
| Panels > 20 per page | Panel | Blocking | "Maximum 20 panels per page" |
| Content blocks > 50 per panel | ContentBlock | Blocking | "Maximum 50 content blocks per panel" |
| Characters > 100 per project | Character | Blocking | "Maximum 100 characters per project" |
| Threads > 50 per project | Thread | Blocking | "Maximum 50 threads per project" |
| Messages > 1000 per thread | Message | Blocking | "Maximum 1000 messages per thread" |

## 16.3 File-Level Validation (During Upload)

| Rule | Level | Error Code | Message |
|---|---|---|---|
| File exceeds category size limit | Blocking | file_too_large | "File exceeds the {limit} MB limit for {category}" |
| MIME type not in category whitelist | Blocking | mime_type_rejected | "This file type is not allowed for {category}" |
| File extension doesn't match MIME type | Warning | extension_mismatch | "File extension doesn't match the detected file type" |
| Magic bytes don't match claimed MIME | Blocking | magic_bytes_mismatch | "File content doesn't match the expected format" |
| SVG contains unsafe elements | Blocking | svg_unsafe | "SVG contains potentially unsafe content (scripts or external references)" |
| Filename contains unsafe characters | Info | filename_unsafe | "Filename has been sanitized for safety" |
| Image dimensions exceed maximum | Warning | dimensions_too_large | "Image dimensions are very large and may cause performance issues" |
| Duplicate file detected (SHA-256) | Warning | duplicate_detected | "A file with identical content already exists in this project" |
| User role not authorized for category | Blocking | permission_denied | "Your role does not have permission to upload to {category}" |
| Upload rate limit exceeded | Blocking | rate_limited | "Too many uploads in a short time. Please wait and try again." |

## 16.4 Preflight Validation (Before Export) — Phase 2

### Blocking Errors (Must resolve before export)

| Rule | Scope | Message | Resolution |
|---|---|---|---|
| Unapproved panels in export scope | Panel | "{count} panels are not yet approved" | Approve all panels or narrow export scope |
| Missing artwork | Panel | "{count} panels have no uploaded artwork" | Upload artwork for all panels |
| Empty export scope | Export | "No panels match the selected export scope" | Adjust scope or add content |

### Warnings (Can export, but quality may be affected)

| Rule | Scope | Message | Tutorial Link |
|---|---|---|---|
| High dialogue density | Panel | "Panel {id} has {words} words — may be hard to read on mobile" | Dialogue and Readability > Dialogue Density |
| Many panels per page | Page | "Page {number} has {count} panels — {format} pages typically have {recommended}" | Panel Composition > Panel Count Per Page |
| Empty content blocks | ContentBlock | "{count} content blocks have no text" | — |
| Large image files | Panel | "Panel {id} artwork is {size} MB — may slow export" | — |
| Missing character assignment | ContentBlock | "Dialogue block without a character assignment" | — |
| Very long episode | Episode | "Episode has {count} pages — consider splitting for reader engagement" | Pacing > Episode Length |

### Info (Informational, no action needed)

| Rule | Scope | Message |
|---|---|---|
| Export will apply grayscale | Format | "Manga format will convert all panels to grayscale on export" |
| CMYK color profile active | Format | "Comic print format uses CMYK color profile" |
| Estimated output file size | Export | "Estimated output: ~{size} MB" |
| Export history count | Export | "This is export #{count} for this episode" |

## 16.5 Publishing Platform Validation (Phase 2)

### WEBTOON Canvas Requirements
| Rule | Requirement | Check |
|---|---|---|
| Image width | 800px (recommended) | Warn if different |
| Image height | ≤ 1280px per segment | Warn if un-sliced strip exceeds this |
| File format | JPEG or PNG | Warn if WebP (not accepted) |
| File size | ≤ 20 MB per image | Block if exceeded |
| Episode count | Minimum 3 for launch | Info if fewer than 3 episodes ready |

### Generic Print Requirements
| Rule | Requirement | Check |
|---|---|---|
| DPI | 300 minimum | Warn if < 300 |
| Color profile | CMYK for offset printing | Warn if RGB and comic-print preset |
| Bleed area | 3mm (8.5px at 72 DPI) | Info only — currently not enforced |

## 16.6 Tutorial Surfacing on Validation Issues

When a user encounters the same validation warning repeatedly (3+ times across sessions):
- Show a contextual tip linking to the relevant tutorial module
- Example: "You've had several dialogue density warnings. Learn about writing for mobile readability. [View tutorial]"
- This tip is dismissible and follows all anti-annoyance rules from Section 8.5

---

# 17. Technical Architecture Guidance

This section provides architecture guidance without implementation code. The application is a React 19 SPA built with Vite 8 — it is NOT a Next.js or server-rendered application. All architecture decisions should preserve this SPA model.

## 17.1 Frontend State Domains

The application state is organized into seven React context providers, each managing a distinct domain:

| Context | Domain | Persistence | Scope |
|---|---|---|---|
| AuthContext | User identity, session, profile | Supabase auth session / localStorage mock | Global |
| NotificationContext | In-app notifications | localStorage | Global |
| ToastContext | Ephemeral feedback messages | Memory (not persisted) | Global |
| PreferencesContext | Theme, view defaults, platform mode | localStorage | Global |
| WorkspaceContext | Active project, view, episode, thread | URL query params + memory | Session |
| ProjectContext | Project data operations, CRUD | Supabase / localStorage | Project |
| ProjectDocumentContext | Project document sync, undo/redo | Supabase realtime / localStorage | Project |

### Phase 2 Context Additions

| Context | Domain | Persistence | Scope |
|---|---|---|---|
| StoryBibleContext | Story arcs, locations, world rules, timeline | Supabase / localStorage | Project |
| CharacterBibleContext | Extended profiles, relationships, design sheets, arcs | Supabase / localStorage (extends existing character state in ProjectContext) | Project |
| TutorialContext | Tutorial progress, dismissed tips, active tutorials | localStorage + optional Supabase sync | Global |
| ProductionContext | Production tasks, milestones, pipeline status | Supabase / derived from panel statuses | Project |

**Design principle:** Each new context should follow the existing patterns — provider wraps the relevant scope, hook exposes read/write operations, offline fallback uses localStorage with the same key pattern (`inkline:{domain}`).

## 17.2 Domain Boundaries

```
┌─────────────────────────────────────────────────────────────────────┐
│ Presentation Layer (Views + Components)                            │
│ ScriptEditor | Collaboration | CompileExport | StoryBible |       │
│ CharacterBible | ProductionTracker | TutorialCenter | Settings    │
├─────────────────────────────────────────────────────────────────────┤
│ State Layer (React Contexts)                                       │
│ Auth | Preferences | Workspace | Project | ProjectDocument |       │
│ Notification | Toast | StoryBible | CharacterBible | Tutorial |   │
│ Production                                                         │
├─────────────────────────────────────────────────────────────────────┤
│ Service Layer                                                      │
│ projectService | exportService | fileValidationService |           │
│ fileStorageService | fileMetadataService | scriptImportService |    │
│ documentProcessorService | avatarService | referenceFileService |   │
│ storyBibleService | characterBibleService | productionService |    │
│ tutorialService                                                    │
├─────────────────────────────────────────────────────────────────────┤
│ Domain Layer                                                       │
│ types/index.ts | types/files.ts | domain/selectors.ts |           │
│ domain/validation.ts | domain/migrations.ts | domain/platform.ts | │
│ lib/assemblyEngine.ts                                              │
├─────────────────────────────────────────────────────────────────────┤
│ Infrastructure Layer                                               │
│ Supabase Client | localStorage adapter | StorageAdapter |          │
│ Rate limiters | Schema migrations                                  │
└─────────────────────────────────────────────────────────────────────┘
```

## 17.3 Services

### Existing Services (Preserve)
1. **projectService** — All Supabase CRUD for projects, episodes, pages, panels, content blocks, characters, threads, messages, panel assets, members. Rate limiters built in.
2. **fileValidationService** — Pure validation functions. No side effects.
3. **fileStorageService** — StorageAdapter factory for Supabase/offline dual-mode storage.
4. **fileMetadataService** — CRUD for uploaded_files records with offline fallback.
5. **documentProcessorService** — TXT/MD/DOCX/PDF text extraction. Dynamic imports.
6. **scriptImportService** — Heuristic parser + import pipeline + merge strategies.
7. **exportService** — PDF/PNG/WebP/ZIP generation with presets and scope control.
8. **avatarService** — Avatar upload with user record update.
9. **referenceFileService** — Reference file CRUD scoped to episodes.

### Proposed New Services (Phase 2)
10. **storyBibleService** — CRUD for story arcs, locations, world rules, timeline events. Supabase + offline.
11. **characterBibleService** — CRUD for extended profiles, relationships, design sheets, character arcs. Extends existing character operations in projectService.
12. **productionService** — CRUD for production tasks and milestones. Derived queries for pipeline status aggregation.
13. **tutorialService** — Tutorial progress tracking (read/write to localStorage or Supabase). Tutorial content loading from bundled JSON.
14. **preflightService** — Export preflight validation engine. Pure functions that analyze project state and return validation results.
15. **notificationService** — (Phase 2) Email notification dispatch via Resend/SendGrid. Triggered by panel status changes, messages, and approvals.

## 17.4 Background Processing

The current app performs all processing synchronously in the browser. For Phase 2 and beyond:

**Export rendering** — html2canvas-pro rendering of large episodes can be slow. Consider:
- Web Worker for image processing (canvas operations off the main thread)
- Progress indicators during export (currently no progress feedback)
- Cancelable export operations

**Image processing** — Thumbnail generation and long-image slicing:
- Can be done in-browser using canvas APIs
- Should run in a Web Worker to avoid blocking UI
- Alternatively, could use Supabase Edge Functions for server-side processing (only if the personal tool needs it)

**Document parsing** — Already uses dynamic imports for heavy libraries (mammoth, pdfjs-dist). No changes needed.

## 17.5 Offline / Local Persistence

### Current Offline Model
- **Project document:** Full project JSON stored in localStorage under `inkline-project-document`
- **File records:** Per-project metadata under `inkline-file-records-{projectId}`
- **File data:** Data URLs under `inkline-files-{bucket}` (5 MB per bucket limit)
- **File hashes:** SHA-256 buffer under `inkline-file-hashes-{projectId}` (500 max, circular eviction)
- **Preferences:** Under `inkline:preferences`
- **Notifications:** Under `inkline:notifications`
- **Onboarding:** Under `inkline:onboarding-complete`

### Phase 2 Offline Additions
- **Tutorial progress:** Under `inkline:tutorial-progress`
- **Dismissed tips:** Under `inkline:dismissed-tips`
- **Story Bible data:** Embedded within the project document JSON (same as episodes and characters)
- **Character Bible data:** Extended fields on existing character entries in project JSON

### localStorage Budget
Browser localStorage is typically limited to 5–10 MB. Current usage:
- Project document: ~50 KB–500 KB depending on project size
- File data: up to 5 MB per bucket category
- Metadata: ~10 KB
- Preferences/notifications: ~5 KB

For large projects, file data (images stored as data URLs) is the primary storage pressure. The app should:
- Warn users when localStorage usage exceeds 80% of the estimated limit
- Offer JSON export as a backup before hitting limits
- Never store full-resolution images in localStorage in offline mode — recommend limiting offline file storage to essential references only

## 17.6 Supabase Tables and Storage Considerations

### Current Table Strategy
- 13 tables with foreign key relationships and cascading deletes
- RLS on all tables with helper functions for membership and role checks
- 9 database triggers for resource limits and data integrity
- 3 tables enabled for Supabase Realtime (messages, threads, panel_assets)
- 2 RPC functions (find_user_by_email, is_project_member)

### Phase 2 Table Strategy
- Add ~10 new tables (see Section 10.2)
- All new tables must have RLS enabled following existing patterns
- New tables that change frequently (production_tasks, change_requests) should be evaluated for Realtime enablement
- Indexes on foreign key columns for efficient nested queries
- Resource limit triggers for new tables (e.g., max story arcs per project, max relationships per character)

### Storage Bucket Strategy
- Existing 6 buckets are well-organized
- Phase 2 adds `tutorial-assets` bucket (public, read-only) for tutorial visual examples
- Phase 2 adds `character-designs` bucket (private) for character design sheet images
- See Appendix B for complete bucket structure

## 17.7 Sync Patterns

### Current Sync Model
- **Write:** Client calls Supabase via service layer; optimistic UI with error rollback via toast
- **Read:** Initial project fetch via nested select queries; subsequent updates via Realtime subscriptions
- **Conflict resolution:** Last-write-wins (acceptable for a small team)
- **Offline → Online transition:** Not currently handled (user must be online or offline for the session)

### Phase 2 Sync Considerations
- **Tutorial progress sync:** When user goes online, merge localStorage tutorial progress with Supabase
- **Story Bible sync:** Same as project document — full JSON stored server-side, last-write-wins
- **Production tasks:** Real-time subscriptions for task status changes

## 17.8 Export Pipeline Architecture

```
Export Request
    │
    ├── Preflight Validation (Phase 2)
    │   ├── Panel approval check
    │   ├── Content completeness check
    │   ├── Dimension/format validation
    │   └── Platform-specific checks
    │
    ├── Assembly Engine (assemblyEngine.ts)
    │   ├── FORMAT_SPECS lookup (webtoon/manhwa/manga/comic)
    │   ├── Panel layout calculation
    │   └── Page composition
    │
    ├── Rendering (html2canvas-pro)
    │   ├── DOM-to-canvas conversion
    │   ├── DPI scaling
    │   └── Color profile application (grayscale for manga)
    │
    ├── Post-Processing (Phase 2)
    │   ├── Long-image slicing (vertical formats)
    │   ├── Thumbnail generation
    │   └── Image optimization
    │
    ├── Packaging
    │   ├── jsPDF (PDF output)
    │   ├── JSZip (ZIP output)
    │   └── Raw blob (PNG/WebP output)
    │
    └── Delivery (file-saver)
        └── Browser download trigger
```

## 17.9 Image Processing and Slicing

### Long-Image Slicing (Phase 2)
For webtoon/manhwa formats, episodes render as continuous vertical strips. Platforms require individual images:

1. Render full vertical strip as a canvas
2. Identify panel boundaries (from assemblyEngine layout data)
3. Find optimal slice points at panel boundaries, targeting ≤1280px segments
4. Slice canvas into segments using `drawImage` with source coordinates
5. Export each segment as PNG or JPEG
6. Package into ZIP with sequential naming

### Thumbnail Generation (Phase 2)
1. Identify cover panel (first panel, or user-selected)
2. Render panel to canvas at original resolution
3. Crop/resize to target dimensions with center-crop or cover behavior
4. Export as JPEG at 85% quality

## 17.10 Security Considerations

**Current security measures (preserve):**
- Supabase RLS on all tables
- Role-locked at signup via database trigger
- Magic byte verification prevents MIME spoofing
- SVG sanitization blocks script injection
- Filename sanitization prevents path traversal
- Client-side rate limiting on writes, messages, invites, uploads
- `prevent_role_change()` trigger blocks client-side role escalation

**Phase 2 security additions:**
- Validate all new input fields (story arc descriptions, location names, etc.) with the same length constraints
- Apply RLS to all new tables following existing patterns
- Sanitize annotation content in character design sheets (prevent XSS in JSONB fields)
- Rate limit new operations (story bible edits, character profile updates)

**Acceptable risks for a personal tool:**
- Client-side-only rate limiting (server-side would require Edge Functions; overkill for a team of 2-6)
- No CAPTCHA or bot protection (internal tool, not public-facing)
- No audit logging beyond what Supabase provides natively

## 17.11 Scaling Considerations for Larger Projects

**Current limits and their impact:**

| Constraint | Limit | Impact at Limit |
|---|---|---|
| Episodes per project | 50 | ~500 pages, ~5000 panels — a long-running series |
| Pages per episode | 100 | Very long episode; unusual but possible for manga chapters |
| Panels per page | 20 | More than any standard layout; effectively unlimited |
| Content blocks per panel | 50 | Extremely dialogue-heavy panel; effectively unlimited |
| Characters per project | 100 | Large cast; sufficient for most series |

**Performance optimizations needed:**
- **Virtualized rendering** for episodes with 100+ panels (integrate @tanstack/react-virtual, already a dependency)
- **Lazy loading** of episode content (currently all episodes load on project fetch)
- **Pagination** of collaboration threads and messages for long-running projects
- **Indexed search** for asset library as asset count grows

## 17.12 Tutorial System Integration Without Bloat

The tutorial system must not increase the app's initial bundle size meaningfully:

**Content strategy:**
- Tutorial module JSON files: bundled statically, loaded lazily on demand (~100 KB total for all modules)
- Visual example images: stored in `public/tutorials/` directory, loaded lazily on scroll (not imported into JS bundle)
- Interactive components: implemented as React components lazy-loaded when a tutorial with interactive content is opened
- Glossary: single JSON file (~20 KB), loaded on first access

**Bundle impact estimate:**
- Tutorial JSON modules: ~100 KB (gzipped: ~20 KB)
- Tutorial images: ~2-5 MB total (loaded individually on demand, never in the bundle)
- Tutorial UI components: ~30 KB (gzipped: ~8 KB)
- Total bundle increase: ~28 KB gzipped — negligible

---

# 18. Non-Functional Requirements

## 18.1 Performance

| Metric | Target | Notes |
|---|---|---|
| Initial page load (FCP) | < 2s on 4G | Vite chunking + lazy loading of heavy views |
| View switch (editor → collab → compile) | < 300ms | Lazy-loaded with Suspense; skeleton fallback |
| Script editing (keystroke response) | < 50ms | Direct state updates; no debounce on typing |
| Panel list rendering (100 panels) | < 500ms | Requires virtualization (Phase 2) |
| Export rendering (single episode, 20 panels) | < 10s | html2canvas-pro + jsPDF/JSZip |
| Search (command palette) | < 100ms | In-memory search of max 24 results |
| File upload (10 MB panel artwork) | < 5s on broadband | Supabase storage upload |

## 18.2 Large Project Handling

| Scenario | Expected Behavior |
|---|---|
| 50 episodes, 500 pages, 5000 panels | App remains responsive with virtualized rendering; episode sidebar loads instantly; panel editing within an episode is fluid |
| 100+ panels in a single episode | Virtualized list renders only visible panels; scroll performance matches shorter episodes |
| 500+ uploaded files in asset library | Paginated or virtualized asset grid; search returns results in < 200ms |
| Long collaboration history (1000 messages) | Paginated message loading; most recent messages load first |

## 18.3 Reliability

| Requirement | Implementation |
|---|---|
| Data durability | Supabase PostgreSQL with standard durability guarantees; JSON export for user-side backups |
| Offline resilience | Full script editing and preview capability without network; localStorage persistence |
| Error recovery | Toast notifications for all async errors; retry-able operations (re-upload, re-export) |
| Undo/redo | All script editing operations are undoable; unlimited history within a session |
| Export reliability | Export errors show clear messages; user can retry with the same settings |

## 18.4 Offline Behavior

| Feature | Offline Support |
|---|---|
| Script editing | Full support |
| Character management | Full support |
| Story Bible / Character Bible | Full support (Phase 2) |
| Assembly preview | Full support |
| Lettering overlay | Full support |
| Export (PDF, PNG, WebP, ZIP) | Full support |
| Collaboration (messaging) | Not available |
| Real-time sync | Not available |
| File upload to Supabase storage | Not available (files stored as data URLs locally) |
| Tutorial content | Full support (bundled with app) |
| Tutorial progress | Tracked locally; syncs when online |

## 18.5 Sync Resilience

| Scenario | Behavior |
|---|---|
| Network drop during editing | Changes saved locally; re-synced when connection restores |
| Network drop during upload | Upload fails with clear error; user can retry |
| Network drop during export | Export continues (rendering is local); output saved locally |
| Concurrent editing (two users) | Last-write-wins; no conflict resolution UI (acceptable for small team) |

## 18.6 File Processing Expectations

| Operation | Expected Time | Notes |
|---|---|---|
| TXT import (1 MB) | < 1s | Synchronous text parsing |
| Markdown import (500 KB) | < 2s | Dynamic import of `marked` library on first use |
| DOCX import (2 MB) | < 5s | Dynamic import of `mammoth` library on first use |
| PDF import (5 MB) | < 10s | Dynamic import of `pdfjs-dist`; depends on page count |
| Image upload validation | < 500ms | MIME + magic bytes + hash check |
| SVG sanitization | < 200ms | DOM parsing and element inspection |

## 18.7 Security

| Requirement | Implementation |
|---|---|
| Authentication | Supabase Auth (email/password + Google OAuth) |
| Authorization | Row-level security on all tables; role-based permissions |
| Role integrity | Database trigger prevents client-side role escalation |
| File safety | MIME whitelisting, magic byte verification, SVG sanitization, filename sanitization |
| Rate limiting | Client-side sliding window limiters (writes: 30/10s, messages: 20/60s, invites: 10/60s, uploads: 10/60s) |
| Data privacy | Project data only accessible to project members; private storage buckets use signed URLs |
| XSS prevention | React's default JSX escaping; SVG sanitization for uploaded SVGs |

## 18.8 Privacy

- All project data is scoped to project members via RLS
- Private storage buckets (reference-files, script-imports, exports) use signed URLs with 1-hour expiry
- No analytics or tracking sent to third parties (internal tool)
- No PII stored beyond email, name, and avatar
- User data is deletable (project export → account deletion)

## 18.9 Accessibility

| Standard | Target |
|---|---|
| WCAG conformance | Level AA (2.1) |
| Color contrast | 4.5:1 for normal text; 3:1 for large text |
| Keyboard navigation | All features accessible via keyboard |
| Screen reader | All interactive elements have aria-labels; icon-only buttons have accessible names |
| Motion sensitivity | `prefers-reduced-motion` disables animations |
| Touch targets | Minimum 44px on touch devices |
| Focus management | Modals and drawers trap focus; focus returns to trigger on close |

## 18.10 Maintainability

| Requirement | Implementation |
|---|---|
| Type safety | Full TypeScript with strict mode |
| Code organization | Feature-based directory structure; clear separation of views, components, contexts, services, domain |
| Component conventions | React.memo on frequently re-rendered components; CSS classes use ink-* design tokens |
| Schema versioning | JSON export embeds __schemaVersion; migration chain handles upgrades |
| Dependency management | Dynamic imports for heavy libraries (mammoth, pdfjs-dist, jsPDF, JSZip, html2canvas-pro) |
| Build tooling | Vite 8 with React plugin; ESLint for code quality; TypeScript for type checking |

---

# 19. MVP vs Phase 2 vs Phase 3

## 19.1 MVP (Current State — Complete)

The current application constitutes a functional MVP. All of the following are implemented and working:

**Script Editing:** Episodes → Pages → Panels → Content Blocks with dialogue/caption/SFX types, character color-coding, undo/redo, script import wizard (TXT/MD/DOCX/PDF), and script preview.

**Collaboration:** Thread-based messaging with real-time updates, typing indicators, artwork upload with panel picker, panel status workflow (6 states), team invitation by email, and reference file panel.

**Compile & Export:** Assembly preview for all 4 formats, lettering overlay with draggable bubbles, per-panel approval, export to PDF/PNG/WebP/ZIP with 4 presets, scope controls, and export history.

**File Pipeline:** MIME validation, magic bytes, SVG sanitization, filename sanitization, duplicate detection, role-based permissions, and StorageAdapter dual-mode.

**Auth & Settings:** Google OAuth + email/password, role-locked at signup, profile settings, theme, workspace preferences, keyboard shortcuts.

**Infrastructure:** 13 Supabase tables with RLS, schema versioning, rate limiting, responsive design, command palette, notification center, onboarding flow.

## 19.2 Phase 2: Enrichment and Pre-Production (Next)

Phase 2 focuses on three pillars: pre-production planning, production visibility, and learning/teaching. These additions have the highest creative and workflow value.

### Priority 1 — Pre-Production Bible

| Feature | Effort | Impact |
|---|---|---|
| Story Bible module (arcs, locations, world rules, timeline) | High | Enables structured narrative planning before writing; highest creative value addition |
| Character Bible extension (profiles, speech patterns, relationships, design sheets) | High | Gives artists and letterers the character references they need; reduces miscommunication |
| Character relationship graph | Medium | Visual understanding of character dynamics; aids story consistency |
| Character arc tracking | Medium | Ensures intentional character development across story arcs |

### Priority 2 — Tutorial and Learning Foundations

| Feature | Effort | Impact |
|---|---|---|
| Tutorial Center screen with category browsing | Medium | Central hub for self-directed learning |
| Initial tutorial modules (10-15 core modules covering basics) | High (content creation) | Covers app features + essential storytelling concepts |
| Contextual tips system with dismissal tracking | Medium | Just-in-time learning without leaving the workflow |
| Glossary and concept library | Medium | Quick reference for all terminology |
| Visual example gallery (initial 20-30 examples) | High (asset creation) | Makes abstract concepts concrete through visuals |

### Priority 3 — Script Editor Improvements

| Feature | Effort | Impact |
|---|---|---|
| ~~Drag-to-reorder panels~~ | ~~Medium~~ | ~~DONE — @dnd-kit integrated~~ |
| ~~Drag-to-reorder pages~~ | ~~Medium~~ | ~~DONE — @dnd-kit integrated~~ |
| ~~Virtualized panel rendering~~ | ~~Medium~~ | ~~DONE — @tanstack/react-virtual~~ |
| ~~Script statistics panel~~ | ~~Low~~ | ~~DONE — word count, dialogue density, captions~~ |
| ~~Panel type tagging~~ | ~~Low~~ | ~~DONE — 5 types with color-coded badges~~ |
| ~~Character profile popover~~ | ~~Low~~ | ~~DONE — hover on character name in dialogue blocks~~ |

### Priority 4 — Review and Collaboration Improvements

| Feature | Effort | Impact |
|---|---|---|
| ~~Side-by-side script/art comparison~~ | ~~Medium~~ | ~~DONE — SideBySideModal in PanelGrid.tsx~~ |
| ~~Change request notes per panel~~ | ~~Medium~~ | ~~DONE — Structured ChangeRequest objects with open/resolved lifecycle~~ |
| ~~Panel revision history~~ | ~~Medium~~ | ~~DONE — RevisionHistory modal with version tracking~~ |
| ~~Batch page approval~~ | ~~Low~~ | ~~DONE — bulkApprovePage in CompileExport~~ |
| Email notifications (via Resend/SendGrid) | Medium | Reduces reliance on checking the app |

### Priority 5 — Export and Validation

| Feature | Effort | Impact |
|---|---|---|
| Wire ExportScopeDialog as primary export UI | Low | Better export experience using existing component |
| Preflight validation engine | Medium | Catches issues before export |
| Long-image slicing for WEBTOON uploads | Medium | Necessary for WEBTOON Canvas publishing |
| Thumbnail preset generation | Low | Automates a manual step in publishing prep |

### Priority 6 — Production Tracker

| Feature | Effort | Impact |
|---|---|---|
| Episode progress dashboard | Medium | Visual pipeline overview |
| Page-level status heatmap | Low | Quick identification of problem areas |
| Role-based workload view | Low | Answer "what's waiting for me?" per role |
| Production milestones | Low | Simple deadline tracking |

## 19.3 Phase 3: Performance, Optimization & Polish (COMPLETE)

Phase 3 hardened performance, Supabase sync, mobile UX, and build configuration before Vercel deployment.

**Completed:**
- Context split (ProjectDocumentContext → State + Actions) and React.memo rollout on 48 components
- Supabase query optimization (field-limiting, pagination, realtime panel assets, session refresh)
- Mobile UX polish (safe-area-inset, image lazy loading, animation fixes)
- Build config (terser minification, vercel.json, PWA manifest, meta tags)
- 3 new DB indexes for query performance

## 19.4 Phase 4: Advanced Workflows and Templates (Later)

Phase 4 adds depth and sophistication to the systems built in Phase 2.

### Tutorial Content Expansion
- Full 50+ module tutorial library covering all content categories from Section 8.2
- Interactive tutorial components (sliders, toggles, comparison tools)
- Role-specific learning paths with progress-based unlocking
- Visual example library expansion to 100+ annotated examples
- Mini demo projects for hands-on learning

### Template and Reuse Systems
- Episode templates (save and reuse page/panel structures)
- Page layout templates (common panel compositions)
- Asset tagging and cross-episode linking
- Reusable character expression sets
- Style guide enforcement (color palettes, font choices per project)

### Advanced Export
- CBZ/CBR export for digital comic readers
- EPUB export for text-heavy comics
- Batch export across multiple episodes
- Platform-specific validation profiles (WEBTOON Canvas, Tapas, print specs)
- Export comparison (preview same content in multiple output formats)

### Production Pipeline Enhancement
- Production timeline (Gantt-style view)
- Assignment tracking per panel/page
- Bottleneck identification and alerts
- Production velocity metrics (panels approved per week)

### Pacing and Analysis Tools
- Full pacing rhythm visualization
- Cross-episode consistency analysis
- Dialogue density heatmaps
- Mobile readability scoring

### Exploratory AI Features
See Appendix H for detailed AI feature recommendations.

---

# 20. Risks, Tradeoffs, and Open Questions

## 20.1 Product Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Tutorial content creation is labor-intensive | High | Medium | Start with 10-15 core modules in Phase 2; expand in Phase 3. Use clear, annotated screenshots rather than custom illustrations. |
| Story Bible adds complexity without proportional usage | Medium | Low | Design Story Bible as optional — it should enrich the workflow, not be required. Writers who prefer lightweight planning can skip it. |
| Feature scope creep in Phase 2 | High | High | Strict prioritization by the pillars (Bible, Tutorial, Editor fixes). Ship each pillar independently rather than waiting for all. |
| App becomes intimidating for new users | Medium | High | Progressive disclosure; Tutorial Center as the antidote; onboarding that focuses on the happy path. |

## 20.2 UX Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Tutorial system becomes annoying or patronizing | Medium | High | Strict anti-annoyance rules (Section 8.5); always dismissible; decay frequency over time. |
| Too many navigation tabs overwhelm the interface | Medium | Medium | Consider grouping Bible and Tracker under a "Plan" meta-tab. Keep the primary tabs to 3-4. |
| Drag-to-reorder feels unreliable on touch devices | Medium | Medium | Ensure touch targets are large enough; provide keyboard alternatives; test thoroughly on iPad. |
| Side-by-side review doesn't fit on mobile | Low | Medium | Stack vertically on mobile (art above, script below); ensure scrolling works for both. |

## 20.3 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| localStorage limits hit for large offline projects | Medium | High | Warn users proactively; recommend JSON export as backup; limit offline file storage to essentials. |
| html2canvas-pro rendering inconsistencies | Low | Medium | Already working in production; test with new content types (annotations, design sheets). |
| Supabase Realtime connection drops | Low | Medium | Already handled with reconnection; ensure new Realtime-enabled tables follow same pattern. |
| Schema migration complexity as data model grows | Medium | Medium | Maintain disciplined migration chain; test migrations with production-sized data. |
| Bundle size growth from tutorial content | Low | Low | Tutorial JSON is tiny; images loaded on demand; interactive components lazy-loaded. |

## 20.4 Scope Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Phase 2 is too large to complete as a single release | High | Medium | Ship in sub-phases: 2a (Story Bible + Character Bible), 2b (Tutorial foundations), 2c (Editor fixes + export improvements), 2d (Production Tracker). |
| Visual example creation becomes a bottleneck | High | Medium | Start with annotated screenshots of existing comics (public domain or self-created). Quality matters more than quantity. |
| Character relationship graph is hard to build well | Medium | Low | Start with a simple list view of relationships; visual graph is Phase 3. |

## 20.5 Tutorial Complexity Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Tutorials become outdated as the UI changes | Medium | Medium | Tutorial content references feature names, not specific UI coordinates. Update tutorials as part of the feature change PR. |
| Interactive previews are hard to build and maintain | Medium | Low | Start with static visual examples; add interactive elements only for the highest-value concepts (panel density, font size preview). |
| Users skip tutorials entirely | Medium | Low | Contextual tips bring learning to the user; Tutorial Center is for motivated self-study. Both paths should work. |

## 20.6 Offline vs Online Tradeoffs

| Tradeoff | Decision | Rationale |
|---|---|---|
| Collaboration in offline mode | Not supported | Collaboration requires Supabase Realtime; offline mode is for solo writing. This is an acceptable limitation. |
| File storage in offline mode | Limited (5 MB per bucket) | localStorage constraints are inherent. Users can export to JSON and work with larger files in online mode. |
| Tutorial progress offline → online sync | Merge on reconnection | Use timestamps to merge; newer progress wins. Simple and reliable. |
| Story Bible offline | Fully supported | Story Bible data lives in the project JSON document, same as episodes and characters. |

## 20.7 Open Questions

| Question | Options | Recommendation |
|---|---|---|
| Should Story Bible/Character Bible be separate nav tabs or grouped under a "Plan" tab? | A) Separate tabs (more discoverable) B) Grouped under "Plan" (less tab clutter) | B) Group under "Plan" tab with sub-navigation. Reduces top-level complexity. |
| Should Production Tracker be a separate view or a dashboard widget? | A) Separate view (more space for detail) B) Widget on project dashboard (less navigation) | A) Separate view, with a summary widget on the project dashboard. |
| Should tutorials be versioned separately from the app? | A) Bundled with app (simpler, offline-ready) B) Fetched from CMS (easier to update) | A) Bundled with app. Simplicity and offline support outweigh the marginal update convenience. |
| Should character design sheets support annotation with drawing tools? | A) Drawing annotations (richer) B) Marker/callout annotations (simpler) | B) Marker/callout annotations. Drawing tools add too much complexity for the value provided. |
| How should the app handle format changes mid-project? | A) Allow freely B) Warn but allow C) Lock after first export | B) Warn but allow. The content structure doesn't change, only the rendering. |
| Should change requests be a separate entity or part of the message system? | A) Separate ChangeRequest entity B) Special message type C) Both | A) Separate entity with optional thread message notification. Change requests need clear lifecycle (open → resolved) that messages don't provide. |

---

# 21. Success Metrics

Since Inkline is a personal internal team tool, success is measured by workflow effectiveness and creative productivity, not by SaaS growth metrics.

## 21.1 Workflow Completion Metrics

| Metric | What It Measures | Target |
|---|---|---|
| Episodes completed per month | Creative output velocity | Baseline + 20% improvement after Phase 2 |
| Script-to-approved-artwork turnaround per episode | Pipeline efficiency | Track and reduce over time |
| Export success rate (exports without preflight errors) | Export quality | > 90% of exports succeed on first attempt |
| Average revision cycles per panel | Review efficiency | < 2 rounds average |

## 21.2 Friction Reduction Metrics

| Metric | What It Measures | Target |
|---|---|---|
| Time from panel submission to first review | Review responsiveness | < 24 hours |
| Number of context switches to external tools | Workflow completeness | Decreasing trend — fewer switches means more work stays in Inkline |
| Panel status stuck in non-approved state > 7 days | Bottleneck identification | < 5% of panels |

## 21.3 Collaboration Metrics

| Metric | What It Measures | Target |
|---|---|---|
| Messages per thread (before resolution) | Communication efficiency | Decreasing trend — fewer messages needed to align means clearer scripts and feedback |
| Change request resolution time | Feedback loop speed | Improving trend |
| Team member adoption (roles actively using the app) | Tool adoption | All team roles actively using their relevant features |

## 21.4 Asset Reuse Metrics

| Metric | What It Measures | Target |
|---|---|---|
| Assets tagged (percentage) | Library organization | > 70% of assets tagged |
| Assets used across multiple episodes | Reuse efficiency | Increasing trend |
| Duplicate uploads detected and prevented | File management | Maintained by existing duplicate detection |

## 21.5 Consistency and Quality Metrics

| Metric | What It Measures | Target |
|---|---|---|
| Preflight warnings per export | Output quality | Decreasing trend |
| Readability warnings per episode | Dialogue quality | < 5 warnings per episode |
| Character visual consistency check completion | Visual quality | All major characters have design sheets with consistency checklists |

## 21.6 Tutorial and Onboarding Metrics

| Metric | What It Measures | Target |
|---|---|---|
| Onboarding completion rate | First-run experience | > 80% complete the onboarding flow |
| Tutorial modules started | Learning engagement | > 5 modules started per new user in first month |
| Tutorial modules completed | Learning depth | > 3 modules completed per new user in first month |
| Contextual tip engagement rate | Just-in-time learning | > 30% of shown tips are clicked through to the full tutorial |
| Glossary lookups per session | Reference utility | Tracked; no specific target |

## 21.7 How to Track

All metrics should be tracked via lightweight in-app analytics events (see Appendix C) stored either in localStorage (offline) or a simple Supabase `analytics_events` table. No third-party analytics services are needed for an internal tool.

---

# 22. Final Recommendations

## 22.1 What to Build Next (Phase 2 Priority Order)

1. **Story Bible and Character Bible** — This is the highest-impact addition. Pre-production planning is where creative quality is decided, and the app currently forces writers to do this outside the tool. Build the Story Bible (arcs, locations, world rules) and Character Bible (extended profiles, speech patterns, design sheets, relationships) as the first Phase 2 deliverable.

2. **Script Editor Improvements** — Drag-to-reorder panels/pages and virtualized rendering should ship alongside or immediately after the Bible modules. These are the most-requested quality-of-life fixes for the existing editing experience.

3. **Tutorial Foundations** — Build the Tutorial Center screen, contextual tips system, glossary, and 10-15 core tutorial modules. This establishes the learning infrastructure that will be expanded in Phase 3.

4. **Export Improvements** — Wire ExportScopeDialog as the primary export UI, add preflight validation, and implement long-image slicing. These are relatively low-effort, high-value improvements to the existing export pipeline.

5. **Review Enhancements** — Side-by-side script/art comparison and per-panel change request notes. These directly improve the collaboration workflow between writer and artist.

6. **Production Tracker** — Build last, as it depends on having enough production data flowing through the system to be useful. Start with the episode progress dashboard and page status heatmap.

## 22.2 What to Avoid Building Too Early

1. **AI features** — AI-assisted dialogue suggestions, pacing analysis, and layout recommendations are appealing but should wait until the foundational experience (Bible, Tutorial, Editor fixes) is solid. AI features built on a shaky foundation create more confusion than value.

2. **Mobile native app** — The responsive web app is sufficient for all current use cases. A native wrapper (Capacitor, Tauri) adds maintenance burden without proportional value.

3. **Advanced production management** — Gantt charts, resource allocation, and sprint planning tools are overkill for a small creative team. Keep production tracking lightweight.

4. **Multi-format simultaneous export** — Exporting the same content in webtoon and manga format simultaneously is a nice-to-have but affects very few workflows. Build it in Phase 3 if needed.

5. **Template marketplace or sharing** — Templates should be project-local. Sharing templates between projects is Phase 3; sharing between users is out of scope.

6. **Version control / branching** — Git-style branching for scripts adds enormous complexity. Undo/redo and JSON export/import provide sufficient version management for a personal tool.

## 22.3 Strategic Principles for Evolution

1. **Ship incrementally.** Phase 2 should be broken into sub-phases (2a: Bible, 2b: Editor, 2c: Tutorial, 2d: Export, 2e: Tracker). Each sub-phase should be independently useful.

2. **Content before features.** The tutorial system's value comes from its content, not its infrastructure. Invest time in creating high-quality visual examples and clear explanations — the rendering code is straightforward.

3. **Preserve what works.** The script editor, collaboration system, and export pipeline are solid. Phase 2 additions should enhance these systems, not rearchitect them.

4. **Keep the data model additive.** New tables should extend the existing schema, not modify it. Existing services and contexts should remain stable while new ones are added alongside them.

5. **Offline is non-negotiable.** Every new feature must degrade gracefully to offline mode. If a feature cannot work offline (like email notifications), it should be hidden — not broken — in offline mode.

6. **The writer is the center of gravity.** Every feature decision should be evaluated from the writer's perspective first. The writer is the user who spends the most time in the app and whose workflow determines the team's velocity.

---

# Appendices

## Appendix A: Suggested Supabase Schema Outline

### Current Schema (13 tables — preserve as-is)

```sql
-- Enums
CREATE TYPE user_role AS ENUM ('writer', 'artist', 'letterer', 'colorist', 'admin');
CREATE TYPE project_format AS ENUM ('webtoon', 'manhwa', 'manga', 'comic');
CREATE TYPE panel_status AS ENUM ('draft', 'submitted', 'in_progress', 'draft_received', 'changes_requested', 'approved');
CREATE TYPE content_type AS ENUM ('dialogue', 'caption', 'sfx');
CREATE TYPE thread_status AS ENUM ('submitted', 'in_progress', 'draft_received', 'approved');

-- Tables (existing)
users, projects, project_members, episodes, pages, panels,
content_blocks, characters, threads, messages, panel_assets,
uploaded_files, script_imports
```

### Phase 2 Schema Additions

```sql
-- New enums
CREATE TYPE arc_type AS ENUM ('main', 'subplot', 'character', 'thematic');
CREATE TYPE arc_status AS ENUM ('planning', 'active', 'completed');
CREATE TYPE relationship_type AS ENUM ('ally', 'rival', 'mentor', 'protege', 'love_interest', 'family', 'antagonist', 'neutral');
CREATE TYPE world_rule_category AS ENUM ('magic', 'technology', 'social', 'physical', 'other');
CREATE TYPE production_stage AS ENUM ('script', 'thumbnail', 'sketch', 'ink', 'color', 'letter', 'review');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'blocked');
CREATE TYPE change_request_status AS ENUM ('open', 'resolved', 'dismissed');

-- New tables
story_arcs (id, project_id, title, description, arc_type, status, start_episode, end_episode, sort_order, created_at, updated_at)
character_arcs (id, character_id, story_arc_id, start_state, catalyst, end_state, notes)
character_profiles (id, character_id, appearance, personality, goals, fears, backstory, speech_patterns, voice_notes, visual_checklist)
character_relationships (id, project_id, character_a_id, character_b_id, relationship_type, description, evolution_notes)
character_design_sheets (id, character_id, title, image_url, annotations, sort_order, uploaded_at)
locations (id, project_id, name, description, significance, first_appearance, reference_images, created_at)
world_rules (id, project_id, title, description, category, sort_order)
timeline_events (id, project_id, title, description, story_date, episode_id, sort_order)
production_tasks (id, project_id, episode_id, page_id, panel_id, assignee_id, stage, status, notes, due_date, completed_at, created_at)
production_milestones (id, project_id, title, target_date, completed_at, notes)
change_requests (id, panel_id, requested_by, notes, status, resolved_at, created_at)
panel_revisions (id, panel_id, version, asset_url, uploaded_by, change_request_id, notes, created_at)
tutorial_progress (id, user_id, module_id, completed_steps, started_at, completed_at)
dismissed_tips (id, user_id, tip_id, dismissed_at)
```

### Phase 3 Schema Additions

```sql
asset_tags (id, file_id, tag, created_at)
templates (id, project_id, template_type, name, description, content, created_at)
analytics_events (id, user_id, event_type, event_data, created_at)
```

### RLS Pattern for New Tables

All new tables should follow this pattern:
```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

-- Read: project members can read
CREATE POLICY "{table}_select" ON {table}
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE id = {table}.project_id AND (owner_id = auth.uid() OR is_project_member(id)))
  );

-- Write: writers and admins can modify
CREATE POLICY "{table}_insert" ON {table}
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM project_members WHERE project_id = {table}.project_id AND user_id = auth.uid() AND role IN ('writer', 'admin'))
  );
```

User-scoped tables (tutorial_progress, dismissed_tips):
```sql
CREATE POLICY "own_data" ON tutorial_progress
  FOR ALL USING (user_id = auth.uid());
```

---

## Appendix B: Suggested Storage Bucket Structure

### Current Buckets (6 — preserve)

| Bucket | Access | Max Size | Purpose |
|---|---|---|---|
| panel-artwork | Public | 10 MB | Panel artwork from artists/colorists |
| reference-files | Private (signed) | 25 MB | Reference documents and images |
| script-imports | Private (signed) | 5 MB | Uploaded script files |
| project-files | Public | 2 MB | JSON project exports |
| avatars | Public | 2 MB | User profile images |
| exports | Private (signed) | 100 MB | Generated export files |

### Phase 2 Additions

| Bucket | Access | Max Size | Purpose |
|---|---|---|---|
| character-designs | Private (signed) | 25 MB | Character design sheet images and turnarounds |
| tutorial-assets | Public (read-only) | N/A | Tutorial visual example images (bundled with app, not user-uploaded) |
| location-references | Private (signed) | 25 MB | Location reference images for Story Bible |

### Path Conventions

```
{bucket}/
└── {projectId}/
    └── {subcategory}/
        └── {timestamp}-{sanitizedFilename}.{ext}

Examples:
panel-artwork/abc123/panels/1713024000-panel-01-inks.png
character-designs/abc123/mina/1713024000-front-view.png
reference-files/abc123/refs/ep-05/1713024000-cityscape-reference.jpg
location-references/abc123/locations/1713024000-tavern-exterior.png
```

---

## Appendix C: Suggested Analytics and Event Tracking Plan

Since this is an internal team tool, analytics should be lightweight and privacy-respecting. Track events to understand workflow patterns and identify friction points.

### Event Categories

#### Content Creation Events
| Event | Data | Purpose |
|---|---|---|
| `episode_created` | project_id, episode_number | Track creative output |
| `page_created` | project_id, episode_id | Track script depth |
| `panel_created` | project_id, page_id | Track panel volume |
| `content_block_created` | project_id, panel_id, type | Track dialogue/caption/sfx distribution |
| `character_created` | project_id | Track character development |
| `story_arc_created` | project_id | Track pre-production activity |

#### Collaboration Events
| Event | Data | Purpose |
|---|---|---|
| `panel_submitted` | project_id, panel_id | Track handoff volume |
| `panel_approved` | project_id, panel_id, revision_count | Track review efficiency |
| `panel_changes_requested` | project_id, panel_id | Track revision frequency |
| `message_sent` | project_id, thread_id | Track communication volume |
| `artwork_uploaded` | project_id, panel_id, file_size | Track art delivery |

#### Export Events
| Event | Data | Purpose |
|---|---|---|
| `export_started` | project_id, preset, scope, format | Track export patterns |
| `export_completed` | project_id, duration_ms, output_size | Track export performance |
| `export_failed` | project_id, error_type | Track export issues |
| `preflight_run` | project_id, warnings_count, errors_count | Track quality checks |

#### Tutorial Events
| Event | Data | Purpose |
|---|---|---|
| `tutorial_started` | module_id | Track learning engagement |
| `tutorial_completed` | module_id, duration_ms | Track learning depth |
| `tip_shown` | tip_id | Track contextual guidance delivery |
| `tip_clicked` | tip_id | Track tip engagement |
| `tip_dismissed` | tip_id | Track tip relevance |
| `glossary_lookup` | term | Track reference usage |

#### Navigation Events
| Event | Data | Purpose |
|---|---|---|
| `view_switched` | from_view, to_view | Track workflow patterns |
| `command_palette_used` | search_query, result_selected | Track feature discovery |
| `keyboard_shortcut_used` | shortcut | Track power-user behavior |

### Storage
- **Offline:** Events buffered in localStorage under `inkline:analytics-buffer` (max 1000 events, FIFO)
- **Online:** Events written to `analytics_events` table in Supabase (Phase 3)
- **No third-party services** — all data stays in the deployment

---

## Appendix D: Suggested Onboarding Flow

### Current Onboarding (Preserve and Enhance)
The existing onboarding flow is a 4-step modal tour triggered on first project creation:
1. Welcome to Inkline
2. Script Editor overview
3. Collaboration overview
4. Compile & Export overview

### Enhanced Onboarding (Phase 2)

#### First-Run Flow
1. **Welcome** — "Welcome to Inkline — your creative workspace for [format] creation." Personalized to the selected format.
2. **Your Role** — "As a [role], here's what you'll use most:" Highlights role-relevant features.
3. **Script Editor Tour** — Interactive highlight of episode sidebar, page/panel creation, content blocks, and character sidebar.
4. **Format Preview** — Show a mini preview of how the selected format looks when assembled. "Your [format] will look like this when exported."
5. **Next Steps** — "Ready to start? Create your first episode, or explore the Tutorial Center to learn about [format] conventions."

#### Role-Specific First Steps
After onboarding completes, show a "Getting Started" card in the project dashboard:

**Writer:** "Start by creating your first episode. Shift+E to add an episode, Shift+P for pages, Shift+N for panels."
**Artist:** "Check the Collaboration view for pending panel assignments. You'll find script descriptions and reference files there."
**Colorist:** "Look for approved inks in the Collaboration view. Upload your colored versions to the same panels."
**Letterer:** "Open the Compile view to place speech bubbles. The script's dialogue blocks will guide your placement."

#### Tutorial Center Nudge
One session after onboarding completion, show a non-blocking notification: "Want to learn more about creating [format] content? Visit the Tutorial Center." with a direct link.

---

## Appendix E: Suggested Tutorial Architecture

### Content Organization

```
Tutorial Center
├── App Features (Category)
│   ├── Getting Started (Module - Beginner)
│   ├── Script Editor Deep Dive (Module - Intermediate)
│   ├── Collaboration Workflows (Module - Beginner)
│   ├── Export and Publishing (Module - Intermediate)
│   └── Keyboard Shortcuts Mastery (Module - Advanced)
│
├── Panel Composition (Category)
│   ├── Panel Types Explained (Module - Beginner)
│   ├── Reading Flow and Eye Direction (Module - Intermediate)
│   ├── Panel Density and Pacing (Module - Intermediate)
│   └── Advanced Compositions (Module - Advanced)
│
├── Pacing and Storytelling (Category)
│   ├── Understanding Pacing Basics (Module - Beginner)
│   ├── Impact Panels and Dramatic Moments (Module - Intermediate)
│   ├── Scene Transitions (Module - Intermediate)
│   ├── Vertical Pacing for Webtoons (Module - Intermediate)
│   ├── Page-Turn Reveals for Manga/Comics (Module - Intermediate)
│   └── Cliffhangers and Episode Endings (Module - Advanced)
│
├── Dialogue and Readability (Category)
│   ├── Writing Readable Dialogue (Module - Beginner)
│   ├── Mobile Readability Guide (Module - Intermediate)
│   ├── Speech Bubble Best Practices (Module - Intermediate)
│   └── Sound Effects Integration (Module - Intermediate)
│
├── Format Conventions (Category)
│   ├── Webtoon Format Guide (Module - Beginner)
│   ├── Manhwa Format Guide (Module - Beginner)
│   ├── Manga Format Guide (Module - Beginner)
│   ├── Comic Format Guide (Module - Beginner)
│   └── Cross-Format Comparison (Module - Intermediate)
│
└── Production Workflow (Category)
    ├── Production Stages Overview (Module - Beginner)
    ├── From Thumbnails to Finals (Module - Intermediate)
    ├── The Review Cycle (Module - Beginner)
    └── Publishing Preparation (Module - Intermediate)
```

### Module File Format

Each module is a JSON file in `src/tutorials/modules/`:

```json
{
  "id": "impact-panels",
  "title": "Impact Panels and Dramatic Moments",
  "category": "pacing-and-storytelling",
  "difficulty": "intermediate",
  "estimatedMinutes": 10,
  "formats": ["webtoon", "manhwa", "manga", "comic"],
  "roles": ["writer", "artist"],
  "prerequisites": ["understanding-pacing-basics"],
  "steps": [
    {
      "type": "text",
      "title": "What is an Impact Panel?",
      "content": "An impact panel is a large panel — often full-width or full-page — used to emphasize a dramatic moment..."
    },
    {
      "type": "visual-example",
      "exampleId": "impact-panel-fullwidth",
      "caption": "A full-width impact panel creates a visual pause that makes the reader absorb the moment."
    },
    {
      "type": "comparison",
      "title": "Impact vs Standard",
      "goodExample": {
        "imageId": "impact-good-example",
        "caption": "Full-width panel with negative space draws the eye"
      },
      "badExample": {
        "imageId": "impact-bad-example",
        "caption": "Same moment crammed into a small panel loses dramatic weight"
      }
    },
    {
      "type": "text",
      "title": "When to Use Impact Panels",
      "content": "Use impact panels for: character reveals, major plot twists, emotional climaxes..."
    },
    {
      "type": "tip",
      "content": "In Inkline, tag a panel as 'impact' to signal to your artist that this panel needs special treatment."
    }
  ]
}
```

### Contextual Tip Database

Tips are defined in `src/tutorials/tips.json`:

```json
[
  {
    "id": "panel-density-high",
    "trigger": "panel_count_per_page > 6 AND format IN ('webtoon', 'manhwa')",
    "message": "This page has many panels. Webtoon pages typically have 3-5 panels for comfortable mobile reading.",
    "learnMoreModule": "panel-density-and-pacing",
    "maxShowsPerSession": 1,
    "maxShowsTotal": 3
  },
  {
    "id": "dialogue-density-high",
    "trigger": "word_count_per_panel > 80",
    "message": "This panel has a lot of dialogue. Consider breaking it into multiple exchanges for better readability.",
    "learnMoreModule": "writing-readable-dialogue",
    "maxShowsPerSession": 1,
    "maxShowsTotal": 5
  }
]
```

---

## Appendix F: Suggested Visual Example Library Structure

### Image Naming Convention
```
{category}-{concept}-{variant}.png
Examples:
panel-types-establishing-wide.png
panel-types-impact-fullwidth.png
pacing-decompression-8panel.png
pacing-compression-3panel.png
dialogue-density-good.png
dialogue-density-overcrowded.png
format-webtoon-vertical-strip.png
format-manga-b5-page.png
transition-hard-cut.png
transition-establishing-shot.png
```

### Image Categories and Initial Examples

| Category | Examples Needed | Priority |
|---|---|---|
| Panel Types | establishing, action, dialogue, reaction, impact, transition (6 examples) | Phase 2 |
| Panel Density | 2-panel page, 4-panel page, 6-panel page, overcrowded page (4 examples) | Phase 2 |
| Pacing | decompression, compression, impact, breathing room (4 examples) | Phase 2 |
| Dialogue Density | good density, overcrowded, mobile preview comparison (3 examples) | Phase 2 |
| Gutters/Spacing | tight gutters (fast), wide gutters (slow), no gutters (seamless) (3 examples) | Phase 2 |
| Format Comparison | same scene in webtoon, manhwa, manga, comic (4 examples) | Phase 2 |
| Reading Flow | webtoon vertical flow, manga RTL flow, comic LTR flow (3 examples) | Phase 2 |
| Transitions | hard cut, fade, establishing shot, parallel (4 examples) | Phase 3 |
| Lettering | good bubble placement, poor placement, SFX examples (3 examples) | Phase 3 |
| Production Stages | thumbnail, sketch, ink, color, final (5 examples) | Phase 3 |

**Initial target:** 30 visual examples for Phase 2, expanding to 60+ in Phase 3.

### Annotation Format

Each visual example image may have an accompanying annotation file:

```json
{
  "id": "panel-types-impact-fullwidth",
  "image": "panel-types-impact-fullwidth.png",
  "width": 800,
  "height": 600,
  "annotations": [
    {
      "x": 50,
      "y": 120,
      "label": "1",
      "note": "Full-width panel spans the entire page width, creating a visual pause"
    },
    {
      "x": 400,
      "y": 300,
      "label": "2",
      "note": "Negative space around the subject draws the reader's eye to the focal point"
    },
    {
      "x": 700,
      "y": 450,
      "label": "3",
      "note": "Minimal or no dialogue lets the image speak for itself"
    }
  ]
}
```

---

## Appendix G: Suggested Empty-State Copy Ideas

### Workspace Dashboard
**No projects:** "Welcome to Inkline. Your stories start here. Create your first project to begin."
**Button:** "Create Project"

### Episode List
**No episodes:** "No episodes yet. Every great series starts with Episode 1."
**Button:** "Create Episode (Shift+E)"

### Page List
**No pages in episode:** "This episode has no pages. Add pages to start building your story."
**Button:** "Add Page (Shift+P)"

### Panel List
**No panels on page:** "This page is waiting for panels. Panels are where your story comes to life."
**Button:** "Add Panel (Shift+N)"

### Character Roster
**No characters:** "No characters yet. Characters bring personality and voice to your script."
**Button:** "Add Character"

### Story Bible — Arcs
**No arcs:** "No story arcs planned. Story arcs help you see the big picture of your narrative."
**Button:** "Create Story Arc"

### Story Bible — Locations
**No locations:** "No locations defined. Locations ground your story in a tangible world."
**Button:** "Add Location"

### Story Bible — World Rules
**No rules:** "No world rules documented. World rules keep your story universe consistent."
**Button:** "Add World Rule"

### Character Bible — Design Sheets
**No design sheets:** "No design sheets for this character. Upload reference art to help your artist maintain visual consistency."
**Button:** "Upload Design Sheet"

### Character Bible — Relationships
**No relationships:** "No relationships mapped. Character relationships drive story conflict and emotional depth."
**Button:** "Add Relationship"

### Collaboration — Threads
**No threads:** "No collaboration threads yet. Submit pages from the Script Editor to start working with your team."

### Collaboration — Messages
**Thread empty:** "Start the conversation. Share your thoughts on these pages."

### Reference Files
**No references:** "No reference files for this episode. Upload images, mood boards, or documents to share with your team."
**Button:** "Upload Reference"

### Asset Library
**No assets:** "Your asset library is empty. Artwork, references, and exports will appear here as your team creates them."

### Production Tracker
**No production data:** "Production tracking will show progress once panels start moving through the pipeline. Submit pages from the Script Editor to begin."

### Export History
**No exports:** "No exports yet. When you export episodes, they'll appear here for easy re-download."

### Tutorial Center — Progress
**No started tutorials:** "You haven't started any tutorials yet. Learning about [format] conventions will help you create better content."
**Button:** "Browse Tutorials"

### Notifications
**No notifications:** "No notifications yet. Activity updates will appear here as your team collaborates."

---

## Appendix H: Suggested Future AI-Assisted Features

These features should be considered for Phase 3 or later. They should enhance creative workflows without replacing creative judgment. All AI features should be optional, transparent about what they do, and never auto-apply changes without user confirmation.

### H.1 Dialogue Quality Feedback

**What:** Analyze dialogue blocks for readability, consistency with character voice profiles, and natural flow.
**How:** Send dialogue + character speech pattern notes to an LLM. Return suggestions like "This dialogue seems more formal than Mina's usual speech pattern" or "Consider breaking this 80-word block into two shorter exchanges."
**Guard rails:** Suggestions only — never auto-edit. User must accept or dismiss each suggestion. Clearly labeled as AI-generated.

### H.2 Pacing Analysis

**What:** Analyze an episode's panel structure and provide pacing feedback.
**How:** Count panels per page, identify dialogue/action/impact distribution, estimate reading time per section. Return visualizations and suggestions: "Pages 5-8 are all dialogue-heavy — consider adding an action beat to break the rhythm."
**Guard rails:** Analysis based on structural data, not subjective quality judgment.

### H.3 Panel Description Enhancement

**What:** Expand brief panel descriptions into more detailed artist-ready directions.
**How:** Writer types "wide shot of the city at night." AI suggests "Wide establishing shot. Overhead angle of the city skyline. Night. Lights from buildings create a warm glow. Moon visible in upper right. Focal depth on the nearest building where the protagonist lives."
**Guard rails:** Suggestions shown as editable text below the original. Writer chooses to use, modify, or discard.

### H.4 Script-to-Thumbnail Suggestions

**What:** Generate rough thumbnail sketches from panel descriptions to help artists understand composition intent.
**How:** Use image generation to create rough composition sketches (stick figures, basic shapes). Not final artwork — just layout reference.
**Guard rails:** Explicitly labeled as "rough composition suggestion." Not a replacement for the artist's thumbnailing process.

### H.5 Character Consistency Checking

**What:** Analyze uploaded panel artwork for visual consistency with character design sheets.
**How:** Compare uploaded panel art against character design sheet images. Flag potential inconsistencies: "Mina's hair appears lighter in Panel 5 compared to her design sheet."
**Guard rails:** Flags only — no auto-correction. Artists may intentionally deviate for artistic reasons.

### H.6 Translation Assistance

**What:** Help translate dialogue and SFX for multi-language releases.
**How:** Provide translation of dialogue blocks with context awareness (character voice, formality, slang). Preserve character speech patterns across languages.
**Guard rails:** Always presented as draft translations requiring human review.

### H.7 Episode Summary Generation

**What:** Auto-generate episode summaries for series descriptions and promotional text.
**How:** Analyze episode script content and generate a spoiler-free summary suitable for platform listings.
**Guard rails:** Always editable before use. Marked as AI-generated.

### H.8 Readability Scoring

**What:** Score dialogue readability at target viewport sizes, considering font rendering, bubble size, and text density.
**How:** Combine text analysis (word count, character count, line breaks) with viewport simulation to estimate readability. Return a score and specific flagged areas.
**Guard rails:** Scoring is advisory; no export blocking based on AI readability scores.

### Design Principles for AI Features

1. **AI assists, never decides.** Every AI suggestion requires explicit user action to apply.
2. **Transparent sourcing.** Clearly indicate when content or analysis is AI-generated.
3. **Optional always.** AI features can be disabled entirely in Settings without affecting any other functionality.
4. **Privacy-preserving.** No project content should be sent to third-party AI services without explicit consent. Prefer local/self-hosted models when possible.
5. **Not a gimmick.** AI features must solve real workflow problems. "AI-generated panel art" is a gimmick; "AI-assisted readability scoring" solves a real problem.

---

*End of Inkline Product Requirements Document*
