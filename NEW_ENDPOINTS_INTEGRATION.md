# New Endpoints Integration Plan

## 📋 Backend Structure Clarification

Based on your input:

1. **CourseMaterial** = Tasks (subtasks of a course/competency)
2. **CourseRound** = Assessment Cycles
3. **Assessment** = Created with course's tasks and subtasks
4. **Verification** = Monitoring only (no approve/decline buttons)
5. **CourseRoundInstructor** = Role assignments (assessors/verifiers to cycles)

---

## ✅ API Client Updated

### New Endpoints Added:

#### 1. Course Materials (Tasks)

```
GET    /api/coursematerials/course/{courseId}  - Get tasks for a course
GET    /api/coursematerials/{id}               - Get single task
POST   /api/coursematerials                    - Create task
PUT    /api/coursematerials/{id}               - Update task
DELETE /api/coursematerials/{id}               - Delete task
```

#### 2. Course Rounds (Assessment Cycles)

```
GET    /api/courserounds                       - Get all cycles
GET    /api/courserounds/course/{courseId}     - Get cycles for a course
GET    /api/courserounds/{id}                  - Get single cycle
POST   /api/courserounds                       - Create cycle
PUT    /api/courserounds/{id}                  - Update cycle
DELETE /api/courserounds/{id}                  - Delete cycle
```

#### 3. Assessments

```
GET    /api/assessments                        - Get all assessments
GET    /api/assessments/{id}                   - Get single assessment
GET    /api/assessments/student/{studentId}    - Get student's assessments
GET    /api/assessments/assessor/{assessorId}  - Get assessor's assessments
GET    /api/assessments/courseround/{id}       - Get cycle's assessments
GET    /api/assessments/status/{status}        - Get by status
POST   /api/assessments                        - Create assessment
PUT    /api/assessments/{id}                   - Update assessment
POST   /api/assessments/{id}/submit            - Submit assessment
POST   /api/assessments/{id}/verify            - Mark as verified (monitoring)
DELETE /api/assessments/{id}                   - Delete assessment
```

#### 4. Course Round Instructors (Role Assignments)

```
GET    /api/courseroundinstructors                          - Get all assignments
GET    /api/courseroundinstructors/courseround/{id}         - Get cycle assignments
GET    /api/courseroundinstructors/instructor/{accountId}   - Get instructor assignments
POST   /api/courseroundinstructors                          - Assign instructor
DELETE /api/courseroundinstructors/{id}                     - Remove assignment
```

---

## 🔄 Pages to Update

### Priority 1: Core Functionality

#### 1. Controller - Cycles Page (`/controller/cycles`)

**Current:** Uses mock data  
**Update:** Connect to CourseRounds API

- List all course rounds
- Create new course round
- Update cycle status (isActive field)
- Show cycle details

#### 2. Controller - Assign Page (`/controller/assign`)

**Current:** Uses mock data  
**Update:** Connect to CourseRoundInstructors API

- List all assignments for selected cycle
- Assign assessors/verifiers to cycles
- Remove assignments
- Save assignments to backend

#### 3. Assessor - Assessment Form (`/assessor/assess/[studentId]`)

**Current:** Uses mock data  
**Update:** Connect to Assessments API

- Load course materials (tasks) for the competency
- Create/update assessment with task scores
- Submit assessment
- Save as draft

#### 4. Verifier - Results Page (`/verifier/results`)

**Current:** Uses mock data  
**Update:** Connect to Assessments API

- List submitted assessments
- Filter by status
- View assessment details
- Mark as verified (monitoring only)

#### 5. Verifier - Review Page (`/verifier/review/[resultId]`)

**Current:** Uses mock data  
**Update:** Connect to Assessments API

- View assessment details
- View task scores
- Mark as verified (no approve/decline)

### Priority 2: Enhancement

#### 6. Controller - Student Detail (`/controller/students/[studentId]`)

**Current:** Partially connected  
**Update:** Add assessment history

- Show student's assessments
- Show scores per cycle

#### 7. Verifier - Competencies Add (`/verifier/competencies/add`)

**Current:** Mock form  
**Update:** Connect to Courses API

- Create new course/competency
- Add tasks (course materials)

---

## 📊 Data Flow

### Assessment Creation Flow:

1. **Assessor** selects student
2. System loads **CourseMaterials** (tasks) for the competency
3. **Assessor** enters scores for each task/subtask
4. **Assessor** saves as draft or submits
5. **Assessment** is created with status "Draft" or "Submitted"

### Verification Flow:

1. **Verifier** views submitted assessments
2. **Verifier** reviews scores and notes
3. **Verifier** marks as "Verified" (monitoring only)
4. No approve/decline - just acknowledgment

### Cycle Management Flow:

1. **Controller** creates **CourseRound** (cycle)
2. **Controller** assigns **CourseRoundInstructors** (assessors/verifiers)
3. **Controller** activates cycle (isActive = true)
4. Assessments are created within this cycle
5. **Controller** closes cycle (isActive = false)

---

## 🎯 Implementation Steps

### Step 1: Update Cycles Page ✅

- [x] API client created
- [x] Hooks created
- [ ] Update page to use real API
- [ ] Test create/update/delete

### Step 2: Update Assign Page ✅

- [x] API client created
- [x] Hooks created
- [ ] Update page to use real API
- [ ] Test assign/remove

### Step 3: Update Assessment Form

- [x] API client created
- [x] Hooks created
- [ ] Update page to load tasks
- [ ] Update page to save assessment
- [ ] Test create/submit

### Step 4: Update Verifier Pages

- [x] API client created
- [x] Hooks created
- [ ] Update results page
- [ ] Update review page
- [ ] Test verification flow

### Step 5: Testing

- [ ] End-to-end cycle creation
- [ ] End-to-end role assignment
- [ ] End-to-end assessment creation
- [ ] End-to-end verification

---

## 🔍 Key Differences from Original Plan

### Original Assumption:

- Separate Task and SubTask models
- Approve/Decline verification workflow
- Complex assessment structure

### Actual Backend:

- **CourseMaterial** = Tasks (simpler structure)
- **Verification** = Monitoring only (no approve/decline)
- **CourseRound** = Assessment cycles
- **CourseRoundInstructor** = Role assignments

### Adjustments Made:

✅ Updated API client to match actual backend  
✅ Removed approve/decline from verification  
✅ Simplified task structure  
✅ Added course round management  
✅ Added role assignment management

---

## 📝 Next Actions

### For Frontend:

1. Update cycles page with real API
2. Update assign page with real API
3. Update assessment form with real API
4. Update verifier pages with real API
5. Test all workflows

### For Backend (if needed):

1. Ensure all endpoints return consistent DTOs
2. Add validation for assessment scores
3. Add business logic for cycle activation
4. Add constraints for role assignments

---

## ✅ Status

**API Client:** ✅ Complete  
**React Hooks:** ✅ Complete  
**Page Updates:** ⏳ In Progress  
**Testing:** ⏳ Pending

---

**Last Updated:** May 31, 2026  
**Next:** Update cycles and assign pages
