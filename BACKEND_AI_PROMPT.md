# Backend AI Development Prompt

## Project Overview

You are building a **RESTful API backend** for an **Assessment Management Platform** used by technical colleges. The platform manages competency-based assessments where students are graded by assessors, and results are verified by verifiers before being reported to controllers.

---

## System Architecture

### User Roles

1. **Controller**: Manages cycles, enrolls students, assigns assessors/verifiers, views reports
2. **Assessor**: Grades students on competency tasks
3. **Verifier**: Reviews assessments and adds notes (cannot modify grades)
4. **Student**: Not in the system - only tracked as data entities
5. **Admin**: System administration

### Core Workflow

1. Controller creates an **Assessment Cycle** (Round 1, 2, etc.)
2. Controller assigns **Assessors** and **Verifiers** to the cycle
3. Controller enrolls **Students** in **Competencies** for that cycle
4. Assessor grades student on **all tasks/subtasks** in ONE assessment session
5. Student can have up to **4 attempts** (A, B, C, D) - sequential only
6. Student must **pass ALL tasks AND subtasks** to pass the competency
7. Verifier reviews the assessment and adds notes
8. System tracks all historical data for analytics

---

## Database Schema Summary

The complete SQL schema is in `COMPLETE_DATABASE_SCHEMA.sql`. Key tables:

### Core Tables

- `users` - All system users with roles
- `students` - Student-specific data (class, student number)
- `grades` - Grade levels (10, 11, 12)
- `competencies` - Courses/competencies
- `competency_tasks` - Tasks within each competency
- `competency_subtasks` - Subtasks within each task

### Cycle & Enrollment

- `assessment_cycles` - Assessment rounds/cycles
- `cycle_role_assignments` - Assessor/Verifier assignments per cycle
- `student_enrollments` - Students enrolled in competencies per cycle

### Assessments

- `assessment_attempts` - A, B, C, D attempts (max 4 per enrollment)
- `attempt_task_results` - Scores for each task
- `attempt_subtask_results` - Scores for each subtask

### Admin

- `controller_reports` - Generated reports
- `audit_log` - Complete audit trail

---

## API Requirements

Build a **ASP.NET Core Web API** (.NET 6 or higher) with the following characteristics:

### Technology Stack

- **Framework**: ASP.NET Core Web API
- **ORM**: Entity Framework Core
- **Database**: SQL Server
- **Auth**: JWT Bearer tokens
- **Validation**: FluentValidation or DataAnnotations
- **Documentation**: Swagger/OpenAPI

### Architecture Patterns

- Repository pattern for data access
- Service layer for business logic
- DTO (Data Transfer Objects) for API contracts
- AutoMapper for object mapping
- Dependency injection throughout
- Middleware for error handling
- CORS enabled for frontend at `http://localhost:3000`

---

## Required Endpoints

### 1. Authentication & Users

#### POST /api/auth/login

- **Body**: `{ "email": "user@example.com", "password": "password123" }`
- **Response**: `{ "token": "jwt_token", "user": {...}, "role": "Assessor" }`
- **Logic**: Validate credentials, return JWT with role claims

#### GET /api/users

- **Auth**: Admin, Controller
- **Response**: List of all users with filtering by role
- **Query params**: `?role=Assessor&isActive=true`

#### GET /api/users/{id}

- **Auth**: All authenticated users (own profile or admin)
- **Response**: User details

#### POST /api/users

- **Auth**: Admin, Controller
- **Body**: User creation DTO
- **Logic**: Hash password, create user

#### PUT /api/users/{id}

- **Auth**: Admin, Controller, Own profile
- **Body**: User update DTO
- **Logic**: Update user, maintain audit trail

---

### 2. Students

#### GET /api/students

- **Auth**: Controller, Assessor, Verifier
- **Response**: List of students with pagination
- **Query params**: `?className=SW1&isActive=true&page=1&pageSize=20`
- **Include**: Enrolled competencies with current attempt status

#### GET /api/students/{id}

- **Auth**: Controller, Assessor, Verifier
- **Response**: Student detail with all enrollments and assessment history

#### POST /api/students

- **Auth**: Controller
- **Body**: `{ "email", "fullNameEn", "fullNameAr", "studentNumber", "className", "enrollmentYear" }`
- **Logic**: Create user + student record atomically

