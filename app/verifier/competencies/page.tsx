"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompetenciesFilters } from "@/components/competencies/competencies-filters";
import { CompetenciesTable } from "@/components/competencies/competencies-table";
import { CompetencyModal } from "@/components/competencies/competency-modal";
import { DeleteConfirmDialog } from "@/components/competencies/delete-confirm-dialog";
import { mockCompetencies } from "@/lib/mock-data";
import type { Competency, GradeLevel } from "@/lib/types";

export default function VerifierCompetenciesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | "All">("All");
  const [competencies, setCompetencies] =
    useState<Competency[]>(mockCompetencies);
  const [showModal, setShowModal] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState<Competency | null>(
    null,
  );
  const [deleteCompetency, setDeleteCompetency] = useState<Competency | null>(
    null,
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredCompetencies = useMemo(() => {
    return competencies.filter((comp) => {
      const matchesSearch = comp.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesGrade =
        selectedGrade === "All" || comp.gradeLevel === selectedGrade;
      return matchesSearch && matchesGrade;
    });
  }, [competencies, searchQuery, selectedGrade]);

  const handleSaveCompetency = (data: {
    name: string;
    gradeLevel: GradeLevel;
    description: string;
    learningOutcomes: string[];
  }) => {
    if (editingCompetency) {
      setCompetencies(
        competencies.map((c) =>
          c.id === editingCompetency.id ? { ...c, ...data } : c,
        ),
      );
    } else {
      const newCompetency: Competency = {
        id: `comp${Date.now()}`,
        ...data,
        totalStudents: 0,
        gradeDistribution: { A: 0, B: 0, C: 0, D: 0 },
      };
      setCompetencies([...competencies, newCompetency]);
    }
    setShowModal(false);
    setEditingCompetency(null);
  };

  const handleConfirmDelete = () => {
    if (deleteCompetency) {
      setCompetencies(competencies.filter((c) => c.id !== deleteCompetency.id));
      setShowDeleteConfirm(false);
      setDeleteCompetency(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 uppercase">
              Competencies
            </h1>
            <p className="text-primary-foreground/80 text-xs sm:text-sm font-medium tracking-wide">
              MANAGE {filteredCompetencies.length} COMPETENC
              {filteredCompetencies.length === 1 ? "Y" : "IES"} ACROSS ALL GRADE
              LEVELS
            </p>
          </div>
          <Button
            onClick={() => router.push("/verifier/competencies/add")}
            className="bg-background text-primary hover:bg-background/90 font-bold border border-border shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Competency
          </Button>
        </div>
      </div>

      <CompetenciesFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGrade={selectedGrade}
        onGradeChange={setSelectedGrade}
      />

      <CompetenciesTable
        competencies={filteredCompetencies}
        onEdit={(c) => {
          setEditingCompetency(c);
          setShowModal(true);
        }}
        onDelete={(c) => {
          setDeleteCompetency(c);
          setShowDeleteConfirm(true);
        }}
      />

      <CompetencyModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCompetency(null);
        }}
        onSave={handleSaveCompetency}
        competency={editingCompetency}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        competencyName={deleteCompetency?.name ?? ""}
      />
    </div>
  );
}
