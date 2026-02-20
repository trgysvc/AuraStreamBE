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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      custom_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          delivery_track_id: string | null
          id: string
          price_paid: number | null
          prompt: string | null
          reference_links: string[] | null
          specs: Json | null
          status: Database["public"]["Enums"]["request_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          delivery_track_id?: string | null
          id?: string
          price_paid?: number | null
          prompt?: string | null
          reference_links?: string[] | null
          specs?: Json | null
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          delivery_track_id?: string | null
          id?: string
          price_paid?: number | null
          prompt?: string | null
          reference_links?: string[] | null
          specs?: Json | null
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_requests_delivery_track_id_fkey"
            columns: ["delivery_track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          created_at: string | null
          currency: string | null
          download_token: string | null
          expires_at: string | null
          id: string
          license_key: string
          platform_id: string | null
          price_paid: number | null
          project_name: string
          track_id: string
          usage_type: Database["public"]["Enums"]["license_usage_type"]
          user_id: string
          watermark_hash: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          download_token?: string | null
          expires_at?: string | null
          id?: string
          license_key: string
          platform_id?: string | null
          price_paid?: number | null
          project_name: string
          track_id: string
          usage_type: Database["public"]["Enums"]["license_usage_type"]
          user_id: string
          watermark_hash?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          download_token?: string | null
          expires_at?: string | null
          id?: string
          license_key?: string
          platform_id?: string | null
          price_paid?: number | null
          project_name?: string
          track_id?: string
          usage_type?: Database["public"]["Enums"]["license_usage_type"]
          user_id?: string
          watermark_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string | null
          dispute_text: string
          id: string
          license_id: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string | null
          user_id: string
          video_url: string
        }
        Insert: {
          created_at?: string | null
          dispute_text: string
          id?: string
          license_id: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string | null
          user_id: string
          video_url: string
        }
        Update: {
          created_at?: string | null
          dispute_text?: string
          id?: string
          license_id?: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string | null
          user_id?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      playback_sessions: {
        Row: {
          duration_listened: number
          id: string
          offline_mode: boolean | null
          played_at: string | null
          skipped: boolean | null
          track_id: string
          tuning_used: Database["public"]["Enums"]["tuning_f"] | null
          user_id: string | null
          venue_id: string | null
        }
        Insert: {
          duration_listened: number
          id?: string
          offline_mode?: boolean | null
          played_at?: string | null
          skipped?: boolean | null
          track_id: string
          tuning_used?: Database["public"]["Enums"]["tuning_f"] | null
          user_id?: string | null
          venue_id?: string | null
        }
        Update: {
          duration_listened?: number
          id?: string
          offline_mode?: boolean | null
          played_at?: string | null
          skipped?: boolean | null
          track_id?: string
          tuning_used?: Database["public"]["Enums"]["tuning_f"] | null
          user_id?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playback_sessions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playback_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playback_sessions_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          admin_notes: string | null
          category: Database["public"]["Enums"]["feedback_category"]
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["feedback_severity"] | null
          status: Database["public"]["Enums"]["feedback_status"] | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          category: Database["public"]["Enums"]["feedback_category"]
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["feedback_severity"] | null
          status?: Database["public"]["Enums"]["feedback_status"] | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: Database["public"]["Enums"]["feedback_category"]
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["feedback_severity"] | null
          status?: Database["public"]["Enums"]["feedback_status"] | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          friend_email: string
          friend_name: string
          id: string
          referrer_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          friend_email: string
          friend_name: string
          id?: string
          referrer_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          friend_email?: string
          friend_name?: string
          id?: string
          referrer_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          stripe_customer_id: string | null
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          tenant_id: string | null
          updated_at: string | null
          youtube_channel_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          tenant_id?: string | null
          updated_at?: string | null
          youtube_channel_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          tenant_id?: string | null
          updated_at?: string | null
          youtube_channel_id?: string | null
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string | null
          id: string
          name: string
          notify_on_match: boolean | null
          query_params: Json
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          notify_on_match?: boolean | null
          query_params: Json
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          notify_on_match?: boolean | null
          query_params?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      search_logs: {
        Row: {
          created_at: string | null
          filters_used: Json | null
          id: string
          latency_ms: number | null
          query_text: string | null
          result_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          filters_used?: Json | null
          id?: string
          latency_ms?: number | null
          query_text?: string | null
          result_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          filters_used?: Json | null
          id?: string
          latency_ms?: number | null
          query_text?: string | null
          result_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      track_files: {
        Row: {
          bitrate: number | null
          created_at: string | null
          file_type: Database["public"]["Enums"]["file_type"]
          id: string
          lufs_value: number | null
          s3_key: string
          track_id: string
          tuning: Database["public"]["Enums"]["tuning_f"] | null
        }
        Insert: {
          bitrate?: number | null
          created_at?: string | null
          file_type: Database["public"]["Enums"]["file_type"]
          id?: string
          lufs_value?: number | null
          s3_key: string
          track_id: string
          tuning?: Database["public"]["Enums"]["tuning_f"] | null
        }
        Update: {
          bitrate?: number | null
          created_at?: string | null
          file_type?: Database["public"]["Enums"]["file_type"]
          id?: string
          lufs_value?: number | null
          s3_key?: string
          track_id?: string
          tuning?: Database["public"]["Enums"]["tuning_f"] | null
        }
        Relationships: [
          {
            foreignKeyName: "track_files_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      track_reviews: {
        Row: {
          decision: string | null
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewer_id: string
          track_id: string
        }
        Insert: {
          decision?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewer_id: string
          track_id: string
        }
        Update: {
          decision?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_reviews_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          ai_metadata: Json
          artist: string | null
          bpm: number | null
          cover_image_url: string | null
          created_at: string | null
          duration_sec: number | null
          genre: string | null
          id: string
          instruments: string[] | null
          is_instrumental: boolean | null
          key: string | null
          mood_tags: string[] | null
          popularity_score: number | null
          primary_tuning: Database["public"]["Enums"]["tuning_f"] | null
          status: Database["public"]["Enums"]["track_status"] | null
          title: string
          updated_at: string | null
          metadata: Json | null
          embedding: number[] | null
          lyrics: string | null
          theme: string | null
          character: string | null
          vibe_tags: string[] | null
          venue_tags: string[] | null
          sfx_tags: string[] | null
          lyrics_synced: Json | null
          sub_genres: string[] | null
          character_tags: string[] | null
          vocal_type: string | null
          theme_tags: string[] | null
        }
        Insert: {
          ai_metadata?: Json
          artist?: string | null
          bpm?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          duration_sec?: number | null
          genre?: string | null
          id?: string
          instruments?: string[] | null
          is_instrumental?: boolean | null
          key?: string | null
          mood_tags?: string[] | null
          popularity_score?: number | null
          primary_tuning?: Database["public"]["Enums"]["tuning_f"] | null
          status?: Database["public"]["Enums"]["track_status"] | null
          title: string
          updated_at?: string | null
          metadata?: Json | null
          embedding?: number[] | null
          lyrics?: string | null
          theme?: string | null
          character?: string | null
          vibe_tags?: string[] | null
          venue_tags?: string[] | null
          sfx_tags?: string[] | null
          lyrics_synced?: Json | null
          sub_genres?: string[] | null
          character_tags?: string[] | null
          vocal_type?: string | null
          theme_tags?: string[] | null
        }
        Update: {
          ai_metadata?: Json
          artist?: string | null
          bpm?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          duration_sec?: number | null
          genre?: string | null
          id?: string
          instruments?: string[] | null
          is_instrumental?: boolean | null
          key?: string | null
          mood_tags?: string[] | null
          popularity_score?: number | null
          primary_tuning?: Database["public"]["Enums"]["tuning_f"] | null
          status?: Database["public"]["Enums"]["track_status"] | null
          title?: string
          updated_at?: string | null
          metadata?: Json | null
          embedding?: number[] | null
          lyrics?: string | null
          theme?: string | null
          character?: string | null
          vibe_tags?: string[] | null
          venue_tags?: string[] | null
          sfx_tags?: string[] | null
          lyrics_synced?: Json | null
          sub_genres?: string[] | null
          character_tags?: string[] | null
          vocal_type?: string | null
          theme_tags?: string[] | null
        }
        Relationships: []
      }
      likes: {
        Row: {
          id: string
          user_id: string
          track_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          track_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          track_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          id: string
          tenant_id: string | null
          name: string
          description: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          name: string
          description?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string | null
          name?: string
          description?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlists_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_items: {
        Row: {
          id: string
          playlist_id: string
          track_id: string
          position: number
          created_at: string | null
        }
        Insert: {
          id?: string
          playlist_id: string
          track_id: string
          position: number
          created_at?: string | null
        }
        Update: {
          id?: string
          playlist_id?: string
          track_id?: string
          position?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          id: string
          tenant_id: string
          venue_id: string | null
          name: string
          hardware_id: string
          auth_token: string
          ip_address: string | null
          app_version: string | null
          sync_status: "synced" | "downloading" | "error"
          last_heartbeat: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          venue_id?: string | null
          name: string
          hardware_id: string
          auth_token: string
          ip_address?: string | null
          app_version?: string | null
          sync_status?: "synced" | "downloading" | "error"
          last_heartbeat?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          venue_id?: string | null
          name?: string
          hardware_id?: string
          auth_token?: string
          ip_address?: string | null
          app_version?: string | null
          sync_status?: "synced" | "downloading" | "error"
          last_heartbeat?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          business_name: string
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          owner_id: string
          tenant_id: string | null
          settings: Json | null
          updated_at: string | null
          verification_status:
          | Database["public"]["Enums"]["verification_status"]
          | null
          mood_tags: string[] | null
          description: string | null
          name: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          business_name: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          owner_id?: string
          tenant_id?: string | null
          settings?: Json | null
          updated_at?: string | null
          verification_status?:
          | Database["public"]["Enums"]["verification_status"]
          | null
          mood_tags?: string[] | null
          description?: string | null
          name?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          business_name?: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          owner_id?: string
          tenant_id?: string | null
          settings?: Json | null
          updated_at?: string | null
          verification_status?:
          | Database["public"]["Enums"]["verification_status"]
          | null
          mood_tags?: string[] | null
          description?: string | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_schedules: {
        Row: {
          id: string
          venue_id: string
          name: string
          start_time: string
          end_time: string
          day_of_week: number[]
          moods: string[]
          genres: string[]
          target_energy: number
          target_tuning: Database["public"]["Enums"]["tuning_f"]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          venue_id: string
          name: string
          start_time: string
          end_time: string
          day_of_week: number[]
          moods: string[]
          genres: string[]
          target_energy: number
          target_tuning: Database["public"]["Enums"]["tuning_f"]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          venue_id?: string
          name?: string
          start_time?: string
          end_time?: string
          day_of_week?: number[]
          moods?: string[]
          genres?: string[]
          target_energy?: number
          target_tuning?: Database["public"]["Enums"]["tuning_f"]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_schedules_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          id: string
          owner_id: string | null
          legal_name: string | null
          display_name: string | null
          industry: string | null
          website: string | null
          tax_office: string | null
          vkn: string | null
          billing_address: string | null
          invoice_email: string | null
          phone: string | null
          authorized_person_name: string | null
          authorized_person_phone: string | null
          logo_url: string | null
          brand_color: string | null
          volume_limit: number | null
          current_plan: Database["public"]["Enums"]["plan_type"] | null
          plan_status: Database["public"]["Enums"]["plan_status"] | null
          trial_ends_at: string | null
          subscription_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          owner_id?: string | null
          legal_name?: string | null
          display_name?: string | null
          industry?: string | null
          website?: string | null
          tax_office?: string | null
          vkn?: string | null
          billing_address?: string | null
          invoice_email?: string | null
          phone?: string | null
          authorized_person_name?: string | null
          authorized_person_phone?: string | null
          logo_url?: string | null
          brand_color?: string | null
          volume_limit?: number | null
          current_plan?: Database["public"]["Enums"]["plan_type"] | null
          plan_status?: Database["public"]["Enums"]["plan_status"] | null
          trial_ends_at?: string | null
          subscription_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string | null
          legal_name?: string | null
          display_name?: string | null
          industry?: string | null
          website?: string | null
          tax_office?: string | null
          vkn?: string | null
          billing_address?: string | null
          invoice_email?: string | null
          phone?: string | null
          authorized_person_name?: string | null
          authorized_person_phone?: string | null
          logo_url?: string | null
          brand_color?: string | null
          volume_limit?: number | null
          current_plan?: Database["public"]["Enums"]["plan_type"] | null
          plan_status?: Database["public"]["Enums"]["plan_status"] | null
          trial_ends_at?: string | null
          subscription_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_history: {
        Row: {
          id: string
          tenant_id: string | null
          plan_id: string | null
          amount: number | null
          currency: string | null
          status: string | null
          period_start: string | null
          period_end: string | null
          invoice_pdf_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          plan_id?: string | null
          amount?: number | null
          currency?: string | null
          status?: string | null
          period_start?: string | null
          period_end?: string | null
          invoice_pdf_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string | null
          plan_id?: string | null
          amount?: number | null
          currency?: string | null
          status?: string | null
          period_start?: string | null
          period_end?: string | null
          invoice_pdf_url?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
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
      delivery_status: "pending" | "packaged" | "delivered" | "failed"
      feedback_category: "bug" | "feature" | "content" | "billing"
      feedback_severity: "low" | "medium" | "high" | "critical"
      feedback_status: "new" | "in_progress" | "resolved" | "ignored"
      file_type:
      | "raw"
      | "stream_aac"
      | "stream_flac"
      | "download_mp3"
      | "download_wav"
      | "stem"
      license_usage_type:
      | "youtube"
      | "podcast"
      | "advertisement"
      | "film"
      | "social_media"
      plan_status: "active" | "past_due" | "canceled" | "trialing"
      plan_type: "free" | "pro" | "business" | "enterprise"
      request_status:
      | "pending"
      | "processing"
      | "review"
      | "completed"
      | "rejected"
      subscription_tier: "free" | "pro" | "business" | "enterprise"
      track_status: "pending_qc" | "processing" | "active" | "rejected"
      tuning_f: "440hz" | "432hz" | "528hz"
      user_role: "venue" | "creator" | "admin" | "enterprise_admin" | "staff"
      verification_status: "pending" | "verified" | "rejected"
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
      delivery_status: ["pending", "packaged", "delivered", "failed"],
      file_type: [
        "raw",
        "stream_aac",
        "stream_flac",
        "download_mp3",
        "download_wav",
        "stem",
      ],
      license_usage_type: [
        "youtube",
        "podcast",
        "advertisement",
        "film",
        "social_media",
      ],
      request_status: [
        "pending",
        "processing",
        "review",
        "completed",
        "rejected",
      ],
      subscription_tier: ["free", "pro", "business", "enterprise"],
      track_status: ["pending_qc", "processing", "active", "rejected"],
      tuning_f: ["440hz", "432hz", "528hz"],
      user_role: ["venue", "creator", "admin"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
