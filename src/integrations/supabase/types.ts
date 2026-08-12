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
      form_submissions: {
        Row: {
          additional_stops: string | null
          airline: string | null
          company_email_error: string | null
          company_email_status: string
          company_name: string | null
          corporate_booking: boolean | null
          created_at: string
          customer_email: string
          customer_email_error: string | null
          customer_email_status: string
          customer_name: string
          dropoff_address: string | null
          flight_number: string | null
          form_type: string
          id: string
          ip_hash: string | null
          luggage: number | null
          meet_and_greet: boolean | null
          passengers: number | null
          phone: string | null
          pickup_address: string | null
          pickup_datetime: string | null
          raw_payload: Json | null
          return_datetime: string | null
          source_page: string | null
          special_requests: string | null
          status: string
          submission_hash: string | null
          trip_type: string | null
          updated_at: string
          vehicle_preference: string | null
        }
        Insert: {
          additional_stops?: string | null
          airline?: string | null
          company_email_error?: string | null
          company_email_status?: string
          company_name?: string | null
          corporate_booking?: boolean | null
          created_at?: string
          customer_email: string
          customer_email_error?: string | null
          customer_email_status?: string
          customer_name: string
          dropoff_address?: string | null
          flight_number?: string | null
          form_type: string
          id?: string
          ip_hash?: string | null
          luggage?: number | null
          meet_and_greet?: boolean | null
          passengers?: number | null
          phone?: string | null
          pickup_address?: string | null
          pickup_datetime?: string | null
          raw_payload?: Json | null
          return_datetime?: string | null
          source_page?: string | null
          special_requests?: string | null
          status?: string
          submission_hash?: string | null
          trip_type?: string | null
          updated_at?: string
          vehicle_preference?: string | null
        }
        Update: {
          additional_stops?: string | null
          airline?: string | null
          company_email_error?: string | null
          company_email_status?: string
          company_name?: string | null
          corporate_booking?: boolean | null
          created_at?: string
          customer_email?: string
          customer_email_error?: string | null
          customer_email_status?: string
          customer_name?: string
          dropoff_address?: string | null
          flight_number?: string | null
          form_type?: string
          id?: string
          ip_hash?: string | null
          luggage?: number | null
          meet_and_greet?: boolean | null
          passengers?: number | null
          phone?: string | null
          pickup_address?: string | null
          pickup_datetime?: string | null
          raw_payload?: Json | null
          return_datetime?: string | null
          source_page?: string | null
          special_requests?: string | null
          status?: string
          submission_hash?: string | null
          trip_type?: string | null
          updated_at?: string
          vehicle_preference?: string | null
        }
        Relationships: []
      }
      driver_applications: {
        Row: {
          background_check_consent: boolean
          certification_consent: boolean
          chauffeur_experience: string
          city: string | null
          client_token: string | null
          country: string | null
          created_at: string
          data_consent: boolean
          dui_past_5_years: string
          email: string
          employment_terms_ack: boolean
          felony_conviction: string
          full_name: string
          headshot_path: string
          id: string
          ip_hash: string | null
          license_back_path: string
          license_front_path: string
          phone: string
          postal_code: string | null
          raw_payload: Json | null
          screening_notice_ack: boolean
          source_page: string | null
          state: string | null
          status: string
          street_address: string | null
          transportation_license_path: string | null
          updated_at: string
        }
        Insert: {
          background_check_consent?: boolean
          certification_consent?: boolean
          chauffeur_experience: string
          city?: string | null
          client_token?: string | null
          country?: string | null
          created_at?: string
          data_consent?: boolean
          dui_past_5_years: string
          email: string
          employment_terms_ack?: boolean
          felony_conviction: string
          full_name: string
          headshot_path: string
          id?: string
          ip_hash?: string | null
          license_back_path: string
          license_front_path: string
          phone: string
          postal_code?: string | null
          raw_payload?: Json | null
          screening_notice_ack?: boolean
          source_page?: string | null
          state?: string | null
          status?: string
          street_address?: string | null
          transportation_license_path?: string | null
          updated_at?: string
        }
        Update: {
          background_check_consent?: boolean
          certification_consent?: boolean
          chauffeur_experience?: string
          city?: string | null
          client_token?: string | null
          country?: string | null
          created_at?: string
          data_consent?: boolean
          dui_past_5_years?: string
          email?: string
          employment_terms_ack?: boolean
          felony_conviction?: string
          full_name?: string
          headshot_path?: string
          id?: string
          ip_hash?: string | null
          license_back_path?: string
          license_front_path?: string
          phone?: string
          postal_code?: string | null
          raw_payload?: Json | null
          screening_notice_ack?: boolean
          source_page?: string | null
          state?: string | null
          status?: string
          street_address?: string | null
          transportation_license_path?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_partner_applications: {
        Row: {
          active_drivers: string | null
          business_license_path: string | null
          certification_ack: boolean
          city: string | null
          client_token: string | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          contact_consent_ack: boolean
          country: string | null
          created_at: string
          ein_letter_path: string | null
          email: string
          fleet_description: string | null
          fleet_vehicle_count: string | null
          full_name: string
          id: string
          insurance_cert_path: string | null
          ip_hash: string | null
          job_title: string | null
          no_partnership_disclaimer_ack: boolean
          operating_permit_path: string | null
          phone: string
          postal_code: string | null
          raw_payload: Json | null
          source_page: string | null
          state: string | null
          status: string
          street_address: string | null
          suit_requirement: string | null
          updated_at: string
          website: string | null
          years_operating: string | null
        }
        Insert: {
          active_drivers?: string | null
          business_license_path?: string | null
          certification_ack?: boolean
          city?: string | null
          client_token?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          contact_consent_ack?: boolean
          country?: string | null
          created_at?: string
          ein_letter_path?: string | null
          email: string
          fleet_description?: string | null
          fleet_vehicle_count?: string | null
          full_name: string
          id?: string
          insurance_cert_path?: string | null
          ip_hash?: string | null
          job_title?: string | null
          no_partnership_disclaimer_ack?: boolean
          operating_permit_path?: string | null
          phone: string
          postal_code?: string | null
          raw_payload?: Json | null
          source_page?: string | null
          state?: string | null
          status?: string
          street_address?: string | null
          suit_requirement?: string | null
          updated_at?: string
          website?: string | null
          years_operating?: string | null
        }
        Update: {
          active_drivers?: string | null
          business_license_path?: string | null
          certification_ack?: boolean
          city?: string | null
          client_token?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          contact_consent_ack?: boolean
          country?: string | null
          created_at?: string
          ein_letter_path?: string | null
          email?: string
          fleet_description?: string | null
          fleet_vehicle_count?: string | null
          full_name?: string
          id?: string
          insurance_cert_path?: string | null
          ip_hash?: string | null
          job_title?: string | null
          no_partnership_disclaimer_ack?: boolean
          operating_permit_path?: string | null
          phone?: string
          postal_code?: string | null
          raw_payload?: Json | null
          source_page?: string | null
          state?: string | null
          status?: string
          street_address?: string | null
          suit_requirement?: string | null
          updated_at?: string
          website?: string | null
          years_operating?: string | null
        }
        Relationships: []
      }
      referral_partner_applications: {
        Row: {
          agreement_ack_1: boolean
          agreement_ack_2: boolean
          applicant_type: string
          city: string
          client_token: string | null
          company_brand_name: string | null
          country: string
          created_at: string
          email: string
          estimated_referrals: string
          facebook: string | null
          full_name: string
          id: string
          instagram: string | null
          ip_hash: string | null
          linkedin: string | null
          other_platform: string | null
          phone: string
          preferred_payment: string | null
          raw_payload: Json | null
          referral_method: string
          source_page: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          agreement_ack_1?: boolean
          agreement_ack_2?: boolean
          applicant_type: string
          city: string
          client_token?: string | null
          company_brand_name?: string | null
          country: string
          created_at?: string
          email: string
          estimated_referrals: string
          facebook?: string | null
          full_name: string
          id?: string
          instagram?: string | null
          ip_hash?: string | null
          linkedin?: string | null
          other_platform?: string | null
          phone: string
          preferred_payment?: string | null
          raw_payload?: Json | null
          referral_method: string
          source_page?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          agreement_ack_1?: boolean
          agreement_ack_2?: boolean
          applicant_type?: string
          city?: string
          client_token?: string | null
          company_brand_name?: string | null
          country?: string
          created_at?: string
          email?: string
          estimated_referrals?: string
          facebook?: string | null
          full_name?: string
          id?: string
          instagram?: string | null
          ip_hash?: string | null
          linkedin?: string | null
          other_platform?: string | null
          phone?: string
          preferred_payment?: string | null
          raw_payload?: Json | null
          referral_method?: string
          source_page?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
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
