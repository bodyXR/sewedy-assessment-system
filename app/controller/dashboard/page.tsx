"use client";

import { useState, useEffect } from "react";
import { Users, CheckCircle, BookOpen, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCourses, useCourseRounds } from "@/hooks/use-api";

const API_BASE_URL = "http://sewedyassessmentsys.runasp.net/api";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  if (!user) return null;
  try {
    const parsed = JSON.parse(user);
    return parsed.token || null;
  } catch {
    return null;
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card className="p-5 rounded-[3px] border-2 border-border shadow-sm text-center group hover:border-primary/50 transition-colors">
      <Icon className="w-5 h-5 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
      <p className="text-3xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">
        {label}
      </p>
    </Card>
  );
}

export default function ControllerDashboard() {
  const [filterCourseId, setFilterCourseId] = useState<number | null>(null);
  const [filterRoundId, setFilterRoundId] = useState<number | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { data: courses } = useCourses();
  const { data: courseRounds } = useCourseRounds();

  const activeCycle =
    courseRounds?.find((c) => c.statusId === 1) || courseRounds?.[0];

  useEffect(() => {
    if (activeCycle && !filterRoundId) {
      setFilterRoundId(activeCycle.id);
    }
  }, [activeCycle, filterRoundId]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filterRoundId)
          params.append("courseRoundId", filterRoundId.toString());
        if (filterCourseId)
          params.append("courseId", filterCourseId.toString());

        const token = getAuthToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const url = `${API_BASE_URL}/Dashboard?${params.toString()}`;
        const response = await fetch(url, {
          headers,
          mode: "cors",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    if (filterRoundId) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [filterRoundId, filterCourseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="p-12 flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-gray-600">Loading dashboard...</span>
        </Card>
      </div>
    );
  }

  const summary = dashboardData?.summary || {
    totalStudents: 0,
    resultsSubmitted: 0,
    cycleCompletionPercent: 0,
  };
  const assessorProgress = dashboardData?.assessorProgress || [];
  const submissionsByCompetency = dashboardData?.submissionsByCompetency || [];
  const overallCompletion = dashboardData?.overallCompletion || {
    totalStudents: 0,
    assessedStudents: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">
          Controller Dashboard
        </h1>
        <p className="text-primary-foreground/80 text-sm font-medium tracking-wide">
          {activeCycle
            ? `ROUND ${activeCycle.roundNumber} - ${activeCycle.statusId === 1 ? "ACTIVE" : "INACTIVE"}`
            : "NO CYCLE AVAILABLE"}
        </p>
      </div>

      {/* Filters */}
      <Card className="p-5 rounded-[3px] border-2 border-border shadow-sm">
        <div className="flex flex-wrap gap-3">
          <Select
            value={filterRoundId?.toString() || ""}
            onValueChange={(v) => setFilterRoundId(v ? Number(v) : null)}
          >
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue placeholder="Select Round" />
            </SelectTrigger>
            <SelectContent>
              {courseRounds?.map((round) => (
                <SelectItem key={round.id} value={round.id.toString()}>
                  Round {round.roundNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterCourseId?.toString() || "All"}
            onValueChange={(v) =>
              setFilterCourseId(v === "All" ? null : Number(v))
            }
          >
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Competencies</SelectItem>
              {courses?.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Students"
          value={summary.totalStudents}
          icon={Users}
        />
        <StatCard
          label="Assessed Students"
          value={summary.resultsSubmitted}
          icon={CheckCircle}
        />
        <StatCard
          label="Completion Rate"
          value={`${summary.cycleCompletionPercent}%`}
          icon={BookOpen}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessor Progress */}
        <Card className="p-6 rounded-[3px] border-2 border-border shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">
            Assessor Progress
          </h2>
          <div className="space-y-4">
            {assessorProgress.length > 0 ? (
              assessorProgress.map((ap: any, i: number) => {
                const percent =
                  ap.total > 0
                    ? Math.round((ap.submitted / ap.total) * 100)
                    : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        {ap.assessorName}
                      </span>
                      <span className="text-gray-500">
                        {ap.competencyName} · {ap.submitted}/{ap.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                No assessment data available yet
              </p>
            )}
          </div>
        </Card>

        {/* Submissions by Competency */}
        <Card className="p-6 rounded-[3px] border-2 border-border shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">
            Assessment by Competency
          </h2>
          <div className="space-y-3">
            {submissionsByCompetency.length > 0 ? (
              submissionsByCompetency.map((cs: any, i: number) => {
                const percent =
                  cs.total > 0
                    ? Math.round((cs.submitted / cs.total) * 100)
                    : 0;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm py-1"
                  >
                    <span className="text-gray-700 font-medium w-32 shrink-0 truncate">
                      {cs.competencyName}
                    </span>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs w-14 text-right">
                        {cs.submitted}/{cs.total}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                No assessment data available yet
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Overall completion bar */}
      <Card className="p-6 rounded-[3px] border-2 border-border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
            Overall Assessment Progress
          </h2>
          <span className="text-2xl font-bold text-primary tracking-tight">
            {summary.cycleCompletionPercent}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-red-400 to-red-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${summary.cycleCompletionPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {overallCompletion.assessedStudents} of{" "}
          {overallCompletion.totalStudents} students have been assessed
        </p>
      </Card>
    </div>
  );
}
