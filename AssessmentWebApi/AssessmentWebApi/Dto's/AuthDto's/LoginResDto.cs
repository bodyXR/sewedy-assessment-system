namespace AssessmentWebApi.Dto_s.AuthDto_s
{
    public class LoginResDto
    {
        public long AccountId { get; set; }
        public string FullNameEn { get; set; } = null!;
        public string FullNameAr { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string RoleName { get; set; } = null!;

        /// <summary>
        /// Session token stored in the Login table.
        /// Pass this in the Authorization header for subsequent requests.
        /// </summary>
        public string Token { get; set; } = null!;
    }
}
