"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { AlertDialogCustom } from "@/components/ui/alert-dialog-custom";
import {
  useCourses,
  useCreateCourse,
  useCourseRoundAssignments,
} from "@/hooks/use-api";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import type { GradeLevel } from "@/lib/types";

const GRADE_LEVELS: GradeLevel[] = ["Junior", "Wheeler", "Senior"];

// Map grade levels to LevelStatusId (based on typical database schema)
const GRADE_LEVEL_TO_ID: Record<GradeLevel, number> = {
  Junior: 1,
  Wheeler: 2,
  Senior: 3,
};

interface Subtask {
  id?: number; // Add ID for existing subtasks
  name: string;
  grade: number;
}

interface Task {
  id?: number; // Add ID for existing tasks
  name: string;
  subtasks: Subtask[];
}

export default function VerifierEditCompetencyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = Number(params.id);

  const { data: courses, isLoading: loadingCourses } = useCourses();
  const { data: assignments, isLoading: loadingAssignments } =
    useCourseRoundAssignments(id);
  const { update, isLoading: isUpdating } = useCreateCourse();

  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>("Junior");
  const [description, setDescription] = useState("");
  const [durationHours, setDurationHours] = useState(40);
  const [tasks, setTasks] = useState<Task[]>([
    { name: "", subtasks: [{ name: "", grade: 0 }] },
  ]);
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [deletedMaterialIds, setDeletedMaterialIds] = useState<number[]>([]);

  const course = courses?.find((c) => c.id === id);
  const isSubmitting = isUpdating;

  // Load course data
  useEffect(() => {
    if (course) {
      setName(course.title);
      setDescription(course.description);
      setDurationHours(course.durationHours || 40);
      // Note: gradeLevel would need to be derived from course.levelName
      if (course.levelName) {
        setGradeLevel(course.levelName as GradeLevel);
      }
    }
  }, [course]);

  // Load tasks from CourseRoundAssignments
  useEffect(() => {
    if (assignments && assignments.length > 0) {
      setIsLoadingTasks(true);
      try {
        console.log("Loading assignments:", assignments);

        // Each assignment represents a task
        // The description contains subtask breakdown
        const loadedTasks: Task[] = assignments.map((assignment) => {
          // Parse subtask breakdown from description
          // Format: "Subtasks: name1: X points, name2: Y points"
          const subtasks: Subtask[] = [];

          if (assignment.description) {
            const subtaskMatch =
              assignment.description.match(/Subtasks:\s*(.+)/);
            if (subtaskMatch) {
              const subtaskStr = subtaskMatch[1];
              const parts = subtaskStr.split(/,\s*/);

              for (const part of parts) {
                const match = part.match(
                  /^(.+?):\s*(\d+(?:\.\d+)?)\s*points?$/,
                );
                if (match) {
                  subtasks.push({
                    id: undefined, // Subtasks are embedded in assignment description
                    name: match[1].trim(),
                    grade: Number.parseFloat(match[2]),
                  });
                }
              }
            }
          }

          return {
            id: assignment.id,
            name: assignment.title,
            subtasks: subtasks.length > 0 ? subtasks : [{ name: "", grade: 0 }],
          };
        });

        console.log("Loaded tasks structure:", loadedTasks);

        if (loadedTasks.length > 0) {
          setTasks(loadedTasks);
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setIsLoadingTasks(false);
      }
    }
  }, [assignments]);

  const handleAddTask = () => {
    setTasks([...tasks, { name: "", subtasks: [{ name: "", grade: 0 }] }]);
  };

  const handleRemoveTask = (taskIndex: number) => {
    const taskToRemove = tasks[taskIndex];
    // Track assignment for deletion
    if (taskToRemove.id) {
      setDeletedMaterialIds((prev) => [...prev, taskToRemove.id!]);
    }
    setTasks(tasks.filter((_, i) => i !== taskIndex));
  };

  const handleTaskNameChange = (taskIndex: number, value: string) => {
    const updated = [...tasks];
    updated[taskIndex].name = value;
    setTasks(updated);
  };

  const handleAddSubtask = (taskIndex: number) => {
    const updated = [...tasks];
    updated[taskIndex].subtasks.push({ name: "", grade: 0 });
    setTasks(updated);
  };

  const handleRemoveSubtask = (taskIndex: number, subtaskIndex: number) => {
    const updated = [...tasks];
    updated[taskIndex].subtasks = updated[taskIndex].subtasks.filter(
      (_, i) => i !== subtaskIndex,
    );
    setTasks(updated);
  };

  const handleSubtaskNameChange = (
    taskIndex: number,
    subtaskIndex: number,
    value: string,
  ) => {
    const updated = [...tasks];
    updated[taskIndex].subtasks[subtaskIndex].name = value;
    setTasks(updated);
  };

  const handleSubtaskGradeChange = (
    taskIndex: number,
    subtaskIndex: number,
    value: string,
  ) => {
    const updated = [...tasks];
    updated[taskIndex].subtasks[subtaskIndex].grade = parseFloat(value) || 0;
    setTasks(updated);
  };

  const getTaskTotal = (task: Task) => {
    return task.subtasks.reduce((sum, st) => sum + st.grade, 0);
  };

  const isTaskValid = (task: Task) => {
    // Check if total equals 100
    if (getTaskTotal(task) !== 100) return false;
    // Check if any subtask has 0 or negative points
    if (task.subtasks.some((st) => st.grade <= 0)) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all tasks
    const invalidTasks = tasks.filter((task) => !isTaskValid(task));
    if (invalidTasks.length > 0) {
      setErrorMessage(
        "Each task's subtasks must sum to exactly 100 and all subtasks must have points greater than 0.",
      );
      setShowAlert(true);
      return;
    }

    try {
      // Step 1: Update the course
      await update(id, {
        title: name,
        description: description,
        durationHours: durationHours,
        levelStatusId: GRADE_LEVEL_TO_ID[gradeLevel],
      });

      // Step 2: Delete removed assignments
      for (const assignmentId of deletedMaterialIds) {
        try {
          await api.courseRoundAssignments.delete(assignmentId);
        } catch (error) {
          console.error(`Failed to delete assignment ${assignmentId}:`, error);
        }
      }

      // Step 3: Update/Create assignments (CourseRoundAssignments)
      for (const task of tasks) {
        const totalGrade = getTaskTotal(task);

        // Create a description that includes subtask breakdown
        const subtaskBreakdown = task.subtasks
          .map((st) => `${st.name}: ${st.grade} points`)
          .join(", ");

        if (!task.id) {
          // New task - create assignment
          const existingAssignment = assignments?.find(
            (a) => a.title === task.name,
          );
          const deadline =
            existingAssignment?.deadline ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

          await api.courseRoundAssignments.create({
            title: task.name,
            description: `Subtasks: ${subtaskBreakdown}`,
            deadline: deadline,
            totalGrade: totalGrade,
            courseId: id,
            instructorId: user?.accountId || 0,
          });
        } else {
          // Existing task - update assignment
          const existingAssignment = assignments?.find((a) => a.id === task.id);
          await api.courseRoundAssignments.update(task.id, {
            title: task.name,
            description: `Subtasks: ${subtaskBreakdown}`,
            totalGrade: totalGrade,
            deadline: existingAssignment?.deadline,
          });
        }
      }

      router.push("/verifier/competencies");
    } catch (error) {
      console.error("Error updating competency:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update competency",
      );
      setShowAlert(true);
    }
  };

  if (loadingCourses || loadingAssignments || isLoadingTasks) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-600">Loading competency...</span>
          </Card>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 text-center">
            <p className="text-red-600 font-semibold mb-2">
              Competency not found
            </p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Competency</h1>
          <p className="text-gray-600 mt-2">
            Update competency information and learning outcomes
          </p>
        </div>

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <Label htmlFor="name">Competency Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Structural Engineering"
                required
                className="mt-1.5"
              />
            </div>

            {/* Grade Level */}
            <div>
              <Label htmlFor="gradeLevel">Grade Level *</Label>
              <Select
                value={gradeLevel}
                onValueChange={(value) => setGradeLevel(value as GradeLevel)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the competency and its objectives..."
                required
                rows={4}
                className="mt-1.5"
              />
            </div>

            {/* Duration Hours */}
            <div>
              <Label htmlFor="duration">Duration (hours) *</Label>
              <Input
                id="duration"
                type="number"
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                placeholder="40"
                required
                min="1"
                className="mt-1.5"
              />
            </div>

            {/* Tasks */}
            <div>
              <Label>Tasks *</Label>
              <div className="space-y-6 mt-1.5">
                {tasks.map((task, taskIndex) => {
                  const total = getTaskTotal(task);
                  const isValid = isTaskValid(task);
                  return (
                    <Card
                      key={taskIndex}
                      className={`p-4 ${!isValid && total > 0 ? "border-red-500" : ""}`}
                    >
                      <div className="flex gap-2 mb-3">
                        <Input
                          value={task.name}
                          onChange={(e) =>
                            handleTaskNameChange(taskIndex, e.target.value)
                          }
                          placeholder={`Task ${taskIndex + 1} name`}
                          required
                          className="flex-1"
                        />
                        {tasks.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveTask(taskIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2 ml-4">
                        <Label className="text-sm text-gray-600">
                          Subtasks
                        </Label>
                        {task.subtasks.map((subtask, subtaskIndex) => (
                          <div key={subtaskIndex} className="flex gap-2">
                            <Input
                              value={subtask.name}
                              onChange={(e) =>
                                handleSubtaskNameChange(
                                  taskIndex,
                                  subtaskIndex,
                                  e.target.value,
                                )
                              }
                              placeholder={`Subtask ${subtaskIndex + 1}`}
                              required
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              value={subtask.grade}
                              onChange={(e) =>
                                handleSubtaskGradeChange(
                                  taskIndex,
                                  subtaskIndex,
                                  e.target.value,
                                )
                              }
                              placeholder="Grade"
                              required
                              min="0.01"
                              max="100"
                              step="0.01"
                              className="w-24"
                            />
                            {task.subtasks.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleRemoveSubtask(taskIndex, subtaskIndex)
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddSubtask(taskIndex)}
                          className="mt-2"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Subtask
                        </Button>
                      </div>

                      <div
                        className={`mt-3 pt-3 border-t text-sm font-medium ${
                          isValid
                            ? "text-green-600"
                            : total > 0
                              ? "text-red-600"
                              : "text-gray-500"
                        }`}
                      >
                        Total: {total.toFixed(2)} / 100
                        {!isValid && total > 0 && " ⚠️ Must equal 100"}
                      </div>
                    </Card>
                  );
                })}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTask}
                className="mt-3"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Competency"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <AlertDialogCustom
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={errorMessage.includes("sum") ? "Invalid Task Grades" : "Error"}
        description={
          errorMessage ||
          "Each task's subtasks must sum to exactly 100. Please check your task grades and try again."
        }
      />
    </div>
  );
}
