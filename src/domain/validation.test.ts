import { describe, expect, it } from 'vitest'
import { defaultProject } from '../data/mockData'
import { parseProjectDocument, serializeProjectDocument } from './validation'

describe('parseProjectDocument', () => {
  it('accepts collaboration messages from all supported production roles', () => {
    const projectWithAllRoles = {
      ...defaultProject,
      threads: [
        {
          ...defaultProject.threads[0],
          messages: [
            {
              id: 'writer-message',
              sender: 'writer' as const,
              name: 'Writer',
              text: 'Writer note',
              timestamp: '9:00 AM',
            },
            {
              id: 'artist-message',
              sender: 'artist' as const,
              name: 'Artist',
              text: 'Artist note',
              timestamp: '9:01 AM',
            },
            {
              id: 'letterer-message',
              sender: 'letterer' as const,
              name: 'Letterer',
              text: 'Letterer note',
              timestamp: '9:02 AM',
            },
            {
              id: 'colorist-message',
              sender: 'colorist' as const,
              name: 'Colorist',
              text: 'Colorist note',
              timestamp: '9:03 AM',
            },
          ],
        },
      ],
    }

    const parsed = parseProjectDocument(serializeProjectDocument(projectWithAllRoles))

    expect(parsed.threads[0].messages.map(message => message.sender)).toEqual([
      'writer',
      'artist',
      'letterer',
      'colorist',
    ])
  })

  it('migrates older documents and restores story bible defaults', () => {
    const legacyProject = {
      ...defaultProject,
      storyBible: undefined,
    }

    const parsed = parseProjectDocument(JSON.stringify({
      __schemaVersion: 1,
      ...legacyProject,
    }))

    expect(parsed.storyBible).toEqual({
      arcs: [],
      locations: [],
      worldRules: [],
      timeline: [],
    })
  })
})
