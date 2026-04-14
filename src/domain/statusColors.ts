import type { PanelStatus } from '../types'

export const STATUS_BG_CLASSES: Record<PanelStatus, string> = {
  draft:             'bg-ink-muted/20',
  submitted:         'bg-blue-500/30',
  in_progress:       'bg-yellow-500/30',
  draft_received:    'bg-orange-400/30',
  changes_requested: 'bg-red-500/30',
  approved:          'bg-emerald-500/30',
}

export const STATUS_BORDER_CLASSES: Record<PanelStatus, string> = {
  draft:             'border-ink-muted/30',
  submitted:         'border-blue-500/40',
  in_progress:       'border-yellow-500/40',
  draft_received:    'border-orange-400/40',
  changes_requested: 'border-red-500/40',
  approved:          'border-emerald-500/40',
}

export const STATUS_TEXT_CLASSES: Record<PanelStatus, string> = {
  draft:             'text-ink-muted',
  submitted:         'text-blue-400',
  in_progress:       'text-yellow-400',
  draft_received:    'text-orange-300',
  changes_requested: 'text-red-400',
  approved:          'text-emerald-400',
}

export const STATUS_LABELS: Record<PanelStatus, string> = {
  draft:             'Draft',
  submitted:         'Submitted',
  in_progress:       'In Progress',
  draft_received:    'Draft Received',
  changes_requested: 'Changes Requested',
  approved:          'Approved',
}

export const ALL_PANEL_STATUSES: PanelStatus[] = [
  'draft', 'submitted', 'in_progress', 'draft_received', 'changes_requested', 'approved',
]
