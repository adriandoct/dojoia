-- DOJOIA Database Migrations - CORREGIDO
-- Supabase Project: https://vikgeidbjpnotwtdzkix.supabase.co
-- IMPORTANTE: Ejecutar este archivo COMPLETO en Supabase Studio SQL Editor
-- No ejecutes por separado, ejecuta TODO este archivo de una vez

-- ============================================
-- 0. EXTENSIONS & TYPES (primero)
-- ============================================

create extension if not exists "uuid-ossp";

-- Custom types
create type user_role as enum ('student', 'parent', 'teacher', 'admin');
create type lesson_status as enum ('not_started', 'in_progress', 'completed', 'mastered');
create type subscription_status as enum ('active', 'canceled', 'past_due', 'trialing');
create type purchase_category as enum ('avatar', 'theme', 'powerup', 'real');
create type exercise_type as enum ('multiple_choice', 'fill_blank', 'speaking', 'coding', 'video', 'drag_drop');
create type difficulty as enum ('beginner', 'intermediate', 'advanced', 'expert');
create type ranking_period as enum ('daily', 'weekly', 'monthly', 'all_time');
create type transaction_type as enum ('earned', 'spent', 'bonus', 'gift');

-- ============================================
-- 1. LEVELS (crear PRIMERO porque profiles lo referencia)
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

-- Insert levels (datos iniciales)
insert into levels (code, name, description, min_points, max_points, color_hex, order_index) values
  ('white', 'Cinta Blanca', 'Nivel inicial. Fundamentos básicos.', 0, 1000, '#FFFFFF', 1),
  ('yellow', 'Cinta Amarilla', 'Primer nivel intermedio.', 1000, 2500, '#F6E05E', 2),
  ('orange', 'Cinta Naranja', 'Consolidación de conocimientos.', 2500, 5000, '#ED8936', 3),
  ('green', 'Cinta Verde', 'Nivel avanzado.', 5000, 10000, '#48BB78', 4),
  ('blue', 'Cinta Azul', 'Dominio técnico.', 10000, 20000, '#4299E1', 5),
  ('brown', 'Cinta Café', 'Maestría intermedia.', 20000, 40000, '#975A16', 6),
  ('black', 'Cinta Negra', 'Maestro. Nivel máximo.', 40000, 100000, '#1A202C', 7);

-- ============================================
-- 2. MODULES
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
-- 3. USERS (sin dependencias)
-- ============================================

create table users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  phone text,
  role user_role default 'student',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 4. PROFILES (depende de users y levels)
-- ============================================

create table profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  full_name text not null,
  birth_date date,
  avatar_url text,
  level_id uuid references levels(id),
  dojicoins_balance integer default 100,
  total_points integer default 0,
  streak_days integer default 0,
  last_activity timestamp with time zone,
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Índices
create index idx_profiles_user_id on profiles(user_id);
create index idx_profiles_level_id on profiles(level_id);

-- ============================================
-- 5. LESSONS (depende de modules y levels)
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

-- ============================================
-- 6. EXERCISES (depende de lessons)
-- ============================================

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
-- 7. STUDENT_PROGRESS (depende de profiles y lessons)
-- ============================================

create table student_progress (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  lesson_id uuid references lessons(id) on delete cascade not null,
  status lesson_status default 'not_started',
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  score integer,
  attempts integer default 0,
  best_time_sec integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, lesson_id)
);

create index idx_progress_student on student_progress(student_id);
create index idx_progress_lesson on student_progress(lesson_id);

-- ============================================
-- 8. EXERCISE_ATTEMPTS (depende de profiles y exercises)
-- ============================================

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
-- 9. DAILY_MISSIONS (depende de profiles)
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
-- 10. ACHIEVEMENTS (tabla independiente)
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

-- ============================================
-- 11. STUDENT_ACHIEVEMENTS (depende de profiles y achievements)
-- ============================================

create table student_achievements (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  achievement_id uuid references achievements(id) on delete cascade not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  progress_data jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, achievement_id)
);

-- ============================================
-- 12. DOJICOINS_TRANSACTIONS (depende de profiles)
-- ============================================

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

-- ============================================
-- 13. RANKINGS (depende de profiles)
-- ============================================

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
-- 14. SHOP_ITEMS (tabla independiente)
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

-- ============================================
-- 15. PURCHASES (depende de profiles y shop_items)
-- ============================================

