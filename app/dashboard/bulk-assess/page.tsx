"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Users, Zap, Search } from "lucide-react";
import { mockStudents, mockCompetencies } from "@/lib/mock-data";
import type { Grade, GradeLevel, Student } from "@/lib/types";
import { QuickAssessmentSheet } from "@/components/bulk-assess/quick-assessment-sheet";
//
export default function BulkAssessPage() {
  const [selectedGradeLevel, setSelectedGradeLevel] =
    useState<GradeLevel>("Junior");
  const [selectedCompetency, setSelectedCompetency] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTrial, setCurrentTrial] = useState<number>(1);
  const [assessments, setAssessments] = useState<
    Record<
      string,
      {
        grade: Grade;
        outcomes: Record<string, boolean>;
        notes: string;
        trial: number;
      }
    >
  >({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Get available classes based on selected grade level
  const availableClasses = useMemo(() => {
    if (selectedGradeLevel === "Junior") {
      return ["J1", "J2", "J3", "J4"];
    } else if (selectedGradeLevel === "Wheeler") {
      return ["W1", "W2", "W3"];
    } else if (selectedGradeLevel === "Senior") {
      return ["S1", "S2", "S3", "S4"];
    }
    return [];
  }, [selectedGradeLevel]);

  // Filter students by grade level, class, competency, and search
  const filteredStudents = useMemo(() => {
    return mockStudents.filter((student) => {
      // Grade level filter
      if (student.gradeLevel !== selectedGradeLevel) return false;

      // Class filter - for now we'll use a simple index-based approach
      // In a real app, students would have a class property
      if (selectedClass !== "all") {
        // Extract class from student code or use modulo for demo
        const studentIndex = mockStudents.indexOf(student);
        const classIndex = studentIndex % availableClasses.length;
        const studentClass = availableClasses[classIndex];
        if (studentClass !== selectedClass) return false;
      }

      // Competency filter
      if (
        selectedCompetency &&
        !student.enrolledCompetencies.includes(selectedCompetency)
      ) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = student.fullName.toLowerCase().includes(query);
        const matchesCode = student.code.toLowerCase().includes(query);
        if (!matchesName && !matchesCode) return false;
      }

      return true;
    });
  }, [
    selectedGradeLevel,
    selectedClass,
    selectedCompetency,
    searchQuery,
    availableClasses,
  ]);

  // Get competencies for selected grade level
  const availableCompetencies = useMemo(() => {
    return mockCompetencies.filter(
      (comp) => comp.gradeLevel === selectedGradeLevel,
    );
  }, [selectedGradeLevel]);

  const selectedCompetencyData = useMemo(() => {
    return mockCompetencies.find((c) => c.id === selectedCompetency);
  }, [selectedCompetency]);

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsSheetOpen(true);
  };

  const handleAssessmentComplete = (data: {
    studentId: string;
    competencyId: string;
    grade: Grade;
    outcomes: Record<string, boolean>;
    notes: string;
    trial: number;
  }) => {
    setAssessments((prev) => ({
      ...prev,
      [data.studentId]: {
        grade: data.grade,
        outcomes: data.outcomes,
        notes: data.notes,
        trial: data.trial,
      },
    }));
  };

  const handleSubmitAll = () => {
    console.log("Submitting bulk assessments:", {
      competencyId: selectedCompetency,
      gradeLevel: selectedGradeLevel,
      assessments,
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setAssessments({});
    }, 2000);
  };

  const completedCount = Object.keys(assessments).length;
  const totalCount = filteredStudents.length;
  const canSubmit = completedCount > 0 && selectedCompetency;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bulk Assessment
        </h1>
        <p className="text-gray-600">
          Assess multiple students for the same competency with detailed
          learning outcomes
        </p>
      </div>

      {/* Selection Section */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Grade Level Selection */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              Select Grade Level
            </div>
            <Select
              value={selectedGradeLevel}
              onValueChange={(value) => {
                setSelectedGradeLevel(value as GradeLevel);
                setSelectedCompetency("");
                setSelectedClass("all");
                setSearchQuery("");
                setAssessments({});
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Wheeler">Wheeler</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Class Selection */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              Filter by Class
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {availableClasses.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Competency Selection */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              Select Competency
            </div>
            <Select
              value={selectedCompetency}
              onValueChange={(value) => {
                setSelectedCompetency(value);
                setAssessments({});
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a competency..." />
              </SelectTrigger>
              <SelectContent>
                {availableCompetencies.map((comp) => (
                  <SelectItem key={comp.id} value={comp.id}>
                    {comp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Trial */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              Current Trial
            </div>
            <Select
              value={currentTrial.toString()}
              onValueChange={(value) =>
                setCurrentTrial(Number.parseInt(value, 10))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Trial 1</SelectItem>
                <SelectItem value="2">Trial 2</SelectItem>
                <SelectItem value="3">Trial 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Search Students
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Info Bar */}
        {selectedCompetency && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-blue-900">
                  {selectedCompetencyData?.name}
                </div>
                <div className="text-sm text-blue-700">
                  {selectedCompetencyData?.description}
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                {totalCount} Students
              </Badge>
            </div>
          </div>
        )}
      </Card>

      {/* Instructions */}
      {selectedCompetency && totalCount > 0 && (
        <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="text-center">
            <div className="font-semibold text-gray-900 mb-2">
              📋 Click on any student card to open detailed assessment (Trial{" "}
              {currentTrial})
            </div>
            <div className="text-sm text-gray-600">
              {currentTrial === 1 &&
                "All Pass = Grade A (Trial 1) • Any Fail = Grade B (Trial 2)"}
              {currentTrial === 2 &&
                "All Pass = Grade B (Trial 2) • Any Fail = Grade C (Trial 3)"}
              {currentTrial === 3 &&
                "All Pass = Grade C (Trial 3) • Any Fail = Grade C (Trial 3)"}
            </div>
          </div>
        </Card>
      )}

      {/* Students Grid */}
      {selectedCompetency && totalCount > 0 && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-900">
              Students ({completedCount}/{totalCount} assessed)
            </div>
            <div className="text-sm text-gray-600">
              Click any card to assess
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredStudents.map((student) => {
              const assessment = assessments[student.id];
              const isAssessed = !!assessment;

              // Calculate student's class for display
              const studentIndex = mockStudents.indexOf(student);
              const classIndex = studentIndex % availableClasses.length;
              const studentClass = availableClasses[classIndex];

              return (
                <Card
                  key={student.id}
                  onClick={() => handleStudentClick(student)}
                  className={`p-4 transition-all cursor-pointer hover:shadow-lg ${
                    isAssessed
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 hover:border-red-400"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {student.fullName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {student.code} • {studentClass}
                      </div>
                    </div>
                    {isAssessed && (
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${
                            assessment.grade === "A"
                              ? "bg-green-600"
                              : assessment.grade === "B"
                                ? "bg-blue-600"
                                : assessment.grade === "C"
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                          }`}
                        >
                          {assessment.grade}
                        </Badge>
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                  </div>

                  {isAssessed && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">
                        ✓{" "}
                        {
                          Object.values(assessment.outcomes).filter(Boolean)
                            .length
                        }{" "}
                        /{" "}
                        {selectedCompetencyData?.learningOutcomes?.length || 0}{" "}
                        outcomes passed
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs border-purple-300 text-purple-700"
                      >
                        Trial {assessment.trial}
                      </Badge>
                    </div>
                  )}

                  {!isAssessed && (
                    <div className="text-sm text-gray-500 mt-2">
                      Click to assess →
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-6">
            <Button
              onClick={handleSubmitAll}
              disabled={!canSubmit}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
            >
              <Zap className="w-6 h-6 mr-2" />
              Submit All Assessments ({completedCount} students)
            </Button>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="fixed top-6 right-6 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top z-50">
              <Check className="w-6 h-6" />
              <div>
                <div className="font-semibold">Bulk Assessment Complete!</div>
                <div className="text-sm text-green-100">
                  {completedCount} student(s) assessed for{" "}
                  {selectedCompetencyData?.name}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!selectedCompetency && (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Select a Competency to Begin
          </h3>
          <p className="text-gray-600">
            Choose a grade level and competency to assess multiple students
          </p>
        </Card>
      )}

      {/* Assessment Sheet */}
      <QuickAssessmentSheet
        student={selectedStudent}
        competency={selectedCompetencyData || null}
        currentTrial={currentTrial}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onAssessmentComplete={handleAssessmentComplete}
      />
    </div>
  );
}
