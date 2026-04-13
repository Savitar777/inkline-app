import type { Character, ContentBlock, Episode, Message, Page, Panel, PanelStatus, Project, Thread } from '../types'
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

  return {
    id: asString(panel.id, `panels[${index}].id`),
    number: asNumber(panel.number, `panels[${index}].number`),
    shot: asString(panel.shot, `panels[${index}].shot`),
    description: asString(panel.description, `panels[${index}].description`, '', 5000),
    status: isPanelStatus(status) ? status : undefined,
    assetUrl: asString(panel.assetUrl, `panels[${index}].assetUrl`, '') || undefined,
    content: asArray(panel.content, `panels[${index}].content`, 50).map(parseContentBlock),
  }
}

function parsePage(value: unknown, index: number): Page {
  const page = asRecord(value, `pages[${index}]`)
  return {
    id: asString(page.id, `pages[${index}].id`),
    number: asNumber(page.number, `pages[${index}].number`),
    layoutNote: asString(page.layoutNote, `pages[${index}].layoutNote`),
    panels: asArray(page.panels, `pages[${index}].panels`, 20).map(parsePanel),
  }
}

function parseEpisode(value: unknown, index: number): Episode {
  const episode = asRecord(value, `episodes[${index}]`)
  return {
    id: asString(episode.id, `episodes[${index}].id`),
    number: asNumber(episode.number, `episodes[${index}].number`),
    title: asString(episode.title, `episodes[${index}].title`),
    brief: asString(episode.brief, `episodes[${index}].brief`, '', 5000),
    pages: asArray(episode.pages, `episodes[${index}].pages`, 100).map(parsePage),
  }
}

function parseCharacter(value: unknown, index: number): Character {
  const character = asRecord(value, `characters[${index}]`)
  return {
    id: asString(character.id, `characters[${index}].id`),
    name: asString(character.name, `characters[${index}].name`),
    role: asString(character.role, `characters[${index}].role`),
    desc: asString(character.desc, `characters[${index}].desc`),
    color: asString(character.color, `characters[${index}].color`),
  }
}

function parseMessage(value: unknown, index: number): Message {
  const message = asRecord(value, `messages[${index}]`)
  const sender = asString(message.sender, `messages[${index}].sender`)
  if (!['writer', 'artist'].includes(sender)) {
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
