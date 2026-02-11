export type GradeLevel = 'Junior' | 'Wheeler' | 'Senior'
export type Grade = 'A' | 'B' | 'C' | 'D'

export interface Student {
  id: string
  code: string
  fullName: string
  gradeLevel: GradeLevel
  enrolledCompetencies: string[]
}

export interface Competency {
  id: string
  name: string
  gradeLevel: GradeLevel
  description: string
  totalStudents: number
  gradeDistribution: {
    A: number
    B: number
    C: number
    D: number
  }
}

export interface Assessment {
  id: string
  studentId: string
  competencyId: string
  grade: Grade
  notes?: string
  createdAt: Date
}

export interface StudentAssessment {
  studentId: string
  competencyId: string
  grade: Grade
  notes?: string
}
