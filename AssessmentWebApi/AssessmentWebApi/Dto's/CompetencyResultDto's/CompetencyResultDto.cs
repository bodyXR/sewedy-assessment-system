namespace AssessmentWebApi.Dto_s.CompetencyResultDto_s
{
    /// <summary>Response DTO for a competency result record.</summary>
    public class CompetencyResultResDto
    {
        public long Id { get; set; }

        public long StudentId { get; set; }
        public string? StudentName { get; set; }

        public long CourseId { get; set; }
        public string? CourseName { get; set; }

        public long CourseRoundId { get; set; }
        public decimal? RoundNumber { get; set; }

        public decimal? TotalScore { get; set; }
        public decimal? MaxScore { get; set; }

        /// <summary>Percentage score (TotalScore / MaxScore * 100). Null if scores not set.</summary>
        public decimal? ScorePercentage { get; set; }

        public long ResultStatusId { get; set; }
        public string? ResultStatusName { get; set; }

        public long AssessorId { get; set; }
        public string? AssessorName { get; set; }

        public string? Notes { get; set; }
        public DateTime GradedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>Request body for creating a competency result.</summary>
    public class CompetencyResultReqDto
    {
        public long StudentId { get; set; }
        public long CourseId { get; set; }
        public long CourseRoundId { get; set; }

        /// <summary>
        /// Optional — if omitted the system auto-calculates from submissions.
        /// If provided, overrides the auto-calculation.
        /// </summary>
        public decimal? TotalScore { get; set; }
        public decimal? MaxScore { get; set; }

        /// <summary>Pass / Not Pass status ID.</summary>
        public long ResultStatusId { get; set; }

        public long AssessorId { get; set; }
        public string? Notes { get; set; }
        public DateTime? GradedAt { get; set; }
    }

    /// <summary>Request body for updating a competency result (all fields optional).</summary>
    public class CompetencyResultUpdateDto
    {
        public decimal? TotalScore { get; set; }
        public decimal? MaxScore { get; set; }
        public long? ResultStatusId { get; set; }
        public string? Notes { get; set; }
        public DateTime? GradedAt { get; set; }
    }
}
