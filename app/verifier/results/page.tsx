"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, AlertCircle, Users, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApiQuery } from "@/hooks/use-api";
import { api } from "@/lib/api-client";
import { useCurrentRole } from "@/lib/auth-context";

export default function VerifierResultsPage() {
  const router = useRouter();
  const roleCtx = useCurrentRole();

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterAssessor, setFilterAssessor] = useState("All");
  const [search, setSearch] = useState("");

  // Fetch competency results for the current cycle
  const {
    data: results,
    isLoading,
    error,
  } = useApiQuery(
    () =>
      roleCtx?.cycleId
        ? api.competencyResults.getAll({
            courseRoundId: Number(roleCtx.cycleId),
          })
        : Promise.resolve([]),
    [roleCtx?.cycleId],
  );

  // Get unique assessors for filter
  const assessors = useMemo(() => {
    if (!results) return [];
    const uniqueAssessors = new Map<number, string>();
    results.forEach((r) => {
      if (r.assessorId && r.assessorName) {
        uniqueAssessors.set(r.assessorId, r.assessorName);
      }
    });
    return Array.from(uniqueAssessors.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [results]);

  // Filter results
  const filtered = useMemo(() => {
    if (!results) return [];

    return results.filter((r) => {
      // Filter by status
      if (filterStatus !== "All" && r.resultStatusName !== filterStatus)
        return false;

      // Filter by assessor
      if (filterAssessor !== "All" && r.assessorId !== Number(filterAssessor))
        return false;

      // Search by student name, course name, or assessor name
      if (search.trim()) {
        const q = search.toLowerCase();
        const studentMatch = r.studentName?.toLowerCase().includes(q) || false;
        const courseMatch = r.courseName?.toLowerCase().includes(q) || false;
        const assessorMatch =
          r.assessorName?.toLowerCase().includes(q) || false;
        if (!studentMatch && !courseMatch && !assessorMatch) return false;
      }

      return true;
    });
  }, [results, filterStatus, filterAssessor, search]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!results)
      return { total: 0, passed: 0, notPassed: 0, assessorsCount: 0 };

    const uniqueAssessors = new Set(results.map((r) => r.assessorId));

    return {
      total: results.length,
      passed: results.filter((r) => r.resultStatusName === "Pass").length,
      notPassed: results.filter((r) => r.resultStatusName === "Not Pass")
        .length,
      assessorsCount: uniqueAssessors.size,
    };
  }, [results]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-amber-600 font-semibold mb-2">
            Error Loading Results
          </p>
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">
          Assessment Monitor
        </h1>
        <p className="text-primary-foreground/80 text-sm font-medium tracking-wide">
          {roleCtx?.cycleName || "NO ACTIVE CYCLE"} · ALL COMPETENCY RESULTS
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Results",
            value: stats.total,
            color: "text-blue-600",
          },
          {
            label: "Passed",
            value: stats.passed,
            color: "text-green-600",
          },
          {
            label: "Not Passed",
            value: stats.notPassed,
            color: "text-red-600",
          },
          {
            label: "Assessors",
            value: stats.assessorsCount,
            color: "text-purple-600",
          },
        ].map(({ label, value, color }) => (
          <Card
            key={label}
            className="p-5 rounded-[3px] border-2 border-border shadow-sm"
          >
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
              {label}
            </p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-5 rounded-[3px] border-2 border-border shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by student, course, or assessor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
              disabled={isLoading}
            />
          </div>
          <Select
            value={filterAssessor}
            onValueChange={setFilterAssessor}
            disabled={isLoading}
          >
            <SelectTrigger className="w-48 h-9 text-xs">
              <SelectValue placeholder="All Assessors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Assessors</SelectItem>
              {assessors.map((a) => (
                <SelectItem key={a.id} value={a.id.toString()}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
            disabled={isLoading}
          >
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Pass">Pass</SelectItem>
              <SelectItem value="Not Pass">Not Pass</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Results Table */}
      <Card className="overflow-hidden rounded-[3px] border-2 border-border shadow-sm">
        <div className="px-6 py-5 border-b-2 border-border bg-card">
          <p className="font-bold text-foreground uppercase tracking-widest text-sm">
            {filtered.length} Result{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          {isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-gray-600">Loading results...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No assessment results found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 min-w-[640px]">
              {filtered.map((result) => {
                const isPassed = result.resultStatusName === "Pass";
                const statusColor = isPassed
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-destructive/10 text-destructive border-destructive/20";

                const percentage =
                  result.scorePercentage !== undefined &&
                  result.scorePercentage !== null
                    ? result.scorePercentage.toFixed(1)
                    : result.totalScore && result.maxScore
                      ? ((result.totalScore / result.maxScore) * 100).toFixed(1)
                      : "N/A";

                return (
                  <div
                    key={result.id}
                    onClick={() => router.push(`/verifier/review/${result.id}`)}
                    className="flex items-center justify-between px-6 py-4 hover:bg-secondary/30 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-[3px] border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {result.id}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {result.studentName || `Student #${result.studentId}`}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          {result.courseName && (
                            <span className="inline-flex items-center gap-1">
                              <span className="font-semibold">
                                {result.courseName}
                              </span>
                              {result.assessorName && (
                                <>
                                  <span className="mx-1">·</span>
                                  <span>Assessed by {result.assessorName}</span>
                                </>
                              )}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(result.gradedAt).toLocaleDateString()} at{" "}
                          {new Date(result.gradedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p
                          className={`text-2xl font-bold ${isPassed ? "text-success" : "text-destructive"}`}
                        >
                          {percentage}%
                        </p>
                        {result.totalScore !== undefined &&
                          result.maxScore !== undefined && (
                            <p className="text-xs text-muted-foreground font-medium">
                              {result.totalScore}/{result.maxScore} pts
                            </p>
                          )}
                      </div>
                      <Badge
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-[3px] border uppercase tracking-widest ${statusColor}`}
                      >
                        {isPassed ? "Pass" : "Not Pass"}
                      </Badge>
                      <Eye className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
