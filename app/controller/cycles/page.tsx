"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Play,
  Square,
  RotateCcw,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockCycles, mockStudents, mockResults } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import type {
  Cycle,
  CycleStatus,
  GradeLevel,
  CompetencyType,
} from "@/lib/types";

const GRADES: GradeLevel[] = ["Junior", "Wheeler", "Senior"];
const SPECIALIZATIONS: CompetencyType[] = [
  "Structural",
  "Civil",
  "Electrical",
  "Mechanical",
  "Software",
];

const statusConfig: Record<CycleStatus, { label: string; color: string }> = {
  upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-700" },
  active: { label: "Active", color: "bg-green-100 text-green-700" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-600" },
};

export default function CyclesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cycles, setCycles] = useState<Cycle[]>(mockCycles);
  const [showForm, setShowForm] = useState(false);
  const [newCycle, setNewCycle] = useState({
    name: "",
    startDate: "",
    endDate: "",
    grade: "" as GradeLevel | "",
    specialization: "" as CompetencyType | "",
  });

  const handleCreate = () => {
    if (!newCycle.name || !newCycle.startDate || !newCycle.endDate) {
      toast({
        title: "Incomplete",
        description: "Fill all fields.",
        variant: "destructive",
      });
      return;
    }
    const created: Cycle = {
      id: `cyc${Date.now()}`,
      name: newCycle.name,
      status: "upcoming",
      createdBy: "u1",
      startDate: newCycle.startDate,
      endDate: newCycle.endDate,
      grade: newCycle.grade || undefined,
      specialization: newCycle.specialization || undefined,
    };
    setCycles((prev) => [created, ...prev]);
    setNewCycle({
      name: "",
      startDate: "",
      endDate: "",
      grade: "",
      specialization: "",
    });
    setShowForm(false);
    toast({ title: "Cycle created", description: newCycle.name });
  };

  const updateStatus = (
    e: React.MouseEvent,
    id: string,
    status: CycleStatus,
  ) => {
    e.stopPropagation();
    setCycles((prev) =>
      prev.map((c) => {
        if (status === "active") {
          if (c.id === id) return { ...c, status: "active" };
          if (c.status === "active") return { ...c, status: "closed" };
        }
        if (c.id === id) return { ...c, status };
        return c;
      }),
    );
    toast({
      title: "Cycle updated",
      description: `Status changed to ${status}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">
            Assessment Cycles
          </h1>
          <p className="text-primary-foreground/80 text-sm font-medium tracking-wide">
            CREATE, OPEN, CLOSE, AND RESET CYCLES
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="bg-background text-primary hover:bg-background/90 font-bold border border-border"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Cycle
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 rounded-[3px] border-2 border-primary/20 shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">
            Create New Cycle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label
                htmlFor="cycle-name"
                className="text-xs font-medium text-gray-600 mb-1 block"
              >
                Cycle Name
              </label>
              <Input
                id="cycle-name"
                placeholder="e.g. Fall 2026 Assessment"
                value={newCycle.name}
                onChange={(e) =>
                  setNewCycle((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="cycle-start"
                className="text-xs font-medium text-gray-600 mb-1 block"
              >
                Start Date
              </label>
              <Input
                id="cycle-start"
                type="date"
                value={newCycle.startDate}
                onChange={(e) =>
                  setNewCycle((p) => ({ ...p, startDate: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="cycle-end"
                className="text-xs font-medium text-gray-600 mb-1 block"
              >
                End Date
              </label>
              <Input
                id="cycle-end"
                type="date"
                value={newCycle.endDate}
                onChange={(e) =>
                  setNewCycle((p) => ({ ...p, endDate: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="cycle-grade"
                className="text-xs font-medium text-gray-600 mb-1 block"
              >
                Grade
              </label>
              <Select
                value={newCycle.grade}
                onValueChange={(v) =>
                  setNewCycle((p) => ({ ...p, grade: v as GradeLevel }))
                }
              >
                <SelectTrigger id="cycle-grade" className="h-10 text-sm">
                  <SelectValue placeholder="All grades" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor="cycle-spec"
                className="text-xs font-medium text-gray-600 mb-1 block"
              >
                Specialization
              </label>
              <Select
                value={newCycle.specialization}
                onValueChange={(v) =>
                  setNewCycle((p) => ({
                    ...p,
                    specialization: v as CompetencyType,
                  }))
                }
              >
                <SelectTrigger id="cycle-spec" className="h-10 text-sm">
                  <SelectValue placeholder="All specializations" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALIZATIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCreate}
              className="bg-primary hover:bg-primary/90 font-bold"
            >
              Create
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="font-bold"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {cycles.map((cycle) => {
          const cfg = statusConfig[cycle.status];
          const cycleResults = mockResults.filter(
            (r) => r.cycleId === cycle.id && r.status !== "draft",
          );
          const completion =
            mockStudents.length > 0
              ? Math.round((cycleResults.length / mockStudents.length) * 100)
              : 0;

          return (
            <Card
              key={cycle.id}
              onClick={() => router.push(`/controller/cycles/${cycle.id}`)}
              className="p-5 cursor-pointer hover:shadow-md transition-all rounded-[3px] border-2 border-border hover:border-primary/50 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-[3px] border-2 border-primary/20 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                        {cycle.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-[3px] border uppercase tracking-widest ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mt-1">
                      {cycle.startDate} → {cycle.endDate}
                      {cycle.grade && ` | ${cycle.grade}`}
                      {cycle.specialization && ` | ${cycle.specialization}`}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-32 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-red-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        {completion}% assessed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 shrink-0">
                  {cycle.status === "upcoming" && (
                    <Button
                      size="sm"
                      onClick={(e) => updateStatus(e, cycle.id, "active")}
                      className="bg-green-500 hover:bg-green-600 text-white h-8 text-xs"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Open
                    </Button>
                  )}
                  {cycle.status === "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => updateStatus(e, cycle.id, "closed")}
                      className="border-red-200 text-red-600 hover:bg-red-50 h-8 text-xs"
                    >
                      <Square className="w-3 h-3 mr-1" />
                      Close
                    </Button>
                  )}
                  {cycle.status === "closed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => updateStatus(e, cycle.id, "upcoming")}
                      className="h-8 text-xs"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
