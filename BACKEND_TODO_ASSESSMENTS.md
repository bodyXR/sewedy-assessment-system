# Backend TODO: Implement Assessments Endpoints

## 🎯 Priority: CRITICAL

The frontend is ready and waiting for these endpoints. Once implemented, the verifier pages (and assessor pages) will work immediately.

---

## 📋 Required Endpoints

### 1. Get All Assessments

```csharp
[HttpGet]
public async Task<IActionResult> GetAllAssessments()
{
    var assessments = await _context.Assessments
        .Include(a => a.Tasks)
        .ThenInclude(t => t.SubTasks)
        .ToListAsync();

    return Ok(assessments);
}
```

### 2. Get Assessment by ID

```csharp
[HttpGet("{id}")]
public async Task<IActionResult> GetAssessmentById(long id)
{
    var assessment = await _context.Assessments
        .Include(a => a.Tasks)
        .ThenInclude(t => t.SubTasks)
        .FirstOrDefaultAsync(a => a.Id == id);

    if (assessment == null)
        return NotFound(new { message = $"Assessment {id} not found" });

    return Ok(assessment);
}
```

### 3. Get Assessments by Student

```csharp
[HttpGet("student/{studentId}")]
public async Task<IActionResult> GetByStudent(long studentId)
{
    var assessments = await _context.Assessments
        .Where(a => a.StudentId == studentId)
        .Include(a => a.Tasks)
        .ThenInclude(t => t.SubTasks)
        .ToListAsync();

    return Ok(assessments);
}
```

### 4. Get Assessments by Assessor

```csharp
[HttpGet("assessor/{assessorId}")]
public async Task<IActionResult> GetByAssessor(long assessorId)
{
    var assessments = await _context.Assessments
        .Where(a => a.AssessorId == assessorId)
        .Include(a => a.Tasks)
        .ThenInclude(t => t.SubTasks)
        .ToListAsync();

    return Ok(assessments);
}
```

### 5. Get Assessments by Course Round

```csharp
[HttpGet("courseround/{courseRoundId}")]
public async Task<IActionResult> GetByCourseRound(long courseRoundId)
{
    var assessments = await _context.Assessments
        .Where(a => a.CourseRoundId == courseRoundId)
        .Include(a => a.Tasks)
        .ThenInclude(t => t.SubTasks)
        .ToListAsync();

    return Ok(assessments);
}
```

### 6. Create Assessment

```csharp
[HttpPost]
public async Task<IActionResult> CreateAssessment([FromBody] CreateAssessmentRequest request)
{
    var assessment = new Assessment
    {
        StudentId = request.StudentId,
        AssessorId = request.AssessorId,
        CourseRoundId = request.CourseRoundId,
        Status = "Draft",
        TotalScore = 0,
        MaxScore = request.Tasks.Sum(t => t.SubTasks.Sum(st => st.MaxPoints)),
        Notes = request.Notes,
        CreatedAt = DateTime.UtcNow,
        Tasks = request.Tasks.Select(t => new AssessmentTask
        {
            TaskId = t.TaskId,
            TaskTitle = t.TaskTitle,
            MaxPoints = t.SubTasks.Sum(st => st.MaxPoints),
            SubTasks = t.SubTasks.Select(st => new AssessmentSubTask
            {
                SubTaskId = st.SubTaskId,
                SubTaskTitle = st.SubTaskTitle,
                PointsEarned = st.PointsEarned,
                MaxPoints = st.MaxPoints,
                Notes = st.Notes
            }).ToList()
        }).ToList()
    };

    // Calculate total score
    assessment.TotalScore = assessment.Tasks.Sum(t => t.SubTasks.Sum(st => st.PointsEarned));

    _context.Assessments.Add(assessment);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(GetAssessmentById), new { id = assessment.Id }, assessment);
}
```

### 7. Update Assessment

```csharp
[HttpPut("{id}")]
public async Task<IActionResult> UpdateAssessment(long id, [FromBody] UpdateAssessmentRequest request)
{
    var assessment = await _context.Assessments
        .Include(a => a.Tasks)
        .ThenInclude(t => t.SubTasks)
        .FirstOrDefaultAsync(a => a.Id == id);

    if (assessment == null)
        return NotFound();

    // Update assessment data
    assessment.Notes = request.Notes;

    // Update tasks and subtasks
    // ... (update logic)

    // Recalculate total score
    assessment.TotalScore = assessment.Tasks.Sum(t => t.SubTasks.Sum(st => st.PointsEarned));

    await _context.SaveChangesAsync();

    return Ok(assessment);
}
```

