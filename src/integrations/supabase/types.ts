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
      ai_modules: {
        Row: {
          category: Database["public"]["Enums"]["module_category"]
          configuration_schema: Json
          created_at: string | null
          description: string
          icon_name: string
          id: string
          name: string
          price_per_use: number
          status: Database["public"]["Enums"]["module_status"]
          supported_platforms: Database["public"]["Enums"]["platform_type"][]
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["module_category"]
          configuration_schema?: Json
          created_at?: string | null
          description: string
          icon_name: string
          id?: string
          name: string
          price_per_use?: number
          status?: Database["public"]["Enums"]["module_status"]
          supported_platforms: Database["public"]["Enums"]["platform_type"][]
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["module_category"]
          configuration_schema?: Json
          created_at?: string | null
          description?: string
          icon_name?: string
          id?: string
          name?: string
          price_per_use?: number
          status?: Database["public"]["Enums"]["module_status"]
          supported_platforms?: Database["public"]["Enums"]["platform_type"][]
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_projects: {
        Row: {
          compliance_flags: string[] | null
          config: Json
          created_at: string
          domain: string
          id: string
          llm_provider: string | null
          name: string
          status: string
          subdomain: string | null
          tenant_id: string
          token_budget: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          compliance_flags?: string[] | null
          config?: Json
          created_at?: string
          domain: string
          id?: string
          llm_provider?: string | null
          name: string
          status?: string
          subdomain?: string | null
          tenant_id: string
          token_budget?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          compliance_flags?: string[] | null
          config?: Json
          created_at?: string
          domain?: string
          id?: string
          llm_provider?: string | null
          name?: string
          status?: string
          subdomain?: string | null
          tenant_id?: string
          token_budget?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          cost: number | null
          created_at: string | null
          error_message: string | null
          id: string
          input_data: Json | null
          module_id: string
          output_data: Json | null
          processing_time_ms: number | null
          status: Database["public"]["Enums"]["usage_status"]
          tokens_used: number | null
          user_id: string
          workflow_id: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          module_id: string
          output_data?: Json | null
          processing_time_ms?: number | null
          status: Database["public"]["Enums"]["usage_status"]
          tokens_used?: number | null
          user_id: string
          workflow_id?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          module_id?: string
          output_data?: Json | null
          processing_time_ms?: number | null
          status?: Database["public"]["Enums"]["usage_status"]
          tokens_used?: number | null
          user_id?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "ai_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "ai_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_workflows: {
        Row: {
          configuration: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          module_id: string
          name: string
          platform: Database["public"]["Enums"]["platform_type"]
          updated_at: string | null
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          configuration?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          module_id: string
          name: string
          platform: Database["public"]["Enums"]["platform_type"]
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          module_id?: string
          name?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_workflows_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "ai_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      apo_analysis_cache: {
        Row: {
          analysis_data: Json
          created_at: string
          id: string
          occupation_code: string
          occupation_title: string
          updated_at: string
        }
        Insert: {
          analysis_data: Json
          created_at?: string
          id?: string
          occupation_code: string
          occupation_title: string
          updated_at?: string
        }
        Update: {
          analysis_data?: Json
          created_at?: string
          id?: string
          occupation_code?: string
          occupation_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          audit_id: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          status: Database["public"]["Enums"]["alert_status"]
          title: string
          user_id: string
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          audit_id?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["alert_status"]
          title: string
          user_id: string
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          audit_id?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["alert_status"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_alerts_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_comparisons: {
        Row: {
          baseline_audit_id: string
          comparison_audit_id: string
          comparison_data: Json | null
          created_at: string
          id: string
          issues_added: number | null
          issues_resolved: number | null
          revenue_impact_change: number | null
          score_change: number | null
          url: string
          user_id: string
        }
        Insert: {
          baseline_audit_id: string
          comparison_audit_id: string
          comparison_data?: Json | null
          created_at?: string
          id?: string
          issues_added?: number | null
          issues_resolved?: number | null
          revenue_impact_change?: number | null
          score_change?: number | null
          url: string
          user_id: string
        }
        Update: {
          baseline_audit_id?: string
          comparison_audit_id?: string
          comparison_data?: Json | null
          created_at?: string
          id?: string
          issues_added?: number | null
          issues_resolved?: number | null
          revenue_impact_change?: number | null
          score_change?: number | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_comparisons_baseline_audit_id_fkey"
            columns: ["baseline_audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_comparisons_comparison_audit_id_fkey"
            columns: ["comparison_audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_issues: {
        Row: {
          audit_id: string
          category: Database["public"]["Enums"]["issue_category"]
          created_at: string
          description: string
          fix_code: string | null
          fix_description: string | null
          id: string
          impact: Database["public"]["Enums"]["issue_impact"]
          priority_score: number | null
          revenue_potential: number | null
          title: string
        }
        Insert: {
          audit_id: string
          category: Database["public"]["Enums"]["issue_category"]
          created_at?: string
          description: string
          fix_code?: string | null
          fix_description?: string | null
          id?: string
          impact: Database["public"]["Enums"]["issue_impact"]
          priority_score?: number | null
          revenue_potential?: number | null
          title: string
        }
        Update: {
          audit_id?: string
          category?: Database["public"]["Enums"]["issue_category"]
          created_at?: string
          description?: string
          fix_code?: string | null
          fix_description?: string | null
          id?: string
          impact?: Database["public"]["Enums"]["issue_impact"]
          priority_score?: number | null
          revenue_potential?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_issues_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_reports: {
        Row: {
          audit_id: string
          file_path: string | null
          file_size: number | null
          generated_at: string
          id: string
          is_public: boolean | null
          report_type: string | null
          share_token: string | null
          user_id: string
        }
        Insert: {
          audit_id: string
          file_path?: string | null
          file_size?: number | null
          generated_at?: string
          id?: string
          is_public?: boolean | null
          report_type?: string | null
          share_token?: string | null
          user_id: string
        }
        Update: {
          audit_id?: string
          file_path?: string | null
          file_size?: number | null
          generated_at?: string
          id?: string
          is_public?: boolean | null
          report_type?: string | null
          share_token?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_reports_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audits: {
        Row: {
          completed_at: string | null
          created_at: string
          grade: string | null
          id: string
          overall_score: number | null
          scan_metadata: Json | null
          status: Database["public"]["Enums"]["audit_status"]
          total_revenue_potential: number | null
          updated_at: string
          url: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          grade?: string | null
          id?: string
          overall_score?: number | null
          scan_metadata?: Json | null
          status?: Database["public"]["Enums"]["audit_status"]
          total_revenue_potential?: number | null
          updated_at?: string
          url: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          grade?: string | null
          id?: string
          overall_score?: number | null
          scan_metadata?: Json | null
          status?: Database["public"]["Enums"]["audit_status"]
          total_revenue_potential?: number | null
          updated_at?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      business_photos: {
        Row: {
          alt_text: string | null
          business_id: string
          display_order: number | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          uploaded_at: string
        }
        Insert: {
          alt_text?: string | null
          business_id: string
          display_order?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          uploaded_at?: string
        }
        Update: {
          alt_text?: string | null
          business_id?: string
          display_order?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_photos_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string
          business_name: string
          business_type: string
          created_at: string
          description: string
          email: string
          id: string
          phone: string
          services: string | null
          social_media: string | null
          target_keywords: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address: string
          business_name: string
          business_type: string
          created_at?: string
          description: string
          email: string
          id?: string
          phone: string
          services?: string | null
          social_media?: string | null
          target_keywords?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string
          business_name?: string
          business_type?: string
          created_at?: string
          description?: string
          email?: string
          id?: string
          phone?: string
          services?: string | null
          social_media?: string | null
          target_keywords?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          branding_color: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          owner_id: string
          price_cents: number
          title: string
          updated_at: string
        }
        Insert: {
          branding_color?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          owner_id: string
          price_cents: number
          title: string
          updated_at?: string
        }
        Update: {
          branding_color?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          owner_id?: string
          price_cents?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          chunk_index: number
          chunk_text: string
          created_at: string
          document_id: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          project_id: string
          updated_at: string
        }
        Insert: {
          chunk_index: number
          chunk_text: string
          created_at?: string
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          project_id: string
          updated_at?: string
        }
        Update: {
          chunk_index?: number
          chunk_text?: string
          created_at?: string
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ai_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_collections: {
        Row: {
          created_at: string
          document_count: number | null
          id: string
          last_ingested_at: string | null
          name: string
          namespace: string
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_count?: number | null
          id?: string
          last_ingested_at?: string | null
          name: string
          namespace: string
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_count?: number | null
          id?: string
          last_ingested_at?: string | null
          name?: string
          namespace?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_collections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ai_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          chunk_count: number
          file_name: string
          file_size: number
          file_type: string
          id: string
          processing_status: string
          project_id: string
          storage_path: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          chunk_count?: number
          file_name: string
          file_size: number
          file_type: string
          id?: string
          processing_status?: string
          project_id: string
          storage_path: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          chunk_count?: number
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          processing_status?: string
          project_id?: string
          storage_path?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_websites: {
        Row: {
          about_section: Json
          business_id: string
          contact_section: Json
          generated_at: string
          hero_section: Json
          id: string
          meta_description: string | null
          schema_markup: Json | null
          seo_keywords: string[] | null
          services_section: Json
          status: string | null
          title: string
        }
        Insert: {
          about_section: Json
          business_id: string
          contact_section: Json
          generated_at?: string
          hero_section: Json
          id?: string
          meta_description?: string | null
          schema_markup?: Json | null
          seo_keywords?: string[] | null
          services_section: Json
          status?: string | null
          title: string
        }
        Update: {
          about_section?: Json
          business_id?: string
          contact_section?: Json
          generated_at?: string
          hero_section?: Json
          id?: string
          meta_description?: string | null
          schema_markup?: Json | null
          seo_keywords?: string[] | null
          services_section?: Json
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_websites_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      job_matches: {
        Row: {
          ai_reasoning: string | null
          created_at: string
          id: string
          job_opportunity_id: string
          job_seeker_id: string
          match_score: number
          match_status: string | null
          matching_skills: string[] | null
          skill_gaps: string[] | null
          updated_at: string
        }
        Insert: {
          ai_reasoning?: string | null
          created_at?: string
          id?: string
          job_opportunity_id: string
          job_seeker_id: string
          match_score: number
          match_status?: string | null
          matching_skills?: string[] | null
          skill_gaps?: string[] | null
          updated_at?: string
        }
        Update: {
          ai_reasoning?: string | null
          created_at?: string
          id?: string
          job_opportunity_id?: string
          job_seeker_id?: string
          match_score?: number
          match_status?: string | null
          matching_skills?: string[] | null
          skill_gaps?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_matches_job_opportunity_id_fkey"
            columns: ["job_opportunity_id"]
            isOneToOne: false
            referencedRelation: "job_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_matches_job_seeker_id_fkey"
            columns: ["job_seeker_id"]
            isOneToOne: false
            referencedRelation: "job_seekers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_opportunities: {
        Row: {
          company_name: string | null
          created_at: string
          description: string
          experience_level: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          job_type: string | null
          location: string | null
          posted_at: string
          preferred_skills: string[] | null
          remote_friendly: boolean | null
          required_skills: string[] | null
          salary_range: string | null
          title: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          description: string
          experience_level?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string | null
          location?: string | null
          posted_at?: string
          preferred_skills?: string[] | null
          remote_friendly?: boolean | null
          required_skills?: string[] | null
          salary_range?: string | null
          title: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          description?: string
          experience_level?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string | null
          location?: string | null
          posted_at?: string
          preferred_skills?: string[] | null
          remote_friendly?: boolean | null
          required_skills?: string[] | null
          salary_range?: string | null
          title?: string
        }
        Relationships: []
      }
      job_seekers: {
        Row: {
          created_at: string
          current_job_title: string | null
          desired_roles: string[] | null
          education_level: string | null
          experience_years: number | null
          id: string
          location: string | null
          resume_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_job_title?: string | null
          desired_roles?: string[] | null
          education_level?: string | null
          experience_years?: number | null
          id?: string
          location?: string | null
          resume_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_job_title?: string | null
          desired_roles?: string[] | null
          education_level?: string | null
          experience_years?: number | null
          id?: string
          location?: string | null
          resume_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_modules: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          id: string
          order_index: number
          status: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          id?: string
          order_index?: number
          status?: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          id?: string
          order_index?: number
          status?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          course_id: string | null
          id: string
          is_completed: boolean
          lesson_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          id?: string
          is_completed?: boolean
          lesson_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          id?: string
          is_completed?: boolean
          lesson_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_providers: {
        Row: {
          config: Json | null
          cost_per_token: number | null
          created_at: string
          enabled: boolean | null
          endpoint_url: string | null
          id: string
          name: string
          provider_type: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          cost_per_token?: number | null
          created_at?: string
          enabled?: boolean | null
          endpoint_url?: string | null
          id?: string
          name: string
          provider_type: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          cost_per_token?: number | null
          created_at?: string
          enabled?: boolean | null
          endpoint_url?: string | null
          id?: string
          name?: string
          provider_type?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number | null
          course_id: string | null
          created_at: string
          currency: string | null
          id: string
          status: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          course_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          course_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          api_credits: number | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          api_credits?: number | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          api_credits?: number | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          course_id: string
          created_at: string
          id: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          quiz_id: string | null
          responses: Json | null
          score: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          quiz_id?: string | null
          responses?: Json | null
          score?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          quiz_id?: string | null
          responses?: Json | null
          score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_modules: {
        Row: {
          ai_model: string | null
          created_at: string
          id: string
          lesson_id: string
          questions: Json | null
          status: string
        }
        Insert: {
          ai_model?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          questions?: Json | null
          status?: string
        }
        Update: {
          ai_model?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          questions?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_modules_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          id: string
          lesson_id: string | null
          questions: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          questions?: Json | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          questions?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_queries: {
        Row: {
          created_at: string
          id: string
          llm_provider: string | null
          project_id: string
          query_text: string
          response_text: string | null
          response_time_ms: number | null
          retrieved_chunks: Json | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          llm_provider?: string | null
          project_id: string
          query_text: string
          response_text?: string | null
          response_time_ms?: number | null
          retrieved_chunks?: Json | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          llm_provider?: string | null
          project_id?: string
          query_text?: string
          response_text?: string | null
          response_time_ms?: number | null
          retrieved_chunks?: Json | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rag_queries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ai_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      reskilling_paths: {
        Row: {
          completion_percentage: number | null
          created_at: string
          estimated_duration_weeks: number | null
          id: string
          job_seeker_id: string
          path_status: string | null
          recommended_courses: Json | null
          skill_gaps: Json | null
          target_job_role: string
          updated_at: string
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string
          estimated_duration_weeks?: number | null
          id?: string
          job_seeker_id: string
          path_status?: string | null
          recommended_courses?: Json | null
          skill_gaps?: Json | null
          target_job_role: string
          updated_at?: string
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string
          estimated_duration_weeks?: number | null
          id?: string
          job_seeker_id?: string
          path_status?: string | null
          recommended_courses?: Json | null
          skill_gaps?: Json | null
          target_job_role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reskilling_paths_job_seeker_id_fkey"
            columns: ["job_seeker_id"]
            isOneToOne: false
            referencedRelation: "job_seekers"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_analyses: {
        Row: {
          analysis_data: Json
          created_at: string
          id: string
          notes: string | null
          occupation_code: string
          occupation_title: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_data: Json
          created_at?: string
          id?: string
          notes?: string | null
          occupation_code: string
          occupation_title: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_data?: Json
          created_at?: string
          id?: string
          notes?: string | null
          occupation_code?: string
          occupation_title?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_audits: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          frequency: Database["public"]["Enums"]["audit_frequency"]
          id: string
          is_active: boolean
          last_run_at: string | null
          next_run_at: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          frequency: Database["public"]["Enums"]["audit_frequency"]
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          frequency?: Database["public"]["Enums"]["audit_frequency"]
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          id: string
          results_count: number | null
          search_term: string
          searched_at: string
          user_id: string
        }
        Insert: {
          id?: string
          results_count?: number | null
          search_term: string
          searched_at?: string
          user_id: string
        }
        Update: {
          id?: string
          results_count?: number | null
          search_term?: string
          searched_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_assessments: {
        Row: {
          assessment_method: string | null
          confidence_score: number | null
          created_at: string
          id: string
          identified_skills: Json | null
          job_seeker_id: string
          skill_levels: Json | null
          updated_at: string
        }
        Insert: {
          assessment_method?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          identified_skills?: Json | null
          job_seeker_id: string
          skill_levels?: Json | null
          updated_at?: string
        }
        Update: {
          assessment_method?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          identified_skills?: Json | null
          job_seeker_id?: string
          skill_levels?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_assessments_job_seeker_id_fkey"
            columns: ["job_seeker_id"]
            isOneToOne: false
            referencedRelation: "job_seekers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          id: string
          is_completed: boolean
          lesson_id: string
          quiz_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          id?: string
          is_completed?: boolean
          lesson_id: string
          quiz_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          id?: string
          is_completed?: boolean
          lesson_id?: string
          quiz_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lesson_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          available_credits: number | null
          created_at: string | null
          id: string
          last_billing_date: string | null
          subscription_tier: string | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_credits?: number | null
          created_at?: string | null
          id?: string
          last_billing_date?: string | null
          subscription_tier?: string | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_credits?: number | null
          created_at?: string | null
          id?: string
          last_billing_date?: string | null
          subscription_tier?: string | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_platform_credentials: {
        Row: {
          created_at: string | null
          encrypted_credentials: Json
          id: string
          platform: Database["public"]["Enums"]["platform_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          encrypted_credentials: Json
          id?: string
          platform: Database["public"]["Enums"]["platform_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          encrypted_credentials?: Json
          id?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_selections: {
        Row: {
          created_at: string
          id: string
          name: string
          selections: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          selections?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          selections?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vertical_bot_conversations: {
        Row: {
          bot_id: string
          escalation_details: string | null
          id: string
          is_escalated: boolean | null
          last_message_at: string | null
          resolved: boolean | null
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          bot_id: string
          escalation_details?: string | null
          id?: string
          is_escalated?: boolean | null
          last_message_at?: string | null
          resolved?: boolean | null
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          bot_id?: string
          escalation_details?: string | null
          id?: string
          is_escalated?: boolean | null
          last_message_at?: string | null
          resolved?: boolean | null
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vertical_bot_conversations_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "vertical_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      vertical_bot_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_important: boolean | null
          sender: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_important?: boolean | null
          sender: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_important?: boolean | null
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: "vertical_bot_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "vertical_bot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      vertical_bot_training_data: {
        Row: {
          bot_id: string
          data: Json
          id: string
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          bot_id: string
          data: Json
          id?: string
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          bot_id?: string
          data?: Json
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "vertical_bot_training_data_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "vertical_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      vertical_bots: {
        Row: {
          compliance_flags: Json | null
          created_at: string | null
          description: string | null
          id: string
          industry: Database["public"]["Enums"]["industry_vertical"]
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          compliance_flags?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_vertical"]
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          compliance_flags?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_vertical"]
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workflow_templates: {
        Row: {
          created_at: string
          description: string | null
          domain: string
          id: string
          n8n_workflow: Json
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain: string
          id?: string
          n8n_workflow: Json
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string
          id?: string
          n8n_workflow?: Json
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      calculate_next_run: {
        Args: {
          frequency: Database["public"]["Enums"]["audit_frequency"]
          from_time?: string
        }
        Returns: string
      }
      generate_share_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      alert_status: "unread" | "read" | "dismissed"
      alert_type:
        | "score_change"
        | "new_issue"
        | "resolved_issue"
        | "scheduled_audit"
      audit_frequency: "daily" | "weekly" | "monthly"
      audit_status: "pending" | "scanning" | "completed" | "failed"
      industry_vertical: "legal" | "healthcare" | "saas" | "other"
      issue_category:
        | "performance"
        | "seo"
        | "accessibility"
        | "security"
        | "mobile"
        | "ux"
      issue_impact: "low" | "medium" | "high" | "critical"
      module_category:
        | "communication"
        | "document_processing"
        | "ecommerce"
        | "analytics"
        | "security"
        | "data_processing"
      module_status: "active" | "deprecated" | "beta"
      platform_type:
        | "bubble"
        | "webflow"
        | "zapier"
        | "airtable"
        | "shopify"
        | "stripe"
      usage_status: "success" | "error" | "pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_status: ["unread", "read", "dismissed"],
      alert_type: [
        "score_change",
        "new_issue",
        "resolved_issue",
        "scheduled_audit",
      ],
      audit_frequency: ["daily", "weekly", "monthly"],
      audit_status: ["pending", "scanning", "completed", "failed"],
      industry_vertical: ["legal", "healthcare", "saas", "other"],
      issue_category: [
        "performance",
        "seo",
        "accessibility",
        "security",
        "mobile",
        "ux",
      ],
      issue_impact: ["low", "medium", "high", "critical"],
      module_category: [
        "communication",
        "document_processing",
        "ecommerce",
        "analytics",
        "security",
        "data_processing",
      ],
      module_status: ["active", "deprecated", "beta"],
      platform_type: [
        "bubble",
        "webflow",
        "zapier",
        "airtable",
        "shopify",
        "stripe",
      ],
      usage_status: ["success", "error", "pending"],
    },
  },
} as const
