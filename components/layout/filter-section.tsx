'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FilterSectionProps {
  children: ReactNode
  className?: string
}

export function FilterSection({ children, className }: FilterSectionProps) {
  return (
    <div className={cn(
      "sticky top-[120px] lg:top-[136px] z-10 glass-effect border-b border-border/50 animate-in",
      className
    )}>
      <div className="px-6 lg:px-8 py-4 lg:py-5">
        {children}
      </div>
    </div>
  )
}
