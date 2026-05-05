-- DOJOIA Database Migrations
-- Supabase Project: https://vikgeidbjpnotwtdzkix.supabase.co

-- Enable extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type user_role as enum ('student', 'parent', 'teacher', 'admin');
create type lesson_status as enum ('not_started', 'in_progress', 'completed', 'mastered');
create type subscription_status as enum ('active', 'canceled', 'past_due', 'trialing');
create type purchase_category as enum ('avatar', 'theme', 'powerup', 'real');
create type exercise_type as enum ('multiple_choice', 'fill_blank', 'speaking', 'coding', 'video', 'drag_drop');
create type difficulty as enum ('beginner', 'intermediate', 'advanced', 'expert');
create type ranking_period as enum ('daily', 'weekly', 'monthly', 'all_time');
create type transaction_type as enum ('earned', 'spent', 'bonus', 'gift');

-- ============================================
-- 1. USERS & PROFILES
-- ============================================

create table users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  phone text,
  role user_role default 'student',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table profiles (
  id uuid references profiles(id) on delete cascade primary key,
  user_id uuid references users(id) on delete cascade not null,
  full_name text not null,
  birth_date date,
  avatar_url text,
  level_id uuid references levels(id),
  dojicoins_balance integer default 100, -- Welcome bonus
  total_points integer default 0,
  streak_days integer default 0,
  last_activity timestamp with time zone,
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster queries
create index idx_profiles_user_id on profiles(user_id);
create index idx_profiles_level_id on profiles(level_id);

-- ============================================
-- 2. LEVELS (Cintas)
-- ============================================

create table levels (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  name text not null,
  description text,
  min_points integer not null,
  max_points integer not null,
  color_hex text not null,
  icon_url text,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert levels
insert into levels (code, name, description, min_points, max_points, color_hex, order_index) values
  ('white', 'Cinta Blanca', 'Nivel inicial. Fundamentos básicos.', 0, 1000, '#FFFFFF', 1),
  ('yellow', 'Cinta Amarilla', 'Primer nivel intermedio.', 1000, 2500, '#F6E05E', 2),
  ('orange', 'Cinta Naranja', 'Consolidación de conocimientos.', 2500, 5000, '#ED8936', 3),
  ('green', 'Cinta Verde', 'Nivel avanzado.', 5000, 10000, '#48BB78', 4),
  ('blue', 'Cinta Azul', 'Dominio técnico.', 10000, 20000, '#4299E1', 5),
  ('brown', 'Cinta Café', 'Maestría intermedia.', 20000, 40000, '#975A16', 6),
  ('black', 'Cinta Negra', 'Maestro. Nivel máximo.', 40000, 100000, '#1A202C', 7);

-- ============================================
-- 3. MODULES
-- ============================================

create table modules (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  name text not null,
  description text,
  icon_url text,
  color_hex text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert modules
insert into modules (code, name, description, color_hex) values
  ('math', 'DOJO MATH', 'Matemáticas progresivas estilo Kumon', '#3182CE'),
  ('english', 'DOJO ENGLISH', 'Inglés conversacional con IA', '#38A169'),
  ('code', 'DOJO CODE', 'Programación desde cero', '#805AD5'),
  ('robotics', 'DOJO ROBOTICS', 'Robótica y automatización', '#DD6B20'),
  ('karate', 'DOJO KARATE', 'Artes marciales y valores', '#E53E3E'),
  ('read', 'DOJO READ', 'Lectura comprensiva y rápida', '#00B5D8'),
  ('write', 'DOJO WRITE', 'Escritura creativa', '#D53F8C');

-- ============================================
-- 4. LESSONS & EXERCISES
-- ============================================

create table lessons (
  id uuid default uuid_generate_v4() primary key,
  module_id uuid references modules(id) on delete cascade not null,
  level_id uuid references levels(id) on delete cascade not null,
  title text not null,
  description text,
  content jsonb default '{}',
  order_index integer not null,
  est_duration_min integer not null,
  xp_reward integer not null,
  is_locked boolean default false,
  unlock_criteria jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_lessons_module_level on lessons(module_id, level_id);

create table exercises (
  id uuid default uuid_generate_v4() primary key,
  lesson_id uuid references lessons(id) on delete cascade not null,
  type exercise_type not null,
  question text not null,
  options text[],
  correct_answer text not null,
  explanation text not null,
  points_value integer default 10,
  difficulty difficulty default 'beginner',
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_exercises_lesson on exercises(lesson_id);

-- ============================================
-- 5. STUDENT PROGRESS
-- ============================================

create table student_progress (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  lesson_id uuid references lessons(id) on delete cascade not null,
  status lesson_status default 'not_started',
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  score integer, -- 0-100
  attempts integer default 0,
  best_time_sec integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, lesson_id)
);

create index idx_progress_student on student_progress(student_id);
create index idx_progress_lesson on student_progress(lesson_id);

create table exercise_attempts (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  exercise_id uuid references exercises(id) on delete cascade not null,
  answer text not null,
  is_correct boolean not null,
  time_spent_ms integer,
  answered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_attempts_student on exercise_attempts(student_id);
create index idx_attempts_exercise on exercise_attempts(exercise_id);

-- ============================================
-- 6. DAILY MISSIONS
-- ============================================

create table daily_missions (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  missions_completed integer default 0,
  total_missions integer default 5,
  dojicoins_earned integer default 0,
  streak_bonus integer default 0,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, date)
);

-- ============================================
-- 7. ACHIEVEMENTS & GAMIFICATION
-- ============================================

create table achievements (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  name text not null,
  description text not null,
  icon_url text,
  points_reward integer not null,
  dojicoins_reward integer not null,
  criteria jsonb not null,
  is_hidden boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table student_achievements (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  achievement_id uuid references achievements(id) on delete cascade not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  progress_data jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, achievement_id)
);

create table dojicoins_transactions (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  amount integer not null,
  type transaction_type not null,
  source text not null,
  reference_id uuid,
  balance_after integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_transactions_student on dojicoins_transactions(student_id);

create table rankings (
  id uuid default uuid_generate_v4() primary key,
  period ranking_period not null,
  student_id uuid references profiles(id) on delete cascade not null,
  points integer not null,
  position integer not null,
  rank_category text default 'overall',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(period, student_id, rank_category)
);

-- ============================================
-- 8. SHOP & PURCHASES
-- ============================================

create table shop_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  category purchase_category not null,
  price_dojicoins integer not null,
  stock_quantity integer,
  is_limited boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table purchases (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  item_id uuid references shop_items(id) on delete restrict not null,
  quantity integer default 1,
  total_price integer not null,
  purchased_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 9. FAMILIES & SCHOOLS
-- ============================================

create table families (
  id uuid default uuid_generate_v4() primary key,
  parent_id uuid references profiles(id) on delete cascade not null,
  family_name text not null,
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table family_members (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references families(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  relationship text check (relationship in ('child', 'sibling')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(family_id, student_id)
);

create table schools (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text unique not null,
  admin_id uuid references profiles(id) on delete set null,
  plan text default 'basic',
  max_students integer,
  subscription_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table school_students (
  id uuid default uuid_generate_v4() primary key,
  school_id uuid references schools(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  grade_level text,
  classroom text,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(school_id, student_id)
);

create table school_teachers (
  id uuid default uuid_generate_v4() primary key,
  school_id uuid references schools(id) on delete cascade not null,
  teacher_id uuid references profiles(id) on delete cascade not null,
  subjects jsonb default '[]',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(school_id, teacher_id)
);

-- ============================================
-- 10. NOTIFICATIONS & MESSAGES
-- ============================================

create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  is_read boolean default false,
  action_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_notifications_user on notifications(user_id, is_read);

create table messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references users(id) on delete cascade not null,
  receiver_id uuid references users(id) on delete cascade not null,
  subject text,
  body text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_messages_receiver on messages(receiver_id, is_read);

-- ============================================
-- 11. SUBSCRIPTIONS & PAYMENTS
-- ============================================

create table subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  plan text not null check (plan in ('family_basic', 'family_plus', 'school', 'premium_sensei')),
  stripe_subscription_id text unique,
  status subscription_status default 'trialing',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  amount decimal(10,2) not null,
  currency text default 'MXN',
  status text check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  payment_method text,
  description text,
  stripe_payment_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 12. AI INTERACTIONS
-- ============================================

create table ai_conversations (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  module_code text references modules(code),
  context jsonb default '{}',
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone
);

create table ai_messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references ai_conversations(id) on delete cascade not null,
  role text check (role in ('user', 'assistant', 'system')) not null,
  content text not null,
  tokens_used integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 13. ANALYTICS
-- ============================================

create table student_analytics_daily (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  time_spent_min integer default 0,
  exercises_completed integer default 0,
  lessons_completed integer default 0,
  points_earned integer default 0,
  dojicoins_earned integer default 0,
  streak_maintained boolean default false,
  modules_active jsonb default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, date)
);

create table system_analytics (
  id uuid default uuid_generate_v4() primary key,
  date date not null unique,
  total_students integer default 0,
  active_students integer default 0,
  new_signups integer default 0,
  lessons_completed_total integer default 0,
  revenue decimal(10,2) default 0,
  avg_session_min decimal(5,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
alter table users enable row level security;
alter table profiles enable row level security;
alter table lessons enable row level security;
alter table exercises enable row level security;
alter table student_progress enable row level security;
alter table exercise_attempts enable row level security;
alter table daily_missions enable row level security;
alter table student_achievements enable row level security;
alter table dojicoins_transactions enable row level security;
alter table rankings enable row level security;
alter table purchases enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;

-- Policies will be added in a separate migration file (02_policies.sql)

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Apply trigger to tables with updated_at
create trigger update_users_updated_at before update on users for each row execute procedure update_updated_at_column();
create trigger update_profiles_updated_at before update on profiles for each row execute procedure update_updated_at_column();
create trigger update_levels_updated_at before update on levels for each row execute procedure update_updated_at_column();
create trigger update_modules_updated_at before update on modules for each row execute procedure update_updated_at_column();
create trigger update_lessons_updated_at before update on lessons for each row execute procedure update_updated_at_column();
create trigger update_exercises_updated_at before update on exercises for each row execute procedure update_updated_at_column();

-- Function to calculate student level based on XP
create or replace function get_level_by_points(p_points integer)
returns uuid as $$
declare
  v_level_id uuid;
begin
  select id into v_level_id
  from levels
  where p_points >= min_points and p_points < max_points
  order by order_index desc
  limit 1;

  -- If no level found (points >= max of highest), return black belt
  if v_level_id is null then
    select id into v_level_id
    from levels
    where code = 'black'
    limit 1;
  end if;

  return v_level_id;
end;
$$ language plpgsql stable;

-- Function to update profile level automatically
create or replace function update_profile_level()
returns trigger as $$
begin
  if new.total_points is distinct from old.total_points then
    new.level_id = get_level_by_points(new.total_points);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger update_profile_level_trigger
before update on profiles
for each row
execute procedure update_profile_level();

-- Function to recalculate rankings (can be called daily via cron)
create or replace function recalculate_rankings(p_period ranking_period)
returns void as $$
begin
  -- Clear existing rankings for period
  delete from rankings where period = p_period;

  -- Insert new rankings based on points
  insert into rankings (period, student_id, points, position, rank_category, updated_at)
  select
    p_period,
    p.student_id,
    p.total_points,
    row_number() over (order by p.total_points desc) as position,
    'overall' as rank_category,
    now()
  from profiles p
  order by p.total_points desc;

  -- Module-specific rankings (for math only as example)
  insert into rankings (period, student_id, points, position, rank_category, updated_at)
  select
    p_period,
    sp.student_id,
    sum(sp.score) as points,
    row_number() over (order by sum(sp.score) desc) as position,
    'module_math' as rank_category,
    now()
  from student_progress sp
  join lessons l on sp.lesson_id = l.id
  join modules m on l.module_id = m.id
  where m.code = 'math' and sp.status = 'completed'
  group by sp.student_id
  order by sum(sp.score) desc;
end;
$$ language plpgsql;

-- ============================================
-- STORAGE POLICIES (Commented - setup separately)
-- ============================================

-- Storage buckets needed:
-- 1. avatars - For user profile pictures
-- 2. lesson-assets - For videos, images in lessons
-- 3. shop-images - For shop item images

-- ============================================
-- SAMPLE DATA SEEDING
-- ============================================

-- Achievements (will be populated by seed script)
-- Shop items (will be populated by seed script)
-- Initial lessons (will be populated by seed script)

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Already created indexes above, but also:
create index idx_student_progress_completed on student_progress(student_id, status, completed_at);
create index idx_exercise_attempts_scoring on exercise_attempts(student_id, is_correct, answered_at);
create index idx_dojicoins_transactions_balance on dojicoins_transactions(student_id, created_at desc);
create index idx_ai_conversations_student on ai_conversations(student_id, started_at desc);

-- Full-text search for lesson titles/descriptions (optional)
-- create index idx_lessons_search on lessons using gin(to_tsvector('spanish', title || ' ' || description));
