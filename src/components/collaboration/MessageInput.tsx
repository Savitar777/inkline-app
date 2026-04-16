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
