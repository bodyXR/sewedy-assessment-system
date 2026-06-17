"use client";

import { useState, useMemo, useEffect } from "react";
import { Save, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCourseRounds,
  useEngineers,
  useCourseRoundInstructorsByCourseRound,
  useAssignInstructor,
} from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

// Map role names to role IDs from the database
const ROLE_NAME_TO_ID: Record<string, number> = {
  Assessor: 1,
  Control: 2,
  Verifier: 3,
};

interface LocalAssignment {
  courseRoundId: number;
  roleName: string; // "Assessor" or "Verifier" for UI display
}

// Helper to calculate cycle status based on dates
const getCycleStatus = (round: any) => {
  if (!round.startDate || !round.endDate) {
    return {
      status: "unknown",
      label: "No Dates",
      color: "bg-gray-100 text-gray-600",
    };
  }

  const now = new Date();
  const start = new Date(round.startDate);
  const end = new Date(round.endDate);

  if (now < start) {
    return {
      status: "upcoming",
      label: "Upcoming",
      color: "bg-blue-100 text-blue-700",
    };
  } else if (now > end) {
    return {
      status: "past",
      label: "Past",
      color: "bg-gray-100 text-gray-600",
    };
  } else {
    return {
      status: "active",
      label: "Active",
      color: "bg-green-100 text-green-700",
    };
  }
};

