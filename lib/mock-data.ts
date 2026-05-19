import type {
  Student,
  Competency,
  Assessment,
  User,
  Cycle,
  RoleAssignment,
  AssessmentResult,
  Task,
} from "./types";

// ── Users ──────────────────────────────────────────────────────────────────
export const mockUsers: User[] = [
  {
    id: "u1",
    username: "controller",
    fullName: "Wael Darwish",
    email: "wael@eng.edu",
    accountRole: "controller",
  },
  {
    id: "u2",
    username: "assessor1",
    fullName: "Ahmed Nasser",
    email: "ahmed@eng.edu",
    accountRole: "assessor",
  },
  {
    id: "u3",
    username: "assessor2",
    fullName: "Sara Khalil",
    email: "sara@eng.edu",
    accountRole: "assessor",
  },
  {
    id: "u4",
    username: "verifier1",
    fullName: "Omar Farouk",
    email: "omar@eng.edu",
    accountRole: "verifier",
  },
  {
    id: "u5",
    username: "verifier2",
    fullName: "Nadia Hassan",
    email: "nadia@eng.edu",
    accountRole: "verifier",
  },
  {
    id: "u6",
    username: "assessor3",
    fullName: "Karim Mostafa",
    email: "karim@eng.edu",
    accountRole: "assessor",
  },
];

// ── Cycles ─────────────────────────────────────────────────────────────────
export const mockCycles: Cycle[] = [
  {
    id: "cyc1",
    name: "Spring 2026 Assessment",
    status: "active",
    createdBy: "u1",
    startDate: "2026-03-01",
    endDate: "2026-06-30",
  },
  {
    id: "cyc2",
    name: "Fall 2025 Assessment",
    status: "closed",
    createdBy: "u1",
    startDate: "2025-09-01",
    endDate: "2025-12-31",
  },
  {
    id: "cyc3",
    name: "Summer 2026 Assessment",
    status: "upcoming",
    createdBy: "u1",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
  },
];

// ── Role Assignments ───────────────────────────────────────────────────────
export const mockRoleAssignments: RoleAssignment[] = [
  {
    id: "ra1",
    userId: "u2",
    cycleId: "cyc1",
    grade: "Junior",
    classGroup: "J1",
    competency: "Structural",
    assignedRole: "assessor",
    assignedAt: "2026-02-20T10:00:00Z",
    assignedBy: "u1",
  },
  {
    id: "ra2",
    userId: "u3",
    cycleId: "cyc1",
    grade: "Senior",
    classGroup: "S1",
    competency: "Civil",
    assignedRole: "assessor",
    assignedAt: "2026-02-20T10:05:00Z",
    assignedBy: "u1",
  },
  {
    id: "ra3",
    userId: "u4",
    cycleId: "cyc1",
    grade: "Junior",
    classGroup: "J1",
    competency: "Structural",
    assignedRole: "verifier",
    assignedAt: "2026-02-20T10:10:00Z",
    assignedBy: "u1",
  },
  {
    id: "ra4",
    userId: "u5",
    cycleId: "cyc1",
    grade: "Senior",
    classGroup: "S1",
    competency: "Civil",
    assignedRole: "verifier",
    assignedAt: "2026-02-20T10:15:00Z",
    assignedBy: "u1",
  },
  {
    id: "ra5",
    userId: "u6",
    cycleId: "cyc1",
    grade: "Wheeler",
    classGroup: "W1",
    competency: "Electrical",
    assignedRole: "assessor",
    assignedAt: "2026-02-20T10:20:00Z",
    assignedBy: "u1",
  },
];

