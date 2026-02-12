'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ContentSectionProps {
  children: ReactNode
  className?: string
}

export function ContentSection({ children, className }: ContentSectionProps) {
  return (
    <div className={cn("flex-1 overflow-auto scrollbar-thin", className)}>
      <div className="px-6 lg:px-8 py-6 lg:py-8 animate-in">
        {children}
      </div>
    </div>
  )
}
