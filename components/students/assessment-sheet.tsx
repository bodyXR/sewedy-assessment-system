"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { FileCheck, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockCompetencies } from "@/lib/mock-data";
import { Student } from "@/lib/types";

interface AssessmentSheetProps {
  student: Student;
  onAssessmentComplete?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: {
    competencyId: string;
    grade?: string;
    notes?: string;
  };
}

export function AssessmentSheet({
  student,
  onAssessmentComplete,
  open,
  onOpenChange,
  initialData,
}: AssessmentSheetProps) {
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  const [assessCompetencyId, setAssessCompetencyId] = useState<string>("");
  const [learningOutcomeStatuses, setLearningOutcomeStatuses] = useState<
    Record<string, "Passed" | "Failed" | null>
  >({});
  const [assessmentNotes, setAssessmentNotes] = useState("");
  const [finalGrade, setFinalGrade] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && isOpen) {
      setAssessCompetencyId(initialData.competencyId);
      if (initialData.grade) setFinalGrade(initialData.grade);
      if (initialData.notes) setAssessmentNotes(initialData.notes);
    } else if (!isOpen) {
      // Reset when closed
      if (!isControlled) {
        setAssessCompetencyId("");
        setFinalGrade(null);
        setAssessmentNotes("");
      }
    }
  }, [initialData, isOpen, isControlled]);

  const selectedCompetencyForAssessment = mockCompetencies.find(
    (c) => c.id === assessCompetencyId,
  );

  // Reset outcome statuses when competency changes
  useEffect(() => {
    if (selectedCompetencyForAssessment) {
      const initialStatuses: Record<string, "Passed" | "Failed" | null> = {};
      selectedCompetencyForAssessment.learningOutcomes?.forEach((outcome) => {
        initialStatuses[outcome] = null;
      });
      setLearningOutcomeStatuses(initialStatuses);

      // If we are editing (have initialData) and the competency matches, we theoretically should have outcome data too.
      // For now, we only have grade/notes in the mock data structure passed via initialData, so outcomes start empty.
      // If we wanted to preserve them, we'd need to pass them in initialData too.

      if (!initialData || initialData.competencyId !== assessCompetencyId) {
        setFinalGrade(null);
        setAssessmentNotes("");
      }
    }
  }, [assessCompetencyId, selectedCompetencyForAssessment, initialData]);

  const handleOutcomeChange = (
    outcome: string,
    status: "Passed" | "Failed",
  ) => {
    setLearningOutcomeStatuses((prev) => ({ ...prev, [outcome]: status }));
  };

  const handleAssessmentSubmit = () => {
    if (!assessCompetencyId || !finalGrade) {
      toast({
        title: "Incomplete Assessment",
        description: "Please select a competency and a final grade.",
        variant: "destructive",
      });
      return;
    }

    // Check if all outcomes are assessed (optional validation)
    const pendingOutcomes = Object.values(learningOutcomeStatuses).some(
      (s) => s === null,
    );
    if (
      pendingOutcomes &&
      selectedCompetencyForAssessment?.learningOutcomes?.length
    ) {
      toast({
        title: "Warning",
        description: "Some learning outcomes have not been assessed.",
        variant: "default",
      });
    }

    toast({
      title: "Assessment Submitted",
      description: `Successfully assessed ${student.fullName} for ${selectedCompetencyForAssessment?.name}`,
    });

    if (setIsOpen) setIsOpen(false);
    if (onAssessmentComplete) onAssessmentComplete();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <SheetTrigger asChild>
          <Button className="gap-2">
            <FileCheck className="w-4 h-4" />
            New Assessment
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Competency Assessment</SheetTitle>
          <SheetDescription>
            Assess {student.fullName} on a specific competency.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="competency">Select Competency</Label>
            <Select
              onValueChange={setAssessCompetencyId}
              value={assessCompetencyId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a competency..." />
              </SelectTrigger>
              <SelectContent>
                {mockCompetencies.map((comp) => (
                  <SelectItem key={comp.id} value={comp.id}>
                    {comp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCompetencyForAssessment && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    Learning Outcomes
                  </h4>
                  <Badge variant="outline">
                    {selectedCompetencyForAssessment.gradeLevel}
                  </Badge>
                </div>
                <div className="space-y-4 bg-muted/30 p-4 rounded-lg border border-border">
                  {selectedCompetencyForAssessment.learningOutcomes?.map(
                    (outcome, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col gap-2 p-3 bg-card rounded-md border border-border/50 shadow-sm"
                      >
                        <Label className="text-sm font-medium leading-relaxed">
                          {outcome}
                        </Label>
                        <RadioGroup
                          value={learningOutcomeStatuses[outcome] || ""}
                          onValueChange={(val) =>
                            handleOutcomeChange(
                              outcome,
                              val as "Passed" | "Failed",
                            )
                          }
                          className="flex gap-4 mt-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="Passed"
                              id={`outcome-${idx}-pass`}
                              className="text-primary border-green-500"
                            />
                            <Label
                              htmlFor={`outcome-${idx}-pass`}
                              className="font-normal cursor-pointer text-xs flex items-center gap-1"
                            >
                              Pass
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="Failed"
                              id={`outcome-${idx}-fail`}
                              className="text-destructive border-destructive"
                            />
                            <Label
                              htmlFor={`outcome-${idx}-fail`}
                              className="font-normal cursor-pointer text-xs flex items-center gap-1"
                            >
                              Not Pass
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    ),
                  ) || (
                    <p className="text-sm text-muted-foreground italic">
                      No specific learning outcomes defined.
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-3">
                <Label className="text-base">Overall Grade</Label>
                <RadioGroup
                  onValueChange={(val) => setFinalGrade(val)}
                  value={finalGrade || ""}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="A"
                      id="grade-a"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="grade-a"
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-green-500/10 hover:border-green-500/50 peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:text-green-600 peer-data-[state=checked]:bg-green-500/10 cursor-pointer transition-all"
                    >
                      <span className="text-2xl font-bold">A</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="B"
                      id="grade-b"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="grade-b"
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-blue-500/10 hover:border-blue-500/50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:text-blue-600 peer-data-[state=checked]:bg-blue-500/10 cursor-pointer transition-all"
                    >
                      <span className="text-2xl font-bold">B</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="C"
                      id="grade-c"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="grade-c"
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-yellow-500/10 hover:border-yellow-500/50 peer-data-[state=checked]:border-yellow-500 peer-data-[state=checked]:text-yellow-600 peer-data-[state=checked]:bg-yellow-500/10 cursor-pointer transition-all"
                    >
                      <span className="text-2xl font-bold">C</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="D"
                      id="grade-d"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="grade-d"
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-red-500/10 hover:border-red-500/50 peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:text-red-600 peer-data-[state=checked]:bg-red-500/10 cursor-pointer transition-all"
                    >
                      <span className="text-2xl font-bold">D</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Assessment Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional observations regarding the student's performance..."
                  value={assessmentNotes}
                  onChange={(e) => setAssessmentNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </>
          )}
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button
            onClick={handleAssessmentSubmit}
            disabled={!selectedCompetencyForAssessment}
          >
            Save Assessment
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-[1px] w-full bg-border ${className}`} />;
}
