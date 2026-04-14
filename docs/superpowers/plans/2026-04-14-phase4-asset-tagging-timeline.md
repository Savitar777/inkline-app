# Phase 4: Asset Tagging & Search + Timeline/Scheduling — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add unified asset search with auto-tagging to the Asset Library, and a month-view calendar for episode/page deadline scheduling.

**Architecture:** Both features extend existing types and patterns — FileMetadata gains tag arrays, Episode/Page gain deadline fields. New pure-function selectors derive calendar entries and auto-tags. UI integrates into the existing AssetLibraryDrawer and ProductionTracker view. All changes go through `setProject()` for undo/redo and localStorage persistence.

**Tech Stack:** React 19, TypeScript, Tailwind CSS (ink-* theme tokens), Supabase (online) / localStorage (offline)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| NEW | `src/domain/tagDerivation.ts` | Pure function: derive auto-tags from file metadata + project state |
| NEW | `src/domain/scheduleSelectors.ts` | Pure function: derive CalendarEntry[] from project state |
| NEW | `src/components/assets/AssetSearchBar.tsx` | Debounced search input |
| NEW | `src/components/assets/TagChips.tsx` | Clickable tag filter row |
| NEW | `src/components/assets/TagEditor.tsx` | Inline add/remove tags on file card |
| NEW | `src/components/schedule/CalendarView.tsx` | Month grid + header + role filters |
| NEW | `src/components/schedule/CalendarDay.tsx` | Day cell (bars on desktop, dots on mobile) |
| NEW | `src/components/schedule/DeadlinePopover.tsx` | Create/edit/delete deadline popover |
| MOD | `src/types/files.ts` | Add `tags`, `autoTags` to FileMetadata |
| MOD | `src/types/index.ts` | Add `deadline`, `assignedRole` to Episode/Page; export CalendarEntry |
| MOD | `src/domain/migrations.ts` | Bump CURRENT_SCHEMA_VERSION to 3; add migration 2→3 |
| MOD | `src/domain/validation.ts` | Parse new optional fields on Episode/Page |
| MOD | `src/services/fileMetadataService.ts` | Add `updateFileTags()`, `searchProjectFiles()` |
| MOD | `src/components/compile/AssetLibraryDrawer.tsx` | Integrate search bar + tag chips + expandable file cards |
| MOD | `src/views/ProductionTracker.tsx` | Add Calendar tab |
| MOD | `src/context/ProjectDocumentContext.tsx` | Add deadline set/remove actions |
| MOD | `src/context/ProjectContext.tsx` | Re-export deadline actions |
| MOD | `supabase/schema.sql` | Add `uploaded_files` table with `tags TEXT[]` column |

---

## Task 1: Extend Types — FileMetadata Tags

**Files:**
- Modify: `src/types/files.ts:40-51`

- [ ] **Step 1: Add tag fields to FileMetadata**

```typescript
// In src/types/files.ts, add to the FileMetadata interface after exportJobId:
export interface FileMetadata {
  width?: number
  height?: number
  thumbnailUrl?: string
  pageCount?: number
  wordCount?: number
  panelId?: string
  episodeId?: string
  pageId?: string
  importedAsScriptId?: string
  exportJobId?: string
  tags?: string[]
  autoTags?: string[]
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/types/files.ts
git commit -m "feat: add tags and autoTags fields to FileMetadata"
```

---

## Task 2: Extend Types — Episode/Page Deadlines + CalendarEntry

**Files:**
- Modify: `src/types/index.ts:39-52` (Page and Episode interfaces)
- Modify: `src/types/index.ts` (add CalendarEntry and export)

- [ ] **Step 1: Add deadline and assignedRole to Episode**

In `src/types/index.ts`, update the Episode interface:

```typescript
export interface Episode {
  id: string
  number: number
  title: string
  brief: string
  pages: Page[]
  deadline?: string
  assignedRole?: ProductionRole
}
```

- [ ] **Step 2: Add deadline and assignedRole to Page**

In `src/types/index.ts`, update the Page interface:

```typescript
export interface Page {
  id: string
  number: number
  layoutNote: string
  panels: Panel[]
  deadline?: string
  assignedRole?: ProductionRole
}
```

- [ ] **Step 3: Add CalendarEntry type**

Add after the `RoleWorkloadItem` interface (around line 244):

```typescript
export interface CalendarEntry {
  id: string
  date: string
  type: 'episode' | 'page'
  label: string
  assignedRole?: ProductionRole
  episodeId: string
  pageId?: string
  isOverdue: boolean
  completionPct: number
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add deadline/assignedRole to Episode/Page, add CalendarEntry type"
```

---

## Task 3: Schema Migration — Version 2 → 3

**Files:**
- Modify: `src/domain/migrations.ts:2,10-21`
- Modify: `src/domain/validation.ts` (parse new optional fields)

- [ ] **Step 1: Bump schema version and add migration**

In `src/domain/migrations.ts`, change line 2 and add migration:

```typescript
export const CURRENT_SCHEMA_VERSION = 3

const MIGRATIONS: MigrationFn[] = [
  // Migration 0 → 1: normalize pre-versioning documents (identity for now)
  (raw) => raw,
  // Migration 1 → 2: add storyBible and extended character fields
  (raw) => {
    const doc = raw as Record<string, unknown>
    if (!doc.storyBible) {
      doc.storyBible = { arcs: [], locations: [], worldRules: [], timeline: [] }
    }
    return doc
  },
  // Migration 2 → 3: deadline/assignedRole on episodes/pages (no-op — fields are optional)
  (raw) => raw,
]
```

- [ ] **Step 2: Update validation to parse new Episode fields**

In `src/domain/validation.ts`, find the function that parses episodes (search for `parseEpisode`). Add parsing for the new optional fields. After the existing `pages` parsing:

```typescript
// Inside parseEpisode, after pages parsing:
const deadline = asString(ep.deadline, `episodes[${index}].deadline`, '') || undefined
const assignedRoleStr = asString(ep.assignedRole, `episodes[${index}].assignedRole`, '')
const assignedRole = assignedRoleStr && isProductionRole(assignedRoleStr) ? assignedRoleStr : undefined

// Add to the return object:
return {
  id: /* existing */,
  number: /* existing */,
  title: /* existing */,
  brief: /* existing */,
  pages: /* existing */,
  deadline,
  assignedRole,
}
```

