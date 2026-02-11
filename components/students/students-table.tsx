'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Empty } from '@/components/ui/empty'
import type { Student } from '@/lib/types'

interface StudentsTableProps {
  students: Student[]
  onAssess: (student: Student) => void
  itemsPerPage: number
  onItemsPerPageChange: (value: number) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
}

type SortKey = 'code' | 'fullName' | 'gradeLevel' | 'enrolledCompetencies'
type SortOrder = 'asc' | 'desc'

export function StudentsTable({
  students,
  onAssess,
  itemsPerPage,
  onItemsPerPageChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}: StudentsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('code')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const sortedStudents = [...students].sort((a, b) => {
    let aVal: any = a[sortKey]
    let bVal: any = b[sortKey]

    if (sortKey === 'enrolledCompetencies') {
      aVal = (a[sortKey] as string[]).length
      bVal = (b[sortKey] as string[]).length
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = (bVal as string).toLowerCase()
    }

    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <div className="w-4 h-4" />
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    )
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <Empty
          icon={<FileText className="w-12 h-12 text-muted-foreground" />}
          title="No students found"
          description="Try adjusting your filters to find students"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary border-b border-border">
                {[
                  { key: 'code', label: 'Student Code' },
                  { key: 'fullName', label: 'Full Name' },
                  { key: 'gradeLevel', label: 'Grade Level' },
                  { key: 'enrolledCompetencies', label: 'Enrolled Competencies' },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    className="px-6 py-4 text-left"
                    onClick={() => handleSort(key as SortKey)}
                  >
                    <button className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors">
                      {label}
                      <SortIcon column={key as SortKey} />
                    </button>
                  </th>
                ))}
                <th className="px-6 py-4 text-right font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student, index) => (
                <tr
                  key={student.id}
                  className={`border-b border-border transition-colors hover:bg-secondary/50 ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                  }`}
                >
                  <td className="px-6 py-4 text-foreground font-medium">{student.code}</td>
                  <td className="px-6 py-4 text-foreground">{student.fullName}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                      {student.gradeLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground">{student.enrolledCompetencies.length}</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      onClick={() => onAssess(student)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-9"
                    >
                      Assess
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm text-muted-foreground">Items per page:</label>
          <Select value={String(itemsPerPage)} onValueChange={(v) => onItemsPerPageChange(Number(v))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="text-foreground border-border hover:bg-secondary"
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className={`${
                currentPage === page
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground border-border hover:bg-secondary'
              }`}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="text-foreground border-border hover:bg-secondary"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
