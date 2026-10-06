export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      service_products: {
        Row: {
          active: boolean
          category: string
          created_at: string
          currency: string
          description: string
          id: string
          name: string
          slug: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          currency?: string
          description: string
          id?: string
          name: string
          slug: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          currency?: string
          description?: string
          id?: string
          name?: string
          slug?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      job_material_requests: {
        Row: {
          created_at: string
          currency: string
          id: string
          product_id: string
          quantity: number
          reason: string
          resolved_at: string | null
          service_request_id: string
          status: Database["public"]["Enums"]["material_request_status"]
          unit_price_snapshot: number
          worker_id: string
        }
        Insert: {
          created_at?: string
          currency: string
          id?: string
          product_id: string
          quantity: number
          reason: string
          resolved_at?: string | null
          service_request_id: string
          status?: Database["public"]["Enums"]["material_request_status"]
          unit_price_snapshot: number
          worker_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          product_id?: string
          quantity?: number
          reason?: string
          resolved_at?: string | null
          service_request_id?: string
          status?: Database["public"]["Enums"]["material_request_status"]
          unit_price_snapshot?: number
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_material_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "service_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_material_requests_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      job_conversations: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          service_request_id: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          service_request_id: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          service_request_id?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_conversations_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: true
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      job_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "job_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          completed_at: string
          created_at: string
          emergency_contact: string | null
          home_location: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          emergency_contact?: string | null
          home_location: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          emergency_contact?: string | null
          home_location?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_profiles: {
        Row: {
          completed_at: string
          created_at: string
          experience_years: number
          preferred_rate_bdt: number
          primary_trade: string
          service_radius_km: number
          updated_at: string
          user_id: string
          verification_status: Database["public"]["Enums"]["worker_verification_status"]
        }
        Insert: {
          completed_at?: string
          created_at?: string
          experience_years: number
          preferred_rate_bdt: number
          primary_trade: string
          service_radius_km: number
          updated_at?: string
          user_id: string
          verification_status?: Database["public"]["Enums"]["worker_verification_status"]
        }
        Update: {
          completed_at?: string
          created_at?: string
          experience_years?: number
          preferred_rate_bdt?: number
          primary_trade?: string
          service_radius_km?: number
          updated_at?: string
          user_id?: string
          verification_status?: Database["public"]["Enums"]["worker_verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "worker_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_role: Database["public"]["Enums"]["app_role"]
          avatar_path: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          active_role?: Database["public"]["Enums"]["app_role"]
          avatar_path?: string | null
          created_at?: string
          display_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          active_role?: Database["public"]["Enums"]["app_role"]
          avatar_path?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_proposals: {
        Row: {
          availability_note: string
          created_at: string
          currency: string
          id: string
          note: string | null
          price_amount: number
          service_request_id: string
          status: Database["public"]["Enums"]["service_proposal_status"]
          updated_at: string
          worker_id: string
        }
        Insert: {
          availability_note: string
          created_at?: string
          currency?: string
          id?: string
          note?: string | null
          price_amount: number
          service_request_id: string
          status?: Database["public"]["Enums"]["service_proposal_status"]
          updated_at?: string
          worker_id: string
        }
        Update: {
          availability_note?: string
          created_at?: string
          currency?: string
          id?: string
          note?: string | null
          price_amount?: number
          service_request_id?: string
          status?: Database["public"]["Enums"]["service_proposal_status"]
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_proposals_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_request_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          service_request_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          service_request_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          service_request_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_request_comments_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_request_media: {
        Row: {
          capture_source: string
          created_at: string
          duration_ms: number | null
          height: number | null
          id: string
          media_type: Database["public"]["Enums"]["service_media_type"]
          mime_type: string
          service_request_id: string
          size_bytes: number | null
          sort_order: number
          storage_bucket: string
          storage_path: string
          uploaded_by: string
          width: number | null
        }
        Insert: {
          capture_source?: string
          created_at?: string
          duration_ms?: number | null
          height?: number | null
          id?: string
          media_type: Database["public"]["Enums"]["service_media_type"]
          mime_type: string
          service_request_id: string
          size_bytes?: number | null
          sort_order?: number
          storage_bucket?: string
          storage_path: string
          uploaded_by: string
          width?: number | null
        }
        Update: {
          capture_source?: string
          created_at?: string
          duration_ms?: number | null
          height?: number | null
          id?: string
          media_type?: Database["public"]["Enums"]["service_media_type"]
          mime_type?: string
          service_request_id?: string
          size_bytes?: number | null
          sort_order?: number
          storage_bucket?: string
          storage_path?: string
          uploaded_by?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_request_media_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_request_reactions: {
        Row: {
          created_at: string
          service_request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          service_request_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          service_request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_request_reactions_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          accepted_proposal_id: string | null
          budget_amount: number
          category: string
          comment_count: number
          created_at: string
          currency: string
          customer_id: string
          description: string
          id: string
          last_activity_at: string
          location_label: string
          proposal_count: number
          reaction_count: number
          requested_start_at: string | null
          schedule_note: string | null
          status: Database["public"]["Enums"]["service_request_status"]
          title: string
          updated_at: string
        }
        Insert: {
          accepted_proposal_id?: string | null
          budget_amount: number
          category: string
          comment_count?: number
          created_at?: string
          currency?: string
          customer_id: string
          description: string
          id?: string
          last_activity_at?: string
          location_label: string
          proposal_count?: number
          reaction_count?: number
          requested_start_at?: string | null
          schedule_note?: string | null
          status?: Database["public"]["Enums"]["service_request_status"]
          title: string
          updated_at?: string
        }
        Update: {
          accepted_proposal_id?: string | null
          budget_amount?: number
          category?: string
          comment_count?: number
          created_at?: string
          currency?: string
          customer_id?: string
          description?: string
          id?: string
          last_activity_at?: string
          location_label?: string
          proposal_count?: number
          reaction_count?: number
          requested_start_at?: string | null
          schedule_note?: string | null
          status?: Database["public"]["Enums"]["service_request_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_accepted_proposal_fk"
            columns: ["accepted_proposal_id"]
            isOneToOne: false
            referencedRelation: "service_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_service_proposal: {
        Args: { p_proposal_id: string }
        Returns: {
          accepted_proposal_id: string
          service_request_id: string
        }[]
      }
      cancel_service_request: {
        Args: { p_service_request_id: string }
        Returns: string
      }
      has_app_role: {
        Args: { p_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      open_job_conversation: {
        Args: { p_service_request_id: string }
        Returns: Database["public"]["Tables"]["job_conversations"]["Row"]
      }
      request_job_material: {
        Args: {
          p_product_id: string
          p_quantity: number
          p_reason: string
          p_service_request_id: string
        }
        Returns: Database["public"]["Tables"]["job_material_requests"]["Row"]
      }
      resolve_job_material: {
        Args: {
          p_material_request_id: string
          p_status: Database["public"]["Enums"]["material_request_status"]
        }
        Returns: Database["public"]["Tables"]["job_material_requests"]["Row"]
      }
      register_worker_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      save_customer_profile: {
        Args: {
          p_display_name: string
          p_emergency_contact?: string | null
          p_home_location: string
        }
        Returns: Database["public"]["Tables"]["customer_profiles"]["Row"]
      }
      save_worker_profile: {
        Args: {
          p_display_name: string
          p_experience_years: number
          p_preferred_rate_bdt: number
          p_primary_trade: string
          p_service_radius_km: number
        }
        Returns: Database["public"]["Tables"]["worker_profiles"]["Row"]
      }
      set_active_role: {
        Args: { p_role: Database["public"]["Enums"]["app_role"] }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      withdraw_service_proposal: {
        Args: { p_proposal_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "customer" | "worker"
      material_request_status: "pending" | "approved" | "rejected"
      service_media_type: "image" | "video"
      worker_verification_status: "unverified" | "pending" | "verified"
      service_proposal_status: "pending" | "accepted" | "declined" | "withdrawn"
      service_request_status:
        | "open"
        | "assigned"
        | "ordered"
        | "completed"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "worker"],
      material_request_status: ["pending", "approved", "rejected"],
      service_media_type: ["image", "video"],
      worker_verification_status: ["unverified", "pending", "verified"],
      service_proposal_status: ["pending", "accepted", "declined", "withdrawn"],
      service_request_status: [
        "open",
        "assigned",
        "ordered",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
