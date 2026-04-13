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
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl mb-6">
        <h1 className="text-2xl font-bold mb-1">Students</h1>
        <p className="text-red-100 text-sm mb-3">{roleCtx?.cycleName}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {roleCtx?.competency && (
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {roleCtx.competency}
            </span>
          )}
          {roleCtx?.grade && (
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {roleCtx.grade}
            </span>
          )}
          {roleCtx?.classGroup && (
            <span className="bg-white text-red-600 text-sm font-bold px-3 py-1 rounded-full">
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

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-blue-900 text-sm">
              {competencyData?.name ?? roleCtx?.competency}
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              {competencyData?.description}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1.5">
            <Users className="w-4 h-4 mr-1.5" />
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
                className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                  isAssessed
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200 hover:border-red-400"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {student.fullName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {student.code} · {student.gradeLevel}
                    </p>
                  </div>
                  {isAssessed && (
                    <Badge className="bg-amber-500 text-white text-xs">
                      Submitted
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {isAssessed ? "Tap to view →" : "Tap to assess →"}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
