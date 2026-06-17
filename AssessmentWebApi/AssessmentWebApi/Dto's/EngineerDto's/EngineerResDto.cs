namespace AssessmentWebApi.Dto_s.EngineerDto_s
{
    public class EngineerResDto
    {
        public long Id { get; set; }
        public string NationalId { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public string FullNameEn { get; set; } = null!;
        public string FullNameAr { get; set; } = null!;
        public string? Status { get; set; }
        /// <summary>
        /// Null when role has not been assigned yet by Control.
        /// "Assessor" or "Verifier" once assigned via CourseRoundInstructor.
        /// </summary>
        public string? RoleName { get; set; }
        public bool IsActive { get; set; }
        public DateOnly? CreatedAt { get; set; }
    }
}
