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
      activities: {
        Row: {
          activity_date: string
          activity_time: string | null
          class_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          description_en: string | null
          id: string
          linked_to_value: boolean
          published: boolean
          title: string
          title_en: string | null
          updated_at: string
          value_id: string | null
        }
        Insert: {
          activity_date?: string
          activity_time?: string | null
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          id?: string
          linked_to_value?: boolean
          published?: boolean
          title: string
          title_en?: string | null
          updated_at?: string
          value_id?: string | null
        }
        Update: {
          activity_date?: string
          activity_time?: string | null
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          id?: string
          linked_to_value?: boolean
          published?: boolean
          title?: string
          title_en?: string | null
          updated_at?: string
          value_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_value_id_fkey"
            columns: ["value_id"]
            isOneToOne: false
            referencedRelation: "values_week"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_photos: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          path: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          path: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          path?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_photos_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      child_guardians: {
        Row: {
          child_id: string
          guardian_id: string
          relation: string | null
        }
        Insert: {
          child_id: string
          guardian_id: string
          relation?: string | null
        }
        Update: {
          child_id?: string
          guardian_id?: string
          relation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_guardians_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_guardians_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      child_notes: {
        Row: {
          author_id: string
          body: string
          child_id: string
          created_at: string
          domain: string | null
          id: string
        }
        Insert: {
          author_id?: string
          body: string
          child_id: string
          created_at?: string
          domain?: string | null
          id?: string
        }
        Update: {
          author_id?: string
          body?: string
          child_id?: string
          created_at?: string
          domain?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_notes_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          allergies: string | null
          allergies_en: string | null
          birth_date: string | null
          class_id: string | null
          created_at: string
          enrollment_term: string | null
          gender: string | null
          id: string
          name: string
          name_en: string | null
          notes: string | null
          session_period: string | null
          stage: string
        }
        Insert: {
          allergies?: string | null
          allergies_en?: string | null
          birth_date?: string | null
          class_id?: string | null
          created_at?: string
          enrollment_term?: string | null
          gender?: string | null
          id?: string
          name: string
          name_en?: string | null
          notes?: string | null
          session_period?: string | null
          stage?: string
        }
        Update: {
          allergies?: string | null
          allergies_en?: string | null
          birth_date?: string | null
          class_id?: string | null
          created_at?: string
          enrollment_term?: string | null
          gender?: string | null
          id?: string
          name?: string
          name_en?: string | null
          notes?: string | null
          session_period?: string | null
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          id: string
          name: string
          name_en: string | null
          stage: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          name_en?: string | null
          stage: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          name_en?: string | null
          stage?: string
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          bathroom_count: number
          bathroom_notes: string | null
          child_id: string
          created_at: string
          diaper_count: number
          id: string
          log_date: string
          meal_notes: string | null
          meal_status: string | null
          meal_time: string | null
          prayer_done: boolean
          recorded_by: string | null
          sleep_end: string | null
          sleep_start: string | null
          slept: boolean
          updated_at: string
        }
        Insert: {
          bathroom_count?: number
          bathroom_notes?: string | null
          child_id: string
          created_at?: string
          diaper_count?: number
          id?: string
          log_date?: string
          meal_notes?: string | null
          meal_status?: string | null
          meal_time?: string | null
          prayer_done?: boolean
          recorded_by?: string | null
          sleep_end?: string | null
          sleep_start?: string | null
          slept?: boolean
          updated_at?: string
        }
        Update: {
          bathroom_count?: number
          bathroom_notes?: string | null
          child_id?: string
          created_at?: string
          diaper_count?: number
          id?: string
          log_date?: string
          meal_notes?: string | null
          meal_status?: string | null
          meal_time?: string | null
          prayer_done?: boolean
          recorded_by?: string | null
          sleep_end?: string | null
          sleep_start?: string | null
          slept?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          child_id: string | null
          created_at: string
          id: string
          last_message_at: string
          parent_id: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          parent_id: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          child_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          parent_id?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          sender_id: string
          sender_role: string
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sender_id?: string
          sender_role?: string
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sender_id?: string
          sender_role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      nursery_settings: {
        Row: {
          city: string
          city_en: string
          created_at: string
          day_end: string
          day_start: string
          email: string
          id: string
          instagram: string
          name: string
          name_en: string
          phone: string
          singleton: boolean
          tagline: string
          tagline_en: string
          updated_at: string
        }
        Insert: {
          city?: string
          city_en?: string
          created_at?: string
          day_end?: string
          day_start?: string
          email?: string
          id?: string
          instagram?: string
          name?: string
          name_en?: string
          phone?: string
          singleton?: boolean
          tagline?: string
          tagline_en?: string
          updated_at?: string
        }
        Update: {
          city?: string
          city_en?: string
          created_at?: string
          day_end?: string
          day_start?: string
          email?: string
          id?: string
          instagram?: string
          name?: string
          name_en?: string
          phone?: string
          singleton?: boolean
          tagline?: string
          tagline_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          full_name_en: string | null
          id: string
          language: string
          must_change_password: boolean
          phone: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          full_name: string
          full_name_en?: string | null
          id: string
          language?: string
          must_change_password?: boolean
          phone?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string
          full_name_en?: string | null
          id?: string
          language?: string
          must_change_password?: boolean
          phone?: string | null
          title?: string | null
        }
        Relationships: []
      }
      schedule_items: {
        Row: {
          at_time: string | null
          class_id: string
          created_at: string
          description: string | null
          description_en: string | null
          id: string
          order_index: number
          title: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          at_time?: string | null
          class_id: string
          created_at?: string
          description?: string | null
          description_en?: string | null
          id?: string
          order_index?: number
          title: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          at_time?: string | null
          class_id?: string
          created_at?: string
          description?: string | null
          description_en?: string | null
          id?: string
          order_index?: number
          title?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_items_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_progress: {
        Row: {
          created_at: string
          done: boolean
          id: string
          item_id: string
          log_date: string
          marked_by: string | null
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          item_id: string
          log_date?: string
          marked_by?: string | null
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          item_id?: string
          log_date?: string
          marked_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_progress_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "schedule_items"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_classes: {
        Row: {
          class_id: string
          teacher_id: string
        }
        Insert: {
          class_id: string
          teacher_id: string
        }
        Update: {
          class_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      values_week: {
        Row: {
          approved: boolean
          at_home: string[]
          at_home_en: string[]
          at_school: string[]
          at_school_en: string[]
          created_at: string
          description: string | null
          description_en: string | null
          hadith: string | null
          hadith_en: string | null
          id: string
          is_current: boolean
          learnings: string[]
          learnings_en: string[]
          name: string
          name_en: string | null
          source: string | null
          source_en: string | null
          tagline: string | null
          tagline_en: string | null
          updated_at: string
          week_start: string | null
        }
        Insert: {
          approved?: boolean
          at_home?: string[]
          at_home_en?: string[]
          at_school?: string[]
          at_school_en?: string[]
          created_at?: string
          description?: string | null
          description_en?: string | null
          hadith?: string | null
          hadith_en?: string | null
          id?: string
          is_current?: boolean
          learnings?: string[]
          learnings_en?: string[]
          name: string
          name_en?: string | null
          source?: string | null
          source_en?: string | null
          tagline?: string | null
          tagline_en?: string | null
          updated_at?: string
          week_start?: string | null
        }
        Update: {
          approved?: boolean
          at_home?: string[]
          at_home_en?: string[]
          at_school?: string[]
          at_school_en?: string[]
          created_at?: string
          description?: string | null
          description_en?: string | null
          hadith?: string | null
          hadith_en?: string | null
          id?: string
          is_current?: boolean
          learnings?: string[]
          learnings_en?: string[]
          name?: string
          name_en?: string | null
          source?: string | null
          source_en?: string | null
          tagline?: string | null
          tagline_en?: string | null
          updated_at?: string
          week_start?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_child_in_class: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_guardian_of: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      teaches_child: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      teaches_class: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "parent" | "teacher" | "admin" | "super_admin"
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
      app_role: ["parent", "teacher", "admin", "super_admin"],
    },
  },
} as const
