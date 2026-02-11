'use client'

import { useState } from 'react'
import { Edit2, Trash2, ChevronUp, ChevronDown, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Empty } from '@/components/ui/empty'
import type { Competency } from '@/lib/types'

interface CompetenciesTableProps {
  competencies: Competency[]
  onEdit: (competency: Competency) => void
  onDelete: (competency: Competency) => void
}

type SortKey = 'name' | 'gradeLevel' | 'totalStudents' | 'passRate'
type SortOrder = 'asc' | 'desc'

export function CompetenciesTable({
  competencies,
  onEdit,
  onDelete,
}: CompetenciesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const calculatePassRate = (comp: Competency) => {
    const total = comp.gradeDistribution.A + comp.gradeDistribution.B + comp.gradeDistribution.C + comp.gradeDistribution.D
    if (total === 0) return 0
    const passed = comp.gradeDistribution.A + comp.gradeDistribution.B
    return Math.round((passed / total) * 100)
  }

  const sortedCompetencies = [...competencies].sort((a, b) => {
    let aVal: any = a[sortKey]
    let bVal: any = b[sortKey]

    if (sortKey === 'passRate') {
      aVal = calculatePassRate(a)
      bVal = calculatePassRate(b)
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

  if (competencies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <Empty
          icon={<BookOpen className="w-12 h-12 text-muted-foreground" />}
          title="No competencies found"
          description="Try adjusting your filters or add a new competency"
        />
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary border-b border-border">
              {[
                { key: 'name', label: 'Competency Name' },
                { key: 'gradeLevel', label: 'Grade Level' },
                { key: 'totalStudents', label: 'Total Students' },
                { key: 'name', label: 'Grade A' },
                { key: 'name', label: 'Grade B' },
                { key: 'name', label: 'Grade C' },
                { key: 'name', label: 'Grade D' },
                { key: 'passRate', label: 'Pass Rate %' },
              ].map(({ key, label }, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-left"
                  onClick={() => (key as any) !== 'name' || idx <= 2 ? handleSort(key as SortKey) : null}
                >
                  <button className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors">
                    {label}
                    {(key as any) !== 'name' || idx <= 2 ? <SortIcon column={key as SortKey} /> : null}
                  </button>
                </th>
              ))}
              <th className="px-6 py-4 text-right font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCompetencies.map((comp, index) => {
              const passRate = calculatePassRate(comp)
              return (
                <tr
                  key={comp.id}
                  className={`border-b border-border transition-colors hover:bg-secondary/50 ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                  }`}
                >
                  <td className="px-6 py-4 text-foreground font-medium">{comp.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                      {comp.gradeLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground">{comp.totalStudents}</td>
                  <td className="px-6 py-4 text-foreground">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-chart-1/20 text-chart-1 font-bold">
                      {comp.gradeDistribution.A}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-chart-2/20 text-chart-2 font-bold">
                      {comp.gradeDistribution.B}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-chart-3/20 text-chart-3 font-bold">
                      {comp.gradeDistribution.C}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold">
                      {comp.gradeDistribution.D}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 w-32">
                      <Progress value={passRate} className="h-2 flex-1" />
                      <span className="text-sm font-semibold text-foreground w-12">{passRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(comp)}
                      className="text-foreground border-border hover:bg-secondary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(comp)}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
