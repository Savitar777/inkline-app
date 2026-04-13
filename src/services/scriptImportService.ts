import type { Episode, Page, Panel, ContentBlock } from '../types'
import type { ScriptMappingResult, ScriptImportRecord, ScriptImportMode, ScriptImportFormat } from '../types/files'
import { processDocument } from './documentProcessorService'
import { validate } from './fileValidationService'
import { getStorageAdapter } from './fileStorageService'
import { createFileRecord } from './fileMetadataService'
import type { UserRole } from '../lib/database.types'

const genId = () => crypto.randomUUID()

/* ─── Script Text Parser ─── */

interface ParseResult extends ScriptMappingResult {
  episodes: Episode[]
}

export function parseScriptText(text: string): ParseResult {
  const episodes: Episode[] = []
  const unmappedLines: string[] = []
  const warnings: string[] = []

  let currentEpisode: Episode | null = null
  let currentPage: Page | null = null
  let currentPanel: Panel | null = null
  let collectingDescription = false

  const lines = text.split('\n')

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) { collectingDescription = false; continue }

    // Episode marker
    const epMatch = line.match(/^(?:EPISODE|EP\.?)\s+(\d+)\s*[:\-—]?\s*(.*)/i)
    if (epMatch) {
      const num = parseInt(epMatch[1], 10)
      currentEpisode = {
        id: genId(), number: num,
        title: epMatch[2].trim() || `Episode ${num}`,
        brief: '', pages: [],
      }
      episodes.push(currentEpisode)
      currentPage = null
      currentPanel = null
      collectingDescription = false
      continue
    }

    // Page marker
    const pageMatch = line.match(/^PAGE\s+(\d+)/i)
    if (pageMatch) {
      if (!currentEpisode) {
        currentEpisode = { id: genId(), number: 1, title: 'Episode 1', brief: '', pages: [] }
        episodes.push(currentEpisode)
      }
      const num = parseInt(pageMatch[1], 10)
      currentPage = { id: genId(), number: num, layoutNote: '', panels: [] }
      currentEpisode.pages.push(currentPage)
      currentPanel = null
      collectingDescription = false
      continue
    }

    // Panel marker
    const panelMatch = line.match(/^PANEL\s+(\d+)/i)
    if (panelMatch) {
      if (!currentPage) {
        if (!currentEpisode) {
          currentEpisode = { id: genId(), number: 1, title: 'Episode 1', brief: '', pages: [] }
          episodes.push(currentEpisode)
        }
        currentPage = { id: genId(), number: 1, layoutNote: '', panels: [] }
        currentEpisode.pages.push(currentPage)
      }
      const num = parseInt(panelMatch[1], 10)
      currentPanel = { id: genId(), number: num, shot: '', description: '', content: [] }
      currentPage.panels.push(currentPanel)
      collectingDescription = true
      continue
    }

    // Caption
    const captionMatch = line.match(/^(?:CAPTION|CAP):\s*(.+)/i)
    if (captionMatch && currentPanel) {
      const block: ContentBlock = {
        id: genId(), type: 'caption', text: captionMatch[1].trim(),
      }
      currentPanel.content.push(block)
      collectingDescription = false
      continue
    }

    // SFX
    const sfxMatch = line.match(/^SFX:\s*(.+)/i)
    if (sfxMatch && currentPanel) {
      const block: ContentBlock = {
        id: genId(), type: 'sfx', text: sfxMatch[1].trim(),
      }
      currentPanel.content.push(block)
      collectingDescription = false
      continue
    }

    // Dialogue: ALL-CAPS NAME followed by colon
    const dialogueMatch = line.match(/^([A-Z][A-Z\s]{1,30}):\s*(.+)$/)
    if (dialogueMatch && currentPanel) {
      const block: ContentBlock = {
        id: genId(), type: 'dialogue',
        character: dialogueMatch[1].trim(),
        text: dialogueMatch[2].trim(),
      }
      currentPanel.content.push(block)
      collectingDescription = false
      continue
    }

    // Description line (after panel marker)
    if (collectingDescription && currentPanel) {
      currentPanel.description = currentPanel.description
        ? `${currentPanel.description} ${line}`
        : line
      continue
    }

    // Unmapped
    unmappedLines.push(line)
  }

  // If no episodes detected, wrap everything in one
  if (episodes.length === 0 && lines.length > 0) {
    warnings.push('No episode markers found. All content placed in Episode 1.')
  }

  return {
    episodes,
    episodesDetected: episodes.length,
    pagesDetected: episodes.reduce((sum, ep) => sum + ep.pages.length, 0),
    panelsDetected: episodes.reduce((sum, ep) => sum + ep.pages.reduce((s, pg) => s + pg.panels.length, 0), 0),
    unmappedLines,
    warnings,
  }
}

