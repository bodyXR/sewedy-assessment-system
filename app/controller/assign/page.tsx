"use client";

import { useState } from "react";
import { Save, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockUsers, mockRoleAssignments, mockCycles } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import type { GradeLevel, CompetencyType, AssignedRole } from "@/lib/types";

const GRADES: GradeLevel[] = ["Junior", "Wheeler", "Senior"];

// Classes per grade
const CLASSES_BY_GRADE: Record<GradeLevel, string[]> = {
  Junior: ["J1", "J2", "J3", "J4"],
  Wheeler: ["W1", "W2", "W3"],
  Senior: ["S1", "S2", "S3", "S4"],
};

const COMPETENCIES: CompetencyType[] = [
  "Structural",
  "Civil",
  "Electrical",
  "Mechanical",
  "Software",
];
const ROLES: AssignedRole[] = ["assessor", "verifier"];

interface LocalAssignment {
  grade: GradeLevel | "";
  classGroup: string;
  competency: CompetencyType | "";
  assignedRole: AssignedRole | "";
}

export default function AssignPage() {
  const { toast } = useToast();

  const [selectedCycleId, setSelectedCycleId] = useState<string>(
    mockCycles.find((c) => c.status === "active")?.id ??
      mockCycles[0]?.id ??
      "",
  );

  const selectedCycle = mockCycles.find((c) => c.id === selectedCycleId);
  const assignableUsers = mockUsers.filter(
    (u) => u.accountRole !== "controller",
  );

  const buildInit = (cycleId: string): Record<string, LocalAssignment> => {
    const init: Record<string, LocalAssignment> = {};
    assignableUsers.forEach((u) => {
      const existing = mockRoleAssignments.find(
        (ra) => ra.userId === u.id && ra.cycleId === cycleId,
      );
      init[u.id] = {
        grade: existing?.grade ?? "",
        classGroup: existing?.classGroup ?? "",
        competency: existing?.competency ?? "",
        assignedRole: existing?.assignedRole ?? "",
      };
    });
    return init;
  };

  const [assignments, setAssignments] = useState<
    Record<string, LocalAssignment>
  >(() => buildInit(selectedCycleId));
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const handleCycleChange = (cycleId: string) => {
    setSelectedCycleId(cycleId);
    setSaved({});
    setAssignments(buildInit(cycleId));
  };

  const handleChange = (
    userId: string,
    field: keyof LocalAssignment,
    value: string,
  ) => {
    setAssignments((prev) => {
      const updated = { ...prev[userId], [field]: value as never };
      // Reset classGroup when grade changes or when switching to verifier
      if (field === "grade") updated.classGroup = "";
      if (field === "assignedRole" && value === "verifier")
        updated.classGroup = "";
      return { ...prev, [userId]: updated };
    });
    setSaved((prev) => ({ ...prev, [userId]: false }));
  };

  const handleSave = (userId: string) => {
    const a = assignments[userId];
    const needsClass = a.assignedRole === "assessor";
    if (
      !a.grade ||
      !a.competency ||
      !a.assignedRole ||
      (needsClass && !a.classGroup)
    ) {
      toast({
        title: "Incomplete",
        description:
          needsClass && !a.classGroup
            ? "Please select a class for the assessor."
            : "Please fill all fields before saving.",
        variant: "destructive",
      });
      return;
    }
    setSaved((prev) => ({ ...prev, [userId]: true }));
    toast({
      title: "Saved",
      description: `Assignment saved for ${mockUsers.find((u) => u.id === userId)?.fullName}`,
    });
  };

  const isCycleClosed = selectedCycle?.status === "closed";

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-1">Role Assignment</h1>
        <p className="text-red-100 text-sm">
          Assign grade, class, competency, and role to each engineer per cycle
        </p>
      </div>

      {/* Cycle Selector */}
      <Card className="p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <label
              htmlFor="cycle-select"
              className="text-sm font-semibold text-gray-700 block mb-1.5"
            >
              Select Cycle to Assign
            </label>
            <Select value={selectedCycleId} onValueChange={handleCycleChange}>
              <SelectTrigger id="cycle-select" className="w-full max-w-sm">
                <SelectValue placeholder="Choose a cycle..." />
              </SelectTrigger>
              <SelectContent>
                {mockCycles.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      {c.name}
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          c.status === "active"
                            ? "bg-green-100 text-green-700"
                            : c.status === "upcoming"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {c.status}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isCycleClosed && (
            <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg">
              This cycle is closed — assignments are read-only.
            </div>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">
                  User
                </th>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">
                  Account Role
                </th>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">
                  Grade
                </th>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">
                  Class
                </th>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">
                  Competency
                </th>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">
                  Assigned Role
                </th>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assignableUsers.map((user) => {
                const a = assignments[user.id];
                const isSaved = saved[user.id];
                const availableClasses = a.grade
                  ? (CLASSES_BY_GRADE[a.grade as GradeLevel] ?? [])
                  : [];

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className="capitalize">
                        {user.accountRole}
                      </Badge>
                    </td>

                    {/* Grade */}
                    <td className="px-5 py-4">
                      <Select
                        value={a.grade}
                        onValueChange={(v) => handleChange(user.id, "grade", v)}
                        disabled={isCycleClosed}
                      >
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue placeholder="Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADES.map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Class — filtered by grade */}
                    <td className="px-5 py-4">
                      <Select
                        value={a.classGroup}
                        onValueChange={(v) =>
                          handleChange(user.id, "classGroup", v)
                        }
                        disabled={
                          isCycleClosed ||
                          !a.grade ||
                          a.assignedRole === "verifier"
                        }
                      >
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue placeholder={a.grade ? "Class" : "—"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableClasses.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Competency */}
                    <td className="px-5 py-4">
                      <Select
                        value={a.competency}
                        onValueChange={(v) =>
                          handleChange(user.id, "competency", v)
                        }
                        disabled={isCycleClosed}
                      >
                        <SelectTrigger className="w-36 h-8 text-xs">
                          <SelectValue placeholder="Competency" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPETENCIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Assigned Role */}
                    <td className="px-5 py-4">
                      <Select
                        value={a.assignedRole}
                        onValueChange={(v) =>
                          handleChange(user.id, "assignedRole", v)
                        }
                        disabled={isCycleClosed}
                      >
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem
                              key={r}
                              value={r}
                              className="capitalize"
                            >
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>

                    <td className="px-5 py-4">
                      {isSaved ? (
                        <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Saved
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleSave(user.id)}
                          disabled={isCycleClosed}
                          className="h-8 text-xs bg-red-500 hover:bg-red-600"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
