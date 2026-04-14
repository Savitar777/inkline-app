# Phase 4: Asset Tagging & Search + Timeline/Scheduling

**Date:** 2026-04-14
**Status:** Design approved

## Context

Inkline is production-ready through Phase 3. The two most impactful gaps for a writer+artist team workflow are: (1) no way to find uploaded files beyond browsing by category, and (2) no way to plan deadlines or see a date-based production view. This phase adds unified asset search with tagging and a month-view calendar for scheduling episode/page deadlines.

Episode/page templates are explicitly deferred to a separate session.

---

## Feature 1: Asset Tagging & Search

### Data Model

Extend `FileMetadata` in `src/types/files.ts` with two new optional fields:

```ts
tags?: string[]      // user-created tags
autoTags?: string[]  // system-derived, read-only to user
```

**Auto-tag derivation rules** (pure function in `src/domain/tagDerivation.ts`):

| Source | Tag format | Example |
|--------|-----------|---------|
| File category | category name | `artwork`, `reference`, `avatar`, `script` |
| Episode association | `ep-{number}` | `ep-1` |
| Page association | `page-{number}` | `page-3` |
| Panel association | `panel-{number}` | `panel-5` |
| Character match | `char:{name}` | `char:Kai` |
| MIME type | type keyword | `image`, `pdf`, `svg` |
| Panel type | panelType value | `establishing`, `action`, `dialogue` |
| Panel status | status value | `approved`, `draft` |

Auto-tags are regenerated on file upload and when associations change. User tags are preserved independently.

### Search Strategy

- **Offline (localStorage):** Client-side filter over cached file list. Match `tags` + `autoTags` arrays with `.includes()` + case-insensitive filename substring match. Debounced 300ms.
- **Online (Supabase):** `uploaded_files` table gains a `tags TEXT[]` column. Query with `.contains()` for tag filtering + `.ilike()` for filename. Paginated results.

### Schema: uploaded_files table

The `uploaded_files` table is referenced in `fileMetadataService.ts` but missing from `supabase/schema.sql`. It must be created:

```sql
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  original_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_uploaded_files_project ON uploaded_files(project_id);
CREATE INDEX idx_uploaded_files_tags ON uploaded_files USING GIN(tags);
```

RLS policies should mirror existing project-member patterns.

### UI: Enhanced AssetLibraryDrawer

The existing `AssetLibraryDrawer` (`src/components/compile/AssetLibraryDrawer.tsx`) is enhanced with:

1. **Search bar** at the top — matches filename + all tags, debounced 300ms
2. **Tag filter chips** below search — derived from all tags across project files, sorted by frequency. Click to toggle AND filter. Active chips highlighted.
3. **Expanded file card** — click a file to see its tags. Auto-tags shown as non-removable chips. User tags shown with × to remove. "+ add tag" button opens inline text input.
4. **Filtered results** replace category grouping with a flat grid when search/filter is active. Result count shown.

**New components:**
- `src/components/assets/AssetSearchBar.tsx` — search input with debounce
- `src/components/assets/TagChips.tsx` — clickable filter chip row
- `src/components/assets/TagEditor.tsx` — inline tag add/remove on expanded file card

**Mobile:** Tag chips scroll horizontally (`overflow-x: auto`) instead of wrapping. Same search bar and grid. Opens via `MobileDrawer` per existing pattern.

---

## Feature 2: Timeline/Scheduling

### Data Model

Extend existing types in `src/types/index.ts`:

```ts
// Episode — add:
deadline?: string          // ISO date string (YYYY-MM-DD)
assignedRole?: ProductionRole

// Page — add:
deadline?: string
assignedRole?: ProductionRole
```

These are optional fields on existing types — no migration needed for existing projects. Bump `__schemaVersion` in `src/domain/validation.ts`.

### Selector: getCalendarEntries()

New file `src/domain/scheduleSelectors.ts`:

```ts
interface CalendarEntry {
  id: string
  date: string              // ISO date (no time)
  type: 'episode' | 'page'
  label: string             // "Ep 3" or "Ep 3 · Pg 5"
  assignedRole?: ProductionRole
  episodeId: string
  pageId?: string
  isOverdue: boolean        // date < today && not fully approved
  completionPct: number     // from production selectors
}

function getCalendarEntries(project: Project): CalendarEntry[]
```

