namespace AssessmentWebApi.Dto_s.CourseRoundInstructorDto_s
{
    public class CourseRoundInstructorRequestDto
    {
        public long CourseRoundId { get; set; }
        public long AccountId { get; set; }

        /// <summary>
        /// Role ID for this assignment — must be an Assessment role
        /// (Assessor or Verifier with BusinessEntity = 'Assessment').
        /// </summary>
        public long RoleId { get; set; }
    }

    public class UpdateRoleDto
    {
        /// <summary>New role ID — must be an Assessment role (Assessor or Verifier).</summary>
        public long RoleId { get; set; }
    }
}
