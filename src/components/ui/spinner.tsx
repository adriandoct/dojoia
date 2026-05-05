import * as React from 'react'
import { cn } from '@/lib/utils/helpers'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-200 border-t-dojo-red',
          sizeClasses[size]
        )}
        role="status"
        aria-label="Cargando..."
      />
    </div>
  )
}

export function LoadingScreen({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <Spinner size="xl" />
      <p className="mt-4 text-lg font-medium text-gray-600">{message}</p>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="p-6 rounded-xl border border-gray-200 bg-white animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  )
}