Pure derived-data function — same pattern as `getEpisodeProductionSummaries()` and `getPageHeatmap()`.

### UI: CalendarView

New tab alongside the Production Tracker in the same sidebar area. Tab strip toggles between "Production" and "Calendar" views.

**Desktop — full month grid:**
- 7-column grid, day cells with date number
- Deadline entries render as colored bars with left border matching assigned role color
- Episode deadlines: `"Ep 1"` — Page deadlines: `"Ep 1 · Pg 2"`
- Multiple entries per day stack vertically
- Today highlighted with purple border + badge
- Overdue entries: reduced opacity + strikethrough

**Role colors (existing mapping):**
- Writer: `#89b4fa` (blue)
- Artist: `#f38ba8` (pink)
- Letterer: `#a6e3a1` (green)
- Colorist: `#f9e2af` (yellow)

**Interactions:**
- **Click empty day** → popover to create deadline: select episode (or page within episode), assign role. Saved via `setProject()` with undo support.
- **Click existing entry** → detail popover: episode/page info, assigned role, completion %, panel status breakdown. Edit date/role. Delete deadline.
- **Role filter toggles** in header — show/hide entries by role. All active by default.
- **Month navigation** — prev/next arrows in header.

**Mobile — dots + list:**
- Compact grid with colored dots (no labels) indicating deadlines
- Tap a day → selected day's entries shown in a list below the grid
- Each list item shows: entry label, assigned role, completion %
- Tap list item → edit popover

**New components:**
- `src/components/schedule/CalendarView.tsx` — month grid + header + role filters
- `src/components/schedule/CalendarDay.tsx` — single day cell (desktop: bars, mobile: dots)
- `src/components/schedule/CalendarEntry.tsx` — deadline bar/dot within a day
- `src/components/schedule/DeadlinePopover.tsx` — create/edit/delete deadline

### Context Actions

Add to `ProjectDocumentContext.tsx` actions:

- `setEpisodeDeadline(episodeId, deadline, assignedRole?)` — wraps `setProject()`
- `setPageDeadline(episodeId, pageId, deadline, assignedRole?)` — wraps `setProject()`
- `removeDeadline(episodeId, pageId?)` — clears deadline fields

All go through `setProject()` for undo/redo support.

---

## Component Summary

| Action | File | Purpose |
|--------|------|---------|
| NEW | `src/components/assets/AssetSearchBar.tsx` | Search input with debounce |
| NEW | `src/components/assets/TagChips.tsx` | Clickable tag filter chips |
| NEW | `src/components/assets/TagEditor.tsx` | Inline tag add/remove on file card |
| NEW | `src/components/schedule/CalendarView.tsx` | Month grid + header + filters |
| NEW | `src/components/schedule/CalendarDay.tsx` | Day cell (desktop bars / mobile dots) |
| NEW | `src/components/schedule/CalendarEntry.tsx` | Deadline bar/dot rendering |
| NEW | `src/components/schedule/DeadlinePopover.tsx` | Create/edit/delete deadline |
| NEW | `src/domain/scheduleSelectors.ts` | `getCalendarEntries()` pure selector |
| NEW | `src/domain/tagDerivation.ts` | Auto-tag derivation rules |
| MOD | `src/types/index.ts` | `deadline`, `assignedRole` on Episode/Page |
| MOD | `src/types/files.ts` | `tags`, `autoTags` on FileMetadata |
| MOD | `src/components/compile/AssetLibraryDrawer.tsx` | Search bar + tag filter integration |
| MOD | `src/components/ProductionTracker.tsx` | Calendar tab alongside production views |
| MOD | `src/services/fileMetadataService.ts` | Tag persistence + search queries |
| MOD | `src/domain/validation.ts` | Schema version bump |
| MOD | `supabase/schema.sql` | `uploaded_files` table + tags column |
| MOD | `src/context/ProjectDocumentContext.tsx` | Deadline set/remove actions |

All new components wrapped with `React.memo` per project convention.

---

## What's NOT in scope

- Email notifications (requires external service)
- Episode/page templates (separate session)
- AI-assisted features
- Gantt view (future enhancement if calendar proves insufficient)
- Drag-to-reschedule on calendar (keep it simple — click to edit)
