"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Search } from "lucide-react";
import { mockStudents, mockCompetencies, mockResults } from "@/lib/mock-data";
import { useAuth, useCurrentRole } from "@/lib/auth-context";

import type { Grade } from "@/lib/types";

export default function AssessorStudentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const roleCtx = useCurrentRole();

  const myStudents = useMemo(
    () =>
      mockStudents.filter(
        (s) =>
          s.competency === roleCtx?.competency &&
          s.gradeLevel === roleCtx?.grade,
      ),
    [roleCtx],
  );

  const competencyData = useMemo(
    () =>
      mockCompetencies.find((c) => c.name.includes(roleCtx?.competency ?? "")),
    [roleCtx],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [currentTrial, setCurrentTrial] = useState<Grade>("A");

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return myStudents;
    const q = searchQuery.toLowerCase();
    return myStudents.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q),
    );
  }, [myStudents, searchQuery]);

  const getResult = (studentId: string) =>
    mockResults.find(
      (r) => r.studentId === studentId && r.assessorId === user?.id,
    );

  const assessedCount = myStudents.filter((s) => {
    const r = getResult(s.id);
    return r && r.status !== "draft";
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 mb-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">
          Students
        </h1>
        <p className="text-primary-foreground/80 text-sm mb-4 font-medium">
          {roleCtx?.cycleName}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {roleCtx?.competency && (
            <span className="bg-background text-foreground text-xs font-bold px-3 py-1.5 uppercase tracking-wider border border-border">
              {roleCtx.competency}
            </span>
          )}
          {roleCtx?.grade && (
            <span className="bg-background text-foreground text-xs font-bold px-3 py-1.5 uppercase tracking-wider border border-border">
              {roleCtx.grade}
            </span>
          )}
          {roleCtx?.classGroup && (
            <span className="bg-background text-primary text-sm font-bold px-4 py-1.5 uppercase tracking-wider border border-border">
              Class {roleCtx.classGroup}
            </span>
          )}
        </div>
      </div>

      {/* Search + Trial */}
      <Card className="p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Search Students
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="w-40">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Current Trial
            </div>
            <Select
              value={currentTrial}
              onValueChange={(v) => setCurrentTrial(v as Grade)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Trial A</SelectItem>
                <SelectItem value="B">Trial B</SelectItem>
                <SelectItem value="C">Trial C</SelectItem>
                <SelectItem value="D">Trial D</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 bg-secondary/50 border-l-4 border-l-primary rounded-[3px] p-5 flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground text-sm uppercase tracking-wide">
              {competencyData?.name ?? roleCtx?.competency}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {competencyData?.description}
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-sm px-4 py-2 font-bold bg-background rounded-[3px] border-border"
          >
            <Users className="w-4 h-4 mr-2 text-primary" />
            {myStudents.length} Students
          </Badge>
        </div>
      </Card>

      {/* Progress */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-base font-semibold text-gray-900">
          Students ({assessedCount}/{filteredStudents.length} assessed)
        </p>
        <p className="text-sm text-gray-500">Click any card to assess</p>
      </div>

      {/* Student Grid */}
      {myStudents.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            No students assigned to you for this cycle.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const result = getResult(student.id);
            const isAssessed = result && result.status !== "draft";

            return (
              <Card
                key={student.id}
                onClick={() => router.push(`/assessor/assess/${student.id}`)}
                className={`p-5 cursor-pointer transition-all hover:shadow-md border-2 rounded-[3px] group ${
                  isAssessed
                    ? "border-primary/20 bg-primary/5"
                    : "border-border hover:border-primary/50 bg-card"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                      {student.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                      {student.code} <span className="mx-1 text-border">|</span>{" "}
                      {student.gradeLevel}
                    </p>
                  </div>
                  {isAssessed && (
                    <Badge className="bg-primary text-primary-foreground text-xs uppercase tracking-wider rounded-[3px] font-bold">
                      Assessed
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                    {isAssessed ? "Review Assessment" : "Start Assessment"}
                  </p>
                  <span className="text-muted-foreground group-hover:text-primary transition-colors transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
