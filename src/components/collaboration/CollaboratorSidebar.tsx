import { memo } from 'react'
import type { Collaborator } from '../../services/projectService'

interface Deliverable {
  label: string
  count: number
  icon: React.ReactNode
  color: string
}

interface CollaboratorSidebarProps {
  displayCollaborators: Collaborator[]
  typingUsers: Set<string>
  typingNames: string[]
  deliverables: Deliverable[]
  showInvite: boolean
  inviteEmail: string
  inviteRole: string
  inviteStatus: string | null
  inviting: boolean
  hasUser: boolean
  projectId: string | undefined
  onToggleInvite: () => void
  onInviteEmailChange: (value: string) => void
  onInviteRoleChange: (value: string) => void
  onSendInvite: () => void
}

function CollaboratorSidebar({
  displayCollaborators,
  typingUsers,
  typingNames,
  deliverables,
  showInvite,
  inviteEmail,
  inviteRole,
  inviteStatus,
  inviting,
  hasUser,
  onToggleInvite,
  onInviteEmailChange,
  onInviteRoleChange,
  onSendInvite,
}: CollaboratorSidebarProps) {
  return (
    <aside className="w-56 border-l border-ink-border bg-ink-dark shrink-0 flex flex-col">
      <div className="px-4 py-3 border-b border-ink-border flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">Team</span>
        {hasUser && (
          <button
            aria-label="Invite collaborator"
            onClick={onToggleInvite}
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
            onChange={e => onInviteEmailChange(e.target.value)}
            className="w-full bg-ink-panel border border-ink-border rounded px-2.5 py-1.5 text-xs font-sans text-ink-light placeholder:text-ink-muted outline-none focus:border-ink-gold/50 transition-colors"
          />
          <select
            value={inviteRole}
            onChange={e => onInviteRoleChange(e.target.value)}
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
            onClick={onSendInvite}
            className="w-full py-1.5 rounded text-[11px] font-sans bg-ink-gold text-ink-black font-semibold hover:bg-ink-gold-dim transition-colors disabled:opacity-50"
          >
            {inviting ? 'Sending...' : 'Send Invite'}
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
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-ink-dark bg-status-approved" />
              )}
            </div>
            <div>
              <div className="text-xs font-sans text-ink-light">{c.name}</div>
              <div className={`text-[10px] font-sans capitalize ${
                c.role === 'writer' ? 'text-ink-gold'
                : c.role === 'artist' ? 'text-tag-page'
                : c.role === 'letterer' ? 'text-purple-400'
                : c.role === 'colorist' ? 'text-emerald-400'
                : 'text-ink-muted'
              }`}>{c.role}</div>
            </div>
          </div>
        ))}
        {typingNames.length > 0 && (
          <div className="px-4 py-2">
            <span className="text-[10px] text-ink-muted font-sans italic">
              {typingNames.join(', ')} {typingNames.length === 1 ? 'is' : 'are'} typing...
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
  )
}

export default memo(CollaboratorSidebar)
