# DOJOIA Database Schema

## Core Tables

### users
- id (uuid, PK)
- email (string, unique)
- phone (string)
- role: 'student' | 'parent' | 'teacher' | 'admin'
- profile (jsonb)
- created_at

### profiles
- id (uuid, PK)
- user_id (fk → users)
- full_name
- birth_date
- avatar_url
- level_id (fk → levels)
- dojicoins_balance
- total_points
- streak_days
- last_activity
- metadata (jsonb)

### levels
- id (uuid, PK)
- code: 'white' | 'yellow' | 'orange' | 'green' | 'blue' | 'brown' | 'black'
- name
- description
- min_points
- max_points
- color_hex
- icon_url
- order_index

### modules
- id (uuid, PK)
- code: 'math' | 'english' | 'code' | 'robotics' | 'karate' | 'read' | 'write'
- name
- description
- icon_url
- color_hex
- is_active

### lessons
- id (uuid, PK)
- module_id (fk → modules)
- level_id (fk → levels)
- title
- description
- content (jsonb)
- order_index
- est_duration_min
- xp_reward
- is_locked
- unlock_criteria (jsonb)

### exercises
- id (uuid, PK)
- lesson_id (fk → lessons)
- type: 'multiple_choice' | 'fill_blank' | 'speaking' | 'coding' | 'video' | 'drag_drop'
- question
- options (jsonb)
- correct_answer
- explanation
- points_value
- difficulty
- metadata (jsonb)

## Progress & Tracking

### student_progress
- id (uuid, PK)
- student_id (fk → profiles)
- lesson_id (fk → lessons)
- status: 'not_started' | 'in_progress' | 'completed' | 'mastered'
- started_at
- completed_at
- score
- attempts
- best_time_sec

### exercise_attempts
- id (uuid, PK)
- student_id (fk → profiles)
- exercise_id (fk → exercises)
- answer
- is_correct
- time_spent_ms
- answered_at

### daily_missions
- id (uuid, PK)
- student_id (fk → profiles)
- date
- missions_completed
- total_missions
- dojicoins_earned
- streak_bonus
- is_completed

## Gamification

### achievements
- id (uuid, PK)
- code
- name
- description
- icon_url
- points_reward
- dojicoins_reward
- criteria (jsonb)
- is_hidden

### student_achievements
- id (uuid, PK)
- student_id (fk → profiles)
- achievement_id (fk → achievements)
- unlocked_at
- progress_data (jsonb)

### dojicoins_transactions
- id (uuid, PK)
- student_id (fk → profiles)
- amount
- type: 'earned' | 'spent' | 'bonus' | 'gift'
- source: 'lesson' | 'mission' | 'achievement' | 'daily_login' | 'purchase'
- reference_id (nullable)
- balance_after
- created_at

### rankings
- id (uuid, PK)
- period: 'daily' | 'weekly' | 'monthly' | 'all_time'
- student_id (fk → profiles)
- points
- position
- rank_category: 'overall' | 'module_math' | 'module_english' | ...
- updated_at

## Content

### articles
- id (uuid, PK)
- title
- slug
- excerpt
- content (jsonb)
- author_id (fk → users)
- status: 'draft' | 'published' | 'archived'
- published_at
- tags (jsonb)

### videos
- id (uuid, PK)
- title
- description
- url
- thumbnail_url
- duration_sec
- module_id (fk → modules)
- level_id (fk → levels)
- order_index

### books
- id (uuid, PK)
- title
- author
- cover_url
- pdf_url
- reading_level
- word_count
- comprehension_questions (jsonb)

## Classes & Mentoring (Premium)

### classes
- id (uuid, PK)
- teacher_id (fk → profiles)
- title
- description
- module_id
- level_id
- schedule (jsonb)
- max_students
- price
- is_active

### class_enrollments
- id (uuid, PK)
- class_id (fk → classes)
- student_id (fk → profiles)
- enrolled_at
- status: 'active' | 'completed' | 'cancelled'

### class_sessions
- id (uuid, PK)
- class_id (fk → classes)
- scheduled_at
- duration_min
- meeting_url
- recording_url
- status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'

## Shop

### shop_items
- id (uuid, PK)
- name
- description
- image_url
- category: 'avatar' | 'theme' | 'powerup' | 'real'
- price_dojicoins
- stock_quantity
- is_limited
- is_active

### purchases
- id (uuid, PK)
- student_id (fk → profiles)
- item_id (fk → shop_items)
- quantity
- total_price
- purchased_at

## Families & Schools

### families
- id (uuid, PK)
- parent_id (fk → profiles)
- family_name
- metadata (jsonb)

### family_members
- id (uuid, PK)
- family_id (fk → families)
- student_id (fk → profiles)
- relationship: 'child' | 'sibling'
- joined_at

### schools
- id (uuid, PK)
- name
- code (unique)
- admin_id (fk → profiles)
- plan: 'basic' | 'plus' | 'enterprise'
- max_students
- subscription_active
- created_at

### school_students
- id (uuid, PK)
- school_id (fk → schools)
- student_id (fk → profiles)
- grade_level
- classroom
- joined_at

### school_teachers
- id (uuid, PK)
- school_id (fk → schools)
- teacher_id (fk → profiles)
- subjects (jsonb)
- is_active

## Notifications & Messages

### notifications
- id (uuid, PK)
- user_id (fk → users)
- type: 'achievement' | 'mission' | 'message' | 'alert' | 'reminder'
- title
- message
- is_read
- action_url
- created_at

### messages
- id (uuid, PK)
- sender_id (fk → users)
- receiver_id (fk → users)
- subject
- body
- is_read
- created_at

## Payments

### subscriptions
- id (uuid, PK)
- user_id (fk → users)
- plan: 'family_basic' | 'family_plus' | 'school' | 'premium_sensei'
- stripe_subscription_id
- status: 'active' | 'canceled' | 'past_due' | 'trialing'
- current_period_start
- current_period_end
- cancel_at_period_end

### payments
- id (uuid, PK)
- user_id (fk → users)
- amount
- currency
- status: 'pending' | 'succeeded' | 'failed' | 'refunded'
- payment_method
- description
- created_at

## AI Interactions

### ai_conversations
- id (uuid, PK)
- student_id (fk → profiles)
- module_code
- context (jsonb)
- started_at
- ended_at

### ai_messages
- id (uuid, PK)
- conversation_id (fk → ai_conversations)
- role: 'user' | 'assistant' | 'system'
- content
- tokens_used
- created_at

## Analytics

### student_analytics_daily
- id (uuid, PK)
- student_id (fk → profiles)
- date
- time_spent_min
- exercises_completed
- lessons_completed
- points_earned
- dojicoins_earned
- streak_maintained
- modules_active (jsonb)

### system_analytics
- id (uuid, PK)
- date
- total_students
- active_students
- new_signups
- lessons_completed_total
- revenue
- avg_session_min