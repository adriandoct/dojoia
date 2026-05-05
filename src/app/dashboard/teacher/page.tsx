'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import {
  Users,
  BookOpen,
  Trophy,
  TrendingUp,
  Calendar,
  Bell,
  Plus,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function TeacherDashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeClasses: 0,
    avgPerformance: 0,
    pendingTasks: 0,
  })
  const [recentStudents, setRecentStudents] = useState([
    {
      id: '1',
      name: 'María López',
      avatar_url: null,
      level: { code: 'yellow', name: 'Cinta Amarilla' },
      avgScore: 94,
      lastActive: new Date().toISOString(),
      lessonsCompleted: 52,
    },
    {
      id: '2',
      name: 'Carlos Ruiz',
      avatar_url: null,
      level: { code: 'green', name: 'Cinta Verde' },
      avgScore: 88,
      lastActive: new Date().toISOString(),
      lessonsCompleted: 78,
    },
    {
      id: '3',
      name: 'Ana Martínez',
      avatar_url: null,
      level: { code: 'orange', name: 'Cinta Naranja' },
      avgScore: 91,
      lastActive: new Date(Date.now() - 86400000).toISOString(),
      lessonsCompleted: 45,
    },
  ])
  const [upcomingClasses, setUpcomingClasses] = useState([
    {
      id: '1',
      title: 'DOJO MATH - Álgebra básica',
      time: new Date(Date.now() + 3600000).toISOString(),
      students: 12,
      maxStudents: 15,
    },
    {
      id: '2',
      title: 'DOJO ENGLISH - Conversación',
      time: new Date(Date.now() + 7200000).toISOString(),
      students: 10,
      maxStudents: 12,
    },
  ])

  const getLevelColor = (code: string) => {
    const colors: Record<string, string> = {
      white: '#FFFFFF',
      yellow: '#F6E05E',
      orange: '#ED8936',
      green: '#48BB78',
      blue: '#4299E1',
      brown: '#975A16',
      black: '#1A202C',
    }
    return colors[code] || '#6B7280'
  }

  useEffect(() => {
    // Simulate fetching stats
    setStats({
      totalStudents: 24,
      activeClasses: 5,
      avgPerformance: 91,
      pendingTasks: 3,
    })
  }, [])

  return (
    <DashboardLayout userRole={session?.user.role as any}>
      <div className="space-y-8">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Panel del Maestro
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona tus clases y monitoriza el progreso
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Anuncios
            </Button>
            <Button className="bg-dojo-red hover:bg-dojo-redDark">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Clase
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card hover gradient>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Estudiantes</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalStudents}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2 font-medium">
                ↑ 3 nuevos esta semana
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Clases Activas</p>
                  <p className="text-3xl font-bold text-dojo-red mt-1">{stats.activeClasses}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-dojo-red" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rendimiento Promedio</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.avgPerformance}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tareas Pendientes</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingTasks}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Estudiantes a tu Cargo</span>
                  <Button variant="ghost" size="sm">
                    Ver todos
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentStudents.map((student) => (
                    <div
                      key={student.id}
                      className="p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={student.avatar_url}
                          fallback={student.name}
                          size="lg"
                          levelColor={getLevelColor(student.level.code)}
                        />

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{student.name}</h3>
                              <Badge
                                variant={student.level.code as any}
                                size="sm"
                                className="capitalize mt-1"
                              >
                                {student.level.name}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-yellow-600 font-bold">
                                <Star className="w-4 h-4 fill-current" />
                                {student.avgScore}%
                              </div>
                              <p className="text-xs text-gray-500">Promedio general</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium">{student.lessonsCompleted}</p>
                              <p className="text-xs text-gray-500">Lecciones</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-green-600">
                                {student.avgScore}%
                              </p>
                              <p className="text-xs text-gray-500">Promedio</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-dojo-red">
                                Cinta {student.level.code}
                              </p>
                              <p className="text-xs text-gray-500">Nivel actual</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Class Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-dojo-red" />
                  Próximas Clases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-dojo-red/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-dojo-red" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{cls.title}</h4>
                        <p className="text-sm text-gray-600">
                          {format(new Date(cls.time), "dd 'de' MMMM, HH:mm", { locale: es })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {cls.students}/{cls.maxStudents} estudiantes
                        </p>
                        <Badge variant="success" size="sm">
                          {Math.round((cls.students / cls.maxStudents) * 100)}% lleno
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear nueva clase
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Gestionar estudiantes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Subir material
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Trophy className="w-4 h-4 mr-2" />
                  Crear torneo
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-500" />
                  Alertas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Clase en 1 hora
                      </p>
                      <p className="text-xs text-yellow-600">
                        DOJO MATH - Álgebra básica
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Reporte listo
                      </p>
                      <p className="text-xs text-blue-600">
                        Semanal de rendimiento generado
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Class Ranking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Ranking de Clase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentStudents
                    .sort((a, b) => b.avgScore - a.avgScore)
                    .slice(0, 3)
                    .map((student, index) => (
                      <div
                        key={student.id}
                        className={`flex items-center gap-3 p-2 rounded-lg ${
                          index === 0 ? 'bg-yellow-50 border border-yellow-200' : ''
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0
                              ? 'bg-yellow-400 text-yellow-900'
                              : index === 1
                              ? 'bg-gray-300 text-gray-700'
                              : 'bg-orange-300 text-orange-900'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <Avatar
                          src={student.avatar_url}
                          fallback={student.name}
                          size="sm"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.lessonsCompleted} lecciones</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-dojo-red">{student.avgScore}%</p>
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
