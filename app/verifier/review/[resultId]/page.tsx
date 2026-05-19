"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { mockResults, mockStudents, mockUsers } from "@/lib/mock-data";

export default function ReviewResultPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const router = useRouter();

  const result = mockResults.find((r) => r.id === resultId);
  const student = mockStudents.find((s) => s.id === result?.studentId);
  const assessor = mockUsers.find((u) => u.id === result?.assessorId);

  if (!result || !student) {
    return <div className="p-6 text-gray-500">Result not found.</div>;
  }

  const avgScore =
    Object.values(result.scores).length > 0
      ? Math.round(
          Object.values(result.scores).reduce((a, b) => a + b, 0) /
            Object.values(result.scores).length,
        )
      : 0;

  const statusColor: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    submitted: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <button
        onClick={() => router.push("/verifier/results")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Monitor
      </button>

      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">
              {student.fullName}
            </h1>
            <p className="text-primary-foreground/80 text-sm font-medium tracking-wide mt-1">
              {student.code} <span className="mx-1">|</span>{" "}
              {student.gradeLevel} <span className="mx-1">|</span>{" "}
              {result.competency}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold tracking-tight">{avgScore}%</p>
            <p className="text-primary-foreground/80 text-[10px] font-bold uppercase tracking-widest mt-1">
              Average Score
            </p>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-3 rounded-[3px] border-2 border-border shadow-sm">
          <User className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Assessed by
            </p>
            <p className="text-sm font-bold text-foreground mt-1">
              {assessor?.fullName}
            </p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-3 rounded-[3px] border-2 border-border shadow-sm">
          <Calendar className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Submitted
            </p>
            <p className="text-sm font-bold text-foreground mt-1">
              {result.submittedAt
                ? new Date(result.submittedAt).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-3 rounded-[3px] border-2 border-border shadow-sm">
          <BookOpen className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Status
            </p>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-[3px] border uppercase tracking-widest mt-1 inline-block ${statusColor[result.status]}`}
            >
              {result.status}
            </span>
          </div>
        </Card>
      </div>

      {/* Score Breakdown */}
      <Card className="p-6 rounded-[3px] border-2 border-border shadow-sm">
        <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">
          Score Breakdown
        </h2>
        {Object.keys(result.scores).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No scores recorded yet.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(result.scores).map(([criterion, score]) => {
              const s = Number(score);
              return (
                <div key={criterion} className="flex items-center gap-4">
                  <span className="text-sm font-bold text-foreground w-48 shrink-0 uppercase tracking-wider">
                    {criterion}
                  </span>
                  <div className="flex-1 bg-secondary/50 rounded-full h-2.5 border border-border overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all ${s >= 70 ? "bg-success" : s >= 50 ? "bg-warning" : "bg-destructive"}`}
                      style={{ width: `${s}%` }}
                    />
                  </div>
                  <span
                    className={`text-lg font-bold w-12 text-right tracking-tight ${s >= 70 ? "text-success" : s >= 50 ? "text-warning" : "text-destructive"}`}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Notes */}
      {result.notes && (
        <Card className="p-6 rounded-[3px] border-2 border-border shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-widest">
            Assessor Notes
          </h2>
          <div className="bg-secondary/50 rounded-[3px] px-5 py-4 border-l-4 border-l-primary">
            <p className="text-sm text-foreground leading-relaxed">
              {result.notes}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
