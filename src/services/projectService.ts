import { supabase } from '../lib/supabase'
import type { Project, Episode, Page, Panel, ContentBlock, Character, Thread, Message } from '../types'

/* ─── Helpers ─── */

function genId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
}

/* ─── Project ─── */

export async function fetchProject(projectId: string): Promise<Project | null> {
  const [
    { data: proj },
    { data: eps },
    { data: chars },
    { data: threads },
  ] = await Promise.all([
    supabase.from('projects').select('*').eq('id', projectId).single(),
    supabase.from('episodes').select('*').eq('project_id', projectId).order('number'),
    supabase.from('characters').select('*').eq('project_id', projectId),
    supabase.from('threads').select('*, messages(*)').eq('project_id', projectId).order('created_at'),
  ])

  if (!proj) return null

  const episodes: Episode[] = await Promise.all(
    (eps ?? []).map(async ep => {
      const { data: pages } = await supabase
        .from('pages')
        .select('*')
        .eq('episode_id', ep.id)
        .order('number')

      const fullPages: Page[] = await Promise.all(
        (pages ?? []).map(async pg => {
          const { data: panels } = await supabase
            .from('panels')
            .select('*')
            .eq('page_id', pg.id)
            .order('"order"')

          const fullPanels: Panel[] = await Promise.all(
            (panels ?? []).map(async pan => {
              const { data: blocks } = await supabase
                .from('content_blocks')
                .select('*')
                .eq('panel_id', pan.id)
                .order('"order"')

              return {
                id: pan.id,
                number: pan.number,
                shot: pan.shot,
                description: pan.description,
                content: (blocks ?? []).map(b => ({
                  id: b.id,
                  type: b.type as ContentBlock['type'],
                  character: b.character ?? undefined,
                  parenthetical: b.parenthetical ?? undefined,
                  text: b.text,
                })),
              }
            })
          )

          return { id: pg.id, number: pg.number, layoutNote: pg.layout_note, panels: fullPanels }
        })
      )

      return { id: ep.id, number: ep.number, title: ep.title, brief: ep.brief, pages: fullPages }
    })
  )

  const mappedThreads: Thread[] = (threads ?? []).map((t: any) => ({
    id: t.id,
    episodeId: t.episode_id,
    label: t.label,
    pageRange: t.page_range,
    status: t.status as Thread['status'],
    unread: 0,
    messages: (t.messages ?? []).map((m: any) => ({
      id: m.id,
      sender: 'writer' as Message['sender'],
      name: m.sender_id,
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
    characters: (chars ?? []).map(c => ({ id: c.id, name: c.name, role: c.role, desc: c.desc, color: c.color })),
    threads: mappedThreads,
  }
}

export async function listProjects(userId: string) {
  const { data } = await supabase
    .from('projects')
    .select('id, title, format, created_at')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function createProject(title: string, format: Project['format'], ownerId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ id: genId(), title, format, owner_id: ownerId })
    .select('id')
    .single()
  if (error) { console.error(error); return null }
  return data.id
}

export async function updateProjectTitle(projectId: string, title: string) {
  await supabase.from('projects').update({ title }).eq('id', projectId)
}

/* ─── Episode ─── */

export async function createEpisode(projectId: string, number: number): Promise<string | null> {
  const id = genId()
  const { error } = await supabase.from('episodes').insert({
    id, project_id: projectId, number, title: `Episode ${number}`, brief: '',
  })
  if (error) { console.error(error); return null }
  return id
}

export async function updateEpisode(episodeId: string, updates: { title?: string; brief?: string }) {
  await supabase.from('episodes').update(updates).eq('id', episodeId)
}

export async function deleteEpisode(episodeId: string) {
  await supabase.from('episodes').delete().eq('id', episodeId)
}

/* ─── Page ─── */

export async function createPage(episodeId: string, number: number): Promise<string | null> {
  const id = genId()
  const { error } = await supabase.from('pages').insert({ id, episode_id: episodeId, number, layout_note: '' })
  if (error) { console.error(error); return null }
  return id
}

export async function updatePage(pageId: string, updates: { layout_note?: string }) {
  await supabase.from('pages').update(updates).eq('id', pageId)
}

export async function deletePage(pageId: string) {
  await supabase.from('pages').delete().eq('id', pageId)
}

/* ─── Panel ─── */

export async function createPanel(pageId: string, number: number, shot: string): Promise<string | null> {
  const id = genId()
  const { error } = await supabase.from('panels').insert({
    id, page_id: pageId, number, shot, description: '', order: number,
  })
  if (error) { console.error(error); return null }
  return id
}

export async function updatePanel(panelId: string, updates: { shot?: string; description?: string }) {
  await supabase.from('panels').update(updates).eq('id', panelId)
}

export async function deletePanel(panelId: string) {
  await supabase.from('panels').delete().eq('id', panelId)
}

/* ─── Content Block ─── */

export async function createContentBlock(
  panelId: string,
  type: ContentBlock['type'],
  order: number,
): Promise<string | null> {
  const id = genId()
  const { error } = await supabase.from('content_blocks').insert({
    id, panel_id: panelId, type, text: '', order,
  })
  if (error) { console.error(error); return null }
  return id
}

export async function updateContentBlock(
  blockId: string,
  updates: { character?: string | null; parenthetical?: string | null; text?: string },
) {
  await supabase.from('content_blocks').update(updates).eq('id', blockId)
}

export async function deleteContentBlock(blockId: string) {
  await supabase.from('content_blocks').delete().eq('id', blockId)
}

/* ─── Character ─── */

export async function createCharacter(
  projectId: string,
  char: Omit<Character, 'id'>,
): Promise<string | null> {
  const id = genId()
  const { error } = await supabase.from('characters').insert({ id, project_id: projectId, ...char })
  if (error) { console.error(error); return null }
  return id
}

export async function updateCharacter(charId: string, updates: Partial<Omit<Character, 'id'>>) {
  await supabase.from('characters').update(updates).eq('id', charId)
}

export async function deleteCharacter(charId: string) {
  await supabase.from('characters').delete().eq('id', charId)
}

/* ─── Thread & Message ─── */

export async function createThread(
  projectId: string,
  episodeId: string,
  label: string,
  pageRange: string,
): Promise<string | null> {
  const id = genId()
  const { error } = await supabase.from('threads').insert({
    id, project_id: projectId, episode_id: episodeId, label, page_range: pageRange, status: 'submitted',
  })
  if (error) { console.error(error); return null }
  return id
}

export async function sendMessage(
  threadId: string,
  senderId: string,
  text: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ thread_id: threadId, sender_id: senderId, text })
    .select('id')
    .single()
  if (error) { console.error(error); return null }
  return data.id
}

export async function updateThreadStatus(threadId: string, status: Thread['status']) {
  await supabase.from('threads').update({ status }).eq('id', threadId)
}

/* ─── Project Invitation ─── */

export async function inviteMember(
  projectId: string,
  email: string,
  role: string,
): Promise<string | null> {
  const { data: invitee } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (!invitee) return 'No user found with that email.'

  const { error } = await supabase.from('project_members').insert({
    project_id: projectId,
    user_id: invitee.id,
    role,
  })

  if (error) return error.message
  return null
}
