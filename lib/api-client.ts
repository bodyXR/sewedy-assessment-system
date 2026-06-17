// API Client for Assessment Platform
// Base URL for the backend API
const API_BASE_URL = "http://sewedyassessmentsys.runasp.net/api";

// Types matching backend DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accountId: number;
  fullNameEn: string;
  fullNameAr: string;
  email: string;
  roleName: string; // "Assessor", "Control", "Verifier"
  token: string;
}

export interface SignupRequest {
  nationalId: string;
  email: string;
  password: string;
  fullNameEn: string;
  fullNameAr: string;
  phone?: string;
  role: string; // Set by the specific endpoint
}

export interface StudentCompetency {
  courseId: number;
  competencyName: string;
  assessmentCycleId: number;
  roundNumber?: number;
  cycleStartDate?: string;
  cycleEndDate?: string;
}

export interface Student {
  id: number;
  nationalId: string;
  email: string;
  phone?: string;
  fullNameEn: string;
  fullNameAr: string;
  status?: string;
  className?: string;
  classId?: number;
  isLeader?: boolean;
  isActive: boolean;
  createdAt?: string;
  competencies?: StudentCompetency[]; // Made optional since some students may not have competencies yet
}

export interface Course {
  id: number;
  title: string;
  description: string;
  gradeId?: number;
  gradeName?: string;
  durationHours?: number;
  businessEntity?: string;
  levelStatusId?: number;
  levelName?: string;
}

export interface CourseCreateRequest {
  title: string;
  description: string;
  durationHours?: number;
  levelStatusId?: number;
}

export interface CourseUpdateRequest {
  title?: string;
  description?: string;
  durationHours?: number;
  levelStatusId?: number;
}

export interface Engineer {
  id: number;
  nationalId: string;
  email: string;
  phone?: string;
  fullNameEn: string;
  fullNameAr: string;
  status?: string;
  roleName: string;
  isActive: boolean;
  createdAt?: string;
}

export interface EnrollStudentRequest {
  courseId: number;
  courseRoundId?: number;
  studentIds: number[];
}

export interface EnrolledStudentSummary {
  studentId: number;
  fullNameEn: string;
  fullNameAr: string;
  tasksAssigned: number;
}

export interface EnrollStudentResponse {
  courseId: number;
  competencyName: string;
  courseRoundId: number;
  roundNumber?: number;
  enrolled: EnrolledStudentSummary[];
  alreadyEnrolled: EnrolledStudentSummary[];
  notFound: number[];
}

// Helper function to get auth token from localStorage
function getAuthToken(): string | null {
  if (globalThis.window === undefined) return null;
  const user = localStorage.getItem("user");
  if (!user) return null;
  try {
    const parsed = JSON.parse(user);
    return parsed.token || null;
  } catch {
    return null;
  }
}

