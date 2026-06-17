namespace AssessmentWebApi.Dto_s.CourseRoundInstructorDto_s
{
    public class CourseRoundInstructorResponseDto
    {
        public long Id { get; set; }
        public long CourseRoundId { get; set; }
        public long AccountId { get; set; }
        public string InstructorName { get; set; } = string.Empty;
        public string InstructorEmail { get; set; } = string.Empty;

        /// <summary>Role assigned for this cycle (Assessor / Verifier).</summary>
        public long? RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string? RoleBusinessEntity { get; set; }

        public DateTime? AssignedAt { get; set; }
    }
}
