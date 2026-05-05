'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'
import type { Lesson, Exercise, StudentProgress } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Zap,
  Timer,
  CheckCircle,
  XCircle,
  RotateCcw,
  Volume2,
} from 'lucide-react'

export default function MathModulePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState<(Lesson & { progress?: StudentProgress })[]>([])
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [lessonCompleted, setLessonCompleted] = useState(false)

  useEffect(() => {
    fetchLessons()
  }, [])

  useEffect(() => {
    if (activeLesson) {
      fetchExercisesForLesson(activeLesson.id)
      setStartTime(new Date())
      // Start timer
      const timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [activeLesson])

  async function fetchLessons() {
    try {
      const { data } = await supabase
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

      if (data) {
        setLessons(
          data.map((lesson) => ({
            ...lesson,
            progress: lesson.progress?.[0],
          }))
        )
        // Start with first non-locked lesson
        const firstAvailable = data.find((l) => !l.is_locked)
        if (firstAvailable) setActiveLesson(firstAvailable)
      }
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchExercisesForLesson(lessonId: string) {
    try {
      const { data } = await supabase
        .from('exercises')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('id')

      if (data) {
        setExercises(data)
        setCurrentExerciseIndex(0)
        setSelectedAnswer(null)
        setShowResult(false)
        setScore(0)
        setTimeSpent(0)
        setLessonCompleted(false)
      }
    } catch (error) {
      console.error('Error fetching exercises:', error)
    }
  }

  const currentExercise = exercises[currentExerciseIndex]
  const totalExercises = exercises.length
  const progressPercentage = totalExercises > 0 ? ((currentExerciseIndex) / totalExercises) * 100 : 0

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return
    setSelectedAnswer(answer)
  }

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentExercise || !session) return

    const correct = selectedAnswer === currentExercise.correct_answer
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore((prev) => prev + currentExercise.points_value)
    }

    // Record attempt
    try {
      await supabase.from('exercise_attempts').insert({
        student_id: session.user.id,
        exercise_id: currentExercise.id,
        answer: selectedAnswer,
        is_correct: correct,
        time_spent_ms: timeSpent * 1000,
        answered_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error recording attempt:', error)
    }
  }

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      // Lesson completed
      completeLesson()
    }
  }

  const completeLesson = async () => {
    if (!activeLesson || !session) return

    const { error } = await supabase.from('student_progress').upsert({
      student_id: session.user.id,
      lesson_id: activeLesson.id,
      status: 'completed',
      started_at: startTime?.toISOString(),
      completed_at: new Date().toISOString(),
      score: Math.round((score / (totalExercises * 100)) * 100), // Percentage
      attempts: 1,
    })

    if (!error) {
      setLessonCompleted(true)
      // Refresh lessons to update progress
      fetchLessons()
    }
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-ES'
      speechSynthesis.speak(utterance)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole={session?.user.role as any}>
        <div className="flex items-center justify-center h-96">
          <Spinner size="xl" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole={session?.user.role as any}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              DOJO MATH
            </h1>
            <p className="text-gray-600 mt-1">
              {activeLesson?.title || 'Selecciona una lección'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="info" className="text-lg px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              {score} XP
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Timer className="w-4 h-4 mr-2" />
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Lesson list */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold mb-4">Lecciones</h3>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => {
                    const isActive = activeLesson?.id === lesson.id
                    const isCompleted = lesson.progress?.status === 'completed'
                    const isLocked = lesson.is_locked && !isActive

                    return (
                      <button
                        key={lesson.id}
                        disabled={isLocked}
                        onClick={() => {
                          setActiveLesson(lesson)
                          fetchExercisesForLesson(lesson.id)
                        }}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          isActive
                            ? 'bg-dojo-red text-white shadow-md'
                            : isCompleted
                            ? 'bg-green-50 border border-green-200'
                            : isLocked
                            ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              {isCompleted && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              {isLocked && (
                                <span className="text-xs text-gray-500">
                                  🔒 Completa anterior
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Exercise Area */}
          <div className="lg:col-span-3 space-y-6">
            {currentExercise ? (
              <>
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Ejercicio {currentExerciseIndex + 1} de {totalExercises}</span>
                    <span>{Math.round(progressPercentage)}% completado</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-dojo-red to-dojo-redDark transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Exercise Card */}
                <Card className="overflow-hidden">
                  <CardContent className="p-8">
                    {/* Question */}
                    <div className="mb-8">
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="warning" size="sm">
                          {currentExercise.difficulty === 'beginner' ? '🌱 Principiante' :
                           currentExercise.difficulty === 'intermediate' ? '🌿 Intermedio' :
                           currentExercise.difficulty === 'advanced' ? '🌳 Avanzado' : '🏆 Experto'}
                        </Badge>
                        <button
                          onClick={() => speakText(currentExercise.question)}
                          className="p-2 rounded-full hover:bg-gray-100"
                          title="Leer en voz alta"
                        >
                          <Volume2 className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>

                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {currentExercise.question}
                      </h2>

                      {currentExercise.options && (
                        <div className="space-y-3">
                          {currentExercise.options.map((option, index) => {
                            const isSelected = selectedAnswer === option
                            const showCorrect = showResult && option === currentExercise.correct_answer
                            const showWrong = showResult && isSelected && !isCorrect

                            return (
                              <button
                                key={index}
                                onClick={() => handleAnswerSelect(option)}
                                disabled={showResult}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                  showCorrect
                                    ? 'border-green-500 bg-green-50'
                                    : showWrong
                                    ? 'border-red-500 bg-red-50'
                                    : isSelected
                                    ? 'border-dojo-red bg-dojo-red/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                    showCorrect
                                      ? 'bg-green-500 text-white'
                                      : showWrong
                                      ? 'bg-red-500 text-white'
                                      : isSelected
                                      ? 'bg-dojo-red text-white'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {showCorrect ? '✓' : showWrong ? '✗' : String.fromCharCode(65 + index)}
                                  </div>
                                  <span className="text-lg">{option}</span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Feedback */}
                    {showResult && (
                      <div className={`p-4 rounded-xl mb-6 ${
                        isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <h4 className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                              {isCorrect ? '¡Correcto! 🎉' : 'Incorrecto 😅'}
                            </h4>
                            <p className="text-sm mt-1 text-gray-700">
                              {currentExercise.explanation}
                            </p>
                            {!isCorrect && (
                              <p className="text-sm font-medium mt-2">
                                Respuesta correcta: {currentExercise.correct_answer}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-between items-center">
                      <div>
                        {!showResult && currentExerciseIndex === 0 && (
                          <p className="text-sm text-gray-500">
                            💡 Consejo: Lee cuidadosamente antes de responder
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        {!showResult ? (
                          <Button
                            onClick={handleSubmitAnswer}
                            disabled={!selectedAnswer}
                            size="lg"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Verificar
                          </Button>
                        ) : (
                          <Button
                            onClick={handleNextExercise}
                            size="lg"
                            variant={isCorrect ? 'success' : 'default'}
                          >
                            {currentExerciseIndex < totalExercises - 1 ? (
                              <>
                                Siguiente
                                <ChevronRight className="w-4 h-4 ml-2" />
                              </>
                            ) : (
                              <>
                                <Trophy className="w-4 h-4 mr-2" />
                                Completar Lección
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-500">Ejercicios</p>
                      <p className="text-2xl font-bold">
                        {currentExerciseIndex + 1}/{totalExercises}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-500">Aciertos</p>
                      <p className="text-2xl font-bold text-green-600">{score} XP</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-500">Tiempo</p>
                      <p className="text-2xl font-bold text-dojo-red">
                        {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">
                    No hay ejercicios disponibles para esta lección.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
