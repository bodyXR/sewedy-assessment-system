"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompetenciesFilters } from "@/components/competencies/competencies-filters";
import { CompetenciesTable } from "@/components/competencies/competencies-table";
import { CompetencyModal } from "@/components/competencies/competency-modal";
import { DeleteConfirmDialog } from "@/components/competencies/delete-confirm-dialog";
import { mockCompetencies } from "@/lib/mock-data";
import type { Competency, GradeLevel } from "@/lib/types";

export default function VerifierCompetenciesPage() {
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
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Competencies</h1>
          <p className="text-red-100 text-sm">
            Manage {filteredCompetencies.length} competenc
            {filteredCompetencies.length === 1 ? "y" : "ies"} across all grade
            levels
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCompetency(null);
            setShowModal(true);
          }}
          className="bg-white text-red-600 hover:bg-red-50 font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Competency
        </Button>
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
