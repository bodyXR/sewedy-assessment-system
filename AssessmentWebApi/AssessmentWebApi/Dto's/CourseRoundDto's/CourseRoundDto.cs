namespace AssessmentWebApi.Dto_s.CourseRoundDto_s
{
    /// <summary>Assessment (trial period) response DTO.</summary>
    public class CourseRoundResDto
    {
        public long Id { get; set; }
        public long CourseId { get; set; }
        public string? CompetencyName { get; set; }
        public decimal? RoundNumber { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public long? MaxStudents { get; set; }
        public long? MinStudents { get; set; }
        public long StatusId { get; set; }
        public string? StatusName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>Request body for creating an assessment.</summary>
    public class CourseRoundReqDto
    {
        /// <summary>The competency (Course) this assessment belongs to.</summary>
        public long CourseId { get; set; }
        public decimal? RoundNumber { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public long? MaxStudents { get; set; }
        public long? MinStudents { get; set; }
        public long StatusId { get; set; }
    }

    /// <summary>Request body for updating an assessment (all fields optional).</summary>
    public class CourseRoundUpdateDto
    {
        public decimal? RoundNumber { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public long? MaxStudents { get; set; }
        public long? MinStudents { get; set; }
        public long? StatusId { get; set; }
    }
}
