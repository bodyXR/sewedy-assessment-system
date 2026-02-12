"use client";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  mockStudents,
  mockCompetencies,
  mockAssessments,
} from "@/lib/mock-data";
import type { StudentCompetency } from "@/components/students/student-competencies-table";
import { StudentInfoCard } from "@/components/students/student-info-card";
import { StudentCompetenciesTable } from "@/components/students/student-competencies-table";
import { AssessmentSheet } from "@/components/students/assessment-sheet";
import { useState } from "react";

export default function StudentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  // In a real app, this would be a server component or use a hook to fetch data
  const student = mockStudents.find((s) => s.id === params.id);

  const handlePrint = () => {
    window.print();
  };

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Student Not Found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Get student's competencies data
  const studentCompetencies: StudentCompetency[] =
    student.enrolledCompetencies.map((compId) => {
      const comp = mockCompetencies.find((c) => c.id === compId);
      const assessment = mockAssessments.find(
        (a) => a.studentId === student.id && a.competencyId === compId,
      );

      return {
        id: compId,
        name: comp?.name || "Unknown Competency",
        status: assessment
          ? ["A", "B"].includes(assessment.grade)
            ? "Passed"
            : "Failed"
          : "Enrolled",
        grade: assessment?.grade,
        date: assessment?.createdAt?.toLocaleDateString(),
        notes: assessment?.notes,
      };
    });

  // Calculate stats
  const totalEnrolled = studentCompetencies.length;
  const passedCount = studentCompetencies.filter(
    (c) => c.status === "Passed",
  ).length;
  const progressPercentage =
    totalEnrolled > 0 ? (passedCount / totalEnrolled) * 100 : 0;

  const stats = {
    enrolled: totalEnrolled,
    passed: passedCount,
    progressPercentage,
  };

  // State for assessment sheet
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<
    | {
        competencyId: string;
        grade?: string;
        notes?: string;
      }
    | undefined
  >(undefined);

  const handleEdit = (comp: StudentCompetency) => {
    setEditingAssessment({
      competencyId: comp.id,
      grade: comp.grade,
      notes: comp.notes,
    });
    setIsSheetOpen(true);
  };

  const handleNewAssessment = () => {
    setEditingAssessment(undefined);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          size="icon"
          onClick={() => router.back()}
          className="print:hidden"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Student Profile
          </h1>
        </div>
        <div className="flex gap-2 print:hidden">
          {/* <Button variant="secondary" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Print Report
          </Button> */}

          <Button onClick={handleNewAssessment} className="gap-2">
            <FileCheck className="w-4 h-4" />
            New Assessment
          </Button>

          <AssessmentSheet
            student={student}
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            initialData={editingAssessment}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <StudentInfoCard student={student} stats={stats} />
        <StudentCompetenciesTable
          competencies={studentCompetencies}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
}
