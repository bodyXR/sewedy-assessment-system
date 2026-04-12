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
    <div className="p-6 space-y-6">
      <button
        onClick={() => router.push("/verifier/results")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Monitor
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{student.fullName}</h1>
            <p className="text-red-100 text-sm mt-0.5">
              {student.code} · {student.gradeLevel} · {result.competency}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{avgScore}%</p>
            <p className="text-red-100 text-xs">Average Score</p>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <User className="w-5 h-5 text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Assessed by</p>
            <p className="text-sm font-semibold text-gray-900">
              {assessor?.fullName}
            </p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Submitted</p>
            <p className="text-sm font-semibold text-gray-900">
              {result.submittedAt
                ? new Date(result.submittedAt).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Status</p>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor[result.status]}`}
            >
              {result.status}
            </span>
          </div>
        </Card>
      </div>

      {/* Score Breakdown */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Score Breakdown</h2>
        {Object.keys(result.scores).length === 0 ? (
          <p className="text-sm text-gray-400">No scores recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(result.scores).map(([criterion, score]) => {
              const s = Number(score);
              return (
                <div key={criterion} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-48 shrink-0">
                    {criterion}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${s >= 70 ? "bg-green-500" : s >= 50 ? "bg-amber-400" : "bg-red-500"}`}
                      style={{ width: `${s}%` }}
                    />
                  </div>
                  <span
                    className={`text-sm font-semibold w-10 text-right ${s >= 70 ? "text-green-600" : s >= 50 ? "text-amber-500" : "text-red-500"}`}
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
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Assessor Notes</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {result.notes}
          </p>
        </Card>
      )}
    </div>
  );
}
