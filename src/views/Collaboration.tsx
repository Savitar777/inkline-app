import { useState, useEffect, useRef, useCallback, type DragEvent } from 'react'
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
import { supabase } from '../lib/supabase'
import { sendMessage, inviteMember } from '../services/projectService'
import type { Thread, Message } from '../types'

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  submitted: { label: 'Submitted', color: 'text-status-submitted bg-status-submitted/10 border-status-submitted/30', icon: <Send size={10} /> },
  in_progress: { label: 'In Progress', color: 'text-status-progress bg-status-progress/10 border-status-progress/30', icon: <Clock size={10} /> },
  draft_received: { label: 'Draft Received', color: 'text-status-draft bg-status-draft/10 border-status-draft/30', icon: <Palette size={10} /> },
  approved: { label: 'Approved', color: 'text-status-approved bg-status-approved/10 border-status-approved/30', icon: <CheckCircle2 size={10} /> },
}

const collaborators = [
  { name: 'Kai Nakamura', role: 'Lead Artist', status: 'online', avatar: 'K' },
  { name: 'Sora Lin', role: 'Colorist', status: 'away', avatar: 'S' },
  { name: 'Jake Torres', role: 'Letterer', status: 'offline', avatar: 'J' },
]

/* ─── Component ─── */

export default function Collaboration() {
  const { project, activeEpisodeId } = useProject()
  const { user, profile } = useAuth()

  const episodeThreads: Thread[] = activeEpisodeId
    ? project.threads.filter(t => t.episodeId === activeEpisodeId)
    : project.threads

  const activeEpisode = project.episodes.find(e => e.id === activeEpisodeId)

  const [activeThread, setActiveThread] = useState<string>(() => episodeThreads[0]?.id ?? '')
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [liveMessages, setLiveMessages] = useState<Message[]>([])
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('artist')
  const [inviteStatus, setInviteStatus] = useState<string | null>(null)
  const [inviting, setInviting] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => setUploadPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const attachUpload = useCallback(() => {
    if (!uploadPreview || !activeThread) return
    // In offline mode: send as a message with image flag
    const msg: Message = {
      id: `${Date.now()}`,
      sender: profile?.role === 'artist' ? 'artist' : 'writer',
      name: profile?.name ?? 'Artist',
      image: true,
      imageLabel: 'Draft artwork',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setLiveMessages(prev => [...prev, msg])
    setUploadPreview(null)
    setShowUpload(false)
  }, [uploadPreview, activeThread, profile])

  useEffect(() => {
    const first = episodeThreads[0]?.id ?? ''
    setActiveThread(first)
  }, [activeEpisodeId])

  // Sync live messages when thread changes
  useEffect(() => {
    const base = episodeThreads.find(t => t.id === activeThread)?.messages ?? []
    setLiveMessages(base)
  }, [activeThread, project.threads])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [liveMessages])

  // Supabase Realtime — subscribe to new messages on the active thread
  useEffect(() => {
    if (!activeThread || !user) return
    const channel = supabase
      .channel(`messages:${activeThread}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${activeThread}` },
        payload => {
          const row = payload.new as any
          const msg: Message = {
            id: row.id,
            sender: row.sender_id === user.id ? 'writer' : 'artist',
            name: profile?.name ?? row.sender_id,
            text: row.text ?? undefined,
            image: !!row.attachment_url,
            imageLabel: row.attachment_url ?? undefined,
            timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
          setLiveMessages(prev => [...prev, msg])
        },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeThread, user])

  const handleSend = useCallback(async () => {
    const text = inputText.trim()
    if (!text || sending) return
    setSending(true)
    setInputText('')

    if (user && activeThread) {
      // Online mode — send via Supabase (real-time will add it to liveMessages)
      await sendMessage(activeThread, user.id, text)
    } else {
      // Offline mode — append locally
      const msg: Message = {
        id: `${Date.now()}`,
        sender: 'writer',
        name: profile?.name ?? 'You',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setLiveMessages(prev => [...prev, msg])
    }
    setSending(false)
  }, [inputText, sending, user, activeThread, profile])

  const thread = episodeThreads.find(t => t.id === activeThread) ?? null
  const displayMessages = liveMessages.length > 0 ? liveMessages : (thread?.messages ?? [])

  const pageTracker = activeEpisode?.pages.map((pg, i) => ({
    page: pg.number,
    status: i === 0 ? 'approved' : i === 1 ? 'draft_received' : 'submitted',
  })) ?? []

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
                onClick={() => setActiveThread(t.id)}
                className={`w-full text-left px-4 py-3 border-b border-ink-border/50 transition-colors ${
                  activeThread === t.id ? 'bg-ink-panel' : 'hover:bg-ink-panel/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-sans font-medium ${activeThread === t.id ? 'text-ink-light' : 'text-ink-text'}`}>
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
          <div className="flex gap-1.5">
            {pageTracker.map((p) => {
              const colors: Record<string, string> = {
                approved: 'bg-status-approved',
                draft_received: 'bg-status-draft',
                submitted: 'bg-status-submitted',
                in_progress: 'bg-status-progress',
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
                    {/* Mock image placeholder */}
                    <div className="h-48 bg-gradient-to-br from-ink-muted/30 to-ink-panel flex items-center justify-center relative">
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(212,168,67,0.1) 10px, rgba(212,168,67,0.1) 11px)',
                      }} />
                      <div className="flex flex-col items-center gap-2 relative z-10">
                        <Image size={24} className="text-ink-muted" />
                        <span className="text-xs text-ink-muted font-sans">Draft artwork</span>
                      </div>
                    </div>
                    <div className="px-3 py-2 border-t border-ink-border">
                      <span className="text-xs text-ink-text font-sans">{msg.imageLabel}</span>
                    </div>
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
                  <div className="flex gap-2">
                    <button
                      onClick={attachUpload}
                      className="flex-1 py-1.5 rounded text-xs font-sans bg-ink-gold text-ink-black font-semibold hover:bg-ink-gold-dim transition-colors"
                    >
                      Send as Draft
                    </button>
                    <button
                      onClick={() => { setUploadPreview(null); setShowUpload(false) }}
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
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend() }}
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
          {collaborators.map((c) => (
            <div key={c.name} className="px-4 py-3 flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-ink-panel flex items-center justify-center text-xs font-mono text-ink-text">
                  {c.avatar}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-ink-dark ${
                  c.status === 'online' ? 'bg-status-approved' : c.status === 'away' ? 'bg-status-progress' : 'bg-ink-muted'
                }`} />
              </div>
              <div>
                <div className="text-xs font-sans text-ink-light">{c.name}</div>
                <div className="text-[10px] text-ink-muted font-sans">{c.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Deliverables Summary */}
        <div className="px-4 py-3 border-t border-ink-border">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-2">Deliverables</span>
          <div className="space-y-2">
            {[
              { label: 'Drafts received', count: 4, icon: <Palette size={11} />, color: 'text-status-draft' },
              { label: 'Approved panels', count: 12, icon: <CheckCircle2 size={11} />, color: 'text-status-approved' },
              { label: 'Awaiting review', count: 3, icon: <FileText size={11} />, color: 'text-status-submitted' },
            ].map((item) => (
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
