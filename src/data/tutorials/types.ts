export type TutorialCategory =
  | 'app-features'
  | 'panel-composition'
  | 'pacing'
  | 'dialogue'
  | 'format-specific'
  | 'production'

export type TutorialDifficulty = 'beginner' | 'intermediate' | 'advanced'

export type TutorialRole = 'writer' | 'artist' | 'letterer' | 'colorist' | 'all'

export interface TutorialModule {
  id: string
  category: TutorialCategory
  title: string
  summary: string
  body: string
  difficulty: TutorialDifficulty
  roles: TutorialRole[]
  formats?: string[]
  readingMinutes: number
  relatedGlossaryIds?: string[]
  relatedModuleIds?: string[]
}

export interface GlossaryEntry {
  id: string
  term: string
  definition: string
  relatedTermIds?: string[]
  relatedModuleIds?: string[]
  formats?: string[]
}

export interface ContextualTip {
  id: string
  trigger: 'first-use' | 'threshold' | 'milestone' | 'error-adjacent'
  view: string
  title: string
  body: string
  learnMoreModuleId?: string
}

export const CATEGORY_LABELS: Record<TutorialCategory, string> = {
  'app-features': 'App Features',
  'panel-composition': 'Panel Composition',
  'pacing': 'Pacing & Storytelling',
  'dialogue': 'Dialogue & Readability',
  'format-specific': 'Format-Specific',
  'production': 'Production Workflow',
}

export const DIFFICULTY_LABELS: Record<TutorialDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}
