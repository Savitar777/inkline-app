export interface ContentBlock {
  id: string
  type: 'dialogue' | 'caption' | 'sfx'
  character?: string
  parenthetical?: string
  text: string
}

export interface Panel {
  id: string
  number: number
  shot: string
  description: string
  content: ContentBlock[]
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
