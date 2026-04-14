import { memo, useState, useMemo } from 'react'
import { useProject } from '../context/ProjectContext'
import { getEpisodeProductionSummaries, getPageHeatmap, getRoleWorkload } from '../domain/productionSelectors'
import { STATUS_BG_CLASSES, STATUS_LABELS, ALL_PANEL_STATUSES } from '../domain/statusColors'
import EpisodeDashboard from '../components/production/EpisodeDashboard'
import PageHeatmap from '../components/production/PageHeatmap'
import RoleWorkloadView from '../components/production/RoleWorkloadView'
import type { ProductionRole } from '../types'

type TrackerTab = 'dashboard' | 'heatmap' | 'workload'

function ProductionTracker() {
  const { project } = useProject()
  const [tab, setTab] = useState<TrackerTab>('dashboard')
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null)
  const [activeRole, setActiveRole] = useState<ProductionRole>('artist')

  const summaries = useMemo(() => getEpisodeProductionSummaries(project), [project])
  const heatmapEntries = useMemo(() => getPageHeatmap(project, selectedEpisodeId ?? undefined), [project, selectedEpisodeId])
  const workloadItems = useMemo(() => getRoleWorkload(project, activeRole), [project, activeRole])

  // Overall stats
  const totalPanels = summaries.reduce((sum, s) => sum + s.statusCounts.total, 0)
  const totalApproved = summaries.reduce((sum, s) => sum + s.statusCounts.approved, 0)
  const overallPct = totalPanels > 0 ? Math.round((totalApproved / totalPanels) * 100) : 0

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ink-border bg-ink-dark/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl text-ink-light">Production Tracker</h2>
              <p className="text-xs text-ink-text font-sans mt-1">
                {summaries.length} episode{summaries.length !== 1 ? 's' : ''} · {totalPanels} panel{totalPanels !== 1 ? 's' : ''} · {overallPct}% complete
              </p>
            </div>
            <div className="flex gap-2">
              {([
                { id: 'dashboard' as TrackerTab, label: 'Dashboard' },
                { id: 'heatmap' as TrackerTab, label: 'Heatmap' },
                { id: 'workload' as TrackerTab, label: 'Workload' },
              ]).map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-sans border transition-colors ${
                    tab === t.id
                      ? 'bg-ink-gold/10 text-ink-gold border-ink-gold/30'
                      : 'text-ink-muted border-ink-border hover:text-ink-text'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Episode filter for heatmap */}
          {tab === 'heatmap' && project.episodes.length > 1 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans">Filter:</span>
              <button
                onClick={() => setSelectedEpisodeId(null)}
                className={`px-2 py-1 rounded text-[11px] font-sans border transition-colors ${
                  selectedEpisodeId === null
                    ? 'bg-ink-gold/10 text-ink-gold border-ink-gold/30'
                    : 'text-ink-muted border-ink-border hover:text-ink-text'
                }`}
              >
                All
              </button>
              {project.episodes.map(ep => (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEpisodeId(ep.id)}
                  className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                    selectedEpisodeId === ep.id
                      ? 'bg-ink-gold/10 text-ink-gold border-ink-gold/30'
                      : 'text-ink-muted border-ink-border hover:text-ink-text'
                  }`}
                >
                  EP{ep.number}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'dashboard' && <EpisodeDashboard summaries={summaries} />}
          {tab === 'heatmap' && (
            <PageHeatmap
              entries={heatmapEntries}
              episodes={project.episodes}
            />
          )}
          {tab === 'workload' && (
            <RoleWorkloadView
              items={workloadItems}
              activeRole={activeRole}
              onRoleChange={setActiveRole}
            />
          )}
        </div>
      </div>

      {/* Right Sidebar — Overview */}
      <aside className="w-64 border-l border-ink-border bg-ink-dark shrink-0 flex flex-col">
        <div className="px-4 py-3 border-b border-ink-border">
          <span className="text-xs uppercase tracking-wider text-ink-text font-sans font-medium">Overview</span>
        </div>

        {/* Completion Ring */}
        <div className="px-4 py-6 border-b border-ink-border flex flex-col items-center">
          <div className="relative w-28 h-28">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#2A2A2A" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="#D4A843"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${overallPct * 2.64} ${264 - overallPct * 2.64}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-mono text-ink-light">{overallPct}%</span>
              <span className="text-[10px] text-ink-muted font-sans">complete</span>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="px-4 py-4 flex-1 overflow-y-auto">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted font-sans block mb-3">Status Breakdown</span>
          <div className="space-y-2">
            {ALL_PANEL_STATUSES.map(status => {
              const count = summaries.reduce((sum, s) => sum + s.statusCounts[status], 0)
              return (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-sm ${STATUS_BG_CLASSES[status]}`} />
                  <span className="text-[11px] text-ink-text font-sans flex-1">{STATUS_LABELS[status]}</span>
                  <span className="text-xs font-mono text-ink-muted">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}

export default memo(ProductionTracker)
