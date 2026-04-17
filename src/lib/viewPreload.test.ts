import { describe, expect, it } from 'vitest'
import { getIdlePreloadTargets } from './viewPreload'

describe('getIdlePreloadTargets', () => {
  it('warms likely next views for the active workspace route', () => {
    expect(getIdlePreloadTargets('editor')).toEqual(['collab'])
    expect(getIdlePreloadTargets('collab')).toEqual(['compile'])
    expect(getIdlePreloadTargets('compile')).toEqual([])
    expect(getIdlePreloadTargets('story-bible')).toEqual([])
    expect(getIdlePreloadTargets('character-bible')).toEqual([])
    expect(getIdlePreloadTargets('production')).toEqual([])
  })
})
