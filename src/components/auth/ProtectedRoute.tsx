'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function useProtectedRoute(allowedRoles?: UserRole[]) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (allowedRoles && !allowedRoles.includes(session.user.role as UserRole)) {
      // Redirect to appropriate dashboard based on role
      const role = session.user.role as UserRole
      switch (role) {
        case 'student':
          router.push('/dashboard/student')
          break
        case 'parent':
          router.push('/dashboard/parent')
          break
        case 'teacher':
          router.push('/dashboard/teacher')
          break
        default:
          router.push('/dashboard')
      }
    }
  }, [session, status, router, allowedRoles])

  return { session, status }
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { session, status } = useProtectedRoute(allowedRoles)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dojo-red"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
