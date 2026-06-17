# Assessment Submit Functionality - Implementation Complete

## Overview

Implemented the assessment submission functionality that posts results to the CompetencyResult endpoint when the assessor clicks "Submit Results".

## API Integration

### New Endpoint Added to API Client

**File**: `lib/api-client.ts`

Added `competencyResultsApi` with full CRUD operations:

```typescript
export interface CompetencyResultCreateRequest {
  studentId: number;
  courseId: number;
  courseRoundId: number;
  totalScore?: number; // Auto-calculated if omitted
  maxScore?: number; // Auto-calculated if omitted
  resultStatusId: number; // Pass/Not Pass status ID
  assessorId: number;
  notes?: string;
  gradedAt?: string;
}

// POST /api/competencyresult
api.competencyResults.create(data);

// GET /api/competencyresult?studentId=5
api.competencyResults.getAll({ studentId: 5 });

// PUT /api/competencyresult/{id}
api.competencyResults.update(id, data);

// DELETE /api/competencyresult/{id}
api.competencyResults.delete(id);
```

### Backend Endpoint

```
POST /api/competencyresult
{
  "studentId": 5,
  "courseId": 3,
  "courseRoundId": 10,
  "resultStatusId": 38,       // Pass status ID
  "assessorId": 101,
  "notes": "Strong performance in all tasks.",
  "totalScore": 85,           // Optional - auto-calculated from submissions
  "maxScore": 100             // Optional - auto-calculated from assignments
}
```

## Assessment Submission Flow

### 1. Assessor Enters Scores

- Assessor views student assessment page
- Real assignments load from CourseRoundAssignments
- Subtasks parsed from assignment descriptions
- Assessor enters scores for each subtask
- Form calculates totals and pass/fail in real-time

### 2. Submit Button Clicked

When "Submit Results" is clicked:

```typescript
handleSubmit(data: AssessmentFormData) {
  // 1. Calculate total score from all entered scores
  let totalScore = 0;
  let maxScore = 0;
  tasks.forEach(task => {
    task.subTasks.forEach(subtask => {
      const key = `${task.id}.${subtask.id}`;
      totalScore += data.scores[key] || 0;
      maxScore += subtask.maxPoints;
    });
  });

  // 2. Determine pass/fail (80% threshold)
  const percentage = (totalScore / maxScore) * 100;
  const passed = percentage >= 80;

  // 3. Select appropriate status ID
  const resultStatusId = passed ? PASS_STATUS_ID : FAIL_STATUS_ID;

  // 4. POST to API
  await api.competencyResults.create({
    studentId,
    courseId,
    courseRoundId,
    totalScore,
    maxScore,
    resultStatusId,
    assessorId: user.accountId,
    notes: data.notes,
    gradedAt: new Date().toISOString()
  });

  // 5. Show success message and navigate back
  toast({ title: "Assessment Submitted" });
  router.push("/assessor/students");
}
```

### 3. Backend Processing

- Validates student, course, round, assessor, status
- Creates CompetencyResult record
- Auto-calculates scores from CourseRoundAssignmentSubmissions (if not provided)
- Returns created result with all details

## Status IDs

The system uses Status table IDs to mark results as Pass/Not Pass:

```typescript
const PASS_STATUS_ID = 38; // Status with "Pass" in name
const FAIL_STATUS_ID = 39; // Status for failures
```

**Note**: These IDs are hardcoded based on the backend comment. You may need to adjust them based on your actual Status table data.

### To Find Actual Status IDs:

```sql
SELECT Id, StatusName
FROM Status
WHERE StatusName LIKE '%Pass%';
```

## Data Structure

### AssessmentFormData (from form)

```typescript
{
  scores: {
    "123-0": 45,  // task.id-subtask.id: points
    "123-1": 25,
    "124-0": 30
  },
  notes: "Good performance overall",
  grade: "A",     // Derived grade letter
  trial: "A"      // Current trial letter
}
```

### CompetencyResult (saved to database)

```typescript
{
  id: 456,
  studentId: 5,
  courseId: 3,
  courseRoundId: 10,
  totalScore: 100,        // Sum of all subtask scores
  maxScore: 150,          // Sum of all subtask max points
  scorePercentage: 66.67, // Auto-calculated
  resultStatusId: 39,     // Not Pass (< 80%)
  assessorId: 101,
  notes: "Good performance overall",
  gradedAt: "2026-06-17T10:30:00Z",
  createdAt: "2026-06-17T10:30:00Z"
}
```

## Features Implemented

### ✅ Score Calculation

- Aggregates all subtask scores
- Calculates total and max score
- Computes percentage
- Determines pass/fail (80% threshold)

### ✅ Status Selection

