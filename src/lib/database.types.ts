export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          group_id: string | null
          id: string
          metadata: Json
          trip_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          group_id?: string | null
          id?: string
          metadata?: Json
          trip_id?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["activity_logs"]["Insert"]>
        Relationships: []
      }
      budget_items: {
        Row: {
          actual_centavos: number | null
          category: string
          cost_type: Database["public"]["Enums"]["cost_type"]
          created_at: string
          created_by: string | null
          description: string | null
          estimated_centavos: number
          id: string
          name: string
          quantity: number
          status: string
          trip_id: string
          unit_price_centavos: number
          updated_at: string
        }
        Insert: {
          actual_centavos?: number | null
          category?: string
          cost_type?: Database["public"]["Enums"]["cost_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_centavos?: number
          id?: string
          name: string
          quantity?: number
          status?: string
          trip_id: string
          unit_price_centavos?: number
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["budget_items"]["Insert"]>
        Relationships: []
      }
      contributions: {
        Row: {
          amount_centavos: number
          id: string
          member_user_id: string
          notes: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["contribution_status"]
          submitted_at: string
          trip_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount_centavos: number
          id?: string
          member_user_id: string
          notes?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["contribution_status"]
          submitted_at?: string
          trip_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["contributions"]["Insert"]>
        Relationships: []
      }
      expense_participants: {
        Row: {
          expense_id: string
          id: string
          share_centavos: number
          trip_id: string
          user_id: string
        }
        Insert: {
          expense_id: string
          id?: string
          share_centavos?: number
          trip_id: string
          user_id: string
        }
        Update: Partial<Database["public"]["Tables"]["expense_participants"]["Insert"]>
        Relationships: []
      }
      expenses: {
        Row: {
          amount_centavos: number
          category: string
          created_at: string
          created_by: string | null
          description: string
          expense_date: string | null
          id: string
          itinerary_item_id: string | null
          paid_by: string | null
          status: Database["public"]["Enums"]["expense_status"]
          trip_id: string
          updated_at: string
        }
        Insert: {
          amount_centavos: number
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          expense_date?: string | null
          id?: string
          itinerary_item_id?: string | null
          paid_by?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          trip_id: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["expenses"]["Insert"]>
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["member_role"]
          status: Database["public"]["Enums"]["member_status"]
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["member_status"]
          user_id: string
        }
        Update: Partial<Database["public"]["Tables"]["group_members"]["Insert"]>
        Relationships: []
      }
      groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["groups"]["Insert"]>
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          invitee_email: string | null
          invitee_id: string | null
          inviter_id: string
          responded_at: string | null
          role: Database["public"]["Enums"]["member_role"]
          status: string
          trip_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          invitee_email?: string | null
          invitee_id?: string | null
          inviter_id: string
          responded_at?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          status?: string
          trip_id: string
        }
        Update: Partial<Database["public"]["Tables"]["invitations"]["Insert"]>
        Relationships: []
      }
      itinerary_days: {
        Row: {
          date: string | null
          id: string
          sort_order: number
          title: string | null
          trip_id: string
        }
        Insert: {
          date?: string | null
          id?: string
          sort_order?: number
          title?: string | null
          trip_id: string
        }
        Update: Partial<Database["public"]["Tables"]["itinerary_days"]["Insert"]>
        Relationships: []
      }
      itinerary_items: {
        Row: {
          actual_centavos: number | null
          category: string
          cost_type: Database["public"]["Enums"]["cost_type"]
          description: string | null
          end_time: string | null
          estimated_centavos: number
          id: string
          itinerary_day_id: string
          location: string | null
          map_link: string | null
          notes: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          quantity: number
          sort_order: number
          start_time: string | null
          status: string
          title: string
          trip_id: string
          unit_price_centavos: number
        }
        Insert: {
          actual_centavos?: number | null
          category?: string
          cost_type?: Database["public"]["Enums"]["cost_type"]
          description?: string | null
          end_time?: string | null
          estimated_centavos?: number
          id?: string
          itinerary_day_id: string
          location?: string | null
          map_link?: string | null
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          quantity?: number
          sort_order?: number
          start_time?: string | null
          status?: string
          title: string
          trip_id: string
          unit_price_centavos?: number
        }
        Update: Partial<Database["public"]["Tables"]["itinerary_items"]["Insert"]>
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          public_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          name: string
          public_id: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>
        Relationships: []
      }
      settlements: {
        Row: {
          amount_centavos: number
          created_at: string
          from_user_id: string
          id: string
          settled_at: string | null
          status: string
          to_user_id: string
          trip_id: string
        }
        Insert: {
          amount_centavos: number
          created_at?: string
          from_user_id: string
          id?: string
          settled_at?: string | null
          status?: string
          to_user_id: string
          trip_id: string
        }
        Update: Partial<Database["public"]["Tables"]["settlements"]["Insert"]>
        Relationships: []
      }
      trip_members: {
        Row: {
          contribution_target_centavos: number
          id: string
          participation_status: string
          trip_id: string
          user_id: string
        }
        Insert: {
          contribution_target_centavos?: number
          id?: string
          participation_status?: string
          trip_id: string
          user_id: string
        }
        Update: Partial<Database["public"]["Tables"]["trip_members"]["Insert"]>
        Relationships: []
      }
      trips: {
        Row: {
          contribution_mode: string
          cover_image_url: string | null
          cover_seed: string | null
          created_at: string
          created_by: string
          description: string | null
          destination: string | null
          end_date: string | null
          funding_deadline: string | null
          group_id: string
          id: string
          name: string
          start_date: string | null
          status: Database["public"]["Enums"]["trip_status"]
          target_centavos: number
          updated_at: string
        }
        Insert: {
          contribution_mode?: string
          cover_image_url?: string | null
          cover_seed?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          destination?: string | null
          end_date?: string | null
          funding_deadline?: string | null
          group_id: string
          id?: string
          name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          target_centavos?: number
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["trips"]["Insert"]>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      contribution_status:
        | "pending"
        | "verified"
        | "rejected"
        | "refunded"
        | "cancelled"
      cost_type: "fixed" | "per_person" | "quantity"
      expense_status: "draft" | "recorded" | "adjusted"
      item_category:
        | "transportation"
        | "accommodation"
        | "food"
        | "snacks"
        | "activity"
        | "entrance"
        | "shopping"
        | "other"
      member_role: "owner" | "admin" | "treasurer" | "member"
      member_status: "active" | "invited" | "removed"
      payment_status: "unpaid" | "partial" | "paid"
      trip_status:
        | "planning"
        | "funding"
        | "ready"
        | "ongoing"
        | "completed"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]
export type Enums<T extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][T]
