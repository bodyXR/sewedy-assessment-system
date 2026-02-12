'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn(
      "sticky top-0 z-20 glass-effect border-b border-border/50 animate-in",
      className
    )}>
      <div className="px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {title}
            </h1>
            {description && (
              <p className="text-sm lg:text-base text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
