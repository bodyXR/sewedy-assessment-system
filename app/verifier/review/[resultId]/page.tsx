"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useApiQuery } from "@/hooks/use-api";
import { api } from "@/lib/api-client";
import { AssessmentForm } from "@/components/assess/assessment-form";
import type {
  Task,
  SubTask,
  Student,
  Competency,
  TaskScores,
} from "@/lib/types";
import type { AssessmentFormData } from "@/components/assess/assessment-form";

export default function VerifierReviewPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const router = useRouter();
  const { toast } = useToast();

  // Fetch the competency result
  const {
    data: result,
    isLoading: loadingResult,
    error: resultError,
    refetch,
  } = useApiQuery(
    () =>
      resultId
        ? api.competencyResults.getById(Number(resultId))
        : Promise.reject(new Error("No result ID provided")),
    [resultId],
  );

  // Fetch student data
  const { data: student, isLoading: loadingStudent } = useApiQuery(
    () =>
      result?.studentId
        ? api.students.getById(result.studentId)
        : Promise.resolve(null),
    [result?.studentId],
  );

  // Fetch assignments for the course
  const { data: assignments, isLoading: loadingAssignments } = useApiQuery(
    () =>
      result?.courseId
        ? api.courseRoundAssignments.getAll(result.courseId)
        : Promise.resolve([]),
    [result?.courseId],
  );

  // Convert assignments to tasks
  const tasks: Task[] = useMemo(() => {
    if (!assignments || assignments.length === 0) return [];

    return assignments.map((assignment) => {
      const subtasks: SubTask[] = [];

      // Parse subtasks from description
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

      // If no subtasks found, create a default one
      if (subtasks.length === 0) {
        subtasks.push({
          id: `${assignment.id}-0`,
          label: "Complete Assignment",
          maxPoints: assignment.totalGrade,
        });
      }

      return {
        id: assignment.id.toString(),
        label: assignment.title,
        subTasks: subtasks,
      };
    });
  }, [assignments]);

  // No prefilling - let verifier enter scores manually
  const initialScores: TaskScores = {};

  const handleSave = async (data: AssessmentFormData) => {
    if (!result) return;

    try {
      // Calculate total score from task scores
      let totalScore = 0;
      let maxScore = 0;

      tasks.forEach((task) => {
        task.subTasks.forEach((subtask) => {
          const key = `${task.id}.${subtask.id}`;
          const score = data.scores[key] || 0;
          totalScore += score;
          maxScore += subtask.maxPoints;
        });
      });

      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
      const PASS_STATUS_ID = 53;
      const FAIL_STATUS_ID = 54;
      const passed = percentage >= 80;

      await api.competencyResults.update(result.id, {
        totalScore,
        maxScore,
        resultStatusId: passed ? PASS_STATUS_ID : FAIL_STATUS_ID,
        notes: data.notes || undefined,
      });

      toast({
        title: "Changes Saved",
        description: `Result updated successfully. Status: ${passed ? "Pass" : "Not Pass"}`,
      });

      refetch();
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description:
          error instanceof Error ? error.message : "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  if (loadingResult || loadingStudent || loadingAssignments) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Loading result...</span>
        </Card>
      </div>
    );
  }

  if (resultError || !result) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-amber-600 font-semibold mb-2">
            Error Loading Result
          </p>
          <p className="text-sm text-gray-600 mb-4">
            {resultError?.message || "Result not found"}
          </p>
          <button
            onClick={() => router.push("/verifier/results")}
            className="text-primary hover:underline"
          >
            Back to Monitor
          </button>
        </Card>
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-8 text-center">
          <p className="text-amber-600 font-semibold mb-2">
            No assignments found
          </p>
          <p className="text-sm text-gray-600 mb-4">
            This course has no assignments to display.
          </p>
          <button
            onClick={() => router.push("/verifier/results")}
            className="text-primary hover:underline"
          >
            Back to Monitor
          </button>
        </Card>
      </div>
    );
  }

  const isPassed = result.resultStatusName === "Pass";
  const percentage =
    result.scorePercentage !== undefined && result.scorePercentage !== null
      ? result.scorePercentage.toFixed(1)
      : result.totalScore && result.maxScore
        ? ((result.totalScore / result.maxScore) * 100).toFixed(1)
        : "0";

  // Map to Student type for the form
  const formStudent: Student = {
    id: result.studentId.toString(),
    code: student?.nationalId || `STU${result.studentId}`,
    fullName:
      result.studentName ||
      student?.fullNameEn ||
      `Student #${result.studentId}`,
    gradeLevel: "Junior",
    competency: "Software",
    enrolledCompetencies: [],
  };

  // Create competency object
  const formCompetency: Competency = {
    id: result.courseId.toString(),
    name: result.courseName || "Competency",
    gradeLevel: "Junior",
    description: `Verification of ${result.courseName || "competency"}`,
    learningOutcomes: assignments.map((a) => a.title),
    totalStudents: 0,
    gradeDistribution: { A: 0, B: 0, C: 0, D: 0 },
  };

  // Determine trial letter (assume "A" for now - backend needs to track this)
  const currentTrial: "A" | "B" | "C" | "D" = "A";

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push("/verifier/results")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Monitor
      </button>

      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 rounded-[3px] border border-border/50 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">
              {formStudent.fullName}
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-1 font-medium tracking-wide">
              {result.courseName} · Assessed by{" "}
              {result.assessorName || `Assessor #${result.assessorId}`}
            </p>
            <p className="text-primary-foreground/70 text-xs mt-1">
              Result ID: {result.id} · Graded on{" "}
              {new Date(result.gradedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <Badge
              className={`${isPassed ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"} border-2 ${isPassed ? "border-success" : "border-destructive"} text-lg px-4 py-2 font-bold`}
            >
              {isPassed ? "PASS" : "NOT PASS"}
            </Badge>
            <p
              className={`text-3xl font-bold mt-2 ${isPassed ? "text-success" : "text-destructive"}`}
            >
              {percentage}%
            </p>
            {result.totalScore !== undefined &&
              result.maxScore !== undefined && (
                <p className="text-primary-foreground/80 text-sm mt-1">
                  {result.totalScore}/{result.maxScore} pts
                </p>
              )}
          </div>
        </div>
      </div>

      {/* Assessment Form - Editable */}
      <Card className="p-6 rounded-[3px] border-2 border-border shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
            Review & Edit Assessment
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            As a verifier, you can review and modify the assessment scores and
            notes.
          </p>
          {result.totalScore !== undefined && result.maxScore !== undefined && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-[3px]">
              <span className="text-xs font-semibold text-blue-700">
                Original Score: {result.totalScore}/{result.maxScore} pts (
                {((result.totalScore / result.maxScore) * 100).toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        <AssessmentForm
          student={formStudent}
          competency={formCompetency}
          tasks={tasks}
          currentTrial={currentTrial}
          initialScores={initialScores}
          initialNotes={result.notes || ""}
          isLocked={false}
          isCycleClosed={false}
          mode="sheet"
          onSubmit={handleSave}
          onCancel={() => router.push("/verifier/results")}
        />
      </Card>
    </div>
  );
}
