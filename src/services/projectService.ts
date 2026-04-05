import { supabase } from '../lib/supabase'
import type { Project, Episode, ContentBlock, Character, Thread, Message } from '../types'

/* ─── Helpers ─── */

function uuid(): string {
  return crypto.randomUUID()
}

function handleError(context: string, error: unknown): void {
  console.error(`[projectService] ${context}:`, error)
}

/* ─── Project ─── */

export async function fetchProject(projectId: string): Promise<Project | null> {
  // Single nested query — replaces the previous N+1 approach
  const { data: proj, error: projErr } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (projErr || !proj) { handleError('fetchProject', projErr); return null }

  // Parallel fetches using Supabase nested selects
  const [
    { data: eps, error: epsErr },
    { data: chars, error: charsErr },
    { data: threads, error: threadsErr },
  ] = await Promise.all([
    supabase
      .from('episodes')
      .select('*, pages(*, panels(*, content_blocks(*)))')
      .eq('project_id', projectId)
      .order('number'),
    supabase.from('characters').select('*').eq('project_id', projectId),
    supabase
      .from('threads')
      .select('*, messages(*, sender:users(id, name, role))')
      .eq('project_id', projectId)
      .order('created_at'),
  ])

  if (epsErr) handleError('fetchProject.episodes', epsErr)
  if (charsErr) handleError('fetchProject.characters', charsErr)
  if (threadsErr) handleError('fetchProject.threads', threadsErr)

  const episodes: Episode[] = (eps ?? []).map((ep: any) => ({
    id: ep.id,
    number: ep.number,
    title: ep.title,
    brief: ep.brief,
    pages: (ep.pages ?? [])
      .sort((a: any, b: any) => a.number - b.number)
      .map((pg: any) => ({
        id: pg.id,
        number: pg.number,
        layoutNote: pg.layout_note,
        panels: (pg.panels ?? [])
          .sort((a: any, b: any) => a.order - b.order)
          .map((pan: any) => ({
            id: pan.id,
            number: pan.number,
            shot: pan.shot,
            description: pan.description,
            status: pan.status ?? undefined,
            assetUrl: pan.asset_url ?? undefined,
            content: (pan.content_blocks ?? [])
              .sort((a: any, b: any) => a.order - b.order)
              .map((b: any) => ({
                id: b.id,
                type: b.type as ContentBlock['type'],
                character: b.character ?? undefined,
                parenthetical: b.parenthetical ?? undefined,
                text: b.text,
              })),
          })),
      })),
  }))

  const mappedThreads: Thread[] = (threads ?? []).map((t: any) => ({
    id: t.id,
    episodeId: t.episode_id,
    label: t.label,
    pageRange: t.page_range,
    status: t.status as Thread['status'],
    unread: 0,
    messages: (t.messages ?? [])
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((m: any) => ({
        id: m.id,
        sender: (m.sender?.role === 'artist' ? 'artist' : 'writer') as Message['sender'],
        name: m.sender?.name ?? 'Unknown',
        text: m.text ?? undefined,
        image: !!m.attachment_url,
        imageLabel: m.attachment_url ?? undefined,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })),
  }))

  return {
    id: proj.id,
    title: proj.title,
    format: proj.format as Project['format'],
    episodes,
    characters: (chars ?? []).map((c: any) => ({
      id: c.id, name: c.name, role: c.role, desc: c.description ?? c.desc ?? '', color: c.color,
    })),
    threads: mappedThreads,
  }
}

export async function listProjects(userId: string) {
  // Fetch both owned projects and projects where user is a member
  const [{ data: owned }, { data: memberOf }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, format, created_at')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('project_members')
      .select('project:projects(id, title, format, created_at)')
      .eq('user_id', userId),
  ])

  const ownedList = owned ?? []
  const memberList = (memberOf ?? [])
    .map((m: any) => m.project)
    .filter(Boolean)
  const ownedIds = new Set(ownedList.map(p => p.id))
  return [...ownedList, ...memberList.filter((p: any) => !ownedIds.has(p.id))]
}

export async function createProject(title: string, format: Project['format'], ownerId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ title, format, owner_id: ownerId })
    .select('id')
    .single()
  if (error) { handleError('createProject', error); return null }
  return data.id
}

export async function updateProjectTitle(projectId: string, title: string) {
  const { error } = await supabase.from('projects').update({ title }).eq('id', projectId)
  if (error) handleError('updateProjectTitle', error)
}

