import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import LoadingSurface from './LoadingSurface'

describe('LoadingSurface', () => {
  it('renders labelled shell and section loading states', () => {
    const shellMarkup = renderToStaticMarkup(createElement(LoadingSurface, {
      variant: 'shell',
      label: 'Loading workspace',
    }))

    const sectionMarkup = renderToStaticMarkup(createElement(LoadingSurface, {
      variant: 'section',
      label: 'Loading assets',
      lines: 2,
    }))

    expect(shellMarkup).toContain('Loading workspace')
    expect(shellMarkup).toContain('ink-shimmer')
    expect(sectionMarkup).toContain('Loading assets')
    expect(sectionMarkup).toContain('role="status"')
  })
})
