import { memo, useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from '../../icons'
import { useProject } from '../../context/ProjectContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { getCalendarEntries } from '../../domain/scheduleSelectors'
import CalendarDay from './CalendarDay'
import DeadlinePopover from './DeadlinePopover'
import type { CalendarEntry, ProductionRole } from '../../types'

const ROLE_DOT: Record<ProductionRole, string> = {
  writer: 'bg-blue-400',
  artist: 'bg-pink-400',
  letterer: 'bg-green-400',
  colorist: 'bg-yellow-300',
}

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const ALL_ROLES: ProductionRole[] = ['writer', 'artist', 'letterer', 'colorist']

function CalendarView() {
  const { project, setEpisodeDeadline, setPageDeadline } = useProject()
  const bp = useBreakpoint()
  const mobile = bp === 'mobile'

  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())
  const [activeRoles, setActiveRoles] = useState<Set<ProductionRole>>(new Set(ALL_ROLES))
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [popoverEntry, setPopoverEntry] = useState<CalendarEntry | null>(null)
  const [popoverDate, setPopoverDate] = useState<string | null>(null)

  const entries = useMemo(() => getCalendarEntries(project), [project])

  const filteredEntries = useMemo(() =>
    entries.filter(e => !e.assignedRole || activeRoles.has(e.assignedRole)),
    [entries, activeRoles]
  )

  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>()
    for (const e of filteredEntries) {
      const arr = map.get(e.date) ?? []
      arr.push(e)
      map.set(e.date, arr)
    }
    return map
  }, [filteredEntries])

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    let startDow = firstDay.getDay() - 1
    if (startDow < 0) startDow = 6

    const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = []

    const prevLast = new Date(year, month, 0).getDate()
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevLast - i
      const prevMonth = month === 0 ? 11 : month - 1
      const prevYear = month === 0 ? year - 1 : year
      days.push({
        day: d,
        dateStr: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: false,
      })
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({
        day: d,
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: true,
      })
    }

    const remaining = 7 - (days.length % 7)
    if (remaining < 7) {
      const nextMonth = month === 11 ? 0 : month + 1
      const nextYear = month === 11 ? year + 1 : year
      for (let d = 1; d <= remaining; d++) {
        days.push({
          day: d,
          dateStr: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
          isCurrentMonth: false,
        })
      }
    }

    return days
  }, [year, month])

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const toggleRole = (role: ProductionRole) => {
    setActiveRoles(prev => {
      const next = new Set(prev)
      if (next.has(role)) next.delete(role)
      else next.add(role)
      return next
    })
  }

  const handleSaveDeadline = useCallback((episodeId: string, pageId: string | undefined, deadline: string, role: ProductionRole) => {
    if (pageId) {
      setPageDeadline(episodeId, pageId, deadline, role)
    } else {
      setEpisodeDeadline(episodeId, deadline, role)
    }
    setPopoverDate(null)
    setPopoverEntry(null)
  }, [setEpisodeDeadline, setPageDeadline])

  const handleDeleteDeadline = useCallback((episodeId: string, pageId: string | undefined) => {
    if (pageId) {
      setPageDeadline(episodeId, pageId, undefined)
    } else {
      setEpisodeDeadline(episodeId, undefined)
    }
  }, [setEpisodeDeadline, setPageDeadline])

  const overdueCount = filteredEntries.filter(e => e.isOverdue).length
  const selectedDayEntries = selectedDay ? (entriesByDate.get(selectedDay) ?? []) : []

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="text-ink-muted hover:text-ink-text transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-ink-light font-serif text-base font-medium min-w-[140px] text-center">
            {monthLabel}
          </span>
          <button onClick={nextMonth} className="text-ink-muted hover:text-ink-text transition-colors">
            <ChevronRight size={16} />
          </button>
          {overdueCount > 0 && (
            <span className="text-[10px] font-sans text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
              {overdueCount} overdue
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          {ALL_ROLES.map(role => (
            <button
              key={role}
              onClick={() => toggleRole(role)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-sans capitalize transition-colors ${
                activeRoles.has(role)
                  ? 'bg-ink-panel border border-ink-border text-ink-text'
                  : 'bg-transparent border border-transparent text-ink-muted/40'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${ROLE_DOT[role]}`} />
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-ink-border">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center py-1.5 text-[10px] text-ink-muted font-sans">
            {mobile ? d[0] : d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 border-l border-ink-border overflow-y-auto">
        {calendarDays.map(({ day, dateStr, isCurrentMonth }, i) => (
          <div key={i} className="border-r border-b border-ink-border relative">
            <CalendarDay
              day={day}
              isToday={dateStr === todayStr}
              isCurrentMonth={isCurrentMonth}
              entries={entriesByDate.get(dateStr) ?? []}
              mobile={mobile}
              selected={selectedDay === dateStr}
              onClickDay={() => {
                setSelectedDay(dateStr)
                if (!mobile && !(entriesByDate.get(dateStr)?.length)) {
                  setPopoverDate(dateStr)
                  setPopoverEntry(null)
                }
              }}
              onClickEntry={entry => {
                setPopoverEntry(entry)
                setPopoverDate(null)
              }}
            />
            {(popoverDate === dateStr || (popoverEntry && popoverEntry.date === dateStr)) && (
              <DeadlinePopover
                entry={popoverEntry}
                date={dateStr}
                episodes={project.episodes}
                onSave={handleSaveDeadline}
                onDelete={handleDeleteDeadline}
                onClose={() => { setPopoverDate(null); setPopoverEntry(null) }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile: selected day entries list */}
      {mobile && selectedDay && selectedDayEntries.length > 0 && (
        <div className="border-t border-ink-border px-3 py-2 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-ink-muted font-sans">
            {new Date(selectedDay + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
          {selectedDayEntries.map(entry => (
            <button
              key={entry.id}
              onClick={() => { setPopoverEntry(entry); setPopoverDate(null) }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-ink-panel border border-ink-border hover:border-ink-gold/20 transition-colors"
            >
              <div className={`w-0.5 h-7 rounded ${ROLE_DOT[entry.assignedRole ?? 'writer']}`} />
              <div className="text-left">
                <p className="text-xs text-ink-text font-sans">{entry.label}</p>
                <p className="text-[10px] text-ink-muted font-sans capitalize">
                  {entry.assignedRole ?? 'unassigned'} · {entry.completionPct}% complete
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(CalendarView)
