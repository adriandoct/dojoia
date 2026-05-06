'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Lesson, StudentProgress } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { BookOpen, Lock, CheckCircle, Play } from 'lucide-react'

export default function MathPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState<(Lesson & { progress?: StudentProgress })[]>([])
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)

  useEffect(() => {
    if (status === 'loading' || !session) return
    fetchLessons()
  }, [session, status])

  async function fetchLessons() {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          progress:student_progress(*),
          module:modules(*),
          level:levels(*)
        `)
        .eq('module.code', 'math')
        .order('order_index')
        .limit(10)

      if (error) throw error

      if (data) {
        const formattedLessons = data.map((lesson: any) => ({
          id: lesson.id,
          module_id: lesson.module_id,
          level_id: lesson.level_id,
          title: lesson.title,
          description: lesson.description,
          content: lesson.content,
          order_index: lesson.order_index,
          est_duration_min: lesson.est_duration_min,
          xp_reward: lesson.xp_reward,
          is_locked: lesson.is_locked,
          unlock_criteria: lesson.unlock_criteria,
          module: lesson.module,
          level: lesson.level,
          progress: Array.isArray(lesson.progress)
            ? lesson.progress[0]
            : lesson.progress ?? undefined,
        } as Lesson & { progress?: StudentProgress }))

        setLessons(formattedLessons)

        const firstAvailable = formattedLessons.find(
          (l) => !l.is_locked
        )

        if (firstAvailable) {
          setActiveLesson(firstAvailable)
        }
      }
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="student">
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Matemáticas</h1>
          <p className="text-gray-600 mt-2">
            Aprende matemáticas de manera divertida y progresiva
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{lesson.title}</CardTitle>
                  {lesson.is_locked ? (
                    <Lock className="h-5 w-5 text-gray-400" />
                  ) : lesson.progress?.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Play className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{lesson.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {lesson.level?.name || 'Nivel desconocido'}
                  </Badge>
                  <Button
                    disabled={lesson.is_locked}
                    onClick={() => {
                      // TODO: Navigate to lesson
                      console.log('Start lesson:', lesson.id)
                    }}
                  >
                    {lesson.is_locked ? 'Bloqueado' : 'Comenzar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {lessons.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay lecciones disponibles
            </h3>
            <p className="text-gray-600">
              Las lecciones de matemáticas estarán disponibles pronto.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}