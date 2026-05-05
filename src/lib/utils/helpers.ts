import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { supabase } from '@/lib/supabase/client'

/**
 * Utility function to merge Tailwind classes with className conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to relative time or formatted string
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

/**
 * Format time duration (seconds to MM:SS)
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-MX').format(num)
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Generate a random color from DOJO palette
 */
export function getLevelColor(levelCode: string): string {
  const colors: Record<string, string> = {
    white: '#FFFFFF',
    yellow: '#F6E05E',
    orange: '#ED8936',
    green: '#48BB78',
    blue: '#4299E1',
    brown: '#975A16',
    black: '#1A202C',
  }
  return colors[levelCode] || '#000000'
}

/**
 * Calculate XP percentage to next level
 */
export function calculateLevelProgress(currentXp: number, minXp: number, maxXp: number): number {
  const range = maxXp - minXp
  const progress = currentXp - minXp
  return Math.min(100, Math.max(0, (progress / range) * 100))
}

/**
 * Get level by XP total
 */
export function getLevelByXP(totalXP: number, levels: { min_points: number; max_points: number }[]): number {
  const sortedLevels = [...levels].sort((a, b) => a.min_points - b.min_points)
  let levelIndex = 0

  for (let i = 0; i < sortedLevels.length; i++) {
    if (totalXP >= sortedLevels[i].min_points) {
      levelIndex = i
    } else {
      break
    }
  }

  return levelIndex
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Storage helpers for localStorage
 */
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === 'undefined') return defaultValue ?? null

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue ?? null
    } catch {
      return defaultValue ?? null
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  },
}

/**
 * Get user role from Supabase session
 */
export function getUserRole(session: any): string | null {
  try {
    const { data } = supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    return data?.role || null
  } catch {
    return null
  }
}

/**
 * Redirect helper
 */
export function redirect(to: string): never {
  if (typeof window !== 'undefined') {
    window.location.href = to
  }
  throw new Error(`Redirect to ${to}`)
}
