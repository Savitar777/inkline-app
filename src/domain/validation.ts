import type { ChangeRequest, Character, CharacterArc, CharacterRelationship, ContentBlock, Episode, Location, Message, Page, Panel, PanelRevision, PanelStatus, PanelType, ProductionRole, Project, StoryArc, StoryArcStatus, StoryBible, Thread, TimelineEvent, WorldRule } from '../types'
import { CURRENT_SCHEMA_VERSION, migrateProjectDocument } from './migrations'

type ImportErrorCode = 'invalid_json' | 'invalid_shape'

export class ProjectImportError extends Error {
  code: ImportErrorCode

  constructor(code: ImportErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ProjectImportError('invalid_shape', `${path} must be an object.`)
  }
  return value as Record<string, unknown>
}

function asString(value: unknown, path: string, fallback = '', maxLength = 0): string {
  if (value == null) return fallback
  if (typeof value !== 'string') {
    throw new ProjectImportError('invalid_shape', `${path} must be a string.`)
  }
  if (maxLength > 0 && value.length > maxLength) {
    throw new ProjectImportError('invalid_shape', `${path} exceeds max length of ${maxLength}.`)
  }
  return value
}

function asNumber(value: unknown, path: string, fallback = 0): number {
  if (value == null) return fallback
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ProjectImportError('invalid_shape', `${path} must be a number.`)
  }
  return value
}

function asArray(value: unknown, path: string, maxItems = 0): unknown[] {
  if (!Array.isArray(value)) {
    throw new ProjectImportError('invalid_shape', `${path} must be an array.`)
  }
  if (maxItems > 0 && value.length > maxItems) {
    throw new ProjectImportError('invalid_shape', `${path} exceeds max items of ${maxItems}.`)
  }
  return value
}

function isPanelStatus(value: string): value is PanelStatus {
  return ['draft', 'submitted', 'in_progress', 'draft_received', 'changes_requested', 'approved'].includes(value)
}

function isPanelType(value: string): value is PanelType {
  return ['establishing', 'action', 'dialogue', 'impact', 'transition'].includes(value)
}

function isProductionRole(value: string): value is ProductionRole {
  return ['writer', 'artist', 'letterer', 'colorist'].includes(value)
}

function parseChangeRequest(value: unknown, index: number): ChangeRequest {
  const cr = asRecord(value, `changeRequests[${index}]`)
  const status = asString(cr.status, `changeRequests[${index}].status`)
  if (!['open', 'resolved'].includes(status)) {
    throw new ProjectImportError('invalid_shape', `changeRequests[${index}].status is invalid.`)
  }
  return {
    id: asString(cr.id, `changeRequests[${index}].id`),
    note: asString(cr.note, `changeRequests[${index}].note`, '', 5000),
    status: status as ChangeRequest['status'],
    createdBy: asString(cr.createdBy, `changeRequests[${index}].createdBy`),
    createdAt: asString(cr.createdAt, `changeRequests[${index}].createdAt`),
  }
}

function parsePanelRevision(value: unknown, index: number): PanelRevision {
  const rev = asRecord(value, `revisions[${index}]`)
  return {
    id: asString(rev.id, `revisions[${index}].id`),
    assetUrl: asString(rev.assetUrl, `revisions[${index}].assetUrl`),
    uploadedAt: asString(rev.uploadedAt, `revisions[${index}].uploadedAt`),
    uploadedBy: asString(rev.uploadedBy, `revisions[${index}].uploadedBy`),
  }
}

function parseContentBlock(value: unknown, index: number): ContentBlock {
  const block = asRecord(value, `content[${index}]`)
  const type = asString(block.type, `content[${index}].type`)
  if (!['dialogue', 'caption', 'sfx'].includes(type)) {
    throw new ProjectImportError('invalid_shape', `content[${index}].type is invalid.`)
  }

  return {
    id: asString(block.id, `content[${index}].id`),
    type: type as ContentBlock['type'],
    character: asString(block.character, `content[${index}].character`, '') || undefined,
    parenthetical: asString(block.parenthetical, `content[${index}].parenthetical`, '') || undefined,
    text: asString(block.text, `content[${index}].text`, '', 10000),
  }
}

