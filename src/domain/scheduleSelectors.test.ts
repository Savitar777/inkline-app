import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultProject } from '../data/mockData'
import { getCalendarEntries } from './scheduleSelectors'

describe('getCalendarEntries', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('derives sorted entries and marks incomplete past deadlines as overdue', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-16T12:00:00Z'))

    const project = structuredClone(defaultProject)
    project.episodes[2].deadline = '2026-04-15'
    project.episodes[2].assignedRole = 'artist'
    project.episodes[2].pages[0].deadline = '2026-04-20'
    project.episodes[2].pages[0].assignedRole = 'letterer'
    project.episodes[2].pages[0].panels = project.episodes[2].pages[0].panels.map(panel => ({
      ...panel,
      status: 'approved',
    }))

    const entries = getCalendarEntries(project)

    expect(entries.map(entry => entry.label)).toEqual(['Ep 3', 'Ep 3 · Pg 1'])
    expect(entries[0]).toMatchObject({
      type: 'episode',
      assignedRole: 'artist',
      isOverdue: true,
    })
    expect(entries[1]).toMatchObject({
      type: 'page',
      assignedRole: 'letterer',
      isOverdue: false,
      completionPct: 100,
    })
  })
})
