"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudents } from "@/hooks/use-api";

export default function ControllerStudentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterCompetency, setFilterCompetency] = useState("All");

  const { data: students, isLoading, error } = useStudents();

  // Extract unique competencies from students
  const competencies = useMemo(() => {
    if (!students) return ["All"];
    const uniqueCompetencies = new Set(
      students
        .filter((s) => s.competencies && Array.isArray(s.competencies))
        .flatMap((s) => s.competencies!.map((c) => c.competencyName)),
    );
    return [
      "All",
      ...Array.from(uniqueCompetencies).sort((a, b) => a.localeCompare(b)),
    ];
  }, [students]);

  const filtered = useMemo(() => {
    if (!students) return [];
    return students.filter((s) => {
      if (filterCompetency !== "All") {
        if (!s.competencies || !Array.isArray(s.competencies)) return false;
        const hasCompetency = s.competencies.some(
          (c) => c.competencyName === filterCompetency,
        );
        if (!hasCompetency) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          s.fullNameEn.toLowerCase().includes(q) ||
          s.fullNameAr.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.nationalId.includes(q)
        );
      }
      return true;
    });
  }, [students, search, filterCompetency]);

  const statusBadge: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Passed: "bg-blue-100 text-blue-700",
    "Not Passed": "bg-red-100 text-red-700",
    Inactive: "bg-gray-100 text-gray-500",
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-8 text-center">
          <p className="text-red-600 font-semibold mb-2">
            Error loading students
          </p>
          <p className="text-sm text-gray-600">{error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">
          Students
        </h1>
        <p className="text-primary-foreground/80 text-sm font-medium tracking-wide">
          {students?.length || 0} STUDENTS ENROLLED ACROSS ALL CLASSES
        </p>
      </div>

      {/* Filters */}
      <Card className="p-5 rounded-[3px] border-2 border-border shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, email, or national ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
              disabled={isLoading}
            />
          </div>
          <Select
            value={filterCompetency}
            onValueChange={setFilterCompetency}
            disabled={isLoading}
          >
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {competencies.map((c) => (
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
          {isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-gray-600">Loading students...</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 min-w-[640px]">
              {filtered.map((student) => {
                const initials = student.fullNameEn
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

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
                        {initials}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                          {student.fullNameEn}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mt-1">
                          {student.email}
                          {student.className && (
                            <>
                              {" "}
                              <span className="mx-1 text-border">|</span>{" "}
                              {student.className}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {student.status && (
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-[3px] border uppercase tracking-widest ${statusBadge[student.status] ?? "bg-gray-100 text-gray-500"}`}
                        >
                          {student.status}
                        </span>
                      )}
                      <span className="text-muted-foreground group-hover:text-primary transition-colors transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && !isLoading && (
                <div className="p-12 text-center text-gray-400">
                  No students match your filters.
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
