"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  mockCycles,
  mockStudents,
  mockResults,
  mockUsers,
} from "@/lib/mock-data";

const statusColor: Record<string, string> = {
  draft: "bg-gray-100 text-gray-500",
  submitted: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
};

const cycleStatusColor: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

export default function CycleDetailPage() {
  const { cycleId } = useParams<{ cycleId: string }>();
  const router = useRouter();

  const cycle = mockCycles.find((c) => c.id === cycleId);
  if (!cycle) return <div className="p-6 text-gray-500">Cycle not found.</div>;

  const cycleResults = mockResults.filter((r) => r.cycleId === cycleId);
  const assessed = cycleResults.filter((r) => r.status !== "draft").length;
  const approved = cycleResults.filter((r) => r.status === "approved").length;
  const total = mockStudents.length;
  const completion = total > 0 ? Math.round((assessed / total) * 100) : 0;

  // Per-competency breakdown
  const competencies = [...new Set(mockStudents.map((s) => s.competency))];
  const byCompetency = competencies
    .map((comp) => {
      const compStudents = mockStudents.filter((s) => s.competency === comp);
      const compResults = cycleResults.filter(
        (r) => r.competency === comp && r.status !== "draft",
      );
      const compApproved = cycleResults.filter(
        (r) => r.competency === comp && r.status === "approved",
      ).length;
      return {
        comp,
        total: compStudents.length,
        assessed: compResults.length,
        approved: compApproved,
      };
    })
    .filter((c) => c.total > 0);

  // Students with their result for this cycle
  const studentsWithResults = mockStudents.map((student) => {
    const result = cycleResults.find((r) => r.studentId === student.id);
    const assessor = result
      ? mockUsers.find((u) => u.id === result.assessorId)
      : null;
    const scores = result ? Object.values(result.scores) : [];
    const avg =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;
    return { student, result, assessor, avg };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <button
        onClick={() => router.push("/controller/cycles")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Cycles
      </button>

      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">
              {cycle.name}
            </h1>
            <p className="text-primary-foreground/80 text-sm font-medium tracking-wide mt-1">
              {cycle.startDate} → {cycle.endDate}
            </p>
          </div>
          <span
            className={`text-[10px] font-bold px-3 py-1.5 rounded-[3px] border uppercase tracking-widest ${cycleStatusColor[cycle.status]}`}
          >
            {cycle.status}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: total, color: "text-foreground" },
          { label: "Assessed", value: assessed, color: "text-primary" },
          { label: "Approved", value: approved, color: "text-success" },
          {
            label: "Completion",
            value: `${completion}%`,
            color: "text-primary",
          },
        ].map((s) => (
          <Card
            key={s.label}
            className="p-5 rounded-[3px] border-2 border-border shadow-sm text-center group hover:border-primary/50 transition-colors"
          >
            <p className={`text-3xl font-bold tracking-tight ${s.color}`}>
              {s.value}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">
              {s.label}
            </p>
          </Card>
        ))}
      </div>

      {/* Overall progress */}
      <Card className="p-6 rounded-[3px] border-2 border-border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-foreground uppercase tracking-widest">
            Overall Progress
          </p>
          <span className="text-2xl font-bold text-primary tracking-tight">
            {completion}%
          </span>
        </div>
        <div className="w-full bg-secondary/50 rounded-full h-3 border border-border">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-wider">
          {assessed} of {total} students assessed
        </p>
      </Card>

      {/* By competency */}
      <Card className="p-6 rounded-[3px] border-2 border-border shadow-sm">
        <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">
          Progress by Competency
        </h2>
        <div className="space-y-4">
          {byCompetency.map(({ comp, total: t, assessed: a, approved: ap }) => (
            <div key={comp} className="flex items-center gap-4">
              <span className="text-sm font-bold text-foreground w-28 shrink-0 uppercase tracking-wider">
                {comp}
              </span>
              <div className="flex-1 bg-secondary/50 rounded-full h-2.5 border border-border">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: t > 0 ? `${(a / t) * 100}%` : "0%" }}
                />
              </div>
              <div className="flex gap-3 text-xs font-bold text-muted-foreground w-40 shrink-0 text-right uppercase tracking-wider">
                <span>
                  {a}/{t} assessed
                </span>
                <span className="text-success">{ap} approved</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Student list */}
      <Card className="overflow-hidden rounded-[3px] border-2 border-border shadow-sm">
        <div className="px-6 py-5 border-b-2 border-border bg-card">
          <h2 className="font-bold text-foreground uppercase tracking-widest text-sm">
            Students ({total})
          </h2>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <div className="divide-y divide-gray-50 min-w-[640px]">
            {studentsWithResults.map(({ student, result, assessor, avg }) => (
              <div
                key={student.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-secondary/30 transition-colors group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-primary/10 rounded-[3px] border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm tracking-wider uppercase shrink-0">
                    {student.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                      {student.fullName}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mt-1">
                      {student.code} <span className="mx-1 text-border">|</span>{" "}
                      {student.gradeLevel}{" "}
                      <span className="mx-1 text-border">|</span>{" "}
                      {student.competency}
                      {assessor && ` | ${assessor.fullName}`}
                      {result?.submittedAt &&
                        ` | ${new Date(result.submittedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {avg !== null && (
                    <span
                      className={`text-xl font-bold tracking-tight ${avg >= 70 ? "text-success" : avg >= 50 ? "text-warning" : "text-destructive"}`}
                    >
                      {avg}%
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-[3px] border uppercase tracking-widest ${statusColor[result?.status ?? "draft"]}`}
                  >
                    {result?.status ?? "not started"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
