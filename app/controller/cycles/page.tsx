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
import { mockCycles, mockStudents, mockResults } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import type { Cycle, CycleStatus } from "@/lib/types";

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
    };
    setCycles((prev) => [created, ...prev]);
    setNewCycle({ name: "", startDate: "", endDate: "" });
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
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Assessment Cycles</h1>
          <p className="text-red-100 text-sm">
            Create, open, close, and reset cycles
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="bg-white text-red-600 hover:bg-red-50 font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Cycle
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 border-red-100">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Create New Cycle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCreate}
              className="bg-red-500 hover:bg-red-600"
            >
              Create
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
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
              className="p-5 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {cycle.name}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {cycle.startDate} → {cycle.endDate}
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
