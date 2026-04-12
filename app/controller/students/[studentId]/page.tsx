"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  BookOpen,
  Calendar,
  ClipboardList,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  mockStudents,
  mockResults,
  mockCycles,
  mockUsers,
} from "@/lib/mock-data";

export default function ControllerStudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const router = useRouter();

  const student = mockStudents.find((s) => s.id === studentId);
  if (!student)
    return <div className="p-6 text-gray-500">Student not found.</div>;

  // All results for this student across all cycles
  const results = mockResults
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));

  const statusColor: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    submitted: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push("/controller/students")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {student.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <h1 className="text-xl font-bold">{student.fullName}</h1>
            <p className="text-red-100 text-sm mt-0.5">
              {student.code} · {student.gradeLevel} · {student.competency}
            </p>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <User className="w-5 h-5 text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Code</p>
            <p className="text-sm font-semibold text-gray-900">
              {student.code}
            </p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Class</p>
            <p className="text-sm font-semibold text-gray-900">
              {student.gradeLevel}
            </p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Competency</p>
            <p className="text-sm font-semibold text-gray-900">
              {student.competency}
            </p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Total Results</p>
            <p className="text-sm font-semibold text-gray-900">
              {results.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Assessment History */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Assessment History</h2>
        </div>
        {results.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No assessment records yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {results.map((result) => {
              const cycle = mockCycles.find((c) => c.id === result.cycleId);
              const assessor = mockUsers.find(
                (u) => u.id === result.assessorId,
              );
              const scores = Object.values(result.scores);
              const avgScore =
                scores.length > 0
                  ? Math.round(
                      scores.reduce((a, b) => a + b, 0) / scores.length,
                    )
                  : null;

              return (
                <div key={result.id} className="px-6 py-5">
                  {/* Row header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {cycle?.name ?? result.cycleId}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Assessed by {assessor?.fullName ?? "—"}
                        {result.submittedAt &&
                          ` · ${new Date(result.submittedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {avgScore !== null && (
                        <span
                          className={`text-lg font-bold ${avgScore >= 80 ? "text-green-600" : avgScore >= 60 ? "text-amber-500" : "text-red-500"}`}
                        >
                          {avgScore}%
                        </span>
                      )}
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor[result.status] ?? "bg-gray-100 text-gray-500"}`}
                      >
                        {result.status}
                      </span>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  {Object.keys(result.scores).length > 0 && (
                    <div className="space-y-2 mt-3">
                      {Object.entries(result.scores).map(
                        ([criterion, score]) => {
                          const s = Number(score);
                          return (
                            <div
                              key={criterion}
                              className="flex items-center gap-3"
                            >
                              <span className="text-xs text-gray-500 w-44 shrink-0">
                                {criterion}
                              </span>
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${s >= 80 ? "bg-green-500" : s >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                                  style={{ width: `${s}%` }}
                                />
                              </div>
                              <span
                                className={`text-xs font-semibold w-8 text-right ${s >= 80 ? "text-green-600" : s >= 60 ? "text-amber-500" : "text-red-500"}`}
                              >
                                {s}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {result.notes && (
                    <p className="text-xs text-gray-500 mt-3 italic border-l-2 border-gray-200 pl-3">
                      {result.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
