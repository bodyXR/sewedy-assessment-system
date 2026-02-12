"use client";

import { BookOpen, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

export interface StudentCompetency {
  id: string;
  name: string;
  status: "Enrolled" | "Passed" | "Failed";
  grade?: string;
  date?: string;
  notes?: string;
}

interface StudentCompetenciesTableProps {
  competencies: StudentCompetency[];
  onEdit: (competency: StudentCompetency) => void;
}

export function StudentCompetenciesTable({
  competencies,
  onEdit,
}: StudentCompetenciesTableProps) {
  const columns: ColumnDef<StudentCompetency>[] = [
    {
      accessorKey: "name",
      header: "Competency Name",
      cell: ({ row }) => (
        <div className="font-medium text-foreground">
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={
              status === "Passed"
                ? "green"
                : status === "Failed"
                  ? "destructive"
                  : "secondary"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => {
        const grade = row.getValue("grade") as string;
        if (!grade) return <div className="font-bold text-foreground">-</div>;

        let variant: "green" | "blue" | "yellow" | "red" | "secondary" =
          "secondary";
        if (grade === "A") variant = "green";
        else if (grade === "B") variant = "blue";
        else if (grade === "C") variant = "yellow";
        else if (grade === "D") variant = "red";

        return (
          <Badge variant={variant} className="font-bold">
            {grade}
          </Badge>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.getValue("date") || "-"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant={"outline"}
          className="hover:text-white"
          onClick={() => onEdit(row.original)}
        >
          Edit Assessment
        </Button>
      ),
    },
  ];

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Result History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={competencies} />
      </CardContent>
    </Card>
  );
}
