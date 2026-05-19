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
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 uppercase">
          Competencies
        </h1>
        <p className="text-primary-foreground/80 text-xs sm:text-sm font-medium">
          {filtered.length} COMPETENC{filtered.length === 1 ? "Y" : "IES"}{" "}
          ACROSS ALL GRADE LEVELS
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
