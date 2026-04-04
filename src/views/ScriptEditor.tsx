import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  FileText,
  SquareStack,
  MessageCircle,
  Quote,
  Volume2,
  Send,
  Plus,
  Grip,
  Eye,
  Swords,
} from '../icons'

/* ─── Mock Data ─── */

interface ContentBlock {
  type: 'dialogue' | 'caption' | 'sfx'
  character?: string
  parenthetical?: string
  text: string
}

interface Panel {
  id: string
  number: number
  shot: string
  description: string
  content: ContentBlock[]
}

interface Page {
  id: string
  number: number
  panelCount: number
  layoutNote: string
  panels: Panel[]
}

interface Episode {
  id: string
  number: number
  title: string
  brief: string
  pages: Page[]
}

const episodes: Episode[] = [
  {
    id: 'ep1',
    number: 1,
    title: 'The Signal',
    brief: 'Mira discovers the anomaly in the company data.',
    pages: [],
  },
  {
    id: 'ep2',
    number: 2,
    title: 'Old Ghosts',
    brief: 'Flashback to Mira\'s last day at Helix Corp.',
    pages: [],
  },
  {
    id: 'ep3',
    number: 3,
    title: 'The Offer',
    brief: 'Tension. Corporate dread. Mira returns to the place she swore she\'d never set foot in again. Cole is waiting — unhurried, expectant. The power dynamic is everything. Every shot should feel like a negotiation.',
    pages: [
      {
        id: 'p1',
        number: 1,
        panelCount: 4,
        layoutNote: 'Webtoon scroll unit — vertical pacing, wide establishing shot at top',
        panels: [
          {
            id: 'pan1',
            number: 1,
            shot: 'Wide / Establishing',
            description: 'Exterior — Helix Corp tower, early morning. Glass and steel monolith against an overcast sky. A single figure (MIRA) stands at the base, small against the building. She hasn\'t moved in a while.',
            content: [
              {
                type: 'caption',
                character: 'Mira',
                text: 'Three years. Three years and the building hasn\'t changed.',
              },
              {
                type: 'caption',
                character: 'Mira',
                text: 'I have.',
              },
            ],
          },
          {
            id: 'pan2',
            number: 2,
            shot: 'Medium',
            description: 'Mira walking through the lobby. Security guard nods at her — he recognizes her. Marble floors reflect fluorescent light. Her hand is in her coat pocket, thumb rubbing the scar on her index finger.',
            content: [
              {
                type: 'sfx',
                text: 'CLICK CLICK CLICK',
              },
              {
                type: 'dialogue',
                character: 'Security Guard',
                text: 'Ms. Voss. It\'s been a while.',
              },
              {
                type: 'dialogue',
                character: 'Mira',
                parenthetical: 'flat',
                text: 'Not long enough.',
              },
            ],
          },
          {
            id: 'pan3',
            number: 3,
            shot: 'Close-up',
            description: 'Mira\'s hand pressing the elevator button for floor 42. Her index finger is visible — the thin scar across the knuckle catches the light. The button glows amber.',
            content: [
              {
                type: 'sfx',
                text: 'DING',
              },
            ],
          },
          {
            id: 'pan4',
            number: 4,
            shot: 'Medium-wide',
            description: 'The boardroom. Floor-to-ceiling windows, city below. COLE sits at the far end of a long table, jacket off, sleeves rolled once. A single folder on the table between them. He doesn\'t stand when she enters.',
            content: [
              {
                type: 'dialogue',
                character: 'Cole',
                text: 'Mira.',
              },
              {
                type: 'dialogue',
                character: 'Cole',
                text: 'Sit. Please.',
              },
              {
                type: 'dialogue',
                character: 'Mira',
                parenthetical: 'still standing',
                text: 'What\'s in the folder, Cole?',
              },
            ],
          },
        ],
      },
      {
        id: 'p2',
        number: 2,
        panelCount: 3,
        layoutNote: 'Tight pacing — the reveal. Hold tension before the folder opens.',
        panels: [
          {
            id: 'pan5',
            number: 1,
            shot: 'Close-up',
            description: 'Cole\'s hand sliding the folder across the polished table. His cufflink catches light — it\'s engraved with the Helix logo. The folder is unmarked.',
            content: [
              {
                type: 'dialogue',
                character: 'Cole',
                text: 'Your second chance.',
              },
            ],
          },
          {
            id: 'pan6',
            number: 2,
            shot: 'Extreme close-up',
            description: 'Mira\'s eyes. Reflected in them: the folder. Her expression is unreadable — but her jaw is tight.',
            content: [
              {
                type: 'caption',
                character: 'Mira',
                text: 'He always did know exactly what to say.',
              },
            ],
          },
          {
            id: 'pan7',
            number: 3,
            shot: 'Wide',
            description: 'Pull back to show the full boardroom — the distance between them, the city through the glass, the single folder as the only object on the vast table. Neither has moved.',
            content: [
              {
                type: 'dialogue',
                character: 'Mira',
                text: 'And if I say no?',
              },
              {
                type: 'dialogue',
                character: 'Cole',
                parenthetical: 'smiles',
                text: 'You already would have.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ep4',
    number: 4,
    title: 'The Fine Print',
    brief: 'Mira reads the contract. What she finds changes everything.',
    pages: [],
  },
  {
    id: 'ep5',
    number: 5,
    title: 'Fracture',
    brief: 'The team splinters. Loyalties are tested.',
    pages: [],
  },
]

const characters = [
  {
    name: 'MIRA VOSS',
    role: 'Protagonist',
    desc: 'Early 30s. Sharp eyes, controlled body language. Thin scar across her right index finger — she rubs it when stressed. Former Helix Corp analyst who left under unclear circumstances. Wears dark, practical clothes.',
    color: '#22C55E',
  },
  {
    name: 'COLE ARDEN',
    role: 'Antagonist',
    desc: 'Mid 50s. Silver at the temples, expensive suit worn casually. Unhurried in everything — speech, movement, decisions. CEO of Helix Corp. Treats every conversation like a chess game he\'s already won.',
    color: '#F97316',
  },
]

/* ─── Tag Badge ─── */

function Tag({ type, children }: { type: 'episode' | 'page' | 'panel' | 'dialogue' | 'caption' | 'sfx'; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    episode: 'bg-tag-episode/15 text-tag-episode border-tag-episode/30',
    page: 'bg-tag-page/15 text-tag-page border-tag-page/30',
    panel: 'bg-tag-panel/15 text-tag-panel border-tag-panel/30',
    dialogue: 'bg-tag-dialogue/15 text-tag-dialogue border-tag-dialogue/30',
    caption: 'bg-tag-caption/15 text-tag-caption border-tag-caption/30',
    sfx: 'bg-[#F97316]/15 text-[#F97316] border-[#F97316]/30',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono font-medium border ${colors[type]}`}>
      {children}
    </span>
  )
}

/* ─── Content Block ─── */

function ContentBlockView({ block }: { block: ContentBlock }) {
  if (block.type === 'dialogue') {
    return (
      <div className="flex items-start gap-3 pl-4 py-1.5 group">
        <MessageCircle size={12} className="text-tag-dialogue mt-1 shrink-0" />
        <div className="text-sm font-mono leading-relaxed">
          <span className="text-tag-dialogue font-medium">{block.character}</span>
          {block.parenthetical && (
            <span className="text-ink-text text-xs ml-1">({block.parenthetical})</span>
          )}
          <span className="text-ink-light">: {block.text}</span>
        </div>
      </div>
    )
  }
  if (block.type === 'caption') {
    return (
      <div className="flex items-start gap-3 pl-4 py-1.5 group">
        <Quote size={12} className="text-tag-caption mt-1 shrink-0" />
        <div className="text-sm font-mono leading-relaxed">
          <span className="text-tag-caption font-medium">CAPTION</span>
          {block.character && (
            <span className="text-ink-text text-xs ml-1">({block.character})</span>
          )}
          <span className="text-ink-light italic">: {block.text}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-3 pl-4 py-1.5 group">
      <Volume2 size={12} className="text-[#F97316] mt-1 shrink-0" />
      <div className="text-sm font-mono leading-relaxed">
        <span className="text-[#F97316] font-medium">SFX</span>
        <span className="text-ink-light">: {block.text}</span>
      </div>
    </div>
  )
}

/* ─── Panel Block ─── */

function PanelBlock({ panel }: { panel: Panel }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="ml-4 border-l-2 border-tag-panel/20 group/panel">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-tag-panel/5 transition-colors"
      >
        <Grip size={10} className="text-ink-muted" />
        {open ? <ChevronDown size={14} className="text-tag-panel" /> : <ChevronRight size={14} className="text-tag-panel" />}
        <Tag type="panel">Panel {panel.number}</Tag>
        <span className="text-xs text-ink-text font-sans ml-2">{panel.shot}</span>
      </button>
      {open && (
        <div className="px-3 pb-3">
          <p className="text-sm text-ink-text leading-relaxed pl-4 mb-2 font-sans border-l border-ink-border/50 ml-2">
            {panel.description}
          </p>
          <div className="space-y-0.5">
            {panel.content.map((block, i) => (
              <ContentBlockView key={i} block={block} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Page Block ─── */

function PageBlock({ page }: { page: Page }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-l-2 border-tag-page/20">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-tag-page/5 transition-colors"
      >
        {open ? <ChevronDown size={14} className="text-tag-page" /> : <ChevronRight size={14} className="text-tag-page" />}
        <Tag type="page">Page {page.number}</Tag>
        <span className="text-xs text-ink-text font-sans ml-2">{page.panelCount} panels</span>
        <span className="text-[10px] text-ink-muted font-sans ml-auto">{page.layoutNote}</span>
      </button>
      {open && (
        <div className="space-y-1 pb-2">
          {page.panels.map((panel) => (
            <PanelBlock key={panel.id} panel={panel} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main View ─── */

export default function ScriptEditor() {
  const [activeEpisode, setActiveEpisode] = useState('ep3')
  const episode = episodes.find((e) => e.id === activeEpisode)!

  return (
    <div className="flex h-full">
      {/* Left Sidebar — Episode List */}
      <aside className="w-56 border-r border-ink-border bg-ink-dark shrink-0 flex flex-col">
        <div className="px-4 py-3 border-b border-ink-border">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">Episodes</span>
            <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-ink-panel text-ink-text hover:text-ink-gold transition-colors">
              <Plus size={12} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {episodes.map((ep) => (
            <button
              key={ep.id}
              onClick={() => setActiveEpisode(ep.id)}
              className={`w-full text-left px-4 py-2.5 flex items-start gap-2 transition-colors ${
                activeEpisode === ep.id
                  ? 'bg-ink-panel border-l-2 border-ink-gold'
                  : 'hover:bg-ink-panel/50 border-l-2 border-transparent'
              }`}
            >
              <BookOpen size={13} className={`mt-0.5 shrink-0 ${activeEpisode === ep.id ? 'text-ink-gold' : 'text-ink-muted'}`} />
              <div>
                <div className={`text-xs font-mono ${activeEpisode === ep.id ? 'text-ink-gold' : 'text-ink-text'}`}>
                  EP {ep.number}
                </div>
                <div className={`text-sm font-sans leading-tight ${activeEpisode === ep.id ? 'text-ink-light' : 'text-ink-text'}`}>
                  {ep.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Script Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Episode Header */}
        <div className="px-6 py-4 border-b border-ink-border bg-ink-dark/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tag type="episode">Episode {episode.number}</Tag>
              <h2 className="font-serif text-xl text-ink-light">{episode.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-sans text-ink-text hover:text-ink-light hover:bg-ink-panel transition-colors">
                <Eye size={13} />
                Preview
              </button>
              <button className="flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-sans bg-ink-gold text-ink-black font-medium hover:bg-ink-gold-dim transition-colors">
                <Send size={13} />
                Submit to Artist
              </button>
            </div>
          </div>
          <p className="text-sm text-ink-text font-sans mt-2 leading-relaxed max-w-2xl">
            {episode.brief}
          </p>
        </div>

        {/* Script Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {episode.pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText size={32} className="text-ink-muted mb-3" />
              <p className="text-sm text-ink-text font-sans">No pages yet.</p>
              <button className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-sans text-ink-gold border border-ink-gold/30 hover:bg-ink-gold/10 transition-colors">
                <Plus size={12} />
                Add Page
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl">
              {episode.pages.map((page) => (
                <PageBlock key={page.id} page={page} />
              ))}
              <button className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-sans text-ink-text border border-dashed border-ink-border hover:border-ink-gold/30 hover:text-ink-gold transition-colors mt-4">
                <Plus size={12} />
                Add Page
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar — Characters */}
      <aside className="w-64 border-l border-ink-border bg-ink-dark shrink-0 flex flex-col">
        <div className="px-4 py-3 border-b border-ink-border">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">Characters</span>
            <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-ink-panel text-ink-text hover:text-ink-gold transition-colors">
              <Plus size={12} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {characters.map((char) => (
            <div key={char.name} className="px-4 py-3 border-b border-ink-border/50">
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: char.color }}
                />
                <span className="text-xs font-mono font-medium text-ink-light">{char.name}</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-ink-muted font-sans mb-1.5 flex items-center gap-1">
                <Swords size={9} />
                {char.role}
              </div>
              <p className="text-xs text-ink-text font-sans leading-relaxed">{char.desc}</p>
            </div>
          ))}
        </div>

        {/* Script Stats */}
        <div className="px-4 py-3 border-t border-ink-border">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-2">Script Stats</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Pages', value: episode.pages.length },
              { label: 'Panels', value: episode.pages.reduce((s, p) => s + p.panels.length, 0) },
              { label: 'Dialogue', value: episode.pages.reduce((s, p) => s + p.panels.reduce((ps, pan) => ps + pan.content.filter(c => c.type === 'dialogue').length, 0), 0) },
              { label: 'SFX', value: episode.pages.reduce((s, p) => s + p.panels.reduce((ps, pan) => ps + pan.content.filter(c => c.type === 'sfx').length, 0), 0) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-ink-panel rounded px-2 py-1.5">
                <div className="text-xs font-mono text-ink-light">{value}</div>
                <div className="text-[10px] text-ink-muted font-sans">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
