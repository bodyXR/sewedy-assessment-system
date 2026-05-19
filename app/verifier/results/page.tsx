"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Eye, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mockResults,
  mockStudents,
  mockUsers,
  mockCycles,
} from "@/lib/mock-data";
import type { ResultStatus } from "@/lib/types";

const statusBadge: Record<ResultStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
};

const COMPETENCIES = [
  "All",
  "Structural",
  "Civil",
  "Electrical",
  "Mechanical",
  "Software",
];
const CLASSES = ["All", "Junior", "Wheeler", "Senior", "Lead"];

export default function VerifierResultsPage() {
  const router = useRouter();
  const activeCycle = mockCycles.find((c) => c.status === "active");

  const [filterCompetency, setFilterCompetency] = useState("All");
  const [filterClass, setFilterClass] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");

  // Verifier sees ALL submitted/approved results across all competencies
  const allResults = useMemo(() => {
    return mockResults.filter((r) => r.status !== "draft");
  }, []);

  const filtered = useMemo(() => {
    return allResults.filter((r) => {
      const student = mockStudents.find((s) => s.id === r.studentId);
      if (filterCompetency !== "All" && r.competency !== filterCompetency)
        return false;
      if (filterClass !== "All" && student?.gradeLevel !== filterClass)
        return false;
      if (filterStatus !== "All" && r.status !== filterStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const nameMatch = student?.fullName.toLowerCase().includes(q);
        const codeMatch = student?.code.toLowerCase().includes(q);
        if (!nameMatch && !codeMatch) return false;
      }
      return true;
    });
  }, [allResults, filterCompetency, filterClass, filterStatus, search]);

  const stats = useMemo(
    () => ({
      total: allResults.length,
      submitted: allResults.filter((r) => r.status === "submitted").length,
      approved: allResults.filter((r) => r.status === "approved").length,
    }),
    [allResults],
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">
          Assessment Monitor
        </h1>
        <p className="text-primary-foreground/80 text-sm font-medium tracking-wide">
          {activeCycle
            ? `MONITORING: ${activeCycle.name.toUpperCase()}`
            : "NO ACTIVE CYCLE"}{" "}
          · ALL CLASSES & COMPETENCIES
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Results",
            value: stats.total,
            color: "text-foreground",
          },
          { label: "Pending", value: stats.submitted, color: "text-warning" },
          { label: "Approved", value: stats.approved, color: "text-success" },
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

      {/* Filters */}
      <Card className="p-5 rounded-[3px] border-2 border-border shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
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
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["All", "submitted", "approved"].map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s === "All" ? "All Statuses" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Results Table */}
      <Card className="overflow-hidden rounded-[3px] border-2 border-border shadow-sm">
        <div className="px-6 py-5 border-b-2 border-border bg-card flex items-center justify-between">
          <h2 className="font-bold text-foreground uppercase tracking-widest text-sm">
            Results ({filtered.length})
          </h2>
        </div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No results match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <div className="divide-y divide-gray-50 min-w-[768px]">
              {filtered.map((result) => {
                const student = mockStudents.find(
                  (s) => s.id === result.studentId,
                );
                const assessor = mockUsers.find(
                  (u) => u.id === result.assessorId,
                );
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
                      <div className="w-12 h-12 bg-primary/10 rounded-[3px] border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm tracking-wider uppercase shrink-0">
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
                          {student?.gradeLevel}{" "}
                          <span className="mx-1 text-border">|</span>{" "}
                          {result.competency}{" "}
                          <span className="mx-1 text-border">|</span> BY{" "}
                          {assessor?.fullName}
                          {result.submittedAt &&
                            ` | ${new Date(result.submittedAt).toLocaleDateString()}`}
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
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-[3px] border uppercase tracking-widest ${statusBadge[result.status]}`}
                      >
                        {result.status}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/verifier/review/${result.id}`)
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
