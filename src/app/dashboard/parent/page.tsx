'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import {
  Users,
  TrendingUp,
  Calendar,
  Award,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { format, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

// Mock data - in production this would come from Supabase
const mockChildren = [
  {
    id: '1',
    name: 'Sofía García',
    avatar_url: null,
    level: { code: 'yellow', name: 'Cinta Amarilla' },
    xp: 2450,
    lessons_completed: 48,
    streak_days: 7,
    average_score: 92,
    last_activity: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Lucas García',
    avatar_url: null,
    level: { code: 'white', name: 'Cinta Blanca' },
    xp: 850,
    lessons_completed: 12,
    streak_days: 3,
    average_score: 85,
    last_activity: subDays(new Date(), 1).toISOString(),
  },
]

const mockRecentActivities = [
  {
    id: '1',
    child_name: 'Sofía García',
    action: 'Completó lección',
    details: 'DOJO MATH - Sumas hasta 20',
    timestamp: subDays(new Date(), 0).toISOString(),
    xp_earned: 75,
  },
  {
    id: '2',
    child_name: 'Lucas García',
    action: 'Ganó logro',
    details: '¡Primer Paso! - Primera lección completada',
    timestamp: subDays(new Date(), 1).toISOString(),
    xp_earned: 100,
  },
  {
    id: '3',
    child_name: 'Sofía García',
    action: 'Subió de nivel',
    details: 'Ahora es Cinta Amarilla',
    timestamp: subDays(new Date(), 2).toISOString(),
    xp_earned: 300,
  },
]

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

export default function ParentDashboardPage() {
  const { data: session } = useSession()
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week')

  const averageScore = Math.round(
    mockChildren.reduce((acc, child) => acc + child.average_score, 0) / mockChildren.length
  )

  const totalXP = mockChildren.reduce((acc, child) => acc + child.xp, 0)
  const totalLessons = mockChildren.reduce((acc, child) => acc + child.lessons_completed, 0)

  return (
    <DashboardLayout userRole={session?.user.role as any}>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Panel de Padres
          </h1>
          <p className="text-gray-600 mt-1">
            Monitorea el progreso de tus hijos en DOJOIA
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card hover gradient>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Hijos Registrados</p>
                  <p className="text-3xl font-bold mt-1">{mockChildren.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">XP Total</p>
                  <p className="text-3xl font-bold text-dojo-red mt-1">{totalXP.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-dojo-red" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Lecciones Completadas</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{totalLessons}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Calificación Promedio</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{averageScore}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Children Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Mis Hijos</span>
                  <Button variant="ghost" size="sm">
                    Ver todos
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockChildren.map((child) => (
                    <div
                      key={child.id}
                      className="p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={child.avatar_url}
                          fallback={child.name}
                          size="lg"
                          levelColor={getLevelColor(child.level.code)}
                        />

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{child.name}</h3>
                              <Badge
                                variant={child.level.code as any}
                                size="sm"
                                className="capitalize mt-1"
                              >
                                {child.level.name}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-dojo-red">
                                {child.xp.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">XP</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium">{child.lessons_completed}</p>
                              <p className="text-xs text-gray-500">Lecciones</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium">{child.average_score}%</p>
                              <p className="text-xs text-gray-500">Promedio</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium flex items-center justify-center gap-1">
                                <span>{child.streak_days}</span>
                                <span className="text-xs">🔥</span>
                              </p>
                              <p className="text-xs text-gray-500">Racha</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-dojo-red" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-dojo-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-dojo-red" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{activity.child_name}</p>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                        <p className="text-xs text-gray-500 truncate">{activity.details}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-amber-600">+{activity.xp_earned} XP</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(activity.timestamp), "d 'de' MMM", { locale: es })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel - Insights */}
          <div className="space-y-6">
            {/* Recommendations */}
            <Card className="bg-gradient-to-br from-dojo-red to-dojo-redDark text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5" />
                  Recomendaciones IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <h4 className="font-semibold mb-2">📚 Lee más cada día</h4>
                  <p className="text-sm opacity-90">
                    Sofía ha mejorado su lectura. Recomiendo 15 min extra de DOJO READ.
                  </p>
                </div>

                <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <h4 className="font-semibold mb-2">🧮 Refuerza matemáticas</h4>
                  <p className="text-sm opacity-90">
                    Lucas necesita más práctica en resta. Sugiero lecciones de DOJO MATH nivel 2.
                  </p>
                </div>

                <Button variant="secondary" size="sm" className="w-full mt-2">
                  Ver todas las recomendaciones
                </Button>
              </CardContent>
            </Card>

            {/* Weekly Report Button */}
            <Card>
              <CardHeader>
                <CardTitle>Reportes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Reporte Semanal
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Progreso Detallado
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Award className="w-4 h-4 mr-2" />
                  Logros Alcanzados
                </Button>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Consejos para Padres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Celebra cada logro por pequeño que sea</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Mantén una rutina de estudio constante</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Usa DOJO COIN como motivador extra</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Revisa el ranking familiar cada semana</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
