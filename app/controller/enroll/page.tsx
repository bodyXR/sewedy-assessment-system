"use client";

import { useState, useMemo } from "react";
import { Save, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCourses,
  useCourseRounds,
  useStudents,
  useEnrollStudents,
} from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

export default function EnrollPage() {
  const { toast } = useToast();

  const { data: courses, isLoading: loadingCourses } = useCourses();
  const { data: courseRounds, isLoading: loadingRounds } = useCourseRounds();
  const { data: students, isLoading: loadingStudents } = useStudents();
  const { enroll, isLoading: isEnrolling } = useEnrollStudents();

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(
    new Set(),
  );
  const [filterCompetency, setFilterCompetency] = useState("All");

  // Get unique competencies from students
  const competencies = useMemo(() => {
    if (!students) return ["All"];
    const uniqueCompetencies = new Set(
      students
        .filter((s) => s.competencies && Array.isArray(s.competencies))
        .flatMap((s) => s.competencies!.map((c) => c.competencyName)),
    );
    return [
      "All",
      ...Array.from(uniqueCompetencies).sort((a, b) => a.localeCompare(b)),
    ];
  }, [students]);

  // Filter students by competency
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (filterCompetency === "All") {
      return students; // Show all students
    }
    return students.filter((s) => {
      if (!s.competencies || !Array.isArray(s.competencies)) return false;
      return s.competencies.some((c) => c.competencyName === filterCompetency);
    });
  }, [students, filterCompetency]);

  const isLoading = loadingCourses || loadingRounds || loadingStudents;

  const handleToggleStudent = (studentId: number) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedStudentIds(newSet);
  };

  const handleToggleAll = () => {
    if (selectedStudentIds.size === filteredStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const handleEnroll = async () => {
    if (!selectedCourseId) {
      toast({
        title: "Course required",
        description: "Please select a course/competency",
        variant: "destructive",
      });
      return;
    }

    if (selectedStudentIds.size === 0) {
      toast({
        title: "Students required",
        description: "Please select at least one student",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await enroll(
        selectedCourseId,
        Array.from(selectedStudentIds),
        selectedCycleId || undefined,
      );

      toast({
        title: "Enrollment successful",
        description: `Enrolled ${result.enrolled.length} student(s) in ${result.competencyName}`,
      });

      // Reset selection
      setSelectedStudentIds(new Set());
    } catch (error) {
      toast({
        title: "Enrollment failed",
        description:
          error instanceof Error ? error.message : "Failed to enroll students",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="p-12 flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-gray-600">Loading...</span>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">
          Enroll Students
        </h1>
        <p className="text-primary-foreground/80 text-sm font-medium tracking-wide">
          ASSIGN STUDENTS TO COURSES/COMPETENCIES FOR ASSESSMENT
        </p>
      </div>

      {/* Selection Form */}
      <Card className="p-6 rounded-[3px] border-2 border-border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Course/Competency *
            </label>
            <Select
              value={selectedCourseId?.toString() || ""}
              onValueChange={(v) => setSelectedCourseId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course..." />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Assessment Cycle (Optional)
            </label>
            <Select
              value={selectedCycleId?.toString() || "none"}
              onValueChange={(v) =>
                setSelectedCycleId(v === "none" ? null : Number(v))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cycle..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific cycle</SelectItem>
                {courseRounds?.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    Round {c.roundNumber}{" "}
                    {c.isActive && (
                      <span className="text-green-600">(active)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Filter by Competency
            </label>
            <Select
              value={filterCompetency}
              onValueChange={setFilterCompetency}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {competencies.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "All" ? "All Competencies" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-sm text-gray-600">
            {selectedStudentIds.size} student(s) selected
          </p>
          <Button
            onClick={handleEnroll}
            disabled={
              isEnrolling || !selectedCourseId || selectedStudentIds.size === 0
            }
            className="bg-primary hover:bg-primary/90 font-bold"
          >
            {isEnrolling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enroll Students
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Students List */}
      <Card className="overflow-hidden rounded-[3px] border-2 border-border shadow-sm">
        <div className="px-6 py-5 border-b-2 border-border bg-card flex items-center justify-between">
          <p className="font-bold text-foreground uppercase tracking-widest text-sm">
            {filteredStudents.length} Students
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleAll}
            className="font-bold"
          >
            {selectedStudentIds.size === filteredStudents.length
              ? "Deselect All"
              : "Select All"}
          </Button>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No students found
            </div>
          ) : (
            <div className="divide-y divide-gray-50 min-w-[640px]">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudentIds.has(student.id);
                const initials = student.fullNameEn
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={student.id}
                    onClick={() => handleToggleStudent(student.id)}
                    className={`flex items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors cursor-pointer ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    <Checkbox checked={isSelected} />
                    <div className="w-12 h-12 bg-primary/10 rounded-[3px] border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm tracking-wider uppercase shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-lg">
                        {student.fullNameEn}
                      </p>
                      <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mt-1">
                        {student.email}
                        {student.className && (
                          <>
                            {" "}
                            <span className="mx-1 text-border">|</span>{" "}
                            {student.className}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
