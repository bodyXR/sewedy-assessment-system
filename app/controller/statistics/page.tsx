"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mockStudents,
  mockResults,
  mockCycles,
  mockUsers,
  mockRoleAssignments,
} from "@/lib/mock-data";

const COMPETENCIES = [
  "All",
  "Structural",
  "Civil",
  "Electrical",
  "Mechanical",
  "Software",
];
const CLASSES = ["All", "Junior", "Wheeler", "Senior"];

export default function StatisticsPage() {
  const [filterCycle, setFilterCycle] = useState("all");
  const [filterCompetency, setFilterCompetency] = useState("All");
  const [filterClass, setFilterClass] = useState("All");

  const filtered = useMemo(() => {
    const students = mockStudents.filter((s) => {
      if (filterCompetency !== "All" && s.competency !== filterCompetency)
        return false;
      if (filterClass !== "All" && s.gradeLevel !== filterClass) return false;
      return true;
    });

    const results = mockResults.filter((r) => {
      if (filterCycle !== "all" && r.cycleId !== filterCycle) return false;
      const student = mockStudents.find((s) => s.id === r.studentId);
      if (filterCompetency !== "All" && r.competency !== filterCompetency)
        return false;
      if (filterClass !== "All" && student?.gradeLevel !== filterClass)
        return false;
      return true;
    });

    const submitted = results.filter((r) => r.status !== "draft");
    const approved = results.filter((r) => r.status === "approved");

    // Score distribution buckets
    const allScores = submitted.flatMap((r) => Object.values(r.scores));
    const buckets = [
      { label: "0–49", count: allScores.filter((s) => s < 50).length },
      {
        label: "50–69",
        count: allScores.filter((s) => s >= 50 && s < 70).length,
      },
      {
        label: "70–79",
        count: allScores.filter((s) => s >= 70 && s < 80).length,
      },
      {
        label: "80–89",
        count: allScores.filter((s) => s >= 80 && s < 90).length,
      },
      { label: "90–100", count: allScores.filter((s) => s >= 90).length },
    ];
    const maxBucket = Math.max(...buckets.map((b) => b.count), 1);

    // Per-competency stats
    const compStats = COMPETENCIES.slice(1)
      .map((comp) => {
        const compStudents = students.filter((s) => s.competency === comp);
        const compResults = submitted.filter((r) => r.competency === comp);
        const compApproved = approved.filter(
          (r) => r.competency === comp,
        ).length;
        const scores = compResults.flatMap((r) => Object.values(r.scores));
        const avg =
          scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : null;
        return {
          comp,
          total: compStudents.length,
          assessed: compResults.length,
          approved: compApproved,
          avg,
        };
      })
      .filter((c) => c.total > 0);

    // Per-class stats
    const classStats = CLASSES.slice(1)
      .map((cls) => {
        const clsStudents = students.filter((s) => s.gradeLevel === cls);
        const clsResults = submitted.filter((r) => {
          const s = mockStudents.find((st) => st.id === r.studentId);
          return s?.gradeLevel === cls;
        });
        return { cls, total: clsStudents.length, assessed: clsResults.length };
      })
      .filter((c) => c.total > 0);

    // Per-assessor stats
    const assessorStats = mockRoleAssignments
      .filter((ra) => {
        if (filterCycle !== "all" && ra.cycleId !== filterCycle) return false;
        if (filterCompetency !== "All" && ra.competency !== filterCompetency)
          return false;
        if (filterClass !== "All" && ra.grade !== filterClass) return false;
        return ra.assignedRole === "assessor";
      })
      .map((ra) => {
        const user = mockUsers.find((u) => u.id === ra.userId);
        const raResults = submitted.filter((r) => r.assessorId === ra.userId);
        const raStudents = students.filter(
          (s) => s.competency === ra.competency && s.gradeLevel === ra.grade,
        );
        return {
          name: user?.fullName ?? ra.userId,
          competency: ra.competency,
          classGroup: ra.classGroup,
          assessed: raResults.length,
          total: raStudents.length,
        };
      });

    return {
      totalStudents: students.length,
      totalSubmitted: submitted.length,
      totalApproved: approved.length,
      completion:
        students.length > 0
          ? Math.round((submitted.length / students.length) * 100)
          : 0,
      buckets,
      maxBucket,
      compStats,
      classStats,
      assessorStats,
    };
  }, [filterCycle, filterCompetency, filterClass]);

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
          <Select value={filterCycle} onValueChange={setFilterCycle}>
            <SelectTrigger className="w-52 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cycles</SelectItem>
              {mockCycles.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCompetency} onValueChange={setFilterCompetency}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPETENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "All" ? "All Competencies" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLASSES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "All" ? "All Classes" : c}
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
            value: filtered.totalStudents,
            color: "text-foreground",
          },
          {
            label: "Assessed",
            value: filtered.totalSubmitted,
            color: "text-primary",
          },
          {
            label: "Approved",
            value: filtered.totalApproved,
            color: "text-success",
          },
          {
            label: "Completion",
            value: `${filtered.completion}%`,
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score distribution bar chart */}
        <Card className="p-6 rounded-[3px] border-2 border-border shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-5 uppercase tracking-widest">
            Score Distribution
          </h2>
          <div className="flex items-end justify-between gap-3 h-40 border-b-2 border-border pb-2">
            {filtered.buckets.map((b) => {
              const heightPercent =
                filtered.maxBucket > 0
                  ? (b.count / filtered.maxBucket) * 100
                  : 0;
              return (
                <div
                  key={b.label}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                >
                  {b.count > 0 && (
                    <span className="text-xs font-bold text-foreground mb-1">
                      {b.count}
                    </span>
                  )}
                  <div
                    className="w-full bg-primary rounded-t-[3px] transition-all duration-500"
                    style={{
                      height:
                        b.count > 0 ? `${Math.max(heightPercent, 5)}%` : "0%",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-3 mt-2">
            {filtered.buckets.map((b) => (
              <div key={`label-${b.label}`} className="flex-1 text-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Per-class progress */}
        <Card className="p-6 rounded-[3px] border-2 border-border shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">
            Progress by Class
          </h2>
          <div className="space-y-4">
            {filtered.classStats.map(({ cls, total, assessed }) => (
              <div key={cls}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-bold text-foreground uppercase tracking-wider">
                    {cls}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {assessed}/{total}
                  </span>
                </div>
                <div className="w-full bg-secondary/50 rounded-full h-2.5 border border-border overflow-hidden">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{
                      width: total > 0 ? `${(assessed / total) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
            {filtered.classStats.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No data
              </p>
            )}
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
              {filtered.compStats.map((cs) => (
                <tr
                  key={cs.comp}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-foreground uppercase tracking-wider">
                    {cs.comp}
                  </td>
                  <td className="px-6 py-4 font-bold text-muted-foreground">
                    {cs.total}
                  </td>
                  <td className="px-6 py-4 font-bold text-muted-foreground">
                    {cs.assessed}
                  </td>
                  <td className="px-6 py-4 text-success font-bold">
                    {cs.approved}
                  </td>
                  <td className="px-6 py-4">
                    {cs.avg !== null ? (
                      <span
                        className={`font-bold tracking-tight ${cs.avg >= 70 ? "text-success" : cs.avg >= 50 ? "text-warning" : "text-destructive"}`}
                      >
                        {cs.avg}%
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
                              cs.total > 0
                                ? `${(cs.assessed / cs.total) * 100}%`
                                : "0%",
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {cs.total > 0
                          ? Math.round((cs.assessed / cs.total) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.compStats.length === 0 && (
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
            {filtered.assessorStats.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-4 hover:bg-secondary/30 transition-colors"
              >
                <div>
                  <p className="font-bold text-foreground">{a.name}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">
                    {a.competency} <span className="mx-1 text-border">|</span>{" "}
                    {a.classGroup}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-secondary/50 rounded-full h-2.5 border border-border overflow-hidden">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all"
                      style={{
                        width:
                          a.total > 0
                            ? `${(a.assessed / a.total) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground w-16 text-right uppercase tracking-wider">
                    {a.assessed}/{a.total}
                  </span>
                </div>
              </div>
            ))}
            {filtered.assessorStats.length === 0 && (
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