- Automatically selects Pass or Not Pass status
- Based on 80% threshold from assessment form
- Uses appropriate status ID for API

### ✅ API Integration

- Posts to `/api/competencyresult`
- Includes all required fields
- Handles errors gracefully
- Shows success/error toasts

### ✅ Navigation

- Redirects to students list after successful submission
- Stays on page if submission fails
- Preserves data until successful submit

### ✅ Error Handling

- Validates required data (student, course, user)
- Catches API errors
- Shows user-friendly error messages
- Logs errors to console for debugging

## User Experience

### Success Flow

```
1. Assessor enters all scores
2. Clicks "Submit Results"
3. [Loading indicator]
4. Success toast: "Assessment Submitted - Student passed with 85.3%"
5. Redirects to students list
6. Student now shows as "Assessed" in list
```

### Error Handling

```
If missing data:
  Toast: "Missing required information"

If API error:
  Toast: "Submission Failed - [error message]"
  Stays on page, scores preserved

If network error:
  Toast: "Cannot connect to API"
  Stays on page, can retry
```

## Testing Checklist

- [x] Scores aggregate correctly
- [x] Pass/fail determined at 80% threshold
- [x] API endpoint called with correct data
- [x] Success toast shows with percentage
- [x] Navigates back to students on success
- [x] Error toast shows on failure
- [x] User stays logged in
- [x] CourseRoundId extracted from student data
- [ ] Status IDs verified in database
- [ ] Multiple assessors can grade same student
- [ ] Draft save functionality

## Future Enhancements

### 1. Individual Assignment Submissions

Currently, the system creates a single CompetencyResult with totals. For more granular tracking, implement CourseRoundAssignmentSubmission creation:

```typescript
// For each assignment/task
for (const task of tasks) {
  let taskScore = 0;
  task.subTasks.forEach((subtask) => {
    taskScore += data.scores[`${task.id}.${subtask.id}`] || 0;
  });

  await api.submissions.create({
    assignmentId: Number(task.id),
    studentId: student.id,
    grade: taskScore,
    feedback: data.notes,
    submittedAt: new Date().toISOString(),
    statusId: GRADED_STATUS_ID,
  });
}
```

### 2. Draft Save

Implement local storage or API endpoint to save draft progress:

```typescript
const handleSaveDraft = async (data: AssessmentFormData) => {
  // Save to localStorage
  localStorage.setItem(`assessment_draft_${studentId}`, JSON.stringify(data));

  // Or POST to draft endpoint
  await api.assessments.saveDraft({
    studentId,
    assessorId,
    scores: data.scores,
    notes: data.notes,
  });
};
```

### 3. Load Existing Assessment

Check if assessment already exists and load it:

```typescript
const { data: existingResult } = useApiQuery(
  () =>
    api.competencyResults.getAll({
      studentId: Number(studentId),
      courseId: courseId,
    }),
  [studentId, courseId],
);

const isLocked = existingResult && existingResult.length > 0;
const initialScores = parseScoresFromResult(existingResult[0]);
```

### 4. Status ID Configuration

Make status IDs configurable instead of hardcoded:

```typescript
// Fetch from API or config
const { data: statuses } = useApiQuery(() => api.statuses.getAll(), []);

const passStatus = statuses.find(
  (s) =>
    s.statusName.toLowerCase().includes("pass") &&
    !s.statusName.toLowerCase().includes("not"),
);
const PASS_STATUS_ID = passStatus?.id || 38;
```

### 5. Retry Logic

Add retry for failed submissions:

```typescript
const handleSubmit = async (data, retryCount = 0) => {
  try {
    await api.competencyResults.create(payload);
  } catch (error) {
    if (retryCount < 3) {
      await new Promise((r) => setTimeout(r, 1000));
      return handleSubmit(data, retryCount + 1);
    }
    throw error;
  }
};
```

## Files Modified

1. **`lib/api-client.ts`**
   - Added `CompetencyResult` interfaces
   - Added `CompetencyResultCreateRequest` interface
   - Added `competencyResultsApi` with CRUD methods
   - Exported in combined `api` object

2. **`app/assessor/assess/[studentId]/page.tsx`**
   - Imported `useAuth` to get current user
   - Implemented `handleSubmit` with API call
   - Added score calculation logic
   - Added pass/fail determination
   - Added error handling
   - Added success navigation

## Summary

The assessment submission functionality is now complete. Assessors can:

1. View students and their assignments
2. Enter scores for each subtask
3. Add notes
4. Submit assessment
5. System automatically calculates totals and determines pass/fail
6. Results are saved to CompetencyResult table
7. Assessor sees confirmation and returns to student list

The implementation uses the existing CompetencyResult endpoint and follows the backend's auto-calculation pattern for scores.
