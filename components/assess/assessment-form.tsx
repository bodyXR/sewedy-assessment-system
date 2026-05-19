"use client";

import { useState } from "react";
import { Save, Send, Lock, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { mockTasks } from "@/lib/mock-data";
import type {
  Grade,
  Student,
  Competency,
  Task,
  TaskScores,
  SubTask,
} from "@/lib/types";

const TRIALS: Grade[] = ["A", "B", "C", "D"];
const PASS_THRESHOLD = 80;

// Given current trial letter, return the next one (or same if already D)
function nextTrial(trial: Grade): Grade {
  const idx = TRIALS.indexOf(trial);
  return TRIALS[Math.min(idx + 1, TRIALS.length - 1)];
}

function taskTotal(task: Task, scores: TaskScores): number {
  return task.subTasks.reduce(
    (sum, st) => sum + (scores[`${task.id}.${st.id}`] ?? 0),
    0,
  );
}

export interface AssessmentFormProps {
  student: Student;
  competency: Competency | null;
  currentTrial?: Grade;
  initialScores?: TaskScores;
  initialNotes?: string;
  isLocked?: boolean;
  isCycleClosed?: boolean;
  mode?: "page" | "sheet";
  onSaveDraft?: (data: AssessmentFormData) => void;
  onSubmit?: (data: AssessmentFormData) => void;
  onCancel?: () => void;
}

export interface AssessmentFormData {
  scores: TaskScores;
  notes: string;
  grade: Grade;
  trial: Grade;
}

export function AssessmentForm({
  student,
  currentTrial = "A" as Grade,
  initialScores = {},
  initialNotes = "",
  isLocked = false,
  isCycleClosed = false,
  mode = "page",
  onSaveDraft,
  onSubmit,
  onCancel,
}: AssessmentFormProps) {
  const { toast } = useToast();
  const tasks: Task[] = mockTasks[student.competency ?? ""] ?? [];

  const [scores, setScores] = useState<TaskScores>(initialScores);
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(tasks.map((t) => [t.id, true])),
  );

  const canEdit = !isLocked && !isCycleClosed;

  const handleScoreChange = (
    taskId: string,
    subTaskId: string,
    raw: string,
  ) => {
    const key = `${taskId}.${subTaskId}`;
    const task = tasks.find((t) => t.id === taskId);
    const subTask = task?.subTasks.find((s) => s.id === subTaskId);
    const max = subTask?.maxPoints ?? 100;
    const num = Math.min(max, Math.max(0, Number.parseInt(raw) || 0));
    setScores((prev) => ({ ...prev, [key]: num }));
  };

  // Per-task totals and pass/fail
  const taskResults = tasks.map((task) => {
    const total = taskTotal(task, scores);
    const passed = total >= PASS_THRESHOLD;
    return { task, total, passed };
  });

  // Overall: average of task totals
  const overallScore =
    tasks.length > 0
      ? Math.round(
          taskResults.reduce((sum, r) => sum + r.total, 0) / tasks.length,
        )
      : 0;

  // Pass = current trial letter, Fail = next trial letter
  const derivedGrade: Grade =
    overallScore >= PASS_THRESHOLD ? currentTrial : nextTrial(currentTrial);
  const allTasksEntered = tasks.every((t) =>
    t.subTasks.every((st) => scores[`${t.id}.${st.id}`] !== undefined),
  );

  const buildData = (): AssessmentFormData => ({
    scores,
    notes,
    grade: derivedGrade,
    trial: currentTrial,
  });

  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSaveDraft?.(buildData());
      toast({
        title: "Draft saved",
        description: "Your draft has been saved.",
      });
    }, 400);
  };

  const handleSubmit = () => {
    if (!allTasksEntered) {
      toast({
        title: "Incomplete",
        description: "Please enter scores for all subtasks.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSubmit?.(buildData());
    }, 400);
  };

  return (
    <div className="space-y-5">
      {/* ── Locked notice ─────────────────────────────────────── */}
      {isLocked && (
        <div className="flex items-center gap-3 p-4 rounded-[3px] border-2 border-warning bg-warning/10">
          <Lock className="w-4 h-4 text-warning shrink-0" />
          <p className="text-sm font-bold text-foreground tracking-wide uppercase">
            This result is submitted and locked.
          </p>
        </div>
      )}

      {/* ── Trial banner ──────────────────────────────────────── */}
      <div className="bg-card border-2 border-border rounded-[3px] px-5 py-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-sm font-bold text-foreground uppercase tracking-widest">
            Trial {currentTrial}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Pass threshold: {PASS_THRESHOLD} pts per task
          </p>
        </div>
        <div className="text-right">
          <p
            className={`text-3xl font-bold tracking-tight ${overallScore >= PASS_THRESHOLD ? "text-success" : "text-destructive"}`}
          >
            {overallScore}
            <span className="text-sm font-bold text-muted-foreground ml-1">
              /100
            </span>
          </p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Overall avg
          </p>
        </div>
      </div>

      {/* ── Tasks ─────────────────────────────────────────────── */}
      {taskResults.map((taskResult) => {
        const { task, total, passed } = taskResult;
        const isExpanded = expanded[task.id] ?? true;
        return (
          <div
            key={task.id}
            className="border-2 border-border rounded-[3px] bg-card overflow-hidden shadow-sm transition-all focus-within:border-primary/50"
          >
            {/* Task header */}
            <button
              type="button"
              onClick={() =>
                setExpanded((p) => ({ ...p, [task.id]: !p[task.id] }))
              }
              className="w-full flex items-center justify-between px-5 py-4 bg-transparent hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-foreground uppercase tracking-wide">
                  {task.label}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-[3px] border ${
                    passed
                      ? "bg-success/10 text-success border-success/20"
                      : total > 0
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {passed ? "Pass" : total > 0 ? "Fail" : "—"}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`text-xl font-bold tracking-tight ${passed ? "text-success" : total > 0 ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {total}
                  <span className="text-xs font-bold text-muted-foreground ml-1">
                    /100
                  </span>
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Task progress bar */}
            <div className="h-1 bg-border/50">
              <div
                className={`h-1 transition-all duration-300 ${passed ? "bg-success" : "bg-destructive"}`}
                style={{ width: `${Math.min(total, 100)}%` }}
              />
            </div>

            {/* Subtasks */}
            {isExpanded && (
              <div className="bg-background px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 border-t-2 border-border/50">
                {task.subTasks.map((st: SubTask) => {
                  const key = `${task.id}.${st.id}`;
                  const val = scores[key] ?? 0;
                  const pct =
                    st.maxPoints > 0
                      ? Math.round((val / st.maxPoints) * 100)
                      : 0;
                  const stColor =
                    pct >= 80
                      ? "text-success"
                      : pct >= 50
                        ? "text-warning"
                        : "text-destructive";
                  return (
                    <div
                      key={st.id}
                      className="flex items-center justify-between py-2 border-b border-border/30 last:border-0 group"
                    >
                      <div className="min-w-0 flex-1 mr-4">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {st.label}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground mt-0.5 tracking-wider uppercase">
                          Max {st.maxPoints} pts
                        </p>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={st.maxPoints}
                        value={scores[key] ?? ""}
                        onChange={(e) =>
                          handleScoreChange(task.id, st.id, e.target.value)
                        }
                        disabled={!canEdit}
                        placeholder="0"
                        className={`w-20 h-10 text-center border-2 border-border rounded-[3px] text-base font-bold bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:bg-muted disabled:text-muted-foreground shrink-0 ${stColor}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Overall result summary ────────────────────────────── */}
      {tasks.length > 0 && (
        <div className="rounded-[3px] border-2 border-border bg-card px-6 py-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
              Result Summary
            </h3>
            <div
              className={`text-4xl font-bold tracking-tight ${overallScore >= PASS_THRESHOLD ? "text-success" : "text-destructive"}`}
            >
              {overallScore}%
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {taskResults.map(({ task, total, passed }) => (
              <div
                key={task.id}
                className={`rounded-[3px] p-4 text-center border-2 ${passed ? "bg-success/5 border-success/30" : "bg-destructive/5 border-destructive/30"}`}
              >
                <p className="text-[10px] font-bold text-foreground uppercase tracking-wider truncate mb-2">
                  {task.label.split("–")[0].trim()}
                </p>
                <p
                  className={`text-2xl font-bold tracking-tight ${passed ? "text-success" : "text-destructive"}`}
                >
                  {total}
                </p>
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${passed ? "text-success" : "text-destructive"}`}
                >
                  {passed ? "Pass" : "Fail"}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm pt-4 border-t-2 border-border/50">
            <div>
              <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">
                Derived Grade
              </span>
              {overallScore < PASS_THRESHOLD && currentTrial !== "D" && (
                <p className="text-[10px] font-bold text-warning uppercase tracking-widest mt-1">
                  Fails → moves to Trial {nextTrial(currentTrial)}
                </p>
              )}
            </div>
            {overallScore >= PASS_THRESHOLD ? (
              <span
                className={`text-3xl font-bold tracking-tight ${
                  currentTrial === "A"
                    ? "text-success"
                    : currentTrial === "B"
                      ? "text-blue-500"
                      : currentTrial === "C"
                        ? "text-warning"
                        : "text-destructive"
                }`}
              >
                {currentTrial}
              </span>
            ) : (
              <span className="text-2xl font-bold tracking-tight text-warning">
                Trial {nextTrial(currentTrial)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Notes ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label
          htmlFor={`notes-${mode}`}
          className="text-sm font-semibold text-gray-700 uppercase tracking-wide"
        >
          Notes & Observations
        </Label>
        <Textarea
          id={`notes-${mode}`}
          placeholder="Add any observations about this student's performance..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={!canEdit}
          rows={mode === "sheet" ? 3 : 4}
          className="resize-none"
        />
      </div>

      {/* ── Actions ───────────────────────────────────────────── */}
      {canEdit && (
        <div
          className={`flex gap-4 mt-6 ${mode === "sheet" ? "pt-4 border-t-2 border-border" : ""}`}
        >
          {mode === "page" ? (
            <>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="flex-1 py-6 text-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex-[2] py-6 text-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Results
              </Button>
            </>
          ) : (
            <>
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 py-6"
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex-[2] py-6"
              >
                <Zap className="w-4 h-4 mr-2" />
                Save Assessment
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
