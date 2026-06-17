# Complete Assessment Flow Analysis

## Current System Status

### ✅ What EXISTS in Backend

1. **CompetencyResult Table** - Final assessment results
   - Auto-calculates scores from submissions
   - Stores Pass/Not Pass status
   - Endpoint: `GET /api/competencyresult?courseRoundId={id}`
   - Endpoint: `POST /api/competencyresult`
   - Endpoint: `PUT /api/competencyresult/{id}`

2. **CourseRoundAssignment Table** - Assignment/Task records
   - Stores tasks with total grades
   - Endpoint: `GET /api/courseroundassignment?courseId={id}`
   - Endpoint: `POST /api/courseroundassignment`

3. **CourseRoundAssignmentSubmission Table** - Individual submissions
   - Stores student submission links and grades
   - **❌ NO CONTROLLER/ENDPOINTS**

4. **CourseMaterial Table** - Task structure (what verifier creates)
   - Stores hierarchical task/subtask structure
   - **This is NOT used in assessment flow!**

---

## 🔴 THE PROBLEM

The verifier is creating **CourseMaterials** but the assessment system uses **CourseRoundAssignments**.

**Two separate systems that don't connect:**

1. **Verifier creates:** Course → CourseMaterial (parent/child tasks)
2. **Assessment expects:** Course → CourseRoundAssignment → CompetencyResult

---

## ✅ CORRECTED Assessment Flow

### Step 1: Controller Assigns Tasks to Course Round

**Current:** Verifier creates CourseMaterials when adding competency  
**Should Be:** Controller creates CourseRoundAssignments for a specific round

**What needs to happen:**

- Controller selects a Course (competency)
- Controller selects a CourseRound (assessment cycle)
- Controller creates CourseRoundAssignment records:
  ```json
  {
    "title": "Network Design",
    "description": "Design a network topology",
    "assignmentLink": "https://docs.google.com/...",
    "deadline": "2026-08-01",
    "totalGrade": 100,
    "courseId": 3,
    "instructorId": 101, // The assessor
    "courseMaterialId": null // Optional link to CourseMaterial
  }
  ```

**Endpoint:** `POST /api/courseroundassignment` ✅ EXISTS

---

### Step 2: Students Get Assigned (Enrollment)

Students are enrolled in a Course + CourseRound via the enrollment system.

**Endpoint:** `POST /api/students/enroll` ✅ EXISTS

---

### Step 3: Assessor Grades Student

**What happens:** Assessor views student's work and creates a CompetencyResult

**Frontend needs:**

- List of students in this course round
- Ability to enter total score OR let system auto-calculate
- Create CompetencyResult with Pass/Not Pass status

**Endpoint:** `POST /api/competencyresult` ✅ EXISTS

**Request Body:**

```json
{
  "studentId": 5,
  "courseId": 3,
  "courseRoundId": 10,
  "resultStatusId": 38, // Pass status
  "assessorId": 101,
  "notes": "Strong performance",
  "totalScore": null, // Auto-calculate from submissions
  "maxScore": null // Auto-calculate from assignments
}
```

**Auto-calculation logic (in backend):**

- Gets all CourseRoundAssignments for this courseId
- Gets all CourseRoundAssignmentSubmissions for this student + those assignments
- Sums up submission grades = totalScore
- Sums up assignment totalGrades = maxScore

---

### Step 4: Verifier Reviews and Approves

**What happens:** Verifier reviews the assessment and changes status to Pass/Not Pass

**Endpoint:** `PUT /api/competencyresult/{id}` ✅ EXISTS

**Request Body:**

```json
{
  "resultStatusId": 39, // Verified Pass status
  "notes": "Approved by verifier"
}
```

---

## ❌ MISSING PIECES

### 1. CourseRoundAssignmentSubmission Controller

**Purpose:** Store individual student submissions (optional for now)

If you want assessors to grade task-by-task:

- Need endpoints to create/update submissions
- Need UI for assessors to enter grades per task

**For MVP:** Skip this - assessors enter total score manually or system auto-calculates from existing submissions.

---

### 2. Frontend Updates Needed

#### Update 1: Fix cycles/[cycleId]/page.tsx

**Current:** Calls `/api/assessments/courseround/{id}` (404)  
**Should:** Call `/api/competencyresult?courseRoundId={id}`

**File:** `lib/api-client.ts`

```typescript
// Change from:
getByCourseRound: async (courseRoundId: number): Promise<Assessment[]> => {
  return apiRequest<Assessment[]>(`/assessments/courseround/${courseRoundId}`);
};

// To:
getByCourseRound: async (
  courseRoundId: number,
): Promise<CompetencyResult[]> => {
  return apiRequest<CompetencyResult[]>(
    `/competencyresult?courseRoundId=${courseRoundId}`,
  );
};
```

#### Update 2: Create Assessment Page for Assessor

**New page:** `/app/assessor/assess/[studentId]/[courseRoundId]/page.tsx`

**Features:**

- Show student info
- Show course info
- Input for total score (or auto-calculate)
- Input for notes
- Pass/Not Pass dropdown
- Submit button → creates CompetencyResult

#### Update 3: Create Review Page for Verifier

**New page:** `/app/verifier/review/[resultId]/page.tsx` (already exists?)

**Features:**

- Show CompetencyResult details
- Show student scores
- Approve/Reject buttons → updates ResultStatusId

---

## 🎯 RECOMMENDED APPROACH

### Option A: Simple Flow (No Submissions)

1. Controller creates CourseRoundAssignments (tasks)
2. Students work offline (no submission tracking)
3. Assessor manually enters total score → creates CompetencyResult
4. Verifier reviews and approves

**Pros:** Simple, uses existing endpoints  
**Cons:** No task-level tracking

### Option B: Full Flow (With Submissions)

1. Controller creates CourseRoundAssignments
2. Students submit work → creates CourseRoundAssignmentSubmission
3. Assessor grades each submission
4. When done, create CompetencyResult (auto-calculates totals)
5. Verifier reviews and approves

**Pros:** Full tracking  
**Cons:** Need submission controller and UI

---

## 🚀 IMMEDIATE ACTION ITEMS

### Backend (if choosing Option B):

1. Create `CourseRoundAssignmentSubmissionController`
2. Add endpoints:
   - `GET /api/submissions?studentId={id}&courseRoundId={id}`
   - `POST /api/submissions` (student submits)
   - `PUT /api/submissions/{id}` (assessor grades)

### Frontend:

1. Update `lib/api-client.ts` to use correct endpoints
2. Fix `app/controller/cycles/[cycleId]/page.tsx` endpoint
3. Create assessor assessment page
4. Verify the verifier review page works

### Decision Needed:

**Do you want task-by-task submission tracking (Option B) or just final scores (Option A)?**

If Option A, the system is 90% ready - just need frontend updates.
If Option B, need submission controller first.
