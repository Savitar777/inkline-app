import { useEffect, useRef, useState, type DragEvent } from 'react'
import {
  Send,
  Paperclip,
  Image,
  CheckCircle2,
  Clock,
  Palette,
  FileText,
  ChevronRight,
} from '../icons'
import { useProject } from '../context/ProjectContext'
import { useAuth } from '../context/AuthContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { supabase } from '../lib/supabase'
import { isSupabaseConfigured } from '../lib/supabase'
import { getDefaultThreadId, getEpisodeById, getEpisodeThreads } from '../domain/selectors'
import { formatShortTime } from '../domain/time'
import { sendMessage, inviteMember, uploadPanelArtwork, fetchCollaborators, updateThreadStatus } from '../services/projectService'
import type { Collaborator } from '../services/projectService'
import type { Thread, Message, Panel } from '../types'
import type { RealtimePostgresInsertPayload, RealtimePresenceState } from '@supabase/supabase-js'

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  submitted: { label: 'Submitted', color: 'text-status-submitted bg-status-submitted/10 border-status-submitted/30', icon: <Send size={10} /> },
  in_progress: { label: 'In Progress', color: 'text-status-progress bg-status-progress/10 border-status-progress/30', icon: <Clock size={10} /> },
  draft_received: { label: 'Draft Received', color: 'text-status-draft bg-status-draft/10 border-status-draft/30', icon: <Palette size={10} /> },
  changes_requested: { label: 'Changes Requested', color: 'text-red-400 bg-red-400/10 border-red-400/30', icon: <Clock size={10} /> },
  approved: { label: 'Approved', color: 'text-status-approved bg-status-approved/10 border-status-approved/30', icon: <CheckCircle2 size={10} /> },
}

function isUrl(str: string | undefined): boolean {
  if (!str) return false
  return str.startsWith('http://') || str.startsWith('https://')
}

const MOCK_COLLABORATORS = [
  { name: 'Kai Nakamura', role: 'artist', status: 'online', avatar: 'K' },
  { name: 'Sora Lin', role: 'colorist', status: 'away', avatar: 'S' },
  { name: 'Jake Torres', role: 'letterer', status: 'offline', avatar: 'J' },
]

interface MessageRow {
  id: string
  sender_id: string
  text: string | null
  attachment_url: string | null
  created_at: string
}

interface TypingPresence {
  typing?: boolean
}

function applyThreadMessages(
  previous: Record<string, Message[]>,
  threadId: string,
  updater: (messages: Message[]) => Message[],
  fallbackThreads: Thread[],
) {
  const baseMessages = previous[threadId] ?? fallbackThreads.find(thread => thread.id === threadId)?.messages ?? []
  return { ...previous, [threadId]: updater(baseMessages) }
}

/* ─── Component ─── */

