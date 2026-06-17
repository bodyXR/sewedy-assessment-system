# Course Round (Assessment Cycle) Requirement

## Problem

When trying to submit an assessment, the system shows:

```
No Assessment Cycle
No assessment cycle exists for this course.
Please ask a controller to create one via the Cycles page.
```

## Root Cause

### System Architecture

The assessment system has three separate concepts:

1. **CourseRoundAssignments** - The assignments/tasks for a course
2. **Student Enrollment** - Links students to courses and creates submission placeholders
3. **CourseRounds (Cycles)** - Time-based assessment periods

### The Gap

- Student enrollment (`POST /api/students/enroll`) creates submissions but does NOT create or require a CourseRound
- CompetencyResults (`POST /api/competencyresult`) REQUIRES a CourseRoundId
- There's no automatic CourseRound creation

## Solution: Create a Course Round

### Option 1: Via UI (Controller)

1. **Login as Controller**

2. **Navigate to Cycles Page**

   ```
   Controller Dashboard → Cycles
   ```

3. **Create New Cycle**

   ```
   Click "Create Cycle" or similar button
   ```

4. **Fill in Details**

   ```
   Course: [Select the course - e.g., "Network Infrastructure"]
   Round Number: 1
   Start Date: [Today or assessment start date]
   End Date: [Assessment end date]
   Is Active: ✓ (checked)
   Max Students: 30 (or leave blank)
   Status: Active
   ```

5. **Save**
   ```
   Click "Create" or "Save"
   ```

### Option 2: Via API Call

```typescript
// Create a course round
await api.courseRounds.create({
  courseId: 6,
  roundNumber: 1,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
  isActive: true,
});
```

### Option 3: Direct SQL (Database)

```sql
INSERT INTO CourseRounds (CourseId, RoundNumber, StartDate, EndDate, IsActive, CreatedAt)
VALUES (
    6,                                    -- Your course ID
    1,                                    -- Round number
    GETDATE(),                            -- Start date
    DATEADD(DAY, 90, GETDATE()),         -- End date (90 days from now)
    1,                                    -- IsActive = true
    GETDATE()                             -- CreatedAt
);
```

## Why CourseRounds Are Needed

### 1. Assessment Organization

- Organize assessments by time period (Term 1, Term 2, etc.)
- Track which round a student was assessed in
- Allow re-assessment in different rounds

### 2. Reporting

- Generate reports per assessment cycle
- Compare performance across different rounds
- Track historical data

### 3. Instructor Assignment

- Assign specific assessors/verifiers to specific cycles
- Different instructors for different terms
- Workload distribution

### 4. Data Integrity

- CompetencyResult links student → course → round
- Ensures assessment results are properly contextualized
- Prevents data ambiguity

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ SETUP PHASE (Controller)                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Create Course (Competency)                          │
│     → POST /api/courses                                 │
│                                                          │
│  2. Create CourseRound (Cycle) ⚠️ REQUIRED             │
│     → POST /api/courseround                             │
│     → Sets time period and round number                 │
│                                                          │
│  3. Create Assignments (Tasks)                          │
│     → POST /api/courseroundassignment                   │
│     → Multiple assignments per course                   │
│                                                          │
│  4. Enroll Students                                      │
│     → POST /api/students/enroll                         │
│     → Creates submission placeholders                   │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ASSESSMENT PHASE (Assessor)                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  5. Assessor views students                             │
│     → GET /api/students/filter/assessor/{id}            │
│                                                          │
│  6. Assessor grades student                             │
│     → Enters scores for each assignment                 │
│                                                          │
│  7. Submit Assessment ⚠️ NEEDS CourseRoundId           │
│     → POST /api/competencyresult                        │
│     → Requires: studentId, courseId, courseRoundId      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Common Scenarios

### Scenario 1: Single Assessment Period

```
If you only assess students once per year:
- Create one CourseRound per course
- Set IsActive = true
- Use the same round for all assessments
```

### Scenario 2: Multiple Terms

```
If you have Term 1, Term 2, etc.:
- Create separate CourseRounds
- Round 1: September - December
- Round 2: January - April
- Round 3: May - August
- Mark current term as IsActive
```

### Scenario 3: Re-assessments

```
If students can retake assessments:
- Each attempt uses the same CourseRound
- Or create new round for re-assessment period
- CompetencyResult tracks which round
```

## Fixing Existing Data

If you have students already enrolled but no CourseRounds:

### Step 1: Create CourseRound for each course

```sql
-- Get all courses that need rounds
SELECT DISTINCT CourseId, c.Title
FROM CourseRoundAssignments cra
JOIN Courses c ON c.Id = cra.CourseId
WHERE CourseId NOT IN (SELECT DISTINCT CourseId FROM CourseRounds);

-- Create rounds for them
INSERT INTO CourseRounds (CourseId, RoundNumber, StartDate, EndDate, IsActive, CreatedAt)
SELECT
    CourseId,
    1 as RoundNumber,
    GETDATE() as StartDate,
    DATEADD(MONTH, 3, GETDATE()) as EndDate,
    1 as IsActive,
    GETDATE() as CreatedAt
FROM (
    SELECT DISTINCT CourseId
    FROM CourseRoundAssignments
    WHERE CourseId NOT IN (SELECT DISTINCT CourseId FROM CourseRounds)
) AS CoursesNeedingRounds;
```

### Step 2: Verify rounds exist

```sql
SELECT
    c.Id,
    c.Title,
    COUNT(cr.Id) as RoundCount,
    MAX(CASE WHEN cr.IsActive = 1 THEN 'Yes' ELSE 'No' END) as HasActiveRound
FROM Courses c
LEFT JOIN CourseRounds cr ON cr.CourseId = c.Id
WHERE c.BusinessEntity = 'Assessment'
GROUP BY c.Id, c.Title;
```

## Prevention

To prevent this issue in the future:

### 1. Update Enrollment Process

Modify the enrollment endpoint to check for CourseRound:

```csharp
// In StudentRepo.EnrollStudents method
if (!request.CourseRoundId.HasValue)
{
    // Auto-assign to active round
    var activeRound = await _context.CourseRounds
        .Where(cr => cr.CourseId == request.CourseId && cr.IsActive)
        .FirstOrDefaultAsync();

    if (activeRound == null)
    {
        throw new InvalidOperationException(
            $"No active CourseRound found for Course {request.CourseId}. " +
            "Create a CourseRound first via /api/courseround"
        );
    }

    request.CourseRoundId = activeRound.Id;
}
```

### 2. Add Validation to Assignment Creation

Ensure CourseRound exists before creating assignments:

```csharp
// In CourseRoundAssignmentRepo.Create method
var round = await _context.CourseRounds
    .Where(cr => cr.CourseId == request.CourseId && cr.IsActive)
    .FirstOrDefaultAsync();

if (round == null)
{
    throw new InvalidOperationException(
        $"No active CourseRound for Course {request.CourseId}. " +
        "Create one first."
    );
}
```

### 3. Update UI Workflow

- Show warning in enrollment UI if no cycle exists
- Auto-create default cycle when creating course
- Make cycle creation part of course setup wizard

## Summary

**The Issue**: CompetencyResults require a CourseRoundId, but enrollment doesn't create or require one.

**The Fix**: Controllers must create CourseRounds (via Cycles page or API) before assessments can be submitted.

**The Workflow**:

1. Create Course
2. **Create CourseRound** ← Often missed
3. Create Assignments
4. Enroll Students
5. Assess Students → Works now!

**Quick Fix**: Create at least one active CourseRound for each course that has students enrolled.
