"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCourses, useCourseRounds } from "@/hooks/use-api";

const API_BASE_URL = "http://sewedyassessmentsys.runasp.net/api";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  if (!user) return null;
  try {
    const parsed = JSON.parse(user);
    return parsed.token || null;
  } catch {
    return null;
  }
}

export default function StatisticsPage() {
  const [filterCourseId, setFilterCourseId] = useState<number | null>(null);
  const [filterRoundId, setFilterRoundId] = useState<number | null>(null);
  const [statisticsData, setStatisticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { data: courses } = useCourses();
  const { data: courseRounds } = useCourseRounds();

  const activeCycle =
    courseRounds?.find((c) => c.statusId === 1) || courseRounds?.[0];

  useEffect(() => {
    if (activeCycle && !filterRoundId) {
      setFilterRoundId(activeCycle.id);
    }
  }, [activeCycle, filterRoundId]);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filterRoundId)
          params.append("courseRoundId", filterRoundId.toString());
        if (filterCourseId)
          params.append("courseId", filterCourseId.toString());

        const token = getAuthToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const url = `${API_BASE_URL}/Dashboard/statistics?${params.toString()}`;
        const response = await fetch(url, {
          headers,
          mode: "cors",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch statistics");
        }

        const data = await response.json();
        setStatisticsData(data);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
        setStatisticsData(null);
      } finally {
        setLoading(false);
      }
    };

    if (filterRoundId) {
      fetchStatistics();
    } else {
      setLoading(false);
    }
  }, [filterRoundId, filterCourseId]);

  const summary = statisticsData?.summary || {
    totalStudents: 0,
    assessed: 0,
    approved: 0,
    completionPercent: 0,
  };
  const scoreDistribution = statisticsData?.scoreDistribution || [];
  const progressByClass = statisticsData?.progressByClass || [];
  const competencyBreakdown = statisticsData?.competencyBreakdown || [];
  const assessorPerformance = statisticsData?.assessorPerformance || [];

  const maxBucket =
    scoreDistribution.length > 0
      ? Math.max(...scoreDistribution.map((b: any) => b.studentCount), 1)
      : 1;

  const isLoading = loading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="p-12 flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-gray-600">Loading statistics...</span>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">
          Statistics
        </h1>
        <p className="text-primary-foreground/80 text-sm font-medium tracking-wide">
          FULL ASSESSMENT STATISTICS WITH FILTERS
        </p>
      </div>

      {/* Filters */}
      <Card className="p-5 rounded-[3px] border-2 border-border shadow-sm">
        <div className="flex flex-wrap gap-3">
          <Select
            value={filterRoundId?.toString() || ""}
            onValueChange={(v) => setFilterRoundId(v ? Number(v) : null)}
          >
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue placeholder="Select Round" />
            </SelectTrigger>
            <SelectContent>
              {courseRounds?.map((round) => (
                <SelectItem key={round.id} value={round.id.toString()}>
                  Round {round.roundNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterCourseId?.toString() || "All"}
            onValueChange={(v) =>
              setFilterCourseId(v === "All" ? null : Number(v))
            }
          >
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Competencies</SelectItem>
              {courses?.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Students",
            value: summary.totalStudents,
            color: "text-foreground",
          },
          {
            label: "Assessed",
            value: summary.assessed,
            color: "text-primary",
          },
          {
            label: "Approved",
            value: summary.approved,
            color: "text-success",
          },
          {
            label: "Completion",
            value: `${Math.round(summary.completionPercent)}%`,
            color: "text-primary",
          },
        ].map((s) => (
          <Card
            key={s.label}
            className="p-5 rounded-[3px] border-2 border-border shadow-sm text-center group hover:border-primary/50 transition-colors"
          >
            <p className={`text-3xl font-bold tracking-tight ${s.color}`}>
              {s.value}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">
              {s.label}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Score distribution bar chart */}
        <Card className="p-6 rounded-[3px] border-2 border-border shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-5 uppercase tracking-widest">
            Score Distribution
          </h2>
          <div className="flex items-end justify-between gap-3 h-40 border-b-2 border-border pb-2">
            {scoreDistribution.map((b: any) => {
              const heightPercent =
                maxBucket > 0 ? (b.studentCount / maxBucket) * 100 : 0;
              return (
                <div
                  key={b.label}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                >
                  {b.studentCount > 0 && (
                    <span className="text-xs font-bold text-foreground mb-1">
                      {b.studentCount}
                    </span>
                  )}
                  <div
                    className="w-full bg-primary rounded-t-[3px] transition-all duration-500"
                    style={{
                      height:
                        b.studentCount > 0
                          ? `${Math.max(heightPercent, 5)}%`
                          : "0%",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-3 mt-2">
            {scoreDistribution.map((b: any) => (
              <div key={`label-${b.label}`} className="flex-1 text-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Per-competency table */}
      <Card className="overflow-hidden rounded-[3px] border-2 border-border shadow-sm">
        <div className="px-6 py-5 border-b-2 border-border bg-card">
          <h2 className="font-bold text-foreground uppercase tracking-widest text-sm">
            Competency Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm min-w-[768px]">
            <thead className="bg-secondary/50 border-b-2 border-border">
              <tr>
                <th className="text-left px-6 py-4 font-bold text-foreground uppercase tracking-widest text-xs">
                  Competency
                </th>
                <th className="text-left px-6 py-4 font-bold text-foreground uppercase tracking-widest text-xs">
                  Students
                </th>
                <th className="text-left px-6 py-4 font-bold text-foreground uppercase tracking-widest text-xs">
                  Assessed
                </th>
                <th className="text-left px-6 py-4 font-bold text-foreground uppercase tracking-widest text-xs">
                  Approved
                </th>
                <th className="text-left px-6 py-4 font-bold text-foreground uppercase tracking-widest text-xs">
                  Avg Score
                </th>
                <th className="text-left px-6 py-4 font-bold text-foreground uppercase tracking-widest text-xs">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {competencyBreakdown.map((cs: any) => (
                <tr
                  key={cs.courseId}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-foreground uppercase tracking-wider">
                    {cs.competencyName}
                  </td>
                  <td className="px-6 py-4 font-bold text-muted-foreground">
                    {cs.students}
                  </td>
                  <td className="px-6 py-4 font-bold text-muted-foreground">
                    {cs.assessed}
                  </td>
                  <td className="px-6 py-4 text-success font-bold">
                    {cs.approved}
                  </td>
                  <td className="px-6 py-4">
                    {cs.avgScorePercent !== null ? (
                      <span
                        className={`font-bold tracking-tight ${cs.avgScorePercent >= 70 ? "text-success" : cs.avgScorePercent >= 50 ? "text-warning" : "text-destructive"}`}
                      >
                        {Math.round(cs.avgScorePercent)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-secondary/50 rounded-full h-2 border border-border overflow-hidden">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width:
                              cs.students > 0
                                ? `${(cs.assessed / cs.students) * 100}%`
                                : "0%",
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {cs.students > 0
                          ? Math.round((cs.assessed / cs.students) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {competencyBreakdown.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No data matches the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assessor performance */}
      <Card className="overflow-hidden rounded-[3px] border-2 border-border shadow-sm">
        <div className="px-6 py-5 border-b-2 border-border bg-card">
          <h2 className="font-bold text-foreground uppercase tracking-widest text-sm">
            Assessor Performance
          </h2>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <div className="divide-y divide-gray-50 min-w-[640px]">
            {assessorPerformance.map((a: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-4 hover:bg-secondary/30 transition-colors"
              >
                <div>
                  <p className="font-bold text-foreground">{a.assessorName}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">
                    {a.competencyName}{" "}
                    {a.className && (
                      <>
                        <span className="mx-1 text-border">|</span>{" "}
                        {a.className}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-secondary/50 rounded-full h-2.5 border border-border overflow-hidden">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all"
                      style={{
                        width:
                          a.total > 0
                            ? `${(a.submitted / a.total) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground w-16 text-right uppercase tracking-wider">
                    {a.submitted}/{a.total}
                  </span>
                </div>
              </div>
            ))}
            {assessorPerformance.length === 0 && (
              <div className="px-6 py-8 text-center text-muted-foreground">
                No assessors match the current filters.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
