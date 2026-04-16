import { describe, expect, it } from 'vitest'
import { defaultProject } from '../data/mockData'
import { deriveAutoTags } from './tagDerivation'

describe('deriveAutoTags', () => {
  it('derives category, mime, location, panel, state, and character tags', () => {
    const project = structuredClone(defaultProject)
    project.episodes[2].pages[0].panels[0].panelType = 'establishing'
    project.episodes[2].pages[0].panels[0].status = 'approved'

    const tags = deriveAutoTags(
      {
        episodeId: 'ep3',
        pageId: 'p1',
        panelId: 'pan1',
      },
      'panel-assets',
      'image/png',
      'mira-boardroom-draft.png',
      project,
    )

    expect(tags).toEqual(expect.arrayContaining([
      'artwork',
      'image',
      'ep-3',
      'page-1',
      'panel-1',
      'establishing',
      'approved',
      'char:MIRA VOSS',
    ]))
  })
})
