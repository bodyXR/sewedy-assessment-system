"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useApiQuery } from "@/hooks/use-api";
import { api } from "@/lib/api-client";
import type {
  Student,
  Competency,
  GradeLevel,
  CompetencyType,
  Task,
  SubTask,
} from "@/lib/types";
import { AssessmentForm } from "@/components/assess/assessment-form";
import type { AssessmentFormData } from "@/components/assess/assessment-form";

export default function AssessStudentPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch student data
  const {
    data: student,
    isLoading: loadingStudent,
    error: studentError,
  } = useApiQuery(() => api.students.getById(Number(studentId)), [studentId]);

  // Get the course ID from student's competencies
  const courseId = student?.competencies?.[0]?.courseId;
  let courseRoundId = student?.competencies?.[0]?.assessmentCycleId;

  // If no courseRoundId in student data, try to get active round for the course
  const { data: courseRounds } = useApiQuery(
    () =>
      courseId && !courseRoundId
        ? api.courseRounds.getByCourse(courseId)
        : Promise.resolve([]),
    [courseId, courseRoundId],
  );

  // Use the first active round or the most recent round
  if (!courseRoundId && courseRounds && courseRounds.length > 0) {
    const activeRound = courseRounds.find((r) => r.statusId === 1);
    courseRoundId =
      activeRound?.id || courseRounds[courseRounds.length - 1]?.id;
  }

  console.log("Assessment page state:", {
    studentId,
    student,
    loadingStudent,
    studentError,
    courseId,
    courseRoundId,
    courseRounds,
  });

  // Fetch existing assessment results for this student
  const {
    data: existingResults,
    isLoading: loadingResults,
    refetch: refetchResults,
  } = useApiQuery(() => {
    console.log("=== FETCHING RESULTS ===", {
      studentId,
      courseId,
      courseRoundId,
      shouldFetch: !!courseId,
    });

    if (!courseId) {
      console.log("Skipping results fetch - missing courseId");
      return Promise.resolve([]);
    }

    // Fetch with available filters (courseRoundId is optional)
    const filters: any = {
      studentId: Number(studentId),
      courseId: courseId,
    };

    if (courseRoundId) {
      filters.courseRoundId = courseRoundId;
    }

    console.log("Fetching with filters:", filters);
    return api.competencyResults.getAll(filters);
  }, [studentId, courseId, courseRoundId]);

  console.log("Existing results state:", {
    existingResults,
    loadingResults,
    resultsCount: existingResults?.length || 0,
  });

  // Determine current trial and lock status
  const TRIAL_LETTERS: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
  const PASS_STATUS_ID = 53;

  // Check if student has passed
  const hasPassed = existingResults?.some(
    (result) => result.resultStatusId === PASS_STATUS_ID,
  );

  // Count attempts (number of existing results)
  const attemptCount = existingResults?.length || 0;
  const currentTrial: "A" | "B" | "C" | "D" =
    hasPassed || attemptCount >= 4
      ? TRIAL_LETTERS[Math.min(attemptCount - 1, 3)]
      : TRIAL_LETTERS[attemptCount];

  // Lock if passed or exceeded max attempts
  const isLocked = hasPassed || attemptCount >= 4;

  console.log("Trial calculation:", {
    hasPassed,
    attemptCount,
    currentTrial,
    isLocked,
  });

  // Fetch assignments for the student's course
  const {
    data: assignments,
    isLoading: loadingAssignments,
    error: assignmentsError,
  } = useApiQuery(
    () =>
      courseId
        ? api.courseRoundAssignments.getAll(courseId)
        : Promise.resolve([]),
    [courseId],
  );

  console.log("Assignments state:", {
    courseId,
    assignments,
    loadingAssignments,
    assignmentsError,
  });

  const isCycleClosed = false; // TODO: Check if cycle is closed

  // Convert CourseRoundAssignments to Task format expected by AssessmentForm
  const tasks: Task[] = useMemo(() => {
    console.log("=== CONVERTING ASSIGNMENTS TO TASKS ===");
    console.log("Assignments:", assignments);

    if (!assignments || assignments.length === 0) {
      console.log("No assignments found, returning empty array");
      return [];
    }

    const convertedTasks = assignments.map((assignment) => {
      // Parse subtasks from description
      // Format: "Subtasks: name1: X points, name2: Y points"
      const subtasks: SubTask[] = [];

      if (assignment.description) {
        const subtaskMatch = assignment.description.match(/Subtasks:\s*(.+)/);
        if (subtaskMatch) {
          const subtaskStr = subtaskMatch[1];
          const parts = subtaskStr.split(/,\s*/);

          parts.forEach((part, index) => {
            const match = part.match(/^(.+?):\s*(\d+(?:\.\d+)?)\s*points?$/);
            if (match) {
              subtasks.push({
                id: `${assignment.id}-${index}`,
                label: match[1].trim(),
                maxPoints: Number.parseFloat(match[2]),
              });
            }
          });
        }
      }

      // If no subtasks found in description, create a default one with full points
      if (subtasks.length === 0) {
        subtasks.push({
          id: `${assignment.id}-0`,
          label: "Complete Assignment",
          maxPoints: assignment.totalGrade,
        });
      }

      const task = {
        id: assignment.id.toString(),
        label: assignment.title,
        subTasks: subtasks,
      };

      console.log("Converted assignment to task:", task);
      return task;
    });

    console.log("Final converted tasks:", convertedTasks);
    return convertedTasks;
  }, [assignments]);

  const handleSubmit = async (data: AssessmentFormData) => {
    console.log("=== handleSubmit CALLED ===");
    console.log("Form data received:", data);

    if (!student || !courseId || !user) {
      console.error("Missing required data:", { student, courseId, user });
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive",
      });
      return;
    }

    console.log("Submitting assessment:", {
      student,
      courseId,
      user,
      competencies: student.competencies,
    });

    try {
      // Calculate total score and max score from the scores
      let totalScore = 0;
      let maxScore = 0;

      // data.scores is { "taskId.subtaskId": points }
      // We need to sum all the scores
      tasks.forEach((task) => {
        task.subTasks.forEach((subtask) => {
          const key = `${task.id}.${subtask.id}`;
          const score = data.scores[key] || 0;
          totalScore += score;
          maxScore += subtask.maxPoints;
        });
      });

      // Status IDs from database
      const PASS_STATUS_ID = 53; // Pass status
      const FAIL_STATUS_ID = 54; // Not Pass status

      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
      const passed = percentage >= 80; // PASS_THRESHOLD from form
      const resultStatusId = passed ? PASS_STATUS_ID : FAIL_STATUS_ID;

      // Get courseRoundId - try multiple sources
      let roundId = courseRoundId;

      // If not in student data, try to get from API
      if (!roundId) {
        try {
          const courseRounds = await api.courseRounds.getByCourse(courseId);

          if (courseRounds.length > 0) {
            // Find active round (statusId = 1)
            const activeCourseRound = courseRounds.find(
              (cr) => cr.statusId === 1,
            );
            if (activeCourseRound) {
              roundId = activeCourseRound.id;
            } else {
              // Use most recent round
              roundId = courseRounds[courseRounds.length - 1].id;
            }
          }
        } catch (error) {
          console.error("Error fetching course rounds:", error);
        }
      }

      // Still no roundId - we need one to submit
      if (!roundId) {
        toast({
          title: "No Assessment Cycle",
          description:
            "No assessment cycle exists for this course. Please ask a controller to create one via the Cycles page.",
          variant: "destructive",
        });
        return;
      }

      // Create competency result
      const payload = {
        studentId: student.id,
        courseId: courseId,
        courseRoundId: roundId,
        totalScore: totalScore,
        maxScore: maxScore,
        resultStatusId: resultStatusId,
        assessorId: user.accountId!,
        notes: data.notes || undefined,
        gradedAt: new Date().toISOString(),
      };

      console.log("=== MAKING API CALL ===");
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const result = await api.competencyResults.create(payload);

      console.log("=== API CALL SUCCESS ===");
      console.log("Result:", result);

      toast({
        title: "Assessment Submitted",
        description: `Student ${passed ? "passed" : "did not pass"} with ${percentage.toFixed(1)}%. Trial ${currentTrial} ${passed ? "complete" : `failed - ${attemptCount + 1 < 4 ? `will move to Trial ${TRIAL_LETTERS[attemptCount + 1]}` : "no more attempts"}`}`,
      });

      // Refetch results to update UI
      refetchResults();

      router.push("/assessor/students");
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit assessment",
        variant: "destructive",
      });
    }
  };

  if (loadingStudent || loadingAssignments || loadingResults) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">
            Loading...
            {loadingStudent && " (fetching student)"}
            {loadingAssignments && " (fetching assignments)"}
            {loadingResults && " (fetching results)"}
          </span>
        </Card>
      </div>
    );
  }

  if (studentError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-8 text-center">
          <p className="text-red-600 font-semibold mb-2">
            Error Loading Student
          </p>
          <p className="text-sm text-gray-600 mb-4">{studentError.message}</p>
          <button
            onClick={() => router.push("/assessor/students")}
            className="text-primary hover:underline"
          >
            Back to Students
          </button>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-8 text-center">
          <p className="text-red-600 font-semibold mb-2">Student not found</p>
          <p className="text-sm text-gray-600 mb-4">
            The student with ID {studentId} could not be found.
          </p>
          <button
            onClick={() => router.push("/assessor/students")}
            className="text-primary hover:underline"
          >
            Back to Students
          </button>
        </Card>
      </div>
    );
  }

  if (!courseId || !assignments || assignments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-8 text-center">
          <p className="text-amber-600 font-semibold mb-2">
            No assignments found
          </p>
          <p className="text-sm text-gray-600 mb-4">
            This student's course has no assignments yet. Assignments must be
            created before assessment.
          </p>
          <button
            onClick={() => router.push("/assessor/students")}
            className="text-primary hover:underline"
          >
            Back to Students
          </button>
        </Card>
      </div>
    );
  }

  // Show locked message if student has passed
  if (isLocked && hasPassed) {
    // Find which trial they passed in
    const passedResult = existingResults?.find(
      (result) => result.resultStatusId === PASS_STATUS_ID,
    );
    const passedAttempt = existingResults?.findIndex(
      (result) => result.resultStatusId === PASS_STATUS_ID,
    );
    const passedTrial =
      passedAttempt !== undefined && passedAttempt >= 0
        ? TRIAL_LETTERS[passedAttempt]
        : "Unknown";
    const passedScore = passedResult?.scorePercentage
      ? passedResult.scorePercentage.toFixed(1)
      : passedResult?.totalScore && passedResult?.maxScore
        ? ((passedResult.totalScore / passedResult.maxScore) * 100).toFixed(1)
        : "N/A";

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button
          onClick={() => router.push("/assessor/students")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </button>
        <Card className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
            <Badge className="text-2xl">✓</Badge>
          </div>
          <p className="text-success font-bold text-xl mb-2">
            Student Has Passed
          </p>
          <p className="text-sm text-gray-600 mb-2">
            {student?.fullNameEn} has already passed this competency.
          </p>
          <div className="inline-flex items-center gap-4 bg-success/5 border border-success/20 rounded-[3px] px-6 py-3 mb-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">
                Passed in Trial
              </p>
              <p className="text-3xl font-bold text-success">{passedTrial}</p>
            </div>
            <div className="h-12 w-px bg-success/20" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">
                Final Score
              </p>
              <p className="text-3xl font-bold text-success">{passedScore}%</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Assessment is locked and cannot be modified.
          </p>
        </Card>
      </div>
    );
  }

  // Show max attempts message
  if (isLocked && attemptCount >= 4) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button
          onClick={() => router.push("/assessor/students")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </button>
        <Card className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <Badge className="text-2xl">!</Badge>
          </div>
          <p className="text-destructive font-bold text-xl mb-2">
            Maximum Attempts Reached
          </p>
          <p className="text-sm text-gray-600 mb-2">
            {student?.fullNameEn} has completed all 4 assessment trials (A, B,
            C, D).
          </p>
          <p className="text-xs text-gray-500">No further attempts allowed.</p>
        </Card>
      </div>
    );
  }

  // Get the competency name from student's enrolled competencies
  const competencyName =
    student.competencies && student.competencies.length > 0
      ? student.competencies[0].competencyName
      : "Unknown Competency";

  // Map to the expected Student type for the form
  const formStudent: Student = {
    id: student.id.toString(),
    code: student.nationalId,
    fullName: student.fullNameEn,
    gradeLevel: "Junior" as GradeLevel,
    competency: "Software" as CompetencyType,
    enrolledCompetencies:
      student.competencies?.map((c) => c.competencyName) || [],
  };

  // Create a competency object with the real tasks
  const formCompetency: Competency = {
    id: courseId.toString(),
    name: competencyName,
    gradeLevel: "Junior" as GradeLevel,
    description: `Assessment for ${competencyName}`,
    learningOutcomes: assignments.map((a) => a.title),
    totalStudents: 0,
    gradeDistribution: { A: 0, B: 0, C: 0, D: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push("/assessor/students")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </button>

      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-[3px] border border-border/50 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">
              {student.fullNameEn}
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-1 font-medium tracking-wide">
              {student.email}
              {student.className && (
                <>
                  {" "}
                  <span className="mx-1">|</span> {student.className}
                </>
              )}{" "}
              <span className="mx-1">|</span> {competencyName}
            </p>
          </div>
          {student.status && (
            <Badge className="bg-background text-foreground border border-border">
              {student.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Assessment form with real tasks */}
      <AssessmentForm
        student={formStudent}
        competency={formCompetency}
        tasks={tasks}
        currentTrial={currentTrial}
        initialScores={{}}
        initialNotes=""
        isLocked={isLocked}
        isCycleClosed={isCycleClosed}
        mode="page"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
