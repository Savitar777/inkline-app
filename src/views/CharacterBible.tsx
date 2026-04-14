import { memo, useCallback, useMemo, useState } from 'react'
import { useProject } from '../context/ProjectContext'
import { ChevronRight, Plus, Trash2, Users, X } from '../icons'
import type { Character, CharacterRelationship } from '../types'
import { useBreakpoint } from '../hooks/useBreakpoint'

type DetailTab = 'profile' | 'relationships' | 'arcs'

const relationshipTypes: CharacterRelationship['type'][] = [
  'ally', 'rival', 'mentor', 'mentee', 'love_interest', 'family', 'friend', 'enemy', 'other',
]

const relationshipLabels: Record<CharacterRelationship['type'], string> = {
  ally: 'Ally', rival: 'Rival', mentor: 'Mentor', mentee: 'Mentee',
  love_interest: 'Love Interest', family: 'Family', friend: 'Friend', enemy: 'Enemy', other: 'Other',
}

/* ─── Text Field Row ─── */

function FieldRow({ label, value, onChange, rows = 3, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs text-ink-muted mb-1 block">{label}</label>
      {rows === 1 ? (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="ink-focus w-full rounded-md border border-ink-border bg-transparent px-3 py-1.5 text-sm text-ink-light"
        />
      ) : (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="ink-focus w-full rounded-md border border-ink-border bg-transparent px-3 py-2 text-sm text-ink-light resize-y"
        />
      )}
    </div>
  )
}

/* ─── Profile Tab ─── */

function ProfileTab({ character, onUpdate }: {
  character: Character
  onUpdate: (updates: Partial<Character>) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldRow label="Name" value={character.name} onChange={name => onUpdate({ name })} rows={1} placeholder="Character name…" />
        <FieldRow label="Role" value={character.role} onChange={role => onUpdate({ role })} rows={1} placeholder="e.g., Protagonist, Antagonist…" />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-xs text-ink-muted">Color</label>
        <input
          type="color"
          value={character.color}
          onChange={e => onUpdate({ color: e.target.value })}
          className="ink-focus h-8 w-12 cursor-pointer rounded border border-ink-border bg-transparent"
        />
        <span className="text-xs text-ink-muted">{character.color}</span>
      </div>
      <FieldRow label="Description" value={character.desc} onChange={desc => onUpdate({ desc })} placeholder="Brief character summary…" />
      <FieldRow label="Appearance" value={character.appearance ?? ''} onChange={appearance => onUpdate({ appearance })} placeholder="Physical description — hair, eyes, build, distinguishing features…" />
      <FieldRow label="Personality" value={character.personality ?? ''} onChange={personality => onUpdate({ personality })} placeholder="Personality traits, temperament, quirks…" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldRow label="Goals" value={character.goals ?? ''} onChange={goals => onUpdate({ goals })} placeholder="What drives this character…" />
        <FieldRow label="Fears" value={character.fears ?? ''} onChange={fears => onUpdate({ fears })} placeholder="What this character fears…" />
      </div>
      <FieldRow label="Backstory" value={character.backstory ?? ''} onChange={backstory => onUpdate({ backstory })} rows={4} placeholder="Character history and background…" />
      <FieldRow label="Speech Patterns" value={character.speechPatterns ?? ''} onChange={speechPatterns => onUpdate({ speechPatterns })} placeholder="How they talk — formal/casual, catchphrases, accent, vocabulary…" />
    </div>
  )
}

/* ─── Relationships Tab ─── */

