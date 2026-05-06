'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Profile, Level, Lesson, StudentProgress, Module } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProgressRing, BeltProgress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import {
  Trophy,
  Target,
  Flame,
  Coins,
  TrendingUp,
  Calendar,
  ChevronRight,
  Sparkles,
  Zap,
  BookOpen,
  Users,
} from 'lucide-react'
import { getLevelColor, formatNumber } from '@/lib/utils/helpers'

export default function StudentDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [level, setLevel] = useState<Level | null>(null)
  const [recentLessons, setRecentLessons] = useState<(Lesson & { progress?: Partial<StudentProgress> })[]>([])
  const [dailyMission, setDailyMission] = useState<{
    missions_completed: number
    total_missions: number
    is_completed: boolean
  } | null>(null)

  useEffect(() => {
    if (status === 'loading' || !session) return

    async function fetchData() {
      const userId = session?.user?.id
      if (!userId) return

      try {
        // Fetch student profile with level
        const { data: profileData, error: profileError } = await (supabase as any)
          .from('profiles')
          .select(`
            *,
            level:levels (*)
          `)
          .eq('user_id', userId)
          .single()

        if (profileError || !profileData) throw profileError || new Error('Perfil no encontrado')
        const typedProfileData = profileData as Profile
        setProfile(typedProfileData)
        setLevel(typedProfileData.level || null)

        // Fetch today's daily mission progress
        const today = new Date().toISOString().split('T')[0]
        const { data: missionData } = await supabase
          .from('daily_missions')
          .select('*')
          .eq('student_id', typedProfileData.id)
          .eq('date', today)
          .maybeSingle()

        setDailyMission(missionData || {
          missions_completed: 0,
          total_missions: 5,
          is_completed: false,
        })

        // Fetch recent lessons in progress
        const { data: lessonsData } = await supabase
          .from('student_progress')
          .select(`
            id,
            student_id,
            lesson_id,
            status,
            started_at,
            completed_at,
            attempts,
            lesson:lessons (
              id,
              title,
              description,
              module_id,
              level_id,
              xp_reward,
              est_duration_min,
              is_locked,
              module:modules (id, name, code, icon_url, color_hex),
              level:levels (id, name, code, color_hex)
            )
          `)
          .eq('student_id', typedProfileData.id)
          .neq('status', 'not_started')
          .order('started_at', { ascending: false })
          .limit(5)

        if (lessonsData) {
          setRecentLessons(
            (lessonsData as any[]).map((item) => ({
              ...(item.lesson as Lesson),
              progress: {
                status: item.status,
                started_at: item.started_at,
                completed_at: item.completed_at,
                attempts: item.attempts,
              },
            }))
          )
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, status])

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout userRole={session?.user.role as any}>
        <div className="flex items-center justify-center h-96">
          <Spinner size="xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (!profile || !level) {
    return (
      <DashboardLayout userRole={session?.user.role as any}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Perfil no encontrado</h2>
          <p className="text-gray-600 mt-2">
            Por favor completa tu perfil para continuar.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push('/dashboard/student/settings')}
          >
            Completar perfil
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  // Calculate XP progress
  const totalXP = profile.total_points
  const minXP = level.min_points
  const maxXP = level.max_points
  const progressPercentage = Math.min(100, Math.max(0, ((totalXP - minXP) / (maxXP - minXP)) * 100))
  const xpToNextLevel = maxXP - totalXP

  // Get next level
  const nextLevelName = totalXP >= maxXP ? '¡Nivel Máximo!' : `Falta ${xpToNextLevel.toLocaleString()} XP`

  return (
    <DashboardLayout userRole={session?.user.role as any}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              ¡Hola, {profile.full_name.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Continúa tu entrenamiento hoy
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Avatar
              src={profile.avatar_url}
              fallback={profile.full_name}
              size="lg"
              levelColor={level.color_hex}
            />
            <div>
              <Badge variant={level.code as any} size="lg" className="capitalize">
                {level.name}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                Racha: {profile.streak_days} días 🔥
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* XP Card */}
          <Card hover gradient>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">XP Total</p>
                  <p className="text-3xl font-bold text-dojo-black mt-1">
                    {formatNumber(totalXP)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{nextLevelName}</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DOJICOIN Card */}
          <Card hover>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">DOJICOIN</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">
                    {formatNumber(profile.dojicoins_balance)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Gana monedas completando lecciones 🎯
              </p>
            </CardContent>
          </Card>

          {/* Lessons Completed */}
          <Card hover>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Lecciones</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {profile.total_points > 0 ? Math.floor(profile.total_points / 100) : 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Sigue aprendiendo cada día 📚
              </p>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card hover>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Racha Actual</p>
                  <p className="text-3xl font-bold text-dojo-red mt-1">
                    {profile.streak_days}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                  <Flame className="w-6 h-6 text-dojo-red" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ¡No rompas tu racha! 🔥
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Continue Learning */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-gray-900">
                Continuar Aprendiendo
              </h2>
              <Link href="/dashboard/student/courses">
                <Button variant="ghost" size="sm" className="text-dojo-red">
                  Ver todo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {recentLessons.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="w-12 h-12 text-dojo-red mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Empieza tu primera lección
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Selecciona un módulo para comenzar tu formación
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push('/dashboard/student/courses')}
                  >
                    Explorar módulos
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentLessons.map((lesson) => {
                  const moduleColor = lesson.module?.color_hex || '#6B7280'
                  const isCompleted = lesson.progress?.status === 'completed'
                  const isInProgress = lesson.progress?.status === 'in_progress'

                  return (
                    <Card
                      key={lesson.id}
                      hover
                      className="cursor-pointer"
                      onClick={() => router.push(`/dashboard/student/lesson/${lesson.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Module icon */}
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                            style={{ backgroundColor: `${moduleColor}20` }}
                          >
                            {lesson.module?.icon_url || '📚'}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm text-gray-500">
                                {lesson.module?.name}
                              </p>
                              {isCompleted && (
                                <Badge variant="success" size="sm">Completado</Badge>
                              )}
                              {isInProgress && (
                                <Badge variant="warning" size="sm">En progreso</Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {lesson.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {lesson.description}
                            </p>
                          </div>

                          {/* XP and time */}
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1 text-sm text-amber-600 font-medium">
                              <Trophy className="w-4 h-4" />
                              {lesson.xp_reward} XP
                            </div>
                            <p className="text-xs text-gray-500">
                              {lesson.est_duration_min} min
                            </p>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Daily Mission */}
            <Card className="bg-gradient-to-r from-dojo-red to-dojo-redDark text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target className="w-5 h-5" />
                  Misión Diaria
                </CardTitle>
                <p className="text-white/80">
                  Completa {dailyMission?.total_missions} tareas para ganar recompensas
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-white transition-all duration-700"
                        style={{
                          width: `${dailyMission ? (dailyMission.missions_completed / dailyMission.total_missions) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-white/90">
                      {dailyMission?.missions_completed || 0} / {dailyMission?.total_missions} completadas
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {dailyMission?.missions_completed === dailyMission?.total_missions ? '✅' : '🎯'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Rankings */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/student/math')}
                >
                  <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                  DOJO MATH
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/student/ai-coach')}
                >
                  <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                  AI Coach
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/student/shop')}
                >
                  <Coins className="w-4 h-4 mr-2 text-amber-500" />
                  Tienda DOJICOIN
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/student/achievements')}
                >
                  <Trophy className="w-4 h-4 mr-2 text-blue-500" />
                  Mis Logros
                </Button>
              </CardContent>
            </Card>

            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progreso de Nivel</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <ProgressRing
                  progress={progressPercentage}
                  size={150}
                  levelCode={level.code}
                  showPercentage
                />
                <p className="text-center mt-4 font-medium text-gray-700">
                  {level.name.toUpperCase()}
                </p>
                <p className="text-sm text-gray-500">
                  {level.code === 'black'
                    ? '¡Nivel máximo alcanzado!'
                    : `${xpToNextLevel.toLocaleString()} XP para el siguiente nivel`}
                </p>
              </CardContent>
            </Card>

            {/* Ranking */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top 5 Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((position) => (
                    <div
                      key={position}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        position === 1
                          ? 'bg-amber-50 border border-amber-200'
                          : position === 2
                          ? 'bg-gray-50'
                          : 'bg-orange-50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          position === 1
                            ? 'bg-yellow-400 text-yellow-900'
                            : position === 2
                            ? 'bg-gray-300 text-gray-700'
                            : 'bg-orange-300 text-orange-900'
                        }`}
                      >
                        {position}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Estudiante {position}
                        </p>
                        <p className="text-xs text-gray-500">
                          {10000 * position} XP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