#### PUT /api/students/{id}

- **Auth**: Controller
- **Body**: Student update DTO

---

### 3. Competencies & Structure

#### GET /api/competencies

- **Auth**: All authenticated
- **Response**: List of competencies with grade info
- **Query params**: `?gradeId=1&isActive=true`

#### GET /api/competencies/{id}

- **Auth**: All authenticated
- **Response**: Competency with **all tasks and subtasks** (full hierarchy)
- **Include**: `{ competency, tasks: [{ task, subtasks: [...] }] }`

#### POST /api/competencies

- **Auth**: Controller, Admin
- **Body**: `{ "title", "description", "code", "gradeId", "durationHours" }`

#### PUT /api/competencies/{id}

- **Auth**: Controller, Admin

#### GET /api/competencies/{id}/structure

- **Auth**: All authenticated
- **Response**: **Full task/subtask tree** ready for assessment form
- **Format**:

```json
{
  "competencyId": 1,
  "title": "Network Security",
  "tasks": [
    {
      "taskId": 1,
      "title": "Firewall Configuration",
      "maxScore": 100,
      "subtasks": [
        { "subtaskId": 1, "title": "Basic Setup", "maxScore": 40 },
        { "subtaskId": 2, "title": "Rule Creation", "maxScore": 60 }
      ]
    }
  ]
}
```

---

### 4. Assessment Cycles

#### GET /api/cycles

- **Auth**: All authenticated
- **Response**: List of cycles
- **Query params**: `?isActive=true`

#### GET /api/cycles/{id}

- **Auth**: All authenticated
- **Response**: Cycle details with role assignments

#### POST /api/cycles

- **Auth**: Controller
- **Body**: `{ "roundNumber", "academicYear", "startDate", "endDate", "isActive", "description" }`
- **Logic**: Only one cycle can be active at a time

#### PUT /api/cycles/{id}

- **Auth**: Controller
- **Body**: Cycle update DTO
- **Logic**: Validate date ranges, manage active status

#### DELETE /api/cycles/{id}

- **Auth**: Controller
- **Logic**: Soft delete or prevent if has assessments

---

### 5. Role Assignments

#### GET /api/cycles/{cycleId}/roles

- **Auth**: Controller
- **Response**: All assessor/verifier assignments for cycle

#### POST /api/cycles/{cycleId}/roles

- **Auth**: Controller
- **Body**: `{ "userId": 5, "roleName": "Assessor" }`
- **Logic**: Assign user to cycle as Assessor or Verifier
- **Validation**: User cannot have both roles in same cycle

#### PUT /api/roles/{assignmentId}

- **Auth**: Controller
- **Body**: `{ "roleName": "Verifier" }`
- **Logic**: Change role assignment

#### DELETE /api/roles/{assignmentId}

- **Auth**: Controller
- **Logic**: Remove assignment

---

### 6. Student Enrollments

#### GET /api/enrollments

- **Auth**: Controller, Assessor, Verifier
- **Query params**: `?cycleId=1&studentId=5&competencyId=3`
- **Response**: Enrollments with current status

#### GET /api/enrollments/{id}

- **Auth**: All authenticated
- **Response**: Enrollment with all attempts

#### POST /api/enrollments

- **Auth**: Controller
- **Body**: `{ "studentId": 5, "competencyId": 3, "cycleId": 1 }`
- **Logic**: Enroll student in competency for cycle
- **Validation**: Prevent duplicate enrollment

#### POST /api/enrollments/bulk

- **Auth**: Controller
- **Body**: `{ "studentIds": [1,2,3], "competencyId": 3, "cycleId": 1 }`
- **Logic**: Bulk enroll multiple students

#### DELETE /api/enrollments/{id}

- **Auth**: Controller
- **Logic**: Remove enrollment (only if no attempts submitted)

---

### 7. Assessment Attempts (CRITICAL - Main Assessment Flow)

#### GET /api/attempts

- **Auth**: Assessor (own), Verifier (all), Controller (all)
- **Query params**: `?assessorId=5&status=In_Progress&cycleId=1`
- **Response**: List of attempts with student/competency info

#### GET /api/attempts/{id}

