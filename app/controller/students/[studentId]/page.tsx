"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  BookOpen,
  ClipboardList,
  Calendar,
  Loader2,
  Mail,
  Phone,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStudent } from "@/hooks/use-api";

const statusConfig: Record<string, { label: string; cls: string }> = {
  Active: { label: "Active", cls: "bg-green-100 text-green-700" },
  Passed: { label: "Passed", cls: "bg-blue-100 text-blue-700" },
  "Not Passed": { label: "Not Passed", cls: "bg-red-100 text-red-700" },
  Inactive: { label: "Inactive", cls: "bg-gray-100 text-gray-500" },
};

export default function ControllerStudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const router = useRouter();

  const {
    data: student,
    isLoading,
    error,
  } = useStudent(studentId ? Number.parseInt(studentId, 10) : null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="p-12 flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-gray-600">Loading student details...</span>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-8 text-center">
          <p className="text-red-600 font-semibold mb-2">
            Error loading student
          </p>
          <p className="text-sm text-gray-600">{error.message}</p>
        </Card>
      </div>
    );
  }

  if (!student) {
    return <div className="p-6 text-gray-500">Student not found.</div>;
  }

  const initials = student.fullNameEn
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const st = statusConfig[student.status ?? "Active"] ?? statusConfig.Active;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push("/controller/students")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </button>

      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-background/20 rounded-[3px] border-2 border-background/30 flex items-center justify-center text-primary-foreground font-bold text-xl tracking-wider uppercase shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight uppercase">
                {student.fullNameEn}
              </h1>
              <span
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-[3px] border uppercase tracking-widest ${st.cls}`}
              >
                {st.label}
              </span>
            </div>
            <p className="text-primary-foreground/80 text-sm font-medium tracking-wide mt-2">
              {student.email}
              {student.className && (
                <>
                  {" "}
                  <span className="mx-1">|</span> {student.className}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div className="flex flex-wrap gap-4">
        {[
          { icon: User, label: "National ID", value: student.nationalId },
          { icon: Mail, label: "Email", value: student.email },
          {
            icon: Phone,
            label: "Phone",
            value: student.phone || "—",
          },
          {
            icon: ClipboardList,
            label: "Competencies",
            value: student.competencies?.length || 0,
          },
        ].map(({ icon: Icon, label, value }) => (
          <Card
            key={label}
            className="p-5 flex items-center gap-3 rounded-[3px] border-2 border-border shadow-sm group hover:border-primary/50 transition-colors flex-1 min-w-[200px]"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-[3px] border border-primary/20 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {label}
              </p>
              <p className="text-sm font-bold text-foreground mt-1">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Enrolled Competencies */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">
          Enrolled Competencies
        </h2>
        {!student.competencies || student.competencies.length === 0 ? (
          <Card className="p-12 text-center text-gray-400">
            No competencies enrolled yet.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {student.competencies.map((comp) => (
              <Card
                key={comp.assessmentCycleId}
                className="overflow-hidden rounded-[3px] border-2 border-border shadow-sm"
              >
                <div className="px-6 py-5 border-b-2 border-border bg-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-[3px] border-2 border-primary/20 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground">
                        {comp.competencyName}
                      </p>
                      <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mt-1">
                        Round {comp.roundNumber ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 space-y-2">
                  {comp.cycleStartDate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="font-semibold text-foreground">
                        {new Date(comp.cycleStartDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {comp.cycleEndDate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">End Date:</span>
                      <span className="font-semibold text-foreground">
                        {new Date(comp.cycleEndDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Assessment History - Note: Requires backend endpoint */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">
          Assessment History
        </h2>
        <Card className="p-12 text-center">
          <Calendar className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Assessment history not available</p>
          <p className="text-xs text-gray-400">
            Backend endpoint required: GET /api/assessments/student/
            {"{studentId}"}
          </p>
        </Card>
      </div>
    </div>
  );
}
