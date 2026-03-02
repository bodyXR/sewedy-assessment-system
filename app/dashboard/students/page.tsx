"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { StudentsFilters } from "@/components/students/students-filters";
import { StudentsTable } from "@/components/students/students-table";
import { mockStudents, mockCompetencies } from "@/lib/mock-data";
import type { Student, GradeLevel } from "@/lib/types";

export default function StudentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>(
    [],
  );
  const [selectedGrades, setSelectedGrades] = useState<GradeLevel[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");

  // Get available classes based on selected grade level
  const availableClasses = useMemo(() => {
    if (selectedGrades.length === 0) return [];
    const grade = selectedGrades[0];
    if (grade === "Junior") {
      return ["J1", "J2", "J3", "J4"];
    } else if (grade === "Wheeler") {
      return ["W1", "W2", "W3"];
    } else if (grade === "Senior") {
      return ["S1", "S2", "S3", "S4"];
    }
    return [];
  }, [selectedGrades]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return mockStudents.filter((student) => {
      const matchesSearch =
        student.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGrade =
        selectedGrades.length === 0 ||
        selectedGrades.includes(student.gradeLevel);

      // Class filter - using same logic as bulk assess
      if (selectedClass !== "all" && selectedGrades.length > 0) {
        const studentIndex = mockStudents.indexOf(student);
        const classIndex = studentIndex % availableClasses.length;
        const studentClass = availableClasses[classIndex];
        if (studentClass !== selectedClass) return false;
      }

      const matchesCompetencies =
        selectedCompetencies.length === 0 ||
        selectedCompetencies.every((comp) =>
          student.enrolledCompetencies.includes(comp),
        );

      return matchesSearch && matchesGrade && matchesCompetencies;
    });
  }, [
    searchQuery,
    selectedGrades,
    selectedClass,
    selectedCompetencies,
    availableClasses,
  ]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCompetencies([]);
    setSelectedGrades([]);
    setSelectedClass("all");
  };

  const handleAssess = (student: Student) => {
    router.push(`/dashboard/students/${student.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Students</h1>
        <p className="text-gray-600">
          Manage and assess {filteredStudents.length} student
          {filteredStudents.length !== 1 ? "s" : ""} across all grade levels
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <StudentsFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCompetencies={selectedCompetencies}
          onCompetenciesChange={setSelectedCompetencies}
          selectedGrades={selectedGrades}
          onGradesChange={setSelectedGrades}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          availableClasses={availableClasses}
          onClearFilters={handleClearFilters}
          competencies={mockCompetencies}
        />
      </div>

      {/* Students Table */}
      <StudentsTable students={filteredStudents} onAssess={handleAssess} />
    </div>
  );
}
