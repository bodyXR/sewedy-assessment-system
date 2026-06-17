"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Calendar,
  ChevronRight,
  Loader2,
  AlertCircle,
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
import {
  useCourseRounds,
  useCourses,
  useCreateCourseRound,
} from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

export default function CyclesPage() {
  const router = useRouter();
  const { toast } = useToast();

  const { data: courseRounds, isLoading, error, refetch } = useCourseRounds();
  const { data: courses } = useCourses();
  const { create: createCourseRound, isLoading: isCreating } =
    useCreateCourseRound();

  // Helper function to calculate cycle status based on dates
  const getCycleStatus = (round: any) => {
    if (!round.startDate || !round.endDate) {
      return {
        status: "unknown",
        label: "No Dates",
        color: "bg-gray-100 text-gray-600 border-gray-300",
      };
    }

    const now = new Date();
    const start = new Date(round.startDate);
    const end = new Date(round.endDate);

    if (now < start) {
      return {
        status: "upcoming",
        label: "Upcoming",
        color: "bg-blue-100 text-blue-700 border-blue-300",
      };
    } else if (now > end) {
      return {
        status: "past",
        label: "Past",
        color: "bg-gray-100 text-gray-600 border-gray-300",
      };
    } else {
      return {
        status: "active",
        label: "Active",
        color: "bg-green-100 text-green-700 border-green-300",
      };
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [newCycle, setNewCycle] = useState({
    courseId: "",
    roundNumber: "",
    startDate: "",
    endDate: "",
  });

  // Group course rounds by course
  const cyclesByCourse = useMemo(() => {
    if (!courseRounds || !courses) return [];

    const grouped = courses
      .map((course) => {
        const rounds = courseRounds.filter((r) => r.courseId === course.id);
        return {
          course,
          rounds: rounds.sort((a, b) => b.roundNumber - a.roundNumber),
        };
      })
      .filter((g) => g.rounds.length > 0);

    return grouped;
  }, [courseRounds, courses]);

  const handleCreate = async () => {
    if (
      !newCycle.courseId ||
      !newCycle.roundNumber ||
      !newCycle.startDate ||
      !newCycle.endDate
    ) {
      toast({
        title: "Incomplete",
        description: "Fill all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCourseRound({
        courseId: Number.parseInt(newCycle.courseId, 10),
        roundNumber: Number.parseInt(newCycle.roundNumber, 10),
        startDate: newCycle.startDate,
        endDate: newCycle.endDate,
        isActive: false,
      });

      toast({
        title: "Cycle created",
        description: `Round ${newCycle.roundNumber} created successfully`,
      });

      setNewCycle({
        courseId: "",
        roundNumber: "",
        startDate: "",
        endDate: "",
      });
      setShowForm(false);
      refetch();
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to create cycle",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-2">
            Error loading cycles
          </p>
          <p className="text-sm text-gray-600">{error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">
            Assessment Cycles
          </h1>
          <p className="text-primary-foreground/80 text-sm font-medium tracking-wide">
            MANAGE COURSE ROUNDS AND ASSESSMENT CYCLES
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="bg-background text-primary hover:bg-background/90 font-bold border border-border"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Cycle
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 rounded-[3px] border-2 border-primary/20 shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">
            Create New Assessment Cycle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="cycle-course"
                className="text-xs font-medium text-gray-600 mb-1 block"
              >
                Course / Competency
              </label>
              <Select
                value={newCycle.courseId}
                onValueChange={(v) =>
                  setNewCycle((p) => ({ ...p, courseId: v }))
                }
              >
                <SelectTrigger id="cycle-course" className="h-10 text-sm">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor="cycle-round"
                className="text-xs font-medium text-gray-600 mb-1 block"
              >
                Round Number
              </label>
              <Input
                id="cycle-round"
                type="number"
                min="1"
                placeholder="e.g. 1"
                value={newCycle.roundNumber}
                onChange={(e) =>
                  setNewCycle((p) => ({ ...p, roundNumber: e.target.value }))
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
              disabled={isCreating}
              className="bg-primary hover:bg-primary/90 font-bold"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="font-bold"
              disabled={isCreating}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Loading cycles...</span>
        </Card>
      ) : cyclesByCourse.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No assessment cycles yet</p>
          <p className="text-xs text-gray-400">
            Create your first cycle to get started
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {cyclesByCourse.map(({ course, rounds }) => (
            <div key={course.id}>
              <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-widest">
                {course.title}
              </h2>
              <div className="space-y-3">
                {rounds.map((round) => {
                  const startDate = round.startDate
                    ? new Date(round.startDate).toLocaleDateString()
                    : "—";
                  const endDate = round.endDate
                    ? new Date(round.endDate).toLocaleDateString()
                    : "—";

                  const cycleStatus = getCycleStatus(round);

                  return (
                    <Card
                      key={round.id}
                      onClick={() =>
                        router.push(`/controller/cycles/${round.id}`)
                      }
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
                                Round {round.roundNumber}
                              </h3>
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-[3px] border uppercase tracking-widest ${cycleStatus.color}`}
                              >
                                {cycleStatus.label}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mt-1">
                              {startDate} → {endDate}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4 shrink-0">
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
