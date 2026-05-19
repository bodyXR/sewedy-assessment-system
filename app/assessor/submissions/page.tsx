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
  draft: {
    label: "Draft",
    icon: FileText,
    badge: "bg-muted text-muted-foreground border-border",
  },
  submitted: {
    label: "Submitted",
    icon: Clock,
    badge: "bg-primary/10 text-primary border-primary/20",
  },
  approved: {
    label: "Submitted",
    icon: Clock,
    badge: "bg-success/10 text-success border-success/20",
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
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">
          My Submissions
        </h1>
        <p className="text-primary-foreground/80 text-sm font-medium tracking-wide">
          TRACK THE STATUS OF YOUR SUBMITTED RESULTS
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(counts).map(([status, count]) => {
          const cfg = statusConfig[status as ResultStatus];
          const Icon = cfg.icon;
          return (
            <Card
              key={status}
              className="p-5 text-center rounded-[3px] border-2 border-border shadow-sm group hover:border-primary/50 transition-colors"
            >
              <Icon className="w-5 h-5 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {count}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">
                {cfg.label}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Results Table */}
      <Card className="overflow-hidden rounded-[3px] border-2 border-border shadow-sm">
        <div className="px-6 py-5 border-b-2 border-border bg-card">
          <h2 className="font-bold text-foreground uppercase tracking-widest text-sm">
            All Submissions
          </h2>
        </div>
        {myResults.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No submissions yet.
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <div className="divide-y divide-gray-50 min-w-[768px]">
              {myResults.map((result) => {
                const student = mockStudents.find(
                  (s) => s.id === result.studentId,
                );
                const cfg = statusConfig[result.status];
                const Icon = cfg.icon;
                const avgScore =
                  Object.values(result.scores).length > 0
                    ? Math.round(
                        Object.values(result.scores).reduce(
                          (a, b) => a + b,
                          0,
                        ) / Object.values(result.scores).length,
                      )
                    : null;

                return (
                  <div
                    key={result.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-secondary/30 transition-colors group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-primary/10 rounded-[3px] border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm tracking-wider uppercase">
                        {student?.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                          {student?.fullName}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mt-1">
                          {student?.code}{" "}
                          <span className="mx-1 text-border">|</span>{" "}
                          {result.competency}
                          {result.submittedAt &&
                            ` | SUBMITTED ${new Date(result.submittedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {avgScore !== null && (
                        <span
                          className={`text-xl font-bold tracking-tight ${avgScore >= 70 ? "text-success" : avgScore >= 50 ? "text-warning" : "text-destructive"}`}
                        >
                          {avgScore}%
                        </span>
                      )}
                      <span
                        className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-[3px] border uppercase tracking-widest ${cfg.badge}`}
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
          </div>
        )}
      </Card>
    </div>
  );
}
