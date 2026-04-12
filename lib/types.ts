export type GradeLevel = "Junior" | "Wheeler" | "Senior";
export type Grade = "A" | "B" | "C" | "D";
export type AccountRole = "controller" | "assessor" | "verifier";
export type AssignedRole = "assessor" | "verifier";
export type CycleStatus = "upcoming" | "active" | "closed";
export type ResultStatus = "draft" | "submitted" | "approved";
export type CompetencyType =
  | "Structural"
  | "Civil"
  | "Electrical"
  | "Mechanical"
  | "Software";

export interface SubTask {
  id: string;
  label: string;
  maxPoints: number;
}

export interface Task {
  id: string;
  label: string;
  subTasks: SubTask[];
}

// Task subtask points: key = `${taskId}.${subTaskId}` → points entered
export type TaskScores = Record<string, number>;

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  accountRole: AccountRole;
}

export interface Cycle {
  id: string;
  name: string;
  status: CycleStatus;
  createdBy: string;
  startDate: string;
  endDate: string;
}

export interface RoleAssignment {
  id: string;
  userId: string;
  cycleId: string;
  class: GradeLevel;
  competency: CompetencyType;
  assignedRole: AssignedRole;
  assignedAt: string;
  assignedBy: string;
}

export interface Student {
  id: string;
  code: string;
  fullName: string;
  gradeLevel: GradeLevel;
  competency: CompetencyType;
  enrolledCompetencies: string[];
}

export interface AssessmentResult {
  id: string;
  studentId: string;
  assessorId: string;
  cycleId: string;
  competency: CompetencyType;
  scores: Record<string, number>;
  notes: string;
  status: ResultStatus;
  submittedAt?: string;
}

export interface Competency {
  id: string;
  name: string;
  gradeLevel: GradeLevel;
  description: string;
  learningOutcomes: string[];
  totalStudents: number;
  gradeDistribution: { A: number; B: number; C: number; D: number };
}

export interface Assessment {
  id: string;
  studentId: string;
  competencyId: string;
  grade: Grade;
  notes?: string;
  createdAt: Date;
}

export interface StudentAssessment {
  studentId: string;
  competencyId: string;
  grade: Grade;
  notes?: string;
}

// Role context resolved per cycle
export interface CurrentRoleContext {
  accountRole: AccountRole;
  class?: GradeLevel;
  competency?: CompetencyType;
  assignedRole?: AssignedRole;
  cycleId?: string;
  cycleName?: string;
}
