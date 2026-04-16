import { describe, expect, it } from 'vitest'
import type { Episode } from '../types'
import { runPreflight } from './preflightService'

describe('runPreflight', () => {
  it('reports blocking issues and print warnings for risky export settings', () => {
    const episode: Episode = {
      id: 'ep-test',
      number: 1,
      title: 'Smoke Test',
      brief: '',
      pages: [
        {
          id: 'page-1',
          number: 1,
          layoutNote: '',
          panels: [
            {
              id: 'panel-approved',
              number: 1,
              shot: '',
              description: '',
              status: 'approved',
              content: [],
            },
            {
              id: 'panel-open-cr',
              number: 2,
              shot: '',
              description: '',
              status: 'submitted',
              changeRequests: [
                {
                  id: 'cr-1',
                  note: 'Needs more contrast',
                  status: 'open',
                  createdBy: 'Henry',
                  createdAt: '2026-04-16T10:00:00Z',
                },
              ],
              content: [],
            },
          ],
        },
      ],
    }

    const result = runPreflight(episode, {
      format: 'comic',
      dpi: 150,
      outputFormat: 'pdf',
      colorProfile: 'rgb',
      scope: 'episode',
    })

    expect(result.pass).toBe(false)
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'panels_not_approved', severity: 'error' }),
      expect.objectContaining({ code: 'open_change_requests', severity: 'error' }),
      expect.objectContaining({ code: 'low_resolution_print', severity: 'warning' }),
    ]))
    expect(result.estimatedFileSizeMB).toBeGreaterThan(0)
  })
})
