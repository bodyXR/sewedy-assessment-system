namespace AssessmentWebApi.Dto_s.AuthDto_s
{
    public class SignupReqDto
    {
        public string NationalId { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string FullNameEn { get; set; } = null!;
        public string FullNameAr { get; set; } = null!;
        public string? Phone { get; set; }
    }
}
