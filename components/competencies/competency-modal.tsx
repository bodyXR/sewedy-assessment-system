'use client'

import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
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
    learningOutcomes: string[]
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
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([])
  const [newOutcome, setNewOutcome] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (competency) {
      setName(competency.name)
      setGradeLevel(competency.gradeLevel)
      setDescription(competency.description)
      setLearningOutcomes(competency.learningOutcomes || [])
    } else {
      setName('')
      setGradeLevel('Junior')
      setDescription('')
      setLearningOutcomes([])
    }
  }, [competency, isOpen])

  const handleAddOutcome = () => {
    if (newOutcome.trim()) {
      setLearningOutcomes([...learningOutcomes, newOutcome.trim()])
      setNewOutcome('')
    }
  }

  const handleRemoveOutcome = (index: number) => {
    setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index))
  }

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
    
    if (learningOutcomes.length === 0) {
        toast({
            title: "Warning",
            description: "It is recommended to add at least one learning outcome.",
            variant: "default" // Warning
        })
    }

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      onSave({
        name: name.trim(),
        gradeLevel,
        description: description.trim(),
        learningOutcomes
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
    setLearningOutcomes([])
    setNewOutcome('')
    onClose()
  }

  const grades: GradeLevel[] = ['Junior', 'Wheeler', 'Senior']

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
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

          {/* Learning Outcomes */}
          <div>
             <label className="text-sm font-medium text-foreground mb-2 block">
              Learning Outcomes
            </label>
            <div className="space-y-2 mb-3">
                {learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-center gap-2 bg-secondary/50 p-2 rounded-md">
                        <span className="text-sm flex-1">{outcome}</span>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveOutcome(index)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <Input 
                    placeholder="Add a learning outcome..." 
                    value={newOutcome} 
                    onChange={(e) => setNewOutcome(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddOutcome();
                        }
                    }}
                />
                <Button type="button" onClick={handleAddOutcome} size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
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
