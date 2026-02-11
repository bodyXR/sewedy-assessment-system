'use client'

import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CompetenciesFilters } from '@/components/competencies/competencies-filters'
import { CompetenciesTable } from '@/components/competencies/competencies-table'
import { CompetencyModal } from '@/components/competencies/competency-modal'
import { DeleteConfirmDialog } from '@/components/competencies/delete-confirm-dialog'
import { mockCompetencies } from '@/lib/mock-data'
import type { Competency, GradeLevel } from '@/lib/types'

export default function CompetenciesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'All'>('All')
  const [competencies, setCompetencies] = useState<Competency[]>(mockCompetencies)
  const [showModal, setShowModal] = useState(false)
  const [editingCompetency, setEditingCompetency] = useState<Competency | null>(null)
  const [deleteCompetency, setDeleteCompetency] = useState<Competency | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Filter competencies
  const filteredCompetencies = useMemo(() => {
    return competencies.filter((comp) => {
      const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesGrade = selectedGrade === 'All' || comp.gradeLevel === selectedGrade

      return matchesSearch && matchesGrade
    })
  }, [competencies, searchQuery, selectedGrade])

  const handleAddCompetency = () => {
    setEditingCompetency(null)
    setShowModal(true)
  }

  const handleEditCompetency = (competency: Competency) => {
    setEditingCompetency(competency)
    setShowModal(true)
  }

  const handleSaveCompetency = (data: {
    name: string
    gradeLevel: GradeLevel
    description: string
  }) => {
    if (editingCompetency) {
      setCompetencies(
        competencies.map((c) =>
          c.id === editingCompetency.id ? { ...c, ...data } : c
        )
      )
    } else {
      const newCompetency: Competency = {
        id: `comp${competencies.length + 1}`,
        ...data,
        totalStudents: 0,
        gradeDistribution: { A: 0, B: 0, C: 0, D: 0 },
      }
      setCompetencies([...competencies, newCompetency])
    }
    setShowModal(false)
    setEditingCompetency(null)
  }

  const handleDeleteClick = (competency: Competency) => {
    setDeleteCompetency(competency)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    if (deleteCompetency) {
      setCompetencies(competencies.filter((c) => c.id !== deleteCompetency.id))
      setShowDeleteConfirm(false)
      setDeleteCompetency(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Competencies</h1>
            <p className="text-muted-foreground mt-1">
              Showing {filteredCompetencies.length} competenc{filteredCompetencies.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>
          <Button
            onClick={handleAddCompetency}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Competency
          </Button>
        </div>

        {/* Filters */}
        <CompetenciesFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedGrade={selectedGrade}
          onGradeChange={setSelectedGrade}
        />

        {/* Table */}
        <div className="flex-1 overflow-auto px-8 py-6">
          <CompetenciesTable
            competencies={filteredCompetencies}
            onEdit={handleEditCompetency}
            onDelete={handleDeleteClick}
          />
        </div>
      </div>

      {/* Modals */}
      <CompetencyModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingCompetency(null)
        }}
        onSave={handleSaveCompetency}
        competency={editingCompetency}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        competencyName={deleteCompetency?.name || ''}
      />
    </div>
  )
}
