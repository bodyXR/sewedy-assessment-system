"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useCreateCourse } from "@/hooks/use-api";
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
  name: string;
  grade: number;
}

interface Task {
  name: string;
  subtasks: Subtask[];
}

export default function VerifierAddCompetencyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { create, isLoading: isCreating } = useCreateCourse();

  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>("Junior");
  const [description, setDescription] = useState("");
  const [durationHours, setDurationHours] = useState(40);
  const [tasks, setTasks] = useState<Task[]>([
    { name: "", subtasks: [{ name: "", grade: 0 }] },
  ]);
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isSubmitting = isCreating;

  const handleAddTask = () => {
    setTasks([...tasks, { name: "", subtasks: [{ name: "", grade: 0 }] }]);
  };

  const handleRemoveTask = (taskIndex: number) => {
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
      // Step 1: Create competency (course)
      const course = await create({
        title: name,
        description: description,
        durationHours: durationHours,
        levelStatusId: GRADE_LEVEL_TO_ID[gradeLevel],
      });

      if (!course?.id) {
        throw new Error("Failed to create course");
      }

      // Step 2: Create assignments (CourseRoundAssignments) for each task
      // Each task becomes an assignment with the total grade being sum of subtasks
      const now = new Date();
      const defaultDeadline = new Date(now);
      defaultDeadline.setMonth(defaultDeadline.getMonth() + 1); // Default 1 month from now

      for (const task of tasks) {
        const totalGrade = getTaskTotal(task);

        // Create a description that includes subtask breakdown
        const subtaskBreakdown = task.subtasks
          .map((st) => `${st.name}: ${st.grade} points`)
          .join(", ");

        await api.courseRoundAssignments.create({
          title: task.name,
          description: `Subtasks: ${subtaskBreakdown}`,
          deadline: defaultDeadline.toISOString(),
          totalGrade: totalGrade,
          courseId: course.id,
          instructorId: user?.accountId || 0,
        });
      }

      router.push("/verifier/competencies");
    } catch (error) {
      console.error("Error creating competency:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create competency",
      );
      setShowAlert(true);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">
            Add New Competency
          </h1>
          <p className="text-gray-600 mt-2">
            Create a new competency with learning outcomes
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
                    Creating...
                  </>
                ) : (
                  "Create Competency"
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
