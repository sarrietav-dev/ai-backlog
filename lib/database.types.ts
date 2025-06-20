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
      user_stories: {
        Row: {
          id: string
          user_id: string
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
          title?: string
          description?: string
          acceptance_criteria?: Json[]
          status?: 'backlog' | 'in_progress' | 'done'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
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

export type UserStory = Database['public']['Tables']['user_stories']['Row']
export type NewUserStory = Database['public']['Tables']['user_stories']['Insert']
export type UpdateUserStory = Database['public']['Tables']['user_stories']['Update'] 