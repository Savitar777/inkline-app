import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Project } from '../types'

/**
 * Subscribes to panel_assets INSERT events via Supabase Realtime.
 * When a collaborator uploads new artwork, this updates the relevant
 * panel's assetUrl in local project state without requiring a refresh.
 */
export function useRealtimePanelAssets(
  projectId: string | undefined,
  setProject: (updater: (current: Project) => Project) => void,
) {
  useEffect(() => {
    if (!isSupabaseConfigured || !projectId) return

    const channel = supabase
      .channel(`panel-assets:${projectId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'panel_assets' },
        (payload) => {
          const { panel_id, url } = payload.new as { panel_id: string; url: string }
          if (!panel_id || !url) return

          setProject(current => ({
            ...current,
            episodes: current.episodes.map(ep => ({
              ...ep,
              pages: ep.pages.map(pg => ({
                ...pg,
                panels: pg.panels.map(pan =>
                  pan.id === panel_id ? { ...pan, assetUrl: url } : pan
                ),
              })),
            })),
          }))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, setProject])
}
