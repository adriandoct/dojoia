import * as React from 'react'
import { cn } from '@/lib/utils/helpers'
import { Avatar } from '@/components/ui/avatar'
import { LevelCode } from '@/types'
import { getLevelColor } from '@/lib/utils/helpers'

interface ProgressRingProps {
  progress: number // 0 to 100
  size?: number
  strokeWidth?: number
  showPercentage?: boolean
  variant?: 'default' | 'belt' | 'level'
  levelCode?: LevelCode
  className?: string
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  variant = 'default',
  levelCode = 'white',
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference
  const levelColor = getLevelColor(levelCode)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={variant === 'belt' ? '#E5E7EB' : '#F3F4F6'}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={levelColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {showPercentage && (
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: levelColor }}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  )
}

interface BeltProgressProps {
  currentLevel: number
  maxLevel: number
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  className?: string
}

const levelOrder: LevelCode[] = ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black']

export function BeltProgress({ currentLevel, maxLevel, size = 'md', showLabels = true, className }: BeltProgressProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {levelOrder.slice(0, maxLevel).map((level, index) => {
        const isAchieved = index < currentLevel
        const isCurrent = index === currentLevel
        const isLocked = index > currentLevel

        return (
          <React.Fragment key={level}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'rounded-full flex items-center justify-center font-bold border-2 border-white shadow-md transition-all',
                  sizeClasses[size],
                  isAchieved && 'animate-scale-in',
                  isCurrent && 'ring-2 ring-offset-2 ring-dojo-red scale-110',
                  isLocked && 'opacity-30 grayscale'
                )}
                style={{
                  backgroundColor: isLocked ? '#9CA3AF' : getLevelColor(level),
                }}
              >
                {isAchieved || isCurrent ? (
                  <span className="text-white">{index + 1}</span>
                ) : (
                  <span className="text-gray-400">?</span>
                )}
              </div>
              {showLabels && (
                <span className={cn(
                  'mt-1 capitalize font-medium',
                  isCurrent ? 'text-dojo-red' : isLocked ? 'text-gray-400' : 'text-gray-600'
                )}>
                  {level}
                </span>
              )}
            </div>
            {index < maxLevel - 1 && (
              <div
                className={cn(
                  'h-0.5 w-4 transition-all',
                  isAchieved ? 'bg-dojo-red' : 'bg-gray-300'
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

interface XPProgressBarProps {
  currentXP: number
  minXP: number
  maxXP: number
  showLabel?: boolean
  variant?: 'default' | 'compact'
  className?: string
}

export function XPProgressBar({
  currentXP,
  minXP,
  maxXP,
  showLabel = true,
  variant = 'default',
  className,
}: XPProgressBarProps) {
  const range = maxXP - minXP
  const progress = Math.min(100, Math.max(0, ((currentXP - minXP) / range) * 100))

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-1">
        {showLabel && (
          <>
            <span className="text-xs text-gray-500">XP: {currentXP.toLocaleString()}</span>
            <span className="text-xs text-gray-500">Siguiente nivel: {maxXP.toLocaleString()}</span>
          </>
        )}
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-dojo-red to-dojo-redDark transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export { Avatar }
