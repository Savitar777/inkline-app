export interface ContentBlock {
  id: string
  type: 'dialogue' | 'caption' | 'sfx'
  character?: string
  parenthetical?: string
  text: string
}

export type PanelStatus = 'draft' | 'submitted' | 'in_progress' | 'draft_received' | 'changes_requested' | 'approved'

export interface Panel {
  id: string
  number: number
  shot: string
  description: string
  content: ContentBlock[]
  status?: PanelStatus
  assetUrl?: string
}

export interface Page {
  id: string
  number: number
  layoutNote: string
  panels: Panel[]
}

export interface Episode {
  id: string
  number: number
  title: string
  brief: string
  pages: Page[]
}

export interface Character {
  id: string
  name: string
  role: string
  desc: string
  color: string
}

export interface Message {
  id: string
  sender: 'writer' | 'artist'
  name: string
  text?: string
  image?: boolean
  imageLabel?: string
  timestamp: string
}

export interface Thread {
  id: string
  episodeId: string
  label: string
  pageRange: string
  status: 'submitted' | 'in_progress' | 'draft_received' | 'approved'
  unread: number
  messages: Message[]
}

export interface Project {
  id: string
  title: string
  format: 'webtoon' | 'manhwa' | 'manga' | 'comic'
  episodes: Episode[]
  characters: Character[]
  threads: Thread[]
}

export interface PanelReviewState {
  episodeId: string
  pageId: string
  panelId: string
  status: PanelStatus
  note?: string
}

export interface WorkspaceSelection {
  projectId: string | null
  view: 'editor' | 'collab' | 'compile'
  episodeId: string | null
  threadId: string | null
  selectedFormat: Project['format']
}

export interface ProjectActivitySummary {
  pendingReviewCount: number
  changedSinceSubmissionCount: number
  unreadCollaborationCount: number
  exportReadyCount: number
  totalPanels: number
  exportReadyPercentage: number
  exportReady: boolean
}

export interface ProjectSummary {
  id: string
  title: string
  format: Project['format']
  createdAt: string
}

export type SearchScope = 'all' | 'script' | 'collaboration' | 'assets' | 'characters'
export type SearchResultKind = 'episode' | 'page' | 'panel' | 'character' | 'thread' | 'message'

export interface ProjectSearchResult {
  id: string
  kind: SearchResultKind
  title: string
  subtitle: string
  view: 'editor' | 'collab' | 'compile'
  episodeId?: string
  pageId?: string
  panelId?: string
  threadId?: string
  keywords: string[]
}

export interface SyncProjectPatch {
  title?: string
  format?: Project['format']
  episodes?: Episode[]
  characters?: Character[]
  threads?: Thread[]
}
