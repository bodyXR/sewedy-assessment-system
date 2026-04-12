"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { AssessmentForm } from "@/components/assess/assessment-form";
import type { AssessmentFormData } from "@/components/assess/assessment-form";
import type { Student, Competency, Grade } from "@/lib/types";

interface QuickAssessmentSheetProps {
  readonly student: Student | null;
  readonly competency: Competency | null;
  readonly currentTrial: number;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onAssessmentComplete?: (data: {
    studentId: string;
    competencyId: string;
    grade: Grade;
    outcomes: Record<string, boolean>;
    notes: string;
    trial: number;
  }) => void;
}

export function QuickAssessmentSheet({
  student,
  competency,
  currentTrial,
  open,
  onOpenChange,
  onAssessmentComplete,
}: QuickAssessmentSheetProps) {
  if (!student) return null;

  const handleSubmit = (data: AssessmentFormData) => {
    onAssessmentComplete?.({
      studentId: student.id,
      competencyId: competency?.id ?? "",
      grade: data.grade as Grade,
      outcomes: data.outcomes,
      notes: data.notes,
      trial: data.trial,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:w-[560px] overflow-y-auto flex flex-col gap-0 p-0">
        {/* Sheet header — styled like the page header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 shrink-0">
          <SheetHeader className="space-y-1 text-left">
            <SheetTitle className="text-white text-xl font-bold">
              {student.fullName}
            </SheetTitle>
            <SheetDescription className="text-red-100 text-sm">
              {student.code} · {student.gradeLevel} · {student.competency}
            </SheetDescription>
          </SheetHeader>
          <div className="flex items-center gap-2 mt-3">
            {competency && (
              <Badge className="bg-white/20 text-white border-0 text-xs">
                {competency.name}
              </Badge>
            )}
            <Badge className="bg-purple-500/80 text-white border-0 text-xs">
              Trial {currentTrial}
            </Badge>
          </div>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto p-6">
          <AssessmentForm
            student={student}
            competency={competency}
            currentTrial={currentTrial}
            mode="sheet"
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
