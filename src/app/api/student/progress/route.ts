import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateRequest } from '@/lib/auth/validate'
import { calculateXP } from '@/lib/services/openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/student/progress
 * Get student's overall progress and stats
 */
export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest(request)

    // Get profile with level
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        level:levels(*),
        progress:student_progress(
          *,
          lesson:lessons(*)
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (profileError) throw profileError

    // Get module progress
    const { data: moduleProgress } = await supabase
      .rpc('get_student_module_progress', {
        p_student_id: user.id,
      })

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('student_progress')
      .select(`
        *,
        lesson:lessons(
          id,
          title,
          module_id,
          module:modules(id, name, code, color_hex)
        )
      `)
      .eq('student_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      profile,
      moduleProgress: moduleProgress || [],
      recentActivity: recentActivity || [],
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/student/lessons
 * Get all lessons with progress for current student
 */
export async function GET_LESSONS(request: NextRequest) {
  try {
    const { user } = await validateRequest(request)
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('module_id')
    const levelId = searchParams.get('level_id')

    let query = supabase
      .from('lessons')
      .select(`
        *,
        module:modules(*),
        level:levels(*),
        progress:student_progress(*)
      `)

    if (moduleId) query = query.eq('module_id', moduleId)
    if (levelId) query = query.eq('level_id', levelId)

    query = query.order('order_index')

    const { data: lessons, error } = await query

    if (error) throw error

    // Map progress to lesson
    const mappedLessons = lessons.map((lesson) => ({
      ...lesson,
      progress: lesson.progress?.[0] || null,
    }))

    return NextResponse.json({ lessons: mappedLessons })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/student/lessons/[id]/start
 * Mark lesson as started
 */
export async function POST_LESSON_START(request: NextRequest, { params }: any) {
  try {
    const { user } = await validateRequest(request)
    const { id } = params

    // Check if lesson exists and is unlocked
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single()

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: 'Lección no encontrada' },
        { status: 404 }
      )
    }

    if (lesson.is_locked) {
      // Check unlock criteria
      const criteria = lesson.unlock_criteria
      if (criteria?.lesson_id) {
        const { data: prereq } = await supabase
          .from('student_progress')
          .select('score')
          .eq('student_id', user.id)
          .eq('lesson_id', criteria.lesson_id)
          .single()

        if (!prereq || prereq.score < (criteria.min_score || 80)) {
          return NextResponse.json(
            { error: 'Debes completar la lección anterior' },
            { status: 403 }
          )
        }
      }
    }

    // Create progress entry
    const { data: progress, error: progressError } = await supabase
      .from('student_progress')
      .insert({
        student_id: user.id,
        lesson_id: id,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        attempts: 1,
      })
      .select()
      .single()

    if (progressError) throw progressError

    return NextResponse.json({ progress })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/student/lessons/[id]/complete
 * Complete a lesson with final score
 */
export async function POST_LESSON_COMPLETE(request: NextRequest, { params }: any) {
  try {
    const { user } = await validateRequest(request)
    const { id } = params
    const { score, timeSpentSec } = await request.json()

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return NextResponse.json(
        { error: 'Puntuación inválida' },
        { status: 400 }
      )
    }

    // Get lesson for XP reward
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single()

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: 'Lección no encontrada' },
        { status: 404 }
      )
    }

    // Calculate XP
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_days')
      .eq('user_id', user.id)
      .single()

    const streakBonus = (profile?.streak_days || 0) >= 3
    const xpEarned = calculateXP(
      lesson.xp_reward,
      score,
      timeSpentSec < lesson.est_duration_min * 60, // Completed faster than estimated
      streakBonus
    )

    // Start transaction
    const { data: result, error: updateError } = await supabase.rpc(
      'complete_lesson_transaction',
      {
        p_student_id: user.id,
        p_lesson_id: id,
        p_score: score,
        p_time_spent: timeSpentSec,
        p_xp_earned: xpEarned,
      }
    )

    if (updateError) throw updateError

    // Check for achievements
    await checkAndAwardAchievements(user.id, { lesson_completed: true })

    return NextResponse.json({
      success: true,
      xp_earned: xpEarned,
      new_total_xp: result.new_total_xp,
      level_up: result.level_up,
      achievements: result.new_achievements,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/student/exercises/[id]/answer
 * Submit answer for an exercise
 */
export async function POST_EXERCISE_ANSWER(request: NextRequest, { params }: any) {
  try {
    const { user } = await validateRequest(request)
    const { id } = params
    const { answer, timeSpentMs } = await request.json()

    // Get exercise
    const { data: exercise, error: exError } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single()

    if (exError || !exercise) {
      return NextResponse.json(
        { error: 'Ejercicio no encontrado' },
        { status: 404 }
      )
    }

    const isCorrect = answer === exercise.correct_answer

    // Record attempt
    const { data: attempt, error: attError } = await supabase
      .from('exercise_attempts')
      .insert({
        student_id: user.id,
        exercise_id: id,
        answer,
        is_correct: isCorrect,
        time_spent_ms: timeSpentMs,
        answered_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (attError) throw attError

    // If correct, award small DOJICOIN bonus
    if (isCorrect) {
      const coinsAwarded = Math.ceil(exercise.points_value / 10)

      await supabase.rpc('award_dojicoins', {
        p_student_id: user.id,
        p_amount: coinsAwarded,
        p_type: 'earned',
        p_source: 'exercise',
        p_reference_id: attempt.id,
      })
    }

    return NextResponse.json({
      correct: isCorrect,
      points: isCorrect ? exercise.points_value : 0,
      explanation: exercise.explanation,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * Helper: Check and award achievements
 */
async function checkAndAwardAchievements(
  studentId: string,
  progress: { lesson_completed?: boolean }
) {
  // Get current counts
  const { data: stats } = await supabase.rpc(
    'get_student_achievement_progress',
    { p_student_id: studentId }
  )

  if (!stats) return []

  const newAchievements = []

  // Check first lesson
  if (progress.lesson_completed && stats.lessons_completed === 1) {
    newAchievements.push('first_lesson')
  }

  // Check streak
  if (stats.streak_days >= 7) {
    newAchievements.push('streak_7')
  }
  if (stats.streak_days >= 30) {
    newAchievements.push('streak_30')
  }

  // Check total XP
  if (stats.total_xp >= 1000) {
    newAchievements.push('xp_1000')
  }

  // Check level up
  if (progress.level_up) {
    newAchievements.push('level_up')
  }

  // Award each achievement
  for (const code of newAchievements) {
    await supabase.rpc('award_achievement', {
      p_student_id: studentId,
      p_achievement_code: code,
    })
  }

  return newAchievements
}
