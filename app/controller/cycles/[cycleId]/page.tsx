"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle, Edit, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCourseRound,
  useStudents,
  useAssessmentsByCourseRound,
  useCreateCourseRound,
} from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

const statusColor: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-500",
  Submitted: "bg-amber-100 text-amber-700",
  Verified: "bg-green-100 text-green-700",
};

// Helper to calculate cycle status based on dates
const getCycleStatus = (round: any) => {
  if (!round.startDate || !round.endDate) {
    return {
      status: "unknown",
      label: "No Dates",
      color: "bg-gray-100 text-gray-600 border-gray-300",
    };
  }

  const now = new Date();
  const start = new Date(round.startDate);
  const end = new Date(round.endDate);

  if (now < start) {
    return {
      status: "upcoming",
      label: "Upcoming",
      color: "bg-blue-100 text-blue-700 border-blue-300",
    };
  } else if (now > end) {
    return {
      status: "past",
      label: "Past",
      color: "bg-gray-100 text-gray-600 border-gray-300",
    };
  } else {
    return {
      status: "active",
      label: "Active",
      color: "bg-green-100 text-green-700 border-green-300",
    };
  }
};

export default function CycleDetailPage() {
  const { cycleId } = useParams<{ cycleId: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const courseRoundId = Number.parseInt(cycleId, 10);

  const {
    data: courseRound,
    isLoading: loadingRound,
    error: roundError,
    refetch,
  } = useCourseRound(courseRoundId);
  const { data: studentsData, isLoading: loadingStudents } = useStudents();
  const {
    data: assessmentsData,
    isLoading: loadingAssessments,
    error: assessmentsError,
  } = useAssessmentsByCourseRound(courseRoundId);

  const { update, deleteCycle, isLoading: isSaving } = useCreateCourseRound();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    roundNumber: "",
    startDate: "",
    endDate: "",
  });

  const students = studentsData ?? [];
  const assessments = assessmentsError ? [] : (assessmentsData ?? []);

  const isLoading = loadingRound || loadingStudents || loadingAssessments;

  const handleEdit = () => {
    if (courseRound) {
      setEditData({
        roundNumber: courseRound.roundNumber.toString(),
        startDate: courseRound.startDate || "",
        endDate: courseRound.endDate || "",
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!courseRound) return;

    try {
      await update(courseRound.id, {
        courseId: courseRound.courseId,
        roundNumber: Number(editData.roundNumber),
        startDate: editData.startDate,
        endDate: editData.endDate,
        isActive: courseRound.isActive,
      });

      toast({
        title: "Cycle updated",
        description: "Cycle details have been updated successfully",
      });

      setIsEditing(false);
      refetch();
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update cycle",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!courseRound) return;

    if (
      !confirm(
        `Are you sure you want to delete Round ${courseRound.roundNumber}? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await deleteCycle(courseRound.id);

      toast({
        title: "Cycle deleted",
        description: "The cycle has been deleted successfully",
      });

      router.push("/controller/cycles");
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete cycle",
        variant: "destructive",
      });
    }
  };

  if (roundError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-2">Error loading cycle</p>
          <p className="text-sm text-gray-600">{roundError.message}</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Loading cycle details...</span>
        </Card>
      </div>
    );
  }

  if (!courseRound) {
    return <div className="p-6 text-gray-500">Cycle not found.</div>;
  }

  // Calculate stats from assessments
  const assessed = assessments.filter((a) => a.status !== "Draft").length;
  const total = students.length;
  const completion = total > 0 ? Math.round((assessed / total) * 100) : 0;

  // Map students with their assessments
  const studentsWithResults = students.map((student) => {
    const assessment = assessments.find((a) => a.studentId === student.id);
    const competency = student.competencies?.[0]?.competencyName || "Unknown";

    return {
      student: {
        ...student,
        competency,
      },
      assessment,
      totalScore: assessment?.totalScore,
      maxScore: assessment?.maxScore,
      percentage:
        assessment?.totalScore && assessment?.maxScore
          ? Math.round((assessment.totalScore / assessment.maxScore) * 100)
          : null,
    };
  });

  const startDate = courseRound.startDate
    ? new Date(courseRound.startDate).toLocaleDateString()
    : "—";
  const endDate = courseRound.endDate
    ? new Date(courseRound.endDate).toLocaleDateString()
    : "—";

  const cycleStatus = getCycleStatus(courseRound);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <button
        onClick={() => router.push("/controller/cycles")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Cycles
      </button>

      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">
              Round {courseRound.roundNumber}
            </h1>
            <p className="text-primary-foreground/80 text-sm font-medium tracking-wide mt-1">
              {startDate} → {endDate}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-3 py-1.5 rounded-[3px] border uppercase tracking-widest ${cycleStatus.color}`}
            >
              {cycleStatus.label}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleEdit}
              disabled={isSaving}
              className="font-bold"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving}
              className="font-bold"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <Card className="p-6 rounded-[3px] border-2 border-primary/20 shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">
            Edit Cycle Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Round Number
              </label>
              <Input
                type="number"
                min="1"
                value={editData.roundNumber}
                onChange={(e) =>
                  setEditData((p) => ({ ...p, roundNumber: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Start Date
              </label>
              <Input
                type="date"
                value={editData.startDate}
                onChange={(e) =>
                  setEditData((p) => ({ ...p, startDate: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                End Date
              </label>
              <Input
                type="date"
                value={editData.endDate}
                onChange={(e) =>
                  setEditData((p) => ({ ...p, endDate: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 font-bold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="font-bold"
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Total Students", value: total, color: "text-foreground" },
          { label: "Assessed", value: assessed, color: "text-primary" },
          {
            label: "Completion",
            value: `${completion}%`,
            color: "text-primary",
          },
        ].map((s) => (
          <Card
            key={s.label}
            className="p-5 rounded-[3px] border-2 border-border shadow-sm text-center group hover:border-primary/50 transition-colors"
          >
            <p className={`text-3xl font-bold tracking-tight ${s.color}`}>
              {s.value}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">
              {s.label}
            </p>
          </Card>
        ))}
      </div>

      {/* Overall progress */}
      <Card className="p-6 rounded-[3px] border-2 border-border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-foreground uppercase tracking-widest">
            Overall Progress
          </p>
          <span className="text-2xl font-bold text-primary tracking-tight">
            {completion}%
          </span>
        </div>
        <div className="w-full bg-secondary/50 rounded-full h-3 border border-border">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-wider">
          {assessed} of {total} students assessed
        </p>
      </Card>

      {/* Student list */}
      <Card className="overflow-hidden rounded-[3px] border-2 border-border shadow-sm">
        <div className="px-6 py-5 border-b-2 border-border bg-card">
          <h2 className="font-bold text-foreground uppercase tracking-widest text-sm">
            Students ({total})
          </h2>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <div className="divide-y divide-gray-50 min-w-[640px]">
            {studentsWithResults.map(({ student, assessment, percentage }) => (
              <div
                key={student.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-secondary/30 transition-colors group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-primary/10 rounded-[3px] border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm tracking-wider uppercase shrink-0">
                    {student.fullNameEn
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                      {student.fullNameEn}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mt-1">
                      {student.email}{" "}
                      <span className="mx-1 text-border">|</span>{" "}
                      {student.competency}
                      {assessment?.submittedAt &&
                        ` | ${new Date(assessment.submittedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {percentage !== null && (
                    <span
                      className={`text-xl font-bold tracking-tight ${percentage >= 80 ? "text-success" : percentage >= 50 ? "text-warning" : "text-destructive"}`}
                    >
                      {percentage}%
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-[3px] border uppercase tracking-widest ${statusColor[assessment?.status ?? "Draft"]}`}
                  >
                    {assessment?.status ?? "Not Started"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