/* ─── Episode ─── */

export async function createEpisode(projectId: string, number: number, id?: string): Promise<string | null> {
  const episodeId = id ?? uuid()
  const { error } = await supabase.from('episodes').insert({
    id: episodeId, project_id: projectId, number, title: `Episode ${number}`, brief: '',
  })
  if (error) { handleError('createEpisode', error); return null }
  return episodeId
}

export async function updateEpisode(episodeId: string, updates: { title?: string; brief?: string }) {
  const { error } = await supabase.from('episodes').update(updates).eq('id', episodeId)
  if (error) handleError('updateEpisode', error)
}

export async function deleteEpisode(episodeId: string) {
  const { error } = await supabase.from('episodes').delete().eq('id', episodeId)
  if (error) handleError('deleteEpisode', error)
}

/* ─── Page ─── */

export async function createPage(episodeId: string, number: number, id?: string): Promise<string | null> {
  const pageId = id ?? uuid()
  const { error } = await supabase.from('pages').insert({ id: pageId, episode_id: episodeId, number, layout_note: '' })
  if (error) { handleError('createPage', error); return null }
  return pageId
}

export async function updatePage(pageId: string, updates: { layout_note?: string }) {
  const { error } = await supabase.from('pages').update(updates).eq('id', pageId)
  if (error) handleError('updatePage', error)
}

export async function deletePage(pageId: string) {
  const { error } = await supabase.from('pages').delete().eq('id', pageId)
  if (error) handleError('deletePage', error)
}

/* ─── Panel ─── */

export async function createPanel(pageId: string, number: number, shot: string, id?: string): Promise<string | null> {
  const panelId = id ?? uuid()
  const { error } = await supabase.from('panels').insert({
    id: panelId, page_id: pageId, number, shot, description: '', order: number,
  })
  if (error) { handleError('createPanel', error); return null }
  return panelId
}

export async function updatePanel(panelId: string, updates: { shot?: string; description?: string; status?: string; asset_url?: string }) {
  const { error } = await supabase.from('panels').update(updates).eq('id', panelId)
  if (error) handleError('updatePanel', error)
}

export async function deletePanel(panelId: string) {
  const { error } = await supabase.from('panels').delete().eq('id', panelId)
  if (error) handleError('deletePanel', error)
}

/* ─── Content Block ─── */

export async function createContentBlock(
  panelId: string,
  type: ContentBlock['type'],
  order: number,
  id?: string,
): Promise<string | null> {
  const blockId = id ?? uuid()
  const { error } = await supabase.from('content_blocks').insert({
    id: blockId, panel_id: panelId, type, text: '', order,
  })
  if (error) { handleError('createContentBlock', error); return null }
  return blockId
}

export async function updateContentBlock(
  blockId: string,
  updates: { character?: string | null; parenthetical?: string | null; text?: string },
) {
  const { error } = await supabase.from('content_blocks').update(updates).eq('id', blockId)
  if (error) handleError('updateContentBlock', error)
}

export async function deleteContentBlock(blockId: string) {
  const { error } = await supabase.from('content_blocks').delete().eq('id', blockId)
  if (error) handleError('deleteContentBlock', error)
}

/* ─── Character ─── */

export async function createCharacter(
  projectId: string,
  char: Omit<Character, 'id'>,
  id?: string,
): Promise<string | null> {
  const charId = id ?? uuid()
  const { error } = await supabase.from('characters').insert({
    id: charId, project_id: projectId, name: char.name, role: char.role, description: char.desc, color: char.color,
  })
  if (error) { handleError('createCharacter', error); return null }
  return charId
}

export async function updateCharacter(charId: string, updates: Partial<Omit<Character, 'id'>>) {
  const dbUpdates: Record<string, any> = { ...updates }
  if ('desc' in dbUpdates) { dbUpdates.description = dbUpdates.desc; delete dbUpdates.desc }
  const { error } = await supabase.from('characters').update(dbUpdates).eq('id', charId)
  if (error) handleError('updateCharacter', error)
}

export async function deleteCharacter(charId: string) {
  const { error } = await supabase.from('characters').delete().eq('id', charId)
  if (error) handleError('deleteCharacter', error)
}

/* ─── Thread & Message ─── */

