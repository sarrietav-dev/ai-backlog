export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      backlogs: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "backlogs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          backlog_id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          backlog_id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          backlog_id?: string
          user_id?: string
          role?: 'user' | 'assistant'
          content?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_backlog_id_fkey"
            columns: ["backlog_id"]
            isOneToOne: false
            referencedRelation: "backlogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_stories: {
        Row: {
          id: string
          user_id: string
          backlog_id: string | null
          title: string
          description: string
          acceptance_criteria: Json[]
          status: 'backlog' | 'in_progress' | 'done'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          backlog_id?: string | null
          title: string
          description: string
          acceptance_criteria?: Json[]
          status?: 'backlog' | 'in_progress' | 'done'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          backlog_id?: string | null
          title?: string
          description?: string
          acceptance_criteria?: Json[]
          status?: 'backlog' | 'in_progress' | 'done'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stories_backlog_id_fkey"
            columns: ["backlog_id"]
            isOneToOne: false
            referencedRelation: "backlogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      story_status: 'backlog' | 'in_progress' | 'done'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Backlog = Database['public']['Tables']['backlogs']['Row']
export type NewBacklog = Database['public']['Tables']['backlogs']['Insert']
export type UpdateBacklog = Database['public']['Tables']['backlogs']['Update']

export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type NewChatMessage = Database['public']['Tables']['chat_messages']['Insert']
export type UpdateChatMessage = Database['public']['Tables']['chat_messages']['Update']

export type UserStory = Database['public']['Tables']['user_stories']['Row']
export type NewUserStory = Database['public']['Tables']['user_stories']['Insert']
export type UpdateUserStory = Database['public']['Tables']['user_stories']['Update'] 