function parsePanel(value: unknown, index: number): Panel {
  const panel = asRecord(value, `panels[${index}]`)
  const status = asString(panel.status, `panels[${index}].status`, '')
  if (status && !isPanelStatus(status)) {
    throw new ProjectImportError('invalid_shape', `panels[${index}].status is invalid.`)
  }
  const panelType = asString(panel.panelType, `panels[${index}].panelType`, '')
  const changeRequests = panel.changeRequests
    ? asArray(panel.changeRequests, `panels[${index}].changeRequests`, 100).map(parseChangeRequest)
    : undefined
  const revisions = panel.revisions
    ? asArray(panel.revisions, `panels[${index}].revisions`, 50).map(parsePanelRevision)
    : undefined

  return {
    id: asString(panel.id, `panels[${index}].id`),
    number: asNumber(panel.number, `panels[${index}].number`),
    shot: asString(panel.shot, `panels[${index}].shot`),
    description: asString(panel.description, `panels[${index}].description`, '', 5000),
    status: isPanelStatus(status) ? status : undefined,
    panelType: isPanelType(panelType) ? panelType : undefined,
    assetUrl: asString(panel.assetUrl, `panels[${index}].assetUrl`, '') || undefined,
    content: asArray(panel.content, `panels[${index}].content`, 50).map(parseContentBlock),
    changeRequests,
    revisions,
  }
}

function parsePage(value: unknown, index: number): Page {
  const page = asRecord(value, `pages[${index}]`)
  const deadline = asString(page.deadline, `pages[${index}].deadline`, '') || undefined
  const assignedRoleStr = asString(page.assignedRole, `pages[${index}].assignedRole`, '')
  const assignedRole = assignedRoleStr && isProductionRole(assignedRoleStr) ? assignedRoleStr : undefined
  return {
    id: asString(page.id, `pages[${index}].id`),
    number: asNumber(page.number, `pages[${index}].number`),
    layoutNote: asString(page.layoutNote, `pages[${index}].layoutNote`),
    panels: asArray(page.panels, `pages[${index}].panels`, 20).map(parsePanel),
    deadline,
    assignedRole,
  }
}

function parseEpisode(value: unknown, index: number): Episode {
  const episode = asRecord(value, `episodes[${index}]`)
  const deadline = asString(episode.deadline, `episodes[${index}].deadline`, '') || undefined
  const assignedRoleStr = asString(episode.assignedRole, `episodes[${index}].assignedRole`, '')
  const assignedRole = assignedRoleStr && isProductionRole(assignedRoleStr) ? assignedRoleStr : undefined
  return {
    id: asString(episode.id, `episodes[${index}].id`),
    number: asNumber(episode.number, `episodes[${index}].number`),
    title: asString(episode.title, `episodes[${index}].title`),
    brief: asString(episode.brief, `episodes[${index}].brief`, '', 5000),
    pages: asArray(episode.pages, `episodes[${index}].pages`, 100).map(parsePage),
    deadline,
    assignedRole,
  }
}

function parseCharacterRelationship(value: unknown, index: number): CharacterRelationship {
  const rel = asRecord(value, `relationships[${index}]`)
  const type = asString(rel.type, `relationships[${index}].type`)
  const validTypes = ['ally', 'rival', 'mentor', 'mentee', 'love_interest', 'family', 'friend', 'enemy', 'other']
  if (!validTypes.includes(type)) {
    throw new ProjectImportError('invalid_shape', `relationships[${index}].type is invalid.`)
  }
  return {
    targetCharacterId: asString(rel.targetCharacterId, `relationships[${index}].targetCharacterId`),
    type: type as CharacterRelationship['type'],
    description: asString(rel.description, `relationships[${index}].description`),
  }
}

function parseCharacterArc(value: unknown, index: number): CharacterArc {
  const arc = asRecord(value, `characterArcs[${index}]`)
  return {
    storyArcId: asString(arc.storyArcId, `characterArcs[${index}].storyArcId`),
    startState: asString(arc.startState, `characterArcs[${index}].startState`),
    endState: asString(arc.endState, `characterArcs[${index}].endState`),
  }
}

