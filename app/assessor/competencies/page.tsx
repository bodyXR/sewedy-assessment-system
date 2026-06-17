"use client";

import { useState, useMemo } from "react";
import { Loader2, Search, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCourses } from "@/hooks/use-api";

export default function AssessorCompetenciesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("All");

  const { data: courses, isLoading, error } = useCourses();

  // Extract unique grades
  const grades = useMemo(() => {
    if (!courses) return ["All"];
    const uniqueGrades = new Set(
      courses.map((c) => c.gradeName).filter((g): g is string => Boolean(g)),
    );
    return [
      "All",
      ...Array.from(uniqueGrades).sort((a, b) => a.localeCompare(b)),
    ];
  }, [courses]);

  const filtered = useMemo(() => {
    if (!courses) return [];
    return courses.filter((c) => {
      const matchesSearch = c.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesGrade =
        selectedGrade === "All" || c.gradeName === selectedGrade;
      return matchesSearch && matchesGrade;
    });
  }, [courses, searchQuery, selectedGrade]);

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-red-600 font-semibold mb-2">
            Error loading competencies
          </p>
          <p className="text-sm text-gray-600">{error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 uppercase">
          Competencies
        </h1>
        <p className="text-primary-foreground/80 text-xs sm:text-sm font-medium">
          {filtered.length} COMPETENC{filtered.length === 1 ? "Y" : "IES"}{" "}
          ACROSS ALL GRADE LEVELS
        </p>
      </div>

      {/* Filters */}
      <Card className="p-5 rounded-[3px] border-2 border-border shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search competencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
              disabled={isLoading}
            />
          </div>
          <Select
            value={selectedGrade}
            onValueChange={setSelectedGrade}
            disabled={isLoading}
          >
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {grades.map((g) => (
                <SelectItem key={g} value={g}>
                  {g === "All" ? "All Grades" : g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Competencies Table */}
      <Card className="overflow-hidden rounded-[3px] border-2 border-border shadow-sm">
        <div className="px-6 py-5 border-b-2 border-border bg-card">
          <p className="font-bold text-foreground uppercase tracking-widest text-sm">
            {filtered.length} Competenc{filtered.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          {isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-gray-600">
                Loading competencies...
              </span>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 min-w-[640px]">
              {filtered.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-secondary/30 transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-[3px] border-2 border-primary/20 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                        {course.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        {course.gradeName && (
                          <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-[3px] uppercase tracking-wider">
                            {course.gradeName}
                          </span>
                        )}
                        {course.durationHours && (
                          <span className="text-xs text-muted-foreground">
                            {course.durationHours} hours
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && !isLoading && (
                <div className="p-12 text-center text-gray-400">
                  No competencies match your filters.
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
