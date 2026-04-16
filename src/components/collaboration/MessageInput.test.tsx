import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import MessageInput from './MessageInput'

describe('MessageInput', () => {
  it('only advertises the supported draft artwork action', () => {
    const markup = renderToStaticMarkup(createElement(MessageInput as never, {
      inputText: '',
      sending: false,
      showUpload: false,
      onInputChange: () => {},
      onSend: () => {},
      onToggleUpload: () => {},
      onFileSelect: () => {},
      onBroadcastTyping: () => {},
    }))

    expect(markup).toContain('Upload draft artwork')
    expect(markup).not.toContain('Attach file (coming soon)')
    expect(markup).not.toContain('General file attachments coming soon')
  })
})
