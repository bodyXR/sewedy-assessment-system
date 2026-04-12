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
    <div className="p-6 space-y-6">
      <button
        onClick={() => router.push("/controller/cycles")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Cycles
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{cycle.name}</h1>
            <p className="text-red-100 text-sm mt-0.5">
              {cycle.startDate} → {cycle.endDate}
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${cycleStatusColor[cycle.status]}`}
          >
            {cycle.status}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: total, color: "text-gray-900" },
          { label: "Assessed", value: assessed, color: "text-red-500" },
          { label: "Approved", value: approved, color: "text-green-600" },
          {
            label: "Completion",
            value: `${completion}%`,
            color: "text-blue-600",
          },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Overall progress */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">
            Overall Progress
          </p>
          <span className="text-sm font-bold text-red-500">{completion}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-red-400 to-red-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {assessed} of {total} students assessed
        </p>
      </Card>

      {/* By competency */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Progress by Competency
        </h2>
        <div className="space-y-3">
          {byCompetency.map(({ comp, total: t, assessed: a, approved: ap }) => (
            <div key={comp} className="flex items-center gap-4">
              <span className="text-sm text-gray-700 w-28 shrink-0 font-medium">
                {comp}
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-red-400 h-2 rounded-full transition-all"
                  style={{ width: t > 0 ? `${(a / t) * 100}%` : "0%" }}
                />
              </div>
              <div className="flex gap-3 text-xs text-gray-400 w-32 shrink-0 text-right">
                <span>
                  {a}/{t} assessed
                </span>
                <span className="text-green-600">{ap} approved</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Student list */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Students ({total})</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {studentsWithResults.map(({ student, result, assessor, avg }) => (
            <div
              key={student.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600 font-semibold text-sm shrink-0">
                  {student.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {student.fullName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {student.code} · {student.gradeLevel} · {student.competency}
                    {assessor && ` · ${assessor.fullName}`}
                    {result?.submittedAt &&
                      ` · ${new Date(result.submittedAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {avg !== null && (
                  <span
                    className={`text-sm font-semibold ${avg >= 80 ? "text-green-600" : avg >= 60 ? "text-amber-500" : "text-red-500"}`}
                  >
                    {avg}%
                  </span>
                )}
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor[result?.status ?? "draft"]}`}
                >
                  {result?.status ?? "not started"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
