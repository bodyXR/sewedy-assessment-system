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
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">
          Activity Log
        </h1>
        <p className="text-primary-foreground/80 text-sm font-medium tracking-wide">
          ALL ASSESSMENT ACTIVITY ACROSS THIS CYCLE
        </p>
      </div>

      <Card className="overflow-hidden rounded-[3px] border-2 border-border shadow-sm">
        <div className="px-6 py-5 border-b-2 border-border bg-card">
          <h2 className="font-bold text-foreground uppercase tracking-widest text-sm">
            {activityLog.length} Entries
          </h2>
        </div>
        {activityLog.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Clock className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>No activity yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <div className="divide-y divide-gray-50 min-w-[768px]">
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
                    className="flex items-center gap-5 px-6 py-4 hover:bg-secondary/30 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-[3px] border-2 border-primary/20 flex items-center justify-center shrink-0">
                      <Eye className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                        {student?.fullName}
                      </p>
                      <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mt-1">
                        {student?.code}{" "}
                        <span className="mx-1 text-border">|</span>{" "}
                        {result.competency}{" "}
                        <span className="mx-1 text-border">|</span>{" "}
                        {student?.gradeLevel}{" "}
                        <span className="mx-1 text-border">|</span> BY{" "}
                        {assessor?.fullName}
                        {result.submittedAt &&
                          ` | ${new Date(result.submittedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-[3px] border uppercase tracking-widest ${statusColor[result.status] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {result.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
