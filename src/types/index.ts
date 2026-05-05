export type UserRole = 'student' | 'parent' | 'teacher' | 'admin'

export type LevelCode = 'white' | 'yellow' | 'orange' | 'green' | 'blue' | 'brown' | 'black'
export type ModuleCode = 'math' | 'english' | 'code' | 'robotics' | 'karate' | 'read' | 'write'

export type ExerciseType = 'multiple_choice' | 'fill_blank' | 'speaking' | 'coding' | 'video' | 'drag_drop'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type LessonStatus = 'not_started' | 'in_progress' | 'completed' | 'mastered'
export type ArticleStatus = 'draft' | 'published' | 'archived'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'
export type PurchaseCategory = 'avatar' | 'theme' | 'powerup' | 'real'

export interface User {
  id: string
  email: string
  phone?: string
  role: UserRole
  profile?: Profile
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  full_name: string
  birth_date?: string
  avatar_url?: string
  level_id: string
  dojicoins_balance: number
  total_points: number
  streak_days: number
  last_activity?: string
  metadata: Record<string, any>
  level?: Level
}

export interface Level {
  id: string
  code: LevelCode
  name: string
  description: string
  min_points: number
  max_points: number
  color_hex: string
  icon_url?: string
  order_index: number
}

export interface Module {
  id: string
  code: ModuleCode
  name: string
  description: string
  icon_url?: string
  color_hex: string
  is_active: boolean
}

export interface Lesson {
  id: string
  module_id: string
  level_id: string
  title: string
  description: string
  content: Record<string, any>
  order_index: number
  est_duration_min: number
  xp_reward: number
  is_locked: boolean
  unlock_criteria?: Record<string, any>
  module?: Module
  level?: Level
}

export interface Exercise {
  id: string
  lesson_id: string
  type: ExerciseType
  question: string
  options?: string[]
  correct_answer: string | number | boolean
  explanation: string
  points_value: number
  difficulty: Difficulty
  metadata?: Record<string, any>
}

export interface StudentProgress {
  id: string
  student_id: string
  lesson_id: string
  status: LessonStatus
  started_at?: string
  completed_at?: string
  score?: number
  attempts: number
  best_time_sec?: number
}

export interface DailyMission {
  id: string
  student_id: string
  date: string
  missions_completed: number
  total_missions: number
  dojicoins_earned: number
  streak_bonus: number
  is_completed: boolean
}

export interface Achievement {
  id: string
  code: string
  name: string
  description: string
  icon_url?: string
  points_reward: number
  dojicoins_reward: number
  criteria: Record<string, any>
  is_hidden: boolean
}

export interface StudentAchievement {
  id: string
  student_id: string
  achievement_id: string
  unlocked_at: string
  progress_data?: Record<string, any>
  achievement?: Achievement
}

export interface DojicoinsTransaction {
  id: string
  student_id: string
  amount: number
  type: 'earned' | 'spent' | 'bonus' | 'gift'
  source: string
  reference_id?: string
  balance_after: number
  created_at: string
}

export interface Ranking {
  id: string
  period: 'daily' | 'weekly' | 'monthly' | 'all_time'
  student_id: string
  points: number
  position: number
  rank_category: string
  updated_at: string
}

export interface ShopItem {
  id: string
  name: string
  description: string
  image_url?: string
  category: PurchaseCategory
  price_dojicoins: number
  stock_quantity: number | null
  is_limited: boolean
  is_active: boolean
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

// Dashboard Stats
export interface DashboardStats {
  total_xp: number
  dojicoins: number
  lessons_completed: number
  current_streak: number
  level: Level
  next_level_xp: number
  progress_percentage: number
  module_progress: Record<ModuleCode, {
    lessons_completed: number
    total_lessons: number
    percentage: number
  }>
}

// AI Chat Types
export interface AIConversation {
  id: string
  student_id: string
  module_code: ModuleCode
  context: Record<string, any>
  started_at: string
  ended_at?: string
}

export interface AIMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens_used: number
  created_at: string
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  full_name: string
  role: UserRole
  birth_date?: string
}

export interface LessonCompletion {
  lesson_id: string
  score: number
  time_spent_sec: number
}

// Configuration
export interface AppConfig {
  appName: string
  appUrl: string
  supportEmail: string
  features: {
    aiChat: boolean
    speechRecognition: boolean
    offlineMode: boolean
    parentPanel: boolean
    teacherPanel: boolean
  }
  pricing: {
    familyBasic: number
    familyPlus: number
    school: number
    premiumSensei: number
  }
}