'use client';

import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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

  const activeFiltersCount = selectedCompetencies.length + selectedGrades.length

  return (
    <div className="flex gap-4 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by student code or name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11 bg-background border-border focus:border-primary transition-colors"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-11 px-4 gap-2 border-border hover:bg-secondary"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-4 max-h-[80vh] overflow-y-auto" align="end">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Filters</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="h-8 px-2 text-destructive hover:text-destructive/90"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Grade Level Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Grade Level
              </label>
              <div className="flex flex-wrap gap-2">
                {grades.map((grade) => (
                  <Button
                    key={grade}
                    size="sm"
                    variant={selectedGrades.includes(grade) ? 'default' : 'outline'}
                    className={cn(
                      'transition-all duration-200',
                      selectedGrades.includes(grade)
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'text-foreground hover:border-primary hover:bg-secondary'
                    )}
                    onClick={() => handleGradeToggle(grade)}
                  >
                    {grade}
                  </Button>
                ))}
              </div>
            </div>

            {/* Competency Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Competencies
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueCompetencies.map((comp) => (
                  <Button
                    key={comp.id}
                    onClick={() => handleCompetencyToggle(comp.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border',
                      selectedCompetencies.includes(comp.id)
                        ? 'bg-primary text-white border-primary shadow-sm hover:bg-primary/90'
                        : 'bg-background text-foreground border-border hover:border-primary hover:bg-secondary'
                    )}
                  >
                    {comp.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

