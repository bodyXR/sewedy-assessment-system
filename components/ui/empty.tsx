'use client'

import React from "react"

import { cn } from '@/lib/utils'

interface EmptyProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  className?: string
}

export function Empty({
  title = 'No data found',
  description = 'Try adjusting your filters or search criteria.',
  icon,
  className,
}: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-8 py-12 text-center',
        className
      )}
    >
      {icon && <div className="mb-4 text-4xl text-muted-foreground/50">{icon}</div>}
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