### 8. Submit Assessment

```csharp
[HttpPost("{id}/submit")]
public async Task<IActionResult> SubmitAssessment(long id)
{
    var assessment = await _context.Assessments.FindAsync(id);

    if (assessment == null)
        return NotFound();

    if (assessment.Status != "Draft")
        return BadRequest(new { message = "Only draft assessments can be submitted" });

    assessment.Status = "Submitted";
    assessment.SubmittedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    return Ok(assessment);
}
```

### 9. Verify Assessment

```csharp
[HttpPost("{id}/verify")]
public async Task<IActionResult> VerifyAssessment(long id, [FromBody] VerifyAssessmentRequest request)
{
    var assessment = await _context.Assessments.FindAsync(id);

    if (assessment == null)
        return NotFound();

    if (assessment.Status != "Submitted")
        return BadRequest(new { message = "Only submitted assessments can be verified" });

    assessment.Status = "Verified";
    assessment.VerifiedAt = DateTime.UtcNow;
    assessment.VerifierId = request.VerifierId;

    await _context.SaveChangesAsync();

    return Ok(assessment);
}
```

### 10. Delete Assessment

```csharp
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteAssessment(long id)
{
    var assessment = await _context.Assessments.FindAsync(id);

    if (assessment == null)
        return NotFound();

    _context.Assessments.Remove(assessment);
    await _context.SaveChangesAsync();

    return NoContent();
}
```

---

## 📦 Required Models

### Assessment Model

```csharp
public class Assessment
{
    public long Id { get; set; }
    public long StudentId { get; set; }
    public long AssessorId { get; set; }
    public long CourseRoundId { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Draft"; // "Draft", "Submitted", "Verified"

    public decimal TotalScore { get; set; }
    public decimal MaxScore { get; set; }
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public long? VerifierId { get; set; }

    // Navigation properties
    public virtual ICollection<AssessmentTask> Tasks { get; set; } = new List<AssessmentTask>();
}
```

### AssessmentTask Model

```csharp
public class AssessmentTask
{
    public long Id { get; set; }
    public long AssessmentId { get; set; }
    public long TaskId { get; set; }

    [Required]
    public string TaskTitle { get; set; } = string.Empty;

    public decimal TotalPoints { get; set; }
    public decimal MaxPoints { get; set; }

    // Navigation properties
    public virtual Assessment Assessment { get; set; } = null!;
    public virtual ICollection<AssessmentSubTask> SubTasks { get; set; } = new List<AssessmentSubTask>();
}
```

### AssessmentSubTask Model

```csharp
public class AssessmentSubTask
{
    public long Id { get; set; }
    public long AssessmentTaskId { get; set; }
    public long SubTaskId { get; set; }

    [Required]
    public string SubTaskTitle { get; set; } = string.Empty;

    public decimal PointsEarned { get; set; }
    public decimal MaxPoints { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public virtual AssessmentTask AssessmentTask { get; set; } = null!;
}
```

---

## 📝 Request DTOs

### CreateAssessmentRequest

```csharp
public class CreateAssessmentRequest
{
    public long StudentId { get; set; }
    public long AssessorId { get; set; }
    public long CourseRoundId { get; set; }
    public string? Notes { get; set; }
    public List<TaskRequest> Tasks { get; set; } = new();
}

public class TaskRequest
{
    public long TaskId { get; set; }
    public string TaskTitle { get; set; } = string.Empty;
    public List<SubTaskRequest> SubTasks { get; set; } = new();
}

public class SubTaskRequest
{
    public long SubTaskId { get; set; }
    public string SubTaskTitle { get; set; } = string.Empty;
    public decimal PointsEarned { get; set; }
    public decimal MaxPoints { get; set; }
    public string? Notes { get; set; }
}
```

### VerifyAssessmentRequest

```csharp
public class VerifyAssessmentRequest
{
    public long VerifierId { get; set; }
}
```

---

