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
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-1">Assessment Monitor</h1>
        <p className="text-red-100 text-sm">
          {activeCycle ? `Monitoring: ${activeCycle.name}` : "No active cycle"}{" "}
          · All classes & competencies
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Results",
            value: stats.total,
            color: "text-gray-900",
          },
          { label: "Pending", value: stats.submitted, color: "text-amber-500" },
          { label: "Approved", value: stats.approved, color: "text-green-600" },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
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
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Results ({filtered.length})
          </h2>
        </div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No results match your filters.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
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
                      Object.values(result.scores).reduce((a, b) => a + b, 0) /
                        Object.values(result.scores).length,
                    )
                  : null;

              return (
                <div
                  key={result.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600 font-semibold text-sm shrink-0">
                      {student?.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {student?.fullName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {student?.code} · {student?.gradeLevel} ·{" "}
                        {result.competency} · by {assessor?.fullName}
                        {result.submittedAt &&
                          ` · ${new Date(result.submittedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {avgScore !== null && (
                      <span
                        className={`text-sm font-semibold ${avgScore >= 70 ? "text-green-600" : avgScore >= 50 ? "text-amber-500" : "text-red-500"}`}
                      >
                        {avgScore}%
                      </span>
                    )}
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusBadge[result.status]}`}
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
        )}
      </Card>
    </div>
  );
}