// ── Students ───────────────────────────────────────────────────────────────
export const mockStudents: Student[] = [
  {
    id: "s1",
    code: "STU001",
    fullName: "John Smith",
    gradeLevel: "Junior",
    competency: "Structural",
    enrolledCompetencies: ["comp1", "comp2"],
  },
  {
    id: "s2",
    code: "STU002",
    fullName: "Sarah Johnson",
    gradeLevel: "Junior",
    competency: "Structural",
    enrolledCompetencies: ["comp1", "comp3"],
  },
  {
    id: "s3",
    code: "STU003",
    fullName: "Michael Brown",
    gradeLevel: "Junior",
    competency: "Structural",
    enrolledCompetencies: ["comp2", "comp3"],
  },
  {
    id: "s4",
    code: "STU004",
    fullName: "Emily Davis",
    gradeLevel: "Junior",
    competency: "Structural",
    enrolledCompetencies: ["comp1", "comp4"],
  },
  {
    id: "s5",
    code: "STU005",
    fullName: "James Wilson",
    gradeLevel: "Senior",
    competency: "Civil",
    enrolledCompetencies: ["comp2", "comp3"],
  },
  {
    id: "s6",
    code: "STU006",
    fullName: "Lisa Martinez",
    gradeLevel: "Senior",
    competency: "Civil",
    enrolledCompetencies: ["comp1", "comp3"],
  },
  {
    id: "s7",
    code: "STU007",
    fullName: "Robert Taylor",
    gradeLevel: "Senior",
    competency: "Civil",
    enrolledCompetencies: ["comp2", "comp4"],
  },
  {
    id: "s8",
    code: "STU008",
    fullName: "Jessica Anderson",
    gradeLevel: "Wheeler",
    competency: "Electrical",
    enrolledCompetencies: ["comp1", "comp2"],
  },
  {
    id: "s9",
    code: "STU009",
    fullName: "David Thomas",
    gradeLevel: "Wheeler",
    competency: "Electrical",
    enrolledCompetencies: ["comp3", "comp4"],
  },
  {
    id: "s10",
    code: "STU010",
    fullName: "Amanda White",
    gradeLevel: "Wheeler",
    competency: "Electrical",
    enrolledCompetencies: ["comp1", "comp2"],
  },
];

// ── Assessment Results ─────────────────────────────────────────────────────
export const mockResults: AssessmentResult[] = [
  {
    id: "r1",
    studentId: "s1",
    assessorId: "u2",
    cycleId: "cyc1",
    competency: "Structural",
    scores: {
      "Load Analysis": 85,
      "Material Selection": 78,
      "Safety Standards": 90,
    },
    notes: "Strong understanding of load distribution.",
    status: "approved",
    submittedAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "r2",
    studentId: "s2",
    assessorId: "u2",
    cycleId: "cyc1",
    competency: "Structural",
    scores: {
      "Load Analysis": 70,
      "Material Selection": 65,
      "Safety Standards": 72,
    },
    notes: "Needs improvement in material selection.",
    status: "submitted",
    submittedAt: "2026-04-02T10:00:00Z",
  },
  {
    id: "r3",
    studentId: "s3",
    assessorId: "u2",
    cycleId: "cyc1",
    competency: "Structural",
    scores: {
      "Load Analysis": 55,
      "Material Selection": 60,
      "Safety Standards": 58,
    },
    notes: "Below expectations. Recommend re-assessment.",
    status: "submitted",
    submittedAt: "2026-04-02T14:00:00Z",
  },
  {
    id: "r4",
    studentId: "s4",
    assessorId: "u2",
    cycleId: "cyc1",
    competency: "Structural",
    scores: {},
    notes: "",
    status: "draft",
  },
  {
    id: "r5",
    studentId: "s5",
    assessorId: "u3",
    cycleId: "cyc1",
    competency: "Civil",
    scores: { "Site Analysis": 88, "Design Principles": 92, Regulations: 85 },
    notes: "Excellent grasp of civil design principles.",
    status: "submitted",
    submittedAt: "2026-04-03T08:00:00Z",
  },
  {
    id: "r6",
    studentId: "s6",
    assessorId: "u3",
    cycleId: "cyc1",
    competency: "Civil",
    scores: { "Site Analysis": 75, "Design Principles": 80, Regulations: 78 },
    notes: "Good overall performance.",
    status: "approved",
    submittedAt: "2026-04-03T09:00:00Z",
  },
];

