import { useState, useEffect } from "react";
import {
  api,
  type Student,
  type Course,
  type Engineer,
} from "@/lib/api-client";

// Generic hook for API calls with loading and error states
export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: any[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await queryFn();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [...dependencies, refetchTrigger]);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  return { data, isLoading, error, refetch };
}

// ============================================================================
// STUDENTS HOOKS
// ============================================================================

export function useStudents() {
  return useApiQuery<Student[]>(() => api.students.getAll());
}

export function useStudent(id: number | null) {
  return useApiQuery<Student | null>(
    () => (id ? api.students.getById(id) : Promise.resolve(null)),
    [id],
  );
}

export function useStudentsByClass(className: string | null) {
  return useApiQuery<Student[]>(
    () =>
      className ? api.students.filterByClass(className) : Promise.resolve([]),
    [className],
  );
}

export function useStudentsByCompetency(competency: string | null) {
  return useApiQuery<Student[]>(
    () =>
      competency
        ? api.students.filterByCompetency(competency)
        : Promise.resolve([]),
    [competency],
  );
}

export function useStudentsByAssessor(assessorId: number | null) {
  return useApiQuery<Student[]>(
    () =>
      assessorId ? api.students.getByAssessor(assessorId) : Promise.resolve([]),
    [assessorId],
  );
}

export function useStudentsByStatus(status: string | null) {
  return useApiQuery<Student[]>(
    () => (status ? api.students.filterByStatus(status) : Promise.resolve([])),
    [status],
  );
}

export function useStudentsFiltered(filters: {
  className?: string;
  competency?: string;
  status?: string;
}) {
  return useApiQuery<Student[]>(() => {
    const hasFilters =
      filters.className || filters.competency || filters.status;
    return hasFilters
      ? api.students.filterCombined(filters)
      : api.students.getAll();
  }, [filters.className, filters.competency, filters.status]);
}

// ============================================================================
// COURSES HOOKS
// ============================================================================

export function useCourses() {
  return useApiQuery<Course[]>(() => api.courses.getAll());
}

export function useCoursesByGrade(grade: string | null) {
  return useApiQuery<Course[]>(
    () => (grade ? api.courses.filterByGrade(grade) : api.courses.getAll()),
    [grade],
  );
}

// ============================================================================
// ENGINEERS HOOKS
// ============================================================================

export function useEngineers() {
  return useApiQuery<Engineer[]>(() => api.engineers.getAll());
}

// ============================================================================
// MUTATION HOOKS (for POST/PUT/DELETE operations)
// ============================================================================

export function useEnrollStudents() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const enroll = async (
    courseId: number,
    studentIds: number[],
    courseRoundId?: number,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.students.enroll({
        courseId,
        studentIds,
        courseRoundId,
      });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Enrollment failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { enroll, isLoading, error };
}

// ============================================================================
// COURSE MATERIALS (TASKS) HOOKS
// ============================================================================

export function useCourseMaterials(courseId: number | null) {
  return useApiQuery(
    () =>
      courseId
        ? api.courseMaterials.getByCourse(courseId)
        : Promise.resolve([]),
    [courseId],
  );
}

export function useCourseMaterial(id: number | null) {
  return useApiQuery(
    () => (id ? api.courseMaterials.getById(id) : Promise.resolve(null)),
    [id],
  );
}

// ============================================================================
// COURSE ROUNDS (ASSESSMENT CYCLES) HOOKS
// ============================================================================

export function useCourseRounds() {
  return useApiQuery(() => api.courseRounds.getAll());
}

export function useCourseRoundsByCourse(courseId: number | null) {
  return useApiQuery(
    () =>
      courseId ? api.courseRounds.getByCourse(courseId) : Promise.resolve([]),
    [courseId],
  );
}

export function useCourseRound(id: number | null) {
  return useApiQuery(
    () => (id ? api.courseRounds.getById(id) : Promise.resolve(null)),
    [id],
  );
}

// ============================================================================
// COURSE ROUND ASSIGNMENTS HOOKS (For Verifier Monitor)
// ============================================================================

