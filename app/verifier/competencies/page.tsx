"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCourses, useCreateCourse } from "@/hooks/use-api";
import { AlertDialogCustom } from "@/components/ui/alert-dialog-custom";
import type { Course } from "@/lib/api-client";

export default function VerifierCompetenciesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const { data: courses, isLoading, error, refetch } = useCourses();
  const { deleteCourse, isLoading: isDeleting } = useCreateCourse();

  // Extract unique class names from courses
  const classes = useMemo(() => {
    if (!courses) return ["All"];
    const uniqueClasses = new Set(
      courses.map((c) => c.levelName).filter((l): l is string => Boolean(l)),
    );
    return [
      "All",
      ...Array.from(uniqueClasses).sort((a, b) => {
        // Custom sort to maintain order: Juniors, Wheelers, Seniors
        const order = ["Juniors", "Wheelers", "Seniors"];
        const aIndex = order.indexOf(a);
        const bIndex = order.indexOf(b);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.localeCompare(b);
      }),
    ];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesClass =
        selectedClass === "All" || course.levelName === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [courses, searchQuery, selectedClass]);

  const handleEdit = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    router.push(`/verifier/competencies/edit/${course.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    try {
      await deleteCourse(courseToDelete.id);
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      // Refetch to update the list
      refetch();
    } catch (error) {
      console.error("Failed to delete competency:", error);
      // Show error but still close dialog and refetch in case it actually succeeded
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      refetch();
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-8 text-center">
          <p className="text-red-600 font-semibold mb-2">
            Error loading competencies
          </p>
          <p className="text-sm text-gray-600">{error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="bg-primary text-primary-foreground p-8 rounded-[3px] border border-border/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 uppercase">
              Competencies
            </h1>
            <p className="text-primary-foreground/80 text-xs sm:text-sm font-medium tracking-wide">
              MANAGE {filteredCourses.length} COMPETENC
              {filteredCourses.length === 1 ? "Y" : "IES"} ACROSS ALL CLASSES
            </p>
          </div>
          <Button
            onClick={() => router.push("/verifier/competencies/add")}
            className="bg-background text-primary hover:bg-background/90 font-bold border border-border shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Competency
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-5 rounded-[3px] border-2 border-border shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search competencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
              disabled={isLoading}
            />
          </div>
          <Select
            value={selectedClass}
            onValueChange={setSelectedClass}
            disabled={isLoading}
          >
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "All" ? "All Classes" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Competencies Table */}
      <Card className="overflow-hidden rounded-[3px] border-2 border-border shadow-sm">
        <div className="px-6 py-5 border-b-2 border-border bg-card">
          <p className="font-bold text-foreground uppercase tracking-widest text-sm">
            {filteredCourses.length} Competenc
            {filteredCourses.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          {isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-gray-600">
                Loading competencies...
              </span>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 min-w-[640px]">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-secondary/30 transition-colors group"
                >
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-lg">
                      {course.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      {course.levelName && (
                        <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-[3px] uppercase tracking-wider">
                          {course.levelName}
                        </span>
                      )}
                      {course.durationHours && (
                        <span className="text-xs text-muted-foreground">
                          {course.durationHours} hours
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleEdit(e, course)}
                      className="border-primary text-primary hover:bg-primary/10"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleDeleteClick(e, course)}
                      className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {filteredCourses.length === 0 && !isLoading && (
                <div className="p-12 text-center text-gray-400">
                  No competencies match your filters.
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialogCustom
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCourseToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Competency"
        description={`Are you sure you want to delete "${courseToDelete?.title}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