function parseCharacter(value: unknown, index: number): Character {
  const character = asRecord(value, `characters[${index}]`)
  const relationships = character.relationships
    ? asArray(character.relationships, `characters[${index}].relationships`, 50).map(parseCharacterRelationship)
    : undefined
  const arcs = character.arcs
    ? asArray(character.arcs, `characters[${index}].arcs`, 50).map(parseCharacterArc)
    : undefined
  const designSheetUrls = character.designSheetUrls
    ? asArray(character.designSheetUrls, `characters[${index}].designSheetUrls`, 20).map(
        (v, i) => asString(v, `characters[${index}].designSheetUrls[${i}]`),
      )
    : undefined
  return {
    id: asString(character.id, `characters[${index}].id`),
    name: asString(character.name, `characters[${index}].name`),
    role: asString(character.role, `characters[${index}].role`),
    desc: asString(character.desc, `characters[${index}].desc`),
    color: asString(character.color, `characters[${index}].color`),
    appearance: asString(character.appearance, `characters[${index}].appearance`, '') || undefined,
    personality: asString(character.personality, `characters[${index}].personality`, '') || undefined,
    goals: asString(character.goals, `characters[${index}].goals`, '') || undefined,
    fears: asString(character.fears, `characters[${index}].fears`, '') || undefined,
    backstory: asString(character.backstory, `characters[${index}].backstory`, '') || undefined,
    speechPatterns: asString(character.speechPatterns, `characters[${index}].speechPatterns`, '') || undefined,
    designSheetUrls,
    relationships,
    arcs,
  }
}

function parseMessage(value: unknown, index: number): Message {
  const message = asRecord(value, `messages[${index}]`)
  const sender = asString(message.sender, `messages[${index}].sender`)
  if (!['writer', 'artist', 'letterer', 'colorist'].includes(sender)) {
    throw new ProjectImportError('invalid_shape', `messages[${index}].sender is invalid.`)
  }

  return {
    id: asString(message.id, `messages[${index}].id`),
    sender: sender as Message['sender'],
    name: asString(message.name, `messages[${index}].name`),
    text: asString(message.text, `messages[${index}].text`, '') || undefined,
    image: Boolean(message.image),
    imageLabel: asString(message.imageLabel, `messages[${index}].imageLabel`, '') || undefined,
    timestamp: asString(message.timestamp, `messages[${index}].timestamp`),
  }
}

function parseThread(value: unknown, index: number): Thread {
  const thread = asRecord(value, `threads[${index}]`)
  const status = asString(thread.status, `threads[${index}].status`)
  if (!['submitted', 'in_progress', 'draft_received', 'approved'].includes(status)) {
    throw new ProjectImportError('invalid_shape', `threads[${index}].status is invalid.`)
  }

  return {
    id: asString(thread.id, `threads[${index}].id`),
    episodeId: asString(thread.episodeId, `threads[${index}].episodeId`),
    label: asString(thread.label, `threads[${index}].label`),
    pageRange: asString(thread.pageRange, `threads[${index}].pageRange`),
    status: status as Thread['status'],
    unread: asNumber(thread.unread, `threads[${index}].unread`, 0),
    messages: asArray(thread.messages, `threads[${index}].messages`, 1000).map(parseMessage),
  }
}

function isStoryArcStatus(value: string): value is StoryArcStatus {
  return ['planning', 'active', 'completed'].includes(value)
}

function parseStoryArc(value: unknown, index: number): StoryArc {
  const arc = asRecord(value, `arcs[${index}]`)
  const status = asString(arc.status, `arcs[${index}].status`)
  if (!isStoryArcStatus(status)) {
    throw new ProjectImportError('invalid_shape', `arcs[${index}].status is invalid.`)
  }
  const linkedCharacterIds = asArray(arc.linkedCharacterIds, `arcs[${index}].linkedCharacterIds`, 50).map(
    (v, i) => asString(v, `arcs[${index}].linkedCharacterIds[${i}]`),
  )
  return {
    id: asString(arc.id, `arcs[${index}].id`),
    title: asString(arc.title, `arcs[${index}].title`),
    description: asString(arc.description, `arcs[${index}].description`, '', 5000),
    episodeStart: asNumber(arc.episodeStart, `arcs[${index}].episodeStart`),
    episodeEnd: asNumber(arc.episodeEnd, `arcs[${index}].episodeEnd`),
    status: status as StoryArcStatus,
    linkedCharacterIds,
  }
}

