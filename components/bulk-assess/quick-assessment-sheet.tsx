"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Zap, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [learningOutcomeStatuses, setLearningOutcomeStatuses] = useState<
    Record<string, boolean>
  >({});
  const [assessmentNotes, setAssessmentNotes] = useState("");
  const [finalGrade, setFinalGrade] = useState<Grade | null>(null);

  // Reset when sheet opens with new data
  useEffect(() => {
    if (open && competency) {
      const initialStatuses: Record<string, boolean> = {};
      competency.learningOutcomes?.forEach((outcome) => {
        initialStatuses[outcome] = false;
      });
      setLearningOutcomeStatuses(initialStatuses);
      setFinalGrade(null);
      setAssessmentNotes("");
    }
  }, [open, competency]);

  const handleOutcomeToggle = (outcome: string) => {
    setLearningOutcomeStatuses((prev) => ({
      ...prev,
      [outcome]: !prev[outcome],
    }));
  };

  // Auto-calculate grade and trial based on outcomes
  useEffect(() => {
    if (Object.keys(learningOutcomeStatuses).length === 0) return;

    const passedCount = Object.values(learningOutcomeStatuses).filter(
      (v) => v === true,
    ).length;
    const totalCount = Object.keys(learningOutcomeStatuses).length;
    const allPassed = passedCount === totalCount;
    const anyFailed = passedCount < totalCount;

    // Auto-suggest grade based on outcomes and current trial
    if (allPassed) {
      // If all passed, grade depends on current trial
      if (currentTrial === 1) {
        setFinalGrade("A");
      } else if (currentTrial === 2) {
        setFinalGrade("B");
      } else {
        setFinalGrade("C");
      }
    } else if (anyFailed) {
      // If any failed, suggest B or C based on trial
      if (currentTrial === 1) {
        setFinalGrade("B");
      } else {
        setFinalGrade("C");
      }
    }
  }, [learningOutcomeStatuses, currentTrial]);

  const handleAllPass = () => {
    const allPass: Record<string, boolean> = {};
    competency?.learningOutcomes?.forEach((outcome) => {
      allPass[outcome] = true;
    });
    setLearningOutcomeStatuses(allPass);
    // Grade will be auto-set to A by useEffect
  };

  const handleAllFail = () => {
    const allFail: Record<string, boolean> = {};
    competency?.learningOutcomes?.forEach((outcome) => {
      allFail[outcome] = false;
    });
    setLearningOutcomeStatuses(allFail);
    setFinalGrade("D");
  };

  const handleAssessmentSubmit = () => {
    if (!student || !competency || !finalGrade) {
      toast({
        title: "Incomplete Assessment",
        description: "Please select a final grade.",
        variant: "destructive",
      });
      return;
    }

    // Determine trial assignment
    const passedCount = Object.values(learningOutcomeStatuses).filter(
      (v) => v === true,
    ).length;
    const totalCount = Object.keys(learningOutcomeStatuses).length;
    const allPassed = passedCount === totalCount;

    // If all passed, assign to current trial
    // If any failed, assign to next trial
    const assignedTrial = allPassed ? currentTrial : currentTrial + 1;

    onAssessmentComplete?.({
      studentId: student.id,
      competencyId: competency.id,
      grade: finalGrade,
      outcomes: learningOutcomeStatuses,
      notes: assessmentNotes,
      trial: assignedTrial,
    });

    toast({
      title: "Assessment Saved",
      description: `${student.fullName} assessed for ${competency.name} - Trial ${assignedTrial}`,
    });

    onOpenChange(false);
  };

  const passedCount = Object.values(learningOutcomeStatuses).filter(
    (v) => v === true,
  ).length;
  const totalCount = competency?.learningOutcomes?.length || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quick Assessment</SheetTitle>
          <SheetDescription>
            {student && competency && (
              <>
                Assess <span className="font-semibold">{student.fullName}</span>{" "}
                for <span className="font-semibold">{competency.name}</span>
              </>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Student Info */}
          {student && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">
                    {student.fullName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {student.code} • {student.gradeLevel}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{competency?.gradeLevel}</Badge>
                  <Badge className="bg-purple-600">Trial {currentTrial}</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Trial Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <div className="font-semibold text-blue-900 mb-1">
              📌 Trial-Based Grading
            </div>
            <div className="text-blue-700 text-xs space-y-1">
              {currentTrial === 1 && (
                <>
                  <div>✓ All Pass → Grade A (Trial 1)</div>
                  <div>✗ Any Fail → Grade B (Trial 2)</div>
                </>
              )}
              {currentTrial === 2 && (
                <>
                  <div>✓ All Pass → Grade B (Trial 2)</div>
                  <div>✗ Any Fail → Grade C (Trial 3)</div>
                </>
              )}
              {currentTrial === 3 && (
                <>
                  <div>✓ All Pass → Grade C (Trial 3)</div>
                  <div>✗ Any Fail → Grade C (Trial 3)</div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleAllPass}
              variant="outline"
              className="flex-1 border-green-500 text-green-700 hover:bg-green-50"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              All Pass
            </Button>
            <Button
              onClick={handleAllFail}
              variant="outline"
              className="flex-1 border-red-500 text-red-700 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              All Fail
            </Button>
          </div>

          {/* Learning Outcomes */}
          {competency && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Learning Outcomes
                </h4>
                <Badge variant="secondary">
                  {passedCount}/{totalCount} Passed
                </Badge>
              </div>
              <div className="space-y-3 bg-muted/30 p-4 rounded-lg border border-border">
                {competency.learningOutcomes?.map((outcome) => {
                  const isPassed = learningOutcomeStatuses[outcome];
                  return (
                    <button
                      key={outcome}
                      onClick={() => handleOutcomeToggle(outcome)}
                      className={`w-full flex items-start gap-3 p-3 rounded-md border-2 transition-all cursor-pointer ${
                        isPassed
                          ? "bg-green-50 border-green-500 shadow-sm"
                          : "bg-card border-border/50 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isPassed
                            ? "bg-green-500 border-green-500"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {isPassed && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium leading-relaxed">
                          {outcome}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {isPassed ? "Passed" : "Not Passed"}
                        </div>
                      </div>
                    </button>
                  );
                }) || (
                  <p className="text-sm text-muted-foreground italic">
                    No specific learning outcomes defined.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="h-px bg-border" />

          {/* Overall Grade */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Overall Grade</Label>
            <RadioGroup
              onValueChange={(val) => setFinalGrade(val as Grade)}
              value={finalGrade || ""}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            >
              <div>
                <RadioGroupItem
                  value="A"
                  id="grade-a"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="grade-a"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-green-500/10 hover:border-green-500/50 peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:text-green-600 peer-data-[state=checked]:bg-green-500/10 cursor-pointer transition-all"
                >
                  <span className="text-3xl font-bold">A</span>
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
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-blue-500/10 hover:border-blue-500/50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:text-blue-600 peer-data-[state=checked]:bg-blue-500/10 cursor-pointer transition-all"
                >
                  <span className="text-3xl font-bold">B</span>
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
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-yellow-500/10 hover:border-yellow-500/50 peer-data-[state=checked]:border-yellow-500 peer-data-[state=checked]:text-yellow-600 peer-data-[state=checked]:bg-yellow-500/10 cursor-pointer transition-all"
                >
                  <span className="text-3xl font-bold">C</span>
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
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-red-500/10 hover:border-red-500/50 peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:text-red-600 peer-data-[state=checked]:bg-red-500/10 cursor-pointer transition-all"
                >
                  <span className="text-3xl font-bold">D</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Assessment Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any observations about the student's performance..."
              value={assessmentNotes}
              onChange={(e) => setAssessmentNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button
            onClick={handleAssessmentSubmit}
            disabled={!finalGrade}
            className="bg-green-600 hover:bg-green-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Save Assessment
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
