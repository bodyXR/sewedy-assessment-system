'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import type { Student, Competency, Grade } from '@/lib/types'

interface AssessmentModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
  competencies: Competency[]
}

export function AssessmentModal({
  isOpen,
  onClose,
  student,
  competencies,
}: AssessmentModalProps) {
  const [selectedCompetency, setSelectedCompetency] = useState<string>(competencies[0]?.id || '')
  const [selectedGrade, setSelectedGrade] = useState<Grade | ''>('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!selectedCompetency || !selectedGrade) {
      toast({
        title: 'Error',
        description: 'Please select both a competency and a grade',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: 'Success',
        description: 'Assessment submitted successfully',
      })

      handleClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit assessment',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedCompetency(competencies[0]?.id || '')
    setSelectedGrade('')
    setNotes('')
    onClose()
  }

  const grades: Grade[] = ['A', 'B', 'C', 'D']

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assess Student</DialogTitle>
          <DialogDescription>Record assessment for {student.fullName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Student Info Header */}
          <div className="bg-secondary rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-semibold text-foreground">{student.fullName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Code</p>
                <p className="font-semibold text-foreground">{student.code}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Grade Level</p>
                <p className="font-semibold text-foreground">{student.gradeLevel}</p>
              </div>
            </div>
          </div>

          {/* Competency Selector */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Competency
            </label>
            <Select value={selectedCompetency} onValueChange={setSelectedCompetency}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a competency" />
              </SelectTrigger>
              <SelectContent>
                {competencies.map((comp) => (
                  <SelectItem key={comp.id} value={comp.id}>
                    {comp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grade Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Grade Result
            </label>
            <div className="grid grid-cols-4 gap-2">
              {grades.map((grade) => (
                <Button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  variant={selectedGrade === grade ? 'default' : 'outline'}
                  className={`h-12 font-bold text-lg ${
                    selectedGrade === grade
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground border-border hover:bg-secondary'
                  }`}
                >
                  {grade}
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Notes (Optional)
            </label>
            <Textarea
              placeholder="Add any notes or comments about this assessment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
