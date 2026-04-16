import { describe, expect, it } from 'vitest'
import { parseScriptText } from './scriptImportService'

describe('parseScriptText', () => {
  it('maps structured script markers into episodes, pages, panels, and content blocks', () => {
    const parsed = parseScriptText([
      'EPISODE 12: Homecoming',
      'PAGE 1',
      'PANEL 1',
      'A rainy city skyline.',
      'CAPTION: Night fell early.',
      'MIRA: We are late.',
      'SFX: VRRRM',
      '',
      'PANEL 2',
      'Cole waits by the window.',
    ].join('\n'))

    expect(parsed.episodesDetected).toBe(1)
    expect(parsed.pagesDetected).toBe(1)
    expect(parsed.panelsDetected).toBe(2)
    expect(parsed.episodes[0].title).toBe('Homecoming')
    expect(parsed.episodes[0].pages[0].panels[0].description).toBe('A rainy city skyline.')
    expect(parsed.episodes[0].pages[0].panels[0].content).toEqual([
      expect.objectContaining({ type: 'caption', text: 'Night fell early.' }),
      expect.objectContaining({ type: 'dialogue', character: 'MIRA', text: 'We are late.' }),
      expect.objectContaining({ type: 'sfx', text: 'VRRRM' }),
    ])
  })
})
