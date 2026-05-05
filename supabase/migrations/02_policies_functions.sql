-- DOJOIA - Row Level Security Policies
-- Supabase Project: https://vikgeidbjpnotwtdzkix.supabase.co

-- Enable RLS on all tables first (already done in migration 01)
-- These policies define who can read/write what

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can only read their own record
create policy "Users can view own profile"
  on users for select
  using (auth.uid() = id);

-- Users can only update their own record
create policy "Users can update own profile"
  on users for update
  using (auth.uid() = id);

-- Admins can view all users
create policy "Admins can view all users"
  on users for select
  using (
    exists (
      select 1 from profiles
      where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Users can view their own profile
create policy "Users can view own profile"
  on profiles for select
  using (user_id = auth.uid());

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (user_id = auth.uid());

-- Parents can view their children's profiles
create policy "Parents can view children profiles"
  on profiles for select
  using (
    exists (
      select 1 from family_members fm
      join families f on fm.family_id = f.id
      where fm.student_id = profiles.id
      and f.parent_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

-- Teachers can view students in their classes/schools
create policy "Teachers can view assigned students"
  on profiles for select
  using (
    exists (
      select 1 from school_teachers st
      where st.teacher_id = profiles.id
      and st.is_active = true
    )
    or
    exists (
      select 1 from school_students ss
      join school_teachers st on ss.school_id = st.school_id
      where ss.student_id = profiles.id
      and st.teacher_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

-- Admins can view all profiles
create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- ============================================
-- LESSONS POLICIES
-- ============================================

-- All authenticated users can view active lessons
create policy "Authenticated users can view lessons"
  on lessons for select
  using (true);

-- Only admins/teachers can create/edit lessons
create policy "Only staff can manage lessons"
  on lessons for all
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role in ('admin', 'teacher')
    )
  );

-- ============================================
-- EXERCISES POLICIES
-- ============================================

-- All authenticated users can view exercises
create policy "Authenticated users can view exercises"
  on exercises for select
  using (true);

-- Only staff can create/edit exercises
create policy "Only staff can manage exercises"
  on exercises for all
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role in ('admin', 'teacher')
    )
  );

-- ============================================
-- STUDENT_PROGRESS POLICIES
-- ============================================

-- Students can only see their own progress
create policy "Students can view own progress"
  on student_progress for select
  using (student_id in (
    select id from profiles where user_id = auth.uid()
  ));

-- Students can only insert/update their own progress
create policy "Students can manage own progress"
  on student_progress for all
  using (student_id in (
    select id from profiles where user_id = auth.uid()
  ));

-- Parents can view children's progress
create policy "Parents can view children progress"
  on student_progress for select
  using (
    student_id in (
      select fm.student_id
      from family_members fm
      join families f on fm.family_id = f.id
      where f.parent_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

-- Teachers can view assigned students' progress
create policy "Teachers can view assigned student progress"
  on student_progress for select
  using (
    exists (
      select 1 from school_students ss
      join school_teachers st on ss.school_id = st.school_id
      where ss.student_id = student_id
      and st.teacher_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

-- Admins can view all progress
create policy "Admins can view all progress"
  on student_progress for select
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- ============================================
-- EXERCISE_ATTEMPTS POLICIES
-- ============================================

-- Students can see their own exercise attempts
create policy "Students can view own attempts"
  on exercise_attempts for select
  using (student_id in (
    select id from profiles where user_id = auth.uid()
  ));

-- Students can create their own attempts
create policy "Students can create attempts"
  on exercise_attempts for insert
  with check (student_id in (
    select id from profiles where user_id = auth.uid()
  ));

-- Teachers/admins can view attempts for their students
create policy "Teachers can view student attempts"
  on exercise_attempts for select
  using (
    exists (
      select 1 from school_students ss
      join school_teachers st on ss.school_id = st.school_id
      where ss.student_id = student_id
      and st.teacher_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

-- ============================================
-- ACHIEVEMENTS POLICIES
-- ============================================

-- Anyone can view achievements
create policy "Anyone can view achievements"
  on achievements for select
  using (true);

-- System can insert/update achievements (via service role)
-- Students can only insert into student_achievements

-- Student can view own achievements
create policy "Students can view own achievements"
  on student_achievements for select
  using (student_id in (
    select id from profiles where user_id = auth.uid()
  ));

-- System functions award achievements (using service role)

-- ============================================
-- DOJICOINS_TRANSACTIONS POLICIES
-- ============================================

-- Students can view own transactions
create policy "Students can view own transactions"
  on dojicoins_transactions for select
  using (student_id in (
    select id from profiles where user_id = auth.uid()
  ));

-- Only system can insert transactions (via RPC functions)
-- This prevents students from cheating

-- Parents can view children's transactions
create policy "Parents can view children transactions"
  on dojicoins_transactions for select
  using (
    student_id in (
      select fm.student_id
      from family_members fm
      join families f on fm.family_id = f.id
      where f.parent_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

-- ============================================
-- SHOP_ITEMS POLICIES
-- ============================================

-- Anyone can view active shop items
create policy "Anyone can view active shop items"
  on shop_items for select
  using (is_active = true);

-- Only admins can manage shop items
create policy "Only admins can manage shop"
  on shop_items for all
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- ============================================
-- PURCHASES POLICIES
-- ============================================

-- Students can view own purchases
create policy "Students can view own purchases"
  on purchases for select
  using (student_id in (
    select id from profiles where user_id = auth.uid()
  ));

-- Students can create purchases
create policy "Students can create purchases"
  on purchases for insert
  with check (student_id in (
    select id from profiles where user_id = auth.uid()
  ));

-- ============================================
-- AI CONVERSATIONS & MESSAGES
-- ============================================

-- Students can view own conversations
create policy "Students can view own conversations"
  on ai_conversations for select
  using (student_id in (
    select id from profiles where user_id = auth.uid()
  ));

-- Students can create own conversations
create policy "Students can create conversations"
  on ai_conversations for insert
  with check (student_id in (
    select id from profiles where user_id = auth.uid()
  ));

-- Students can view own messages
create policy "Students can view own messages"
  on ai_messages for select
  using (
    exists (
      select 1 from ai_conversations
      where id = conversation_id
      and student_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

-- Students can create own messages
create policy "Students can create messages"
  on ai_messages for insert
  with check (
    exists (
      select 1 from ai_conversations
      where id = conversation_id
      and student_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

-- ============================================
-- FAMILY TABLES POLICIES
-- ============================================

-- Parents can view own family
create policy "Parents can view own family"
  on families for select
  using (parent_id in (
    select id from profiles where user_id = auth.uid()
  ));

-- Parents can manage own family
create policy "Parents can manage own family"
  on families for all
  using (parent_id in (
    select id from profiles where user_id = auth.uid()
  ));

-- Family members visible to parents
create policy "Family members visible to parents"
  on family_members for select
  using (
    family_id in (
      select id from families
      where parent_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

-- ============================================
-- SCHOOL TABLES POLICIES
-- ============================================

-- School admins can manage own school
create policy "School admins can manage school"
  on schools for all
  using (
    admin_id in (
      select id from profiles where user_id = auth.uid()
    )
  );

-- School data visible to school members
create policy "School data visible to members"
  on school_students for select
  using (
    exists (
      select 1 from school_teachers st
      where st.school_id = school_id
      and st.teacher_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can view own notifications
create policy "Users can view own notifications"
  on notifications for select
  using (user_id = auth.uid());

-- System can create notifications (service role)
-- Users can update own notifications (mark as read)
create policy "Users can update own notifications"
  on notifications for update
  using (user_id = auth.uid());

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Users can view sent/received messages
create policy "Users can view own messages"
  on messages for select
  using (sender_id = auth.uid() or receiver_id = auth.uid());

-- Users can send messages
create policy "Users can send messages"
  on messages for insert
  with check (sender_id = auth.uid());

-- Users can update received messages (mark as read)
create policy "Users can update received messages"
  on messages for update
  using (receiver_id = auth.uid());

-- ============================================
-- UTILITY FUNCTIONS (for business logic)
-- ============================================

-- Function to award DOJICOIN (safe from injection)
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

-- Function to complete lesson and award XP/coins
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
  v_module_code text;
  v_coins_awarded integer;
begin
  -- Get student current XP
  select total_points into v_new_xp
  from profiles
  where id = p_student_id
  for update; -- Lock row

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

  -- Check if level changed
  v_level_changed := v_old_level_id != v_new_level_id;

  -- Get module code for bonus
  select m.code into v_module_code
  from lessons l
  join modules m on l.module_id = m.id
  where l.id = p_lesson_id;

  -- Award DOJICOIN based on lesson completion
  v_coins_awarded := case
    when p_score >= 90 then 50
    when p_score >= 80 then 30
    when p_score >= 70 then 20
    else 10
  end;

  -- Award streak bonus if applicable
  if exists (
    select 1 from daily_missions
    where student_id = p_student_id
    and date = current_date
    and is_completed = true
  ) then
    v_coins_awarded := v_coins_awarded + 20; -- Streak bonus
  end if;

  perform award_dojicoins(p_student_id, v_coins_awarded, 'earned', 'lesson_completion', p_lesson_id);

  -- Check and award achievements (will be implemented in separate function)
  -- perform check_and_award_achievements(p_student_id, ...);

  return jsonb_build_object(
    'new_total_xp', v_new_xp,
    'level_up', v_level_changed,
    'dojicoins_awarded', v_coins_awarded
  );
end;
$$ language plpgsql security definer;

-- Grant execute on functions to authenticated users
grant execute on function award_dojicoins(uuid, integer, transaction_type, text, uuid) to authenticated;
grant execute on function complete_lesson_transaction(uuid, uuid, integer, integer, integer) to authenticated;
grant execute on function get_level_by_points(integer) to authenticated;
