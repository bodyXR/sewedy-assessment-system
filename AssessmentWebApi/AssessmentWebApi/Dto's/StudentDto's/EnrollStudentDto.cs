namespace AssessmentWebApi.Dto_s.StudentDto_s
{
    /// <summary>
    /// Request body for enrolling one or more students into a competency (Course).
    /// The system will create pending submission placeholders for every task
    /// (CourseRoundAssignment) belonging to that course.
    /// </summary>
    public class EnrollStudentReqDto
    {
        /// <summary>
        /// The Course ID representing the competency to enroll into.
        /// </summary>
        public long CourseId { get; set; }

        /// <summary>One or more student account IDs to enroll.</summary>
        public List<long> StudentIds { get; set; } = new();
    }

    /// <summary>
    /// Response returned after an enrollment operation.
    /// </summary>
    public class EnrollStudentResDto
    {
        public long CourseId { get; set; }
        public string CompetencyName { get; set; } = null!;

        /// <summary>Students successfully enrolled in this operation.</summary>
        public List<EnrolledStudentSummary> Enrolled { get; set; } = new();

        /// <summary>Students skipped because they were already enrolled.</summary>
        public List<EnrolledStudentSummary> AlreadyEnrolled { get; set; } = new();

        /// <summary>Student IDs that were not found or are not students.</summary>
        public List<long> NotFound { get; set; } = new();
    }

    public class EnrolledStudentSummary
    {
        public long StudentId { get; set; }
        public string FullNameEn { get; set; } = null!;
        public string FullNameAr { get; set; } = null!;

        /// <summary>Number of task submission placeholders created for this student.</summary>
        public int TasksAssigned { get; set; }
    }
}
