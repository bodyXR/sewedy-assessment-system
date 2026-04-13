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
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700">
            This result is submitted and locked.
          </p>
        </div>
      )}

      {/* ── Trial banner ──────────────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Trial {currentTrial}
          </p>
          <p className="text-xs text-blue-600 mt-0.5">
            Pass threshold: {PASS_THRESHOLD} pts per task
          </p>
        </div>
        <div className="text-right">
          <p
            className={`text-2xl font-bold ${overallScore >= PASS_THRESHOLD ? "text-green-600" : "text-red-500"}`}
          >
            {overallScore}
            <span className="text-sm font-normal text-gray-400">/100</span>
          </p>
          <p className="text-xs text-gray-500">Overall avg</p>
        </div>
      </div>

      {/* ── Tasks ─────────────────────────────────────────────── */}
      {taskResults.map((taskResult) => {
        const { task, total, passed } = taskResult;
        const isExpanded = expanded[task.id] ?? true;
        return (
          <div
            key={task.id}
            className="border border-gray-200 rounded-xl overflow-hidden"
          >
            {/* Task header */}
            <button
              type="button"
              onClick={() =>
                setExpanded((p) => ({ ...p, [task.id]: !p[task.id] }))
              }
              className="w-full flex items-center justify-between px-5 py-3.5 bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">
                  {task.label}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    passed
                      ? "bg-green-100 text-green-700"
                      : total > 0
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {passed ? "Pass" : total > 0 ? "Fail" : "—"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-lg font-bold ${passed ? "text-green-600" : total > 0 ? "text-red-500" : "text-gray-400"}`}
                >
                  {total}
                  <span className="text-xs font-normal text-gray-400">
                    /100
                  </span>
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </button>

            {/* Task progress bar */}
            <div className="h-1.5 bg-gray-100">
              <div
                className={`h-1.5 transition-all duration-300 ${passed ? "bg-green-500" : "bg-red-400"}`}
                style={{ width: `${Math.min(total, 100)}%` }}
              />
            </div>

            {/* Subtasks */}
            {isExpanded && (
              <div className="divide-y divide-gray-100 bg-white">
                {task.subTasks.map((st: SubTask) => {
                  const key = `${task.id}.${st.id}`;
                  const val = scores[key] ?? 0;
                  const pct =
                    st.maxPoints > 0
                      ? Math.round((val / st.maxPoints) * 100)
                      : 0;
                  const stColor =
                    pct >= 80
                      ? "text-green-600"
                      : pct >= 50
                        ? "text-amber-500"
                        : "text-red-500";
                  return (
                    <div key={st.id} className="px-5 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-700 font-medium">
                          {st.label}
                        </label>
                        <div className="flex items-center gap-2">
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
                            className={`w-16 h-8 text-center border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-300 disabled:bg-gray-50 disabled:text-gray-400 ${stColor}`}
                          />
                          <span className="text-xs text-gray-400 w-12">
                            /{st.maxPoints} pts
                          </span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={st.maxPoints}
                        value={val}
                        onChange={(e) =>
                          handleScoreChange(task.id, st.id, e.target.value)
                        }
                        disabled={!canEdit}
                        className="w-full accent-red-500 disabled:opacity-40"
                      />
                      <div className="flex justify-between text-xs text-gray-300 mt-0.5">
                        <span>0</span>
                        <span>{Math.round(st.maxPoints / 2)}</span>
                        <span>{st.maxPoints}</span>
                      </div>
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
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Result Summary
            </h3>
            <div
              className={`text-3xl font-bold ${overallScore >= PASS_THRESHOLD ? "text-green-600" : "text-red-500"}`}
            >
              {overallScore}%
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {taskResults.map(({ task, total, passed }) => (
              <div
                key={task.id}
                className={`rounded-lg p-3 text-center border ${passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <p className="text-xs text-gray-500 truncate mb-1">
                  {task.label.split("–")[0].trim()}
                </p>
                <p
                  className={`text-xl font-bold ${passed ? "text-green-600" : "text-red-500"}`}
                >
                  {total}
                </p>
                <p
                  className={`text-xs font-medium mt-0.5 ${passed ? "text-green-600" : "text-red-500"}`}
                >
                  {passed ? "Pass" : "Fail"}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
            <div>
              <span className="text-gray-500">Derived grade</span>
              {overallScore < PASS_THRESHOLD && currentTrial !== "D" && (
                <p className="text-xs text-amber-600 mt-0.5">
                  Fails → moves to Trial {nextTrial(currentTrial)}
                </p>
              )}
            </div>
            {overallScore >= PASS_THRESHOLD ? (
              <span
                className={`text-2xl font-bold ${
                  currentTrial === "A"
                    ? "text-green-600"
                    : currentTrial === "B"
                      ? "text-blue-600"
                      : currentTrial === "C"
                        ? "text-amber-500"
                        : "text-red-500"
                }`}
              >
                {currentTrial}
              </span>
            ) : (
              <span className="text-lg font-bold text-amber-500">
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
          className={`flex gap-3 ${mode === "sheet" ? "pt-2 border-t border-gray-100" : ""}`}
        >
          {mode === "page" ? (
            <>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="gap-2 bg-red-500 hover:bg-red-600"
              >
                <Send className="w-4 h-4" />
                Submit Results
              </Button>
            </>
          ) : (
            <>
              {onCancel && (
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
              >
                <Zap className="w-4 h-4" />
                Save Assessment
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
