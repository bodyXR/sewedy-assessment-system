# Using Existing Models for Assessments

## ✅ Great News!

The backend already has models that can be used for assessments:

- **CourseRoundAssignment** - The tasks/assignments
- **CourseRoundAssignmentSubmission** - Student submissions with grades

---

## 📋 Existing Models Analysis

### CourseRoundAssignment (The Task/Assignment)

```csharp
public partial class CourseRoundAssignment
{
    public long Id { get; set; }
    public string Title { get; set; }                    // Task name
    public string? Description { get; set; }             // Task description
    public string? AssignmentLink { get; set; }          // Link to materials
    public DateTime Deadline { get; set; }               // Due date
    public decimal TotalGrade { get; set; }              // Max points
    public long CourseId { get; set; }                   // Course/Competency
    public long InstructorId { get; set; }               // Assessor
    public long? CourseMaterialId { get; set; }          // Related material
    public long? StatusId { get; set; }                  // Status
    public DateTime CreatedAt { get; set; }

    // Navigation
    public virtual ICollection<CourseRoundAssignmentSubmission> CourseRoundAssignmentSubmissions { get; set; }
}
```

### CourseRoundAssignmentSubmission (The Assessment/Grade)

```csharp
public partial class CourseRoundAssignmentSubmission
{
    public long Id { get; set; }
    public long AssignmentId { get; set; }              // Task ID
    public long StudentId { get; set; }                 // Student
    public string SubmissionLink { get; set; }          // Submission URL
    public DateTime SubmittedAt { get; set; }           // Submission date
    public decimal? Grade { get; set; }                 // Points earned
    public string? Feedback { get; set; }               // Assessor notes
    public long? StatusId { get; set; }                 // Status

    // Navigation
    public virtual CourseRoundAssignment Assignment { get; set; }
    public virtual Account Student { get; set; }
}
```

---

## 🎯 How to Map to Frontend Needs

### Current Frontend Expects:

```typescript
Assessment {
  id: number;
  studentId: number;
  assessorId: number;
  courseRoundId: number;
  status: string; // "Draft", "Submitted", "Verified"
  totalScore: number;
  maxScore: number;
  tasks: AssessmentTask[];
  notes: string;
  submittedAt: string;
  verifiedAt: string;
  verifierId: number;
}
```

### Mapping Strategy:

#### Option 1: Use Existing Models Directly

**CourseRoundAssignmentSubmission** = **Assessment**

Map like this:

- `Id` → `id`
- `StudentId` → `studentId`
- `Assignment.InstructorId` → `assessorId`
- `Grade` → `totalScore`
- `Assignment.TotalGrade` → `maxScore`
- `Feedback` → `notes`
- `SubmittedAt` → `submittedAt`
- `Status` → map status (need to check Status table)

#### Option 2: Create View/DTO

Create a DTO that combines both models for frontend:

```csharp
public class AssessmentDto
{
    public long Id { get; set; }
    public long StudentId { get; set; }
    public long AssessorId { get; set; }
    public long CourseRoundId { get; set; }
    public string Status { get; set; }
    public decimal TotalScore { get; set; }
    public decimal MaxScore { get; set; }
    public string Notes { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public long? VerifierId { get; set; }

    // Task info
    public string TaskTitle { get; set; }
    public string TaskDescription { get; set; }
}
```

---

## 🔧 Required Controller Implementation

### Create CourseRoundAssignmentSubmissionsController

