"use client";

import { useState, useMemo } from "react";
import {
  Filters as AttendanceFilters,
  FilterValues,
} from "@/components/filters/filters";
import { StatCard } from "@/components/filters/stat-card";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockStudents, mockCompetencies } from "@/lib/mock-data";

export default function AttendancePage() {
  const [filters, setFilters] = useState<FilterValues>({
    students: [],
    grade: "all",
    class: "all",
    sessions: ["1"],
    fromDate: "2026-01-01",
    toDate: "2026-03-02",
  });

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    let students = mockStudents;

    // Filter by grade
    if (filters.grade !== "all") {
      students = students.filter((s) => s.gradeLevel === filters.grade);
    }

    // Calculate stats
    const totalStudents = students.length;
    const activeCompetencies = mockCompetencies.filter(
      (c) => filters.grade === "all" || c.gradeLevel === filters.grade,
    ).length;

    // Mock assessment data - in real app, this would come from API
    const assessmentsCompleted = Math.floor(totalStudents * 3.14);
    const avgGradeRate = 87.3;

    // Grade distribution (mock data)
    const gradeDistribution = [
      {
        grade: "A",
        count: Math.floor(totalStudents * 1.5),
        percentage: 48,
        color: "bg-green-500",
      },
      {
        grade: "B",
        count: Math.floor(totalStudents * 1.23),
        percentage: 39,
        color: "bg-blue-500",
      },
      {
        grade: "C",
        count: Math.floor(totalStudents * 0.31),
        percentage: 10,
        color: "bg-yellow-500",
      },
      {
        grade: "D",
        count: Math.floor(totalStudents * 0.08),
        percentage: 3,
        color: "bg-red-500",
      },
    ];

    // Student distribution by grade level
    const juniorCount = mockStudents.filter(
      (s) => s.gradeLevel === "Junior",
    ).length;
    const wheelerCount = mockStudents.filter(
      (s) => s.gradeLevel === "Wheeler",
    ).length;
    const seniorCount = mockStudents.filter(
      (s) => s.gradeLevel === "Senior",
    ).length;

    return {
      totalStudents,
      activeCompetencies,
      assessmentsCompleted,
      avgGradeRate,
      gradeDistribution,
      juniorCount,
      wheelerCount,
      seniorCount,
      filteredStudents: students,
    };
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-lg mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, Hussien Mohamed Sharaf!
        </h1>
        <p className="text-red-50">
          Here's your assessment system overview and performance insights.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Assessment Dashboard
          </h2>
        </div>

        {/* Filters */}
        <AttendanceFilters onFilterChange={handleFilterChange} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            value={filteredData.totalStudents.toLocaleString()}
            label="Total Students"
            valueClassName="text-red-500"
          />
          <StatCard
            value={filteredData.activeCompetencies.toString()}
            label="Active Competencies"
          />
          <StatCard
            value={filteredData.assessmentsCompleted.toLocaleString()}
            label="Assessments Completed"
          />
          <StatCard
            value={`${filteredData.avgGradeRate}%`}
            label="Average Grade A/B Rate"
            valueClassName="text-green-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Competency Performance Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Competency Performance (Grade Distribution)
              </h3>
              <Select defaultValue="grade">
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grade">By Grade Level</SelectItem>
                  <SelectItem value="competency">By Competency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="h-64 flex items-end justify-around gap-2">
              {/* Bar Chart for Competencies */}
              {[
                { name: "Math Foundations", value: 85, id: "math" },
                { name: "Science Inquiry", value: 78, id: "sci" },
                { name: "Language Arts", value: 92, id: "lang" },
                { name: "Critical Thinking", value: 88, id: "crit" },
                { name: "Digital Literacy", value: 75, id: "dig" },
                { name: "Social Studies", value: 82, id: "soc" },
                { name: "Physical Ed", value: 95, id: "pe" },
                { name: "Arts & Music", value: 90, id: "arts" },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full bg-gradient-to-t from-red-400 to-red-500 rounded-t"
                    style={{ height: `${item.value}%` }}
                  />
                  <span className="text-xs text-gray-600 text-center">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Grade Distribution Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Grade Distribution Trend
            </h3>
            <div className="h-64 space-y-4">
              {filteredData.gradeDistribution.map((item) => (
                <div key={item.grade} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Grade {item.grade}</span>
                    <span className="text-gray-600">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${item.color} h-3 rounded-full transition-all`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grade Level Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Student Distribution by Grade Level
            </h3>
            <div className="flex items-center justify-center h-64">
              {/* Donut Chart */}
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {/* Junior - 45% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="20"
                    strokeDasharray="251.2"
                    strokeDashoffset="0"
                  />
                  {/* Wheeler - 30% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="20"
                    strokeDasharray="251.2"
                    strokeDashoffset="-113"
                  />
                  {/* Senior - 25% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="20"
                    strokeDasharray="251.2"
                    strokeDashoffset="-188"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {filteredData.totalStudents}
                    </div>
                    <div className="text-xs text-gray-600">Students</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm">
                  Junior ({filteredData.juniorCount})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm">
                  Wheeler ({filteredData.wheelerCount})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm">
                  Senior ({filteredData.seniorCount})
                </span>
              </div>
            </div>
          </Card>

          {/* Top Performing Students */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Top Performing Students
            </h3>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 mb-4">
                Top 10 students by assessment performance
              </div>
              <div className="overflow-auto max-h-64">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-2 font-medium text-gray-600">
                        Student Code
                      </th>
                      <th className="pb-2 font-medium text-gray-600">
                        Grade Level
                      </th>
                      <th className="pb-2 font-medium text-gray-600">
                        Competencies
                      </th>
                      <th className="pb-2 font-medium text-gray-600">
                        Avg Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredData.filteredStudents
                      .slice(0, 7)
                      .map((student, idx) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="py-2">{student.code}</td>
                          <td className="py-2">{student.gradeLevel}</td>
                          <td className="py-2">
                            {student.enrolledCompetencies.length}
                          </td>
                          <td className="py-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                idx < 6
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {idx < 6 ? "A" : "B"}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
