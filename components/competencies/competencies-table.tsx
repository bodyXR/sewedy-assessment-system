'use client'

import {
  ColumnDef,
} from '@tanstack/react-table'
import { Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Competency } from '@/lib/types'
import { DataTable } from '@/components/ui/data-table'
import { SortableHeader } from '@/components/ui/sortable-header'

interface CompetenciesTableProps {
  competencies: Competency[]
  onEdit: (competency: Competency) => void
  onDelete: (competency: Competency) => void
}

export function CompetenciesTable({
  competencies,
  onEdit,
  onDelete,
}: CompetenciesTableProps) {

  const calculatePassRate = (comp: Competency) => {
    const total =
      comp.gradeDistribution.A +
      comp.gradeDistribution.B +
      comp.gradeDistribution.C +
      comp.gradeDistribution.D
    if (total === 0) return 0
    const passed = comp.gradeDistribution.A + comp.gradeDistribution.B
    return Math.round((passed / total) * 100)
  }

  const columns: ColumnDef<Competency>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <SortableHeader column={column} title="Competency Name" />
      ),
      cell: ({ row }) => (
        <div className="font-medium text-foreground">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'gradeLevel',
      header: ({ column }) => (
        <SortableHeader column={column} title="Grade Level" />
      ),
      cell: ({ row }) => (
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
          {row.getValue('gradeLevel')}
        </span>
      ),
    },
    {
      accessorKey: 'totalStudents',
      header: ({ column }) => (
        <SortableHeader column={column} title="Total Students" />
      ),
      cell: ({ row }) => (
        <div className="text-foreground">{row.getValue('totalStudents')}</div>
      ),
    },
    {
      id: 'gradeA',
      header: 'Grade A',
      cell: ({ row }) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-chart-1/20 text-chart-1 font-bold">
          {row.original.gradeDistribution.A}
        </span>
      ),
    },
    {
      id: 'gradeB',
      header: 'Grade B',
      cell: ({ row }) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-chart-2/20 text-chart-2 font-bold">
          {row.original.gradeDistribution.B}
        </span>
      ),
    },
    {
      id: 'gradeC',
      header: 'Grade C',
      cell: ({ row }) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-chart-3/20 text-chart-3 font-bold">
          {row.original.gradeDistribution.C}
        </span>
      ),
    },
    {
      id: 'gradeD',
      header: 'Grade D',
      cell: ({ row }) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold">
          {row.original.gradeDistribution.D}
        </span>
      ),
    },
    {
      id: 'passRate',
      accessorFn: (row) => calculatePassRate(row),
      header: ({ column }) => (
        <SortableHeader column={column} title="Pass Rate %" />
      ),
      cell: ({ row }) => {
        const passRate = row.getValue('passRate') as number
        return (
          <div className="flex items-center gap-2 w-32">
            <Progress value={passRate} className="h-2 flex-1" />
            <span className="text-sm font-semibold text-foreground w-12">
              {passRate}%
            </span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(row.original)}
              className="text-foreground border-border hover:bg-secondary"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(row.original)}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <DataTable columns={columns} data={competencies} />
  )
}
