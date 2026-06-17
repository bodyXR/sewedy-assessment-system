namespace AssessmentWebApi.Dto_s.CourseRoundAssignmentDto_s
{
    /// <summary>Assessment task-assignment response DTO.</summary>
    public class CourseRoundAssignmentResDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? AssignmentLink { get; set; }
        public DateTime Deadline { get; set; }
        public decimal TotalGrade { get; set; }
        public DateTime CreatedAt { get; set; }

        /// <summary>Competency (Course) this assignment belongs to.</summary>
        public long CourseId { get; set; }
        public string? CourseName { get; set; }

        public long InstructorId { get; set; }
        public string? InstructorName { get; set; }

        public long? CourseMaterialId { get; set; }
        public string? TaskTitle { get; set; }

        public long? StatusId { get; set; }
        public string? StatusName { get; set; }
    }

    /// <summary>Request body for creating an assignment.</summary>
    public class CourseRoundAssignmentReqDto
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? AssignmentLink { get; set; }
        public DateTime Deadline { get; set; }
        public decimal TotalGrade { get; set; }

        /// <summary>Competency (Course) this assignment belongs to.</summary>
        public long CourseId { get; set; }

        /// <summary>Assessor account ID.</summary>
        public long InstructorId { get; set; }

        /// <summary>Optional: link to a CourseMaterial (task) for this assignment.</summary>
        public long? CourseMaterialId { get; set; }
    }

    /// <summary>Request body for updating an assignment.</summary>
    public class CourseRoundAssignmentUpdateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? AssignmentLink { get; set; }
        public DateTime? Deadline { get; set; }
        public decimal? TotalGrade { get; set; }
        public long? StatusId { get; set; }
        public long? CourseMaterialId { get; set; }
    }
}
