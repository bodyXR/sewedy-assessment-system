'use client';

import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
    <div className="sticky top-0 z-10 bg-background border-b border-border px-8 py-4 space-y-4">
      {/* Search and Grade Filters */}
      <div className="flex gap-4 items-end flex-wrap">
        <div className="flex-1 min-w-64">
          <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
          <Input
            placeholder="Search by student code or name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10"
          />
        </div>

        {/* Grade Level Filter */}
        <div className="flex gap-2">
          <label className="text-sm font-medium text-foreground self-end mb-2">Grades:</label>
          {grades.map((grade) => (
            <Button
              key={grade}
              variant={selectedGrades.includes(grade) ? 'default' : 'outline'}
              className={`h-10 ${
                selectedGrades.includes(grade)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground border-border'
              }`}
              onClick={() => handleGradeToggle(grade)}
            >
              {grade}
            </Button>
          ))}
        </div>
      </div>

      {/* Competency Filter */}
      <div className="flex gap-4 items-end flex-wrap">
        <label className="text-sm font-medium text-foreground">Competencies:</label>
        <div className="flex flex-wrap gap-2">
          {uniqueCompetencies.map((comp) => (
            <button
              key={comp.id}
              onClick={() => handleCompetencyToggle(comp.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCompetencies.includes(comp.id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
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
            className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
          >
            <X className="w-4 h-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