// Helper function to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
      mode: "cors", // Explicitly set CORS mode
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `API Error: ${response.status} ${response.statusText}`,
      );
    }

    // Handle empty responses (204 No Content, etc.)
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return undefined as T;
    }

    // Check if response has content before parsing JSON
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return response.json();
    }

    // For other content types or empty responses, return as is
    return undefined as T;
  } catch (error) {
    // Better error handling for network issues
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network Error: Cannot connect to API at ${API_BASE_URL}. ` +
          `Please check: 1) Backend is running, 2) CORS is enabled, 3) URL is correct`,
      );
    }
    throw error;
  }
}

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

export const authApi = {
  /**
   * Login with email and password
   * POST /api/auth/login
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Signup as Assessor
   * POST /api/auth/signup/assessor
   */
  signupAssessor: async (
    data: Omit<SignupRequest, "role">,
  ): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>("/auth/signup/assessor", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Signup as Control
   * POST /api/auth/signup/control
   */
  signupControl: async (
    data: Omit<SignupRequest, "role">,
  ): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>("/auth/signup/control", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Signup as Verifier
   * POST /api/auth/signup/verifier
   */
  signupVerifier: async (
    data: Omit<SignupRequest, "role">,
  ): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>("/auth/signup/verifier", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// STUDENTS ENDPOINTS
// ============================================================================

export const studentsApi = {
  /**
   * Get all students
   * GET /api/students
   */
  getAll: async (): Promise<Student[]> => {
    return apiRequest<Student[]>("/students");
  },

  /**
   * Get student by ID
   * GET /api/students/{id}
   */
  getById: async (id: number): Promise<Student> => {
    return apiRequest<Student>(`/students/${id}`);
  },

  /**
   * Filter students by class name
   * GET /api/students/filter/class?className=SW1
   */
  filterByClass: async (className: string): Promise<Student[]> => {
    return apiRequest<Student[]>(
      `/students/filter/class?className=${encodeURIComponent(className)}`,
    );
  },

  /**
   * Filter students by competency (course name or ID)
   * GET /api/students/filter/competency?competency=NetworkInfra
   */
  filterByCompetency: async (competency: string): Promise<Student[]> => {
    return apiRequest<Student[]>(
      `/students/filter/competency?competency=${encodeURIComponent(competency)}`,
    );
  },

  /**
   * Get students assigned to a specific assessor
   * GET /api/students/filter/assessor/{assessorId}
   */
  getByAssessor: async (assessorId: number): Promise<Student[]> => {
    return apiRequest<Student[]>(`/students/filter/assessor/${assessorId}`);
  },

  /**
   * Filter students by trial status
   * GET /api/students/filter/trial?trialStatus=Trial
   */
  filterByTrial: async (trialStatus: string): Promise<Student[]> => {
    return apiRequest<Student[]>(
      `/students/filter/trial?trialStatus=${encodeURIComponent(trialStatus)}`,
    );
  },

  /**
   * Filter students by assessment status (passed/not passed)
   * GET /api/students/filter/status?status=passed
   */
  filterByStatus: async (status: string): Promise<Student[]> => {
    return apiRequest<Student[]>(
      `/students/filter/status?status=${encodeURIComponent(status)}`,
    );
  },

  /**
   * Combined filter - mix and match className, competency, status
   * GET /api/students/filter?className=SW1&competency=Network&status=passed
   */
  filterCombined: async (filters: {
    className?: string;
    competency?: string;
    status?: string;
  }): Promise<Student[]> => {
    const params = new URLSearchParams();
    if (filters.className) params.append("className", filters.className);
    if (filters.competency) params.append("competency", filters.competency);
    if (filters.status) params.append("status", filters.status);
    return apiRequest<Student[]>(`/students/filter?${params.toString()}`);
  },

  /**
   * Enroll students into a competency (course)
   * POST /api/students/enroll
   */
  enroll: async (
    data: EnrollStudentRequest,
  ): Promise<EnrollStudentResponse> => {
    return apiRequest<EnrollStudentResponse>("/students/enroll", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// COURSES ENDPOINTS
// ============================================================================

export const coursesApi = {
  /**
   * Get all assessment competency courses
   * GET /api/courses
   */
  getAll: async (): Promise<Course[]> => {
    return apiRequest<Course[]>("/courses");
  },

  /**
   * Get course by ID
   * GET /api/courses/{id}
   */
  getById: async (id: number): Promise<Course> => {
    return apiRequest<Course>(`/courses/${id}`);
  },

  /**
   * Filter courses by grade name or ID
   * GET /api/courses/filter/grade?grade=Software
   */
  filterByGrade: async (grade: string): Promise<Course[]> => {
    return apiRequest<Course[]>(
      `/courses/filter/grade?grade=${encodeURIComponent(grade)}`,
    );
  },

  /**
   * Create new course
   * POST /api/courses
   */
  create: async (data: CourseCreateRequest): Promise<Course> => {
    return apiRequest<Course>("/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update course
   * PUT /api/courses/{id}
   */
  update: async (id: number, data: CourseUpdateRequest): Promise<Course> => {
    return apiRequest<Course>(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete course
   * DELETE /api/courses/{id}
   */
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/courses/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================================================
// ENGINEERS ENDPOINTS
// ============================================================================

export const engineersApi = {
  /**
   * Get all engineers (assessors, verifiers, controllers)
   * GET /api/engineers
   */
  getAll: async (): Promise<Engineer[]> => {
    return apiRequest<Engineer[]>("/engineers");
  },
};

// ============================================================================
// COURSE MATERIALS (TASKS) ENDPOINTS
// ============================================================================

export interface CourseMaterial {
  id: number;
  title: string;
  description?: string;
  link?: string;
  courseId?: number;
  courseName?: string;
  statusId?: number;
  statusName?: string;
  weekId?: number;
  parentMaterialId?: number; // For subtasks
}

export interface CourseMaterialCreateRequest {
  title: string;
  description?: string;
  link?: string;
  courseId: number;
  weekId?: number;
  createdByAccountId?: number;
  parentMaterialId?: number; // For creating subtasks
}

export interface CourseMaterialUpdateRequest {
  title?: string;
  description?: string;
  link?: string;
  weekId?: number;
  statusId?: number;
}

// Legacy types for backward compatibility
export interface CourseMaterialTask {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  orderIndex?: number;
  maxPoints: number;
  createdAt?: string;
}

export interface CourseMaterialRequest {
  courseId: number;
  title: string;
  description?: string;
  orderIndex?: number;
  maxPoints: number;
}

export const courseMaterialsApi = {
  /**
   * Get all materials, optionally filtered by courseId
   * GET /api/coursematerial
   * GET /api/coursematerial?courseId=3
   */
  getAll: async (courseId?: number): Promise<CourseMaterial[]> => {
    const url = courseId
      ? `/coursematerial?courseId=${courseId}`
      : "/coursematerial";
    return apiRequest<CourseMaterial[]>(url);
  },

  /**
   * Get all tasks for a course (alias for getAll with courseId)
   * GET /api/coursematerial?courseId={courseId}
   */
  getByCourse: async (courseId: number): Promise<CourseMaterial[]> => {
    return apiRequest<CourseMaterial[]>(`/coursematerial?courseId=${courseId}`);
  },

  /**
   * Get single material by ID
   * GET /api/coursematerial/{id}
   */
  getById: async (id: number): Promise<CourseMaterial> => {
    return apiRequest<CourseMaterial>(`/coursematerial/${id}`);
  },

  /**
   * Create new material (task or subtask)
   * POST /api/coursematerial
   */
  create: async (
    data: CourseMaterialCreateRequest,
  ): Promise<CourseMaterial> => {
    return apiRequest<CourseMaterial>("/coursematerial", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update material
   * PUT /api/coursematerial/{id}
   */
  update: async (
    id: number,
    data: CourseMaterialUpdateRequest,
  ): Promise<CourseMaterial> => {
    return apiRequest<CourseMaterial>(`/coursematerial/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete material
   * DELETE /api/coursematerial/{id}
   */
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/coursematerial/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================================================
// COURSE ROUNDS (ASSESSMENT CYCLES) ENDPOINTS
// ============================================================================

