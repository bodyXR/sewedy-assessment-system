"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, Loader2 } from "lucide-react";
import { useAuth, useCurrentRole } from "@/lib/auth-context";
import { useStudentsByAssessor } from "@/hooks/use-api";

export default function AssessorStudentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const roleCtx = useCurrentRole();

  const assessorId = user?.accountId || null;
  const {
    data: students,
    isLoading,
    error,
  } = useStudentsByAssessor(assessorId);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.fullNameEn.toLowerCase().includes(q) ||
        s.fullNameAr.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.nationalId.includes(q),
    );
  }, [students, searchQuery]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-8 text-center">
          <p className="text-red-600 font-semibold mb-2">
            Error loading students
          </p>
          <p className="text-sm text-gray-600">{error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 mb-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">
          Students
        </h1>
        <p className="text-primary-foreground/80 text-sm mb-4 font-medium">
          {roleCtx?.cycleName || "Assessment Cycle"}
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

      {/* Search */}
      <Card className="p-5 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Search Students
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, or national ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 bg-secondary/50 border-l-4 border-l-primary rounded-[3px] p-5 flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground text-sm uppercase tracking-wide">
              {roleCtx?.competency || "Competency"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Students assigned to you for assessment
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-sm px-4 py-2 font-bold bg-background rounded-[3px] border-border"
          >
            <Users className="w-4 h-4 mr-2 text-primary" />
            {students?.length || 0} Students
          </Badge>
        </div>
      </Card>

      {/* Progress */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-base font-semibold text-gray-900">
          Students ({filteredStudents.length} total)
        </p>
        <p className="text-sm text-gray-500">Click any card to assess</p>
      </div>

      {/* Student Grid */}
      {isLoading ? (
        <Card className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Loading students...</span>
        </Card>
      ) : !students || students.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            No students assigned to you for this cycle.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const isAssessed =
              student.status === "Passed" || student.status === "Not Passed";

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
                      {student.fullNameEn}
                    </p>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                      {student.email}
                      {student.className && (
                        <>
                          {" "}
                          <span className="mx-1 text-border">|</span>{" "}
                          {student.className}
                        </>
                      )}
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
