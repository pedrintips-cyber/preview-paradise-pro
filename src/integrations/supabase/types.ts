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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      affiliate_clicks: {
        Row: {
          affiliate_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          page: string | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          affiliate_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          page?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          affiliate_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          page?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_sales: {
        Row: {
          affiliate_id: string
          commission_amount: number
          created_at: string | null
          id: string
          plan_id: string | null
          purchase_id: string | null
          sale_amount: number
          status: string
          updated_at: string | null
        }
        Insert: {
          affiliate_id: string
          commission_amount: number
          created_at?: string | null
          id?: string
          plan_id?: string | null
          purchase_id?: string | null
          sale_amount: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number
          created_at?: string | null
          id?: string
          plan_id?: string | null
          purchase_id?: string | null
          sale_amount?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_sales_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_sales_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "vip_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_sales_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_withdrawals: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string | null
          id: string
          pix_key: string
          pix_key_type: string
          processed_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          affiliate_id: string
          amount: number
          created_at?: string | null
          id?: string
          pix_key: string
          pix_key_type?: string
          processed_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string | null
          id?: string
          pix_key?: string
          pix_key_type?: string
          processed_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_withdrawals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          activation_purchase_id: string | null
          balance: number
          commission_rate: number
          created_at: string | null
          email: string
          gateway_token: string | null
          gateway_type: string | null
          id: string
          is_paid: boolean
          name: string
          paid_at: string | null
          phone: string | null
          pix_key: string | null
          pix_key_type: string | null
          slug: string
          status: string
          total_earned: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activation_purchase_id?: string | null
          balance?: number
          commission_rate?: number
          created_at?: string | null
          email: string
          gateway_token?: string | null
          gateway_type?: string | null
          id?: string
          is_paid?: boolean
          name: string
          paid_at?: string | null
          phone?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          slug: string
          status?: string
          total_earned?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activation_purchase_id?: string | null
          balance?: number
          commission_rate?: number
          created_at?: string | null
          email?: string
          gateway_token?: string | null
          gateway_type?: string | null
          id?: string
          is_paid?: boolean
          name?: string
          paid_at?: string | null
          phone?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          slug?: string
          status?: string
          total_earned?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          video_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          video_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          image_url: string
          is_vip: boolean | null
          sort_order: number | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          image_url: string
          is_vip?: boolean | null
          sort_order?: number | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_vip?: boolean | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          image_url: string
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          image_url: string
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          image_url?: string
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          affiliate_id: string | null
          amount: number
          created_at: string | null
          customer_document: string
          customer_email: string
          customer_name: string
          customer_phone: string
          expires_at: string | null
          id: string
          paradise_reference: string
          paradise_transaction_id: string | null
          plan_id: string | null
          qr_code: string | null
          qr_code_base64: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          affiliate_id?: string | null
          amount: number
          created_at?: string | null
          customer_document: string
          customer_email: string
          customer_name: string
          customer_phone: string
          expires_at?: string | null
          id?: string
          paradise_reference: string
          paradise_transaction_id?: string | null
          plan_id?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          affiliate_id?: string | null
          amount?: number
          created_at?: string | null
          customer_document?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          expires_at?: string | null
          id?: string
          paradise_reference?: string
          paradise_transaction_id?: string | null
          plan_id?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "vip_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
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
      videos: {
        Row: {
          active: boolean | null
          category_id: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          is_vip: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
          views: number | null
        }
        Insert: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_vip?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          views?: number | null
        }
        Update: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_vip?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_plans: {
        Row: {
          active: boolean | null
          banner_url: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          period: string
          price: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          period?: string
          price: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          period?: string
          price?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
