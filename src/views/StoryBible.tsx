import { useCallback, useMemo, useState } from 'react'
import { useProject } from '../context/ProjectContext'
import { BookOpen, ChevronRight, Globe, MapPin, Plus, ScrollList, Trash2, X } from '../icons'
import type { Location, StoryArc, StoryArcStatus, StoryBible as StoryBibleType, TimelineEvent, WorldRule } from '../types'
import { useBreakpoint } from '../hooks/useBreakpoint'

const genId = () => crypto.randomUUID()

type Tab = 'arcs' | 'locations' | 'rules' | 'timeline'

const tabLabels: Record<Tab, string> = {
  arcs: 'Story Arcs',
  locations: 'Locations',
  rules: 'World Rules',
  timeline: 'Timeline',
}

const tabIcons: Record<Tab, typeof BookOpen> = {
  arcs: BookOpen,
  locations: MapPin,
  rules: Globe,
  timeline: ScrollList,
}

const arcStatusColors: Record<StoryArcStatus, string> = {
  planning: 'bg-ink-muted/20 text-ink-muted',
  active: 'bg-ink-gold/20 text-ink-gold',
  completed: 'bg-status-approved/20 text-status-approved',
}

function EmptyState({ tab, onAdd }: { tab: Tab; onAdd: () => void }) {
  const messages: Record<Tab, { title: string; desc: string }> = {
    arcs: { title: 'No story arcs yet', desc: 'Plan your narrative arcs — define their scope across episodes and link characters.' },
    locations: { title: 'No locations yet', desc: 'Document the settings in your story with descriptions and reference images.' },
    rules: { title: 'No world rules yet', desc: 'Record the rules of your story universe — magic systems, social hierarchies, technology.' },
    timeline: { title: 'No timeline events yet', desc: 'Track the chronological ordering of events across your episodes.' },
  }
  const msg = messages[tab]
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-xl bg-ink-panel p-4">
        <BookOpen size={32} className="text-ink-muted" />
      </div>
      <h3 className="text-lg font-serif text-ink-light mb-2">{msg.title}</h3>
      <p className="text-sm text-ink-muted max-w-sm mb-6">{msg.desc}</p>
      <button
        onClick={onAdd}
        className="ink-focus flex items-center gap-2 rounded-lg bg-ink-gold px-4 py-2 text-sm font-medium text-ink-black transition-colors hover:bg-ink-gold/90"
      >
        <Plus size={14} /> Add {tabLabels[tab].replace(/s$/, '')}
      </button>
    </div>
  )
}

/* ─── Arc Editor ─── */