function RelationshipsTab({ character, allCharacters, onUpdate }: {
  character: Character
  allCharacters: Character[]
  onUpdate: (updates: Partial<Character>) => void
}) {
  const relationships = character.relationships ?? []
  const otherCharacters = allCharacters.filter(c => c.id !== character.id)

  const addRelationship = () => {
    const target = otherCharacters.find(c => !relationships.some(r => r.targetCharacterId === c.id))
    if (!target) return
    onUpdate({ relationships: [...relationships, { targetCharacterId: target.id, type: 'ally', description: '' }] })
  }

  const updateRel = (index: number, updates: Partial<CharacterRelationship>) => {
    onUpdate({
      relationships: relationships.map((r, i) => i === index ? { ...r, ...updates } : r),
    })
  }

  const deleteRel = (index: number) => {
    onUpdate({ relationships: relationships.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      {relationships.length === 0 && (
        <p className="text-sm text-ink-muted py-4 text-center">
          No relationships defined yet. Add one to map this character's connections.
        </p>
      )}

      {relationships.map((rel, index) => {
        const target = allCharacters.find(c => c.id === rel.targetCharacterId)
        return (
          <div key={index} className="rounded-lg border border-ink-border bg-ink-panel/30 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <select
                value={rel.targetCharacterId}
                onChange={e => updateRel(index, { targetCharacterId: e.target.value })}
                className="ink-focus flex-1 rounded-md border border-ink-border bg-ink-panel px-3 py-1.5 text-sm text-ink-light"
              >
                {otherCharacters.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={rel.type}
                onChange={e => updateRel(index, { type: e.target.value as CharacterRelationship['type'] })}
                className="ink-focus rounded-md border border-ink-border bg-ink-panel px-3 py-1.5 text-sm text-ink-light"
              >
                {relationshipTypes.map(t => (
                  <option key={t} value={t}>{relationshipLabels[t]}</option>
                ))}
              </select>
              <button onClick={() => deleteRel(index)} aria-label="Remove relationship" className="ink-focus rounded p-1.5 text-ink-muted hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
            {target && (
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: target.color }} />
                {character.name} is {relationshipLabels[rel.type].toLowerCase()} of {target.name}
              </div>
            )}
            <textarea
              value={rel.description}
              onChange={e => updateRel(index, { description: e.target.value })}
              placeholder="Describe this relationship…"
              rows={2}
              className="ink-focus w-full rounded-md border border-ink-border bg-transparent px-3 py-2 text-sm text-ink-light resize-y"
            />
          </div>
        )
      })}

      {otherCharacters.length > relationships.length && (
        <button
          onClick={addRelationship}
          className="ink-focus flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink-border py-2 text-sm text-ink-muted transition-colors hover:border-ink-gold/30 hover:text-ink-light"
        >
          <Plus size={14} /> Add Relationship
        </button>
      )}
    </div>
  )
}

/* ─── Arcs Tab ─── */

function ArcsTab({ character, storyArcs, onUpdate }: {
  character: Character
  storyArcs: { id: string; title: string; status: string }[]
  onUpdate: (updates: Partial<Character>) => void
}) {
  const arcs = character.arcs ?? []

  const addArc = () => {
    const available = storyArcs.find(sa => !arcs.some(a => a.storyArcId === sa.id))
    if (!available) return
    onUpdate({ arcs: [...arcs, { storyArcId: available.id, startState: '', endState: '' }] })
  }

  const updateArc = (index: number, updates: Partial<typeof arcs[0]>) => {
    onUpdate({ arcs: arcs.map((a, i) => i === index ? { ...a, ...updates } : a) })
  }

  const deleteArc = (index: number) => {
    onUpdate({ arcs: arcs.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      {storyArcs.length === 0 && (
        <p className="text-sm text-ink-muted py-4 text-center">
          Add story arcs in the Story Bible first to track character development across arcs.
        </p>
      )}

      {arcs.length === 0 && storyArcs.length > 0 && (
        <p className="text-sm text-ink-muted py-4 text-center">
          No character arcs defined. Track how this character changes across story arcs.
        </p>
      )}

      {arcs.map((arc, index) => {
        const storyArc = storyArcs.find(sa => sa.id === arc.storyArcId)
        return (
          <div key={index} className="rounded-lg border border-ink-border bg-ink-panel/30 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <select
                value={arc.storyArcId}
                onChange={e => updateArc(index, { storyArcId: e.target.value })}
                className="ink-focus flex-1 rounded-md border border-ink-border bg-ink-panel px-3 py-1.5 text-sm text-ink-light"
              >
                {storyArcs.map(sa => (
                  <option key={sa.id} value={sa.id}>{sa.title}</option>
                ))}
              </select>
              {storyArc && (
                <span className="rounded-full bg-ink-panel px-2 py-0.5 text-[10px] text-ink-muted">
                  {storyArc.status}
                </span>
              )}
              <button onClick={() => deleteArc(index)} aria-label="Remove arc" className="ink-focus rounded p-1.5 text-ink-muted hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Start State</label>
                <textarea
                  value={arc.startState}
                  onChange={e => updateArc(index, { startState: e.target.value })}
                  placeholder="Who is this character at the start of this arc?"
                  rows={2}
                  className="ink-focus w-full rounded-md border border-ink-border bg-transparent px-3 py-2 text-sm text-ink-light resize-y"
                />
              </div>
              <div>
                <label className="text-xs text-ink-muted mb-1 block">End State</label>
                <textarea
                  value={arc.endState}
                  onChange={e => updateArc(index, { endState: e.target.value })}
                  placeholder="Who have they become by the end?"
                  rows={2}
                  className="ink-focus w-full rounded-md border border-ink-border bg-transparent px-3 py-2 text-sm text-ink-light resize-y"
                />
              </div>
            </div>
          </div>
        )
      })}

      {storyArcs.length > arcs.length && (
        <button
          onClick={addArc}
          className="ink-focus flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink-border py-2 text-sm text-ink-muted transition-colors hover:border-ink-gold/30 hover:text-ink-light"
        >
          <Plus size={14} /> Add Character Arc
        </button>
      )}
    </div>
  )
}

/* ─── Character Detail ─── */

function CharacterDetail({ character, allCharacters, storyArcs, onUpdate, onDelete }: {
  character: Character
  allCharacters: Character[]
  storyArcs: { id: string; title: string; status: string }[]
  onUpdate: (updates: Partial<Character>) => void
  onDelete: () => void
}) {
  const [detailTab, setDetailTab] = useState<DetailTab>('profile')

  const detailTabs: { id: DetailTab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'relationships', label: `Relationships (${(character.relationships ?? []).length})` },
    { id: 'arcs', label: `Arcs (${(character.arcs ?? []).length})` },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: character.color }} />
          <h2 className="font-serif text-xl text-ink-light truncate">{character.name || 'Unnamed Character'}</h2>
          {character.role && (
            <span className="rounded-full bg-ink-panel px-2.5 py-0.5 text-xs text-ink-muted shrink-0">{character.role}</span>
          )}
        </div>
        <button onClick={onDelete} aria-label="Delete character" className="ink-focus rounded p-2 text-ink-muted hover:text-red-400 transition-colors shrink-0">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex gap-1 border-b border-ink-border">
        {detailTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setDetailTab(tab.id)}
            className={`ink-focus px-4 py-2 text-sm transition-colors ${
              detailTab === tab.id
                ? 'text-ink-gold border-b-2 border-ink-gold'
                : 'text-ink-muted hover:text-ink-light'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {detailTab === 'profile' && <ProfileTab character={character} onUpdate={onUpdate} />}
      {detailTab === 'relationships' && <RelationshipsTab character={character} allCharacters={allCharacters} onUpdate={onUpdate} />}
      {detailTab === 'arcs' && <ArcsTab character={character} storyArcs={storyArcs} onUpdate={onUpdate} />}
    </div>
  )
}

/* ─── Main View ─── */

function CharacterBible() {
  const { project, addCharacter, updateCharacter, deleteCharacter } = useProject()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'

  const storyArcs = useMemo(
    () => (project.storyBible?.arcs ?? []).map(a => ({ id: a.id, title: a.title, status: a.status })),
    [project.storyBible?.arcs],
  )

  const handleAdd = useCallback(() => {
    const char: Omit<Character, 'id'> = {
      name: 'New Character',
      role: '',
      desc: '',
      color: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`,
    }
    addCharacter(char)
  }, [addCharacter])

  // Select newly added character
  const selectedCharacter = project.characters.find(c => c.id === selectedId)

  const showDetail = isMobile && selectedId

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      {(!isMobile || !showDetail) && (
        <div className={`flex flex-col border-r border-ink-border bg-ink-dark ${isMobile ? 'w-full' : 'w-64'} shrink-0`}>
          <div className="flex items-center justify-between border-b border-ink-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-ink-gold" />
              <h2 className="text-sm font-medium text-ink-light">Characters</h2>
            </div>
            <span className="text-xs text-ink-muted">{project.characters.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {project.characters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="mb-4 rounded-xl bg-ink-panel p-4">
                  <Users size={32} className="text-ink-muted" />
                </div>
                <h3 className="text-lg font-serif text-ink-light mb-2">No characters yet</h3>
                <p className="text-sm text-ink-muted max-w-sm mb-6">
                  Build your character bible — profiles, speech patterns, relationships, and arc tracking.
                </p>
                <button
                  onClick={handleAdd}
                  className="ink-focus flex items-center gap-2 rounded-lg bg-ink-gold px-4 py-2 text-sm font-medium text-ink-black transition-colors hover:bg-ink-gold/90"
                >
                  <Plus size={14} /> Add Character
                </button>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {project.characters.map(char => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedId(char.id)}
                    className={`ink-focus flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selectedId === char.id
                        ? 'bg-ink-panel text-ink-gold'
                        : 'text-ink-text hover:bg-ink-panel/60 hover:text-ink-light'
                    }`}
                  >
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: char.color }} />
                    <span className="truncate flex-1">{char.name}</span>
                    <ChevronRight size={14} className="text-ink-muted shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {project.characters.length > 0 && (
            <div className="border-t border-ink-border p-2">
              <button
                onClick={handleAdd}
                className="ink-focus flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink-border py-2 text-sm text-ink-muted transition-colors hover:border-ink-gold/30 hover:text-ink-light"
              >
                <Plus size={14} /> Add Character
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
          {selectedCharacter ? (
            <CharacterDetail
              character={selectedCharacter}
              allCharacters={project.characters}
              storyArcs={storyArcs}
              onUpdate={updates => updateCharacter(selectedCharacter.id, updates)}
              onDelete={() => { deleteCharacter(selectedCharacter.id); setSelectedId(null) }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-muted text-sm">
              Select a character from the sidebar, or add a new one.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default memo(CharacterBible)
