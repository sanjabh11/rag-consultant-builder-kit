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
      agents: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          project_id: string
          role: string
          system_prompt: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          project_id: string
          role: string
          system_prompt: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          project_id?: string
          role?: string
          system_prompt?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      agreements: {
        Row: {
          agreement_text: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          agreement_text: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          agreement_text?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      agricultural_profiles: {
        Row: {
          created_at: string | null
          farming_experience: number | null
          farming_method: string | null
          id: string
          irrigation_access: boolean | null
          land_ownership: string | null
          land_size: number | null
          last_season_yield: Json | null
          primary_crops: string[]
          soil_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          farming_experience?: number | null
          farming_method?: string | null
          id?: string
          irrigation_access?: boolean | null
          land_ownership?: string | null
          land_size?: number | null
          last_season_yield?: Json | null
          primary_crops?: string[]
          soil_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          farming_experience?: number | null
          farming_method?: string | null
          id?: string
          irrigation_access?: boolean | null
          land_ownership?: string | null
          land_size?: number | null
          last_season_yield?: Json | null
          primary_crops?: string[]
          soil_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agricultural_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "unified_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_analysis: {
        Row: {
          analysis_data: Json
          analysis_type: string
          confidence_score: number | null
          created_at: string
          id: string
          image_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          analysis_data?: Json
          analysis_type?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          image_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          analysis_data?: Json
          analysis_type?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          image_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "medical_images"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_employee_tasks: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          input_prompt: string
          llm_response: string
          task_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          input_prompt: string
          llm_response: string
          task_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          input_prompt?: string
          llm_response?: string
          task_type?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_employees: {
        Row: {
          avatar: string
          cost: number
          created_at: string
          id: string
          name: string
          status: string
          success_rate: number
          tasks_completed: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar: string
          cost?: number
          created_at?: string
          id?: string
          name: string
          status?: string
          success_rate?: number
          tasks_completed?: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string
          cost?: number
          created_at?: string
          id?: string
          name?: string
          status?: string
          success_rate?: number
          tasks_completed?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      ai_reskilling_resources: {
        Row: {
          cost_type: string | null
          created_at: string
          description: string | null
          id: string
          provider: string
          skill_area: string
          title: string
          url: string
        }
        Insert: {
          cost_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          provider: string
          skill_area: string
          title: string
          url: string
        }
        Update: {
          cost_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          provider?: string
          skill_area?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
      ai_skill_recommendations: {
        Row: {
          created_at: string
          explanation: string
          id: string
          occupation_code: string
          priority: number
          skill_name: string
        }
        Insert: {
          created_at?: string
          explanation: string
          id?: string
          occupation_code: string
          priority?: number
          skill_name: string
        }
        Update: {
          created_at?: string
          explanation?: string
          id?: string
          occupation_code?: string
          priority?: number
          skill_name?: string
        }
        Relationships: []
      }
      ai_task_assessments: {
        Row: {
          category: string
          confidence: number | null
          created_at: string
          explanation: string | null
          id: string
          occupation_code: string
          occupation_title: string
          task_description: string
          user_id: string | null
        }
        Insert: {
          category: string
          confidence?: number | null
          created_at?: string
          explanation?: string | null
          id?: string
          occupation_code: string
          occupation_title: string
          task_description: string
          user_id?: string | null
        }
        Update: {
          category?: string
          confidence?: number | null
          created_at?: string
          explanation?: string | null
          id?: string
          occupation_code?: string
          occupation_title?: string
          task_description?: string
          user_id?: string | null
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
      alert_configurations: {
        Row: {
          alert_type: string
          criteria: Json
          id: string
          is_active: boolean | null
          notification_settings: Json
          user_id: string | null
        }
        Insert: {
          alert_type: string
          criteria: Json
          id?: string
          is_active?: boolean | null
          notification_settings: Json
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          criteria?: Json
          id?: string
          is_active?: boolean | null
          notification_settings?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      alert_thresholds: {
        Row: {
          condition: string | null
          created_at: string | null
          emotion: string
          enabled: boolean | null
          id: string
          threshold: number | null
          user_id: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          emotion: string
          enabled?: boolean | null
          id?: string
          threshold?: number | null
          user_id?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          emotion?: string
          enabled?: boolean | null
          id?: string
          threshold?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_thresholds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_triggered: string | null
          name: string
          notification_channels: string[]
          thresholds: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          name: string
          notification_channels?: string[]
          thresholds?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          name?: string
          notification_channels?: string[]
          thresholds?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      analysis_results: {
        Row: {
          created_at: string | null
          id: string
          results: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          results: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          results?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_category: string
          event_data: Json | null
          event_name: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_category: string
          event_data?: Json | null
          event_name: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_category?: string
          event_data?: Json | null
          event_name?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      audio_files: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          file_size: number
          filename: string
          id: string
          language: string | null
          location: string | null
          mime_type: string
          original_filename: string
          recording_date: string | null
          speaker_name: string | null
          storage_path: string | null
          updated_at: string
          upload_status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size: number
          filename: string
          id?: string
          language?: string | null
          location?: string | null
          mime_type: string
          original_filename: string
          recording_date?: string | null
          speaker_name?: string | null
          storage_path?: string | null
          updated_at?: string
          upload_status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size?: number
          filename?: string
          id?: string
          language?: string | null
          location?: string | null
          mime_type?: string
          original_filename?: string
          recording_date?: string | null
          speaker_name?: string | null
          storage_path?: string | null
          updated_at?: string
          upload_status?: string | null
          user_id?: string
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
      audit_logs: {
        Row: {
          category: string | null
          created_at: string | null
          event_details: Json | null
          event_type: string | null
          id: string
          ip_address: unknown | null
          session_id: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          event_details?: Json | null
          event_type?: string | null
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          event_details?: Json | null
          event_type?: string | null
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      backtest_strategies: {
        Row: {
          created_at: string | null
          date_range_end: string
          date_range_start: string
          id: string
          results: Json | null
          status: string | null
          strategy_name: string
          symbols: string[]
          user_id: string | null
          wave_rules: Json
        }
        Insert: {
          created_at?: string | null
          date_range_end: string
          date_range_start: string
          id?: string
          results?: Json | null
          status?: string | null
          strategy_name: string
          symbols: string[]
          user_id?: string | null
          wave_rules: Json
        }
        Update: {
          created_at?: string | null
          date_range_end?: string
          date_range_start?: string
          id?: string
          results?: Json | null
          status?: string | null
          strategy_name?: string
          symbols?: string[]
          user_id?: string | null
          wave_rules?: Json
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
      business_profiles: {
        Row: {
          business_name: string
          business_type: string
          categories: string[]
          created_at: string | null
          description: string | null
          employee_count: number | null
          growth_stage: string | null
          id: string
          monthly_revenue: number | null
          start_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          business_name: string
          business_type: string
          categories?: string[]
          created_at?: string | null
          description?: string | null
          employee_count?: number | null
          growth_stage?: string | null
          id?: string
          monthly_revenue?: number | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          business_name?: string
          business_type?: string
          categories?: string[]
          created_at?: string | null
          description?: string | null
          employee_count?: number | null
          growth_stage?: string | null
          id?: string
          monthly_revenue?: number | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "unified_users"
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
      cache_entries: {
        Row: {
          created_at: string | null
          data: Json
          expires_at: string
          key: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          expires_at: string
          key: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          expires_at?: string
          key?: string
        }
        Relationships: []
      }
      care_profiles: {
        Row: {
          birth_date: string | null
          created_at: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          id: string
          medical_conditions: string[] | null
          medications: string[] | null
          preferences: Json | null
          preferred_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          id?: string
          medical_conditions?: string[] | null
          medications?: string[] | null
          preferences?: Json | null
          preferred_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          id?: string
          medical_conditions?: string[] | null
          medications?: string[] | null
          preferences?: Json | null
          preferred_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      career_assessments: {
        Row: {
          assessment_data: Json | null
          assessment_type: string
          created_at: string
          current_role: string
          experience_match_score: number
          id: string
          overall_fit_score: number
          recommendations: Json | null
          skill_gaps: Json | null
          skills_match_score: number
          target_role: string
          user_id: string
        }
        Insert: {
          assessment_data?: Json | null
          assessment_type?: string
          created_at?: string
          current_role: string
          experience_match_score: number
          id?: string
          overall_fit_score: number
          recommendations?: Json | null
          skill_gaps?: Json | null
          skills_match_score: number
          target_role: string
          user_id: string
        }
        Update: {
          assessment_data?: Json | null
          assessment_type?: string
          created_at?: string
          current_role?: string
          experience_match_score?: number
          id?: string
          overall_fit_score?: number
          recommendations?: Json | null
          skill_gaps?: Json | null
          skills_match_score?: number
          target_role?: string
          user_id?: string
        }
        Relationships: []
      }
      career_learning_modules: {
        Row: {
          content_data: Json
          created_at: string
          description: string | null
          difficulty_level: number | null
          estimated_minutes: number | null
          id: string
          is_active: boolean | null
          learning_objectives: string[] | null
          module_type: string
          prerequisites: string[] | null
          target_roles: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content_data?: Json
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          estimated_minutes?: number | null
          id?: string
          is_active?: boolean | null
          learning_objectives?: string[] | null
          module_type?: string
          prerequisites?: string[] | null
          target_roles?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content_data?: Json
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          estimated_minutes?: number | null
          id?: string
          is_active?: boolean | null
          learning_objectives?: string[] | null
          module_type?: string
          prerequisites?: string[] | null
          target_roles?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      career_recommendations: {
        Row: {
          action_items: Json | null
          created_at: string
          description: string
          expires_at: string | null
          id: string
          metadata: Json | null
          priority_score: number | null
          recommendation_type: string
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_items?: Json | null
          created_at?: string
          description: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          priority_score?: number | null
          recommendation_type: string
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_items?: Json | null
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          priority_score?: number | null
          recommendation_type?: string
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      career_transitions: {
        Row: {
          confidence_score: number | null
          created_at: string
          current_industry: string | null
          current_role: string
          estimated_timeline_months: number | null
          id: string
          target_industry: string | null
          target_role: string
          transition_stage: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          current_industry?: string | null
          current_role: string
          estimated_timeline_months?: number | null
          id?: string
          target_industry?: string | null
          target_role: string
          transition_stage?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          current_industry?: string | null
          current_role?: string
          estimated_timeline_months?: number | null
          id?: string
          target_industry?: string | null
          target_role?: string
          transition_stage?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cascade_predictions: {
        Row: {
          created_at: string
          id: string
          parameters: Json
          results: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          parameters?: Json
          results?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          parameters?: Json
          results?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      certifications: {
        Row: {
          badge_url: string | null
          certification_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          issuing_organization: string
          name: string
          requirements: Json | null
          skill_ids: string[] | null
          updated_at: string | null
          validity_period_months: number | null
        }
        Insert: {
          badge_url?: string | null
          certification_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          issuing_organization: string
          name: string
          requirements?: Json | null
          skill_ids?: string[] | null
          updated_at?: string | null
          validity_period_months?: number | null
        }
        Update: {
          badge_url?: string | null
          certification_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          issuing_organization?: string
          name?: string
          requirements?: Json | null
          skill_ids?: string[] | null
          updated_at?: string | null
          validity_period_months?: number | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          area_size: string | null
          climate_zone: string | null
          created_at: string | null
          id: string
          location: Json
          name: string
          planning_score: number | null
          population_target: number
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          area_size?: string | null
          climate_zone?: string | null
          created_at?: string | null
          id?: string
          location: Json
          name: string
          planning_score?: number | null
          population_target: number
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          area_size?: string | null
          climate_zone?: string | null
          created_at?: string | null
          id?: string
          location?: Json
          name?: string
          planning_score?: number | null
          population_target?: number
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_wave_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_events: {
        Row: {
          accessibility_features: string[] | null
          comfort_level: string
          created_at: string
          current_participants: number | null
          description: string | null
          event_datetime: string
          event_status: string
          event_type: string
          id: string
          location_data: Json
          max_participants: number | null
          organizer_id: string
          safety_guidelines: string | null
          target_demographics: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          accessibility_features?: string[] | null
          comfort_level?: string
          created_at?: string
          current_participants?: number | null
          description?: string | null
          event_datetime: string
          event_status?: string
          event_type: string
          id?: string
          location_data: Json
          max_participants?: number | null
          organizer_id: string
          safety_guidelines?: string | null
          target_demographics?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          accessibility_features?: string[] | null
          comfort_level?: string
          created_at?: string
          current_participants?: number | null
          description?: string | null
          event_datetime?: string
          event_status?: string
          event_type?: string
          id?: string
          location_data?: Json
          max_participants?: number | null
          organizer_id?: string
          safety_guidelines?: string | null
          target_demographics?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_likes: {
        Row: {
          created_at: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_wave_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_wave_posts: {
        Row: {
          chart_image_url: string | null
          comments_count: number | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          likes_count: number | null
          symbol: string
          timeframe: string
          title: string
          user_id: string | null
          wave_analysis: Json
        }
        Insert: {
          chart_image_url?: string | null
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          symbol: string
          timeframe: string
          title: string
          user_id?: string | null
          wave_analysis: Json
        }
        Update: {
          chart_image_url?: string | null
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          symbol?: string
          timeframe?: string
          title?: string
          user_id?: string | null
          wave_analysis?: Json
        }
        Relationships: []
      }
      connection_interactions: {
        Row: {
          connection_match_id: string
          created_at: string
          id: string
          interaction_data: Json | null
          interaction_type: string
          notes: string | null
          satisfaction_rating: number | null
        }
        Insert: {
          connection_match_id: string
          created_at?: string
          id?: string
          interaction_data?: Json | null
          interaction_type: string
          notes?: string | null
          satisfaction_rating?: number | null
        }
        Update: {
          connection_match_id?: string
          created_at?: string
          id?: string
          interaction_data?: Json | null
          interaction_type?: string
          notes?: string | null
          satisfaction_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "connection_interactions_connection_match_id_fkey"
            columns: ["connection_match_id"]
            isOneToOne: false
            referencedRelation: "connection_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_matches: {
        Row: {
          compatibility_score: number
          conversation_starters: Json | null
          created_at: string
          id: string
          match_reasoning: Json | null
          match_type: string
          matched_user_id: string
          safety_notes: string | null
          status: string
          suggested_activities: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          compatibility_score: number
          conversation_starters?: Json | null
          created_at?: string
          id?: string
          match_reasoning?: Json | null
          match_type?: string
          matched_user_id: string
          safety_notes?: string | null
          status?: string
          suggested_activities?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          compatibility_score?: number
          conversation_starters?: Json | null
          created_at?: string
          id?: string
          match_reasoning?: Json | null
          match_type?: string
          matched_user_id?: string
          safety_notes?: string | null
          status?: string
          suggested_activities?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          message: string
          response: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id?: string
          message: string
          response?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          message?: string
          response?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contagion_risks: {
        Row: {
          assessment_data: Json | null
          created_at: string | null
          expires_at: string | null
          id: string
          protection_strategies: string[] | null
          risk_level: string | null
          score: number | null
          sources: string[] | null
          user_id: string | null
        }
        Insert: {
          assessment_data?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          protection_strategies?: string[] | null
          risk_level?: string | null
          score?: number | null
          sources?: string[] | null
          user_id?: string | null
        }
        Update: {
          assessment_data?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          protection_strategies?: string[] | null
          risk_level?: string | null
          score?: number | null
          sources?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contagion_risks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_analytics: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          message_count: number | null
          project_id: string
          response_time_avg: number | null
          satisfaction_score: number | null
          sentiment_score: number | null
          session_id: string
          topics: Json | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          message_count?: number | null
          project_id: string
          response_time_avg?: number | null
          satisfaction_score?: number | null
          sentiment_score?: number | null
          session_id: string
          topics?: Json | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          message_count?: number | null
          project_id?: string
          response_time_avg?: number | null
          satisfaction_score?: number | null
          sentiment_score?: number | null
          session_id?: string
          topics?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_analytics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_analytics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_estimates: {
        Row: {
          created_at: string | null
          estimate: Json
          id: string
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          estimate: Json
          id?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          estimate?: Json
          id?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_estimates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_estimates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      crisis_alerts: {
        Row: {
          alert_level: string
          alert_message: string
          assessment_id: string | null
          created_at: string
          id: string
          notified_contacts: Json | null
          professional_response: string | null
          resolution_notes: string | null
          resolved_at: string | null
          response_time_minutes: number | null
          status: string
          user_id: string
        }
        Insert: {
          alert_level: string
          alert_message: string
          assessment_id?: string | null
          created_at?: string
          id?: string
          notified_contacts?: Json | null
          professional_response?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          response_time_minutes?: number | null
          status?: string
          user_id: string
        }
        Update: {
          alert_level?: string
          alert_message?: string
          assessment_id?: string | null
          created_at?: string
          id?: string
          notified_contacts?: Json | null
          professional_response?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          response_time_minutes?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crisis_alerts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "mental_health_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      crisis_events: {
        Row: {
          category: string
          confidence: number
          created_at: string | null
          description: string
          escalation_probability: number
          id: string
          region: string
          severity: string
          sources: number
          title: string
        }
        Insert: {
          category: string
          confidence: number
          created_at?: string | null
          description: string
          escalation_probability: number
          id?: string
          region: string
          severity: string
          sources: number
          title: string
        }
        Update: {
          category?: string
          confidence?: number
          created_at?: string | null
          description?: string
          escalation_probability?: number
          id?: string
          region?: string
          severity?: string
          sources?: number
          title?: string
        }
        Relationships: []
      }
      crisis_predictions: {
        Row: {
          confidence: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          indicators: string[] | null
          likelihood: string | null
          prediction_data: Json | null
          recommendations: string[] | null
          region: string
          timeframe: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          indicators?: string[] | null
          likelihood?: string | null
          prediction_data?: Json | null
          recommendations?: string[] | null
          region: string
          timeframe?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          indicators?: string[] | null
          likelihood?: string | null
          prediction_data?: Json | null
          recommendations?: string[] | null
          region?: string
          timeframe?: string | null
        }
        Relationships: []
      }
      curated_contents: {
        Row: {
          content_json: Json
          curated_at: string | null
          id: string
          source: string | null
          status: string | null
          topic: string | null
          user_id: string
        }
        Insert: {
          content_json: Json
          curated_at?: string | null
          id?: string
          source?: string | null
          status?: string | null
          topic?: string | null
          user_id: string
        }
        Update: {
          content_json?: Json
          curated_at?: string | null
          id?: string
          source?: string | null
          status?: string | null
          topic?: string | null
          user_id?: string
        }
        Relationships: []
      }
      decisions: {
        Row: {
          created_at: string | null
          criteria: Json | null
          description: string | null
          id: string
          options: Json | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          id?: string
          options?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          id?: string
          options?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string | null
          document_id: string | null
          embedding: string | null
          id: string
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
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
          created_at: string | null
          filename: string
          id: string
          owner_id: string | null
          tenant_id: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          filename: string
          id?: string
          owner_id?: string | null
          tenant_id?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          filename?: string
          id?: string
          owner_id?: string | null
          tenant_id?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      economic_models: {
        Row: {
          created_at: string | null
          id: string
          model_type: string
          parameters: Json
          results: Json | null
          scenario_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          model_type: string
          parameters: Json
          results?: Json | null
          scenario_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          model_type?: string
          parameters?: Json
          results?: Json | null
          scenario_id?: string
        }
        Relationships: []
      }
      ecosystem_insights: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          insight_data: Json
          insight_type: string
          modules_involved: string[]
          priority_level: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          insight_data: Json
          insight_type: string
          modules_involved: string[]
          priority_level?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          insight_data?: Json
          insight_type?: string
          modules_involved?: string[]
          priority_level?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ecosystem_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "unified_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystem_metrics: {
        Row: {
          agricultural_income: number | null
          business_revenue: number | null
          created_at: string | null
          financial_health_score: number | null
          id: string
          metric_date: string
          overall_ecosystem_score: number | null
          skills_progress_score: number | null
          supply_chain_efficiency_score: number | null
          user_id: string | null
        }
        Insert: {
          agricultural_income?: number | null
          business_revenue?: number | null
          created_at?: string | null
          financial_health_score?: number | null
          id?: string
          metric_date: string
          overall_ecosystem_score?: number | null
          skills_progress_score?: number | null
          supply_chain_efficiency_score?: number | null
          user_id?: string | null
        }
        Update: {
          agricultural_income?: number | null
          business_revenue?: number | null
          created_at?: string | null
          financial_health_score?: number | null
          id?: string
          metric_date?: string
          overall_ecosystem_score?: number | null
          skills_progress_score?: number | null
          supply_chain_efficiency_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ecosystem_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "unified_users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notification_preferences: {
        Row: {
          created_at: string
          id: string
          receive_collaboration_emails: boolean
          receive_community_emails: boolean
          receive_marketing_emails: boolean
          receive_system_emails: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          receive_collaboration_emails?: boolean
          receive_community_emails?: boolean
          receive_marketing_emails?: boolean
          receive_system_emails?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          receive_collaboration_emails?: boolean
          receive_community_emails?: boolean
          receive_marketing_emails?: boolean
          receive_system_emails?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          phone: string
          relationship: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          phone: string
          relationship: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string
          relationship?: string
          user_id?: string | null
        }
        Relationships: []
      }
      emotional_data: {
        Row: {
          cognitive_appraisals: string[] | null
          context: string | null
          created_at: string | null
          emotion: string
          id: string
          intensity: number | null
          llm_analysis: Json | null
          location: string | null
          physical_sensations: string[] | null
          processed_by_llm: boolean | null
          secondary_emotions: string[] | null
          user_id: string | null
        }
        Insert: {
          cognitive_appraisals?: string[] | null
          context?: string | null
          created_at?: string | null
          emotion: string
          id?: string
          intensity?: number | null
          llm_analysis?: Json | null
          location?: string | null
          physical_sensations?: string[] | null
          processed_by_llm?: boolean | null
          secondary_emotions?: string[] | null
          user_id?: string | null
        }
        Update: {
          cognitive_appraisals?: string[] | null
          context?: string | null
          created_at?: string | null
          emotion?: string
          id?: string
          intensity?: number | null
          llm_analysis?: Json | null
          location?: string | null
          physical_sensations?: string[] | null
          processed_by_llm?: boolean | null
          secondary_emotions?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emotional_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      emotional_networks: {
        Row: {
          contact_id: string | null
          created_at: string | null
          emotional_influence: string[] | null
          id: string
          impact: string | null
          last_interaction: string | null
          strength: number | null
          user_id: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          emotional_influence?: string[] | null
          id?: string
          impact?: string | null
          last_interaction?: string | null
          strength?: number | null
          user_id?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          emotional_influence?: string[] | null
          id?: string
          impact?: string | null
          last_interaction?: string | null
          strength?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emotional_networks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emotional_networks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_skill_analysis: {
        Row: {
          analysis_data: Json
          created_at: string
          id: string
          occupation_code: string
          occupation_title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          analysis_data?: Json
          created_at?: string
          id?: string
          occupation_code: string
          occupation_title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          analysis_data?: Json
          created_at?: string
          id?: string
          occupation_code?: string
          occupation_title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      entanglement_nodes: {
        Row: {
          created_at: string | null
          data: Json | null
          decision_id: string | null
          id: string
          name: string
          position: Json | null
          type: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          decision_id?: string | null
          id?: string
          name: string
          position?: Json | null
          type: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          decision_id?: string | null
          id?: string
          name?: string
          position?: Json | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "entanglement_nodes_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      environmental_assessments: {
        Row: {
          assessment_data: Json
          created_at: string | null
          id: string
          mitigation_steps: Json | null
          risk_level: string | null
          toxins: Json
          user_id: string | null
        }
        Insert: {
          assessment_data: Json
          created_at?: string | null
          id?: string
          mitigation_steps?: Json | null
          risk_level?: string | null
          toxins: Json
          user_id?: string | null
        }
        Update: {
          assessment_data?: Json
          created_at?: string | null
          id?: string
          mitigation_steps?: Json | null
          risk_level?: string | null
          toxins?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "environmental_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          created_at: string
          emergency_contact: Json | null
          event_id: string
          id: string
          registration_status: string
          special_accommodations: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          emergency_contact?: Json | null
          event_id: string
          id?: string
          registration_status?: string
          special_accommodations?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          emergency_contact?: Json | null
          event_id?: string
          id?: string
          registration_status?: string
          special_accommodations?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      family_access: {
        Row: {
          access_level: string | null
          created_at: string | null
          family_member_email: string
          id: string
          is_active: boolean | null
          senior_user_id: string | null
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          family_member_email: string
          id?: string
          is_active?: boolean | null
          senior_user_id?: string | null
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          family_member_email?: string
          id?: string
          is_active?: boolean | null
          senior_user_id?: string | null
        }
        Relationships: []
      }
      financial_profiles: {
        Row: {
          created_at: string | null
          credit_score: number | null
          financial_goals: Json | null
          id: string
          income_sources: Json | null
          insurance_coverage: Json | null
          loan_history: Json | null
          monthly_expenses: number | null
          monthly_income: number | null
          savings_balance: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credit_score?: number | null
          financial_goals?: Json | null
          id?: string
          income_sources?: Json | null
          insurance_coverage?: Json | null
          loan_history?: Json | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          savings_balance?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credit_score?: number | null
          financial_goals?: Json | null
          id?: string
          income_sources?: Json | null
          insurance_coverage?: Json | null
          loan_history?: Json | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          savings_balance?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "unified_users"
            referencedColumns: ["id"]
          },
        ]
      }
      forecasts: {
        Row: {
          confidence_interval: number[]
          created_at: string | null
          domain: string
          id: string
          models_used: string[]
          probability: number
          problem: string
          rationale: string
          scenario_analysis: Json
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          confidence_interval?: number[]
          created_at?: string | null
          domain: string
          id?: string
          models_used?: string[]
          probability: number
          problem: string
          rationale?: string
          scenario_analysis?: Json
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          confidence_interval?: number[]
          created_at?: string | null
          domain?: string
          id?: string
          models_used?: string[]
          probability?: number
          problem?: string
          rationale?: string
          scenario_analysis?: Json
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      generated_code: {
        Row: {
          code_content: Json
          created_at: string | null
          framework: string
          id: string
          language: string
          paper_id: string | null
          user_id: string | null
        }
        Insert: {
          code_content: Json
          created_at?: string | null
          framework: string
          id?: string
          language: string
          paper_id?: string | null
          user_id?: string | null
        }
        Update: {
          code_content?: Json
          created_at?: string | null
          framework?: string
          id?: string
          language?: string
          paper_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_code_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "research_papers"
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
      health_checkins: {
        Row: {
          created_at: string | null
          energy_level: number | null
          id: string
          mood_rating: number | null
          notes: string | null
          sleep_quality: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          energy_level?: number | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          sleep_quality?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          energy_level?: number | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          sleep_quality?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      historical_events: {
        Row: {
          created_at: string | null
          description: string | null
          economic_impact: number | null
          end_date: string | null
          id: string
          name: string
          region: string
          severity: number
          start_date: string
          total_cases: number | null
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          economic_impact?: number | null
          end_date?: string | null
          id?: string
          name: string
          region: string
          severity: number
          start_date: string
          total_cases?: number | null
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          economic_impact?: number | null
          end_date?: string | null
          id?: string
          name?: string
          region?: string
          severity?: number
          start_date?: string
          total_cases?: number | null
          type?: string
        }
        Relationships: []
      }
      historical_patterns: {
        Row: {
          created_at: string | null
          description: string
          examples: Json
          id: string
          pattern_type: string
          statistical_significance: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          examples: Json
          id?: string
          pattern_type: string
          statistical_significance?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          examples?: Json
          id?: string
          pattern_type?: string
          statistical_significance?: number | null
        }
        Relationships: []
      }
      indicators: {
        Row: {
          id: string
          indicators: Json
          summary: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          indicators?: Json
          summary: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          indicators?: Json
          summary?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config: Json
          created_at: string
          id: string
          integration_type: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          integration_type: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          integration_type?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      intervention_tests: {
        Row: {
          created_at: string
          id: string
          interventions: Json
          results: Json | null
          scenario_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          interventions?: Json
          results?: Json | null
          scenario_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          interventions?: Json
          results?: Json | null
          scenario_id?: string
          user_id?: string | null
        }
        Relationships: []
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
      lab_results: {
        Row: {
          created_at: string | null
          id: string
          reference_range: string | null
          status: string | null
          test_date: string | null
          test_name: string
          unit: string | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reference_range?: string | null
          status?: string | null
          test_date?: string | null
          test_name: string
          unit?: string | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reference_range?: string | null
          status?: string | null
          test_date?: string | null
          test_name?: string
          unit?: string | null
          user_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_content: {
        Row: {
          content_data: Json | null
          content_type: string
          content_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: number | null
          estimated_duration_minutes: number | null
          id: string
          is_active: boolean | null
          prerequisites: string[] | null
          skill_ids: string[] | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content_data?: Json | null
          content_type: string
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          prerequisites?: string[] | null
          skill_ids?: string[] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content_data?: Json | null
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          prerequisites?: string[] | null
          skill_ids?: string[] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      learning_content_files: {
        Row: {
          content_id: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          upload_status: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          content_id?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          upload_status?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          content_id?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          upload_status?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_content_files_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_content"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_recommendations: {
        Row: {
          expires_at: string | null
          generated_at: string | null
          id: string
          metadata: Json | null
          priority_score: number | null
          reason: string
          recommended_path_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          priority_score?: number | null
          reason: string
          recommended_path_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          priority_score?: number | null
          reason?: string
          recommended_path_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_recommendations_recommended_path_id_fkey"
            columns: ["recommended_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          content_sequence: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: number | null
          estimated_duration_hours: number | null
          id: string
          is_template: boolean | null
          learning_objectives: string[] | null
          name: string
          prerequisites: Json | null
          target_skill_ids: string[] | null
          updated_at: string | null
        }
        Insert: {
          content_sequence?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_duration_hours?: number | null
          id?: string
          is_template?: boolean | null
          learning_objectives?: string[] | null
          name: string
          prerequisites?: Json | null
          target_skill_ids?: string[] | null
          updated_at?: string | null
        }
        Update: {
          content_sequence?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_duration_hours?: number | null
          id?: string
          is_template?: boolean | null
          learning_objectives?: string[] | null
          name?: string
          prerequisites?: Json | null
          target_skill_ids?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          completion_percentage: number | null
          id: string
          last_accessed: string | null
          module_id: string
          performance_data: Json | null
          user_id: string | null
        }
        Insert: {
          completion_percentage?: number | null
          id?: string
          last_accessed?: string | null
          module_id: string
          performance_data?: Json | null
          user_id?: string | null
        }
        Update: {
          completion_percentage?: number | null
          id?: string
          last_accessed?: string | null
          module_id?: string
          performance_data?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_recommendations: {
        Row: {
          generated_at: string | null
          id: string
          reason: string | null
          recommendation_json: Json
          status: string | null
          user_id: string
        }
        Insert: {
          generated_at?: string | null
          id?: string
          reason?: string | null
          recommendation_json: Json
          status?: string | null
          user_id: string
        }
        Update: {
          generated_at?: string | null
          id?: string
          reason?: string | null
          recommendation_json?: Json
          status?: string | null
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
      linguistic_analyses: {
        Row: {
          analysis_results: Json
          analysis_type: string
          created_at: string
          cultural_notes: string | null
          gemini_model_used: string | null
          id: string
          insights: string | null
          patterns_identified: string[] | null
          preservation_recommendations: string | null
          processing_time_ms: number | null
          transcription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_results: Json
          analysis_type: string
          created_at?: string
          cultural_notes?: string | null
          gemini_model_used?: string | null
          id?: string
          insights?: string | null
          patterns_identified?: string[] | null
          preservation_recommendations?: string | null
          processing_time_ms?: number | null
          transcription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_results?: Json
          analysis_type?: string
          created_at?: string
          cultural_notes?: string | null
          gemini_model_used?: string | null
          id?: string
          insights?: string | null
          patterns_identified?: string[] | null
          preservation_recommendations?: string | null
          processing_time_ms?: number | null
          transcription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "linguistic_analyses_transcription_id_fkey"
            columns: ["transcription_id"]
            isOneToOne: false
            referencedRelation: "transcriptions"
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
      loneliness_assessments: {
        Row: {
          ai_recommendations: Json | null
          assessment_responses: Json
          community_belonging_score: number | null
          created_at: string
          follow_up_date: string | null
          id: string
          intervention_priority: string
          loneliness_score: number
          social_connection_quality: number | null
          user_id: string
        }
        Insert: {
          ai_recommendations?: Json | null
          assessment_responses: Json
          community_belonging_score?: number | null
          created_at?: string
          follow_up_date?: string | null
          id?: string
          intervention_priority?: string
          loneliness_score: number
          social_connection_quality?: number | null
          user_id: string
        }
        Update: {
          ai_recommendations?: Json | null
          assessment_responses?: Json
          community_belonging_score?: number | null
          created_at?: string
          follow_up_date?: string | null
          id?: string
          intervention_priority?: string
          loneliness_score?: number
          social_connection_quality?: number | null
          user_id?: string
        }
        Relationships: []
      }
      loneliness_profiles: {
        Row: {
          availability_schedule: Json | null
          comfort_zones: string[] | null
          communication_style: string | null
          created_at: string
          id: string
          interests: Json | null
          isolation_level: number | null
          life_situation: string[] | null
          life_stage: string | null
          location_data: Json | null
          mobility_considerations: string[] | null
          preferred_activities: Json | null
          seeking_connection_types: string[] | null
          social_anxiety_level: number | null
          updated_at: string
          user_id: string
          values_priorities: Json | null
        }
        Insert: {
          availability_schedule?: Json | null
          comfort_zones?: string[] | null
          communication_style?: string | null
          created_at?: string
          id?: string
          interests?: Json | null
          isolation_level?: number | null
          life_situation?: string[] | null
          life_stage?: string | null
          location_data?: Json | null
          mobility_considerations?: string[] | null
          preferred_activities?: Json | null
          seeking_connection_types?: string[] | null
          social_anxiety_level?: number | null
          updated_at?: string
          user_id: string
          values_priorities?: Json | null
        }
        Update: {
          availability_schedule?: Json | null
          comfort_zones?: string[] | null
          communication_style?: string | null
          created_at?: string
          id?: string
          interests?: Json | null
          isolation_level?: number | null
          life_situation?: string[] | null
          life_stage?: string | null
          location_data?: Json | null
          mobility_considerations?: string[] | null
          preferred_activities?: Json | null
          seeking_connection_types?: string[] | null
          social_anxiety_level?: number | null
          updated_at?: string
          user_id?: string
          values_priorities?: Json | null
        }
        Relationships: []
      }
      market_insights_cache: {
        Row: {
          created_at: string
          id: string
          insights_data: Json
          location: string
          occupation_title: string
          time_horizon: number
        }
        Insert: {
          created_at?: string
          id?: string
          insights_data: Json
          location?: string
          occupation_title: string
          time_horizon?: number
        }
        Update: {
          created_at?: string
          id?: string
          insights_data?: Json
          location?: string
          occupation_title?: string
          time_horizon?: number
        }
        Relationships: []
      }
      medical_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string | null
          metadata: Json | null
          role: string
          session_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          role: string
          session_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          role?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "medical_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_chat_sessions: {
        Row: {
          created_at: string
          id: string
          image_id: string | null
          session_title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_id?: string | null
          session_title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_id?: string | null
          session_title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_chat_sessions_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "medical_images"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_images: {
        Row: {
          body_part: string | null
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string | null
          id: string
          is_processed: boolean | null
          metadata: Json | null
          modality: string | null
          name: string
          updated_at: string
          upload_date: string
          user_id: string | null
        }
        Insert: {
          body_part?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type: string
          file_url?: string | null
          id?: string
          is_processed?: boolean | null
          metadata?: Json | null
          modality?: string | null
          name: string
          updated_at?: string
          upload_date?: string
          user_id?: string | null
        }
        Update: {
          body_part?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string | null
          id?: string
          is_processed?: boolean | null
          metadata?: Json | null
          modality?: string | null
          name?: string
          updated_at?: string
          upload_date?: string
          user_id?: string | null
        }
        Relationships: []
      }
      medical_user_profiles: {
        Row: {
          created_at: string
          experience_level: string | null
          id: string
          institution: string | null
          preferences: Json | null
          role: string
          specialization: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          experience_level?: string | null
          id?: string
          institution?: string | null
          preferences?: Json | null
          role?: string
          specialization?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          experience_level?: string | null
          id?: string
          institution?: string | null
          preferences?: Json | null
          role?: string
          specialization?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      medication_logs: {
        Row: {
          created_at: string
          id: string
          medication_id: string
          notes: string | null
          status: string
          taken_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          medication_id: string
          notes?: string | null
          status: string
          taken_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          medication_id?: string
          notes?: string | null
          status?: string
          taken_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          frequency: string
          id: string
          instructions: string | null
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage: string
          frequency: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string
          frequency?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mental_health_assessments: {
        Row: {
          analysis_metadata: Json | null
          assessment_type: string
          confidence_score: number
          created_at: string
          id: string
          indicators_detected: Json | null
          input_text: string | null
          intervention_timeline: string | null
          recommended_actions: Json | null
          resources_provided: Json | null
          risk_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_metadata?: Json | null
          assessment_type?: string
          confidence_score: number
          created_at?: string
          id?: string
          indicators_detected?: Json | null
          input_text?: string | null
          intervention_timeline?: string | null
          recommended_actions?: Json | null
          resources_provided?: Json | null
          risk_level: number
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_metadata?: Json | null
          assessment_type?: string
          confidence_score?: number
          created_at?: string
          id?: string
          indicators_detected?: Json | null
          input_text?: string | null
          intervention_timeline?: string | null
          recommended_actions?: Json | null
          resources_provided?: Json | null
          risk_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mental_health_monitoring: {
        Row: {
          baseline_mood_score: number | null
          care_team_alerts: Json | null
          created_at: string
          current_trend: string | null
          emergency_contacts: Json | null
          high_risk_episodes: number | null
          id: string
          last_assessment_date: string | null
          monitoring_active: boolean | null
          total_assessments: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          baseline_mood_score?: number | null
          care_team_alerts?: Json | null
          created_at?: string
          current_trend?: string | null
          emergency_contacts?: Json | null
          high_risk_episodes?: number | null
          id?: string
          last_assessment_date?: string | null
          monitoring_active?: boolean | null
          total_assessments?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          baseline_mood_score?: number | null
          care_team_alerts?: Json | null
          created_at?: string
          current_trend?: string | null
          emergency_contacts?: Json | null
          high_risk_episodes?: number | null
          id?: string
          last_assessment_date?: string | null
          monitoring_active?: boolean | null
          total_assessments?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mental_model_collaborations: {
        Row: {
          comments: Json | null
          created_at: string | null
          id: string
          participants: Json
          problem_id: string | null
          shared_solutions: string[] | null
          status: string | null
          version_history: Json | null
        }
        Insert: {
          comments?: Json | null
          created_at?: string | null
          id?: string
          participants?: Json
          problem_id?: string | null
          shared_solutions?: string[] | null
          status?: string | null
          version_history?: Json | null
        }
        Update: {
          comments?: Json | null
          created_at?: string | null
          id?: string
          participants?: Json
          problem_id?: string | null
          shared_solutions?: string[] | null
          status?: string | null
          version_history?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mental_model_collaborations_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "mental_model_problems"
            referencedColumns: ["id"]
          },
        ]
      }
      mental_model_problems: {
        Row: {
          context: Json | null
          created_at: string | null
          domain: string
          id: string
          problem_text: string
          stakeholders: string[] | null
          structured_data: Json
          urgency: string
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          domain: string
          id?: string
          problem_text: string
          stakeholders?: string[] | null
          structured_data?: Json
          urgency: string
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          domain?: string
          id?: string
          problem_text?: string
          stakeholders?: string[] | null
          structured_data?: Json
          urgency?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mental_model_problems_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mental_model_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          is_guest: boolean | null
          max_requests: number | null
          preferences: Json | null
          problems: string[] | null
          request_count: number | null
          solutions: string[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          is_guest?: boolean | null
          max_requests?: number | null
          preferences?: Json | null
          problems?: string[] | null
          request_count?: number | null
          solutions?: string[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          is_guest?: boolean | null
          max_requests?: number | null
          preferences?: Json | null
          problems?: string[] | null
          request_count?: number | null
          solutions?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mental_model_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mental_model_solutions: {
        Row: {
          bias_analysis: Json
          complexity_level: string
          created_at: string | null
          export_formats: Json | null
          id: string
          model_id: string | null
          problem_id: string | null
          solution_variants: Json
          stakeholder_views: Json | null
          user_rating: number | null
        }
        Insert: {
          bias_analysis?: Json
          complexity_level: string
          created_at?: string | null
          export_formats?: Json | null
          id?: string
          model_id?: string | null
          problem_id?: string | null
          solution_variants?: Json
          stakeholder_views?: Json | null
          user_rating?: number | null
        }
        Update: {
          bias_analysis?: Json
          complexity_level?: string
          created_at?: string | null
          export_formats?: Json | null
          id?: string
          model_id?: string | null
          problem_id?: string | null
          solution_variants?: Json
          stakeholder_views?: Json | null
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mental_model_solutions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "mental_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mental_model_solutions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "mental_model_problems"
            referencedColumns: ["id"]
          },
        ]
      }
      mental_models: {
        Row: {
          application_scenarios: string[]
          case_study: string | null
          category: string
          complexity_score: number
          created_at: string | null
          description: string
          id: string
          limitations: string[] | null
          name: string
          performance_metrics: Json
          prompt_template: string
          updated_at: string | null
        }
        Insert: {
          application_scenarios?: string[]
          case_study?: string | null
          category: string
          complexity_score: number
          created_at?: string | null
          description: string
          id: string
          limitations?: string[] | null
          name: string
          performance_metrics?: Json
          prompt_template: string
          updated_at?: string | null
        }
        Update: {
          application_scenarios?: string[]
          case_study?: string | null
          category?: string
          complexity_score?: number
          created_at?: string | null
          description?: string
          id?: string
          limitations?: string[] | null
          name?: string
          performance_metrics?: Json
          prompt_template?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          agent_id: string
          content: string
          created_at: string
          id: string
          metadata: Json | null
          project_id: string
          role: string
        }
        Insert: {
          agent_id: string
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          project_id: string
          role: string
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          project_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      model_performance: {
        Row: {
          accuracy_score: number
          calibration_score: number
          correct_predictions: number
          created_at: string | null
          domain: string
          id: string
          model_name: string
          total_predictions: number
          updated_at: string | null
        }
        Insert: {
          accuracy_score: number
          calibration_score: number
          correct_predictions?: number
          created_at?: string | null
          domain: string
          id?: string
          model_name: string
          total_predictions?: number
          updated_at?: string | null
        }
        Update: {
          accuracy_score?: number
          calibration_score?: number
          correct_predictions?: number
          created_at?: string | null
          domain?: string
          id?: string
          model_name?: string
          total_predictions?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      model_performance_tracking: {
        Row: {
          created_at: string | null
          id: string
          model_id: string | null
          problem_domain: string
          solution_effectiveness: number | null
          time_to_solution: number | null
          user_feedback: string | null
          user_rating: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          model_id?: string | null
          problem_domain: string
          solution_effectiveness?: number | null
          time_to_solution?: number | null
          user_feedback?: string | null
          user_rating?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          model_id?: string | null
          problem_domain?: string
          solution_effectiveness?: number | null
          time_to_solution?: number | null
          user_feedback?: string | null
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "model_performance_tracking_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "mental_models"
            referencedColumns: ["id"]
          },
        ]
      }
      news_feeds: {
        Row: {
          created_at: string | null
          id: string
          published_at: string
          relevance_score: number
          sentiment: string
          source: string
          summary: string
          title: string
          topics: string[]
        }
        Insert: {
          created_at?: string | null
          id?: string
          published_at: string
          relevance_score: number
          sentiment: string
          source: string
          summary: string
          title: string
          topics?: string[]
        }
        Update: {
          created_at?: string | null
          id?: string
          published_at?: string
          relevance_score?: number
          sentiment?: string
          source?: string
          summary?: string
          title?: string
          topics?: string[]
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          alert_id: string | null
          channel: string
          error_message: string | null
          id: string
          sent_at: string
          status: string
          user_id: string | null
        }
        Insert: {
          alert_id?: string | null
          channel: string
          error_message?: string | null
          id?: string
          sent_at?: string
          status: string
          user_id?: string | null
        }
        Update: {
          alert_id?: string | null
          channel?: string
          error_message?: string | null
          id?: string
          sent_at?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          analysis_complete: boolean
          created_at: string
          email_notifications: boolean
          id: string
          push_notifications: boolean
          share_notifications: boolean
          system_updates: boolean
          updated_at: string
          user_id: string
          weekly_summary: boolean
        }
        Insert: {
          analysis_complete?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          push_notifications?: boolean
          share_notifications?: boolean
          system_updates?: boolean
          updated_at?: string
          user_id: string
          weekly_summary?: boolean
        }
        Update: {
          analysis_complete?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          push_notifications?: boolean
          share_notifications?: boolean
          system_updates?: boolean
          updated_at?: string
          user_id?: string
          weekly_summary?: boolean
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          template_body: string
          template_subject: string
          type: string
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          template_body: string
          template_subject: string
          type: string
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          template_body?: string
          template_subject?: string
          type?: string
          variables?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
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
      paper_uploads: {
        Row: {
          created_at: string
          file_size: number
          file_type: string
          filename: string
          id: string
          processing_metadata: Json | null
          storage_path: string
          updated_at: string
          upload_status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          processing_metadata?: Json | null
          storage_path: string
          updated_at?: string
          upload_status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          processing_metadata?: Json | null
          storage_path?: string
          updated_at?: string
          upload_status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      personal_reminders: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          reminder_days: number[] | null
          reminder_time: string
          reminder_type: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          reminder_days?: number[] | null
          reminder_time: string
          reminder_type?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          reminder_days?: number[] | null
          reminder_time?: string
          reminder_type?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      physiological_data: {
        Row: {
          body_temperature: number | null
          created_at: string | null
          heart_rate: number | null
          id: string
          llm_analysis: Json | null
          location: string | null
          movement_level: number | null
          processed_by_llm: boolean | null
          respiration_rate: number | null
          skin_conductance: number | null
          sleep_quality: number | null
          user_id: string | null
        }
        Insert: {
          body_temperature?: number | null
          created_at?: string | null
          heart_rate?: number | null
          id?: string
          llm_analysis?: Json | null
          location?: string | null
          movement_level?: number | null
          processed_by_llm?: boolean | null
          respiration_rate?: number | null
          skin_conductance?: number | null
          sleep_quality?: number | null
          user_id?: string | null
        }
        Update: {
          body_temperature?: number | null
          created_at?: string | null
          heart_rate?: number | null
          id?: string
          llm_analysis?: Json | null
          location?: string | null
          movement_level?: number | null
          processed_by_llm?: boolean | null
          respiration_rate?: number | null
          skin_conductance?: number | null
          sleep_quality?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      portfolio_wave_status: {
        Row: {
          current_wave_type: string | null
          id: string
          last_updated: string | null
          risk_level: string | null
          symbol: string
          trend_direction: string | null
          user_id: string | null
          wave_position: string | null
        }
        Insert: {
          current_wave_type?: string | null
          id?: string
          last_updated?: string | null
          risk_level?: string | null
          symbol: string
          trend_direction?: string | null
          user_id?: string | null
          wave_position?: string | null
        }
        Update: {
          current_wave_type?: string | null
          id?: string
          last_updated?: string | null
          risk_level?: string | null
          symbol?: string
          trend_direction?: string | null
          user_id?: string | null
          wave_position?: string | null
        }
        Relationships: []
      }
      prediction_shares: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          prediction_id: string
          share_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          prediction_id: string
          share_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          prediction_id?: string
          share_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_shares_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          automation_date: string
          confidence: string
          created_at: string
          drivers: string[]
          id: string
          industry: string
          job_title: string
          skills: string[]
          user_id: string
        }
        Insert: {
          automation_date: string
          confidence: string
          created_at?: string
          drivers: string[]
          id?: string
          industry: string
          job_title: string
          skills: string[]
          user_id: string
        }
        Update: {
          automation_date?: string
          confidence?: string
          created_at?: string
          drivers?: string[]
          id?: string
          industry?: string
          job_title?: string
          skills?: string[]
          user_id?: string
        }
        Relationships: []
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
      progress_entries: {
        Row: {
          created_at: string | null
          date: string
          energy_level: number | null
          id: string
          mood_score: number | null
          notes: string | null
          symptoms: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          energy_level?: number | null
          id?: string
          mood_score?: number | null
          notes?: string | null
          symptoms: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          energy_level?: number | null
          id?: string
          mood_score?: number | null
          notes?: string | null
          symptoms?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_sessions: {
        Row: {
          completed: boolean
          created_at: string
          hints_used: number
          id: string
          problem_text: string
          subject: string
          time_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          hints_used?: number
          id?: string
          problem_text: string
          subject: string
          time_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          hints_used?: number
          id?: string
          problem_text?: string
          subject?: string
          time_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_analytics: {
        Row: {
          active_agents: number | null
          ai_interactions: number | null
          completion_percentage: number | null
          created_at: string
          date: string
          files_uploaded: number | null
          id: string
          project_id: string
          time_spent_minutes: number | null
          total_messages: number | null
          user_id: string
        }
        Insert: {
          active_agents?: number | null
          ai_interactions?: number | null
          completion_percentage?: number | null
          created_at?: string
          date?: string
          files_uploaded?: number | null
          id?: string
          project_id: string
          time_spent_minutes?: number | null
          total_messages?: number | null
          user_id: string
        }
        Update: {
          active_agents?: number | null
          ai_interactions?: number | null
          completion_percentage?: number | null
          created_at?: string
          date?: string
          files_uploaded?: number | null
          id?: string
          project_id?: string
          time_spent_minutes?: number | null
          total_messages?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_analytics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          analysis_results: Json | null
          analysis_status: string | null
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          project_id: string
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_results?: Json | null
          analysis_status?: string | null
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          project_id: string
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_results?: Json | null
          analysis_status?: string | null
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          project_id?: string
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_public: boolean
          name: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          is_public?: boolean
          name: string
          template_data?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_public?: boolean
          name?: string
          template_data?: Json
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
          project_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          project_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          project_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompt_optimizations: {
        Row: {
          applied: boolean | null
          created_at: string | null
          id: string
          impact_score: number | null
          suggestion: string
          suggestion_type: string
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          applied?: boolean | null
          created_at?: string | null
          id?: string
          impact_score?: number | null
          suggestion: string
          suggestion_type: string
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          applied?: boolean | null
          created_at?: string | null
          id?: string
          impact_score?: number | null
          suggestion?: string
          suggestion_type?: string
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_optimizations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_templates: {
        Row: {
          category: string | null
          components: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          industry: string | null
          is_public: boolean | null
          name: string
          performance: Json | null
          rating: number | null
          tags: string[] | null
          test_cases: Json | null
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          components?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_public?: boolean | null
          name: string
          performance?: Json | null
          rating?: number | null
          tags?: string[] | null
          test_cases?: Json | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          components?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_public?: boolean | null
          name?: string
          performance?: Json | null
          rating?: number | null
          tags?: string[] | null
          test_cases?: Json | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      prompt_test_cases: {
        Row: {
          actual_output: string | null
          created_at: string | null
          expected_output: string | null
          id: string
          inputs: Json | null
          last_tested: string | null
          metrics: Json | null
          name: string
          score: number | null
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          actual_output?: string | null
          created_at?: string | null
          expected_output?: string | null
          id?: string
          inputs?: Json | null
          last_tested?: string | null
          metrics?: Json | null
          name: string
          score?: number | null
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          actual_output?: string | null
          created_at?: string | null
          expected_output?: string | null
          id?: string
          inputs?: Json | null
          last_tested?: string | null
          metrics?: Json | null
          name?: string
          score?: number | null
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_test_cases_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_test_results: {
        Row: {
          cost: number | null
          created_at: string | null
          execution_time_ms: number | null
          id: string
          metrics: Json | null
          model_used: string | null
          output: string
          template_id: string | null
          test_case_id: string | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          execution_time_ms?: number | null
          id?: string
          metrics?: Json | null
          model_used?: string | null
          output: string
          template_id?: string | null
          test_case_id?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          execution_time_ms?: number | null
          id?: string
          metrics?: Json | null
          model_used?: string | null
          output?: string
          template_id?: string | null
          test_case_id?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_test_results_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_test_results_test_case_id_fkey"
            columns: ["test_case_id"]
            isOneToOne: false
            referencedRelation: "prompt_test_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      protocol_reminders: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          frequency: string
          id: string
          protocol_id: string
          time: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          frequency: string
          id?: string
          protocol_id: string
          time: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          frequency?: string
          id?: string
          protocol_id?: string
          time?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "protocol_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      protocols: {
        Row: {
          actions: Json
          created_at: string | null
          expected_outcomes: Json | null
          id: string
          root_cause_id: string
          status: string | null
          timeline: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          actions: Json
          created_at?: string | null
          expected_outcomes?: Json | null
          id?: string
          root_cause_id: string
          status?: string | null
          timeline?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          actions?: Json
          created_at?: string | null
          expected_outcomes?: Json | null
          id?: string
          root_cause_id?: string
          status?: string | null
          timeline?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "protocols_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      push_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          subscription: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          subscription: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          subscription?: Json
          user_id?: string | null
        }
        Relationships: []
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
      renewai_ai_insights: {
        Row: {
          confidence_score: number | null
          content: string
          created_at: string | null
          id: string
          insight_type: string
          is_active: boolean | null
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          content: string
          created_at?: string | null
          id?: string
          insight_type: string
          is_active?: boolean | null
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          content?: string
          created_at?: string | null
          id?: string
          insight_type?: string
          is_active?: boolean | null
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      renewai_energy_data: {
        Row: {
          created_at: string | null
          energy_type: string
          id: string
          metadata: Json | null
          timestamp: string | null
          unit: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string | null
          energy_type: string
          id?: string
          metadata?: Json | null
          timestamp?: string | null
          unit?: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string | null
          energy_type?: string
          id?: string
          metadata?: Json | null
          timestamp?: string | null
          unit?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      renewai_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      research_papers: {
        Row: {
          analysis: Json | null
          content: string
          created_at: string | null
          file_size: number | null
          filename: string
          id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          analysis?: Json | null
          content: string
          created_at?: string | null
          file_size?: number | null
          filename: string
          id?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          analysis?: Json | null
          content?: string
          created_at?: string | null
          file_size?: number | null
          filename?: string
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      risk_assessments: {
        Row: {
          confidence_interval: Json
          created_at: string | null
          expires_at: string
          factors: Json
          id: string
          region: string
          risk_score: number
        }
        Insert: {
          confidence_interval: Json
          created_at?: string | null
          expires_at: string
          factors: Json
          id?: string
          region: string
          risk_score: number
        }
        Update: {
          confidence_interval?: Json
          created_at?: string | null
          expires_at?: string
          factors?: Json
          id?: string
          region?: string
          risk_score?: number
        }
        Relationships: []
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
      scenario_simulations: {
        Row: {
          created_at: string | null
          id: string
          results: Json | null
          scenario_config: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          results?: Json | null
          scenario_config: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          results?: Json | null
          scenario_config?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenario_simulations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scenarios: {
        Row: {
          created_at: string | null
          data: Json | null
          decision_id: string | null
          description: string | null
          id: string
          impact: number | null
          name: string
          probability: number | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          decision_id?: string | null
          description?: string | null
          id?: string
          impact?: number | null
          name: string
          probability?: number | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          decision_id?: string | null
          description?: string | null
          id?: string
          impact?: number | null
          name?: string
          probability?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scenarios_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
        ]
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
      sentiment_data: {
        Row: {
          created_at: string | null
          id: string
          platform: string
          region: string
          sentiment_score: number
          topics: Json
          volume: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform: string
          region: string
          sentiment_score: number
          topics: Json
          volume: number
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string
          region?: string
          sentiment_score?: number
          topics?: Json
          volume?: number
        }
        Relationships: []
      }
      shared_analyses: {
        Row: {
          analysis_id: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_views: number | null
          share_token: string
          share_type: string
          shared_with_email: string | null
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          analysis_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_views?: number | null
          share_token?: string
          share_type?: string
          shared_with_email?: string | null
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          analysis_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_views?: number | null
          share_token?: string
          share_type?: string
          shared_with_email?: string | null
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "shared_analyses_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "saved_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_resources: {
        Row: {
          access_level: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_public: boolean | null
          name: string
          resource_id: string
          resource_type: string
          share_token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_level: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          resource_id: string
          resource_type: string
          share_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_level?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          resource_id?: string
          resource_type?: string
          share_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      similar_papers: {
        Row: {
          created_at: string | null
          id: string
          paper_id: string | null
          search_query: string | null
          similar_papers: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          paper_id?: string | null
          search_query?: string | null
          similar_papers: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          paper_id?: string | null
          search_query?: string | null
          similar_papers?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "similar_papers_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "research_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      simulations: {
        Row: {
          city_id: string
          created_at: string | null
          id: string
          parameters: Json
          results: Json
          type: string
        }
        Insert: {
          city_id: string
          created_at?: string | null
          id?: string
          parameters?: Json
          results?: Json
          type: string
        }
        Update: {
          city_id?: string
          created_at?: string | null
          id?: string
          parameters?: Json
          results?: Json
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_analytics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          skill_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          skill_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          skill_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_analytics_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_assessment_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          feedback: string | null
          id: string
          responses: Json | null
          score: number | null
          started_at: string | null
          status: string | null
          template_id: string | null
          time_spent_minutes: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          responses?: Json | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          template_id?: string | null
          time_spent_minutes?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          responses?: Json | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          template_id?: string | null
          time_spent_minutes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_assessment_sessions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "skill_assessment_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_assessment_templates: {
        Row: {
          assessment_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: number | null
          id: string
          is_active: boolean | null
          name: string
          passing_score: number | null
          questions: Json | null
          skill_id: string | null
          time_limit_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          assessment_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          passing_score?: number | null
          questions?: Json | null
          skill_id?: string | null
          time_limit_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          assessment_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          passing_score?: number | null
          questions?: Json | null
          skill_id?: string | null
          time_limit_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_assessment_templates_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
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
      skill_gap_analyses: {
        Row: {
          analysis_type: string
          created_at: string | null
          gap_data: Json
          generated_at: string | null
          id: string
          priority_score: number | null
          recommendations: Json | null
          reviewed_at: string | null
          status: string | null
          team_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          analysis_type: string
          created_at?: string | null
          gap_data: Json
          generated_at?: string | null
          id?: string
          priority_score?: number | null
          recommendations?: Json | null
          reviewed_at?: string | null
          status?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_type?: string
          created_at?: string | null
          gap_data?: Json
          generated_at?: string | null
          id?: string
          priority_score?: number | null
          recommendations?: Json | null
          reviewed_at?: string | null
          status?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_gap_analyses_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_progress: {
        Row: {
          skill: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          skill: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          skill?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      skill_recommendations: {
        Row: {
          created_at: string | null
          id: number
          occupation: string | null
          recommendations: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          occupation?: string | null
          recommendations?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          occupation?: string | null
          recommendations?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      skill_requests: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          industry_tags: string[] | null
          skill_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          industry_tags?: string[] | null
          skill_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          industry_tags?: string[] | null
          skill_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          industry_tags: string[] | null
          level_definitions: Json | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          industry_tags?: string[] | null
          level_definitions?: Json | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          industry_tags?: string[] | null
          level_definitions?: Json | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      skills_profiles: {
        Row: {
          career_goals: string[] | null
          certifications: Json | null
          completed_courses: Json | null
          created_at: string | null
          current_enrollments: Json | null
          id: string
          learning_preferences: Json | null
          skill_categories: string[] | null
          time_availability: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          career_goals?: string[] | null
          certifications?: Json | null
          completed_courses?: Json | null
          created_at?: string | null
          current_enrollments?: Json | null
          id?: string
          learning_preferences?: Json | null
          skill_categories?: string[] | null
          time_availability?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          career_goals?: string[] | null
          certifications?: Json | null
          completed_courses?: Json | null
          created_at?: string | null
          current_enrollments?: Json | null
          id?: string
          learning_preferences?: Json | null
          skill_categories?: string[] | null
          time_availability?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "unified_users"
            referencedColumns: ["id"]
          },
        ]
      }
      structures: {
        Row: {
          city_id: string
          created_at: string | null
          footprint: string | null
          green_elements: string[] | null
          height: number | null
          id: string
          materials: string[] | null
          position: Json
          type: string
          updated_at: string | null
        }
        Insert: {
          city_id: string
          created_at?: string | null
          footprint?: string | null
          green_elements?: string[] | null
          height?: number | null
          id?: string
          materials?: string[] | null
          position?: Json
          type: string
          updated_at?: string | null
        }
        Update: {
          city_id?: string
          created_at?: string | null
          footprint?: string | null
          green_elements?: string[] | null
          height?: number | null
          id?: string
          materials?: string[] | null
          position?: Json
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "structures_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
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
      summaries: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          paper_id: string | null
          target_age: number
          user_id: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          paper_id?: string | null
          target_age: number
          user_id?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          paper_id?: string | null
          target_age?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "summaries_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "research_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_chain_profiles: {
        Row: {
          created_at: string | null
          customer_base: Json | null
          id: string
          inventory_categories: string[] | null
          logistics_preferences: Json | null
          marketplace_participation: string[] | null
          storage_capacity: number | null
          supplier_network: Json | null
          transportation_access: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_base?: Json | null
          id?: string
          inventory_categories?: string[] | null
          logistics_preferences?: Json | null
          marketplace_participation?: string[] | null
          storage_capacity?: number | null
          supplier_network?: Json | null
          transportation_access?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_base?: Json | null
          id?: string
          inventory_categories?: string[] | null
          logistics_preferences?: Json | null
          marketplace_participation?: string[] | null
          storage_capacity?: number | null
          supplier_network?: Json | null
          transportation_access?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supply_chain_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "unified_users"
            referencedColumns: ["id"]
          },
        ]
      }
      swarm_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string | null
          strengths: string[] | null
          swarm_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string | null
          strengths?: string[] | null
          swarm_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string | null
          strengths?: string[] | null
          swarm_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swarm_members_swarm_id_fkey"
            columns: ["swarm_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_swarms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarm_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      symptoms: {
        Row: {
          created_at: string | null
          duration: string | null
          frequency: string | null
          id: string
          name: string
          notes: string | null
          severity: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          name: string
          notes?: string | null
          severity?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          name?: string
          notes?: string | null
          severity?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "symptoms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_configurations: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_health: {
        Row: {
          checked_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          response_time_ms: number | null
          service_name: string
          status: string
        }
        Insert: {
          checked_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name: string
          status: string
        }
        Update: {
          checked_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name?: string
          status?: string
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at: string | null
          tags: Json | null
        }
        Insert: {
          id?: string
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at?: string | null
          tags?: Json | null
        }
        Update: {
          id?: string
          metric_name?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string | null
          tags?: Json | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          is_active: boolean | null
          joined_at: string | null
          role: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_skill_matrices: {
        Row: {
          created_at: string | null
          current_avg_level: number | null
          id: string
          last_updated: string | null
          priority: string | null
          required_level: number
          skill_gap_score: number | null
          skill_id: string | null
          team_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_avg_level?: number | null
          id?: string
          last_updated?: string | null
          priority?: string | null
          required_level?: number
          skill_gap_score?: number | null
          skill_id?: string | null
          team_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_avg_level?: number | null
          id?: string
          last_updated?: string | null
          priority?: string | null
          required_level?: number
          skill_gap_score?: number | null
          skill_id?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_skill_matrices_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_skill_matrices_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          department: string | null
          description: string | null
          id: string
          manager_id: string | null
          name: string
          skill_requirements: Json | null
          team_goals: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
          skill_requirements?: Json | null
          team_goals?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          skill_requirements?: Json | null
          team_goals?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      test_recommendations: {
        Row: {
          created_at: string | null
          details: string | null
          estimated_cost: number | null
          id: string
          name: string
          priority: string | null
          purpose: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          estimated_cost?: number | null
          id?: string
          name: string
          priority?: string | null
          purpose: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
          estimated_cost?: number | null
          id?: string
          name?: string
          priority?: string | null
          purpose?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      therapeutic_swarms: {
        Row: {
          created_at: string | null
          description: string | null
          facilitator_id: string | null
          focus: string
          id: string
          is_active: boolean | null
          max_members: number | null
          meeting_schedule: string | null
          name: string
          next_meeting: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          facilitator_id?: string | null
          focus: string
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          meeting_schedule?: string | null
          name: string
          next_meeting?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          facilitator_id?: string | null
          focus?: string
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          meeting_schedule?: string | null
          name?: string
          next_meeting?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapeutic_swarms_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transcriptions: {
        Row: {
          audio_file_id: string
          character_count: number | null
          confidence_score: number | null
          created_at: string
          gemini_model_used: string | null
          id: string
          language: string
          metadata: Json | null
          processing_status: string | null
          processing_time_ms: number | null
          transcript_text: string
          updated_at: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          audio_file_id: string
          character_count?: number | null
          confidence_score?: number | null
          created_at?: string
          gemini_model_used?: string | null
          id?: string
          language: string
          metadata?: Json | null
          processing_status?: string | null
          processing_time_ms?: number | null
          transcript_text: string
          updated_at?: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          audio_file_id?: string
          character_count?: number | null
          confidence_score?: number | null
          created_at?: string
          gemini_model_used?: string | null
          id?: string
          language?: string
          metadata?: Json | null
          processing_status?: string | null
          processing_time_ms?: number | null
          transcript_text?: string
          updated_at?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transcriptions_audio_file_id_fkey"
            columns: ["audio_file_id"]
            isOneToOne: false
            referencedRelation: "audio_files"
            referencedColumns: ["id"]
          },
        ]
      }
      transformations: {
        Row: {
          created_at: string | null
          data: Json | null
          decision_id: string | null
          id: string
          name: string
          stage: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          decision_id?: string | null
          id?: string
          name: string
          stage?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          decision_id?: string | null
          id?: string
          name?: string
          stage?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transformations_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          confidence_score: number | null
          created_at: string
          gemini_model_used: string | null
          id: string
          metadata: Json | null
          processing_time_ms: number | null
          source_language: string
          target_language: string
          transcription_id: string
          translated_text: string
          translation_quality: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          gemini_model_used?: string | null
          id?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          source_language: string
          target_language: string
          transcription_id: string
          translated_text: string
          translation_quality?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          gemini_model_used?: string | null
          id?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          source_language?: string
          target_language?: string
          transcription_id?: string
          translated_text?: string
          translation_quality?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "translations_transcription_id_fkey"
            columns: ["transcription_id"]
            isOneToOne: false
            referencedRelation: "transcriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorial_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          is_correct: boolean | null
          step_number: number
          tutorial_type: string
          user_id: string | null
          user_labels: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          step_number: number
          tutorial_type?: string
          user_id?: string | null
          user_labels?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          step_number?: number
          tutorial_type?: string
          user_id?: string | null
          user_labels?: Json | null
        }
        Relationships: []
      }
      unified_chat_history: {
        Row: {
          ai_response: string
          context_data: Json | null
          id: string
          module_context: string | null
          response_quality_score: number | null
          session_id: string
          timestamp: string | null
          user_id: string | null
          user_message: string
        }
        Insert: {
          ai_response: string
          context_data?: Json | null
          id?: string
          module_context?: string | null
          response_quality_score?: number | null
          session_id: string
          timestamp?: string | null
          user_id?: string | null
          user_message: string
        }
        Update: {
          ai_response?: string
          context_data?: Json | null
          id?: string
          module_context?: string | null
          response_quality_score?: number | null
          session_id?: string
          timestamp?: string | null
          user_id?: string | null
          user_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "unified_chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "unified_users"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_users: {
        Row: {
          created_at: string | null
          ecosystem_tier: string | null
          email: string
          full_name: string
          id: string
          language_preference: string | null
          location: Json
          phone: string | null
          profile_completion_score: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ecosystem_tier?: string | null
          email: string
          full_name: string
          id?: string
          language_preference?: string | null
          location?: Json
          phone?: string | null
          profile_completion_score?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ecosystem_tier?: string | null
          email?: string
          full_name?: string
          id?: string
          language_preference?: string | null
          location?: Json
          phone?: string | null
          profile_completion_score?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_career_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          module_id: string | null
          notes: string | null
          progress_percentage: number | null
          time_spent_minutes: number | null
          transition_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id?: string | null
          notes?: string | null
          progress_percentage?: number | null
          time_spent_minutes?: number | null
          transition_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id?: string | null
          notes?: string | null
          progress_percentage?: number | null
          time_spent_minutes?: number | null
          transition_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_career_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "career_learning_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_career_progress_transition_id_fkey"
            columns: ["transition_id"]
            isOneToOne: false
            referencedRelation: "career_transitions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_certifications: {
        Row: {
          certification_id: string | null
          created_at: string | null
          credential_id: string | null
          earned_at: string | null
          expires_at: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
          verification_url: string | null
        }
        Insert: {
          certification_id?: string | null
          created_at?: string | null
          credential_id?: string | null
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_url?: string | null
        }
        Update: {
          certification_id?: string | null
          created_at?: string | null
          credential_id?: string | null
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_certifications_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_chart_preferences: {
        Row: {
          device_type: string | null
          id: string
          synchronized_timeframes: string[] | null
          updated_at: string | null
          user_id: string | null
          wave_overlay_style: Json | null
          zoom_sync_enabled: boolean | null
        }
        Insert: {
          device_type?: string | null
          id?: string
          synchronized_timeframes?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          wave_overlay_style?: Json | null
          zoom_sync_enabled?: boolean | null
        }
        Update: {
          device_type?: string | null
          id?: string
          synchronized_timeframes?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          wave_overlay_style?: Json | null
          zoom_sync_enabled?: boolean | null
        }
        Relationships: []
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
      user_data_exports: {
        Row: {
          completed_at: string | null
          expires_at: string | null
          export_type: string
          file_path: string | null
          file_size: number | null
          id: string
          requested_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          expires_at?: string | null
          export_type: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          requested_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          expires_at?: string | null
          export_type?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          requested_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_engagement_events: {
        Row: {
          event_type: string
          id: string
          metadata: Json | null
          occurred_at: string | null
          user_id: string
        }
        Insert: {
          event_type: string
          id?: string
          metadata?: Json | null
          occurred_at?: string | null
          user_id: string
        }
        Update: {
          event_type?: string
          id?: string
          metadata?: Json | null
          occurred_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_engagement_metrics: {
        Row: {
          analyses_performed: number | null
          created_at: string
          date: string
          exports_performed: number | null
          features_used: string[] | null
          id: string
          pages_visited: number | null
          searches_conducted: number | null
          shares_created: number | null
          time_spent_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analyses_performed?: number | null
          created_at?: string
          date?: string
          exports_performed?: number | null
          features_used?: string[] | null
          id?: string
          pages_visited?: number | null
          searches_conducted?: number | null
          shares_created?: number | null
          time_spent_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analyses_performed?: number | null
          created_at?: string
          date?: string
          exports_performed?: number | null
          features_used?: string[] | null
          id?: string
          pages_visited?: number | null
          searches_conducted?: number | null
          shares_created?: number | null
          time_spent_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          admin_response: string | null
          admin_user_id: string | null
          attachments: string[] | null
          browser_info: Json | null
          category: string | null
          created_at: string
          description: string
          feedback_type: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          title: string
          updated_at: string
          url_context: string | null
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          admin_user_id?: string | null
          attachments?: string[] | null
          browser_info?: Json | null
          category?: string | null
          created_at?: string
          description: string
          feedback_type: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          title: string
          updated_at?: string
          url_context?: string | null
          user_id: string
        }
        Update: {
          admin_response?: string | null
          admin_user_id?: string | null
          attachments?: string[] | null
          browser_info?: Json | null
          category?: string | null
          created_at?: string
          description?: string
          feedback_type?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          url_context?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_learning_paths: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          learning_path_id: string | null
          progress_percentage: number | null
          started_at: string | null
          status: string | null
          target_completion_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          learning_path_id?: string | null
          progress_percentage?: number | null
          started_at?: string | null
          status?: string | null
          target_completion_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          learning_path_id?: string | null
          progress_percentage?: number | null
          started_at?: string | null
          status?: string | null
          target_completion_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_paths_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_progress: {
        Row: {
          completed_at: string | null
          completion_score: number | null
          content_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          notes: string | null
          progress_percentage: number | null
          started_at: string | null
          status: string | null
          time_spent_minutes: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_score?: number | null
          content_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          notes?: string | null
          progress_percentage?: number | null
          started_at?: string | null
          status?: string | null
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_score?: number | null
          content_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          notes?: string | null
          progress_percentage?: number | null
          started_at?: string | null
          status?: string | null
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_content"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_settings: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          frequency: string | null
          id: string
          in_app_enabled: boolean | null
          notification_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          frequency?: string | null
          id?: string
          in_app_enabled?: boolean | null
          notification_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          frequency?: string | null
          id?: string
          in_app_enabled?: boolean | null
          notification_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
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
      user_profiles: {
        Row: {
          created_at: string | null
          id: string
          notification_settings: Json | null
          preferences: Json | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          notification_settings?: Json | null
          preferences?: Json | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_settings?: Json | null
          preferences?: Json | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      user_skill_assessments: {
        Row: {
          assessment_data: Json | null
          assessment_type: string
          created_at: string
          id: string
          level_achieved: number
          notes: string | null
          score: number
          skill_id: string
          user_id: string
        }
        Insert: {
          assessment_data?: Json | null
          assessment_type?: string
          created_at?: string
          id?: string
          level_achieved: number
          notes?: string | null
          score: number
          skill_id: string
          user_id: string
        }
        Update: {
          assessment_data?: Json | null
          assessment_type?: string
          created_at?: string
          id?: string
          level_achieved?: number
          notes?: string | null
          score?: number
          skill_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string | null
          current_level: number | null
          id: string
          last_assessed_at: string | null
          proficiency_score: number | null
          skill_id: string | null
          target_level: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_level?: number | null
          id?: string
          last_assessed_at?: string | null
          proficiency_score?: number | null
          skill_id?: string | null
          target_level?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_level?: number | null
          id?: string
          last_assessed_at?: string | null
          proficiency_score?: number | null
          skill_id?: string | null
          target_level?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          features_enabled: string[] | null
          id: string
          tier: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          features_enabled?: string[] | null
          id?: string
          tier?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          features_enabled?: string[] | null
          id?: string
          tier?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_watchlist: {
        Row: {
          alert_enabled: boolean | null
          created_at: string | null
          id: string
          is_favorite: boolean | null
          symbol: string
          user_id: string | null
        }
        Insert: {
          alert_enabled?: boolean | null
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          symbol: string
          user_id?: string | null
        }
        Update: {
          alert_enabled?: boolean | null
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          symbol?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_wave_settings: {
        Row: {
          degree_preference: string | null
          fibonacci_ratios: Json | null
          id: string
          symbol: string
          updated_at: string | null
          user_id: string | null
          wave_sensitivity: string | null
        }
        Insert: {
          degree_preference?: string | null
          fibonacci_ratios?: Json | null
          id?: string
          symbol: string
          updated_at?: string | null
          user_id?: string | null
          wave_sensitivity?: string | null
        }
        Update: {
          degree_preference?: string | null
          fibonacci_ratios?: Json | null
          id?: string
          symbol?: string
          updated_at?: string | null
          user_id?: string | null
          wave_sensitivity?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          role?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      visualizations: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          paper_id: string | null
          user_id: string | null
          visualization_type: string
        }
        Insert: {
          config: Json
          created_at?: string | null
          id?: string
          paper_id?: string | null
          user_id?: string | null
          visualization_type: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          paper_id?: string | null
          user_id?: string | null
          visualization_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "visualizations_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "research_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_sessions: {
        Row: {
          agent_id: string
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          project_id: string
          session_status: string | null
          transcription: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          project_id: string
          session_status?: string | null
          transcription?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          project_id?: string
          session_status?: string | null
          transcription?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      wave_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_triggered: string | null
          notification_methods: string[] | null
          symbol: string
          trigger_conditions: Json
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          notification_methods?: string[] | null
          symbol: string
          trigger_conditions: Json
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          notification_methods?: string[] | null
          symbol?: string
          trigger_conditions?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      wave_detections: {
        Row: {
          confidence_score: number | null
          detected_at: string | null
          fibonacci_levels: Json | null
          id: string
          last_price: number | null
          status: string | null
          symbol: string
          timeframe: string
          wave_degrees: Json | null
          wave_structure: Json
        }
        Insert: {
          confidence_score?: number | null
          detected_at?: string | null
          fibonacci_levels?: Json | null
          id?: string
          last_price?: number | null
          status?: string | null
          symbol: string
          timeframe: string
          wave_degrees?: Json | null
          wave_structure: Json
        }
        Update: {
          confidence_score?: number | null
          detected_at?: string | null
          fibonacci_levels?: Json | null
          id?: string
          last_price?: number | null
          status?: string | null
          symbol?: string
          timeframe?: string
          wave_degrees?: Json | null
          wave_structure?: Json
        }
        Relationships: []
      }
      wave_explanations: {
        Row: {
          confidence_level: number | null
          created_at: string | null
          explanation_text: string
          explanation_type: string
          id: string
          symbol: string
          timeframe: string
          wave_segment: Json
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string | null
          explanation_text: string
          explanation_type: string
          id?: string
          symbol: string
          timeframe: string
          wave_segment: Json
        }
        Update: {
          confidence_level?: number | null
          created_at?: string | null
          explanation_text?: string
          explanation_type?: string
          id?: string
          symbol?: string
          timeframe?: string
          wave_segment?: Json
        }
        Relationships: []
      }
      workflow_runs: {
        Row: {
          finished_at: string | null
          id: string
          started_at: string | null
          status: string
          tenant_id: string | null
          user_id: string | null
          workflow_type: string
        }
        Insert: {
          finished_at?: string | null
          id?: string
          started_at?: string | null
          status: string
          tenant_id?: string | null
          user_id?: string | null
          workflow_type: string
        }
        Update: {
          finished_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          tenant_id?: string | null
          user_id?: string | null
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      cleanup_old_cache_entries: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_title: string
          p_message: string
          p_type?: string
          p_metadata?: Json
        }
        Returns: string
      }
      deduct_api_credits: {
        Args: { p_user_id: string; p_credits_to_deduct?: number }
        Returns: boolean
      }
      generate_share_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_global_mood_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_occupation_skill_recommendations: {
        Args: { p_occupation_code: string }
        Returns: {
          id: string
          skill_name: string
          explanation: string
          priority: number
        }[]
      }
      get_occupation_task_assessments: {
        Args: { p_occupation_code: string }
        Returns: {
          id: string
          task_description: string
          category: string
          explanation: string
          confidence: number
        }[]
      }
      get_regional_mood_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_skill_resources: {
        Args: { p_skill_area: string }
        Returns: {
          id: string
          title: string
          url: string
          provider: string
          description: string
          cost_type: string
        }[]
      }
      get_user_analytics: {
        Args: { p_user_id: string }
        Returns: Json
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
      health_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
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
      increment_share_view: {
        Args: { share_token_param: string }
        Returns: Json
      }
      increment_template_usage: {
        Args: { template_id: string }
        Returns: undefined
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
      record_metric: {
        Args: {
          p_metric_name: string
          p_metric_value: number
          p_metric_type?: string
          p_tags?: Json
        }
        Returns: string
      }
      renewai_mark_notification_read: {
        Args: { notification_id: string }
        Returns: undefined
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
      track_user_engagement: {
        Args: { p_user_id: string; p_event_type: string; p_value?: number }
        Returns: undefined
      }
      update_project_analytics: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: undefined
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
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
