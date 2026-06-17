namespace AssessmentWebApi.Dto_s.StudentDto_s
{
    /// <summary>
    /// Full student response DTO — returned by all student endpoints.
    /// </summary>
    public class StudentResDto
    {
        public long Id { get; set; }

        public string NationalId { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string? Phone { get; set; }

        public string FullNameEn { get; set; } = null!;

        public string FullNameAr { get; set; } = null!;

        /// <summary>Account status name (e.g. "Active", "Passed", "Not Passed").</summary>
        public string? Status { get; set; }

        /// <summary>Class the student belongs to (from StudentExtension → TblClass).</summary>
        public string? ClassName { get; set; }

        /// <summary>Class ID from StudentExtension.</summary>
        public long? ClassId { get; set; }

        /// <summary>Whether the student is a team leader.</summary>
        public bool? IsLeader { get; set; }

        public bool IsActive { get; set; }

        public DateOnly? CreatedAt { get; set; }

        /// <summary>
        /// Competencies (Courses) the student is enrolled in.
        /// Each entry represents one assessment cycle (CourseRound) the student has a submission in.
        /// </summary>
        public List<StudentCompetencyDto> Competencies { get; set; } = new();
    }

    /// <summary>
    /// Represents a competency (Course) a student is enrolled in.
    /// </summary>
    public class StudentCompetencyDto
    {
        /// <summary>Course ID — the competency identifier.</summary>
        public long CourseId { get; set; }

        /// <summary>Course title — the competency name.</summary>
        public string CompetencyName { get; set; } = null!;
    }
}