- **Auth**: Assessor (own), Verifier, Controller
- **Response**: **Complete attempt details** with all task/subtask results
- **Format**:

```json
{
  "attemptId": 1,
  "enrollmentId": 10,
  "studentName": "John Doe",
  "competencyTitle": "Network Security",
  "attemptLetter": "A",
  "status": "In_Progress",
  "totalScore": 85.5,
  "maxPossibleScore": 100,
  "percentage": 85.5,
  "assessorName": "Jane Smith",
  "assessorNotes": "Good work overall",
  "verifierNotes": null,
  "isVerified": false,
  "tasks": [
    {
      "taskResultId": 1,
      "taskId": 1,
      "taskTitle": "Firewall Config",
      "score": 85.5,
      "maxScore": 100,
      "isPassed": true,
      "subtasks": [
        {
          "subtaskResultId": 1,
          "subtaskId": 1,
          "subtaskTitle": "Basic Setup",
          "score": 35,
          "maxScore": 40,
          "isPassed": true,
          "notes": "Well done"
        }
      ]
    }
  ]
}
```

#### POST /api/attempts

- **Auth**: Assessor
- **Body**: `{ "enrollmentId": 10, "attemptLetter": "A" }`
- **Logic**:
  - Create new attempt
  - **Automatically create all task_results and subtask_results** based on competency structure
  - Initialize all scores to NULL
  - Set status to 'In_Progress'
  - Call stored procedure `sp_create_assessment_attempt` for validation
- **Validation**:
  - Attempt A doesn't need prerequisites
  - Attempts B, C, D require previous attempt to be completed (Passed or Not_Passed)
  - Cannot create duplicate attempt
  - Assessor must be assigned to the cycle

#### PUT /api/attempts/{id}/grade

- **Auth**: Assessor (own attempts only)
- **Body**:

```json
{
  "assessorNotes": "Student demonstrated strong skills",
  "subtaskResults": [
    { "subtaskId": 1, "score": 35, "maxScore": 40, "notes": "Good" },
    { "subtaskId": 2, "score": 50, "maxScore": 60, "notes": "Excellent" }
  ]
}
```

- **Logic**:
  - Update subtask scores and pass/fail status (pass if score >= 60% of max)
  - Triggers auto-calculate task scores
  - Triggers auto-calculate attempt total score
  - Triggers auto-set attempt status (Passed if ALL subtasks passed, Not_Passed otherwise)
  - Set `graded_at` timestamp
  - **IMPORTANT**: A student must pass **ALL subtasks** and **ALL tasks** to pass the competency

#### POST /api/attempts/{id}/submit

- **Auth**: Assessor (own attempts only)
- **Logic**:
  - Change status from 'In_Progress' to 'Submitted'
  - Set `submitted_at` timestamp
  - Validation: All subtasks must have scores

#### POST /api/attempts/{id}/verify

- **Auth**: Verifier only
- **Body**: `{ "verifierNotes": "Reviewed and approved" }`
- **Logic**:
  - Add verifier notes
  - Set `is_verified = true`
  - Set `verified_by` and `verified_at`
  - **CANNOT modify scores** - verifiers only review

---

### 8. Analytics & Reports

#### GET /api/analytics/dashboard

- **Auth**: Controller
- **Query params**: `?cycleId=1`
- **Response**:

```json
{
  "totalStudents": 150,
  "totalEnrollments": 300,
  "assessmentsInProgress": 45,
  "assessmentsCompleted": 200,
  "assessmentsPassed": 170,
  "assessmentsFailed": 30,
  "averagePassRate": 85.0,
  "competencyBreakdown": [
    {
      "competencyTitle": "Network Security",
      "passRate": 90,
      "totalStudents": 50
    }
  ]
}
```

#### GET /api/analytics/assessor-workload

- **Auth**: Controller
- **Query params**: `?cycleId=1`
- **Response**: Use view `vw_assessor_workload`

#### GET /api/analytics/competency-performance

- **Auth**: Controller
- **Query params**: `?cycleId=1`
- **Response**: Use view `vw_competency_pass_rates`

#### GET /api/analytics/student-progress/{studentId}

- **Auth**: Controller, Assessor (if assessing the student)
- **Response**: Student's complete assessment history across all cycles