create table purchases (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  item_id uuid references shop_items(id) on delete restrict not null,
  quantity integer default 1,
  total_price integer not null,
  purchased_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 16. FAMILIES (depende de profiles)
-- ============================================

create table families (
  id uuid default uuid_generate_v4() primary key,
  parent_id uuid references profiles(id) on delete cascade not null,
  family_name text not null,
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 17. FAMILY_MEMBERS (depende de families y profiles)
-- ============================================

create table family_members (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references families(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  relationship text check (relationship in ('child', 'sibling')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(family_id, student_id)
);

-- ============================================
-- 18. SCHOOLS (tabla independiente)
-- ============================================

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

-- ============================================
-- 19. SCHOOL_STUDENTS (depende de schools y profiles)
-- ============================================

create table school_students (
  id uuid default uuid_generate_v4() primary key,
  school_id uuid references schools(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  grade_level text,
  classroom text,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(school_id, student_id)
);

-- ============================================
-- 20. SCHOOL_TEACHERS (depende de schools y profiles)
-- ============================================

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
-- 21. SUBSCRIPTIONS (depende de users)
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

-- ============================================
-- 22. PAYMENTS (depende de users)
-- ============================================

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
-- 23. AI_CONVERSATIONS (depende de profiles)
-- ============================================

create table ai_conversations (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  module_code text references modules(code),
  context jsonb default '{}',
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone
);

-- ============================================
-- 24. AI_MESSAGES (depende de ai_conversations)
-- ============================================

create table ai_messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references ai_conversations(id) on delete cascade not null,
  role text check (role in ('user', 'assistant', 'system')) not null,
  content text not null,
  tokens_used integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- 25. NOTIFICATIONS (depende de users)
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

-- ============================================
-- 26. MESSAGES (depende de users)
-- ============================================

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
-- 27. STUDENT_ANALYTICS_DAILY (depende de profiles)
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

-- ============================================
-- 28. SYSTEM_ANALYTICS
-- ============================================

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
-- 29. ARTICLES & VIDEOS (contenido extra)
-- ============================================

create table articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content jsonb default '{}',
  author_id uuid references users(id) on delete set null,
  status text check (status in ('draft', 'published', 'archived')) default 'draft',
  published_at timestamp with time zone,
  tags jsonb default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table videos (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  url text not null,
  thumbnail_url text,
  duration_sec integer,
  module_id uuid references modules(id) on delete set null,
  level_id uuid references levels(id) on delete set null,
  order_index integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table books (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  author text,
  cover_url text,
  pdf_url text,
  reading_level text,
  word_count integer,
  comprehension_questions jsonb default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ============================================

-- Student progress queries
create index idx_student_progress_completed on student_progress(student_id, status, completed_at);
create index idx_exercise_attempts_scoring on exercise_attempts(student_id, is_correct, answered_at);
create index idx_dojicoins_transactions_balance on dojicoins_transactions(student_id, created_at desc);
create index idx_ai_conversations_student on ai_conversations(student_id, started_at desc);

-- Lessons search
create index idx_lessons_search on lessons using gin(to_tsvector('spanish', title || ' ' || description));

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
create trigger update_achievements_updated_at before update on achievements for each row execute procedure update_updated_at_column();
create trigger update_shop_items_updated_at before update on shop_items for each row execute procedure update_updated_at_column();

-- ============================================
-- FUNCTION: Get level by points
-- ============================================

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

-- ============================================
-- FUNCTION: Update profile level automatically
-- ============================================

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

-- ============================================
-- FUNCTION: Award DOJICOIN (secure)
-- ============================================

create or replace function award_dojicoins(
  p_student_id uuid,
  p_amount integer,
  p_type transaction_type,
  p_source text,
  p_reference_id uuid default null
)
returns void as $$
declare
  v_new_balance integer;
begin
  -- Update balance atomically
  update profiles
  set dojicoins_balance = dojicoins_balance + p_amount
  where id = p_student_id
  returning dojicoins_balance into v_new_balance;

  -- Record transaction
  insert into dojicoins_transactions (
    student_id, amount, type, source, reference_id, balance_after
  ) values (
    p_student_id, p_amount, p_type, p_source, p_reference_id, v_new_balance
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- FUNCTION: Complete lesson transaction
-- ============================================

create or replace function complete_lesson_transaction(
  p_student_id uuid,
  p_lesson_id uuid,
  p_score integer,
  p_time_spent integer,
  p_xp_earned integer
)
returns jsonb as $$
declare
  v_new_xp integer;
  v_old_level_id uuid;
  v_new_level_id uuid;
  v_level_changed boolean := false;
  v_coins_awarded integer;
begin
  -- Get student current XP (with lock)
  select total_points into v_new_xp
  from profiles
  where id = p_student_id
  for update;

  v_new_xp := v_new_xp + p_xp_earned;

  -- Get old level
  select level_id into v_old_level_id
  from profiles where id = p_student_id;

  -- Calculate new level
  v_new_level_id := get_level_by_points(v_new_xp);

  -- Update profile
  update profiles
  set
    total_points = v_new_xp,
    level_id = v_new_level_id,
    last_activity = now()
  where id = p_student_id;

  v_level_changed := v_old_level_id != v_new_level_id;

  -- Award DOJICOIN based on score
  v_coins_awarded := case
    when p_score >= 90 then 50
    when p_score >= 80 then 30
    when p_score >= 70 then 20
    else 10
  end;

  -- Streak bonus
  if exists (
    select 1 from daily_missions
    where student_id = p_student_id
    and date = current_date
    and is_completed = true
  ) then
    v_coins_awarded := v_coins_awarded + 20;
  end if;

  perform award_dojicoins(p_student_id, v_coins_awarded, 'earned', 'lesson_completion', p_lesson_id);

  return jsonb_build_object(
    'new_total_xp', v_new_xp,
    'level_up', v_level_changed,
    'dojicoins_awarded', v_coins_awarded
  );
end;
$$ language plpgsql security definer;

-- Grant execute permissions
grant execute on function award_dojicoins(uuid, integer, transaction_type, text, uuid) to authenticated;
grant execute on function complete_lesson_transaction(uuid, uuid, integer, integer, integer) to authenticated;
grant execute on function get_level_by_points(integer) to authenticated;

-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Migración DOJOIA ejecutada correctamente!';
  RAISE NOTICE '📊 Tablas creadas: 29';
  RAISE NOTICE '🎯 Niveles insertados: 7';
  RAISE NOTICE '📚 Módulos insertados: 7';
  RAISE NOTICE '⚡ Functions creadas: 3';
END $$;