- [ ] **Step 3: Update validation to parse new Page fields**

Same pattern in `parsePage`:

```typescript
// Inside parsePage, after panels parsing:
const deadline = asString(pg.deadline, `pages[${index}].deadline`, '') || undefined
const assignedRoleStr = asString(pg.assignedRole, `pages[${index}].assignedRole`, '')
const assignedRole = assignedRoleStr && isProductionRole(assignedRoleStr) ? assignedRoleStr : undefined

// Add to the return object:
return {
  id: /* existing */,
  number: /* existing */,
  layoutNote: /* existing */,
  panels: /* existing */,
  deadline,
  assignedRole,
}
```

- [ ] **Step 4: Add isProductionRole helper**

Add near the other type guards (around `isPanelStatus` / `isPanelType`):

```typescript
function isProductionRole(value: string): value is ProductionRole {
  return ['writer', 'artist', 'letterer', 'colorist'].includes(value)
}
```

Note: You'll need to import `ProductionRole` in the import line at the top of `validation.ts`.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/domain/migrations.ts src/domain/validation.ts
git commit -m "feat: schema migration v3 — parse deadline/assignedRole on Episode/Page"
```

---

## Task 4: Tag Derivation — Pure Domain Logic

**Files:**
- Create: `src/domain/tagDerivation.ts`

- [ ] **Step 1: Create tagDerivation.ts**

```typescript
import type { Project } from '../types'
import type { FileMetadata, FileCategory } from '../types/files'

const CATEGORY_TAG: Partial<Record<FileCategory, string>> = {
  'panel-assets': 'artwork',
  'reference-files': 'reference',
  'avatars': 'avatar',
  'script-imports': 'script',
}

function mimeTag(mimeType: string): string | null {
  if (mimeType.startsWith('image/svg')) return 'svg'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  return null
}

