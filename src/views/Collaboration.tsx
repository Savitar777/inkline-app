import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import {
  ChevronRight,
  MessageSquare,
  Palette,
  CheckCircle2,
  FileText,
} from '../icons'
import { useProject } from '../context/ProjectContext'
import { useAuth } from '../context/AuthContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { supabase } from '../lib/supabase'
import { isSupabaseConfigured } from '../lib/supabase'
import { getDefaultThreadId, getEpisodeById, getEpisodeThreads } from '../domain/selectors'
import { markThreadRead, getUnreadCounts } from '../domain/unread'
import { useToast } from '../context/ToastContext'
import MobileDrawer from '../components/MobileDrawer'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { formatShortTime } from '../domain/time'
import { sendMessage, inviteMember, uploadPanelArtwork, fetchCollaborators } from '../services/projectService'
import type { Collaborator } from '../services/projectService'
import type { Thread, Message, Panel } from '../types'
import type { RealtimePostgresInsertPayload, RealtimePresenceState } from '@supabase/supabase-js'

import ThreadList, { statusConfig } from '../components/collaboration/ThreadList'
import MessageList from '../components/collaboration/MessageList'
import MessageInput from '../components/collaboration/MessageInput'
import CollaboratorSidebar from '../components/collaboration/CollaboratorSidebar'
import UploadModal from '../components/collaboration/UploadModal'
import ReferencePanel from '../components/collaboration/ReferencePanel'

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
  const { project, activeEpisodeId, updatePanel, updateThread, addMessage: addMessageToProject } = useProject()
  const { user, profile } = useAuth()
  const { activeThreadId, setActiveThreadId } = useWorkspace()
  const { showToast } = useToast()
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'
  const [showThreadDrawer, setShowThreadDrawer] = useState(false)

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
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const localMessageCounter = useRef(0)
  const threadsRef = useRef(episodeThreads)

  const resolvedActiveThread = episodeThreads.some(thread => thread.id === activeThreadId)
    ? activeThreadId ?? defaultThreadId
    : defaultThreadId
  const senderRole: 'writer' | 'artist' | 'letterer' | 'colorist' =
    profile?.role === 'artist' ? 'artist'
    : profile?.role === 'letterer' ? 'letterer'
    : profile?.role === 'colorist' ? 'colorist'
    : 'writer'

  const allPanels: (Panel & { pageNumber: number; pageId: string })[] = activeEpisode
    ? activeEpisode.pages.flatMap(pg =>
        pg.panels.map(pan => ({ ...pan, pageNumber: pg.number, pageId: pg.id }))
      )
    : []

  useEffect(() => { threadsRef.current = episodeThreads }, [episodeThreads])

  const createLocalMessageId = () => {
    localMessageCounter.current += 1
    return `local-${localMessageCounter.current}`
  }

  useEffect(() => {
    if (resolvedActiveThread && resolvedActiveThread !== activeThreadId) {
      setActiveThreadId(resolvedActiveThread)
    }
  }, [activeThreadId, resolvedActiveThread, setActiveThreadId])

  const MAX_FILE_SIZE = 10 * 1024 * 1024

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return
    if (file.size > MAX_FILE_SIZE) {
      showToast('File too large — maximum size is 10 MB.', 'error')
      return
    }
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
    if (isSupabaseConfigured && user && project.id && uploadFile && selectedPanelId) {
      setUploading(true)
      const result = await uploadPanelArtwork(project.id, selectedPanelId, uploadFile, user.id)
      setUploading(false)
      if (result) {
        const pan = allPanels.find(p => p.id === selectedPanelId)
        if (pan && activeEpisode) {
          updatePanel(activeEpisode.id, pan.pageId, pan.id, { assetUrl: result.url, status: 'draft_received' })
        }
        const panLabel = pan ? `P${pan.pageNumber}/Panel ${pan.number}` : 'a panel'
        await sendMessage(resolvedActiveThread, user.id, `Uploaded draft artwork for ${panLabel}`, result.url)
        const epThread = episodeThreads.find(t => t.id === resolvedActiveThread)
        if (epThread && epThread.status !== 'approved') {
          updateThread(resolvedActiveThread, { status: 'draft_received' })
        }
      }
    } else {
      const msg: Message = {
        id: createLocalMessageId(), sender: senderRole, name: profile?.name ?? 'Artist',
        image: true, imageLabel: 'Draft artwork', timestamp: formatShortTime(new Date()),
      }
      setLiveMessagesByThread(prev => applyThreadMessages(prev, resolvedActiveThread, messages => [...messages, msg], threadsRef.current))
      addMessageToProject(resolvedActiveThread, msg)
    }
    setUploadPreview(null); setUploadFile(null); setSelectedPanelId(''); setShowUpload(false)
  }

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
          if (row.sender_id === user.id) return
          const sender = collaborators.find(c => c.id === row.sender_id)
          const senderName = sender?.name ?? row.sender_id?.slice(0, 8)
          const msg: Message = {
            id: row.id,
            sender: (sender?.role === 'artist' ? 'artist' : sender?.role === 'letterer' ? 'letterer' : sender?.role === 'colorist' ? 'colorist' : 'writer') as Message['sender'],
            name: senderName,
            text: row.text ?? undefined,
            image: !!row.attachment_url,
            imageLabel: row.attachment_url ?? undefined,
            timestamp: formatShortTime(row.created_at),
          }
          setLiveMessagesByThread(prev => applyThreadMessages(
            prev, resolvedActiveThread,
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
          if (uid !== user.id && presences.some(presence => presence.typing)) typing.add(uid)
        }
        setTypingUsers(typing)
      })
      .subscribe()
    return () => { clearTimeout(typingTimeout.current); typingChannelRef.current = null; supabase.removeChannel(channel) }
  }, [resolvedActiveThread, user])

  const broadcastTyping = () => {
    if (!resolvedActiveThread || !user || !isSupabaseConfigured || !typingChannelRef.current) return
    typingChannelRef.current.track({ typing: true })
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => { typingChannelRef.current?.track({ typing: false }) }, 2000)
  }

  const handleSend = async () => {
    const text = inputText.trim()
    if (!text || sending) return
    setSending(true); setInputText('')
    if (user && resolvedActiveThread) {
      const msgId = await sendMessage(resolvedActiveThread, user.id, text)
      const localMsg: Message = { id: msgId ?? createLocalMessageId(), sender: senderRole, name: profile?.name ?? 'You', text, timestamp: formatShortTime(new Date()) }
      setLiveMessagesByThread(prev => applyThreadMessages(prev, resolvedActiveThread, messages => [...messages, localMsg], threadsRef.current))
    } else {
      const msg: Message = { id: createLocalMessageId(), sender: senderRole, name: profile?.name ?? 'You', text, timestamp: formatShortTime(new Date()) }
      if (resolvedActiveThread) {
        setLiveMessagesByThread(prev => applyThreadMessages(prev, resolvedActiveThread, messages => [...messages, msg], threadsRef.current))
        addMessageToProject(resolvedActiveThread, msg)
      }
    }
    setSending(false)
  }

  const thread = episodeThreads.find(t => t.id === resolvedActiveThread) ?? null
  const displayMessages: Message[] = thread ? (liveMessagesByThread[resolvedActiveThread] ?? thread.messages) : []
  const unreadCounts = getUnreadCounts(episodeThreads)

  useEffect(() => {
    if (!thread) return
    const messageCount = liveMessagesByThread[resolvedActiveThread]?.length ?? thread.messages.length
    markThreadRead(resolvedActiveThread, messageCount)
  }, [resolvedActiveThread, displayMessages.length, liveMessagesByThread, thread])

  const pageTracker = useMemo(() => activeEpisode?.pages.map(pg => {
    const statuses = pg.panels.map(pan => pan.status ?? 'draft')
    const pageStatus = statuses.includes('draft') ? 'draft'
      : statuses.includes('submitted') ? 'submitted'
      : statuses.includes('in_progress') ? 'in_progress'
      : statuses.includes('changes_requested') ? 'changes_requested'
      : statuses.includes('draft_received') ? 'draft_received'
      : 'approved'
    return { page: pg.number, status: pageStatus }
  }) ?? [], [activeEpisode])

  const deliverables = useMemo(() => {
    const all = allPanels.map(p => p.status ?? 'draft')
    return [
      { label: 'Drafts received', count: all.filter(s => s === 'draft_received').length, icon: <Palette size={11} />, color: 'text-status-draft' },
      { label: 'Approved panels', count: all.filter(s => s === 'approved').length, icon: <CheckCircle2 size={11} />, color: 'text-status-approved' },
      { label: 'Awaiting review', count: all.filter(s => s === 'submitted' || s === 'in_progress').length, icon: <FileText size={11} />, color: 'text-status-submitted' },
    ]
  }, [allPanels])

  const displayCollaborators = collaborators.length > 0 ? collaborators : MOCK_COLLABORATORS.map(c => ({
    id: c.name, name: c.name, role: c.role, email: '', avatarUrl: null,
  }))
  const typingNames = collaborators.filter(c => typingUsers.has(c.id)).map(c => c.name.split(' ')[0])

  const threadListContent = (
    <ThreadList
      episodeThreads={episodeThreads}
      resolvedActiveThread={resolvedActiveThread}
      unreadCounts={unreadCounts}
      activeEpisodeLabel={activeEpisode ? String(activeEpisode.number) : null}
      pageTracker={pageTracker}
      onSelectThread={(id) => { setActiveThreadId(id); if (isMobile) setShowThreadDrawer(false) }}
    />
  )

  return (
    <div className="flex h-full">
      {/* Left — Thread List (desktop/tablet) */}
      {!isMobile && (
        <aside className="w-72 border-r border-ink-border bg-ink-dark shrink-0 flex flex-col">
          <div className="px-4 py-3 border-b border-ink-border">
            <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">Threads</span>
          </div>
          {threadListContent}
        </aside>
      )}

      {/* Mobile thread drawer */}
      {isMobile && (
        <MobileDrawer open={showThreadDrawer} onClose={() => setShowThreadDrawer(false)} title="Threads" side="left">
          {threadListContent}
        </MobileDrawer>
      )}

      {/* Main — Messages */}
      <div className="flex-1 flex flex-col">
        {!thread ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {isMobile && (
              <button onClick={() => setShowThreadDrawer(true)} className="mb-4 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-sans text-ink-gold border border-ink-gold/30 hover:bg-ink-gold/10 transition-colors">
                <MessageSquare size={13} /> View Threads
              </button>
            )}
            <ChevronRight size={32} className="text-ink-muted mb-3 rotate-90" />
            <p className="text-sm text-ink-text font-sans">Select a thread to view messages.</p>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className={`${isMobile ? 'px-3' : 'px-6'} py-3 border-b border-ink-border bg-ink-dark/50 flex items-center justify-between`}>
              <div className="flex items-center gap-2 min-w-0">
                {isMobile && (
                  <button aria-label="Open threads" onClick={() => setShowThreadDrawer(true)} className="shrink-0 p-1 rounded text-ink-muted hover:text-ink-gold transition-colors">
                    <MessageSquare size={16} />
                  </button>
                )}
                <h3 className="text-sm font-sans font-medium text-ink-light truncate">{thread.label}</h3>
                {!isMobile && <ChevronRight size={12} className="text-ink-muted shrink-0" />}
                {!isMobile && <span className="text-xs text-ink-text font-sans">{thread.pageRange}</span>}
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

            <MessageList messages={displayMessages} liveMessagesByThread={liveMessagesByThread} resolvedActiveThread={resolvedActiveThread} />

            {showUpload && (
              <UploadModal
                dragOver={dragOver}
                uploadPreview={uploadPreview}
                uploading={uploading}
                selectedPanelId={selectedPanelId}
                allPanels={allPanels}
                isSupabaseConfigured={!!isSupabaseConfigured}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onSelectPanel={setSelectedPanelId}
                onAttachUpload={attachUpload}
                onCancel={() => { setUploadPreview(null); setUploadFile(null); setSelectedPanelId(''); setShowUpload(false) }}
                onClickSelect={() => uploadInputRef.current?.click()}
              />
            )}

            <input ref={uploadInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { handleFileSelect(f); setShowUpload(true) } }} />

            <MessageInput
              inputText={inputText}
              sending={sending}
              showUpload={showUpload}
              onInputChange={setInputText}
              onSend={handleSend}
              onToggleUpload={() => setShowUpload(v => !v)}
              onFileSelect={(f) => { handleFileSelect(f); setShowUpload(true) }}
              onBroadcastTyping={broadcastTyping}
            />
          </>
        )}
      </div>

      {/* Right — Reference Files (desktop/tablet only) */}
      {!isMobile && activeEpisode && (
        <aside className="w-64 border-l border-ink-border bg-ink-dark shrink-0 flex flex-col">
          <ReferencePanel projectId={project.id} episodeId={activeEpisode.id} />
        </aside>
      )}

      {/* Right — Collaborators (desktop/tablet only) */}
      {!isMobile && (
        <CollaboratorSidebar
          displayCollaborators={displayCollaborators}
          typingUsers={typingUsers}
          typingNames={typingNames}
          deliverables={deliverables}
          showInvite={showInvite}
          inviteEmail={inviteEmail}
          inviteRole={inviteRole}
          inviteStatus={inviteStatus}
          inviting={inviting}
          hasUser={!!user}
          projectId={project.id}
          onToggleInvite={() => { setShowInvite(v => !v); setInviteStatus(null) }}
          onInviteEmailChange={setInviteEmail}
          onInviteRoleChange={setInviteRole}
          onSendInvite={async () => {
            if (!project.id) return
            setInviting(true)
            const err = await inviteMember(project.id, inviteEmail.trim(), inviteRole)
            setInviteStatus(err ?? 'sent')
            if (!err) { setInviteEmail(''); setInviteRole('artist') }
            setInviting(false)
          }}
        />
      )}
    </div>
  )
}