## 🗄️ Database Migration

```csharp
public partial class AddAssessments : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Assessments",
            columns: table => new
            {
                Id = table.Column<long>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                StudentId = table.Column<long>(nullable: false),
                AssessorId = table.Column<long>(nullable: false),
                CourseRoundId = table.Column<long>(nullable: false),
                Status = table.Column<string>(maxLength: 50, nullable: false),
                TotalScore = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                MaxScore = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                Notes = table.Column<string>(nullable: true),
                CreatedAt = table.Column<DateTime>(nullable: false),
                SubmittedAt = table.Column<DateTime>(nullable: true),
                VerifiedAt = table.Column<DateTime>(nullable: true),
                VerifierId = table.Column<long>(nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Assessments", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "AssessmentTasks",
            columns: table => new
            {
                Id = table.Column<long>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                AssessmentId = table.Column<long>(nullable: false),
                TaskId = table.Column<long>(nullable: false),
                TaskTitle = table.Column<string>(nullable: false),
                TotalPoints = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                MaxPoints = table.Column<decimal>(type: "decimal(5,2)", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AssessmentTasks", x => x.Id);
                table.ForeignKey(
                    name: "FK_AssessmentTasks_Assessments_AssessmentId",
                    column: x => x.AssessmentId,
                    principalTable: "Assessments",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "AssessmentSubTasks",
            columns: table => new
            {
                Id = table.Column<long>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                AssessmentTaskId = table.Column<long>(nullable: false),
                SubTaskId = table.Column<long>(nullable: false),
                SubTaskTitle = table.Column<string>(nullable: false),
                PointsEarned = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                MaxPoints = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                Notes = table.Column<string>(nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AssessmentSubTasks", x => x.Id);
                table.ForeignKey(
                    name: "FK_AssessmentSubTasks_AssessmentTasks_AssessmentTaskId",
                    column: x => x.AssessmentTaskId,
                    principalTable: "AssessmentTasks",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_AssessmentTasks_AssessmentId",
            table: "AssessmentTasks",
            column: "AssessmentId");

        migrationBuilder.CreateIndex(
            name: "IX_AssessmentSubTasks_AssessmentTaskId",
            table: "AssessmentSubTasks",
            column: "AssessmentTaskId");

        migrationBuilder.CreateIndex(
            name: "IX_Assessments_StudentId",
            table: "Assessments",
            column: "StudentId");

        migrationBuilder.CreateIndex(
            name: "IX_Assessments_AssessorId",
            table: "Assessments",
            column: "AssessorId");

        migrationBuilder.CreateIndex(
            name: "IX_Assessments_CourseRoundId",
            table: "Assessments",
            column: "CourseRoundId");
    }
}
```

---

## ✅ Testing Checklist

Once implemented, test with these requests:

### 1. Get All Assessments

```bash
GET https://assessmentproject.runasp.net/api/assessments
```

### 2. Get Assessment by ID

```bash
GET https://assessmentproject.runasp.net/api/assessments/1
```

### 3. Create Assessment

```bash
POST https://assessmentproject.runasp.net/api/assessments
Content-Type: application/json

{
  "studentId": 6,
  "assessorId": 1,
  "courseRoundId": 1,
  "notes": "Test assessment",
  "tasks": [
    {
      "taskId": 1,
      "taskTitle": "Task 1",
      "subTasks": [
        {
          "subTaskId": 1,
          "subTaskTitle": "SubTask 1",
          "pointsEarned": 80,
          "maxPoints": 100,
          "notes": "Good work"
        }
      ]
    }
  ]
}
```

### 4. Submit Assessment

```bash
POST https://assessmentproject.runasp.net/api/assessments/1/submit
```

### 5. Verify Assessment

```bash
POST https://assessmentproject.runasp.net/api/assessments/1/verify
Content-Type: application/json

{
  "verifierId": 2
}
```

---

## 📞 When Complete

1. Test all endpoints with Postman
2. Verify CORS is enabled
3. Notify frontend team
4. Frontend will test immediately

---

**Estimated Implementation Time:** 4-6 hours  
**Priority:** CRITICAL  
**Impact:** Unblocks 6 frontend pages (37.5% of platform)

Once these endpoints are live, the frontend pages will work immediately!