/* ─── Import Script (full pipeline) ─── */

export async function importScript(
  file: File,
  projectId: string,
  mode: ScriptImportMode,
  userId: string,
  userRole: UserRole = 'writer',
): Promise<ScriptImportRecord | null> {
  // Validate
  const validation = await validate(file, 'script-imports', userRole, projectId)
  if (!validation.ok) {
    if (import.meta.env.DEV) console.error('[scriptImport] Validation failed:', validation.error)
    return null
  }

  // Upload to storage
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'txt'
  const fileId = genId()
  const path = `${projectId}/scripts/${fileId}.${ext}`

  const storage = getStorageAdapter()
  await storage.upload('script-imports', path, file)

  // Process document
  const docResult = await processDocument(file)
  const rawText = docResult.text

  // Parse if structured mode
  let mappingResult: ScriptMappingResult | undefined
  if (mode === 'structured') {
    const parsed = parseScriptText(rawText)
    mappingResult = {
      episodesDetected: parsed.episodesDetected,
      pagesDetected: parsed.pagesDetected,
      panelsDetected: parsed.panelsDetected,
      unmappedLines: parsed.unmappedLines,
      warnings: parsed.warnings,
    }
  }

  // Create file record
  await createFileRecord({
    projectId,
    category: 'script-imports',
    originalName: validation.sanitizedName ?? file.name,
    storagePath: path,
    publicUrl: null,
    mimeType: file.type || `text/${ext}`,
    sizeBytes: file.size,
    uploadedBy: userId,
    uploadedAt: new Date().toISOString(),
    status: 'complete',
    metadata: { importedAsScriptId: fileId },
  })

  const format = ext as ScriptImportFormat

  return {
    id: fileId,
    projectId,
    fileId,
    format: ['txt', 'md', 'docx', 'pdf'].includes(format) ? format : 'txt',
    mode,
    rawText,
    importedAt: new Date().toISOString(),
    mappingResult,
  }
}

/* ─── Apply Import to Project ─── */

import type { Project } from '../types'

export function applyImport(
  record: ScriptImportRecord,
  strategy: 'replace' | 'append' | 'merge',
  project: Project,
): Project {
  if (record.mode === 'reference') {
    // Attach as episode brief to the first episode
    const episodes = [...project.episodes]
    if (episodes.length === 0) {
      episodes.push({
        id: genId(), number: 1, title: 'Episode 1',
        brief: record.rawText.slice(0, 5000), pages: [],
      })
    } else {
      const ep = { ...episodes[0] }
      ep.brief = ep.brief
        ? `${ep.brief}\n\n---\n\n${record.rawText.slice(0, 5000)}`
        : record.rawText.slice(0, 5000)
      episodes[0] = ep
    }
    return { ...project, episodes }
  }

  // Structured mode — parse episodes from text
  const parsed = parseScriptText(record.rawText)

  if (parsed.episodes.length === 0) return project

  if (strategy === 'replace') {
    const existingNumbers = new Set(project.episodes.map(ep => ep.number))
    const newEpisodes = project.episodes.map(ep => {
      const replacement = parsed.episodes.find(p => p.number === ep.number)
      return replacement ?? ep
    })
    // Add new episodes that don't overlap
    for (const ep of parsed.episodes) {
      if (!existingNumbers.has(ep.number)) {
        newEpisodes.push(ep)
      }
    }
    return { ...project, episodes: newEpisodes.sort((a, b) => a.number - b.number) }
  }

  if (strategy === 'append') {
    const maxNumber = Math.max(0, ...project.episodes.map(ep => ep.number))
    const newEpisodes = parsed.episodes.map((ep, i) => ({
      ...ep,
      number: maxNumber + i + 1,
      title: ep.title || `Episode ${maxNumber + i + 1}`,
    }))
    return { ...project, episodes: [...project.episodes, ...newEpisodes] }
  }

  // merge: combine panels within matching episodes
  const merged = [...project.episodes]
  for (const parsedEp of parsed.episodes) {
    const existing = merged.find(ep => ep.number === parsedEp.number)
    if (existing) {
      const mergedPages = [...existing.pages]
      for (const parsedPage of parsedEp.pages) {
        const existingPage = mergedPages.find(pg => pg.number === parsedPage.number)
        if (existingPage) {
          existingPage.panels = [...existingPage.panels, ...parsedPage.panels]
        } else {
          mergedPages.push(parsedPage)
        }
      }
      existing.pages = mergedPages.sort((a, b) => a.number - b.number)
    } else {
      merged.push(parsedEp)
    }
  }
  return { ...project, episodes: merged.sort((a, b) => a.number - b.number) }
}
