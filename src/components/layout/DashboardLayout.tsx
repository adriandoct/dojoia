'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Home,
  BookOpen,
  Users,
  Trophy,
  Settings,
  LogOut,
  Menu,
  X,
  Brain,
  MessageSquare,
  BarChart3,
  CreditCard,
  Shield,
  Crown,
} from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { UserRole } from '@/types'
import { useSession } from 'next-auth/react'

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: UserRole
}

const navigationByRole: Record<UserRole, { name: string; href: string; icon: any }[]> = {
  student: [
    { name: 'Inicio', href: '/dashboard/student', icon: Home },
    { name: 'Mis Cursos', href: '/dashboard/student/courses', icon: BookOpen },
    { name: 'DOJO MATH', href: '/dashboard/student/math', icon: Brain },
    { name: 'Logros', href: '/dashboard/student/achievements', icon: Trophy },
    { name: 'AI Coach', href: '/dashboard/student/ai-coach', icon: MessageSquare },
    { name: 'Tienda', href: '/dashboard/student/shop', icon: CreditCard },
    { name: 'Planes', href: '/pricing', icon: Crown },
    { name: 'Configuración', href: '/dashboard/student/settings', icon: Settings },
  ],
  parent: [
    { name: 'Panel', href: '/dashboard/parent', icon: Home },
    { name: 'Progreso', href: '/dashboard/parent/progress', icon: BarChart3 },
    { name: 'Hijos', href: '/dashboard/parent/children', icon: Users },
    { name: 'Reportes', href: '/dashboard/parent/reports', icon: BookOpen },
    { name: 'Pagos', href: '/dashboard/parent/billing', icon: CreditCard },
    { name: 'Configuración', href: '/dashboard/parent/settings', icon: Settings },
  ],
  teacher: [
    { name: 'Dashboard', href: '/dashboard/teacher', icon: Home },
    { name: 'Estudiantes', href: '/dashboard/teacher/students', icon: Users },
    { name: 'Clases', href: '/dashboard/teacher/classes', icon: BookOpen },
    { name: 'Rankings', href: '/dashboard/teacher/rankings', icon: Trophy },
    { name: 'Reportes', href: '/dashboard/teacher/reports', icon: BarChart3 },
    { name: 'Configuración', href: '/dashboard/teacher/settings', icon: Settings },
  ],
  admin: [
    { name: 'Admin', href: '/dashboard/admin', icon: Shield },
    { name: 'Usuarios', href: '/dashboard/admin/users', icon: Users },
    { name: 'Contenido', href: '/dashboard/admin/content', icon: BookOpen },
    { name: 'Sistema', href: '/dashboard/admin/system', icon: Settings },
  ],
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const navigation = navigationByRole[userRole] || navigationByRole.student

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          {/* Mobile header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-dojo-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">DOJOIA</span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-dojo-red text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-white lg:border-r">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center space-x-2 px-6 py-5 border-b">
            <div className="w-10 h-10 bg-dojo-red rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">DOJOIA</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-dojo-red text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User menu at bottom */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar
                src={session?.user?.image}
                fallback={session?.user?.name || 'U'}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {userRole}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full justify-start text-gray-700 hover:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 lg:hidden bg-white border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-dojo-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
              <span className="text-lg font-bold">DOJOIA</span>
            </div>
            <div className="w-6" />
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
