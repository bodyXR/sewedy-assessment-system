"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  BookOpen,
  ClipboardList,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  mockStudents,
  mockResults,
  mockCycles,
  mockUsers,
} from "@/lib/mock-data";

const statusConfig: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-gray-100 text-gray-500" },
  submitted: { label: "Submitted", cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Approved", cls: "bg-green-100 text-green-700" },
};

export default function ControllerStudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const router = useRouter();

  const student = mockStudents.find((s) => s.id === studentId);
  if (!student)
    return <div className="p-6 text-gray-500">Student not found.</div>;

  const results = mockResults
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));

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
            {student.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">
              {student.fullName}
            </h1>
            <p className="text-primary-foreground/80 text-sm font-medium tracking-wide mt-1">
              {student.code} <span className="mx-1">|</span>{" "}
              {student.gradeLevel} <span className="mx-1">|</span>{" "}
              {student.competency}
            </p>
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: User, label: "Code", value: student.code },
          { icon: BookOpen, label: "Grade", value: student.gradeLevel },
          {
            icon: ClipboardList,
            label: "Competency",
            value: student.competency,
          },
          { icon: Calendar, label: "Assessments", value: results.length },
        ].map(({ icon: Icon, label, value }) => (
          <Card
            key={label}
            className="p-5 flex items-center gap-3 rounded-[3px] border-2 border-border shadow-sm group hover:border-primary/50 transition-colors"
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

      {/* Assessment History */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">
          Assessment History
        </h2>
        {results.length === 0 ? (
          <Card className="p-12 text-center text-gray-400">
            No assessment records yet.
          </Card>
        ) : (
          <div className="space-y-4">
            {results.map((result) => {
              const cycle = mockCycles.find((c) => c.id === result.cycleId);
              const assessor = mockUsers.find(
                (u) => u.id === result.assessorId,
              );
              const scoreValues = Object.values(result.scores);
              const avgScore =
                scoreValues.length > 0
                  ? Math.round(
                      scoreValues.reduce((a, b) => a + b, 0) /
                        scoreValues.length,
                    )
                  : null;
              const st = statusConfig[result.status] ?? statusConfig.draft;

              return (
                <Card
                  key={result.id}
                  className="overflow-hidden rounded-[3px] border-2 border-border shadow-sm"
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b-2 border-border bg-card">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-[3px] border-2 border-primary/20 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">
                          {cycle?.name ?? result.cycleId}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mt-1">
                          {assessor?.fullName ?? "—"}
                          {result.submittedAt &&
                            ` | ${new Date(result.submittedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {avgScore !== null && (
                        <div className="text-right">
                          <p
                            className={`text-3xl font-bold leading-none tracking-tight ${avgScore >= 70 ? "text-success" : avgScore >= 50 ? "text-warning" : "text-destructive"}`}
                          >
                            {avgScore}
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                            avg score
                          </p>
                        </div>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-[3px] border uppercase tracking-widest ${st.cls}`}
                      >
                        {st.label}
                      </span>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  {Object.keys(result.scores).length > 0 && (
                    <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {Object.entries(result.scores).map(
                        ([criterion, score]) => {
                          const s = Number(score);
                          const passed = s >= 70;
                          return (
                            <div
                              key={criterion}
                              className={`rounded-[3px] p-4 border-2 ${passed ? "bg-success/10 border-success/20" : "bg-destructive/10 border-destructive/20"}`}
                            >
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate mb-2">
                                {criterion}
                              </p>
                              <p
                                className={`text-3xl font-bold leading-none tracking-tight ${passed ? "text-success" : "text-destructive"}`}
                              >
                                {s}
                              </p>
                              <p
                                className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${passed ? "text-success" : "text-destructive"}`}
                              >
                                {passed ? "Pass" : "Fail"}
                              </p>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {result.notes && (
                    <div className="px-6 pb-5">
                      <div className="bg-secondary/50 rounded-[3px] px-5 py-4 border-l-4 border-l-primary">
                        <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest">
                          Assessor Notes
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {result.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