// ── Competencies (legacy, kept for existing pages) ─────────────────────────
export const mockCompetencies: Competency[] = [
  {
    id: "comp1",
    name: "Structural Engineering",
    gradeLevel: "Junior",
    description: "Structural analysis and design fundamentals",
    learningOutcomes: [
      "Load analysis",
      "Material selection",
      "Safety standards",
      "Structural design",
    ],
    totalStudents: 4,
    gradeDistribution: { A: 2, B: 1, C: 1, D: 0 },
  },
  {
    id: "comp2",
    name: "Civil Engineering",
    gradeLevel: "Senior",
    description: "Civil infrastructure design and planning",
    learningOutcomes: [
      "Site analysis",
      "Design principles",
      "Regulations",
      "Project management",
    ],
    totalStudents: 3,
    gradeDistribution: { A: 1, B: 2, C: 0, D: 0 },
  },
  {
    id: "comp3",
    name: "Electrical Systems",
    gradeLevel: "Wheeler",
    description: "Electrical circuit design and power systems",
    learningOutcomes: [
      "Circuit analysis",
      "Power distribution",
      "Safety protocols",
      "System design",
    ],
    totalStudents: 3,
    gradeDistribution: { A: 1, B: 1, C: 1, D: 0 },
  },
  {
    id: "comp4",
    name: "Mechanical Design",
    gradeLevel: "Junior",
    description: "Mechanical systems and machine design",
    learningOutcomes: [
      "Thermodynamics",
      "Fluid mechanics",
      "Machine design",
      "Manufacturing",
    ],
    totalStudents: 2,
    gradeDistribution: { A: 1, B: 1, C: 0, D: 0 },
  },
];

export const mockAssessments: Assessment[] = [
  {
    id: "a1",
    studentId: "s1",
    competencyId: "comp1",
    grade: "A",
    notes: "Excellent performance",
    createdAt: new Date("2024-12-01"),
  },
  {
    id: "a2",
    studentId: "s2",
    competencyId: "comp1",
    grade: "B",
    notes: "Good understanding",
    createdAt: new Date("2024-12-05"),
  },
  {
    id: "a3",
    studentId: "s5",
    competencyId: "comp2",
    grade: "A",
    notes: "Outstanding work",
    createdAt: new Date("2024-12-02"),
  },
];

