'use client';

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Competency, GradeLevel } from '@/lib/types'

interface StudentsFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedCompetencies: string[]
  onCompetenciesChange: (values: string[]) => void
  selectedGrades: GradeLevel[]
  onGradesChange: (values: GradeLevel[]) => void
  onClearFilters: () => void
  competencies: Competency[]
}

export function StudentsFilters({
  searchQuery,
  onSearchChange,
  selectedCompetencies,
  onCompetenciesChange,
  selectedGrades,
  onGradesChange,
  onClearFilters,
  competencies,
}: StudentsFiltersProps) {
  const grades: GradeLevel[] = ['Junior', 'Wheeler', 'Senior']
  const uniqueCompetencies = competencies.filter(
    (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i
  )

  const handleCompetencyToggle = (competencyId: string) => {
    onCompetenciesChange(
      selectedCompetencies.includes(competencyId)
        ? selectedCompetencies.filter((c) => c !== competencyId)
        : [...selectedCompetencies, competencyId]
    )
  }

  const handleGradeToggle = (grade: GradeLevel) => {
    onGradesChange(
      selectedGrades.includes(grade) ? selectedGrades.filter((g) => g !== grade) : [...selectedGrades, grade]
    )
  }

  const hasActiveFilters =
    searchQuery || selectedCompetencies.length > 0 || selectedGrades.length > 0

  return (
    <div className="space-y-5">
      {/* Search and Grade Filters */}
      <div className="flex gap-4 items-end flex-wrap">
        <div className="flex-1 min-w-64 space-y-2">
          <label className="text-sm font-semibold text-foreground">Search Students</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by student code or name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-11 bg-background border-border focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Grade Level Filter */}
        <div className="flex gap-2 items-end">
          <label className="text-sm font-semibold text-foreground mb-2.5">Grade Level:</label>
          <div className="flex gap-2">
            {grades.map((grade) => (
              <Button
                key={grade}
                variant={selectedGrades.includes(grade) ? 'default' : 'outline'}
                className={cn(
                  'h-11 px-5 font-semibold transition-all duration-200',
                  selectedGrades.includes(grade)
                    ? 'bg-primary text-white hover:bg-primary/90 shadow-md'
                    : 'text-gray-900 bg-white border-gray-300 hover:border-primary hover:bg-gray-50'
                )}
                onClick={() => handleGradeToggle(grade)}
              >
                {grade}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Competency Filter */}
      <div className="flex gap-4 items-start flex-wrap">
        <label className="text-sm font-semibold text-foreground pt-2">Competencies:</label>
        <div className="flex-1 flex flex-wrap gap-2">
          {uniqueCompetencies.map((comp) => (
            <button
              key={comp.id}
              onClick={() => handleCompetencyToggle(comp.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                selectedCompetencies.includes(comp.id)
                  ? 'bg-primary text-white shadow-md hover:bg-primary/90'
                  : 'bg-white text-gray-900 border border-gray-300 hover:border-primary hover:bg-gray-50'
              )}
            >
              {comp.name}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
          >
            <X className="w-4 h-4 mr-1.5" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  )
}