function parseLocation(value: unknown, index: number): Location {
  const loc = asRecord(value, `locations[${index}]`)
  const referenceImageUrls = loc.referenceImageUrls
    ? asArray(loc.referenceImageUrls, `locations[${index}].referenceImageUrls`, 20).map(
        (v, i) => asString(v, `locations[${index}].referenceImageUrls[${i}]`),
      )
    : []
  return {
    id: asString(loc.id, `locations[${index}].id`),
    name: asString(loc.name, `locations[${index}].name`),
    description: asString(loc.description, `locations[${index}].description`, '', 5000),
    referenceImageUrls,
  }
}

function parseWorldRule(value: unknown, index: number): WorldRule {
  const rule = asRecord(value, `worldRules[${index}]`)
  return {
    id: asString(rule.id, `worldRules[${index}].id`),
    title: asString(rule.title, `worldRules[${index}].title`),
    description: asString(rule.description, `worldRules[${index}].description`, '', 5000),
  }
}

function parseTimelineEvent(value: unknown, index: number): TimelineEvent {
  const event = asRecord(value, `timeline[${index}]`)
  return {
    id: asString(event.id, `timeline[${index}].id`),
    title: asString(event.title, `timeline[${index}].title`),
    description: asString(event.description, `timeline[${index}].description`, '', 5000),
    episodeId: asString(event.episodeId, `timeline[${index}].episodeId`),
    order: asNumber(event.order, `timeline[${index}].order`),
  }
}

function parseStoryBible(value: unknown): StoryBible {
  if (!value || typeof value !== 'object') {
    return { arcs: [], locations: [], worldRules: [], timeline: [] }
  }
  const bible = value as Record<string, unknown>
  return {
    arcs: bible.arcs ? asArray(bible.arcs, 'storyBible.arcs', 100).map(parseStoryArc) : [],
    locations: bible.locations ? asArray(bible.locations, 'storyBible.locations', 100).map(parseLocation) : [],
    worldRules: bible.worldRules ? asArray(bible.worldRules, 'storyBible.worldRules', 100).map(parseWorldRule) : [],
    timeline: bible.timeline ? asArray(bible.timeline, 'storyBible.timeline', 200).map(parseTimelineEvent) : [],
  }
}

export function validateProjectDocument(value: unknown): Project {
  const project = asRecord(value, 'project')
  const format = asString(project.format, 'project.format')
  if (!['webtoon', 'manhwa', 'manga', 'comic'].includes(format)) {
    throw new ProjectImportError('invalid_shape', 'project.format is invalid.')
  }

  return {
    id: asString(project.id, 'project.id'),
    title: asString(project.title, 'project.title', '', 200),
    format: format as Project['format'],
    episodes: asArray(project.episodes, 'project.episodes', 50).map(parseEpisode),
    characters: asArray(project.characters, 'project.characters', 100).map(parseCharacter),
    threads: asArray(project.threads, 'project.threads', 50).map(parseThread),
    storyBible: parseStoryBible(project.storyBible),
  }
}

export function parseProjectDocument(json: string): Project {
  try {
    const parsed = JSON.parse(json) as unknown
    const record = parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}
    const fromVersion = typeof record.__schemaVersion === 'number' ? record.__schemaVersion : 0
    const migrated = migrateProjectDocument(parsed, fromVersion)
    return validateProjectDocument(migrated)
  } catch (error) {
    if (error instanceof ProjectImportError) throw error
    throw new ProjectImportError('invalid_json', 'The selected file is not valid JSON.')
  }
}

export function serializeProjectDocument(project: Project): string {
  return JSON.stringify({ __schemaVersion: CURRENT_SCHEMA_VERSION, ...project }, null, 2)
}