#### GET /api/analytics/attempts-distribution

- **Auth**: Controller
- **Query params**: `?cycleId=1`
- **Response**: Statistics on how many students passed on attempt A, B, C, D

---

### 9. Reports

#### GET /api/reports

- **Auth**: Controller
- **Query params**: `?cycleId=1&reportType=Cycle_Summary`
- **Response**: List of generated reports

#### POST /api/reports/generate

- **Auth**: Controller
- **Body**: `{ "cycleId": 1, "reportType": "Cycle_Summary", "title": "Round 1 Summary" }`
- **Logic**: Generate report from verified assessments, store in `controller_reports`

#### GET /api/reports/{id}

- **Auth**: Controller
- **Response**: Report content

---

### 10. Audit Log

#### GET /api/audit

- **Auth**: Admin, Controller
- **Query params**: `?userId=5&actionType=GRADE&entityType=Assessment&startDate=2026-01-01&page=1`
- **Response**: Paginated audit log entries

---

## Critical Business Rules

### Assessment Rules

1. **Sequential Attempts**: Student cannot start attempt B until attempt A is completed (Passed or Not_Passed)
2. **Max 4 Attempts**: Students get exactly 4 chances (A, B, C, D)
3. **Pass Criteria**: Must pass **ALL subtasks AND ALL tasks** to pass the competency
4. **One Session Grading**: Assessor grades all tasks/subtasks in one go - no partial saves visible to student
5. **No Student Access**: Students cannot log in - they are just data entities

### Verification Rules

1. **View Only**: Verifiers can see grades but **CANNOT modify them**
2. **Add Notes Only**: Verifiers only add notes
3. **Post-Submission**: Can only verify attempts with status 'Submitted', 'Passed', or 'Not_Passed'

### Cycle Rules

1. **One Active Cycle**: Only one cycle can be `is_active = true` at a time
2. **Role Uniqueness**: A user can be assigned as Assessor OR Verifier in a cycle, not both

### Enrollment Rules

1. **No Duplicates**: One student can only be enrolled once per competency per cycle
2. **Must Have Cycle**: Cannot enroll without an active cycle

---

## Data Validation

### Input Validation Rules

- Email: Must be valid email format
- Scores: `0 <= score <= maxScore`
- Dates: `startDate < endDate` for cycles
- Attempt Letter: Must be 'A', 'B', 'C', or 'D'
- Status transitions: Validate state machine
  - 'Not_Started' → 'In_Progress' → 'Submitted' → 'Passed'/'Not_Passed'

### Error Responses

Use consistent error format:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required"],
    "score": ["Score must be between 0 and 100"]
  },
  "statusCode": 400
}
```

---

## Security Requirements

### Authentication

- JWT tokens with role claims: `["role": "Assessor", "userId": "5"]`
- Token expiry: 24 hours
- Refresh token (optional but recommended)

### Authorization

- Role-based access control on every endpoint
- Assessors can only modify their own attempts
- Verifiers read-only for grades
- Controllers have full access to analytics

### Audit Trail

- Log ALL changes to assessments in `audit_log` table
- Include: user_id, action, entity_type, entity_id, old_value, new_value, timestamp
- Log failed authentication attempts

---

## Performance Requirements

### Optimization

- Use pagination for all list endpoints (default 20 items)
- Include eager loading for related entities
- Use projections/DTOs to avoid over-fetching
- Index all foreign keys (already in schema)

### Caching

- Cache competency structures (tasks/subtasks)
- Cache active cycle info
- Use memory cache for frequent reads

---

## Testing Requirements

Build comprehensive tests:

### Unit Tests

- Service layer business logic
- Validation rules
- Score calculation logic

### Integration Tests

- Full assessment flow: create → grade → submit → verify
- Attempt sequencing (A must complete before B)
- Pass/fail calculation
- Bulk enrollment

### Test Scenarios

1. Happy path: Student passes on attempt A
2. Retry path: Student fails A, passes on B
3. Edge cases: All 4 attempts fail
4. Concurrent grading by multiple assessors
5. Verification by multiple verifiers

---

## API Response Standards

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... },
  "statusCode": 400
}
```