```csharp
[ApiController]
[Route("api/submissions")]
public class CourseRoundAssignmentSubmissionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CourseRoundAssignmentSubmissionsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/submissions
    // Get all submissions (assessments)
    [HttpGet]
    public async Task<IActionResult> GetAllSubmissions()
    {
        var submissions = await _context.CourseRoundAssignmentSubmissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .Include(s => s.Status)
            .ToListAsync();

        var result = submissions.Select(MapToDto);
        return Ok(result);
    }

    // GET: api/submissions/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSubmissionById(long id)
    {
        var submission = await _context.CourseRoundAssignmentSubmissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .Include(s => s.Status)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (submission == null)
            return NotFound();

        return Ok(MapToDto(submission));
    }

    // GET: api/submissions/student/{studentId}
    [HttpGet("student/{studentId}")]
    public async Task<IActionResult> GetByStudent(long studentId)
    {
        var submissions = await _context.CourseRoundAssignmentSubmissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .Include(s => s.Status)
            .Where(s => s.StudentId == studentId)
            .ToListAsync();

        var result = submissions.Select(MapToDto);
        return Ok(result);
    }

    // GET: api/submissions/assessor/{assessorId}
    [HttpGet("assessor/{assessorId}")]
    public async Task<IActionResult> GetByAssessor(long assessorId)
    {
        var submissions = await _context.CourseRoundAssignmentSubmissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .Include(s => s.Status)
            .Where(s => s.Assignment.InstructorId == assessorId)
            .ToListAsync();

        var result = submissions.Select(MapToDto);
        return Ok(result);
    }

    // PUT: api/submissions/{id}/grade
    // Grade a submission
    [HttpPost("{id}/grade")]
    public async Task<IActionResult> GradeSubmission(long id, [FromBody] GradeSubmissionRequest request)
    {
        var submission = await _context.CourseRoundAssignmentSubmissions
            .Include(s => s.Assignment)
            .FindAsync(id);

        if (submission == null)
            return NotFound();

        submission.Grade = request.Grade;
        submission.Feedback = request.Feedback;
        submission.StatusId = request.StatusId; // Update to "graded" status

        await _context.SaveChangesAsync();

        return Ok(MapToDto(submission));
    }

    // POST: api/submissions/{id}/verify
    // Verify a graded submission
    [HttpPost("{id}/verify")]
    public async Task<IActionResult> VerifySubmission(long id, [FromBody] VerifySubmissionRequest request)
    {
        var submission = await _context.CourseRoundAssignmentSubmissions
            .Include(s => s.Assignment)
            .FindAsync(id);

        if (submission == null)
            return NotFound();

        // Update status to "verified"
        submission.StatusId = request.VerifiedStatusId;
        // Could add a verifier field if needed

        await _context.SaveChangesAsync();

        return Ok(MapToDto(submission));
    }

    // Helper method to map to DTO
    private AssessmentDto MapToDto(CourseRoundAssignmentSubmission submission)
    {
        return new AssessmentDto
        {
            Id = submission.Id,
            StudentId = submission.StudentId,
            AssessorId = submission.Assignment.InstructorId,
            CourseRoundId = submission.Assignment.CourseId,
            Status = submission.Status?.StatusName ?? "Unknown",
            TotalScore = submission.Grade ?? 0,
            MaxScore = submission.Assignment.TotalGrade,
            Notes = submission.Feedback ?? string.Empty,
            SubmittedAt = submission.SubmittedAt,
            TaskTitle = submission.Assignment.Title,
            TaskDescription = submission.Assignment.Description ?? string.Empty
        };
    }
}

// Request DTOs
public class GradeSubmissionRequest
{
    public decimal Grade { get; set; }
    public string? Feedback { get; set; }
    public long StatusId { get; set; }
}

public class VerifySubmissionRequest
{
    public long VerifiedStatusId { get; set; }
    public long VerifierId { get; set; }
}

// Response DTO
public class AssessmentDto
{
    public long Id { get; set; }
    public long StudentId { get; set; }
    public long AssessorId { get; set; }
    public long CourseRoundId { get; set; }
    public string Status { get; set; }
    public decimal TotalScore { get; set; }
    public decimal MaxScore { get; set; }
    public string Notes { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public long? VerifierId { get; set; }
    public string TaskTitle { get; set; }
    public string TaskDescription { get; set; }
}
```

---

## 📝 Status Management

Need to check the Status table for appropriate status IDs:

- Draft status ID (for new submissions)
- Submitted status ID (when student submits)
- Graded status ID (when assessor grades)
- Verified status ID (when verifier reviews)

Query to check:

```sql
SELECT * FROM Status
```

---

## 🔄 Frontend API Client Update

Update the API client to use the new endpoint:

```typescript
// Change from:
const API_BASE_URL = "https://assessmentproject.runasp.net/api/assessments";

// To:
const API_BASE_URL = "https://assessmentproject.runasp.net/api/submissions";
```

Or create aliases:

```typescript
export const assessmentsApi = {
  getAll: () => apiRequest("/submissions"),
  getById: (id) => apiRequest(`/submissions/${id}`),
  getByStudent: (studentId) => apiRequest(`/submissions/student/${studentId}`),
  getByAssessor: (assessorId) =>
    apiRequest(`/submissions/assessor/${assessorId}`),
  grade: (id, data) =>
    apiRequest(`/submissions/${id}/grade`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  verify: (id, data) =>
    apiRequest(`/submissions/${id}/verify`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
```

---

## ✅ Advantages of Using Existing Models

1. **No new database tables needed** ✅
2. **Models already exist** ✅
3. **Relationships already defined** ✅
4. **Less backend work** ✅
5. **Faster implementation** ✅

---

## ⚠️ Limitations

1. **No task breakdown** - Single grade per submission
   - Frontend expects tasks with subtasks
   - This model has one grade per submission
   - **Solution:** Either simplify frontend OR add grade breakdown

2. **Status management** - Need to check Status table
   - Frontend uses string statuses ("Draft", "Submitted", "Verified")
   - Backend uses StatusId (foreign key)
   - **Solution:** Map status IDs to names in DTO

---

## 🎯 Recommended Approach

### Quick Solution (1-2 hours):

1. Create `CourseRoundAssignmentSubmissionsController`
2. Add the endpoints above
3. Map to simple DTO (single grade, no task breakdown)
4. Update frontend to work with simplified structure

### Complete Solution (4-6 hours):

1. Add task breakdown fields to submission or create related table
2. Support multiple tasks per assessment
3. Keep task/subtask structure frontend expects

---

## 📞 Next Steps

### For Backend Team:

1. **Check Status table** to get status IDs:

```sql
SELECT Id, StatusName FROM Status
```

2. **Create controller** using code above

3. **Test endpoints** with Postman

4. **Notify frontend** when ready

### For Frontend Team:

1. Wait for confirmation on approach (simple vs complete)
2. May need to adjust data structure expectations
3. Update API client endpoint URLs
4. Test integration

---

## 🚀 Implementation Time

- **Using existing models:** 1-2 hours
- **Controller creation:** 1 hour
- **Testing:** 30 minutes
- **Frontend adjustments:** 1 hour
- **Total:** 2-3 hours (much faster than creating new models!)

---

**Recommendation:** Use existing `CourseRoundAssignmentSubmission` model with a controller to expose it as assessment endpoints. This is the fastest path to a working system!
