"use client";

import { useState, useMemo } from "react";
import { Users, CheckCircle, TrendingUp } from "lucide-react";
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
  mockRoleAssignments,
  mockCycles,
  mockUsers,
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

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace("text-", "bg-").replace("-600", "-100").replace("-500", "-100")}`}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </Card>
  );
}

export default function ControllerDashboard() {
  const [filterCycle, setFilterCycle] = useState("active");
  const [filterCompetency, setFilterCompetency] = useState("All");
  const [filterClass, setFilterClass] = useState("All");

  const selectedCycle = useMemo(() => {
    if (filterCycle === "active")
      return mockCycles.find((c) => c.status === "active");
    return mockCycles.find((c) => c.id === filterCycle);
  }, [filterCycle]);

  const stats = useMemo(() => {
    // Filter students by class + competency
    const filteredStudents = mockStudents.filter((s) => {
      if (filterCompetency !== "All" && s.competency !== filterCompetency)
        return false;
      if (filterClass !== "All" && s.gradeLevel !== filterClass) return false;
      return true;
    });

    const cycleResults = mockResults.filter((r) => {
      if (r.cycleId !== selectedCycle?.id) return false;
      const student = mockStudents.find((s) => s.id === r.studentId);
      if (filterCompetency !== "All" && r.competency !== filterCompetency)
        return false;
      if (filterClass !== "All" && student?.gradeLevel !== filterClass)
        return false;
      return true;
    });

    const submitted = cycleResults.filter((r) => r.status !== "draft").length;
    const total = filteredStudents.length;
    const completion = total > 0 ? Math.round((submitted / total) * 100) : 0;

    // Per-competency
    const compList =
      filterCompetency !== "All" ? [filterCompetency] : COMPETENCIES.slice(1);
    const competencyStats = compList
      .map((comp) => {
        const compStudents = filteredStudents.filter(
          (s) => s.competency === comp,
        ).length;
        const compSubmitted = cycleResults.filter(
          (r) => r.competency === comp && r.status !== "draft",
        ).length;
        return { comp, compStudents, compSubmitted };
      })
      .filter((c) => c.compStudents > 0);

    // Assessor progress
    const assessors = mockRoleAssignments.filter((ra) => {
      if (ra.cycleId !== selectedCycle?.id || ra.assignedRole !== "assessor")
        return false;
      if (filterCompetency !== "All" && ra.competency !== filterCompetency)
        return false;
      if (filterClass !== "All" && ra.grade !== filterClass) return false;
      return true;
    });
    const assessorProgress = assessors.map((ra) => {
      const assessorUser = mockUsers.find((u) => u.id === ra.userId);
      const assessorResults = cycleResults.filter(
        (r) => r.assessorId === ra.userId,
      );
      const assessorStudents = filteredStudents.filter(
        (s) => s.competency === ra.competency && s.gradeLevel === ra.grade,
      );
      return {
        name: assessorUser?.fullName ?? ra.userId,
        competency: ra.competency,
        classGroup: ra.classGroup,
        submitted: assessorResults.filter((r) => r.status !== "draft").length,
        total: assessorStudents.length,
      };
    });

    return { submitted, total, completion, competencyStats, assessorProgress };
  }, [selectedCycle, filterCompetency, filterClass]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-1">Controller Dashboard</h1>
        <p className="text-red-100 text-sm">
          {selectedCycle ? selectedCycle.name : "No cycle selected"}
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          {/* Cycle */}
          <Select value={filterCycle} onValueChange={setFilterCycle}>
            <SelectTrigger className="w-52 h-9 text-xs">
              <SelectValue placeholder="Select cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active Cycle</SelectItem>
              {mockCycles.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Competency */}
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

          {/* Class */}
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

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Students"
          value={stats.total}
          icon={Users}
          color="text-blue-600"
        />
        <StatCard
          label="Results Submitted"
          value={stats.submitted}
          icon={TrendingUp}
          color="text-purple-600"
        />
        <StatCard
          label="Cycle Completion"
          value={`${stats.completion}%`}
          icon={CheckCircle}
          color="text-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessor Progress */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Assessor Progress
          </h2>
          <div className="space-y-4">
            {stats.assessorProgress.map((ap, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{ap.name}</span>
                  <span className="text-gray-500">
                    {ap.competency} · {ap.classGroup} · {ap.submitted}/
                    {ap.total}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all"
                    style={{
                      width:
                        ap.total > 0
                          ? `${(ap.submitted / ap.total) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
            {stats.assessorProgress.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No assessors match the current filters
              </p>
            )}
          </div>
        </Card>

        {/* Submissions by Competency */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Submissions by Competency
          </h2>
          <div className="space-y-3">
            {stats.competencyStats.map((cs) => (
              <div
                key={cs.comp}
                className="flex items-center justify-between text-sm py-1"
              >
                <span className="text-gray-700 font-medium w-28 shrink-0">
                  {cs.comp}
                </span>
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all"
                      style={{
                        width:
                          cs.compStudents > 0
                            ? `${(cs.compSubmitted / cs.compStudents) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs w-14 text-right">
                    {cs.compSubmitted}/{cs.compStudents}
                  </span>
                </div>
              </div>
            ))}
            {stats.competencyStats.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No data yet
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Overall completion bar */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">
            Overall Completion
          </h2>
          <span className="text-2xl font-bold text-red-500">
            {stats.completion}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-red-400 to-red-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${stats.completion}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {stats.submitted} of {stats.total} students assessed
        </p>
      </Card>
    </div>
  );
}
