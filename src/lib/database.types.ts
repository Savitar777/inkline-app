export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'writer' | 'artist' | 'letterer' | 'colorist' | 'admin'
export type ProjectFormat = 'webtoon' | 'manhwa' | 'manga' | 'comic'
export type ContentBlockType = 'dialogue' | 'caption' | 'sfx'
export type ThreadStatus = 'submitted' | 'in_progress' | 'draft_received' | 'approved'
export type AssetStatus = 'draft' | 'approved' | 'rejected'
export type PanelStatus = 'draft' | 'submitted' | 'in_progress' | 'draft_received' | 'changes_requested' | 'approved'
export type FileProcessingStatus = 'pending' | 'validating' | 'processing' | 'uploading' | 'complete' | 'error' | 'offline'

// NOTE: This file is a hand-maintained snapshot aligned with the checked-in
// Supabase schema. Replace it with `supabase gen types typescript` whenever a
// live project is available so generated types stay in sync automatically.

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: UserRole
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      projects: {
        Row: {
          id: string
          title: string
          format: ProjectFormat
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: UserRole
          invited_at: string
        }
        Insert: Omit<Database['public']['Tables']['project_members']['Row'], 'id' | 'invited_at'>
        Update: Partial<Database['public']['Tables']['project_members']['Insert']>
      }
      episodes: {
        Row: {
          id: string
          project_id: string
          number: number
          title: string
          brief: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['episodes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['episodes']['Insert']>
      }
      pages: {
        Row: {
          id: string
          episode_id: string
          number: number
          layout_note: string
        }
        Insert: Omit<Database['public']['Tables']['pages']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['pages']['Insert']>
      }
      panels: {
        Row: {
          id: string
          page_id: string
          number: number
          shot: string
          description: string
          order: number
          status: PanelStatus
          asset_url: string | null
        }
        Insert: Omit<Database['public']['Tables']['panels']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['panels']['Insert']>
      }
      content_blocks: {
        Row: {
          id: string
          panel_id: string
          type: ContentBlockType
          character: string | null
          parenthetical: string | null
          text: string
          order: number
        }
        Insert: Omit<Database['public']['Tables']['content_blocks']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['content_blocks']['Insert']>
      }
      characters: {
        Row: {
          id: string
          project_id: string
          name: string
          role: string
          description: string
          color: string
        }
        Insert: Omit<Database['public']['Tables']['characters']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['characters']['Insert']>
      }
      threads: {
        Row: {
          id: string
          project_id: string
          episode_id: string
          label: string
          page_range: string
          status: ThreadStatus
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['threads']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['threads']['Insert']>
      }
      messages: {
        Row: {
          id: string
          thread_id: string
          sender_id: string
          text: string | null
          attachment_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      panel_assets: {
        Row: {
          id: string
          panel_id: string
          uploaded_by: string
          file_url: string
          status: AssetStatus
          version: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['panel_assets']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['panel_assets']['Insert']>
      }
      uploaded_files: {
        Row: {
          id: string
          project_id: string
          category: string
          original_name: string
          storage_path: string
          public_url: string | null
          mime_type: string
          size_bytes: number
          uploaded_by: string
          status: FileProcessingStatus
          error_message: string | null
          metadata: Record<string, unknown>
          tags: string[]
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['uploaded_files']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['uploaded_files']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: {
      find_user_by_email: {
        Args: { lookup_email: string; for_project_id?: string | null }
        Returns: string | null
      }
      is_project_member: {
        Args: { _project_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      project_format: ProjectFormat
      content_block_type: ContentBlockType
      thread_status: ThreadStatus
      asset_status: AssetStatus
      panel_status: PanelStatus
    }
  }
}
