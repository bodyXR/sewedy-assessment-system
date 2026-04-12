"use client";

import { Eye, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { mockResults, mockStudents, mockUsers } from "@/lib/mock-data";

export default function VerifierLogPage() {
  // Show all results that have been submitted or approved
  const activityLog = mockResults
    .filter((r) => r.status !== "draft")
    .sort((a, b) => {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return dateB - dateA;
    });

  const statusColor: Record<string, string> = {
    submitted: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-1">Activity Log</h1>
        <p className="text-red-100 text-sm">
          All assessment activity across this cycle
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {activityLog.length} entries
          </h2>
        </div>
        {activityLog.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Clock className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>No activity yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activityLog.map((result) => {
              const student = mockStudents.find(
                (s) => s.id === result.studentId,
              );
              const assessor = mockUsers.find(
                (u) => u.id === result.assessorId,
              );

              return (
                <div
                  key={result.id}
                  className="flex items-center gap-4 px-6 py-4"
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <Eye className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {student?.fullName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {student?.code} · {result.competency} ·{" "}
                      {student?.gradeLevel} · by {assessor?.fullName}
                      {result.submittedAt &&
                        ` · ${new Date(result.submittedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColor[result.status] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {result.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
