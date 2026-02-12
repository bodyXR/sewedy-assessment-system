"use client";

import React from "react";
import { GraduationCap } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import type { Student } from "@/lib/types";

interface StudentInfoCardProps {
  student: Student;
  stats: {
    enrolled: number;
    passed: number;
    progressPercentage: number;
  };
}

export function StudentInfoCard({ student, stats }: StudentInfoCardProps) {
  return (
    <Card className="md:col-span-1 border-border shadow-sm h-fit">
      <CardHeader className="flex flex-row  justify-between gap-4 pb-2">
        <div className="flex gap-2 items-center">
          <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.fullName}`}
            />
            <AvatarFallback>{student.code.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{student.fullName}</CardTitle>
            <CardDescription className="font-mono text-xs">
              {student.code}
            </CardDescription>
          </div>
        </div>
        <div className="grid gap-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="w-4 h-4" />
            <span>Grade Level</span>
          </div>
          <div className="font-medium pl-6">{student.gradeLevel}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Competency Progress</span>
            <span className="font-medium">
              {Math.round(stats.progressPercentage)}%
            </span>
          </div>
          <Progress value={stats.progressPercentage} className="h-2" />
          <div className="grid grid-cols-2 gap-4 text-center text-sm pt-2">
            <div className="bg-secondary/50 rounded-lg p-2">
              <div className="font-bold text-lg text-primary">
                {stats.passed}
              </div>
              <div className="text-muted-foreground text-xs">Passed</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-2">
              <div className="font-bold text-lg text-foreground">
                {stats.enrolled}
              </div>
              <div className="text-muted-foreground text-xs">Enrolled</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
