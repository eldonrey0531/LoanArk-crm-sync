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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          address: string | null
          city: string | null
          client_type_prospects: string | null
          client_type_vip_status: string | null
          created_at: string | null
          createdate: string | null
          email: string | null
          email_verification_status: string | null
          firstname: string | null
          hs_object_id: string
          id: number
          lastmodifieddate: string | null
          lastname: string | null
          mobilephone: string | null
          phone: string | null
          state: string | null
          sync_source: string | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_type_prospects?: string | null
          client_type_vip_status?: string | null
          created_at?: string | null
          createdate?: string | null
          email?: string | null
          email_verification_status?: string | null
          firstname?: string | null
          hs_object_id: string
          id?: number
          lastmodifieddate?: string | null
          lastname?: string | null
          mobilephone?: string | null
          phone?: string | null
          state?: string | null
          sync_source?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          client_type_prospects?: string | null
          client_type_vip_status?: string | null
          created_at?: string | null
          createdate?: string | null
          email?: string | null
          email_verification_status?: string | null
          firstname?: string | null
          hs_object_id?: string
          id?: number
          lastmodifieddate?: string | null
          lastname?: string | null
          mobilephone?: string | null
          phone?: string | null
          state?: string | null
          sync_source?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      hubspot_cache: {
        Row: {
          contact_data: Json
          id: string
          last_fetched: string | null
        }
        Insert: {
          contact_data: Json
          id: string
          last_fetched?: string | null
        }
        Update: {
          contact_data?: Json
          id?: string
          last_fetched?: string | null
        }
        Relationships: []
      }
      hubspot_contacts: {
        Row: {
          company: string | null
          createdate: string | null
          email: string | null
          email_verification_date: string | null
          email_verification_status: string | null
          firstname: string | null
          hs_lastmodifieddate: string | null
          hs_object_id: string
          id: number
          imported_at: string | null
          lastname: string | null
          lifecyclestage: string | null
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          company?: string | null
          createdate?: string | null
          email?: string | null
          email_verification_date?: string | null
          email_verification_status?: string | null
          firstname?: string | null
          hs_lastmodifieddate?: string | null
          hs_object_id: string
          id?: number
          imported_at?: string | null
          lastname?: string | null
          lifecyclestage?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          company?: string | null
          createdate?: string | null
          email?: string | null
          email_verification_date?: string | null
          email_verification_status?: string | null
          firstname?: string | null
          hs_lastmodifieddate?: string | null
          hs_object_id?: string
          id?: number
          imported_at?: string | null
          lastname?: string | null
          lifecyclestage?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      hubspot_modified_contacts: {
        Row: {
          company: string | null
          createdate: string | null
          email: string | null
          email_verification_date: string | null
          email_verification_status: string | null
          firstname: string | null
          hs_all_owner_ids: string | null
          hs_lead_status: string | null
          hs_object_id: string
          id: number
          imported_at: string | null
          lastmodifieddate: string | null
          lastname: string | null
          lifecyclestage: string | null
          modification_source: string | null
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          company?: string | null
          createdate?: string | null
          email?: string | null
          email_verification_date?: string | null
          email_verification_status?: string | null
          firstname?: string | null
          hs_all_owner_ids?: string | null
          hs_lead_status?: string | null
          hs_object_id: string
          id?: number
          imported_at?: string | null
          lastmodifieddate?: string | null
          lastname?: string | null
          lifecyclestage?: string | null
          modification_source?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          company?: string | null
          createdate?: string | null
          email?: string | null
          email_verification_date?: string | null
          email_verification_status?: string | null
          firstname?: string | null
          hs_all_owner_ids?: string | null
          hs_lead_status?: string | null
          hs_object_id?: string
          id?: number
          imported_at?: string | null
          lastmodifieddate?: string | null
          lastname?: string | null
          lifecyclestage?: string | null
          modification_source?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      sync_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          records_created: number | null
          records_failed: number | null
          records_processed: number | null
          records_updated: number | null
          started_at: string | null
          status: string | null
          type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: string | null
          type?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: string | null
          type?: string
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          action: string
          contact_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          status: string | null
          sync_job_id: string | null
        }
        Insert: {
          action: string
          contact_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          status?: string | null
          sync_job_id?: string | null
        }
        Update: {
          action?: string
          contact_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          status?: string | null
          sync_job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_sync_job_id_fkey"
            columns: ["sync_job_id"]
            isOneToOne: false
            referencedRelation: "sync_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      wrappers_fdw_stats: {
        Row: {
          bytes_in: number | null
          bytes_out: number | null
          create_times: number | null
          created_at: string
          fdw_name: string
          metadata: Json | null
          rows_in: number | null
          rows_out: number | null
          updated_at: string
        }
        Insert: {
          bytes_in?: number | null
          bytes_out?: number | null
          create_times?: number | null
          created_at?: string
          fdw_name: string
          metadata?: Json | null
          rows_in?: number | null
          rows_out?: number | null
          updated_at?: string
        }
        Update: {
          bytes_in?: number | null
          bytes_out?: number | null
          create_times?: number | null
          created_at?: string
          fdw_name?: string
          metadata?: Json | null
          rows_in?: number | null
          rows_out?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      contacts_structure: {
        Row: {
          column_default: string | null
          column_name: unknown | null
          data_type: string | null
          is_nullable: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      airtable_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      airtable_fdw_meta: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      airtable_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      auth0_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      auth0_fdw_meta: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      auth0_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      big_query_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      big_query_fdw_meta: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      big_query_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      click_house_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      click_house_fdw_meta: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      click_house_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      cognito_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      cognito_fdw_meta: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      cognito_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      duckdb_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      duckdb_fdw_meta: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      duckdb_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      firebase_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      firebase_fdw_meta: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      firebase_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      get_latest_sync_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          completed_at: string
          created_at: string
          id: string
          records_created: number
          records_failed: number
          records_processed: number
          records_updated: number
          started_at: string
          status: string
          type: string
        }[]
      }
      get_sync_logs_columns: {
        Args: Record<PropertyKey, never>
        Returns: {
          column_name: string
          data_type: string
        }[]
      }
      get_sync_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          metric: string
          value: number
        }[]
      }
      hello_world_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      hello_world_fdw_meta: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      hello_world_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      iceberg_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      iceberg_fdw_meta: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      iceberg_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      import_all_hubspot_contacts: {
        Args: Record<PropertyKey, never>
        Returns: {
          batch_number: number
          records_processed: number
          status: string
        }[]
      }
      logflare_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      logflare_fdw_meta: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      logflare_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      mssql_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      mssql_fdw_meta: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      mssql_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      redis_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      redis_fdw_meta: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      redis_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      s3_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      s3_fdw_meta: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      s3_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      start_hubspot_import_batch: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      stripe_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      stripe_fdw_meta: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      stripe_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      sync_hubspot_wrapper_to_contacts: {
        Args: Record<PropertyKey, never>
        Returns: {
          new_contacts: number
          total_processed: number
          updated_contacts: number
        }[]
      }
      sync_modified_hubspot_contacts: {
        Args: Record<PropertyKey, never>
        Returns: {
          action: string
          count: number
        }[]
      }
      sync_new_hubspot_contacts: {
        Args: Record<PropertyKey, never>
        Returns: {
          action: string
          count: number
        }[]
      }
      trigger_hubspot_import: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      trigger_hubspot_import_direct: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      wasm_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      wasm_fdw_meta: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      wasm_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
