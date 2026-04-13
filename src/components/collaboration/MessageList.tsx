import { useRef, useEffect } from 'react'
import { Image } from '../../icons'
import type { Message } from '../../types'

function isUrl(str: string | undefined): boolean {
  if (!str) return false
  return str.startsWith('http://') || str.startsWith('https://')
}

interface MessageListProps {
  messages: Message[]
  liveMessagesByThread: Record<string, Message[]>
  resolvedActiveThread: string
}

export default function MessageList({ messages, liveMessagesByThread, resolvedActiveThread }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [liveMessagesByThread, resolvedActiveThread])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-3 ${msg.sender === 'writer' ? '' : ''}`}
        >
          <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-mono font-medium ${
            msg.sender === 'writer' ? 'bg-ink-gold/20 text-ink-gold'
            : msg.sender === 'letterer' ? 'bg-purple-500/20 text-purple-400'
            : msg.sender === 'colorist' ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-tag-page/20 text-tag-page'
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
  )
}
