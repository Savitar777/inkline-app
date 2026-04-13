import { supabase } from '../lib/supabase'
import { formatShortTime } from '../domain/time'
import type { Database, UserRole } from '../lib/database.types'
import type { Project, Episode, ContentBlock, Character, Thread, Message } from '../types'

/* ─── Helpers ─── */

type ProjectRow = Database['public']['Tables']['projects']['Row']
type EpisodeRow = Database['public']['Tables']['episodes']['Row']
type PageRow = Database['public']['Tables']['pages']['Row']
type PanelRow = Database['public']['Tables']['panels']['Row']
type ContentBlockRow = Database['public']['Tables']['content_blocks']['Row']
type CharacterRow = Database['public']['Tables']['characters']['Row']
type ThreadRow = Database['public']['Tables']['threads']['Row']
type MessageRow = Database['public']['Tables']['messages']['Row']
type PanelAssetRow = Database['public']['Tables']['panel_assets']['Row']
type UserRow = Database['public']['Tables']['users']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']

interface EpisodeWithPages extends EpisodeRow {
  pages?: PageWithPanels[] | null
}

interface PageWithPanels extends PageRow {
  panels?: PanelWithBlocks[] | null
}

interface PanelWithBlocks extends PanelRow {
  content_blocks?: ContentBlockRow[] | null
}

interface MessageWithSender extends MessageRow {
  sender?: Pick<UserRow, 'id' | 'name' | 'role'> | null
}

interface ThreadWithMessages extends ThreadRow {
  messages?: MessageWithSender[] | null
}

type ProjectListRow = Pick<ProjectRow, 'id' | 'title' | 'format' | 'created_at'>

interface ProjectMembershipRow {
  project: ProjectListRow | ProjectListRow[] | null
}

type CollaboratorIdentity = Pick<UserRow, 'id' | 'name' | 'role' | 'email' | 'avatar_url'>

interface ProjectOwnerRow {
  owner_id: string
  owner: CollaboratorIdentity | CollaboratorIdentity[] | null
}

interface ProjectMemberRow {
  user: CollaboratorIdentity | CollaboratorIdentity[] | null
}

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function uuid(): string {
  return crypto.randomUUID()
}

/* ─── Client-side rate limiting ─── */

function createRateLimiter(maxCalls: number, windowMs: number) {
  const timestamps: number[] = []
  return function check(): boolean {
    const now = Date.now()
    // Remove expired timestamps
    while (timestamps.length > 0 && timestamps[0] <= now - windowMs) {
      timestamps.shift()
    }
    if (timestamps.length >= maxCalls) return false
    timestamps.push(now)
    return true
  }
}

// Max 30 writes per 10 seconds per category
const writeLimiter = createRateLimiter(30, 10_000)
// Max 10 invites per minute
const inviteLimiter = createRateLimiter(10, 60_000)
// Max 20 messages per minute
const messageLimiter = createRateLimiter(20, 60_000)

type ErrorCallback = (context: string, error: unknown) => void
let _onErrorCallback: ErrorCallback | null = null

export function setServiceErrorCallback(cb: ErrorCallback | null): void {
  _onErrorCallback = cb
}