export function deriveAutoTags(
  metadata: FileMetadata,
  category: FileCategory,
  mimeType: string,
  project: Project,
): string[] {
  const tags: string[] = []

  // Category tag
  const catTag = CATEGORY_TAG[category]
  if (catTag) tags.push(catTag)

  // MIME tag
  const mt = mimeTag(mimeType)
  if (mt) tags.push(mt)

  // Episode association
  if (metadata.episodeId) {
    const ep = project.episodes.find(e => e.id === metadata.episodeId)
    if (ep) tags.push(`ep-${ep.number}`)
  }

  // Page association
  if (metadata.pageId && metadata.episodeId) {
    const ep = project.episodes.find(e => e.id === metadata.episodeId)
    const pg = ep?.pages.find(p => p.id === metadata.pageId)
    if (pg) tags.push(`page-${pg.number}`)
  }

  // Panel association
  if (metadata.panelId && metadata.episodeId) {
    const ep = project.episodes.find(e => e.id === metadata.episodeId)
    for (const pg of ep?.pages ?? []) {
      const panel = pg.panels.find(p => p.id === metadata.panelId)
      if (panel) {
        tags.push(`panel-${panel.number}`)
        if (panel.panelType) tags.push(panel.panelType)
        if (panel.status) tags.push(panel.status)
        break
      }
    }
  }

  // Character match — check if filename contains any character name
  // (lightweight heuristic, no NLP)
  const lowerName = (metadata as FileMetadata & { _fileName?: string })._fileName?.toLowerCase()
  if (lowerName) {
    for (const char of project.characters) {
      if (lowerName.includes(char.name.toLowerCase())) {
        tags.push(`char:${char.name}`)
      }
    }
  }

  return [...new Set(tags)]
}
```

Note: The `_fileName` approach is too fragile. Instead, pass filename as a parameter:

```typescript
export function deriveAutoTags(
  metadata: FileMetadata,
  category: FileCategory,
  mimeType: string,
  fileName: string,
  project: Project,
): string[] {
  const tags: string[] = []

  const catTag = CATEGORY_TAG[category]
  if (catTag) tags.push(catTag)

  const mt = mimeTag(mimeType)
  if (mt) tags.push(mt)

  if (metadata.episodeId) {
    const ep = project.episodes.find(e => e.id === metadata.episodeId)
    if (ep) tags.push(`ep-${ep.number}`)
  }

  if (metadata.pageId && metadata.episodeId) {
    const ep = project.episodes.find(e => e.id === metadata.episodeId)
    const pg = ep?.pages.find(p => p.id === metadata.pageId)
    if (pg) tags.push(`page-${pg.number}`)
  }

  if (metadata.panelId && metadata.episodeId) {
    const ep = project.episodes.find(e => e.id === metadata.episodeId)
    for (const pg of ep?.pages ?? []) {
      const panel = pg.panels.find(p => p.id === metadata.panelId)
      if (panel) {
        tags.push(`panel-${panel.number}`)
        if (panel.panelType) tags.push(panel.panelType)
        if (panel.status) tags.push(panel.status)
        break
      }
    }
  }

  const lowerName = fileName.toLowerCase()
  for (const char of project.characters) {
    if (char.name.length >= 2 && lowerName.includes(char.name.toLowerCase())) {
      tags.push(`char:${char.name}`)
    }
  }

  return [...new Set(tags)]
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: no errors (module is imported nowhere yet — tree-shaking keeps it out, but TS validates)

- [ ] **Step 3: Commit**

```bash
git add src/domain/tagDerivation.ts
git commit -m "feat: add tag derivation pure function"
```

---

## Task 5: Schedule Selectors — Pure Domain Logic

**Files:**
- Create: `src/domain/scheduleSelectors.ts`

- [ ] **Step 1: Create scheduleSelectors.ts**

```typescript
import type { Project, CalendarEntry } from '../types'
import { getEpisodeProductionSummaries } from './productionSelectors'

export function getCalendarEntries(project: Project): CalendarEntry[] {
  const entries: CalendarEntry[] = []
  const summaries = getEpisodeProductionSummaries(project)

  for (const ep of project.episodes) {
    const summary = summaries.find(s => s.episodeId === ep.id)

    if (ep.deadline) {
      entries.push({
        id: `ep-${ep.id}`,
        date: ep.deadline,
        type: 'episode',
        label: `Ep ${ep.number}`,
        assignedRole: ep.assignedRole,
        episodeId: ep.id,
        isOverdue: ep.deadline < todayISO() && (summary?.completionPct ?? 0) < 100,
        completionPct: summary?.completionPct ?? 0,
      })
    }

    for (const pg of ep.pages) {
      if (pg.deadline) {
        const totalPanels = pg.panels.length
        const approvedPanels = pg.panels.filter(p => p.status === 'approved').length
        const pct = totalPanels > 0 ? Math.round((approvedPanels / totalPanels) * 100) : 0

        entries.push({
          id: `pg-${pg.id}`,
          date: pg.deadline,
          type: 'page',
          label: `Ep ${ep.number} \u00b7 Pg ${pg.number}`,
          assignedRole: pg.assignedRole,
          episodeId: ep.id,
          pageId: pg.id,
          isOverdue: pg.deadline < todayISO() && pct < 100,
          completionPct: pct,
        })
      }
    }
  }

  return entries.sort((a, b) => a.date.localeCompare(b.date))
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/domain/scheduleSelectors.ts
git commit -m "feat: add getCalendarEntries schedule selector"
```

---

## Task 6: File Metadata Service — Tag Persistence & Search

**Files:**
- Modify: `src/services/fileMetadataService.ts`

- [ ] **Step 1: Add updateFileTags function**

Add after the `deleteFileRecord` function:

```typescript
export async function updateFileTags(
  fileId: string,
  tags: string[],
  autoTags: string[],
  projectId?: string,
): Promise<void> {
  const allTags = [...new Set([...tags, ...autoTags])]

  if (!isSupabaseConfigured) {
    if (!projectId) return
    const records = getOfflineRecords(projectId)
    const idx = records.findIndex(r => r.id === fileId)
    if (idx >= 0) {
      records[idx].metadata = { ...records[idx].metadata, tags, autoTags }
      setOfflineRecords(projectId, records)
    }
    return
  }

  const { error } = await supabase
    .from('uploaded_files')
    .update({ tags: allTags, metadata: supabase.rpc ? undefined : undefined })
    .eq('id', fileId)

  if (error) handleError('updateFileTags', error)

  // Also update metadata JSONB to keep tags/autoTags in sync
  const record = await getFileRecord(fileId)
  if (record) {
    const { error: metaError } = await supabase
      .from('uploaded_files')
      .update({ metadata: { ...record.metadata, tags, autoTags } as Record<string, unknown>, tags: allTags })
      .eq('id', fileId)
    if (metaError) handleError('updateFileTags:metadata', metaError)
  }
}
```

Simplify — single update call:

```typescript
export async function updateFileTags(
  fileId: string,
  tags: string[],
  autoTags: string[],
  projectId?: string,
): Promise<void> {
  const allTags = [...new Set([...tags, ...autoTags])]

  if (!isSupabaseConfigured) {
    if (!projectId) return
    const records = getOfflineRecords(projectId)
    const idx = records.findIndex(r => r.id === fileId)
    if (idx >= 0) {
      records[idx].metadata = { ...records[idx].metadata, tags, autoTags }
      setOfflineRecords(projectId, records)
    }
    return
  }

  const record = await getFileRecord(fileId)
  if (!record) return

  const updatedMetadata = { ...record.metadata, tags, autoTags }
  const { error } = await supabase
    .from('uploaded_files')
    .update({
      metadata: updatedMetadata as Record<string, unknown>,
      tags: allTags,
    })
    .eq('id', fileId)

  if (error) handleError('updateFileTags', error)
}
```

- [ ] **Step 2: Add searchProjectFiles function**

Add after `updateFileTags`:

```typescript
export async function searchProjectFiles(
  projectId: string,
  query: string,
  filterTags: string[],
): Promise<UploadedFile[]> {
  if (!isSupabaseConfigured) {
    const records = getOfflineRecords(projectId)
    return records.filter(r => {
      const allTags = [...(r.metadata.tags ?? []), ...(r.metadata.autoTags ?? [])]
      const matchesQuery = !query || r.originalName.toLowerCase().includes(query.toLowerCase()) ||
        allTags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      const matchesTags = filterTags.length === 0 || filterTags.every(ft => allTags.includes(ft))
      return matchesQuery && matchesTags
    })
  }

  let dbQuery = supabase
    .from('uploaded_files')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (filterTags.length > 0) {
    dbQuery = dbQuery.contains('tags', filterTags)
  }

  if (query) {
    dbQuery = dbQuery.ilike('original_name', `%${query}%`)
  }

  const { data, error } = await dbQuery
  if (error) { handleError('searchProjectFiles', error); return [] }
  return (data ?? []).map(mapRow)
}
```

- [ ] **Step 3: Update mapRow to include tags from metadata**

The existing `mapRow` already maps `metadata` as a JSONB blob, so `tags` and `autoTags` inside metadata will be preserved. No change needed.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/services/fileMetadataService.ts
git commit -m "feat: add updateFileTags and searchProjectFiles to file metadata service"
```

---

## Task 7: Supabase Schema — uploaded_files Table

**Files:**
- Modify: `supabase/schema.sql`

- [ ] **Step 1: Add uploaded_files table**

Add before the INDEXES section (before line 136):

```sql
create table uploaded_files (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  category      text not null,
  original_name text not null,
  storage_path  text not null,
  public_url    text,
  mime_type     text not null,
  size_bytes    bigint not null,
  uploaded_by   uuid not null references users(id) on delete cascade,
  status        text not null default 'pending',
  error_message text,
  metadata      jsonb not null default '{}',
  tags          text[] not null default '{}',
  created_at    timestamptz not null default now()
);
```

- [ ] **Step 2: Add indexes**

Add in the INDEXES section:

```sql
create index idx_uf_project     on uploaded_files using btree (project_id);
create index idx_uf_tags        on uploaded_files using gin (tags);
create index idx_uf_category    on uploaded_files using btree (project_id, category);
```

- [ ] **Step 3: Add RLS policies**

Add in the RLS section (after other RLS enable statements):

```sql
alter table uploaded_files enable row level security;

create policy "uploaded_files: members can read"
  on uploaded_files for select
  using (project_id in (select project_id from project_members where user_id = auth.uid()));

create policy "uploaded_files: members can insert"
  on uploaded_files for insert
  with check (project_id in (select project_id from project_members where user_id = auth.uid()));

create policy "uploaded_files: uploader or admin can update"
  on uploaded_files for update
  using (
    uploaded_by = auth.uid()
    or project_id in (select project_id from project_members where user_id = auth.uid() and role = 'admin')
  );

create policy "uploaded_files: uploader or admin can delete"
  on uploaded_files for delete
  using (
    uploaded_by = auth.uid()
    or project_id in (select project_id from project_members where user_id = auth.uid() and role = 'admin')
  );
```

- [ ] **Step 4: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add uploaded_files table with tags column and RLS policies"
```

---

## Task 8: Context Actions — Deadline Management

**Files:**
- Modify: `src/context/ProjectDocumentContext.tsx`
- Modify: `src/context/ProjectContext.tsx`

- [ ] **Step 1: Add deadline actions to ProjectDocumentActionsType**

In `src/context/ProjectDocumentContext.tsx`, add to the `ProjectDocumentActionsType` interface:

```typescript
setEpisodeDeadline: (episodeId: string, deadline: string | undefined, assignedRole?: ProductionRole) => void
setPageDeadline: (episodeId: string, pageId: string, deadline: string | undefined, assignedRole?: ProductionRole) => void
```

- [ ] **Step 2: Implement setEpisodeDeadline**

Add the implementation inside the provider component, alongside the other action functions. Use `setProject()` (not `setProjectRaw`) for undo support:

```typescript
const setEpisodeDeadline = useCallback((episodeId: string, deadline: string | undefined, assignedRole?: ProductionRole) => {
  setProject(prev => ({
    ...prev,
    episodes: prev.episodes.map(ep =>
      ep.id === episodeId
        ? { ...ep, deadline, assignedRole: assignedRole ?? ep.assignedRole }
        : ep
    ),
  }))
}, [setProject])
```

- [ ] **Step 3: Implement setPageDeadline**

```typescript
const setPageDeadline = useCallback((episodeId: string, pageId: string, deadline: string | undefined, assignedRole?: ProductionRole) => {
  setProject(prev => ({
    ...prev,
    episodes: prev.episodes.map(ep =>
      ep.id === episodeId
        ? {
            ...ep,
            pages: ep.pages.map(pg =>
              pg.id === pageId
                ? { ...pg, deadline, assignedRole: assignedRole ?? pg.assignedRole }
                : pg
            ),
          }
        : ep
    ),
  }))
}, [setProject])
```

- [ ] **Step 4: Add to actions useMemo**

Add `setEpisodeDeadline` and `setPageDeadline` to the `actions` useMemo block (where all other actions are collected):

```typescript
const actions = useMemo(() => ({
  // ... existing actions ...
  setEpisodeDeadline,
  setPageDeadline,
}), [/* existing deps */, setEpisodeDeadline, setPageDeadline])
```

- [ ] **Step 5: Update ProjectContext.tsx re-exports**

In `src/context/ProjectContext.tsx`, ensure the `ProjectActionsType` (or equivalent re-export interface) includes the new actions. The `useProjectActions()` hook should expose them.

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add src/context/ProjectDocumentContext.tsx src/context/ProjectContext.tsx
git commit -m "feat: add setEpisodeDeadline and setPageDeadline context actions"
```

---

## Task 9: AssetSearchBar Component

**Files:**
- Create: `src/components/assets/AssetSearchBar.tsx`

- [ ] **Step 1: Create AssetSearchBar**

```typescript
import { memo, useState, useEffect, useRef } from 'react'
import { Search, X } from '../../icons'

interface AssetSearchBarProps {
  value: string
  onChange: (query: string) => void
  debounceMs?: number
}

function AssetSearchBar({ value, onChange, debounceMs = 300 }: AssetSearchBarProps) {
  const [local, setLocal] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setLocal(value)
  }, [value])

  const handleChange = (next: string) => {
    setLocal(next)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(next), debounceMs)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-ink-border bg-ink-panel focus-within:border-ink-gold/40 transition-colors">
      <Search size={13} className="text-ink-muted shrink-0" />
      <input
        type="text"
        value={local}
        onChange={e => handleChange(e.target.value)}
        placeholder="Search files, tags\u2026"
        className="flex-1 bg-transparent text-xs text-ink-text font-sans outline-none placeholder:text-ink-muted/60"
      />
      {local && (
        <button onClick={() => handleChange('')} className="p-0.5 text-ink-muted hover:text-ink-text transition-colors">
          <X size={11} />
        </button>
      )}
    </div>
  )
}