// ── Tasks per competency ───────────────────────────────────────────────────
// Each task's subtask maxPoints must sum to 100. Pass threshold = 80.
export const mockTasks: Record<string, Task[]> = {
  Structural: [
    {
      id: "t1",
      label: "Task 1 – Load Analysis",
      subTasks: [
        { id: "t1s1", label: "Dead Load Calculation", maxPoints: 30 },
        { id: "t1s2", label: "Live Load Calculation", maxPoints: 30 },
        { id: "t1s3", label: "Load Combination", maxPoints: 40 },
      ],
    },
    {
      id: "t2",
      label: "Task 2 – Material Selection",
      subTasks: [
        { id: "t2s1", label: "Material Properties", maxPoints: 35 },
        { id: "t2s2", label: "Cost Analysis", maxPoints: 30 },
        { id: "t2s3", label: "Sustainability Check", maxPoints: 35 },
      ],
    },
    {
      id: "t3",
      label: "Task 3 – Safety Standards",
      subTasks: [
        { id: "t3s1", label: "Code Compliance", maxPoints: 40 },
        { id: "t3s2", label: "Safety Factor", maxPoints: 35 },
        { id: "t3s3", label: "Risk Assessment", maxPoints: 25 },
      ],
    },
  ],
  Civil: [
    {
      id: "t1",
      label: "Task 1 – Site Analysis",
      subTasks: [
        { id: "t1s1", label: "Topographic Survey", maxPoints: 35 },
        { id: "t1s2", label: "Soil Investigation", maxPoints: 35 },
        { id: "t1s3", label: "Environmental Impact", maxPoints: 30 },
      ],
    },
    {
      id: "t2",
      label: "Task 2 – Design Principles",
      subTasks: [
        { id: "t2s1", label: "Structural Layout", maxPoints: 40 },
        { id: "t2s2", label: "Drainage Design", maxPoints: 30 },
        { id: "t2s3", label: "Traffic Flow", maxPoints: 30 },
      ],
    },
    {
      id: "t3",
      label: "Task 3 – Regulations",
      subTasks: [
        { id: "t3s1", label: "Permit Requirements", maxPoints: 40 },
        { id: "t3s2", label: "Zoning Compliance", maxPoints: 35 },
        { id: "t3s3", label: "Safety Codes", maxPoints: 25 },
      ],
    },
  ],
  Electrical: [
    {
      id: "t1",
      label: "Task 1 – Circuit Analysis",
      subTasks: [
        { id: "t1s1", label: "Series Circuits", maxPoints: 35 },
        { id: "t1s2", label: "Parallel Circuits", maxPoints: 35 },
        { id: "t1s3", label: "Mixed Circuits", maxPoints: 30 },
      ],
    },
    {
      id: "t2",
      label: "Task 2 – Power Distribution",
      subTasks: [
        { id: "t2s1", label: "Load Balancing", maxPoints: 40 },
        { id: "t2s2", label: "Transformer Sizing", maxPoints: 30 },
        { id: "t2s3", label: "Cable Sizing", maxPoints: 30 },
      ],
    },
    {
      id: "t3",
      label: "Task 3 – Safety Protocols",
      subTasks: [
        { id: "t3s1", label: "Earthing & Bonding", maxPoints: 40 },
        { id: "t3s2", label: "Protection Devices", maxPoints: 35 },
        { id: "t3s3", label: "Inspection Checklist", maxPoints: 25 },
      ],
    },
  ],
  Mechanical: [
    {
      id: "t1",
      label: "Task 1 – Thermodynamics",
      subTasks: [
        { id: "t1s1", label: "Heat Transfer", maxPoints: 35 },
        { id: "t1s2", label: "Thermodynamic Cycles", maxPoints: 35 },
        { id: "t1s3", label: "Energy Balance", maxPoints: 30 },
      ],
    },
    {
      id: "t2",
      label: "Task 2 – Fluid Mechanics",
      subTasks: [
        { id: "t2s1", label: "Flow Analysis", maxPoints: 40 },
        { id: "t2s2", label: "Pipe Sizing", maxPoints: 30 },
        { id: "t2s3", label: "Pump Selection", maxPoints: 30 },
      ],
    },
    {
      id: "t3",
      label: "Task 3 – Machine Design",
      subTasks: [
        { id: "t3s1", label: "Stress Analysis", maxPoints: 40 },
        { id: "t3s2", label: "Fatigue & Failure", maxPoints: 35 },
        { id: "t3s3", label: "Tolerances & Fits", maxPoints: 25 },
      ],
    },
  ],
  Software: [
    {
      id: "t1",
      label: "Task 1 – Algorithm Design",
      subTasks: [
        { id: "t1s1", label: "Problem Decomposition", maxPoints: 35 },
        { id: "t1s2", label: "Complexity Analysis", maxPoints: 35 },
        { id: "t1s3", label: "Optimisation", maxPoints: 30 },
      ],
    },
    {
      id: "t2",
      label: "Task 2 – Code Quality",
      subTasks: [
        { id: "t2s1", label: "Readability", maxPoints: 30 },
        { id: "t2s2", label: "Testing Coverage", maxPoints: 40 },
        { id: "t2s3", label: "Documentation", maxPoints: 30 },
      ],
    },
    {
      id: "t3",
      label: "Task 3 – System Architecture",
      subTasks: [
        { id: "t3s1", label: "Component Design", maxPoints: 40 },
        { id: "t3s2", label: "Data Modelling", maxPoints: 35 },
        { id: "t3s3", label: "Scalability Plan", maxPoints: 25 },
      ],
    },
  ],
};