export async function createThread(
  projectId: string,
  episodeId: string,
  label: string,
  pageRange: string,
): Promise<string | null> {
  const { data, error } = await supabase.from('threads').insert({
    project_id: projectId, episode_id: episodeId, label, page_range: pageRange, status: 'submitted',
  }).select('id').single()
  if (error) { handleError('createThread', error); return null }
  return data.id
}

export async function sendMessage(
  threadId: string,
  senderId: string,
  text: string,
  attachmentUrl?: string,
): Promise<string | null> {
  const row: Record<string, any> = { thread_id: threadId, sender_id: senderId, text }
  if (attachmentUrl) row.attachment_url = attachmentUrl
  const { data, error } = await supabase
    .from('messages')
    .insert(row)
    .select('id')
    .single()
  if (error) { handleError('sendMessage', error); return null }
  return data.id
}

export async function updateThreadStatus(threadId: string, status: Thread['status']) {
  const { error } = await supabase.from('threads').update({ status }).eq('id', threadId)
  if (error) handleError('updateThreadStatus', error)
}

/* ─── Project Invitation ─── */

export async function inviteMember(
  projectId: string,
  email: string,
  role: string,
): Promise<string | null> {
  // Use RPC function to look up user by email (bypasses restrictive users RLS)
  const { data: invitee, error: lookupErr } = await supabase
    .rpc('find_user_by_email', { lookup_email: email })

  if (lookupErr || !invitee) return 'No user found with that email.'

  const { error } = await supabase.from('project_members').insert({
    project_id: projectId,
    user_id: invitee,
    role,
  })

  if (error) return error.message
  return null
}

/* ─── Collaborators ─── */

export interface Collaborator {
  id: string
  name: string
  role: string
  email: string
  avatarUrl?: string | null
}

export async function fetchCollaborators(projectId: string): Promise<Collaborator[]> {
  // Fetch owner
  const { data: proj } = await supabase
    .from('projects')
    .select('owner_id, owner:users!projects_owner_id_fkey(id, name, role, email, avatar_url)')
    .eq('id', projectId)
    .single()

  // Fetch members
  const { data: members } = await supabase
    .from('project_members')
    .select('user:users(id, name, role, email, avatar_url)')
    .eq('project_id', projectId)

  const result: Collaborator[] = []

  if (proj?.owner) {
    const o = proj.owner as any
    result.push({ id: o.id, name: o.name, role: o.role, email: o.email, avatarUrl: o.avatar_url })
  }

  for (const m of members ?? []) {
    const u = (m as any).user
    if (u && !result.some(r => r.id === u.id)) {
      result.push({ id: u.id, name: u.name, role: u.role, email: u.email, avatarUrl: u.avatar_url })
    }
  }

  return result
}

/* ─── File Upload (Supabase Storage) ─── */

export async function uploadPanelArtwork(
  projectId: string,
  panelId: string,
  file: File,
  userId: string,
): Promise<{ url: string; assetId: string } | null> {
  const ext = file.name.split('.').pop() ?? 'png'
  const path = `${projectId}/${panelId}/${Date.now()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('panel-artwork')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (uploadErr) { handleError('uploadPanelArtwork', uploadErr); return null }

  const { data: urlData } = supabase.storage.from('panel-artwork').getPublicUrl(path)
  const url = urlData.publicUrl

  // Get current max version for this panel
  const { data: existing } = await supabase
    .from('panel_assets')
    .select('version')
    .eq('panel_id', panelId)
    .order('version', { ascending: false })
    .limit(1)

  const version = (existing?.[0]?.version ?? 0) + 1

  const { data: asset, error: assetErr } = await supabase
    .from('panel_assets')
    .insert({ panel_id: panelId, uploaded_by: userId, file_url: url, version })
    .select('id')
    .single()

  if (assetErr) { handleError('uploadPanelArtwork.asset', assetErr); return null }

  // Update the panel's asset_url to the latest upload
  await supabase.from('panels').update({ asset_url: url, status: 'draft_received' }).eq('id', panelId)

  return { url, assetId: asset.id }
}

export async function fetchPanelAssets(panelId: string) {
  const { data, error } = await supabase
    .from('panel_assets')
    .select('*, uploader:users(name)')
    .eq('panel_id', panelId)
    .order('version', { ascending: false })

  if (error) { handleError('fetchPanelAssets', error); return [] }
  return data ?? []
}
