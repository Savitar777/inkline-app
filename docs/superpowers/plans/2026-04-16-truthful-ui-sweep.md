# Truthful UI Sweep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove unsupported generic-attachment teaser UI from collaboration and ensure the app only advertises the working draft-artwork upload flow.

**Architecture:** Keep the change limited to collaboration presentation components and one focused regression suite. Use Vitest plus `react-dom/server` static rendering for UI-copy assertions so the sweep stays lightweight and does not require browser test infrastructure.

**Tech Stack:** React 19, TypeScript, Vitest, `react-dom/server`, Vite, ESLint

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| NEW | `src/components/collaboration/MessageInput.test.tsx` | Regression test: composer no longer advertises unsupported generic attachments |
| NEW | `src/components/collaboration/UploadModal.test.tsx` | Regression test: upload modal copy is explicit about draft artwork |
| MOD | `src/components/collaboration/MessageInput.tsx` | Remove misleading paperclip teaser and keep only supported upload action |
| MOD | `src/views/Collaboration.tsx` | Narrow `MessageInput` usage to the supported composer API |
| MOD | `src/components/collaboration/UploadModal.tsx` | Clarify draft-artwork-specific labels and button copy |

---

### Task 1: Remove the Unsupported Composer Attachment Teaser

**Files:**
- Create: `src/components/collaboration/MessageInput.test.tsx`
- Modify: `src/components/collaboration/MessageInput.tsx`
- Modify: `src/views/Collaboration.tsx`

- [ ] **Step 1: Write the failing regression test**

Create `src/components/collaboration/MessageInput.test.tsx` with this exact content:

```tsx
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import MessageInput from './MessageInput'

describe('MessageInput', () => {
  it('only advertises the supported draft artwork action', () => {
    const markup = renderToStaticMarkup(createElement(MessageInput as never, {
      inputText: '',
      sending: false,
      showUpload: false,
      onInputChange: () => {},
      onSend: () => {},
      onToggleUpload: () => {},
      onFileSelect: () => {},
      onBroadcastTyping: () => {},
    }))

    expect(markup).toContain('Upload draft artwork')
    expect(markup).not.toContain('Attach file (coming soon)')
    expect(markup).not.toContain('General file attachments coming soon')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- src/components/collaboration/MessageInput.test.tsx
```

Expected: FAIL because the rendered markup still contains `Attach file (coming soon)` and `General file attachments coming soon`.

- [ ] **Step 3: Implement the minimal composer cleanup**

Replace `src/components/collaboration/MessageInput.tsx` with this exact content:

```tsx
import { memo } from 'react'
import { Send, Image } from '../../icons'

interface MessageInputProps {
  inputText: string
  sending: boolean
  showUpload: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onToggleUpload: () => void
  onBroadcastTyping: () => void
}

function MessageInput({
  inputText,
  sending,
  showUpload,
  onInputChange,
  onSend,
  onToggleUpload,
  onBroadcastTyping,
}: MessageInputProps) {
  const artworkActionLabel = showUpload ? 'Hide draft artwork upload' : 'Upload draft artwork'

  return (
    <div className="px-6 py-3 border-t border-ink-border bg-ink-dark/50">
      <div className="flex items-center gap-3 bg-ink-panel rounded-lg px-4 py-2.5 border border-ink-border">
        <button
          type="button"
          aria-label={artworkActionLabel}
          title={artworkActionLabel}
          onClick={onToggleUpload}
          className={`transition-colors ${showUpload ? 'text-ink-gold' : 'text-ink-muted hover:text-ink-text'}`}
        >
          <Image size={16} />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={e => {
            onInputChange(e.target.value)
            onBroadcastTyping()
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend()
            }
          }}
          className="flex-1 bg-transparent text-sm font-sans text-ink-light placeholder:text-ink-muted outline-none"
        />
        <button
          type="button"
          aria-label="Send message"
          onClick={onSend}
          disabled={sending || !inputText.trim()}
          className="w-7 h-7 rounded-md bg-ink-gold flex items-center justify-center hover:bg-ink-gold-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={13} className="text-ink-black" />
        </button>
      </div>
    </div>
  )
}

export default memo(MessageInput)
```

