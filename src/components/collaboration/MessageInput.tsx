import { useRef } from 'react'
import { Send, Paperclip, Image } from '../../icons'

interface MessageInputProps {
  inputText: string
  sending: boolean
  showUpload: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onToggleUpload: () => void
  onFileSelect: (file: File) => void
  onBroadcastTyping: () => void
}

export default function MessageInput({
  inputText,
  sending,
  showUpload,
  onInputChange,
  onSend,
  onToggleUpload,
  onFileSelect,
  onBroadcastTyping,
}: MessageInputProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="px-6 py-3 border-t border-ink-border bg-ink-dark/50">
      <div className="flex items-center gap-3 bg-ink-panel rounded-lg px-4 py-2.5 border border-ink-border">
        <button
          aria-label="Attach file (coming soon)"
          disabled
          title="General file attachments coming soon"
          className="text-ink-muted/40 cursor-not-allowed"
        >
          <Paperclip size={16} />
        </button>
        <button
          aria-label="Upload draft artwork"
          onClick={onToggleUpload}
          className={`transition-colors ${showUpload ? 'text-ink-gold' : 'text-ink-muted hover:text-ink-text'}`}
        >
          <Image size={16} />
        </button>
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) { onFileSelect(f); onToggleUpload() } }}
        />
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
