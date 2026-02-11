'use client'

import { useState, useMemo } from 'react'
import { StudentsFilters } from '@/components/students/students-filters'
import { StudentsTable } from '@/components/students/students-table'
import { AssessmentModal } from '@/components/students/assessment-modal'
import { mockStudents, mockCompetencies } from '@/lib/mock-data'
import type { Student, GradeLevel } from '@/lib/types'

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([])
  const [selectedGrades, setSelectedGrades] = useState<GradeLevel[]>([])
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showAssessmentModal, setShowAssessmentModal] = useState(false)

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

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredStudents.slice(start, start + itemsPerPage)
  }, [filteredStudents, currentPage, itemsPerPage])

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCompetencies([])
    setSelectedGrades([])
    setCurrentPage(1)
  }

  const handleAssess = (student: Student) => {
    setSelectedStudent(student)
    setShowAssessmentModal(true)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border">
          <h1 className="text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">
            Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters */}
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

        {/* Table */}
        <div className="flex-1 overflow-auto px-8 py-6">
          <StudentsTable
            students={paginatedStudents}
            onAssess={handleAssess}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredStudents.length}
          />
        </div>
      </div>

      {/* Assessment Modal */}
      {selectedStudent && (
        <AssessmentModal
          isOpen={showAssessmentModal}
          onClose={() => {
            setShowAssessmentModal(false)
            setSelectedStudent(null)
          }}
          student={selectedStudent}
          competencies={mockCompetencies.filter((c) =>
            selectedStudent.enrolledCompetencies.includes(c.id)
          )}
        />
      )}
    </div>
  )
}
