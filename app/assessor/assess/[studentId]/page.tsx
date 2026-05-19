"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  mockStudents,
  mockResults,
  mockCycles,
  mockCompetencies,
} from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { AssessmentForm } from "@/components/assess/assessment-form";
import type { AssessmentFormData } from "@/components/assess/assessment-form";

export default function AssessStudentPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const student = mockStudents.find((s) => s.id === studentId);
  const existingResult = mockResults.find(
    (r) => r.studentId === studentId && r.assessorId === user?.id,
  );
  const activeCycle = mockCycles.find((c) => c.status === "active");
  const competency = mockCompetencies.find((c) =>
    c.name.toLowerCase().includes((student?.competency ?? "").toLowerCase()),
  );

  const isLocked = existingResult?.status === "submitted";
  const isCycleClosed = activeCycle?.status === "closed";

  const handleSaveDraft = (_data: AssessmentFormData) => {
    // In a real app: persist draft via API
  };

  const handleSubmit = (_data: AssessmentFormData) => {
    toast({
      title: "Submitted",
      description: "Results submitted successfully.",
    });
    router.push("/assessor/students");
  };

  if (!student) {
    return <div className="p-6 text-gray-500">Student not found.</div>;
  }

  const statusBadgeClass: Record<string, string> = {
    approved: "bg-green-500 text-white",
    submitted: "bg-amber-400 text-white",
    draft: "bg-white/20 text-white",
  };

  return (
    <div className="p-6 space-y-6">
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
              {student.fullName}
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-1 font-medium tracking-wide">
              {student.code} <span className="mx-1">|</span>{" "}
              {student.gradeLevel} <span className="mx-1">|</span>{" "}
              {student.competency}
            </p>
          </div>
          {existingResult && (
            <Badge
              className={
                statusBadgeClass[existingResult.status] ??
                "bg-background text-foreground"
              }
            >
              {existingResult.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Shared assessment form */}
      <AssessmentForm
        student={student}
        competency={competency ?? null}
        currentTrial="A"
        initialScores={existingResult?.scores ?? {}}
        initialNotes={existingResult?.notes ?? ""}
        isLocked={isLocked}
        isCycleClosed={isCycleClosed}
        mode="page"
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