Update the `MessageInput` usage in `src/views/Collaboration.tsx` to remove the now-deleted prop:

```tsx
            <MessageInput
              inputText={inputText}
              sending={sending}
              showUpload={showUpload}
              onInputChange={setInputText}
              onSend={handleSend}
              onToggleUpload={() => setShowUpload(v => !v)}
              onBroadcastTyping={broadcastTyping}
            />
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run:

```bash
npm test -- src/components/collaboration/MessageInput.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/collaboration/MessageInput.test.tsx src/components/collaboration/MessageInput.tsx src/views/Collaboration.tsx
git commit -m "refactor: remove unsupported collaboration attachment teaser"
```

---

### Task 2: Make the Supported Upload Flow Explicitly About Draft Artwork

**Files:**
- Create: `src/components/collaboration/UploadModal.test.tsx`
- Modify: `src/components/collaboration/UploadModal.tsx`

- [ ] **Step 1: Write the failing regression test**

Create `src/components/collaboration/UploadModal.test.tsx` with this exact content:

```tsx
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import UploadModal from './UploadModal'

const panel = {
  id: 'panel-1',
  number: 1,
  shot: '',
  description: '',
  content: [],
  pageId: 'page-1',
  pageNumber: 3,
}

describe('UploadModal', () => {
  it('uses draft-artwork-specific copy in both empty and preview states', () => {
    const emptyMarkup = renderToStaticMarkup(createElement(UploadModal, {
      dragOver: false,
      uploadPreview: null,
      uploading: false,
      selectedPanelId: '',
      allPanels: [panel],
      isSupabaseConfigured: true,
      onDragOver: () => {},
      onDragLeave: () => {},
      onDrop: () => {},
      onSelectPanel: () => {},
      onAttachUpload: () => {},
      onCancel: () => {},
      onClickSelect: () => {},
    }))

    const previewMarkup = renderToStaticMarkup(createElement(UploadModal, {
      dragOver: false,
      uploadPreview: 'data:image/png;base64,abc',
      uploading: false,
      selectedPanelId: '',
      allPanels: [panel],
      isSupabaseConfigured: true,
      onDragOver: () => {},
      onDragLeave: () => {},
      onDrop: () => {},
      onSelectPanel: () => {},
      onAttachUpload: () => {},
      onCancel: () => {},
      onClickSelect: () => {},
    }))

    expect(emptyMarkup).toContain('Drop draft artwork here or click to select')
    expect(previewMarkup).toContain('Link draft to panel...')
    expect(previewMarkup).toContain('Send Draft Artwork')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- src/components/collaboration/UploadModal.test.tsx
```

Expected: FAIL because the current UI still renders `Drop artwork here or click to select`, `Link to panel...`, and `Send as Draft`.

- [ ] **Step 3: Implement the minimal copy update**

Replace `src/components/collaboration/UploadModal.tsx` with this exact content:

```tsx
import { memo } from 'react'
import type { DragEvent } from 'react'
import FileUploadZone from '../FileUploadZone'
import type { Panel } from '../../types'

interface PanelWithPage extends Panel {
  pageNumber: number
  pageId: string
}

interface UploadModalProps {
  dragOver: boolean
  uploadPreview: string | null
  uploading: boolean
  selectedPanelId: string
  allPanels: PanelWithPage[]
  isSupabaseConfigured: boolean
  onDragOver: (e: DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onDrop: (e: DragEvent<HTMLDivElement>) => void
  onSelectPanel: (panelId: string) => void
  onAttachUpload: () => void
  onCancel: () => void
  onClickSelect: () => void
}

function UploadModal({
  uploadPreview,
  uploading,
  selectedPanelId,
  allPanels,
  isSupabaseConfigured,
  onSelectPanel,
  onAttachUpload,
  onCancel,
  onClickSelect,
}: UploadModalProps) {
  return (
    <div className="px-6 pt-3 border-t border-ink-border bg-ink-dark/50">
      {uploadPreview ? (
        <div className="rounded-lg border-2 border-dashed border-ink-border bg-ink-panel p-3 space-y-2">
          <img src={uploadPreview} alt="Preview" className="w-full max-h-48 object-contain rounded" />
          {allPanels.length > 0 && (
            <select
              value={selectedPanelId}
              onChange={e => onSelectPanel(e.target.value)}
              className="w-full bg-ink-panel border border-ink-border rounded px-2.5 py-1.5 text-xs font-sans text-ink-text outline-none focus:border-ink-gold/50"
            >
              <option value="">Link draft to panel...</option>
              {allPanels.map(p => (
                <option key={p.id} value={p.id}>P{p.pageNumber} / Panel {p.number}</option>
              ))}
            </select>
          )}
          <div className="flex gap-2">
            <button
              onClick={onAttachUpload}
              disabled={uploading || (isSupabaseConfigured && !selectedPanelId)}
              className="flex-1 py-1.5 rounded text-xs font-sans bg-ink-gold text-ink-black font-semibold hover:bg-ink-gold-dim transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading Draft Artwork...' : 'Send Draft Artwork'}
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1.5 rounded text-xs font-sans text-ink-muted hover:text-ink-text transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <FileUploadZone
          accept="panel-assets"
          onFiles={() => onClickSelect()}
          label="Drop draft artwork here or click to select"
        />
      )}
    </div>
  )
}

export default memo(UploadModal)
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run:

```bash
npm test -- src/components/collaboration/UploadModal.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/collaboration/UploadModal.test.tsx src/components/collaboration/UploadModal.tsx
git commit -m "refactor: clarify draft artwork upload copy"
```

---

### Task 3: Final Truthful-UI Sweep and Full Verification

**Files:**
- Modify: `src/components/collaboration/MessageInput.tsx`
- Modify: `src/components/collaboration/UploadModal.tsx`
- Test: `src/components/collaboration/MessageInput.test.tsx`
- Test: `src/components/collaboration/UploadModal.test.tsx`

- [ ] **Step 1: Run the teaser-copy sweep**

Run:

```bash
rg -n "coming soon|Coming soon" src/components src/views
```

Expected: no matches.

- [ ] **Step 2: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS with all existing smoke tests plus the two new collaboration regression tests green.

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS with exit code 0.

- [ ] **Step 4: Run the production build**

Run:

```bash
npm run build
```

Expected: PASS with exit code 0. The existing Vite large-chunk warning may still appear; that warning is acceptable for this task as long as the build completes successfully.

- [ ] **Step 5: Commit the final verified sweep**

```bash
git add src/components/collaboration/MessageInput.tsx src/components/collaboration/UploadModal.tsx src/components/collaboration/MessageInput.test.tsx src/components/collaboration/UploadModal.test.tsx src/views/Collaboration.tsx
git commit -m "test: lock in truthful collaboration upload ui"
```

---

## Self-Review

### Spec coverage

- Collaboration composer cleanup: covered by Task 1.
- Supported artwork flow preservation: covered by Task 2.
- Truthful-UI sweep for explicit teaser copy: covered by Task 3.
- Regression coverage plus `test` / `lint` / `build`: covered by Tasks 1–3.

### Placeholder scan

- No `TODO`, `TBD`, or deferred implementation text remains in the plan.
- All code steps include exact code and all verification steps include exact commands.

### Type consistency

- `MessageInput` props in Task 1 remove `onFileSelect` consistently from both the component and its `Collaboration` callsite.
- `UploadModal` prop names and behavior match the current component API.
- All test commands use the current `npm test` Vitest script already present in `package.json`.
