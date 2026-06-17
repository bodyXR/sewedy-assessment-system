# Assessor Assessment Page - Fix Summary

## Issues Found & Fixed

### Issue 1: Student Not Found

**Problem**: The assess page was using mock data (`mockStudents`) instead of fetching real student data from the API.

**Root Cause**:

```typescript
// Old code
const student = mockStudents.find((s) => s.id === studentId);
```

**Solution**: Implemented real API call to fetch student data:

```typescript
const { data: student, isLoading: loadingStudent } = useApiQuery(
  () => api.students.getById(Number(studentId)),
  [studentId],
);
```

### Issue 2: Mock Tasks Instead of Real Assignments

**Problem**: The assessment form was using hardcoded mock tasks instead of fetching real assignments from CourseRoundAssignments.

**Root Cause**:

```typescript
// In AssessmentForm component
const tasks: Task[] = mockTasks[student.competency ?? ""] ?? [];
```

**Solution**:

1. Fetch assignments from API based on student's course
2. Convert CourseRoundAssignments to Task format
3. Inject real tasks into the form

```typescript
// Fetch assignments
const { data: assignments } = useApiQuery(
  () =>
    courseId
      ? api.courseRoundAssignments.getAll(courseId)
      : Promise.resolve([]),
  [courseId],
);

// Convert to Task format
const tasks: Task[] = assignments.map((assignment) => {
  // Parse subtasks from description
  // Create SubTask objects
  return {
    id: assignment.id.toString(),
    label: assignment.title,
    subTasks: subtasks,
  };
});
```

### Issue 3: Wrong User ID Field

**Problem**: Assessor students page was using `user?.id` instead of `user?.accountId` to fetch assigned students.

**Solution**:

```typescript
// Before
const assessorId = user?.id ? Number.parseInt(user.id, 10) : null;

// After
const assessorId = user?.accountId || null;
```

## Implementation Details

### Data Flow

```
1. Assessor clicks student → Navigate to /assessor/assess/[studentId]
2. Page fetches student data → api.students.getById(studentId)
3. Extract courseId from student.competencies[0].courseId
4. Fetch assignments → api.courseRoundAssignments.getAll(courseId)
5. Parse assignments into Task/SubTask format:
   - Assignment.title → Task.label
   - Assignment.description (parse subtasks) → Task.subTasks
   - "Subtasks: name1: X points, name2: Y points" → SubTask[]
6. Inject tasks into AssessmentForm
7. Form displays real assignments for grading
```

### Subtask Parsing

Assignments store subtask breakdown in the description field:

```
Format: "Subtasks: name1: X points, name2: Y points"

Example:
"Subtasks: Router Config: 50 points, Network Testing: 30 points, Documentation: 20 points"

Parsed to:
[
  { id: "123-0", label: "Router Config", maxPoints: 50 },
  { id: "123-1", label: "Network Testing", maxPoints: 30 },
  { id: "123-2", label: "Documentation", maxPoints: 20 }
]
```

### Fallback Handling

If no subtasks are found in description, creates default subtask:

```typescript
{
  id: `${assignment.id}-0`,
  label: "Complete Assignment",
  maxPoints: assignment.totalGrade
}
```

### Error Handling

**No Student Found**:

```
Shows error card with message:
"Student not found - The student with ID X could not be found."
Provides back button
```

**No Assignments Found**:

```
Shows warning card with message:
"No assignments found - This student's course has no assignments yet.
Assignments must be created before assessment."
Provides back button
```

## Files Modified

### 1. `app/assessor/students/page.tsx`

- Changed `user?.id` to `user?.accountId` for API call
- Fixed assessor ID passing to useStudentsByAssessor hook

### 2. `app/assessor/assess/[studentId]/page.tsx`

- Complete rewrite to use real API data
- Removed dependency on mock data
- Implemented assignment fetching
- Added subtask parsing logic
- Added proper error handling
- Created AssessmentFormWithTasks wrapper

## API Integration

### Endpoints Used

```typescript
// Get student by ID
GET /api/students/{id}
Returns: Student with competencies array

// Get assignments for course
GET /api/courseroundassignment?courseId={id}
Returns: CourseRoundAssignment[]
```

### Data Structures

**Student from API**:

```typescript
{
  id: number,
  fullNameEn: string,
  email: string,
  nationalId: string,
  className?: string,
  status?: string,
  competencies?: [{
    courseId: number,
    competencyName: string,
    assessmentCycleId: number,
    ...
  }]
}
```

**CourseRoundAssignment from API**:

```typescript
{
  id: number,
  title: string,
  description: string, // Contains subtask breakdown
  totalGrade: number,
  deadline: string,
  courseId: number,
  instructorId: number,
  ...
}
```

## Future Improvements (TODOs)

### 1. Save Draft Functionality

```typescript
// Implement API call to save assessment draft
const handleSaveDraft = async (data: AssessmentFormData) => {
  await api.assessments.create({
    studentId: Number(studentId),
    assessorId: user.accountId,
    courseRoundId: student.competencies[0].assessmentCycleId,
    scores: data.scores,
    notes: data.notes,
    status: "draft",
  });
};
```

### 2. Submit Assessment Functionality

```typescript
// Implement API call to submit assessment
const handleSubmit = async (data: AssessmentFormData) => {
  await api.assessments.create({
    studentId: Number(studentId),
    assessorId: user.accountId,
    courseRoundId: student.competencies[0].assessmentCycleId,
    scores: data.scores,
    notes: data.notes,
    grade: data.grade,
    trial: data.trial,
    status: "submitted",
  });
};
```

### 3. Load Existing Assessment

```typescript
// Check if assessment already exists
const { data: existingAssessment } = useApiQuery(
  () => api.assessments.getByStudent(Number(studentId)),
  [studentId],
);

const isLocked = existingAssessment?.status === "submitted";
const initialScores = existingAssessment?.scores || {};
const initialNotes = existingAssessment?.notes || "";
```

### 4. Check Cycle Status

```typescript
// Fetch cycle and check if closed
const cycleId = student.competencies[0].assessmentCycleId;
const { data: cycle } = useApiQuery(
  () => api.courseRounds.getById(cycleId),
  [cycleId],
);

const isCycleClosed = cycle?.endDate && new Date() > new Date(cycle.endDate);
```

## Testing Checklist

- [x] Student data loads correctly
- [x] Assignments fetch from API
- [x] Subtasks parse correctly from description
- [x] Tasks display in assessment form
- [x] Scores can be entered
- [x] Form validation works
- [x] Error handling for missing student
- [x] Error handling for missing assignments
- [x] Back button navigation works
- [ ] Draft save functionality
- [ ] Submit assessment functionality
- [ ] Load existing assessment
- [ ] Cycle status checking

## Benefits

1. **Real Data**: Uses actual student and assignment data instead of mocks
2. **Dynamic**: Assignments created by verifiers/controllers automatically appear
3. **Validation**: Ensures assignments exist before assessment
4. **Error Handling**: Clear messages when data is missing
5. **Flexibility**: Supports any number of assignments/subtasks
6. **Integration**: Works with the new assignment management system

## Summary

The assessor assessment page now properly fetches student data and real assignments from the API, parses them into the correct format, and displays them in the assessment form. The page includes proper error handling and loading states. Next steps are to implement the save/submit functionality to persist assessment results to the database.
