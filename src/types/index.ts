export interface ContentBlock {
  id: string
  type: 'dialogue' | 'caption' | 'sfx'
  character?: string
  parenthetical?: string
  text: string
}

export type PanelStatus = 'draft' | 'submitted' | 'in_progress' | 'draft_received' | 'changes_requested' | 'approved'
export type PanelType = 'establishing' | 'action' | 'dialogue' | 'impact' | 'transition'

export interface ChangeRequest {
  id: string
  note: string
  status: 'open' | 'resolved'
  createdBy: string
  createdAt: string
}

export interface PanelRevision {
  id: string
  assetUrl: string
  uploadedAt: string
  uploadedBy: string
}

export interface Panel {
  id: string
  number: number
  shot: string
  description: string
  content: ContentBlock[]
  status?: PanelStatus
  panelType?: PanelType
  assetUrl?: string
  changeRequests?: ChangeRequest[]
  revisions?: PanelRevision[]
}

export interface Page {
  id: string
  number: number
  layoutNote: string
  panels: Panel[]
  deadline?: string
  assignedRole?: ProductionRole
}

export interface Episode {
  id: string
  number: number
  title: string
  brief: string
  pages: Page[]
  deadline?: string
  assignedRole?: ProductionRole
}

export interface CharacterRelationship {
  targetCharacterId: string
  type: 'ally' | 'rival' | 'mentor' | 'mentee' | 'love_interest' | 'family' | 'friend' | 'enemy' | 'other'
  description: string
}

export interface CharacterArc {
  storyArcId: string
  startState: string
  endState: string
}

export interface Character {
  id: string
  name: string
  role: string
  desc: string
  color: string
  appearance?: string
  personality?: string
  goals?: string
  fears?: string
  backstory?: string
  speechPatterns?: string
  designSheetUrls?: string[]
  relationships?: CharacterRelationship[]
  arcs?: CharacterArc[]
}

export type StoryArcStatus = 'planning' | 'active' | 'completed'

export interface StoryArc {
  id: string
  title: string
  description: string
  episodeStart: number
  episodeEnd: number
  status: StoryArcStatus
  linkedCharacterIds: string[]
}

export interface Location {
  id: string
  name: string
  description: string
  referenceImageUrls: string[]
}

export interface WorldRule {
  id: string
  title: string
  description: string
}

export interface TimelineEvent {
  id: string
  title: string
  description: string
  episodeId: string
  order: number
}

export interface Message {
  id: string
  sender: 'writer' | 'artist' | 'letterer' | 'colorist'
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

export interface StoryBible {
  arcs: StoryArc[]
  locations: Location[]
  worldRules: WorldRule[]
  timeline: TimelineEvent[]
}

export interface Project {
  id: string
  title: string
  format: 'webtoon' | 'manhwa' | 'manga' | 'comic'
  episodes: Episode[]
  characters: Character[]
  threads: Thread[]
  storyBible?: StoryBible
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
  view: 'editor' | 'collab' | 'compile' | 'story-bible' | 'character-bible' | 'production'
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
  view: 'editor' | 'collab' | 'compile' | 'story-bible' | 'character-bible' | 'production'
  episodeId?: string
  pageId?: string
  panelId?: string
  threadId?: string
  keywords: string[]
}

/* ─── Production Tracker ─── */

export type ProductionRole = 'writer' | 'artist' | 'letterer' | 'colorist'

export interface PanelStatusCount {
  draft: number
  submitted: number
  in_progress: number
  draft_received: number
  changes_requested: number
  approved: number
  total: number
}

export interface EpisodeProductionSummary {
  episodeId: string
  episodeNumber: number
  episodeTitle: string
  statusCounts: PanelStatusCount
  pageCount: number
  completionPct: number
}

export interface PageHeatmapEntry {
  pageId: string
  pageNumber: number
  episodeId: string
  dominantStatus: PanelStatus
  panelCount: number
  approvedCount: number
}

export interface RoleWorkloadItem {
  role: ProductionRole
  episodeId: string
  episodeNumber: number
  pageId: string
  pageNumber: number
  panelId: string
  panelNumber: number
  currentStatus: PanelStatus
}

export interface CalendarEntry {
  id: string
  date: string
  type: 'episode' | 'page'
  label: string
  assignedRole?: ProductionRole
  episodeId: string
  pageId?: string
  isOverdue: boolean
  completionPct: number
}

export interface SyncProjectPatch {
  title?: string
  format?: Project['format']
  episodes?: Episode[]
  characters?: Character[]
  threads?: Thread[]
  storyBible?: StoryBible
}
