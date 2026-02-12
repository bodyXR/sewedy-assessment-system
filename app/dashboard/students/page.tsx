'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { FilterSection } from '@/components/layout/filter-section'
import { ContentSection } from '@/components/layout/content-section'
import { StudentsFilters } from '@/components/students/students-filters'
import { StudentsTable } from '@/components/students/students-table'
import { mockStudents, mockCompetencies } from '@/lib/mock-data'
import type { Student, GradeLevel } from '@/lib/types'

export default function StudentsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([])
  const [selectedGrades, setSelectedGrades] = useState<GradeLevel[]>([])

  // Filter students
  const filteredStudents = useMemo(() => {
    return mockStudents.filter((student) => {
      const matchesSearch =
        student.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesGrade = selectedGrades.length === 0 || selectedGrades.includes(student.gradeLevel)

      const matchesCompetencies =
        selectedCompetencies.length === 0 ||
        selectedCompetencies.every((comp) => student.enrolledCompetencies.includes(comp))

      return matchesSearch && matchesGrade && matchesCompetencies
    })
  }, [searchQuery, selectedGrades, selectedCompetencies])

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCompetencies([])
    setSelectedGrades([])
  }

  const handleAssess = (student: Student) => {
    router.push(`/dashboard/students/${student.id}`)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <PageHeader
        title="Students"
        description={`Manage and assess ${filteredStudents.length} student${filteredStudents.length !== 1 ? 's' : ''} across all grade levels`}
      />

      <FilterSection>
        <StudentsFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCompetencies={selectedCompetencies}
          onCompetenciesChange={setSelectedCompetencies}
          selectedGrades={selectedGrades}
          onGradesChange={setSelectedGrades}
          onClearFilters={handleClearFilters}
          competencies={mockCompetencies}
        />
      </FilterSection>

      <ContentSection>
        <StudentsTable
          students={filteredStudents}
          onAssess={handleAssess}
        />
      </ContentSection>
    </div>
  )
}

