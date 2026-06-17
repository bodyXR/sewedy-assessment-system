# Backend Endpoints Status Check

## ✅ Verifier Monitor Page Updated

**Change:** The verifier monitor page now uses `CourseRoundAssignment` endpoints instead of the non-existent `/api/assessments` endpoints.

**Verifier Role:** The verifier monitors assignments to check for issues - they don't verify assessments, just observe the system.

---

## ✅ Confirmed Working Endpoints

Based on successful integrations:

1. ✅ `POST /api/auth/login`
2. ✅ `GET /api/students`
3. ✅ `GET /api/students/{id}`
4. ✅ `GET /api/students/filter/assessor/{id}`
5. ✅ `GET /api/courses`
6. ✅ `GET /api/engineers`
7. ✅ `GET /api/courserounds`
8. ✅ `POST /api/courserounds`
9. ✅ `GET /api/courseroundinstructors`
10. ✅ `POST /api/courseroundinstructors`
11. ✅ `POST /api/students/enroll`
12. ✅ `GET /api/courseroundassignment` - Used by verifier monitor
13. ✅ `GET /api/courseroundassignment?courseId={id}` - Filter by course
14. ✅ `GET /api/courseroundassignment/{id}` - Get single assignment
15. ✅ `POST /api/courseroundassignment` - Create assignment
16. ✅ `PUT /api/courseroundassignment/{id}` - Update assignment
17. ✅ `DELETE /api/courseroundassignment/{id}` - Delete assignment

---

## ❌ Missing Endpoints (Need Backend Implementation)

### Assessments (Priority: CRITICAL)

- `GET /api/assessments`
- `GET /api/assessments/{id}`
- `POST /api/assessments`
- `PUT /api/assessments/{id}`
- `POST /api/assessments/{id}/submit`
- `POST /api/assessments/{id}/verify`
- `GET /api/assessments/student/{studentId}`
- `GET /api/assessments/assessor/{assessorId}`
- `GET /api/assessments/courseround/{courseRoundId}`

### Course Materials (Tasks)

- `GET /api/coursematerials`
- `GET /api/coursematerials/course/{courseId}`
- `POST /api/coursematerials`

### Statistics & Reports

- `GET /api/statistics/overview`
- `GET /api/reports/verification-summary`

---

## 🔄 Required Actions

### Backend Team Must Implement:

1. **Assessments Controller** (CRITICAL)
   - Create, Read, Update, Delete assessments
   - Submit assessment
   - Verify assessment
   - Filter by student, assessor, course round

2. **Course Materials Controller** (HIGH)
   - Manage tasks/subtasks for courses
   - Used by assessment form

3. **Statistics Controller** (MEDIUM)
   - Dashboard statistics
   - Analytics

---

## 🛠️ Frontend Workaround

Until backend implements assessment endpoints, the frontend pages will:

- Show "Assessment endpoints not available" message
- Suggest backend implementation
- Keep mock data as fallback for UI testing

---

**Status:** Waiting for backend assessment endpoints  
**Impact:** Verifier results, verifier review, and assessor assessment pages cannot function  
**Priority:** CRITICAL - Core feature blocked
