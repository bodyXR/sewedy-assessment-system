'use client'

import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
  const activeFiltersCount = selectedGrade !== 'All' ? 1 : 0

  return (
    <div className="flex gap-4 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by competency name..."
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
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Filters</h4>
              {selectedGrade !== 'All' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onGradeChange('All')}
                  className="h-8 px-2 text-destructive hover:text-destructive/90"
                >
                  Clear
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Grade Level
              </label>
              <div className="flex flex-wrap gap-2">
                {grades.map((grade) => (
                  <Button
                    key={grade}
                    size="sm"
                    variant={selectedGrade === grade ? 'default' : 'outline'}
                    className={cn(
                      'transition-all duration-200',
                      selectedGrade === grade
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'text-foreground hover:border-primary hover:bg-secondary'
                    )}
                    onClick={() => onGradeChange(grade)}
                  >
                    {grade}
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