export default memo(AssetSearchBar)
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/assets/AssetSearchBar.tsx
git commit -m "feat: add AssetSearchBar component with debounced input"
```

---

## Task 10: TagChips Component

**Files:**
- Create: `src/components/assets/TagChips.tsx`

- [ ] **Step 1: Create TagChips**

```typescript
import { memo } from 'react'

interface TagChipsProps {
  tags: string[]
  activeTags: string[]
  onToggle: (tag: string) => void
}

function TagChips({ tags, activeTags, onToggle }: TagChipsProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {tags.map(tag => {
        const active = activeTags.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-sans transition-colors ${
              active
                ? 'bg-ink-gold text-ink-dark font-medium'
                : 'bg-ink-panel border border-ink-border text-ink-muted hover:text-ink-text hover:border-ink-gold/30'
            }`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}

export default memo(TagChips)
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/assets/TagChips.tsx
git commit -m "feat: add TagChips filter component"
```

---

## Task 11: TagEditor Component

**Files:**
- Create: `src/components/assets/TagEditor.tsx`

- [ ] **Step 1: Create TagEditor**

```typescript
import { memo, useState } from 'react'
import { X, Plus } from '../../icons'

interface TagEditorProps {
  tags: string[]
  autoTags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
}

function TagEditor({ tags, autoTags, onAddTag, onRemoveTag }: TagEditorProps) {
  const [adding, setAdding] = useState(false)
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const trimmed = input.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed) && !autoTags.includes(trimmed)) {
      onAddTag(trimmed)
    }
    setInput('')
    setAdding(false)
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {/* Auto-tags (read-only) */}
      {autoTags.map(tag => (
        <span
          key={`auto-${tag}`}
          className="px-2 py-0.5 rounded-full text-[10px] font-sans bg-ink-panel border border-ink-border text-ink-muted"
        >
          {tag}
        </span>
      ))}

      {/* User tags (removable) */}
      {tags.map(tag => (
        <span
          key={`user-${tag}`}
          className="px-2 py-0.5 rounded-full text-[10px] font-sans bg-ink-panel border border-ink-gold/30 text-ink-text flex items-center gap-1"
        >
          {tag}
          <button onClick={() => onRemoveTag(tag)} className="text-ink-muted hover:text-ink-text">
            <X size={8} />
          </button>
        </span>
      ))}

      {/* Add tag */}
      {adding ? (
        <input
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          onBlur={handleAdd}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setInput(''); setAdding(false) } }}
          className="px-2 py-0.5 rounded-full text-[10px] font-sans bg-ink-panel border border-ink-gold/40 text-ink-text outline-none w-20"
          placeholder="tag name"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="px-2 py-0.5 rounded-full text-[10px] font-sans border border-dashed border-ink-gold/30 text-ink-gold/70 hover:text-ink-gold hover:border-ink-gold/50 flex items-center gap-0.5 transition-colors"
        >
          <Plus size={8} /> add tag
        </button>
      )}
    </div>
  )
}

export default memo(TagEditor)
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/assets/TagEditor.tsx
git commit -m "feat: add TagEditor component for inline tag management"
```

---

## Task 12: Integrate Search + Tags into AssetLibraryDrawer

**Files:**
- Modify: `src/components/compile/AssetLibraryDrawer.tsx`

- [ ] **Step 1: Add imports and state**

Add imports at the top:

```typescript
import AssetSearchBar from '../assets/AssetSearchBar'
import TagChips from '../assets/TagChips'
import TagEditor from '../assets/TagEditor'
import { searchProjectFiles, updateFileTags } from '../../services/fileMetadataService'
import { useProject } from '../../context/ProjectContext'
```

Add state inside the component:

```typescript
const { project } = useProject()
const [searchQuery, setSearchQuery] = useState('')
const [activeTags, setActiveTags] = useState<string[]>([])
const [expandedFileId, setExpandedFileId] = useState<string | null>(null)
```

- [ ] **Step 2: Add search/filter logic**

Replace the existing `loadFiles` callback to support search:

```typescript
const loadFiles = useCallback(async () => {
  setLoading(true)
  const result = (searchQuery || activeTags.length > 0)
    ? await searchProjectFiles(projectId, searchQuery, activeTags)
    : await listProjectFiles(projectId)
  setFiles(result)
  setLoading(false)
}, [projectId, searchQuery, activeTags])
```

Update the `useEffect` dependency:

```typescript
useEffect(() => {
  if (open) void loadFiles()
}, [open, loadFiles])
```

- [ ] **Step 3: Derive all tags for chip display**

Add a `useMemo` to collect all tags across files:

```typescript
const allTags = useMemo(() => {
  const tagCounts = new Map<string, number>()
  for (const file of files) {
    const all = [...(file.metadata.tags ?? []), ...(file.metadata.autoTags ?? [])]
    for (const t of all) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
  }
  return [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
    .slice(0, 20)
}, [files])
```

- [ ] **Step 4: Add tag toggle handler**

```typescript
const handleTagToggle = (tag: string) => {
  setActiveTags(prev =>
    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
  )
}
```

- [ ] **Step 5: Add tag edit handlers**

```typescript
const handleAddTag = async (fileId: string, tag: string) => {
  const file = files.find(f => f.id === fileId)
  if (!file) return
  const newTags = [...(file.metadata.tags ?? []), tag]
  await updateFileTags(fileId, newTags, file.metadata.autoTags ?? [], projectId)
  setFiles(prev => prev.map(f =>
    f.id === fileId ? { ...f, metadata: { ...f.metadata, tags: newTags } } : f
  ))
}

const handleRemoveTag = async (fileId: string, tag: string) => {
  const file = files.find(f => f.id === fileId)
  if (!file) return
  const newTags = (file.metadata.tags ?? []).filter(t => t !== tag)
  await updateFileTags(fileId, newTags, file.metadata.autoTags ?? [], projectId)
  setFiles(prev => prev.map(f =>
    f.id === fileId ? { ...f, metadata: { ...f.metadata, tags: newTags } } : f
  ))
}
```

- [ ] **Step 6: Update JSX — add search bar and tag chips**

After the Header div, before the Content scroll div, insert:

```tsx
{/* Search & Filter */}
<div className="px-3 py-2 space-y-2 border-b border-ink-border">
  <AssetSearchBar value={searchQuery} onChange={setSearchQuery} />
  <TagChips tags={allTags} activeTags={activeTags} onToggle={handleTagToggle} />
</div>
```

- [ ] **Step 7: Update file rendering — add expandable cards with TagEditor**

In the file item rendering (the `catFiles.map(file => ...)` block), wrap the existing content and add expansion:

```tsx
<div
  key={file.id}
  className="group"
>
  <div
    onClick={() => setExpandedFileId(expandedFileId === file.id ? null : file.id)}
    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-colors cursor-pointer ${
      expandedFileId === file.id
        ? 'border-ink-gold/40 bg-ink-panel'
        : 'border-ink-border bg-ink-panel hover:border-ink-gold/20'
    }`}
  >
    {/* ... existing thumbnail/icon + name + size + action buttons ... */}
  </div>
  {expandedFileId === file.id && (
    <div className="px-2.5 pb-2">
      <TagEditor
        tags={file.metadata.tags ?? []}
        autoTags={file.metadata.autoTags ?? []}
        onAddTag={(tag) => handleAddTag(file.id, tag)}
        onRemoveTag={(tag) => handleRemoveTag(file.id, tag)}
      />
    </div>
  )}
</div>
```

- [ ] **Step 8: When searching, show flat grid instead of category groups**

Wrap the grouped rendering in a condition:

```tsx
{(searchQuery || activeTags.length > 0) ? (
  <>
    <p className="text-[10px] text-ink-muted font-sans mb-2">{files.length} file{files.length !== 1 ? 's' : ''} matching</p>
    <div className="space-y-1.5">
      {files.map(file => (
        /* same expanded file card as above */
      ))}
    </div>
  </>
) : (
  /* existing grouped rendering */
)}
```

- [ ] **Step 9: Verify build**

Run: `npm run build`
Expected: no errors

- [ ] **Step 10: Commit**

```bash
git add src/components/compile/AssetLibraryDrawer.tsx
git commit -m "feat: integrate asset search, tag filtering, and tag editing into AssetLibraryDrawer"
```

---

## Task 13: CalendarDay Component

**Files:**
- Create: `src/components/schedule/CalendarDay.tsx`

- [ ] **Step 1: Create CalendarDay**

```typescript
import { memo } from 'react'
import type { CalendarEntry, ProductionRole } from '../../types'

const ROLE_COLORS: Record<ProductionRole, string> = {
  writer: 'bg-blue-400/15 border-blue-400 text-blue-400',
  artist: 'bg-pink-400/15 border-pink-400 text-pink-400',
  letterer: 'bg-green-400/15 border-green-400 text-green-400',
  colorist: 'bg-yellow-300/15 border-yellow-300 text-yellow-300',
}

const ROLE_DOT_COLORS: Record<ProductionRole, string> = {
  writer: 'bg-blue-400',
  artist: 'bg-pink-400',
  letterer: 'bg-green-400',
  colorist: 'bg-yellow-300',
}

interface CalendarDayProps {
  day: number | null
  isToday: boolean
  isCurrentMonth: boolean
  entries: CalendarEntry[]
  mobile: boolean
  selected: boolean
  onClickDay: () => void
  onClickEntry: (entry: CalendarEntry) => void
}

function CalendarDay({ day, isToday, isCurrentMonth, entries, mobile, selected, onClickDay, onClickEntry }: CalendarDayProps) {
  if (day === null) {
    return <div className="min-h-[44px] bg-ink-dark/30" />
  }

  const dimmed = !isCurrentMonth

  return (
    <div
      onClick={onClickDay}
      className={`min-h-[44px] p-1.5 cursor-pointer transition-colors ${
        selected ? 'bg-ink-panel' : 'bg-ink-dark hover:bg-ink-panel/50'
      } ${isToday ? 'ring-1 ring-purple-400/60' : ''}`}
    >
      <span className={`text-[11px] font-sans ${
        isToday
          ? 'bg-purple-400 text-ink-dark px-1.5 py-0.5 rounded-full font-semibold'
          : dimmed ? 'text-ink-muted/40' : 'text-ink-muted'
      }`}>
        {day}
      </span>

      {mobile ? (
        /* Dots on mobile */
        entries.length > 0 && (
          <div className="flex justify-center gap-0.5 mt-1">
            {entries.slice(0, 3).map(entry => (
              <div
                key={entry.id}
                className={`w-[5px] h-[5px] rounded-full ${ROLE_DOT_COLORS[entry.assignedRole ?? 'writer']}`}
              />
            ))}
            {entries.length > 3 && (
              <span className="text-[8px] text-ink-muted">+{entries.length - 3}</span>
            )}
          </div>
        )
      ) : (
        /* Bars on desktop */
        <div className="mt-1 space-y-0.5">
          {entries.slice(0, 3).map(entry => {
            const colors = ROLE_COLORS[entry.assignedRole ?? 'writer']
            return (
              <button
                key={entry.id}
                onClick={e => { e.stopPropagation(); onClickEntry(entry) }}
                className={`block w-full text-left px-1.5 py-0.5 rounded-r text-[10px] font-sans font-medium border-l-2 truncate transition-opacity ${colors} ${
                  entry.isOverdue ? 'opacity-50 line-through' : ''
                }`}
              >
                {entry.label}
              </button>
            )
          })}
          {entries.length > 3 && (
            <span className="text-[9px] text-ink-muted pl-1.5">+{entries.length - 3} more</span>
          )}
        </div>
      )}
    </div>
  )
}

export default memo(CalendarDay)
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/schedule/CalendarDay.tsx
git commit -m "feat: add CalendarDay component with desktop bars and mobile dots"
```

---

## Task 14: DeadlinePopover Component

**Files:**
- Create: `src/components/schedule/DeadlinePopover.tsx`

- [ ] **Step 1: Create DeadlinePopover**

```typescript
import { memo, useState } from 'react'
import { X, Trash2 } from '../../icons'
import type { CalendarEntry, ProductionRole, Episode } from '../../types'

interface DeadlinePopoverProps {
  entry: CalendarEntry | null
  date: string
  episodes: Episode[]
  onSave: (episodeId: string, pageId: string | undefined, deadline: string, role: ProductionRole) => void
  onDelete: (episodeId: string, pageId: string | undefined) => void
  onClose: () => void
}

const ROLES: ProductionRole[] = ['writer', 'artist', 'letterer', 'colorist']

function DeadlinePopover({ entry, date, episodes, onSave, onDelete, onClose }: DeadlinePopoverProps) {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(entry?.episodeId ?? episodes[0]?.id ?? '')
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>(entry?.pageId)
  const [deadlineDate, setDeadlineDate] = useState(entry?.date ?? date)
  const [role, setRole] = useState<ProductionRole>(entry?.assignedRole ?? 'artist')

  const selectedEpisode = episodes.find(e => e.id === selectedEpisodeId)

  const handleSave = () => {
    if (!selectedEpisodeId) return
    onSave(selectedEpisodeId, selectedPageId, deadlineDate, role)
    onClose()
  }

  return (
    <div className="absolute z-50 w-64 bg-ink-dark border border-ink-border rounded-lg shadow-2xl p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-sans font-medium text-ink-text">
          {entry ? 'Edit Deadline' : 'New Deadline'}
        </span>
        <button onClick={onClose} className="text-ink-muted hover:text-ink-text">
          <X size={12} />
        </button>
      </div>

      {/* Date */}
      <div>
        <label className="text-[10px] uppercase tracking-wider text-ink-muted font-sans">Date</label>
        <input
          type="date"
          value={deadlineDate}
          onChange={e => setDeadlineDate(e.target.value)}
          className="w-full mt-1 px-2 py-1.5 rounded border border-ink-border bg-ink-panel text-xs text-ink-text font-sans outline-none focus:border-ink-gold/40"
        />
      </div>

      {/* Episode select */}
      {!entry && (
        <div>
          <label className="text-[10px] uppercase tracking-wider text-ink-muted font-sans">Episode</label>
          <select
            value={selectedEpisodeId}
            onChange={e => { setSelectedEpisodeId(e.target.value); setSelectedPageId(undefined) }}
            className="w-full mt-1 px-2 py-1.5 rounded border border-ink-border bg-ink-panel text-xs text-ink-text font-sans outline-none focus:border-ink-gold/40"
          >
            {episodes.map(ep => (
              <option key={ep.id} value={ep.id}>Ep {ep.number}: {ep.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* Page select (optional) */}
      {!entry && selectedEpisode && selectedEpisode.pages.length > 0 && (
        <div>
          <label className="text-[10px] uppercase tracking-wider text-ink-muted font-sans">Page (optional)</label>
          <select
            value={selectedPageId ?? ''}
            onChange={e => setSelectedPageId(e.target.value || undefined)}
            className="w-full mt-1 px-2 py-1.5 rounded border border-ink-border bg-ink-panel text-xs text-ink-text font-sans outline-none focus:border-ink-gold/40"
          >
            <option value="">Episode-level deadline</option>
            {selectedEpisode.pages.map(pg => (
              <option key={pg.id} value={pg.id}>Page {pg.number}</option>
            ))}
          </select>
        </div>
      )}

      {/* Role */}
      <div>
        <label className="text-[10px] uppercase tracking-wider text-ink-muted font-sans">Assigned Role</label>
        <div className="flex gap-1.5 mt-1">
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-2 py-1 rounded text-[10px] font-sans capitalize transition-colors ${
                role === r
                  ? 'bg-ink-gold text-ink-dark font-medium'
                  : 'bg-ink-panel border border-ink-border text-ink-muted hover:text-ink-text'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Completion info (edit mode) */}
      {entry && (
        <div className="text-[10px] text-ink-muted font-sans">
          {entry.completionPct}% complete{entry.isOverdue ? ' · overdue' : ''}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        {entry ? (
          <button
            onClick={() => { onDelete(entry.episodeId, entry.pageId); onClose() }}
            className="flex items-center gap-1 text-[10px] font-sans text-red-400 hover:text-red-300"
          >
            <Trash2 size={10} /> Remove
          </button>
        ) : <div />}
        <button
          onClick={handleSave}
          className="px-3 py-1.5 rounded text-[10px] font-sans font-medium bg-ink-gold text-ink-dark hover:bg-ink-gold/90 transition-colors"
        >
          {entry ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  )
}

export default memo(DeadlinePopover)
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/schedule/DeadlinePopover.tsx
git commit -m "feat: add DeadlinePopover for creating and editing deadlines"
```

---

## Task 15: CalendarView Component

**Files:**
- Create: `src/components/schedule/CalendarView.tsx`

- [ ] **Step 1: Create CalendarView**

```typescript
import { memo, useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from '../../icons'
import { useProject } from '../../context/ProjectContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { getCalendarEntries } from '../../domain/scheduleSelectors'
import CalendarDay from './CalendarDay'
import DeadlinePopover from './DeadlinePopover'
import type { CalendarEntry, ProductionRole } from '../../types'

const ROLE_DOT: Record<ProductionRole, string> = {
  writer: 'bg-blue-400',
  artist: 'bg-pink-400',
  letterer: 'bg-green-400',
  colorist: 'bg-yellow-300',
}

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const ALL_ROLES: ProductionRole[] = ['writer', 'artist', 'letterer', 'colorist']

function CalendarView() {
  const { project, setEpisodeDeadline, setPageDeadline } = useProject()
  const bp = useBreakpoint()
  const mobile = bp === 'mobile'

  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())
  const [activeRoles, setActiveRoles] = useState<Set<ProductionRole>>(new Set(ALL_ROLES))
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [popoverEntry, setPopoverEntry] = useState<CalendarEntry | null>(null)
  const [popoverDate, setPopoverDate] = useState<string | null>(null)

  const entries = useMemo(() => getCalendarEntries(project), [project])

  const filteredEntries = useMemo(() =>
    entries.filter(e => !e.assignedRole || activeRoles.has(e.assignedRole)),
    [entries, activeRoles]
  )

  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>()
    for (const e of filteredEntries) {
      const arr = map.get(e.date) ?? []
      arr.push(e)
      map.set(e.date, arr)
    }
    return map
  }, [filteredEntries])

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    // Monday = 0
    let startDow = firstDay.getDay() - 1
    if (startDow < 0) startDow = 6

    const days: { day: number | null; dateStr: string; isCurrentMonth: boolean }[] = []

    // Previous month fill
    const prevLast = new Date(year, month, 0).getDate()
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevLast - i
      const m = month === 0 ? 12 : month
      const y = month === 0 ? year - 1 : year
      days.push({ day: d, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, isCurrentMonth: false })
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ day: d, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, isCurrentMonth: true })
    }

    // Next month fill
    const remaining = 7 - (days.length % 7)
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const m = month + 2 > 12 ? 1 : month + 2
        const y = month + 2 > 12 ? year + 1 : year
        days.push({ day: d, dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, isCurrentMonth: false })
      }
    }

    return days
  }, [year, month])

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const toggleRole = (role: ProductionRole) => {
    setActiveRoles(prev => {
      const next = new Set(prev)
      if (next.has(role)) next.delete(role)
      else next.add(role)
      return next
    })
  }

  const handleSaveDeadline = useCallback((episodeId: string, pageId: string | undefined, deadline: string, role: ProductionRole) => {
    if (pageId) {
      setPageDeadline(episodeId, pageId, deadline, role)
    } else {
      setEpisodeDeadline(episodeId, deadline, role)
    }
    setPopoverDate(null)
    setPopoverEntry(null)
  }, [setEpisodeDeadline, setPageDeadline])

  const handleDeleteDeadline = useCallback((episodeId: string, pageId: string | undefined) => {
    if (pageId) {
      setPageDeadline(episodeId, pageId, undefined)
    } else {
      setEpisodeDeadline(episodeId, undefined)
    }
  }, [setEpisodeDeadline, setPageDeadline])

  // Overdue count
  const overdueCount = filteredEntries.filter(e => e.isOverdue).length

  // Selected day entries (mobile)
  const selectedDayEntries = selectedDay ? (entriesByDate.get(selectedDay) ?? []) : []

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="text-ink-muted hover:text-ink-text transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-ink-light font-serif text-base font-medium min-w-[140px] text-center">
            {monthLabel}
          </span>
          <button onClick={nextMonth} className="text-ink-muted hover:text-ink-text transition-colors">
            <ChevronRight size={16} />
          </button>
          {overdueCount > 0 && (
            <span className="text-[10px] font-sans text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
              {overdueCount} overdue
            </span>
          )}
        </div>

        {/* Role filters */}
        <div className="flex gap-1.5">
          {ALL_ROLES.map(role => (
            <button
              key={role}
              onClick={() => toggleRole(role)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-sans capitalize transition-colors ${
                activeRoles.has(role)
                  ? 'bg-ink-panel border border-ink-border text-ink-text'
                  : 'bg-transparent border border-transparent text-ink-muted/40'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${ROLE_DOT[role]}`} />
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-ink-border">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center py-1.5 text-[10px] text-ink-muted font-sans">
            {mobile ? d[0] : d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 border-l border-ink-border overflow-y-auto">
        {calendarDays.map(({ day, dateStr, isCurrentMonth }, i) => (
          <div key={i} className="border-r border-b border-ink-border relative">
            <CalendarDay
              day={day}
              isToday={dateStr === todayStr}
              isCurrentMonth={isCurrentMonth}
              entries={entriesByDate.get(dateStr) ?? []}
              mobile={mobile}
              selected={selectedDay === dateStr}
              onClickDay={() => {
                setSelectedDay(dateStr)
                if (!mobile && !(entriesByDate.get(dateStr)?.length)) {
                  setPopoverDate(dateStr)
                  setPopoverEntry(null)
                }
              }}
              onClickEntry={entry => {
                setPopoverEntry(entry)
                setPopoverDate(null)
              }}
            />
            {/* Popover for this day */}
            {(popoverDate === dateStr || (popoverEntry && popoverEntry.date === dateStr)) && (
              <DeadlinePopover
                entry={popoverEntry}
                date={dateStr}
                episodes={project.episodes}
                onSave={handleSaveDeadline}
                onDelete={handleDeleteDeadline}
                onClose={() => { setPopoverDate(null); setPopoverEntry(null) }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile: selected day entries list */}
      {mobile && selectedDay && selectedDayEntries.length > 0 && (
        <div className="border-t border-ink-border px-3 py-2 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-ink-muted font-sans">
            {new Date(selectedDay + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
          {selectedDayEntries.map(entry => (
            <button
              key={entry.id}
              onClick={() => { setPopoverEntry(entry); setPopoverDate(null) }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-ink-panel border border-ink-border hover:border-ink-gold/20 transition-colors"
            >
              <div className={`w-0.5 h-7 rounded ${ROLE_DOT[entry.assignedRole ?? 'writer']}`} />
              <div className="text-left">
                <p className="text-xs text-ink-text font-sans">{entry.label}</p>
                <p className="text-[10px] text-ink-muted font-sans capitalize">
                  {entry.assignedRole ?? 'unassigned'} · {entry.completionPct}% complete
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(CalendarView)
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/schedule/CalendarView.tsx
git commit -m "feat: add CalendarView month grid with role filters and mobile support"
```

---

## Task 16: Integrate Calendar Tab into ProductionTracker

**Files:**
- Modify: `src/views/ProductionTracker.tsx`

- [ ] **Step 1: Add import**

```typescript
import CalendarView from '../components/schedule/CalendarView'
```

- [ ] **Step 2: Extend TrackerTab type**

```typescript
type TrackerTab = 'dashboard' | 'heatmap' | 'workload' | 'calendar'
```

- [ ] **Step 3: Add Calendar tab button**

In the tab buttons array, add:

```typescript
{ id: 'calendar' as TrackerTab, label: 'Calendar' },
```

- [ ] **Step 4: Add Calendar tab rendering**

After the existing tab content conditional rendering (after the workload section), add:

```tsx
{tab === 'calendar' && <CalendarView />}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/views/ProductionTracker.tsx
git commit -m "feat: add Calendar tab to ProductionTracker view"
```

---

## Task 17: Final Build Verification & Docs Update

**Files:**
- Modify: `PLAN.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Full build check**

Run: `npm run build`
Expected: zero errors, zero warnings

- [ ] **Step 2: Start dev server and test**

Run: `npm run dev`

Test checklist:
1. Open Asset Library drawer → search bar and tag chips visible
2. Type in search → results filter by filename
3. Click a tag chip → results filter by tag
4. Click a file → expands to show tags + "add tag" button
5. Add a user tag → tag appears on the file
6. Remove a user tag → tag disappears
7. Navigate to Production Tracker → "Calendar" tab visible
8. Click Calendar tab → month grid renders with today highlighted
9. Click an empty day → deadline popover opens
10. Create a deadline (pick episode, role) → entry appears on calendar
11. Click the entry → edit popover with completion %
12. Delete the deadline → entry removed
13. Undo (Ctrl+Z) → deadline reappears
14. Toggle role filters → entries show/hide by role
15. Navigate months → grid updates
16. Test on mobile viewport → dots instead of bars, day list below grid

- [ ] **Step 3: Update CLAUDE.md**

Update the "Current Status" section:

```markdown
## Current Status

MVP complete. Phases 1–5 and Phase 2 enrichment complete. Phase 3 (Performance, Optimization & Polish) complete. Phase 4 (Asset Tagging & Search + Timeline/Scheduling) complete.
```

Add to Key Files:
```markdown
- `src/domain/tagDerivation.ts` — Auto-tag derivation from file metadata + project state
- `src/domain/scheduleSelectors.ts` — Calendar entry selector from project deadlines
```

- [ ] **Step 4: Update PLAN.md**

Add Phase 4 completion section documenting what was built.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md PLAN.md
git commit -m "docs: update CLAUDE.md and PLAN.md for Phase 4 completion"
```

- [ ] **Step 6: Final commit — Phase 4 complete**

```bash
git add -A
git commit -m "Phase 4 complete: asset tagging/search, calendar scheduling"
```
