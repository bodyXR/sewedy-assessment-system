"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import type { Student, Competency } from "@/lib/types";
import { DataTable } from "@/components/ui/data-table";
import { SortableHeader } from "@/components/ui/sortable-header";

interface StudentsTableProps {
  students: Student[];
  competencies: Competency[];
  onAssess: (student: Student) => void;
}

export function StudentsTable({
  students,
  competencies,
  onAssess,
}: StudentsTableProps) {
  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <SortableHeader column={column} title="Student Code" />
      ),
      cell: ({ row }) => (
        <div className="font-medium text-foreground">
          {row.getValue("code")}
        </div>
      ),
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <SortableHeader column={column} title="Full Name" />
      ),
      cell: ({ row }) => (
        <div className="text-foreground">{row.getValue("fullName")}</div>
      ),
    },
    {
      accessorKey: "gradeLevel",
      header: ({ column }) => (
        <SortableHeader column={column} title="Grade Level" />
      ),
      cell: ({ row }) => (
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
          {row.getValue("gradeLevel")}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        return (
          <div className="text-right">
            <Button
              onClick={() => onAssess(row.original)}
              className="bg-primary hover:bg-primary/90 text-white font-medium h-9"
            >
              Assess
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={students} />;
}