function ArcEditor({ arc, episodes, characters, onUpdate, onDelete }: {
  arc: StoryArc
  episodes: { id: string; number: number; title: string }[]
  characters: { id: string; name: string; color: string }[]
  onUpdate: (updates: Partial<StoryArc>) => void
  onDelete: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <input
          value={arc.title}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Arc title…"
          className="ink-focus flex-1 rounded-md border border-ink-border bg-transparent px-3 py-2 text-ink-light font-serif text-lg"
        />
        <button onClick={onDelete} aria-label="Delete arc" className="ink-focus rounded p-2 text-ink-muted hover:text-red-400 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs text-ink-muted">Status</label>
        <select
          value={arc.status}
          onChange={e => onUpdate({ status: e.target.value as StoryArcStatus })}
          className="ink-focus rounded-md border border-ink-border bg-ink-panel px-3 py-1.5 text-sm text-ink-light"
        >
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${arcStatusColors[arc.status]}`}>
          {arc.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-ink-muted mb-1 block">Episode Start</label>
          <input
            type="number"
            min={1}
            value={arc.episodeStart}
            onChange={e => onUpdate({ episodeStart: Number(e.target.value) })}
            className="ink-focus w-full rounded-md border border-ink-border bg-transparent px-3 py-1.5 text-sm text-ink-light"
          />
        </div>
        <div>
          <label className="text-xs text-ink-muted mb-1 block">Episode End</label>
          <input
            type="number"
            min={arc.episodeStart}
            value={arc.episodeEnd}
            onChange={e => onUpdate({ episodeEnd: Number(e.target.value) })}
            className="ink-focus w-full rounded-md border border-ink-border bg-transparent px-3 py-1.5 text-sm text-ink-light"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-ink-muted mb-1 block">Description</label>
        <textarea
          value={arc.description}
          onChange={e => onUpdate({ description: e.target.value })}
          placeholder="Describe this story arc…"
          rows={4}
          className="ink-focus w-full rounded-md border border-ink-border bg-transparent px-3 py-2 text-sm text-ink-light resize-y"
        />
      </div>

      <div>
        <label className="text-xs text-ink-muted mb-2 block">Linked Characters</label>
        <div className="flex flex-wrap gap-2">
          {characters.map(char => {
            const linked = arc.linkedCharacterIds.includes(char.id)
            return (
              <button
                key={char.id}
                onClick={() => {
                  const next = linked
                    ? arc.linkedCharacterIds.filter(id => id !== char.id)
                    : [...arc.linkedCharacterIds, char.id]
                  onUpdate({ linkedCharacterIds: next })
                }}
                className={`ink-focus rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
                  linked
                    ? 'border-ink-gold/40 bg-ink-gold/10 text-ink-gold'
                    : 'border-ink-border text-ink-muted hover:border-ink-gold/30 hover:text-ink-light'
                }`}
              >
                <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: char.color }} />
                {char.name}
              </button>
            )
          })}
          {characters.length === 0 && (
            <p className="text-xs text-ink-muted">Add characters in the Character Bible to link them here.</p>
          )}
        </div>
      </div>

      {episodes.length > 0 && (
        <div>
          <label className="text-xs text-ink-muted mb-1 block">Covered Episodes</label>
          <div className="flex flex-wrap gap-1.5">
            {episodes
              .filter(ep => ep.number >= arc.episodeStart && ep.number <= arc.episodeEnd)
              .map(ep => (
                <span key={ep.id} className="rounded bg-ink-panel px-2 py-0.5 text-xs text-ink-light">
                  Ep {ep.number}: {ep.title}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Location Editor ─── */

function LocationEditor({ location, onUpdate, onDelete }: {
  location: Location
  onUpdate: (updates: Partial<Location>) => void
  onDelete: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <input
          value={location.name}
          onChange={e => onUpdate({ name: e.target.value })}
          placeholder="Location name…"
          className="ink-focus flex-1 rounded-md border border-ink-border bg-transparent px-3 py-2 text-ink-light font-serif text-lg"
        />
        <button onClick={onDelete} aria-label="Delete location" className="ink-focus rounded p-2 text-ink-muted hover:text-red-400 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
      <div>
        <label className="text-xs text-ink-muted mb-1 block">Description</label>
        <textarea
          value={location.description}
          onChange={e => onUpdate({ description: e.target.value })}
          placeholder="Describe this location…"
          rows={5}
          className="ink-focus w-full rounded-md border border-ink-border bg-transparent px-3 py-2 text-sm text-ink-light resize-y"
        />
      </div>
    </div>
  )
}

/* ─── World Rule Editor ─── */

function WorldRuleEditor({ rule, onUpdate, onDelete }: {
  rule: WorldRule
  onUpdate: (updates: Partial<WorldRule>) => void
  onDelete: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <input
          value={rule.title}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Rule title…"
          className="ink-focus flex-1 rounded-md border border-ink-border bg-transparent px-3 py-2 text-ink-light font-serif text-lg"
        />
        <button onClick={onDelete} aria-label="Delete rule" className="ink-focus rounded p-2 text-ink-muted hover:text-red-400 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
      <div>
        <label className="text-xs text-ink-muted mb-1 block">Description</label>
        <textarea
          value={rule.description}
          onChange={e => onUpdate({ description: e.target.value })}
          placeholder="Describe this world rule…"
          rows={5}
          className="ink-focus w-full rounded-md border border-ink-border bg-transparent px-3 py-2 text-sm text-ink-light resize-y"
        />
      </div>
    </div>
  )
}

/* ─── Timeline Event Editor ─── */

function TimelineEventEditor({ event, episodes, onUpdate, onDelete }: {
  event: TimelineEvent
  episodes: { id: string; number: number; title: string }[]
  onUpdate: (updates: Partial<TimelineEvent>) => void
  onDelete: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <input
          value={event.title}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Event title…"
          className="ink-focus flex-1 rounded-md border border-ink-border bg-transparent px-3 py-2 text-ink-light font-serif text-lg"
        />
        <button onClick={onDelete} aria-label="Delete event" className="ink-focus rounded p-2 text-ink-muted hover:text-red-400 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
      <div>
        <label className="text-xs text-ink-muted mb-1 block">Episode</label>
        <select
          value={event.episodeId}
          onChange={e => onUpdate({ episodeId: e.target.value })}
          className="ink-focus w-full rounded-md border border-ink-border bg-ink-panel px-3 py-1.5 text-sm text-ink-light"
        >
          <option value="">— Select episode —</option>
          {episodes.map(ep => (
            <option key={ep.id} value={ep.id}>Ep {ep.number}: {ep.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-ink-muted mb-1 block">Description</label>
        <textarea
          value={event.description}
          onChange={e => onUpdate({ description: e.target.value })}
          placeholder="What happens in this event…"
          rows={4}
          className="ink-focus w-full rounded-md border border-ink-border bg-transparent px-3 py-2 text-sm text-ink-light resize-y"
        />
      </div>
    </div>
  )
}

/* ─── Main View ─── */

export default function StoryBible() {
  const { project, updateStoryBible } = useProject()
  const bible = useMemo<StoryBibleType>(() => project.storyBible ?? { arcs: [], locations: [], worldRules: [], timeline: [] }, [project.storyBible])
  const [activeTab, setActiveTab] = useState<Tab>('arcs')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'

  const episodes = useMemo(() => project.episodes.map(ep => ({ id: ep.id, number: ep.number, title: ep.title })), [project.episodes])
  const characters = useMemo(() => project.characters.map(c => ({ id: c.id, name: c.name, color: c.color })), [project.characters])

  const updateBible = useCallback((patch: Partial<StoryBibleType>) => {
    updateStoryBible({ ...bible, ...patch })
  }, [bible, updateStoryBible])

  /* ─── Add Helpers ─── */

  const addArc = useCallback(() => {
    const arc: StoryArc = {
      id: genId(), title: 'New Arc', description: '', episodeStart: 1,
      episodeEnd: Math.max(1, project.episodes.length), status: 'planning', linkedCharacterIds: [],
    }
    updateBible({ arcs: [...bible.arcs, arc] })
    setSelectedId(arc.id)
  }, [bible, project.episodes.length, updateBible])

  const addLocation = useCallback(() => {
    const loc: Location = { id: genId(), name: 'New Location', description: '', referenceImageUrls: [] }
    updateBible({ locations: [...bible.locations, loc] })
    setSelectedId(loc.id)
  }, [bible, updateBible])

  const addRule = useCallback(() => {
    const rule: WorldRule = { id: genId(), title: 'New Rule', description: '' }
    updateBible({ worldRules: [...bible.worldRules, rule] })
    setSelectedId(rule.id)
  }, [bible, updateBible])

  const addTimelineEvent = useCallback(() => {
    const event: TimelineEvent = {
      id: genId(), title: 'New Event', description: '',
      episodeId: project.episodes[0]?.id ?? '', order: bible.timeline.length + 1,
    }
    updateBible({ timeline: [...bible.timeline, event] })
    setSelectedId(event.id)
  }, [bible, project.episodes, updateBible])

  const addHandlers: Record<Tab, () => void> = { arcs: addArc, locations: addLocation, rules: addRule, timeline: addTimelineEvent }

  /* ─── Items for sidebar ─── */

  const items = useMemo(() => {
    switch (activeTab) {
      case 'arcs': return bible.arcs.map(a => ({ id: a.id, label: a.title, badge: a.status }))
      case 'locations': return bible.locations.map(l => ({ id: l.id, label: l.name }))
      case 'rules': return bible.worldRules.map(r => ({ id: r.id, label: r.title }))
      case 'timeline': return bible.timeline
        .sort((a, b) => a.order - b.order)
        .map(t => ({ id: t.id, label: t.title, badge: episodes.find(e => e.id === t.episodeId)?.title }))
    }
  }, [activeTab, bible, episodes])

  /* ─── Detail Panel ─── */

  const renderDetail = () => {
    if (!selectedId) {
      return (
        <div className="flex h-full items-center justify-center text-ink-muted text-sm">
          Select an item from the sidebar, or add a new one.
        </div>
      )
    }

    switch (activeTab) {
      case 'arcs': {
        const arc = bible.arcs.find(a => a.id === selectedId)
        if (!arc) return null
        return (
          <ArcEditor
            arc={arc}
            episodes={episodes}
            characters={characters}
            onUpdate={updates => updateBible({ arcs: bible.arcs.map(a => a.id === arc.id ? { ...a, ...updates } : a) })}
            onDelete={() => { updateBible({ arcs: bible.arcs.filter(a => a.id !== arc.id) }); setSelectedId(null) }}
          />
        )
      }
      case 'locations': {
        const loc = bible.locations.find(l => l.id === selectedId)
        if (!loc) return null
        return (
          <LocationEditor
            location={loc}
            onUpdate={updates => updateBible({ locations: bible.locations.map(l => l.id === loc.id ? { ...l, ...updates } : l) })}
            onDelete={() => { updateBible({ locations: bible.locations.filter(l => l.id !== loc.id) }); setSelectedId(null) }}
          />
        )
      }
      case 'rules': {
        const rule = bible.worldRules.find(r => r.id === selectedId)
        if (!rule) return null
        return (
          <WorldRuleEditor
            rule={rule}
            onUpdate={updates => updateBible({ worldRules: bible.worldRules.map(r => r.id === rule.id ? { ...r, ...updates } : r) })}
            onDelete={() => { updateBible({ worldRules: bible.worldRules.filter(r => r.id !== rule.id) }); setSelectedId(null) }}
          />
        )
      }
      case 'timeline': {
        const event = bible.timeline.find(t => t.id === selectedId)
        if (!event) return null
        return (
          <TimelineEventEditor
            event={event}
            episodes={episodes}
            onUpdate={updates => updateBible({ timeline: bible.timeline.map(t => t.id === event.id ? { ...t, ...updates } : t) })}
            onDelete={() => { updateBible({ timeline: bible.timeline.filter(t => t.id !== event.id) }); setSelectedId(null) }}
          />
        )
      }
    }
  }

  const showDetail = isMobile && selectedId

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      {(!isMobile || !showDetail) && (
        <div className={`flex flex-col border-r border-ink-border bg-ink-dark ${isMobile ? 'w-full' : 'w-64'} shrink-0`}>
          {/* Tab switcher */}
          <div className="flex border-b border-ink-border">
            {(Object.keys(tabLabels) as Tab[]).map(tab => {
              const Icon = tabIcons[tab]
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSelectedId(null) }}
                  className={`ink-focus flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
                    activeTab === tab ? 'text-ink-gold border-b-2 border-ink-gold' : 'text-ink-muted hover:text-ink-light'
                  }`}
                >
                  <Icon size={16} />
                  {tabLabels[tab].split(' ')[0]}
                </button>
              )
            })}
          </div>

          {/* Item list */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <EmptyState tab={activeTab} onAdd={addHandlers[activeTab]} />
            ) : (
              <div className="p-2 space-y-1">
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`ink-focus flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selectedId === item.id
                        ? 'bg-ink-panel text-ink-gold'
                        : 'text-ink-text hover:bg-ink-panel/60 hover:text-ink-light'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    <ChevronRight size={14} className="text-ink-muted shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add button */}
          {items.length > 0 && (
            <div className="border-t border-ink-border p-2">
              <button
                onClick={addHandlers[activeTab]}
                className="ink-focus flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink-border py-2 text-sm text-ink-muted transition-colors hover:border-ink-gold/30 hover:text-ink-light"
              >
                <Plus size={14} /> Add {tabLabels[activeTab].replace(/s$/, '')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detail panel */}
      {(!isMobile || showDetail) && (
        <div className="flex-1 overflow-y-auto p-6">
          {isMobile && showDetail && (
            <button
              onClick={() => setSelectedId(null)}
              className="ink-focus mb-4 flex items-center gap-1 text-sm text-ink-muted hover:text-ink-light transition-colors"
            >
              <X size={14} /> Back to list
            </button>
          )}
          {renderDetail()}
        </div>
      )}
    </div>
  )
}
