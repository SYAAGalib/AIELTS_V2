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
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          meta: Json | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          meta?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          meta?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          hashed_secret: string
          id: string
          key_prefix: string
          last_used_at: string | null
          name: string
          scopes: string[] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          hashed_secret: string
          id?: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          scopes?: string[] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          hashed_secret?: string
          id?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          scopes?: string[] | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      attempt_answers: {
        Row: {
          answer: Json | null
          attempt_id: string
          created_at: string
          id: string
          is_correct: boolean | null
          question_id: string
          score: number | null
          updated_at: string
        }
        Insert: {
          answer?: Json | null
          attempt_id: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          score?: number | null
          updated_at?: string
        }
        Update: {
          answer?: Json | null
          attempt_id?: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          band: number | null
          created_at: string
          feedback: Json | null
          id: string
          mock_test_id: string | null
          score: number | null
          skill: Database["public"]["Enums"]["skill"] | null
          started_at: string
          status: Database["public"]["Enums"]["attempt_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          band?: number | null
          created_at?: string
          feedback?: Json | null
          id?: string
          mock_test_id?: string | null
          score?: number | null
          skill?: Database["public"]["Enums"]["skill"] | null
          started_at?: string
          status?: Database["public"]["Enums"]["attempt_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          band?: number | null
          created_at?: string
          feedback?: Json | null
          id?: string
          mock_test_id?: string | null
          score?: number | null
          skill?: Database["public"]["Enums"]["skill"] | null
          started_at?: string
          status?: Database["public"]["Enums"]["attempt_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_mock_test_id_fkey"
            columns: ["mock_test_id"]
            isOneToOne: false
            referencedRelation: "mock_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoices: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          hosted_invoice_url: string | null
          id: string
          issued_at: string
          provider: string | null
          provider_invoice_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          hosted_invoice_url?: string | null
          id?: string
          issued_at?: string
          provider?: string | null
          provider_invoice_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          hosted_invoice_url?: string | null
          id?: string
          issued_at?: string
          provider?: string | null
          provider_invoice_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      content: {
        Row: {
          author_id: string | null
          body: Json
          category: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body?: Json
          category?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: Json
          category?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          created_at: string
          featured: boolean
          full_answer: string
          highlight: boolean
          id: string
          published: boolean
          question: string
          short_answer: string
          sort_order: number
          tag: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          featured?: boolean
          full_answer: string
          highlight?: boolean
          id?: string
          published?: boolean
          question: string
          short_answer?: string
          sort_order?: number
          tag?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          featured?: boolean
          full_answer?: string
          highlight?: boolean
          id?: string
          published?: boolean
          question?: string
          short_answer?: string
          sort_order?: number
          tag?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_config: {
        Row: {
          config: Json
          created_at: string
          id: string
          published_at: string | null
          status: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          published_at?: string | null
          status: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          published_at?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      listening_progress: {
        Row: {
          audio_id: string
          id: string
          progress: number
          score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_id: string
          id?: string
          progress?: number
          score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_id?: string
          id?: string
          progress?: number
          score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      live_registrations: {
        Row: {
          attended: boolean | null
          created_at: string
          id: string
          session_id: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          created_at?: string
          id?: string
          session_id: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          created_at?: string
          id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_registrations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          host_name: string | null
          id: string
          meeting_url: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          host_name?: string | null
          id?: string
          meeting_url?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          host_name?: string | null
          id?: string
          meeting_url?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mail_templates: {
        Row: {
          created_at: string
          html: string
          id: string
          name: string
          subject: string
          text: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          html: string
          id?: string
          name: string
          subject: string
          text?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          html?: string
          id?: string
          name?: string
          subject?: string
          text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mock_test_questions: {
        Row: {
          id: string
          points: number
          position: number
          question_id: string
          section_id: string
        }
        Insert: {
          id?: string
          points?: number
          position?: number
          question_id: string
          section_id: string
        }
        Update: {
          id?: string
          points?: number
          position?: number
          question_id?: string
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mock_test_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mock_test_questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "mock_test_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_test_sections: {
        Row: {
          duration_minutes: number
          id: string
          instructions: string | null
          mock_test_id: string
          position: number
          skill: Database["public"]["Enums"]["skill"]
          title: string
        }
        Insert: {
          duration_minutes?: number
          id?: string
          instructions?: string | null
          mock_test_id: string
          position?: number
          skill: Database["public"]["Enums"]["skill"]
          title: string
        }
        Update: {
          duration_minutes?: number
          id?: string
          instructions?: string | null
          mock_test_id?: string
          position?: number
          skill?: Database["public"]["Enums"]["skill"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mock_test_sections_mock_test_id_fkey"
            columns: ["mock_test_id"]
            isOneToOne: false
            referencedRelation: "mock_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_tests: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_full_test: boolean
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_full_test?: boolean
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_full_test?: boolean
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          position: number
          skill: Database["public"]["Enums"]["skill"]
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          position?: number
          skill: Database["public"]["Enums"]["skill"]
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          position?: number
          skill?: Database["public"]["Enums"]["skill"]
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read_at: string | null
          title: string
          url: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title: string
          url?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      predictions: {
        Row: {
          content: string
          created_at: string
          exam_date: string | null
          exam_period: string | null
          id: string
          skill: Database["public"]["Enums"]["skill"]
          status: Database["public"]["Enums"]["content_status"]
          topic: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          exam_date?: string | null
          exam_period?: string | null
          id?: string
          skill: Database["public"]["Enums"]["skill"]
          status?: Database["public"]["Enums"]["content_status"]
          topic: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          exam_date?: string | null
          exam_period?: string | null
          id?: string
          skill?: Database["public"]["Enums"]["skill"]
          status?: Database["public"]["Enums"]["content_status"]
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          active: boolean
          created_at: string
          cta_label: string
          currency: string
          cycle: string
          description: string | null
          features: Json
          highlight: boolean
          id: string
          name: string
          per_label: string | null
          price_cents: number
          slug: string
          sort_order: number
          trial_days: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_label?: string
          currency?: string
          cycle?: string
          description?: string | null
          features?: Json
          highlight?: boolean
          id?: string
          name: string
          per_label?: string | null
          price_cents?: number
          slug: string
          sort_order?: number
          trial_days?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_label?: string
          currency?: string
          cycle?: string
          description?: string | null
          features?: Json
          highlight?: boolean
          id?: string
          name?: string
          per_label?: string | null
          price_cents?: number
          slug?: string
          sort_order?: number
          trial_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bg_animations: boolean
          bio: string | null
          country: string | null
          created_at: string
          display_name: string | null
          exam_date: string | null
          id: string
          locale: string | null
          target_band: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bg_animations?: boolean
          bio?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          exam_date?: string | null
          id?: string
          locale?: string | null
          target_band?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bg_animations?: boolean
          bio?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          exam_date?: string | null
          id?: string
          locale?: string | null
          target_band?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer_key: Json | null
          body: Json
          created_at: string
          created_by: string | null
          difficulty: number
          id: string
          prompt: string
          skill: Database["public"]["Enums"]["skill"]
          status: Database["public"]["Enums"]["content_status"]
          tags: string[] | null
          type: string
          updated_at: string
        }
        Insert: {
          answer_key?: Json | null
          body?: Json
          created_at?: string
          created_by?: string | null
          difficulty?: number
          id?: string
          prompt: string
          skill: Database["public"]["Enums"]["skill"]
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          type: string
          updated_at?: string
        }
        Update: {
          answer_key?: Json | null
          body?: Json
          created_at?: string
          created_by?: string | null
          difficulty?: number
          id?: string
          prompt?: string
          skill?: Database["public"]["Enums"]["skill"]
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          id: string
          passage_id: string
          progress: number
          score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          passage_id: string
          progress?: number
          score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          passage_id?: string
          progress?: number
          score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          params: Json
          query_kind: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          params?: Json
          query_kind: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          params?: Json
          query_kind?: string
          updated_at?: string
        }
        Relationships: []
      }
      speaking_ai_sessions: {
        Row: {
          audio_url: string | null
          created_at: string
          feedback: Json | null
          id: string
          score: number | null
          topic: string | null
          transcript: Json
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          feedback?: Json | null
          id?: string
          score?: number | null
          topic?: string | null
          transcript?: Json
          user_id: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          feedback?: Json | null
          id?: string
          score?: number | null
          topic?: string | null
          transcript?: Json
          user_id?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          active: boolean
          created_at: string
          id: string
          initials: string
          logo_url: string | null
          name: string
          sort_order: number
          tagline: string | null
          tier: Database["public"]["Enums"]["sponsor_tier"]
          updated_at: string
          website_url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          initials: string
          logo_url?: string | null
          name: string
          sort_order?: number
          tagline?: string | null
          tier: Database["public"]["Enums"]["sponsor_tier"]
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          initials?: string
          logo_url?: string | null
          name?: string
          sort_order?: number
          tagline?: string | null
          tier?: Database["public"]["Enums"]["sponsor_tier"]
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      study_plans: {
        Row: {
          generated_at: string
          id: string
          plan: Json
          user_id: string
          week_start: string
        }
        Insert: {
          generated_at?: string
          id?: string
          plan: Json
          user_id: string
          week_start: string
        }
        Update: {
          generated_at?: string
          id?: string
          plan?: Json
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: string
          provider: string | null
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          city: string | null
          created_at: string
          id: string
          name: string
          published: boolean
          quote: string
          sort_order: number
          target: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          name: string
          published?: boolean
          quote: string
          sort_order?: number
          target?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          published?: boolean
          quote?: string
          sort_order?: number
          target?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_vocabulary: {
        Row: {
          created_at: string
          ease: number | null
          id: string
          interval_days: number | null
          next_review_at: string | null
          state: string
          updated_at: string
          user_id: string
          vocabulary_id: string
        }
        Insert: {
          created_at?: string
          ease?: number | null
          id?: string
          interval_days?: number | null
          next_review_at?: string | null
          state?: string
          updated_at?: string
          user_id: string
          vocabulary_id: string
        }
        Update: {
          created_at?: string
          ease?: number | null
          id?: string
          interval_days?: number | null
          next_review_at?: string | null
          state?: string
          updated_at?: string
          user_id?: string
          vocabulary_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_vocabulary_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabulary"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          published_at: string | null
          skill: Database["public"]["Enums"]["skill"] | null
          source_id: string | null
          status: Database["public"]["Enums"]["content_status"]
          thumbnail_url: string | null
          title: string
          updated_at: string
          url: string
          youtube_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          published_at?: string | null
          skill?: Database["public"]["Enums"]["skill"] | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          url: string
          youtube_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          published_at?: string | null
          skill?: Database["public"]["Enums"]["skill"] | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          url?: string
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "youtube_sync_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary: {
        Row: {
          cefr: string | null
          created_at: string
          definition: string
          example: string | null
          id: string
          part_of_speech: string | null
          status: Database["public"]["Enums"]["content_status"]
          tags: string[] | null
          updated_at: string
          word: string
        }
        Insert: {
          cefr?: string | null
          created_at?: string
          definition: string
          example?: string | null
          id?: string
          part_of_speech?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          updated_at?: string
          word: string
        }
        Update: {
          cefr?: string | null
          created_at?: string
          definition?: string
          example?: string | null
          id?: string
          part_of_speech?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          updated_at?: string
          word?: string
        }
        Relationships: []
      }
      writing_submissions: {
        Row: {
          band: number | null
          created_at: string
          essay: string
          feedback: Json | null
          id: string
          prompt: string
          task_type: string
          updated_at: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          band?: number | null
          created_at?: string
          essay: string
          feedback?: Json | null
          id?: string
          prompt: string
          task_type: string
          updated_at?: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          band?: number | null
          created_at?: string
          essay?: string
          feedback?: Json | null
          id?: string
          prompt?: string
          task_type?: string
          updated_at?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: []
      }
      youtube_sync_sources: {
        Row: {
          created_at: string
          default_skill: string
          enabled: boolean
          id: string
          kind: string
          label: string
          last_error: string | null
          last_imported_count: number | null
          last_synced_at: string | null
          max_results: number
          source_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_skill?: string
          enabled?: boolean
          id?: string
          kind: string
          label: string
          last_error?: string | null
          last_imported_count?: number | null
          last_synced_at?: string | null
          max_results?: number
          source_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_skill?: string
          enabled?: boolean
          id?: string
          kind?: string
          label?: string
          last_error?: string | null
          last_imported_count?: number | null
          last_synced_at?: string | null
          max_results?: number
          source_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      yt_channel_dismissed: {
        Row: {
          channel_id: string
          created_at: string
          reason: string | null
        }
        Insert: {
          channel_id: string
          created_at?: string
          reason?: string | null
        }
        Update: {
          channel_id?: string
          created_at?: string
          reason?: string | null
        }
        Relationships: []
      }
      yt_channel_requests: {
        Row: {
          admin_note: string | null
          channel_input: string
          created_at: string
          id: string
          note: string | null
          requester_email: string | null
          requester_user_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          suggested_skill: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          channel_input: string
          created_at?: string
          id?: string
          note?: string | null
          requester_email?: string | null
          requester_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          suggested_skill?: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          channel_input?: string
          created_at?: string
          id?: string
          note?: string | null
          requester_email?: string | null
          requester_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          suggested_skill?: string
          updated_at?: string
        }
        Relationships: []
      }
      yt_channel_suggestions: {
        Row: {
          channel_id: string
          created_at: string
          description: string | null
          id: string
          matched_queries: string[]
          score: number
          status: string
          subscriber_count: number | null
          suggested_skill: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_count: number | null
        }
        Insert: {
          channel_id: string
          created_at?: string
          description?: string | null
          id?: string
          matched_queries?: string[]
          score?: number
          status?: string
          subscriber_count?: number | null
          suggested_skill?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_count?: number | null
        }
        Update: {
          channel_id?: string
          created_at?: string
          description?: string | null
          id?: string
          matched_queries?: string[]
          score?: number
          status?: string
          subscriber_count?: number | null
          suggested_skill?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      attempt_status: "in_progress" | "submitted" | "graded" | "abandoned"
      content_status: "draft" | "published" | "archived"
      skill:
        | "reading"
        | "writing"
        | "listening"
        | "speaking"
        | "vocabulary"
        | "general"
      sponsor_tier: "platinum" | "gold" | "silver"
      subscription_status:
        | "trial"
        | "active"
        | "past_due"
        | "canceled"
        | "expired"
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
      app_role: ["admin", "moderator", "user"],
      attempt_status: ["in_progress", "submitted", "graded", "abandoned"],
      content_status: ["draft", "published", "archived"],
      skill: [
        "reading",
        "writing",
        "listening",
        "speaking",
        "vocabulary",
        "general",
      ],
      sponsor_tier: ["platinum", "gold", "silver"],
      subscription_status: [
        "trial",
        "active",
        "past_due",
        "canceled",
        "expired",
      ],
    },
  },
} as const