export function useCourseRoundAssignments(courseId?: number) {
  return useApiQuery(
    () => api.courseRoundAssignments.getAll(courseId),
    [courseId],
  );
}

export function useCourseRoundAssignment(id: number | null) {
  return useApiQuery(
    () => (id ? api.courseRoundAssignments.getById(id) : Promise.resolve(null)),
    [id],
  );
}

// ============================================================================
// ASSESSMENTS HOOKS
// ============================================================================

export function useAssessments() {
  return useApiQuery(() => api.assessments.getAll());
}

export function useAssessment(id: number | null) {
  return useApiQuery(
    () => (id ? api.assessments.getById(id) : Promise.resolve(null)),
    [id],
  );
}

export function useAssessmentsByStudent(studentId: number | null) {
  return useApiQuery(
    () =>
      studentId ? api.assessments.getByStudent(studentId) : Promise.resolve([]),
    [studentId],
  );
}

export function useAssessmentsByAssessor(assessorId: number | null) {
  return useApiQuery(
    () =>
      assessorId
        ? api.assessments.getByAssessor(assessorId)
        : Promise.resolve([]),
    [assessorId],
  );
}

export function useAssessmentsByCourseRound(courseRoundId: number | null) {
  return useApiQuery(
    () =>
      courseRoundId
        ? api.assessments.getByCourseRound(courseRoundId)
        : Promise.resolve([]),
    [courseRoundId],
  );
}

export function useAssessmentsByStatus(status: string | null) {
  return useApiQuery(
    () => (status ? api.assessments.getByStatus(status) : Promise.resolve([])),
    [status],
  );
}

// ============================================================================
// COURSE ROUND INSTRUCTORS (ROLE ASSIGNMENTS) HOOKS
// ============================================================================

export function useCourseRoundInstructors() {
  return useApiQuery(() => api.courseRoundInstructors.getAll());
}

export function useCourseRoundInstructorsByCourseRound(
  courseRoundId: number | null,
) {
  return useApiQuery(
    () =>
      courseRoundId
        ? api.courseRoundInstructors.getByCourseRound(courseRoundId)
        : Promise.resolve([]),
    [courseRoundId],
  );
}

export function useCourseRoundInstructorsByInstructor(
  accountId: number | null,
) {
  return useApiQuery(
    () =>
      accountId
        ? api.courseRoundInstructors.getByInstructor(accountId)
        : Promise.resolve([]),
    [accountId],
  );
}

// ============================================================================
// MUTATION HOOKS FOR CREATE/UPDATE/DELETE OPERATIONS
// ============================================================================

export function useCreateCourseMaterial() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.courseMaterials.create(data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Creation failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createBatch = async (materials: any[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = [];
      for (const material of materials) {
        const result = await api.courseMaterials.create(material);
        results.push(result);
      }
      return results;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Batch creation failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { create, createBatch, isLoading, error };
}

export function useCreateCourseRound() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.courseRounds.create(data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Creation failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (id: number, data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.courseRounds.update(id, data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Update failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCycle = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.courseRounds.delete(id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Delete failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { create, update, deleteCycle, isLoading, error };
}

export function useCreateAssessment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.assessments.create(data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Creation failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const submit = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.assessments.submit(id);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Submission failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verify = async (id: number, verifierId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.assessments.verify(id, verifierId);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Verification failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { create, submit, verify, isLoading, error };
}

export function useAssignInstructor() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const assign = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.courseRoundInstructors.create(data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Assignment failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.courseRoundInstructors.delete(id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Removal failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRole = async (id: number, roleId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.courseRoundInstructors.updateRole(id, roleId);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Update failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { assign, remove, updateRole, isLoading, error };
}

export function useCreateCourse() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.courses.create(data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Creation failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (id: number, data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.courses.update(id, data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Update failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.courses.delete(id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Delete failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { create, update, deleteCourse, isLoading, error };
}

export function useCreateCourseRoundAssignment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.courseRoundAssignments.create(data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Creation failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { create, isLoading, error };
}
