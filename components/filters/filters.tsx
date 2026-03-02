"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterValues {
  students: string[];
  grade: string;
  class: string;
  sessions: string[];
  fromDate: string;
  toDate: string;
}

export function Filters({ onFilterChange }: { readonly onFilterChange: any }) {
  const [filters, setFilters] = useState<FilterValues>({
    students: [],
    grade: "all",
    class: "all",
    sessions: ["1"],
    fromDate: "2026-01-01",
    toDate: "2026-03-02",
  });

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterValues = {
      students: [],
      grade: "all",
      class: "all",
      sessions: [],
      fromDate: "2026-01-01",
      toDate: "2026-03-02",
    };
    setFilters(resetFilters);
    onFilterChange?.(resetFilters);
  };

  // Calculate active filters count
  const activeFiltersCount =
    (filters.grade !== "all" ? 1 : 0) +
    (filters.class !== "all" ? 1 : 0) +
    (filters.students.length > 0 && filters.students[0] !== "" ? 1 : 0) +
    (filters.sessions.length > 0 && filters.sessions[0] !== "" ? 1 : 0);

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Filter by Students */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-600 uppercase">
            Filter by Students
          </Label>
          <Select
            value={filters.students.length > 0 ? filters.students[0] : ""}
            onValueChange={(value) => handleFilterChange("students", [value])}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All students..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="top">Top Performers</SelectItem>
              <SelectItem value="needs">Needs Attention</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grade */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-600 uppercase">
            Grade
          </Label>
          <Select
            value={filters.grade}
            onValueChange={(value) => handleFilterChange("grade", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Grades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="wheeler">Wheeler</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Class */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-600 uppercase">
            Class
          </Label>
          <Select
            value={filters.class}
            onValueChange={(value) => handleFilterChange("class", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="j1">Junior J1</SelectItem>
              <SelectItem value="j2">Junior J2</SelectItem>
              <SelectItem value="w1">Wheeler W1</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter by Sessions */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-600 uppercase">
            Filter by Competency
          </Label>
          <Select
            value={filters.sessions.length > 0 ? filters.sessions[0] : ""}
            onValueChange={(value) => handleFilterChange("sessions", [value])}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All competencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Competencies</SelectItem>
              <SelectItem value="math">Math Foundations</SelectItem>
              <SelectItem value="science">Science Inquiry</SelectItem>
              <SelectItem value="language">Language Arts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* From Date */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-600 uppercase">
            From Date
          </Label>
          <div className="relative">
            <Input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* To Date */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-600 uppercase">
            To Date
          </Label>
          <div className="relative">
            <Input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange("toDate", e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Empty spacers for alignment */}
        <div className="hidden lg:block" />
        <div className="hidden lg:block" />
        <div className="hidden lg:block" />

        {/* Reset Button */}
        <div className="flex items-end">
          <Button
            variant="secondary"
            onClick={handleReset}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white"
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Active Filters:
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Grade Filter */}
            {filters.grade !== "all" && (
              <div className="px-3 py-1 flex items-center gap-2 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-full text-sm">
                <span>
                  Grade:{" "}
                  {filters.grade.charAt(0).toUpperCase() +
                    filters.grade.slice(1)}
                </span>
                <button
                  onClick={() => handleFilterChange("grade", "all")}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </div>
            )}
            {/* Class Filter */}
            {filters.class !== "all" && (
              <div className="px-3 py-1 flex items-center gap-2 bg-orange-100 text-orange-800 hover:bg-orange-200 rounded-full text-sm">
                <span>Class: {filters.class.toUpperCase()}</span>
                <button
                  onClick={() => handleFilterChange("class", "all")}
                  className="hover:text-orange-900"
                >
                  ×
                </button>
              </div>
            )}
            {/* Students Filter */}
            {filters.students.length > 0 && filters.students[0] !== "" && (
              <div className="px-3 py-1 flex items-center gap-2 bg-green-100 text-green-800 hover:bg-green-200 rounded-full text-sm">
                <span>
                  Students:{" "}
                  {filters.students[0] === "top"
                    ? "Top Performers"
                    : "Needs Attention"}
                </span>
                <button
                  onClick={() => handleFilterChange("students", [])}
                  className="hover:text-green-900"
                >
                  ×
                </button>
              </div>
            )}
            {/* Competency Filter */}
            {filters.sessions.length > 0 && filters.sessions[0] !== "" && (
              <div className="px-3 py-1 flex items-center gap-2 bg-purple-100 text-purple-800 hover:bg-purple-200 rounded-full text-sm">
                <span>
                  Competency:{" "}
                  {filters.sessions[0] === "math"
                    ? "Math Foundations"
                    : filters.sessions[0] === "science"
                      ? "Science Inquiry"
                      : "Language Arts"}
                </span>
                <button
                  onClick={() => handleFilterChange("sessions", [])}
                  className="hover:text-purple-900"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
