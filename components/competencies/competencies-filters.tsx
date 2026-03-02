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
import type { GradeLevel } from "@/lib/types";

interface CompetenciesFiltersProps {
  readonly searchQuery: string;
  readonly onSearchChange: (value: string) => void;
  readonly selectedGrade: GradeLevel | "All";
  readonly onGradeChange: (value: GradeLevel | "All") => void;
}

export function CompetenciesFilters({
  searchQuery,
  onSearchChange,
  selectedGrade,
  onGradeChange,
}: CompetenciesFiltersProps) {
  const grades: (GradeLevel | "All")[] = ["All", "Junior", "Wheeler", "Senior"];
  const activeFiltersCount =
    (selectedGrade !== "All" ? 1 : 0) + (searchQuery.trim() ? 1 : 0);

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Search */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">
            Search Competencies
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by competency name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Grade Level */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">
            Filter by Grade Level
          </div>
          <Select value={selectedGrade} onValueChange={onGradeChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {grades.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
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
              onClick={() => onGradeChange("All")}
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
            {/* Grade Filter */}
            {selectedGrade !== "All" && (
              <Badge
                variant="secondary"
                className="px-3 py-1 flex items-center gap-2 bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                <span>Grade: {selectedGrade}</span>
                <button
                  onClick={() => onGradeChange("All")}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