export interface CourseRound {
  id: number;
  courseId: number;
  roundNumber: number;
  startDate?: string;
  endDate?: string;
  statusId: number; // 1 = active, 0 = inactive
  competencyName?: string;
  createdAt?: string;
}

export interface CourseRoundRequest {
  courseId: number;
  roundNumber: number;
  startDate?: string;
  endDate?: string;
  statusId?: number; // 1 = active, 0 = inactive
}

export const courseRoundsApi = {
  /**
   * Get all course rounds (assessment cycles)
   * GET /api/courserounds
   */
  getAll: async (): Promise<CourseRound[]> => {
    return apiRequest<CourseRound[]>("/courseround");
  },

  /**
   * Get course rounds for a specific course
   * GET /api/courseround?courseId={courseId}
   */
  getByCourse: async (courseId: number): Promise<CourseRound[]> => {
    return apiRequest<CourseRound[]>(`/courseround?courseId=${courseId}`);
  },

  /**
   * Get single course round by ID
   * GET /api/courserounds/{id}
   */
  getById: async (id: number): Promise<CourseRound> => {
    return apiRequest<CourseRound>(`/courseround/${id}`);
  },

  /**
   * Create new course round (assessment cycle)
   * POST /api/courserounds
   */
  create: async (data: CourseRoundRequest): Promise<CourseRound> => {
    return apiRequest<CourseRound>("/courseround", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update course round
   * PUT /api/courseround/{id}
   */
  update: async (
    id: number,
    data: CourseRoundRequest,
  ): Promise<CourseRound> => {
    return apiRequest<CourseRound>(`/courseround/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete course round
   * DELETE /api/courseround/{id}
   */
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/courseround/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================================================
// ASSESSMENTS ENDPOINTS
// ============================================================================

export interface AssessmentSubTaskScore {
  subTaskId: number;
  subTaskTitle: string;
  pointsEarned: number;
  maxPoints: number;
  notes?: string;
}

export interface AssessmentTaskScore {
  taskId: number;
  taskTitle: string;
  subTasks: AssessmentSubTaskScore[];
  totalPoints: number;
  maxPoints: number;
}

export interface Assessment {
  id: number;
  studentId: number;
  assessorId: number;
  courseRoundId: number;
  status: string; // "Draft", "Submitted", "Verified"
  tasks: AssessmentTaskScore[];
  totalScore: number;
  maxScore: number;
  notes?: string;
  submittedAt?: string;
  verifiedAt?: string;
  verifierId?: number;
  createdAt?: string;
}

export interface AssessmentRequest {
  studentId: number;
  assessorId: number;
  courseRoundId: number;
  tasks: {
    taskId: number;
    subTasks: {
      subTaskId: number;
      pointsEarned: number;
      notes?: string;
    }[];
  }[];
  notes?: string;
}

// ============================================================================
// COURSE ROUND ASSIGNMENT TYPES (For Verifier Monitor)
// ============================================================================

export interface CourseRoundAssignment {
  id: number;
  title: string;
  description?: string;
  assignmentLink?: string;
  deadline: string;
  totalGrade: number;
  createdAt: string;
  courseId: number;
  courseName?: string;
  instructorId: number;
  instructorName?: string;
  courseMaterialId?: number;
  taskTitle?: string;
  statusId?: number;
  statusName?: string;
}

export interface CourseRoundAssignmentCreateRequest {
  title: string;
  description?: string;
  assignmentLink?: string;
  deadline: string;
  totalGrade: number;
  courseId: number;
  instructorId: number;
  courseMaterialId?: number;
}

export interface CourseRoundAssignmentUpdateRequest {
  title?: string;
  description?: string;
  assignmentLink?: string;
  deadline?: string;
  totalGrade?: number;
  statusId?: number;
  courseMaterialId?: number;
}

export const assessmentsApi = {
  /**
   * Get all assessments
   * GET /api/assessments
   */
  getAll: async (): Promise<Assessment[]> => {
    return apiRequest<Assessment[]>("/assessments");
  },

  /**
   * Get assessment by ID
   * GET /api/assessments/{id}
   */
  getById: async (id: number): Promise<Assessment> => {
    return apiRequest<Assessment>(`/assessments/${id}`);
  },

  /**
   * Get assessments for a student
   * GET /api/assessments/student/{studentId}
   */
  getByStudent: async (studentId: number): Promise<Assessment[]> => {
    return apiRequest<Assessment[]>(`/assessments/student/${studentId}`);
  },

  /**
   * Get assessments by assessor
   * GET /api/assessments/assessor/{assessorId}
   */
  getByAssessor: async (assessorId: number): Promise<Assessment[]> => {
    return apiRequest<Assessment[]>(`/assessments/assessor/${assessorId}`);
  },

  /**
   * Get assessments by course round
   * GET /api/assessments/courseround/{courseRoundId}
   */
  getByCourseRound: async (courseRoundId: number): Promise<Assessment[]> => {
    return apiRequest<Assessment[]>(
      `/assessments/courseround/${courseRoundId}`,
    );
  },

  /**
   * Get assessments by status
   * GET /api/assessments/status/{status}
   */
  getByStatus: async (status: string): Promise<Assessment[]> => {
    return apiRequest<Assessment[]>(`/assessments/status/${status}`);
  },

  /**
   * Create new assessment (draft)
   * POST /api/assessments
   */
  create: async (data: AssessmentRequest): Promise<Assessment> => {
    return apiRequest<Assessment>("/assessments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update assessment
   * PUT /api/assessments/{id}
   */
  update: async (id: number, data: AssessmentRequest): Promise<Assessment> => {
    return apiRequest<Assessment>(`/assessments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Submit assessment (change status from Draft to Submitted)
   * POST /api/assessments/{id}/submit
   */
  submit: async (id: number): Promise<Assessment> => {
    return apiRequest<Assessment>(`/assessments/${id}/submit`, {
      method: "POST",
    });
  },

  /**
   * Mark assessment as verified (for monitoring)
   * POST /api/assessments/{id}/verify
   */
  verify: async (id: number, verifierId: number): Promise<Assessment> => {
    return apiRequest<Assessment>(`/assessments/{id}/verify`, {
      method: "POST",
      body: JSON.stringify({ verifierId }),
    });
  },

  /**
   * Delete assessment
   * DELETE /api/assessments/{id}
   */
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/assessments/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================================================
// COURSE ROUND ASSIGNMENTS ENDPOINTS (For Verifier Monitor)
// ============================================================================

export const courseRoundAssignmentsApi = {
  /**
   * Get all assignments, optionally filtered by courseId
   * GET /api/courseroundassignment
   * GET /api/courseroundassignment?courseId=3
   */
  getAll: async (courseId?: number): Promise<CourseRoundAssignment[]> => {
    const url = courseId
      ? `/courseroundassignment?courseId=${courseId}`
      : "/courseroundassignment";
    return apiRequest<CourseRoundAssignment[]>(url);
  },

  /**
   * Get assignment by ID
   * GET /api/courseroundassignment/{id}
   */
  getById: async (id: number): Promise<CourseRoundAssignment> => {
    return apiRequest<CourseRoundAssignment>(`/courseroundassignment/${id}`);
  },

  /**
   * Create new assignment
   * POST /api/courseroundassignment
   */
  create: async (
    data: CourseRoundAssignmentCreateRequest,
  ): Promise<CourseRoundAssignment> => {
    return apiRequest<CourseRoundAssignment>("/courseroundassignment", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update assignment
   * PUT /api/courseroundassignment/{id}
   */
  update: async (
    id: number,
    data: CourseRoundAssignmentUpdateRequest,
  ): Promise<CourseRoundAssignment> => {
    return apiRequest<CourseRoundAssignment>(`/courseroundassignment/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete assignment
   * DELETE /api/courseroundassignment/{id}
   */
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/courseroundassignment/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================================================
// COURSE ROUND INSTRUCTORS (ROLE ASSIGNMENTS) ENDPOINTS
// ============================================================================

export interface CourseRoundInstructor {
  id: number;
  courseRoundId: number;
  accountId: number;
  instructorName: string;
  instructorEmail: string;
  roleName: string; // "Assessor" or "Verifier"
  assignedAt?: string;
}

export interface CourseRoundInstructorRequest {
  courseRoundId: number;
  accountId: number;
  roleId: number; // Role ID (not role name)
}

export const courseRoundInstructorsApi = {
  /**
   * Get all instructor assignments
   * GET /api/courseroundinstructors
   */
  getAll: async (): Promise<CourseRoundInstructor[]> => {
    return apiRequest<CourseRoundInstructor[]>("/courseroundinstructors");
  },

  /**
   * Get instructors for a course round
   * GET /api/courseroundinstructors/courseround/{courseRoundId}
   */
  getByCourseRound: async (
    courseRoundId: number,
  ): Promise<CourseRoundInstructor[]> => {
    return apiRequest<CourseRoundInstructor[]>(
      `/courseroundinstructors/courseround/${courseRoundId}`,
    );
  },

  /**
   * Get assignments for an instructor
   * GET /api/courseroundinstructors/instructor/{accountId}
   */
  getByInstructor: async (
    accountId: number,
  ): Promise<CourseRoundInstructor[]> => {
    return apiRequest<CourseRoundInstructor[]>(
      `/courseroundinstructors/instructor/${accountId}`,
    );
  },

  /**
   * Assign instructor to course round
   * POST /api/courseroundinstructors
   */
  create: async (
    data: CourseRoundInstructorRequest,
  ): Promise<CourseRoundInstructor> => {
    return apiRequest<CourseRoundInstructor>("/courseroundinstructors", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Remove instructor assignment
   * DELETE /api/courseroundinstructors/{id}
   */
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/courseroundinstructors/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Update instructor role
   * PUT /api/courseroundinstructors/{id}/role
   */
  updateRole: async (
    id: number,
    roleId: number,
  ): Promise<CourseRoundInstructor> => {
    return apiRequest<CourseRoundInstructor>(
      `/courseroundinstructors/${id}/role`,
      {
        method: "PUT",
        body: JSON.stringify({ roleId }),
      },
    );
  },
};

// ============================================================================
// COMPETENCY RESULTS ENDPOINTS
// ============================================================================

export interface CompetencyResult {
  id: number;
  studentId: number;
  studentName?: string;
  courseId: number;
  courseName?: string;
  courseRoundId: number;
  roundNumber?: number;
  totalScore?: number;
  maxScore?: number;
  scorePercentage?: number;
  resultStatusId: number;
  resultStatusName?: string;
  assessorId: number;
  assessorName?: string;
  notes?: string;
  gradedAt: string;
  createdAt: string;
}

export interface CompetencyResultCreateRequest {
  studentId: number;
  courseId: number;
  courseRoundId: number;
  totalScore?: number;
  maxScore?: number;
  resultStatusId: number;
  assessorId: number;
  notes?: string;
  gradedAt?: string;
}

export interface CompetencyResultUpdateRequest {
  totalScore?: number;
  maxScore?: number;
  resultStatusId?: number;
  notes?: string;
  gradedAt?: string;
}

export const competencyResultsApi = {
  /**
   * Get competency results with optional filters
   * GET /api/competencyresult
   * GET /api/competencyresult?studentId=5
   * GET /api/competencyresult?courseId=3
   * GET /api/competencyresult?courseRoundId=10
   */
  getAll: async (filters?: {
    studentId?: number;
    courseId?: number;
    courseRoundId?: number;
  }): Promise<CompetencyResult[]> => {
    const params = new URLSearchParams();
    if (filters?.studentId)
      params.append("studentId", filters.studentId.toString());
    if (filters?.courseId)
      params.append("courseId", filters.courseId.toString());
    if (filters?.courseRoundId)
      params.append("courseRoundId", filters.courseRoundId.toString());

    const url = params.toString()
      ? `/competencyresult?${params.toString()}`
      : "/competencyresult";
    return apiRequest<CompetencyResult[]>(url);
  },

  /**
   * Get competency result by ID
   * GET /api/competencyresult/{id}
   */
  getById: async (id: number): Promise<CompetencyResult> => {
    return apiRequest<CompetencyResult>(`/competencyresult/${id}`);
  },

  /**
   * Create competency result
   * POST /api/competencyresult
   */
  create: async (
    data: CompetencyResultCreateRequest,
  ): Promise<CompetencyResult> => {
    return apiRequest<CompetencyResult>("/competencyresult", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update competency result
   * PUT /api/competencyresult/{id}
   */
  update: async (
    id: number,
    data: CompetencyResultUpdateRequest,
  ): Promise<CompetencyResult> => {
    return apiRequest<CompetencyResult>(`/competencyresult/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete competency result
   * DELETE /api/competencyresult/{id}
   */
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/competencyresult/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================================================
// REPORTS & ACTIVITY LOG ENDPOINTS
// ============================================================================

export interface ControllerReport {
  id: number;
  cycleId: number;
  reportType: string;
  title: string;
  content?: string;
  generatedAt: string;
  generatedBy?: number;
}

export interface CreateReportRequest {
  cycleId: number;
  reportType?: string;
  title: string;
  content: string;
  generatedBy?: number;
}

export interface ActivityLog {
  id: number;
  userId?: number;
  actionType: string;
  entityType: string;
  entityId?: number;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface CreateActivityLogRequest {
  userId?: number;
  actionType: string;
  entityType: string;
  entityId?: number;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
}

export const reportsApi = {
  /**
   * Get all controller reports
   * GET /api/reports/controller-reports
   * GET /api/reports/controller-reports?cycleId=5
   */
  getControllerReports: async (
    cycleId?: number,
  ): Promise<ControllerReport[]> => {
    const url = cycleId
      ? `/reports/controller-reports?cycleId=${cycleId}`
      : "/reports/controller-reports";
    return apiRequest<ControllerReport[]>(url);
  },

  /**
   * Get controller report by ID
   * GET /api/reports/controller-reports/{id}
   */
  getControllerReportById: async (id: number): Promise<ControllerReport> => {
    return apiRequest<ControllerReport>(`/reports/controller-reports/${id}`);
  },

  /**
   * Create a new controller report (sent by verifier)
   * POST /api/reports/controller-reports
   */
  createControllerReport: async (
    data: CreateReportRequest,
  ): Promise<ControllerReport> => {
    return apiRequest<ControllerReport>("/reports/controller-reports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get activity log (audit log)
   * GET /api/reports/activity-log
   * GET /api/reports/activity-log?entityType=Assessment&limit=50
   */
  getActivityLog: async (filters?: {
    cycleId?: number;
    entityType?: string;
    actionType?: string;
    limit?: number;
  }): Promise<ActivityLog[]> => {
    const params = new URLSearchParams();
    if (filters?.cycleId) params.append("cycleId", filters.cycleId.toString());
    if (filters?.entityType) params.append("entityType", filters.entityType);
    if (filters?.actionType) params.append("actionType", filters.actionType);
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const url = params.toString()
      ? `/reports/activity-log?${params.toString()}`
      : "/reports/activity-log";
    return apiRequest<ActivityLog[]>(url);
  },

  /**
   * Create activity log entry
   * POST /api/reports/activity-log
   */
  createActivityLog: async (
    data: CreateActivityLogRequest,
  ): Promise<{ id: number; createdAt: string }> => {
    return apiRequest<{ id: number; createdAt: string }>(
      "/reports/activity-log",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },
};

// Export a combined API object
export const api = {
  auth: authApi,
  students: studentsApi,
  courses: coursesApi,
  engineers: engineersApi,
  courseMaterials: courseMaterialsApi,
  courseRounds: courseRoundsApi,
  assessments: assessmentsApi,
  courseRoundAssignments: courseRoundAssignmentsApi,
  courseRoundInstructors: courseRoundInstructorsApi,
  competencyResults: competencyResultsApi,
  reports: reportsApi,
};

export default api;