export default function AssignPage() {
  const { toast } = useToast();

  const { data: courseRounds, isLoading: loadingRounds } = useCourseRounds();
  const { data: engineers, isLoading: loadingEngineers } = useEngineers();
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);

  const {
    data: existingAssignments,
    isLoading: loadingAssignments,
    refetch: refetchAssignments,
  } = useCourseRoundInstructorsByCourseRound(selectedCycleId);

  const { assign, updateRole, isLoading: isSaving } = useAssignInstructor();

  // Auto-select first active cycle
  useEffect(() => {
    if (courseRounds && !selectedCycleId) {
      const activeCycle = courseRounds.find((c) => c.isActive);
      if (activeCycle) {
        setSelectedCycleId(activeCycle.id);
      } else if (courseRounds.length > 0) {
        setSelectedCycleId(courseRounds[0].id);
      }
    }
  }, [courseRounds, selectedCycleId]);

  // Filter engineers - show all active users who aren't students
  const assignableUsers = useMemo(() => {
    if (!engineers) return [];
    return engineers.filter((e) => e.isActive);
  }, [engineers]);

  // Build assignments state from existing data
  const [assignments, setAssignments] = useState<
    Record<number, LocalAssignment>
  >({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (selectedCycleId && assignableUsers.length > 0) {
      const init: Record<number, LocalAssignment> = {};
      assignableUsers.forEach((u) => {
        // Find assignment for this specific user AND course round
        const existing = existingAssignments?.find(
          (a) => a.accountId === u.id && a.courseRoundId === selectedCycleId,
        );
        init[u.id] = {
          courseRoundId: selectedCycleId,
          roleName: existing?.roleName || "",
        };
      });
      setAssignments(init);
      setSaved({});
    }
  }, [selectedCycleId, assignableUsers, existingAssignments]);

  const handleCycleChange = (cycleId: string) => {
    setSelectedCycleId(Number.parseInt(cycleId, 10));
    setSaved({});
  };

  const handleChange = (userId: number, roleName: string) => {
    setAssignments((prev) => ({
      ...prev,
      [userId]: {
        courseRoundId: selectedCycleId!,
        roleName,
      },
    }));
    setSaved((prev) => ({ ...prev, [userId]: false }));
  };

  const handleSave = async (userId: number) => {
    const a = assignments[userId];
    if (!a.roleName || !selectedCycleId) {
      toast({
        title: "Incomplete",
        description: "Please select a role before saving.",
        variant: "destructive",
      });
      return;
    }

    // Convert role name to role ID
    const roleId = ROLE_NAME_TO_ID[a.roleName];
    if (!roleId) {
      toast({
        title: "Error",
        description: "Invalid role selected.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if assignment already exists
      const existing = existingAssignments?.find((e) => e.accountId === userId);

      if (existing) {
        // Update existing assignment using PUT
        await updateRole(existing.id, roleId);
      } else {
        // Create new assignment
        await assign({
          courseRoundId: selectedCycleId,
          accountId: userId,
          roleId,
        });
      }

      setSaved((prev) => ({ ...prev, [userId]: true }));
      toast({
        title: "Saved",
        description: `Assignment saved for ${assignableUsers.find((u) => u.id === userId)?.fullNameEn}`,
      });
      refetchAssignments();
    } catch (error) {
      console.error("Assignment error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save assignment",
        variant: "destructive",
      });
    }
  };

  const selectedCycle = courseRounds?.find((c) => c.id === selectedCycleId);
  const isLoading = loadingRounds || loadingEngineers || loadingAssignments;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="p-12 flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-gray-600">Loading...</span>
        </Card>
      </div>
    );
  }

  if (!courseRounds || courseRounds.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold mb-2">
            No cycles available
          </p>
          <p className="text-sm text-gray-500">
            Create a cycle first before assigning roles
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">
          Role Assignment
        </h1>
        <p className="text-primary-foreground/80 text-sm font-medium tracking-wide">
          ASSIGN ASSESSORS AND VERIFIERS TO ASSESSMENT CYCLES
        </p>
      </div>

      {/* Cycle Selector */}
      <Card className="p-5 rounded-[3px] border-2 border-border shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <label
              htmlFor="cycle-select"
              className="text-sm font-semibold text-gray-700 block mb-1.5"
            >
              Select Cycle to Assign
            </label>
            <Select
              value={selectedCycleId?.toString()}
              onValueChange={handleCycleChange}
            >
              <SelectTrigger id="cycle-select" className="w-full max-w-sm">
                <SelectValue placeholder="Choose a cycle..." />
              </SelectTrigger>
              <SelectContent>
                {courseRounds.map((c) => {
                  const cycleStatus = getCycleStatus(c);
                  return (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      <span className="flex items-center gap-2">
                        Round {c.roundNumber}
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cycleStatus.color}`}
                        >
                          {cycleStatus.label}
                        </span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          {selectedCycle && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Dates:</span>{" "}
              {selectedCycle.startDate
                ? new Date(selectedCycle.startDate).toLocaleDateString()
                : "—"}{" "}
              →{" "}
              {selectedCycle.endDate
                ? new Date(selectedCycle.endDate).toLocaleDateString()
                : "—"}
            </div>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden rounded-[3px] border-2 border-border shadow-sm">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-secondary/50 border-b-2 border-border">
              <tr>
                <th className="text-left px-5 py-4 font-bold text-foreground uppercase tracking-widest text-xs">
                  User
                </th>
                <th className="text-left px-5 py-4 font-bold text-foreground uppercase tracking-widest text-xs">
                  Assigned Role
                </th>
                <th className="text-left px-5 py-4 font-bold text-foreground uppercase tracking-widest text-xs">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assignableUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-8 text-center text-gray-500"
                  >
                    No users available for assignment.
                  </td>
                </tr>
              ) : (
                assignableUsers.map((user) => {
                  const a = assignments[user.id];
                  const isSaved = saved[user.id];

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-foreground">
                          {user.fullNameEn}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {user.email}
                        </p>
                      </td>

                      {/* Assigned Role */}
                      <td className="px-5 py-4">
                        <Select
                          value={a?.roleName || ""}
                          onValueChange={(v) => handleChange(user.id, v)}
                          disabled={isSaving}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Assessor">Assessor</SelectItem>
                            <SelectItem value="Verifier">Verifier</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      <td className="px-5 py-4">
                        {isSaved ? (
                          <div className="flex items-center gap-1.5 text-success text-xs font-bold uppercase tracking-wider">
                            <CheckCircle className="w-4 h-4" />
                            Saved
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleSave(user.id)}
                            disabled={isSaving || !a?.roleName}
                            className="h-8 text-xs bg-primary hover:bg-primary/90 font-bold"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-3 h-3 mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