function handleError(context: string, error: unknown): void {
  if (import.meta.env.DEV) console.error(`[projectService] ${context}:`, error)
  _onErrorCallback?.(context, error)
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

  const episodes: Episode[] = ((eps ?? []) as EpisodeWithPages[]).map(ep => ({
    id: ep.id,
    number: ep.number,
    title: ep.title,
    brief: ep.brief,
    pages: (ep.pages ?? [])
      .sort((a, b) => a.number - b.number)
      .map(pg => ({
        id: pg.id,
        number: pg.number,
        layoutNote: pg.layout_note,
        panels: (pg.panels ?? [])
          .sort((a, b) => a.order - b.order)
          .map(pan => ({
            id: pan.id,
            number: pan.number,
            shot: pan.shot,
            description: pan.description,
            status: pan.status ?? undefined,
            assetUrl: pan.asset_url ?? undefined,
            content: (pan.content_blocks ?? [])
              .sort((a, b) => a.order - b.order)
              .map(block => ({
                id: block.id,
                type: block.type as ContentBlock['type'],
                character: block.character ?? undefined,
                parenthetical: block.parenthetical ?? undefined,
                text: block.text,
              })),
          })),
      })),
  }))

  const mappedThreads: Thread[] = ((threads ?? []) as ThreadWithMessages[]).map(thread => ({
    id: thread.id,
    episodeId: thread.episode_id,
    label: thread.label,
    pageRange: thread.page_range,
    status: thread.status as Thread['status'],
    unread: 0,
    messages: (thread.messages ?? [])
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(message => ({
        id: message.id,
        sender: (['artist', 'letterer', 'colorist'].includes(message.sender?.role ?? '') ? message.sender!.role : 'writer') as Message['sender'],
        name: message.sender?.name ?? 'Unknown',
        text: message.text ?? undefined,
        image: !!message.attachment_url,
        imageLabel: message.attachment_url ?? undefined,
        timestamp: formatShortTime(message.created_at),
      })),
  }))

  return {
    id: proj.id,
    title: proj.title,
    format: proj.format as Project['format'],
    episodes,
    characters: ((chars ?? []) as CharacterRow[]).map(character => ({
      id: character.id,
      name: character.name,
      role: character.role,
      desc: character.description ?? '',
      color: character.color,
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
  const memberList = ((memberOf ?? []) as unknown as ProjectMembershipRow[])
    .map(member => unwrapRelation(member.project))
    .filter((project): project is ProjectListRow => Boolean(project))
  const ownedIds = new Set(ownedList.map(p => p.id))
  return [...ownedList, ...memberList.filter(project => !ownedIds.has(project.id))]
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
  if (!writeLimiter()) { handleError('createEpisode', new Error('Rate limited — too many operations.')); return null }
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
  if (!writeLimiter()) { handleError('createPage', new Error('Rate limited — too many operations.')); return null }
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
  const { data: page, error: pageErr } = await supabase
    .from('pages')
    .select('episode_id')
    .eq('id', pageId)
    .single()

  if (pageErr || !page) {
    handleError('deletePage.lookup', pageErr)
    return
  }

  const { error } = await supabase.from('pages').delete().eq('id', pageId)
  if (error) {
    handleError('deletePage', error)
    return
  }

  const { data: remainingPages, error: remainingErr } = await supabase
    .from('pages')
    .select('id')
    .eq('episode_id', page.episode_id)
    .order('number')

  if (remainingErr) {
    handleError('deletePage.renumber.fetch', remainingErr)
    return
  }

  await Promise.all((remainingPages ?? []).map((remainingPage, index) =>
    supabase
      .from('pages')
      .update({ number: index + 1 })
      .eq('id', remainingPage.id)
  ))
}

/* ─── Panel ─── */

export async function createPanel(pageId: string, number: number, shot: string, id?: string): Promise<string | null> {
  if (!writeLimiter()) { handleError('createPanel', new Error('Rate limited — too many operations.')); return null }
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
  const { data: panel, error: panelErr } = await supabase
    .from('panels')
    .select('page_id')
    .eq('id', panelId)
    .single()

  if (panelErr || !panel) {
    handleError('deletePanel.lookup', panelErr)
    return
  }

  const { error } = await supabase.from('panels').delete().eq('id', panelId)
  if (error) {
    handleError('deletePanel', error)
    return
  }

  const { data: remainingPanels, error: remainingErr } = await supabase
    .from('panels')
    .select('id')
    .eq('page_id', panel.page_id)
    .order('order')

  if (remainingErr) {
    handleError('deletePanel.renumber.fetch', remainingErr)
    return
  }

  await Promise.all((remainingPanels ?? []).map((remainingPanel, index) =>
    supabase
      .from('panels')
      .update({ number: index + 1, order: index + 1 })
      .eq('id', remainingPanel.id)
  ))
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
  const dbUpdates: Partial<CharacterRow> = {
    name: updates.name,
    role: updates.role,
    color: updates.color,
    description: updates.desc,
  }
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
  if (!messageLimiter()) { handleError('sendMessage', new Error('Rate limited — too many messages. Please wait.')); return null }
  const row: MessageInsert = {
    thread_id: threadId,
    sender_id: senderId,
    text,
    attachment_url: attachmentUrl ?? null,
  }
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
  if (!inviteLimiter()) return 'Rate limited — too many invites. Please wait a moment.'
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

  const owner = unwrapRelation((proj as unknown as ProjectOwnerRow | null)?.owner)
  if (owner) {
    result.push({
      id: owner.id,
      name: owner.name,
      role: owner.role,
      email: owner.email,
      avatarUrl: owner.avatar_url,
    })
  }

  for (const member of (members ?? []) as unknown as ProjectMemberRow[]) {
    const user = unwrapRelation(member.user)
    if (user && !result.some(existing => existing.id === user.id)) {
      result.push({
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        avatarUrl: user.avatar_url,
      })
    }
  }

  return result
}

/* ─── File Upload (Supabase Storage) ─── */

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024 // 10 MB

export async function uploadPanelArtwork(
  projectId: string,
  panelId: string,
  file: File,
  userId: string,
): Promise<{ url: string; assetId: string } | null> {
  if (file.size > MAX_UPLOAD_SIZE) {
    handleError('uploadPanelArtwork', new Error('File exceeds 10 MB limit.'))
    return null
  }
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

  const version = (((existing ?? []) as Pick<PanelAssetRow, 'version'>[])[0]?.version ?? 0) + 1

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

/* ─── Admin Functions ─── */

export async function listAllProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, format, created_at, owner:users!projects_owner_id_fkey(id, name, email)')
    .order('created_at', { ascending: false })
  if (error) { handleError('listAllProjects', error); return [] }
  return data ?? []
}

export async function listAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role, avatar_url, created_at')
    .order('created_at', { ascending: false })
  if (error) { handleError('listAllUsers', error); return [] }
  return data ?? []
}

export async function updateUserRole(userId: string, role: UserRole): Promise<string | null> {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)
  if (error) { handleError('updateUserRole', error); return error.message }
  return null
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
