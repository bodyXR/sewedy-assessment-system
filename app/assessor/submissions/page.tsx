"use client";

import { useRouter } from "next/navigation";
import { Clock, FileText, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { mockResults, mockStudents } from "@/lib/mock-data";
import type { ResultStatus } from "@/lib/types";

const statusConfig: Record<
  ResultStatus,
  { label: string; icon: React.ElementType; badge: string }
> = {
  draft: { label: "Draft", icon: FileText, badge: "bg-gray-100 text-gray-600" },
  submitted: {
    label: "Submitted",
    icon: Clock,
    badge: "bg-amber-100 text-amber-700",
  },
  approved: {
    label: "Submitted",
    icon: Clock,
    badge: "bg-amber-100 text-amber-700",
  },
};

export default function SubmissionsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const myResults = mockResults.filter((r) => r.assessorId === user?.id);

  const counts = {
    submitted: myResults.filter((r) => r.status !== "draft").length,
    draft: myResults.filter((r) => r.status === "draft").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-1">My Submissions</h1>
        <p className="text-red-100 text-sm">
          Track the status of your submitted results
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(counts).map(([status, count]) => {
          const cfg = statusConfig[status as ResultStatus];
          const Icon = cfg.icon;
          return (
            <Card key={status} className="p-4 text-center">
              <Icon className="w-5 h-5 mx-auto mb-2 text-gray-400" />
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 mt-1 capitalize">
                {cfg.label}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Results Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Submissions</h2>
        </div>
        {myResults.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No submissions yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {myResults.map((result) => {
              const student = mockStudents.find(
                (s) => s.id === result.studentId,
              );
              const cfg = statusConfig[result.status];
              const Icon = cfg.icon;
              const avgScore =
                Object.values(result.scores).length > 0
                  ? Math.round(
                      Object.values(result.scores).reduce((a, b) => a + b, 0) /
                        Object.values(result.scores).length,
                    )
                  : null;

              return (
                <div
                  key={result.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600 font-semibold text-sm">
                      {student?.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {student?.fullName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {student?.code} · {result.competency}
                        {result.submittedAt &&
                          ` · Submitted ${new Date(result.submittedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {avgScore !== null && (
                      <span
                        className={`text-sm font-semibold ${avgScore >= 70 ? "text-green-600" : avgScore >= 50 ? "text-amber-500" : "text-red-500"}`}
                      >
                        {avgScore}%
                      </span>
                    )}
                    <span
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.badge}`}
                    >
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/assessor/assess/${result.studentId}`)
                      }
                      className="h-8 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
