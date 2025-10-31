'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'overlay' | 'inline' | 'button'
  text?: string
  className?: string
  fullScreen?: boolean
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
}

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  text,
  className,
  fullScreen = false
}: LoadingSpinnerProps) {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 
        className={cn(
          'animate-spin text-blue-600',
          sizeClasses[size],
          className
        )}
        aria-hidden="true"
      />
      {text && (
        <p className={cn(
          'text-gray-600 font-medium',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  )

  if (variant === 'overlay' || fullScreen) {
    return (
      <div 
        className={cn(
          'fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center',
          fullScreen && 'bg-white'
        )}
        role="status"
        aria-label={text || 'Carregando...'}
      >
        {spinnerContent}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <span 
        className="inline-flex items-center gap-2"
        role="status"
        aria-label={text || 'Carregando...'}
      >
        <Loader2 
          className={cn(
            'animate-spin text-blue-600',
            sizeClasses[size],
            className
          )}
          aria-hidden="true"
        />
        {text && (
          <span className={cn(
            'text-gray-600',
            textSizeClasses[size]
          )}>
            {text}
          </span>
        )}
      </span>
    )
  }

  if (variant === 'button') {
    return (
      <Loader2 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          className
        )}
        aria-hidden="true"
      />
    )
  }

  // Default variant
  return (
    <div 
      className="flex items-center justify-center p-8"
      role="status"
      aria-label={text || 'Carregando...'}
    >
      {spinnerContent}
    </div>
  )
}

// Skeleton loading component for better perceived performance
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses[variant],
              index === lines - 1 && 'w-3/4', // Last line shorter
              className
            )}
            style={{ width, height: height || '1rem' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
    />
  )
}

// Loading state for cards
export function CardSkeleton() {
  return (
    <div className="p-6 border rounded-lg space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="text" lines={3} />
      <div className="flex space-x-2">
        <Skeleton width={80} height={32} />
        <Skeleton width={80} height={32} />
      </div>
    </div>
  )
}

// Loading state for tables
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              variant="text" 
              className="flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default LoadingSpinner