export default function Collaboration() {
  const { project, activeEpisodeId, updatePanel } = useProject()
  const { user, profile } = useAuth()
  const { activeThreadId, setActiveThreadId } = useWorkspace()

  const episodeThreads: Thread[] = getEpisodeThreads(project, activeEpisodeId)
  const activeEpisode = getEpisodeById(project, activeEpisodeId)
  const defaultThreadId = getDefaultThreadId(project, activeEpisodeId) ?? ''
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [liveMessagesByThread, setLiveMessagesByThread] = useState<Record<string, Message[]>>({})
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('artist')
  const [inviteStatus, setInviteStatus] = useState<string | null>(null)
  const [inviting, setInviting] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [selectedPanelId, setSelectedPanelId] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const localMessageCounter = useRef(0)
  const threadsRef = useRef(episodeThreads)

  const resolvedActiveThread = episodeThreads.some(thread => thread.id === activeThreadId)
    ? activeThreadId ?? defaultThreadId
    : defaultThreadId
  const senderRole = profile?.role === 'artist' ? 'artist' : 'writer'

  // All panels from current episode, flattened for the panel picker
  const allPanels: (Panel & { pageNumber: number; pageId: string })[] = activeEpisode
    ? activeEpisode.pages.flatMap(pg =>
        pg.panels.map(pan => ({ ...pan, pageNumber: pg.number, pageId: pg.id }))
      )
    : []

  useEffect(() => {
    threadsRef.current = episodeThreads
  }, [episodeThreads])

  const createLocalMessageId = () => {
    localMessageCounter.current += 1
    return `local-${localMessageCounter.current}`
  }

  useEffect(() => {
    if (resolvedActiveThread && resolvedActiveThread !== activeThreadId) {
      setActiveThreadId(resolvedActiveThread)
    }
  }, [activeThreadId, resolvedActiveThread, setActiveThreadId])

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploadFile(file)
    const reader = new FileReader()
    reader.onload = e => setUploadPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const attachUpload = async () => {
    if (!uploadPreview || !resolvedActiveThread) return

    // Online mode: upload to Supabase Storage and link to panel
    if (isSupabaseConfigured && user && project.id && uploadFile && selectedPanelId) {
      setUploading(true)
      const result = await uploadPanelArtwork(project.id, selectedPanelId, uploadFile, user.id)
      setUploading(false)
      if (result) {
        // Update panel in local state with the new asset URL
        const pan = allPanels.find(p => p.id === selectedPanelId)
        if (pan && activeEpisode) {
          updatePanel(activeEpisode.id, pan.pageId, pan.id, { assetUrl: result.url, status: 'draft_received' })
        }
        // Send notification message in thread and update thread status
        const panLabel = pan ? `P${pan.pageNumber}/Panel ${pan.number}` : 'a panel'
        await sendMessage(resolvedActiveThread, user.id, `Uploaded draft artwork for ${panLabel}`, result.url)
        // Update thread status to draft_received
        const epThread = episodeThreads.find(t => t.id === resolvedActiveThread)
        if (epThread && epThread.status !== 'approved') {
          updateThreadStatus(resolvedActiveThread, 'draft_received')
        }
      }
    } else {
      // Offline mode: append locally
      const msg: Message = {
        id: createLocalMessageId(),
        sender: senderRole,
        name: profile?.name ?? 'Artist',
        image: true,
        imageLabel: 'Draft artwork',
        timestamp: formatShortTime(new Date()),
      }
      setLiveMessagesByThread(prev => applyThreadMessages(prev, resolvedActiveThread, messages => [...messages, msg], threadsRef.current))
    }
    setUploadPreview(null)
    setUploadFile(null)
    setSelectedPanelId('')
    setShowUpload(false)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [liveMessagesByThread, resolvedActiveThread])

  // Fetch real collaborators
  useEffect(() => {
    if (!isSupabaseConfigured || !project.id) return
    fetchCollaborators(project.id).then(setCollaborators)
  }, [project.id])

  // Supabase Realtime — subscribe to new messages on the active thread
  useEffect(() => {
    if (!resolvedActiveThread || !user) return
    const channel = supabase
      .channel(`messages:${resolvedActiveThread}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${resolvedActiveThread}` },
        payload => {
          const row = (payload as RealtimePostgresInsertPayload<MessageRow>).new
          // Deduplicate: skip if this message was sent by the current user (already in state)
          if (row.sender_id === user.id) return
          // Look up sender name from collaborators list
          const sender = collaborators.find(c => c.id === row.sender_id)
          const senderName = sender?.name ?? row.sender_id?.slice(0, 8)
          const msg: Message = {
            id: row.id,
            sender: sender?.role === 'artist' ? 'artist' : 'writer',
            name: senderName,
            text: row.text ?? undefined,
            image: !!row.attachment_url,
            imageLabel: row.attachment_url ?? undefined,
            timestamp: formatShortTime(row.created_at),
          }
          setLiveMessagesByThread(prev => applyThreadMessages(
            prev,
            resolvedActiveThread,
            messages => (messages.some(message => message.id === row.id) ? messages : [...messages, msg]),
            threadsRef.current,
          ))
        },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [collaborators, resolvedActiveThread, user])

  // Typing indicators via Supabase Realtime Presence
  useEffect(() => {
    if (!resolvedActiveThread || !user || !isSupabaseConfigured) return
    const channel = supabase.channel(`typing:${resolvedActiveThread}`, { config: { presence: { key: user.id } } })
    typingChannelRef.current = channel
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<TypingPresence>() as RealtimePresenceState<TypingPresence>
        const typing = new Set<string>()
        for (const [uid, presences] of Object.entries(state)) {
          if (uid !== user.id && presences.some(presence => presence.typing)) {
            typing.add(uid)
          }
        }
        setTypingUsers(typing)
      })
      .subscribe()
    return () => {
      clearTimeout(typingTimeout.current)
      typingChannelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [resolvedActiveThread, user])

  // Broadcast typing state when user types
  const broadcastTyping = () => {
    if (!resolvedActiveThread || !user || !isSupabaseConfigured || !typingChannelRef.current) return
    typingChannelRef.current.track({ typing: true })
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      typingChannelRef.current?.track({ typing: false })
    }, 2000)
  }

  const handleSend = async () => {
    const text = inputText.trim()
    if (!text || sending) return
    setSending(true)
    setInputText('')

    if (user && resolvedActiveThread) {
      // Online mode — send via Supabase, add to local state immediately (realtime skips own messages)
      const msgId = await sendMessage(resolvedActiveThread, user.id, text)
      const localMsg: Message = {
        id: msgId ?? createLocalMessageId(),
        sender: senderRole,
        name: profile?.name ?? 'You',
        text,
        timestamp: formatShortTime(new Date()),
      }
      setLiveMessagesByThread(prev => applyThreadMessages(prev, resolvedActiveThread, messages => [...messages, localMsg], threadsRef.current))
    } else {
      // Offline mode — append locally
      const msg: Message = {
        id: createLocalMessageId(),
        sender: senderRole,
        name: profile?.name ?? 'You',
        text,
        timestamp: formatShortTime(new Date()),
      }
      if (resolvedActiveThread) {
        setLiveMessagesByThread(prev => applyThreadMessages(prev, resolvedActiveThread, messages => [...messages, msg], threadsRef.current))
      }
    }
    setSending(false)
  }

  const thread = episodeThreads.find(t => t.id === resolvedActiveThread) ?? null
  const displayMessages: Message[] = thread
    ? (liveMessagesByThread[resolvedActiveThread] ?? thread.messages)
    : []

  // Derive page tracker from real panel statuses
  const pageTracker = activeEpisode?.pages.map(pg => {
    const statuses = pg.panels.map(pan => pan.status ?? 'draft')
    // Page status = worst panel status
    const pageStatus = statuses.includes('draft') ? 'draft'
      : statuses.includes('submitted') ? 'submitted'
      : statuses.includes('in_progress') ? 'in_progress'
      : statuses.includes('changes_requested') ? 'changes_requested'
      : statuses.includes('draft_received') ? 'draft_received'
      : 'approved'
    return { page: pg.number, status: pageStatus }
  }) ?? []

  // Compute real deliverables from panel data
  const deliverables = (() => {
    const all = allPanels.map(p => p.status ?? 'draft')
    return [
      { label: 'Drafts received', count: all.filter(s => s === 'draft_received').length, icon: <Palette size={11} />, color: 'text-status-draft' },
      { label: 'Approved panels', count: all.filter(s => s === 'approved').length, icon: <CheckCircle2 size={11} />, color: 'text-status-approved' },
      { label: 'Awaiting review', count: all.filter(s => s === 'submitted' || s === 'in_progress').length, icon: <FileText size={11} />, color: 'text-status-submitted' },
    ]
  })()

  // Display list: real collaborators or mock fallback
  const displayCollaborators = collaborators.length > 0 ? collaborators : MOCK_COLLABORATORS.map(c => ({
    id: c.name, name: c.name, role: c.role, email: '', avatarUrl: null,
  }))

  // Typing indicator names
  const typingNames = collaborators.filter(c => typingUsers.has(c.id)).map(c => c.name.split(' ')[0])

  return (
    <div className="flex h-full">
      {/* Left — Thread List */}
      <aside className="w-72 border-r border-ink-border bg-ink-dark shrink-0 flex flex-col">
        <div className="px-4 py-3 border-b border-ink-border">
          <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">Threads</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {episodeThreads.length === 0 && (
            <p className="px-4 py-6 text-xs text-ink-muted font-sans italic text-center">No threads for this episode yet.</p>
          )}
          {episodeThreads.map((t) => {
            const sc = statusConfig[t.status]
            return (
              <button
                key={t.id}
                onClick={() => setActiveThreadId(t.id)}
                className={`w-full text-left px-4 py-3 border-b border-ink-border/50 transition-colors ${
                  resolvedActiveThread === t.id ? 'bg-ink-panel' : 'hover:bg-ink-panel/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-sans font-medium ${resolvedActiveThread === t.id ? 'text-ink-light' : 'text-ink-text'}`}>
                    {t.label}
                  </span>
                  {t.unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-ink-gold text-ink-black text-[10px] font-mono font-medium flex items-center justify-center">
                      {t.unread}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-muted font-sans">{t.pageRange}</span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono border ${sc.color}`}>
                    {sc.icon}
                    {sc.label}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Page Tracker */}
        <div className="px-4 py-3 border-t border-ink-border">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-2">{activeEpisode ? `EP${activeEpisode.number} Page Status` : 'Page Status'}</span>
          <div className="flex gap-1.5 flex-wrap">
            {pageTracker.map((p) => {
              const colors: Record<string, string> = {
                approved: 'bg-status-approved',
                draft_received: 'bg-status-draft',
                submitted: 'bg-status-submitted',
                in_progress: 'bg-status-progress',
                changes_requested: 'bg-red-400',
                draft: 'bg-ink-muted/50',
              }
              return (
                <div key={p.page} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-1.5 rounded-full ${colors[p.status]}`} />
                  <span className="text-[9px] text-ink-muted font-mono">P{p.page}</span>
                </div>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Main — Messages */}
      <div className="flex-1 flex flex-col">
        {!thread ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ChevronRight size={32} className="text-ink-muted mb-3 rotate-90" />
            <p className="text-sm text-ink-text font-sans">Select a thread to view messages.</p>
          </div>
        ) : (
          <>
        {/* Thread Header */}
        <div className="px-6 py-3 border-b border-ink-border bg-ink-dark/50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-sans font-medium text-ink-light">{thread.label}</h3>
              <ChevronRight size={12} className="text-ink-muted" />
              <span className="text-xs text-ink-text font-sans">{thread.pageRange}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(() => {
              const sc = statusConfig[thread.status]
              return (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-mono border ${sc.color}`}>
                  {sc.icon}
                  {sc.label}
                </span>
              )
            })()}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {displayMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'writer' ? '' : ''}`}
            >
              <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-mono font-medium ${
                msg.sender === 'writer' ? 'bg-ink-gold/20 text-ink-gold' : 'bg-tag-page/20 text-tag-page'
              }`}>
                {msg.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-sans font-medium text-ink-light">{msg.name}</span>
                  <span className="text-[10px] text-ink-muted font-sans">{msg.timestamp}</span>
                </div>
                {msg.text && (
                  <p className="text-sm text-ink-text font-sans leading-relaxed">{msg.text}</p>
                )}
                {msg.image && (
                  <div className="mt-2 rounded-lg border border-ink-border bg-ink-panel overflow-hidden max-w-md">
                    {isUrl(msg.imageLabel) ? (
                      <img src={msg.imageLabel} alt="Draft artwork" className="w-full max-h-64 object-contain bg-ink-panel" />
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-ink-muted/30 to-ink-panel flex items-center justify-center relative">
                        <div className="absolute inset-0 opacity-10" style={{
                          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(212,168,67,0.1) 10px, rgba(212,168,67,0.1) 11px)',
                        }} />
                        <div className="flex flex-col items-center gap-2 relative z-10">
                          <Image size={24} className="text-ink-muted" />
                          <span className="text-xs text-ink-muted font-sans">Draft artwork</span>
                        </div>
                      </div>
                    )}
                    {msg.imageLabel && (
                      <div className="px-3 py-2 border-t border-ink-border">
                        <span className="text-xs text-ink-text font-sans truncate block">
                          {isUrl(msg.imageLabel) ? 'Uploaded artwork' : msg.imageLabel}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Upload Draft panel */}
        {showUpload && (
          <div className="px-6 pt-3 border-t border-ink-border bg-ink-dark/50">
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`rounded-lg border-2 border-dashed transition-colors ${dragOver ? 'border-ink-gold bg-ink-gold/5' : 'border-ink-border bg-ink-panel'}`}
            >
              {uploadPreview ? (
                <div className="p-3 space-y-2">
                  <img src={uploadPreview} alt="Preview" className="w-full max-h-48 object-contain rounded" />
                  {/* Panel picker */}
                  {allPanels.length > 0 && (
                    <select
                      value={selectedPanelId}
                      onChange={e => setSelectedPanelId(e.target.value)}
                      className="w-full bg-ink-panel border border-ink-border rounded px-2.5 py-1.5 text-xs font-sans text-ink-text outline-none focus:border-ink-gold/50"
                    >
                      <option value="">Link to panel…</option>
                      {allPanels.map(p => (
                        <option key={p.id} value={p.id}>P{p.pageNumber} / Panel {p.number}</option>
                      ))}
                    </select>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={attachUpload}
                      disabled={uploading || (isSupabaseConfigured && !selectedPanelId)}
                      className="flex-1 py-1.5 rounded text-xs font-sans bg-ink-gold text-ink-black font-semibold hover:bg-ink-gold-dim transition-colors disabled:opacity-50"
                    >
                      {uploading ? 'Uploading…' : 'Send as Draft'}
                    </button>
                    <button
                      onClick={() => { setUploadPreview(null); setUploadFile(null); setSelectedPanelId(''); setShowUpload(false) }}
                      className="px-3 py-1.5 rounded text-xs font-sans text-ink-muted hover:text-ink-text transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => uploadInputRef.current?.click()}
                  className="w-full py-5 flex flex-col items-center gap-2 text-ink-muted hover:text-ink-text transition-colors"
                >
                  <Image size={20} />
                  <span className="text-xs font-sans">Drop artwork here or click to select</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-6 py-3 border-t border-ink-border bg-ink-dark/50">
          <div className="flex items-center gap-3 bg-ink-panel rounded-lg px-4 py-2.5 border border-ink-border">
            <button
              aria-label="Attach file"
              onClick={() => uploadInputRef.current?.click()}
              className="text-ink-muted hover:text-ink-text transition-colors"
            >
              <Paperclip size={16} />
            </button>
            <button
              aria-label="Upload draft artwork"
              onClick={() => setShowUpload(v => !v)}
              className={`transition-colors ${showUpload ? 'text-ink-gold' : 'text-ink-muted hover:text-ink-text'}`}
            >
              <Image size={16} />
            </button>
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { handleFileSelect(f); setShowUpload(true) } }}
            />
            <input
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={e => {
                setInputText(e.target.value)
                broadcastTyping()
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void handleSend()
                }
              }}
              className="flex-1 bg-transparent text-sm font-sans text-ink-light placeholder:text-ink-muted outline-none"
            />
            <button
              aria-label="Send message"
              onClick={handleSend}
              disabled={sending || !inputText.trim()}
              className="w-7 h-7 rounded-md bg-ink-gold flex items-center justify-center hover:bg-ink-gold-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={13} className="text-ink-black" />
            </button>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Right — Collaborators */}
      <aside className="w-56 border-l border-ink-border bg-ink-dark shrink-0 flex flex-col">
        <div className="px-4 py-3 border-b border-ink-border flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">Team</span>
          {user && (
            <button
              aria-label="Invite collaborator"
              onClick={() => { setShowInvite(v => !v); setInviteStatus(null) }}
              className="text-ink-muted hover:text-ink-gold transition-colors"
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5v14" />
              </svg>
            </button>
          )}
        </div>
        {showInvite && (
          <div className="px-4 py-3 border-b border-ink-border space-y-2">
            <input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="w-full bg-ink-panel border border-ink-border rounded px-2.5 py-1.5 text-xs font-sans text-ink-light placeholder:text-ink-muted outline-none focus:border-ink-gold/50 transition-colors"
            />
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="w-full bg-ink-panel border border-ink-border rounded px-2.5 py-1.5 text-xs font-sans text-ink-text outline-none focus:border-ink-gold/50 transition-colors"
            >
              <option value="artist">Artist</option>
              <option value="colorist">Colorist</option>
              <option value="letterer">Letterer</option>
              <option value="writer">Writer</option>
            </select>
            {inviteStatus && (
              <p className={`text-[10px] font-sans ${inviteStatus === 'sent' ? 'text-status-approved' : 'text-red-400'}`}>
                {inviteStatus === 'sent' ? 'Invitation sent.' : inviteStatus}
              </p>
            )}
            <button
              disabled={inviting || !inviteEmail.trim()}
              onClick={async () => {
                if (!project.id) return
                setInviting(true)
                const err = await inviteMember(project.id, inviteEmail.trim(), inviteRole)
                setInviteStatus(err ?? 'sent')
                if (!err) { setInviteEmail(''); setInviteRole('artist') }
                setInviting(false)
              }}
              className="w-full py-1.5 rounded text-[11px] font-sans bg-ink-gold text-ink-black font-semibold hover:bg-ink-gold-dim transition-colors disabled:opacity-50"
            >
              {inviting ? 'Sending…' : 'Send Invite'}
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto py-2">
          {displayCollaborators.map((c) => (
            <div key={c.id} className="px-4 py-3 flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-ink-panel flex items-center justify-center text-xs font-mono text-ink-text">
                  {c.name[0]}
                </div>
                {typingUsers.has(c.id) && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-ink-dark bg-status-approved animate-pulse" />
                )}
              </div>
              <div>
                <div className="text-xs font-sans text-ink-light">{c.name}</div>
                <div className="text-[10px] text-ink-muted font-sans capitalize">{c.role}</div>
              </div>
            </div>
          ))}
          {typingNames.length > 0 && (
            <div className="px-4 py-2">
              <span className="text-[10px] text-ink-muted font-sans italic">
                {typingNames.join(', ')} {typingNames.length === 1 ? 'is' : 'are'} typing…
              </span>
            </div>
          )}
        </div>

        {/* Deliverables Summary */}
        <div className="px-4 py-3 border-t border-ink-border">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-2">Deliverables</span>
          <div className="space-y-2">
            {deliverables.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={item.color}>{item.icon}</span>
                  <span className="text-[11px] text-ink-text font-sans">{item.label}</span>
                </div>
                <span className="text-xs font-mono text-ink-light">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
