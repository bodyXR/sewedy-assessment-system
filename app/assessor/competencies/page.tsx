"use client";

import { useState, useMemo } from "react";
import { CompetenciesFilters } from "@/components/competencies/competencies-filters";
import { CompetenciesTable } from "@/components/competencies/competencies-table";
import { mockCompetencies } from "@/lib/mock-data";
import type { GradeLevel } from "@/lib/types";

export default function AssessorCompetenciesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | "All">("All");

  const filtered = useMemo(
    () =>
      mockCompetencies.filter((c) => {
        const matchesSearch = c.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesGrade =
          selectedGrade === "All" || c.gradeLevel === selectedGrade;
        return matchesSearch && matchesGrade;
      }),
    [searchQuery, selectedGrade],
  );

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-1">Competencies</h1>
        <p className="text-red-100 text-sm">
          {filtered.length} competenc{filtered.length === 1 ? "y" : "ies"}{" "}
          across all grade levels
        </p>
      </div>

      <CompetenciesFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGrade={selectedGrade}
        onGradeChange={setSelectedGrade}
      />

      <CompetenciesTable
        competencies={filtered}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
}
