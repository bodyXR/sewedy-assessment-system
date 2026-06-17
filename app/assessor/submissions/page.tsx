"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useApiQuery } from "@/hooks/use-api";
import { api } from "@/lib/api-client";

const TRIAL_LETTERS = ["A", "B", "C", "D"];
const PASS_STATUS_ID = 53;
const FAIL_STATUS_ID = 54;

export default function SubmissionsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Fetch all results submitted by this assessor
  const { data: allResults, isLoading } = useApiQuery(
    () =>
      user?.accountId ? api.competencyResults.getAll({}) : Promise.resolve([]),
    [user?.accountId],
  );

  // Filter to only results by this assessor
  const myResults =
    allResults?.filter((r) => r.assessorId === user?.accountId) || [];

  // Group results by student to show latest attempt
  const resultsByStudent = myResults.reduce(
    (acc, result) => {
      const key = `${result.studentId}-${result.courseId}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(result);
      return acc;
    },
    {} as Record<string, typeof myResults>,
  );

  // Get the most recent result for each student
  const latestResults = Object.values(resultsByStudent).map((results) => {
    const sorted = results.sort(
      (a, b) =>
        new Date(b.gradedAt || b.createdAt).getTime() -
        new Date(a.gradedAt || a.createdAt).getTime(),
    );
    return {
      ...sorted[0],
      attemptCount: results.length,
      hasPassed: results.some((r) => r.resultStatusId === PASS_STATUS_ID),
    };
  });

  const counts = {
    passed: latestResults.filter((r) => r.hasPassed).length,
    failed: latestResults.filter((r) => !r.hasPassed && r.attemptCount < 4)
      .length,
    maxAttempts: latestResults.filter(
      (r) => !r.hasPassed && r.attemptCount >= 4,
    ).length,
    total: latestResults.length,
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Card className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Loading submissions...</span>
        </Card>
      </div>
    );
  }

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
        <Card className="p-5 text-center rounded-[3px] border-2 border-border shadow-sm group hover:border-success/50 transition-colors">
          <CheckCircle className="w-5 h-5 mx-auto mb-3 text-success" />
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {counts.passed}
          </p>
          <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">
            Passed
          </p>
        </Card>

        <Card className="p-5 text-center rounded-[3px] border-2 border-border shadow-sm group hover:border-warning/50 transition-colors">
          <XCircle className="w-5 h-5 mx-auto mb-3 text-warning" />
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {counts.failed}
          </p>
          <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">
            In Progress
          </p>
        </Card>

        <Card className="p-5 text-center rounded-[3px] border-2 border-border shadow-sm group hover:border-destructive/50 transition-colors">
          <XCircle className="w-5 h-5 mx-auto mb-3 text-destructive" />
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {counts.maxAttempts}
          </p>
          <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">
            Max Attempts
          </p>
        </Card>

        <Card className="p-5 text-center rounded-[3px] border-2 border-primary/30 shadow-sm bg-primary/5">
          <p className="text-3xl font-bold tracking-tight text-primary">
            {counts.total}
          </p>
          <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">
            Total Students
          </p>
        </Card>
      </div>

      {/* Results Table */}
      <Card className="overflow-hidden rounded-[3px] border-2 border-border shadow-sm">
        <div className="px-6 py-5 border-b-2 border-border bg-card">
          <h2 className="font-bold text-foreground uppercase tracking-widest text-sm">
            All Submissions
          </h2>
        </div>
        {latestResults.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No submissions yet.
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <div className="divide-y divide-gray-50 min-w-[768px]">
              {latestResults.map((result) => {
                const isPassed = result.resultStatusId === PASS_STATUS_ID;
                const trial =
                  TRIAL_LETTERS[Math.min(result.attemptCount - 1, 3)];
                const scorePercentage =
                  result.scorePercentage?.toFixed(1) ||
                  (result.totalScore && result.maxScore
                    ? ((result.totalScore / result.maxScore) * 100).toFixed(1)
                    : "N/A");

                return (
                  <div
                    key={result.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-secondary/30 transition-colors group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-primary/10 rounded-[3px] border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm tracking-wider uppercase">
                        {result.studentName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2) || "??"}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                          {result.studentName || "Unknown Student"}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mt-1">
                          {result.courseName || "Unknown Course"}
                          <span className="mx-1 text-border">|</span>
                          Trial {trial}
                          {result.gradedAt && (
                            <>
                              <span className="mx-1 text-border">|</span>
                              {new Date(result.gradedAt).toLocaleDateString()}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-xl font-bold tracking-tight ${
                          isPassed
                            ? "text-success"
                            : typeof scorePercentage === "number" &&
                                scorePercentage >= 50
                              ? "text-warning"
                              : "text-destructive"
                        }`}
                      >
                        {scorePercentage}%
                      </span>
                      <Badge
                        className={`text-[10px] font-bold px-3 py-1 uppercase tracking-widest ${
                          isPassed
                            ? "bg-success/10 text-success border-success/30"
                            : result.attemptCount >= 4
                              ? "bg-destructive/10 text-destructive border-destructive/30"
                              : "bg-warning/10 text-warning border-warning/30"
                        }`}
                      >
                        {isPassed
                          ? "✓ Passed"
                          : result.attemptCount >= 4
                            ? "✗ Failed"
                            : "In Progress"}
                      </Badge>
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