### Pagination Response

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8
  }
}
```

---

## Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=AssessmentDB;..."
  },
  "JWT": {
    "SecretKey": "your-secret-key-min-32-chars",
    "Issuer": "AssessmentAPI",
    "Audience": "AssessmentClient",
    "ExpiryHours": 24
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:3000"]
  },
  "Pagination": {
    "DefaultPageSize": 20,
    "MaxPageSize": 100
  }
}
```

---

## Development Priorities

### Phase 1: Foundation (Week 1)

1. Set up project structure
2. Configure EF Core with database
3. Implement authentication
4. Build user & student endpoints

### Phase 2: Core Assessment (Week 2)

5. Build competency endpoints (with full task/subtask structure)
6. Build cycle and role assignment endpoints
7. Build enrollment endpoints
8. **Build assessment attempts endpoints** (CRITICAL)

### Phase 3: Workflow (Week 3)

9. Implement grading logic with auto-calculation
10. Implement verification endpoints
11. Test complete assessment flow
12. Build analytics endpoints

### Phase 4: Polish (Week 4)

13. Build reports
14. Implement audit logging
15. Add caching
16. Performance optimization
17. Comprehensive testing

---

## Code Quality Standards

### Required Patterns

- **Repository Pattern**: `IRepository<T>`, `GenericRepository<T>`
- **Service Layer**: `IAssessmentService`, `AssessmentService`
- **DTOs**: Separate request/response models from entities
- **AutoMapper**: Entity ↔ DTO mapping
- **FluentValidation**: Input validation

### Code Structure

```
/Controllers      - API endpoints
/Services         - Business logic
/Repositories     - Data access
/Models           - Entity classes (from EF Core)
/DTOs             - Request/Response models
/Validators       - FluentValidation validators
/Middleware       - Error handling, logging
/Extensions       - Helper methods
/Data             - DbContext
```

### Naming Conventions

- Controllers: `AssessmentController`
- Services: `IAssessmentService`, `AssessmentService`
- Repositories: `IAssessmentRepository`, `AssessmentRepository`
- DTOs: `CreateAssessmentRequest`, `AssessmentResponse`

---

## Database Migration Strategy

### Initial Migration

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Seed Data

Create a `DbInitializer` class to seed:

- Default admin user
- Sample grades
- Sample competencies with tasks/subtasks (for testing)

---

## Documentation Requirements

### Swagger/OpenAPI

- All endpoints documented
- Request/response examples
- Auth requirements clearly marked
- Group by controller

### README.md

Include:

- Setup instructions
- Database migration steps
- Configuration guide
- API endpoint overview
- Testing instructions

---

## Edge Cases to Handle

1. **Concurrent Grading**: Two assessors grading same student in different competencies
2. **Cycle Transition**: What happens to in-progress assessments when cycle ends?
3. **User Deactivation**: What happens to their assessments when user is deactivated?
4. **Competency Modification**: What happens to active assessments if tasks/subtasks change?
5. **Score Overflow**: Prevent scores exceeding max scores
6. **Orphaned Attempts**: Handle attempts if enrollment is deleted
7. **Timezone Handling**: Store all dates in UTC

---

## Success Criteria

### Your backend is complete when:

- ✅ All 10 endpoint groups implemented
- ✅ Assessment flow works end-to-end (create → grade → submit → verify)
- ✅ Sequential attempt validation (A → B → C → D) works
- ✅ Auto-calculation of scores works (subtask → task → attempt)
- ✅ Pass/fail logic works (must pass ALL subtasks and tasks)
- ✅ Verification system works (read-only for grades)
- ✅ Analytics endpoints return accurate data
- ✅ Audit logging captures all changes
- ✅ All business rules enforced
- ✅ Comprehensive error handling
- ✅ Full Swagger documentation
- ✅ Unit + Integration tests pass

---

## Final Notes

This is a **production-grade system** that will be used by real schools. Focus on:

- **Data integrity** - Never allow invalid states
- **Performance** - Handle hundreds of students efficiently
- **Security** - Protect sensitive student data
- **Auditability** - Track everything for compliance
- **Reliability** - No data loss, robust error handling

The frontend is already built and waiting for these endpoints. Follow the API contracts exactly as specified to ensure seamless integration.

Good luck! 🚀
