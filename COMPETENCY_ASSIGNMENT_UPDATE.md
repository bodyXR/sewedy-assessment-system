# Competency Management Update - CourseRoundAssignments Integration

## Overview

Updated the Add and Edit Competency pages to use the `CourseRoundAssignments` API instead of `CourseMaterials` for managing tasks and subtasks. This aligns with the new assignment enrollment flow.

## Changes Made

### 1. Add Competency Page (`app/verifier/competencies/add/page.tsx`)

**Before:**

- Created tasks and subtasks as `CourseMaterials` with parent-child relationships
- Used `parentMaterialId` to link subtasks to parent tasks

**After:**

- Creates each task as a `CourseRoundAssignment`
- Subtask breakdown is stored in the assignment's `description` field
- Format: `"Subtasks: name1: X points, name2: Y points"`
- Total grade equals sum of all subtask grades (must equal 100)

**API Changes:**

```typescript
// Old approach
await api.courseMaterials.create({
  title: task.name,
  courseId: course.id,
});

// New approach
await api.courseRoundAssignments.create({
  title: task.name,
  description: `Subtasks: ${subtaskBreakdown}`,
  deadline: defaultDeadline.toISOString(),
  totalGrade: totalGrade,
  courseId: course.id,
  instructorId: user?.accountId || 0,
});
```

### 2. Edit Competency Page (`app/verifier/competencies/edit/[id]/page.tsx`)

**Before:**

- Loaded tasks/subtasks from `CourseMaterials`
- Updated/deleted `CourseMaterials` records

**After:**

- Loads tasks from `CourseRoundAssignments`
- Parses subtask breakdown from assignment description
- Updates/deletes `CourseRoundAssignments` records

**Data Loading:**

```typescript
// Parses description like: "Subtasks: Config Router: 50 points, Test Network: 50 points"
const loadedTasks = assignments.map((assignment) => {
  const subtasks = parseSubtasksFromDescription(assignment.description);
  return {
    id: assignment.id,
    name: assignment.title,
    subtasks: subtasks,
  };
});
```

**API Changes:**

```typescript
// Old approach
await api.courseMaterials.update(task.id, { title, description });
await api.courseMaterials.delete(materialId);

// New approach
await api.courseRoundAssignments.update(task.id, {
  title,
  description,
  totalGrade,
});
await api.courseRoundAssignments.delete(assignmentId);
```

## Data Structure

### Task Representation

Each task is stored as a single `CourseRoundAssignment`:

```json
{
  "id": 123,
  "title": "Network Configuration",
  "description": "Subtasks: Configure Router: 50 points, Test Connectivity: 30 points, Document Setup: 20 points",
  "deadline": "2026-08-01T00:00:00",
  "totalGrade": 100,
  "courseId": 3,
  "instructorId": 101
}
```

### Subtask Breakdown

Subtasks are embedded in the description using this format:

```
Subtasks: [name1]: [grade1] points, [name2]: [grade2] points, ...
```

Example:

```
Subtasks: Router Configuration: 50 points, Network Testing: 30 points, Documentation: 20 points
```

## Validation Rules (Unchanged)

1. **Total Grade Must Equal 100**
   - Sum of all subtask grades = 100
   - Red border if invalid
   - Warning message displayed

2. **All Subtasks Must Have Points > 0**
   - No zero or negative grades allowed
   - Validation runs before submission

3. **Required Fields**
   - Task name (required)
   - At least one subtask (required)
   - Subtask name and grade (required)

## Benefits

### 1. Consistency

- All assignments use the same API (`CourseRoundAssignments`)
- Controller and Verifier pages work with same data structure
- Enrollment validation works with competency assignments

### 2. Enrollment Flow

- When verifier creates competency with tasks → Assignments created
- When controller enrolls students → System checks for assignments
- Student submissions linked to assignments (not materials)

### 3. Simplified Architecture

- Single source of truth for assignments
- No need to manage parent-child CourseMaterial relationships
- Easier to query and report on assignments

## Migration Notes

### For Existing Data

If you have existing competencies with `CourseMaterials`:

1. The old materials won't be automatically converted
2. Editing an old competency will load empty tasks (no assignments yet)
3. Saving will create new `CourseRoundAssignments`
4. Old `CourseMaterials` can be cleaned up manually if needed

### Default Deadline

- New assignments get default deadline: 1 month from creation date
- Edit preserves existing deadline from assignment
- Controller can update deadlines via Assignments page

## Workflow Example

### Creating a Competency

1. Verifier navigates to **Add Competency**
2. Fills in competency details:
   - Name: "Network Infrastructure"
   - Grade Level: "Junior"
   - Description: "..."
   - Duration: 40 hours

3. Adds tasks with subtasks:

   ```
   Task 1: Router Configuration
   ├─ Subtask 1: Basic Setup (40 points)
   ├─ Subtask 2: Advanced Config (40 points)
   └─ Subtask 3: Testing (20 points)
   Total: 100 ✓

   Task 2: Network Security
   ├─ Subtask 1: Firewall Rules (60 points)
   └─ Subtask 2: Access Control (40 points)
   Total: 100 ✓
   ```

4. Clicks **Create Competency**

5. System creates:
   - 1 Course record
   - 2 CourseRoundAssignment records (one per task)

### Enrolling Students

1. Controller navigates to **Assignments**
2. Selects "Network Infrastructure"
3. Sees 2 assignments created by verifier
4. Navigates to **Enroll Students**
5. Selects course → Validation passes (assignments exist ✓)
6. Selects students and enrolls

## Technical Details

### Hooks Used

```typescript
// Add page
import { useCreateCourse } from "@/hooks/use-api";

// Edit page
import {
  useCourses,
  useCreateCourse,
  useCourseRoundAssignments,
} from "@/hooks/use-api";
```

### API Endpoints

```typescript
// Create course
POST /api/courses

// Create assignment
POST /api/courseroundassignment
{
  title, description, deadline, totalGrade, courseId, instructorId
}

// Update assignment
PUT /api/courseroundassignment/{id}

// Delete assignment
DELETE /api/courseroundassignment/{id}

// Get assignments by course
GET /api/courseroundassignment?courseId={id}
```

## Testing Checklist

- [x] Create competency with tasks → Assignments created
- [x] Edit competency → Loads existing assignments
- [x] Add new task → Creates new assignment
- [x] Remove task → Deletes assignment
- [x] Update task → Updates assignment
- [x] Subtask grade changes reflected in totalGrade
- [x] Validation prevents saving if totals ≠ 100
- [x] Enrollment checks for assignments
- [x] Assignment page shows verifier-created tasks

## Files Modified

1. `app/verifier/competencies/add/page.tsx`
   - Changed from CourseMaterials to CourseRoundAssignments API
   - Embedded subtasks in description field

2. `app/verifier/competencies/edit/[id]/page.tsx`
   - Changed data loading from CourseMaterials to CourseRoundAssignments
   - Added subtask parsing from description
   - Updated save logic to use CourseRoundAssignments API

## Summary

The competency management pages now create and manage assignments using the same API as the controller's assignment management page. This ensures consistency across the application and enables proper validation in the enrollment flow.

**Key Change:** Tasks are now `CourseRoundAssignments` with embedded subtask information, rather than hierarchical `CourseMaterials` with parent-child relationships.
