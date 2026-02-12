'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GradeLevel } from '@/lib/types'

interface CompetenciesFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedGrade: GradeLevel | 'All'
  onGradeChange: (value: GradeLevel | 'All') => void
}

export function CompetenciesFilters({
  searchQuery,
  onSearchChange,
  selectedGrade,
  onGradeChange,
}: CompetenciesFiltersProps) {
  const grades: (GradeLevel | 'All')[] = ['All', 'Junior', 'Wheeler', 'Senior']

  return (
    <div className="flex gap-4 items-end flex-wrap">
      <div className="flex-1 min-w-64 space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Search Competency
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by competency name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 bg-background border-border focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-2 items-end">
        <label className="text-sm font-semibold text-foreground mb-2.5">Grade Level:</label>
        <div className="flex gap-2">
          {grades.map((grade) => (
            <Button
              key={grade}
              variant={selectedGrade === grade ? 'default' : 'outline'}
              className={cn(
                'h-11 px-5 font-semibold transition-all duration-200',
                selectedGrade === grade
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-md'
                  : 'text-gray-900 bg-white border-gray-300 hover:border-primary hover:bg-gray-50'
              )}
              onClick={() => onGradeChange(grade)}
            >
              {grade}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

