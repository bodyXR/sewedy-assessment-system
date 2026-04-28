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
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
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
          <Card key={label} className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-semibold text-gray-900">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Assessment History */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
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
                <Card key={result.id} className="overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {cycle?.name ?? result.cycleId}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {assessor?.fullName ?? "—"}
                          {result.submittedAt &&
                            ` · ${new Date(result.submittedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {avgScore !== null && (
                        <div className="text-right">
                          <p
                            className={`text-2xl font-bold leading-none ${avgScore >= 80 ? "text-green-600" : avgScore >= 60 ? "text-amber-500" : "text-red-500"}`}
                          >
                            {avgScore}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            avg score
                          </p>
                        </div>
                      )}
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${st.cls}`}
                      >
                        {st.label}
                      </span>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  {Object.keys(result.scores).length > 0 && (
                    <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(result.scores).map(
                        ([criterion, score]) => {
                          const s = Number(score);
                          const passed = s >= 80;
                          return (
                            <div
                              key={criterion}
                              className={`rounded-xl p-3 border ${passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                            >
                              <p className="text-xs text-gray-500 truncate mb-1">
                                {criterion}
                              </p>
                              <p
                                className={`text-2xl font-bold leading-none ${passed ? "text-green-600" : "text-red-500"}`}
                              >
                                {s}
                              </p>
                              <p
                                className={`text-xs font-medium mt-1 ${passed ? "text-green-500" : "text-red-400"}`}
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
                    <div className="px-5 pb-4">
                      <div className="bg-gray-50 rounded-lg px-4 py-3 border-l-4 border-red-200">
                        <p className="text-xs font-semibold text-gray-500 mb-1">
                          Assessor Notes
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
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
