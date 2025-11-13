export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'member'
export type StoryStatus = 'active' | 'completed' | 'archived'
export type ChoiceStatus = 'pending' | 'active' | 'chosen' | 'rejected'
export type ExportFormat = 'pdf' | 'audio' | 'illustrated' | 'storyboard'
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type MediaType = 'image' | 'audio'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          is_private: boolean
          created_by: string
          invite_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_private?: boolean
          created_by: string
          invite_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_private?: boolean
          created_by?: string
          invite_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: UserRole
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: UserRole
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: UserRole
          joined_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          title: string
          group_id: string | null
          created_by: string
          genre: string
          tone: string
          target_length: number
          status: StoryStatus
          root_chapter_id: string | null
          is_public: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          group_id?: string | null
          created_by: string
          genre: string
          tone: string
          target_length?: number
          status?: StoryStatus
          root_chapter_id?: string | null
          is_public?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          group_id?: string | null
          created_by?: string
          genre?: string
          tone?: string
          target_length?: number
          status?: StoryStatus
          root_chapter_id?: string | null
          is_public?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      chapters: {
        Row: {
          id: string
          story_id: string
          parent_chapter_id: string | null
          content: string
          summary: string | null
          sequence_number: number
          branch_label: string | null
          created_by: string
          is_ai_generated: boolean
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          story_id: string
          parent_chapter_id?: string | null
          content: string
          summary?: string | null
          sequence_number?: number
          branch_label?: string | null
          created_by: string
          is_ai_generated?: boolean
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          parent_chapter_id?: string | null
          content?: string
          summary?: string | null
          sequence_number?: number
          branch_label?: string | null
          created_by?: string
          is_ai_generated?: boolean
          metadata?: Json
          created_at?: string
        }
      }
      story_choices: {
        Row: {
          id: string
          chapter_id: string
          choice_text: string
          submitted_by: string
          is_ai_generated: boolean
          status: ChoiceStatus
          vote_count: number
          created_at: string
        }
        Insert: {
          id?: string
          chapter_id: string
          choice_text: string
          submitted_by: string
          is_ai_generated?: boolean
          status?: ChoiceStatus
          vote_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          chapter_id?: string
          choice_text?: string
          submitted_by?: string
          is_ai_generated?: boolean
          status?: ChoiceStatus
          vote_count?: number
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          choice_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          choice_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          choice_id?: string
          user_id?: string
          created_at?: string
        }
      }
      media_assets: {
        Row: {
          id: string
          chapter_id: string
          type: MediaType
          url: string
          storage_path: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          chapter_id: string
          type: MediaType
          url: string
          storage_path?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          chapter_id?: string
          type?: MediaType
          url?: string
          storage_path?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      exports: {
        Row: {
          id: string
          story_id: string
          branch_path: Json
          format: ExportFormat
          url: string | null
          storage_path: string | null
          status: ExportStatus
          error_message: string | null
          metadata: Json
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          story_id: string
          branch_path: Json
          format: ExportFormat
          url?: string | null
          storage_path?: string | null
          status?: ExportStatus
          error_message?: string | null
          metadata?: Json
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          story_id?: string
          branch_path?: Json
          format?: ExportFormat
          url?: string | null
          storage_path?: string | null
          status?: ExportStatus
          error_message?: string | null
          metadata?: Json
          created_at?: string
          completed_at?: string | null
        }
      }
    }
  }
}
