import { memo } from 'react'
import type { CalendarEntry, ProductionRole } from '../../types'

const ROLE_COLORS: Record<ProductionRole, string> = {
  writer: 'bg-blue-400/15 border-blue-400 text-blue-400',
  artist: 'bg-pink-400/15 border-pink-400 text-pink-400',
  letterer: 'bg-green-400/15 border-green-400 text-green-400',
  colorist: 'bg-yellow-300/15 border-yellow-300 text-yellow-300',
}

const ROLE_DOT_COLORS: Record<ProductionRole, string> = {
  writer: 'bg-blue-400',
  artist: 'bg-pink-400',
  letterer: 'bg-green-400',
  colorist: 'bg-yellow-300',
}

interface CalendarDayProps {
  day: number | null
  isToday: boolean
  isCurrentMonth: boolean
  entries: CalendarEntry[]
  mobile: boolean
  selected: boolean
  onClickDay: () => void
  onClickEntry: (entry: CalendarEntry) => void
}

function CalendarDay({ day, isToday, isCurrentMonth, entries, mobile, selected, onClickDay, onClickEntry }: CalendarDayProps) {
  if (day === null) {
    return <div className="min-h-[44px] bg-ink-dark/30" />
  }

  const dimmed = !isCurrentMonth

  return (
    <div
      onClick={onClickDay}
      className={`min-h-[44px] p-1.5 cursor-pointer transition-colors ${
        selected ? 'bg-ink-panel' : 'bg-ink-dark hover:bg-ink-panel/50'
      } ${isToday ? 'ring-1 ring-purple-400/60' : ''}`}
    >
      <span className={`text-[11px] font-sans ${
        isToday
          ? 'bg-purple-400 text-ink-dark px-1.5 py-0.5 rounded-full font-semibold'
          : dimmed ? 'text-ink-muted/40' : 'text-ink-muted'
      }`}>
        {day}
      </span>

      {mobile ? (
        entries.length > 0 && (
          <div className="flex justify-center gap-0.5 mt-1">
            {entries.slice(0, 3).map(entry => (
              <div
                key={entry.id}
                className={`w-[5px] h-[5px] rounded-full ${ROLE_DOT_COLORS[entry.assignedRole ?? 'writer']}`}
              />
            ))}
            {entries.length > 3 && (
              <span className="text-[8px] text-ink-muted">+{entries.length - 3}</span>
            )}
          </div>
        )
      ) : (
        <div className="mt-1 space-y-0.5">
          {entries.slice(0, 3).map(entry => {
            const colors = ROLE_COLORS[entry.assignedRole ?? 'writer']
            return (
              <button
                key={entry.id}
                onClick={e => { e.stopPropagation(); onClickEntry(entry) }}
                className={`block w-full text-left px-1.5 py-0.5 rounded-r text-[10px] font-sans font-medium border-l-2 truncate transition-opacity ${colors} ${
                  entry.isOverdue ? 'opacity-50 line-through' : ''
                }`}
              >
                {entry.label}
              </button>
            )
          })}
          {entries.length > 3 && (
            <span className="text-[9px] text-ink-muted pl-1.5">+{entries.length - 3} more</span>
          )}
        </div>
      )}
    </div>
  )
}

export default memo(CalendarDay)
