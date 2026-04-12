"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockStudents, mockResults } from "@/lib/mock-data";
import type { GradeLevel } from "@/lib/types";

const CLASSES: (GradeLevel | "All")[] = ["All", "Junior", "Wheeler", "Senior"];
const COMPETENCIES = [
  "All",
  "Structural",
  "Civil",
  "Electrical",
  "Mechanical",
  "Software",
];

export default function ControllerStudentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterCompetency, setFilterCompetency] = useState("All");

  const filtered = useMemo(
    () =>
      mockStudents.filter((s) => {
        if (filterClass !== "All" && s.gradeLevel !== filterClass) return false;
        if (filterCompetency !== "All" && s.competency !== filterCompetency)
          return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            s.fullName.toLowerCase().includes(q) ||
            s.code.toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [search, filterClass, filterCompetency],
  );

  const getLatestResult = (studentId: string) =>
    mockResults
      .filter((r) => r.studentId === studentId && r.status !== "draft")
      .sort((a, b) =>
        (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""),
      )[0];

  const statusBadge: Record<string, string> = {
    submitted: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    draft: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-1">Students</h1>
        <p className="text-red-100 text-sm">
          {mockStudents.length} students enrolled across all classes
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
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
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-900">
            {filtered.length} students
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map((student) => {
            const latest = getLatestResult(student.id);
            const avgScore =
              latest && Object.values(latest.scores).length > 0
                ? Math.round(
                    Object.values(latest.scores).reduce((a, b) => a + b, 0) /
                      Object.values(latest.scores).length,
                  )
                : null;

            return (
              <div
                key={student.id}
                onClick={() =>
                  router.push(`/controller/students/${student.id}`)
                }
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600 font-semibold text-sm shrink-0">
                    {student.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {student.fullName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {student.code} · {student.gradeLevel} ·{" "}
                      {student.competency}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {avgScore !== null && (
                    <span
                      className={`text-sm font-semibold ${avgScore >= 80 ? "text-green-600" : avgScore >= 60 ? "text-amber-500" : "text-red-500"}`}
                    >
                      {avgScore}%
                    </span>
                  )}
                  {latest ? (
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusBadge[latest.status] ?? "bg-gray-100 text-gray-500"}`}
                    >
                      {latest.status}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">
                      No results yet
                    </span>
                  )}
                  <span className="text-gray-300 text-xs">→</span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              No students match your filters.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
