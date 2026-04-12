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
        if (filterClass !== "All" && ra.class !== filterClass) return false;
        return ra.assignedRole === "assessor";
      })
      .map((ra) => {
        const user = mockUsers.find((u) => u.id === ra.userId);
        const raResults = submitted.filter((r) => r.assessorId === ra.userId);
        const raStudents = students.filter(
          (s) => s.competency === ra.competency && s.gradeLevel === ra.class,
        );
        return {
          name: user?.fullName ?? ra.userId,
          competency: ra.competency,
          class: ra.class,
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
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-1">Statistics</h1>
        <p className="text-red-100 text-sm">
          Full assessment statistics with filters
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
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
            color: "text-blue-600",
          },
          {
            label: "Assessed",
            value: filtered.totalSubmitted,
            color: "text-purple-600",
          },
          {
            label: "Approved",
            value: filtered.totalApproved,
            color: "text-green-600",
          },
          {
            label: "Completion",
            value: `${filtered.completion}%`,
            color: "text-red-500",
          },
        ].map((s) => (
          <Card key={s.label} className="p-5 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score distribution bar chart */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            Score Distribution
          </h2>
          <div className="flex items-end gap-3 h-40">
            {filtered.buckets.map((b) => (
              <div
                key={b.label}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                <span className="text-xs font-semibold text-gray-600">
                  {b.count}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-red-400 to-red-500 rounded-t-md transition-all duration-500"
                  style={{
                    height: `${Math.round((b.count / filtered.maxBucket) * 100)}%`,
                    minHeight: b.count > 0 ? "4px" : "0",
                  }}
                />
                <span className="text-xs text-gray-400">{b.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Per-class progress */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Progress by Class
          </h2>
          <div className="space-y-4">
            {filtered.classStats.map(({ cls, total, assessed }) => (
              <div key={cls}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{cls}</span>
                  <span className="text-gray-400">
                    {assessed}/{total}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-red-400 to-red-500 h-2.5 rounded-full transition-all"
                    style={{
                      width: total > 0 ? `${(assessed / total) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
            {filtered.classStats.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No data</p>
            )}
          </div>
        </Card>
      </div>

      {/* Per-competency table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Competency Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">
                  Competency
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">
                  Students
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">
                  Assessed
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">
                  Approved
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">
                  Avg Score
                </th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.compStats.map((cs) => (
                <tr key={cs.comp} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {cs.comp}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{cs.total}</td>
                  <td className="px-6 py-3 text-gray-600">{cs.assessed}</td>
                  <td className="px-6 py-3 text-green-600 font-medium">
                    {cs.approved}
                  </td>
                  <td className="px-6 py-3">
                    {cs.avg !== null ? (
                      <span
                        className={`font-semibold ${cs.avg >= 80 ? "text-green-600" : cs.avg >= 60 ? "text-amber-500" : "text-red-500"}`}
                      >
                        {cs.avg}%
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-red-400 h-1.5 rounded-full"
                          style={{
                            width:
                              cs.total > 0
                                ? `${(cs.assessed / cs.total) * 100}%`
                                : "0%",
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
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
                    className="px-6 py-8 text-center text-gray-400"
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
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Assessor Performance</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.assessorStats.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="font-medium text-gray-900 text-sm">{a.name}</p>
                <p className="text-xs text-gray-400">
                  {a.competency} · {a.class}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all"
                    style={{
                      width:
                        a.total > 0 ? `${(a.assessed / a.total) * 100}%` : "0%",
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">
                  {a.assessed}/{a.total}
                </span>
              </div>
            </div>
          ))}
          {filtered.assessorStats.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-400">
              No assessors match the current filters.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
