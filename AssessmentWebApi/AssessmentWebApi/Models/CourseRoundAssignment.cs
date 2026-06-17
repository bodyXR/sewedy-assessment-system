using System;
using System.Collections.Generic;

namespace AssessmentWebApi.Models;

public partial class CourseRoundAssignment
{
    public long Id { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string? AssignmentLink { get; set; }

    public DateTime Deadline { get; set; }

    public decimal TotalGrade { get; set; }

    public long CourseId { get; set; }

    public long InstructorId { get; set; }

    public long? CourseMaterialId { get; set; }

    public long? StatusId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual CourseMaterial? CourseMaterial { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual ICollection<CourseRoundAssignmentSubmission> CourseRoundAssignmentSubmissions { get; set; } = new List<CourseRoundAssignmentSubmission>();

    public virtual Account Instructor { get; set; } = null!;

    public virtual Status? Status { get; set; }
}
