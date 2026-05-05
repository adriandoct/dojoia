export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          role: 'student' | 'parent' | 'teacher' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          role?: 'student' | 'parent' | 'teacher' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          role?: 'student' | 'parent' | 'teacher' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          birth_date: string | null
          avatar_url: string | null
          level_id: string
          dojicoins_balance: number
          total_points: number
          streak_days: number
          last_activity: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          birth_date?: string | null
          avatar_url?: string | null
          level_id: string
          dojicoins_balance?: number
          total_points?: number
          streak_days?: number
          last_activity?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          birth_date?: string | null
          avatar_url?: string | null
          level_id?: string
          dojicoins_balance?: number
          total_points?: number
          streak_days?: number
          last_activity?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      levels: {
        Row: {
          id: string
          code: 'white' | 'yellow' | 'orange' | 'green' | 'blue' | 'brown' | 'black'
          name: string
          description: string
          min_points: number
          max_points: number
          color_hex: string
          icon_url: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code?: 'white' | 'yellow' | 'orange' | 'green' | 'blue' | 'brown' | 'black'
          name: string
          description: string
          min_points: number
          max_points: number
          color_hex: string
          icon_url?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: 'white' | 'yellow' | 'orange' | 'green' | 'blue' | 'brown' | 'black'
          name?: string
          description?: string
          min_points?: number
          max_points?: number
          color_hex?: string
          icon_url?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          code: 'math' | 'english' | 'code' | 'robotics' | 'karate' | 'read' | 'write'
          name: string
          description: string
          icon_url: string | null
          color_hex: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code?: 'math' | 'english' | 'code' | 'robotics' | 'karate' | 'read' | 'write'
          name: string
          description: string
          icon_url?: string | null
          color_hex: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: 'math' | 'english' | 'code' | 'robotics' | 'karate' | 'read' | 'write'
          name?: string
          description?: string
          icon_url?: string | null
          color_hex?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          level_id: string
          title: string
          description: string
          content: Json
          order_index: number
          est_duration_min: number
          xp_reward: number
          is_locked: boolean
          unlock_criteria: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          level_id: string
          title: string
          description: string
          content: Json
          order_index?: number
          est_duration_min?: number
          xp_reward?: number
          is_locked?: boolean
          unlock_criteria?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          level_id?: string
          title?: string
          description?: string
          content?: Json
          order_index?: number
          est_duration_min?: number
          xp_reward?: number
          is_locked?: boolean
          unlock_criteria?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          lesson_id: string
          type: 'multiple_choice' | 'fill_blank' | 'speaking' | 'coding' | 'video' | 'drag_drop'
          question: string
          options: string[] | null
          correct_answer: string
          explanation: string
          points_value: number
          difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          type?: 'multiple_choice' | 'fill_blank' | 'speaking' | 'coding' | 'video' | 'drag_drop'
          question: string
          options?: string[] | null
          correct_answer: string
          explanation: string
          points_value?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          type?: 'multiple_choice' | 'fill_blank' | 'speaking' | 'coding' | 'video' | 'drag_drop'
          question?: string
          options?: string[] | null
          correct_answer?: string
          explanation?: string
          points_value?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      student_progress: {
        Row: {
          id: string
          student_id: string
          lesson_id: string
          status: 'not_started' | 'in_progress' | 'completed' | 'mastered'
          started_at: string | null
          completed_at: string | null
          score: number | null
          attempts: number
          best_time_sec: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          lesson_id: string
          status?: 'not_started' | 'in_progress' | 'completed' | 'mastered'
          started_at?: string | null
          completed_at?: string | null
          score?: number | null
          attempts?: number
          best_time_sec?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          lesson_id?: string
          status?: 'not_started' | 'in_progress' | 'completed' | 'mastered'
          started_at?: string | null
          completed_at?: string | null
          score?: number | null
          attempts?: number
          best_time_sec?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      exercise_attempts: {
        Row: {
          id: string
          student_id: string
          exercise_id: string
          answer: string
          is_correct: boolean
          time_spent_ms: number
          answered_at: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          exercise_id: string
          answer: string
          is_correct: boolean
          time_spent_ms?: number
          answered_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          exercise_id?: string
          answer?: string
          is_correct?: boolean
          time_spent_ms?: number
          answered_at?: string
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          code: string
          name: string
          description: string
          icon_url: string | null
          points_reward: number
          dojicoins_reward: number
          criteria: Json
          is_hidden: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description: string
          icon_url?: string | null
          points_reward?: number
          dojicoins_reward?: number
          criteria: Json
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string
          icon_url?: string | null
          points_reward?: number
          dojicoins_reward?: number
          criteria?: Json
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      student_achievements: {
        Row: {
          id: string
          student_id: string
          achievement_id: string
          unlocked_at: string
          progress_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          achievement_id: string
          unlocked_at?: string
          progress_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          achievement_id?: string
          unlocked_at?: string
          progress_data?: Json | null
          created_at?: string
        }
      }
      dojicoins_transactions: {
        Row: {
          id: string
          student_id: string
          amount: number
          type: 'earned' | 'spent' | 'bonus' | 'gift'
          source: string
          reference_id: string | null
          balance_after: number
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          amount: number
          type: 'earned' | 'spent' | 'bonus' | 'gift'
          source: string
          reference_id?: string | null
          balance_after: number
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          amount?: number
          type?: 'earned' | 'spent' | 'bonus' | 'gift'
          source?: string
          reference_id?: string | null
          balance_after?: number
          created_at?: string
        }
      }
      shop_items: {
        Row: {
          id: string
          name: string
          description: string
          image_url: string | null
          category: 'avatar' | 'theme' | 'powerup' | 'real'
          price_dojicoins: number
          stock_quantity: number | null
          is_limited: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image_url?: string | null
          category: 'avatar' | 'theme' | 'powerup' | 'real'
          price_dojicoins: number
          stock_quantity?: number | null
          is_limited?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image_url?: string | null
          category?: 'avatar' | 'theme' | 'powerup' | 'real'
          price_dojicoins?: number
          stock_quantity?: number | null
          is_limited?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          student_id: string
          item_id: string
          quantity: number
          total_price: number
          purchased_at: string
        }
        Insert: {
          id?: string
          student_id: string
          item_id: string
          quantity?: number
          total_price: number
          purchased_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          item_id?: string
          quantity?: number
          total_price?: number
          purchased_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'student' | 'parent' | 'teacher' | 'admin'
      lesson_status: 'not_started' | 'in_progress' | 'completed' | 'mastered'
      subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing'
      purchase_category: 'avatar' | 'theme' | 'powerup' | 'real'
    }
  }
}

export type LevelCode = Database['public']['Enums']['user_role']
