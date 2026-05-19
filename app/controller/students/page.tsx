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
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">
          Students
        </h1>
        <p className="text-primary-foreground/80 text-sm font-medium tracking-wide">
          {mockStudents.length} STUDENTS ENROLLED ACROSS ALL CLASSES
        </p>
      </div>

      {/* Filters */}
      <Card className="p-5 rounded-[3px] border-2 border-border shadow-sm">
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
      <Card className="overflow-hidden rounded-[3px] border-2 border-border shadow-sm">
        <div className="px-6 py-5 border-b-2 border-border bg-card">
          <p className="font-bold text-foreground uppercase tracking-widest text-sm">
            {filtered.length} Students
          </p>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <div className="divide-y divide-gray-50 min-w-[640px]">
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
                  className="flex items-center justify-between px-6 py-4 hover:bg-secondary/30 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-[3px] border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm tracking-wider uppercase shrink-0">
                      {student.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                        {student.fullName}
                      </p>
                      <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mt-1">
                        {student.code}{" "}
                        <span className="mx-1 text-border">|</span>{" "}
                        {student.gradeLevel}{" "}
                        <span className="mx-1 text-border">|</span>{" "}
                        {student.competency}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {avgScore !== null && (
                      <span
                        className={`text-xl font-bold tracking-tight ${avgScore >= 70 ? "text-success" : avgScore >= 50 ? "text-warning" : "text-destructive"}`}
                      >
                        {avgScore}%
                      </span>
                    )}
                    {latest ? (
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-[3px] border uppercase tracking-widest ${statusBadge[latest.status] ?? "bg-gray-100 text-gray-500"}`}
                      >
                        {latest.status}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground font-medium">
                        No results yet
                      </span>
                    )}
                    <span className="text-muted-foreground group-hover:text-primary transition-colors transform group-hover:translate-x-1">
                      →
                    </span>
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
        </div>
      </Card>
    </div>
  );
}
