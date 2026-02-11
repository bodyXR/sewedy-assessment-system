'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import type { Competency, GradeLevel } from '@/lib/types'

interface CompetencyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    name: string
    gradeLevel: GradeLevel
    description: string
  }) => void
  competency?: Competency | null
}

export function CompetencyModal({
  isOpen,
  onClose,
  onSave,
  competency,
}: CompetencyModalProps) {
  const [name, setName] = useState('')
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('Junior')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (competency) {
      setName(competency.name)
      setGradeLevel(competency.gradeLevel)
      setDescription(competency.description)
    } else {
      setName('')
      setGradeLevel('Junior')
      setDescription('')
    }
  }, [competency, isOpen])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a competency name',
        variant: 'destructive',
      })
      return
    }

    if (!description.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a description',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      onSave({
        name: name.trim(),
        gradeLevel,
        description: description.trim(),
      })

      toast({
        title: 'Success',
        description: competency
          ? 'Competency updated successfully'
          : 'Competency created successfully',
      })

      handleClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save competency',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setName('')
    setGradeLevel('Junior')
    setDescription('')
    onClose()
  }

  const grades: GradeLevel[] = ['Junior', 'Wheeler', 'Senior']

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{competency ? 'Edit Competency' : 'Add Competency'}</DialogTitle>
          <DialogDescription>
            {competency
              ? 'Update the competency details'
              : 'Create a new competency for the assessment system'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Competency Name */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Competency Name
            </label>
            <Input
              placeholder="e.g., Mathematics, English Language"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-foreground"
            />
          </div>

          {/* Grade Level */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Grade Level
            </label>
            <Select value={gradeLevel} onValueChange={(v) => setGradeLevel(v as GradeLevel)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Description
            </label>
            <Textarea
              placeholder="Describe this competency..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none h-24 text-foreground"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="text-foreground border-border hover:bg-secondary bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? 'Saving...' : 'Save Competency'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
