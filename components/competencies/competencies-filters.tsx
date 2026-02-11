'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
    <div className="sticky top-0 z-10 bg-background border-b border-border px-8 py-4 space-y-4">
      <div className="flex gap-4 items-end flex-wrap">
        <div className="flex-1 min-w-64">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Search Competency
          </label>
          <Input
            placeholder="Search by competency name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10"
          />
        </div>

        <div className="flex gap-2">
          <label className="text-sm font-medium text-foreground self-end mb-2">Grade Level:</label>
          {grades.map((grade) => (
            <Button
              key={grade}
              variant={selectedGrade === grade ? 'default' : 'outline'}
              className={`h-10 ${
                selectedGrade === grade
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground border-border hover:bg-secondary'
              }`}
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
