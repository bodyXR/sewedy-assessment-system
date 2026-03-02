"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Competency, GradeLevel } from "@/lib/types";

interface StudentsFiltersProps {
  readonly searchQuery: string;
  readonly onSearchChange: (value: string) => void;
  readonly selectedCompetencies: string[];
  readonly onCompetenciesChange: (values: string[]) => void;
  readonly selectedGrades: GradeLevel[];
  readonly onGradesChange: (values: GradeLevel[]) => void;
  readonly selectedClass: string;
  readonly onClassChange: (value: string) => void;
  readonly availableClasses: string[];
  readonly onClearFilters: () => void;
  readonly competencies: Competency[];
}

export function StudentsFilters({
  searchQuery,
  onSearchChange,
  selectedCompetencies,
  onCompetenciesChange,
  selectedGrades,
  onGradesChange,
  selectedClass,
  onClassChange,
  availableClasses,
  onClearFilters,
  competencies,
}: StudentsFiltersProps) {
  const grades: GradeLevel[] = ["Junior", "Wheeler", "Senior"];
  const uniqueCompetencies = competencies.filter(
    (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i,
  );

  const handleCompetencyToggle = (competencyId: string) => {
    onCompetenciesChange(
      selectedCompetencies.includes(competencyId)
        ? selectedCompetencies.filter((c) => c !== competencyId)
        : [...selectedCompetencies, competencyId],
    );
  };

  const handleGradeToggle = (grade: GradeLevel) => {
    onGradesChange(
      selectedGrades.includes(grade)
        ? selectedGrades.filter((g) => g !== grade)
        : [...selectedGrades, grade],
    );
  };

  const activeFiltersCount =
    selectedCompetencies.length +
    selectedGrades.length +
    (selectedClass !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">
            Search Students
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Grade Level */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">
            Grade Level
          </div>
          <Select
            value={selectedGrades.length === 1 ? selectedGrades[0] : "all"}
            onValueChange={(value) => {
              if (value === "all") {
                onGradesChange([]);
                onClassChange("all");
              } else {
                onGradesChange([value as GradeLevel]);
                onClassChange("all");
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Grades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {grades.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Class Filter */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">
            Filter by Class
          </div>
          <Select
            value={selectedClass}
            onValueChange={onClassChange}
            disabled={selectedGrades.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {availableClasses.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Competency */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">
            Filter by Competency
          </div>
          <Select
            value={
              selectedCompetencies.length === 1
                ? selectedCompetencies[0]
                : "all"
            }
            onValueChange={(value) => {
              if (value === "all") {
                onCompetenciesChange([]);
              } else {
                onCompetenciesChange([value]);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Competencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Competencies</SelectItem>
              {uniqueCompetencies.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  {comp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters & Reset */}
      {activeFiltersCount > 0 && (
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Active Filters:
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Search Filter */}
            {searchQuery.trim() && (
              <Badge
                variant="secondary"
                className="px-3 py-1 flex items-center gap-2 bg-green-100 text-green-800 hover:bg-green-200"
              >
                <span>Search: "{searchQuery}"</span>
                <button
                  onClick={() => onSearchChange("")}
                  className="hover:text-green-900"
                >
                  ×
                </button>
              </Badge>
            )}
            {/* Grade Filters */}
            {selectedGrades.map((grade) => (
              <Badge
                key={grade}
                variant="secondary"
                className="px-3 py-1 flex items-center gap-2 bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                <span>Grade: {grade}</span>
                <button
                  onClick={() => handleGradeToggle(grade)}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </Badge>
            ))}
            {/* Class Filter */}
            {selectedClass !== "all" && (
              <Badge
                variant="secondary"
                className="px-3 py-1 flex items-center gap-2 bg-orange-100 text-orange-800 hover:bg-orange-200"
              >
                <span>Class: {selectedClass}</span>
                <button
                  onClick={() => onClassChange("all")}
                  className="hover:text-orange-900"
                >
                  ×
                </button>
              </Badge>
            )}
            {/* Competency Filters */}
            {selectedCompetencies.map((compId) => {
              const comp = uniqueCompetencies.find((c) => c.id === compId);
              return (
                <Badge
                  key={compId}
                  variant="secondary"
                  className="px-3 py-1 flex items-center gap-2 bg-purple-100 text-purple-800 hover:bg-purple-200"
                >
                  <span>Competency: {comp?.name}</span>
                  <button
                    onClick={() => handleCompetencyToggle(compId)}
                    className="hover:text-purple-900"
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
