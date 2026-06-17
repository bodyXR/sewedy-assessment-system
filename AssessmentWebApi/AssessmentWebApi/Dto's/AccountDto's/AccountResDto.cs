namespace AssessmentWebApi.Dto_s.AccountDto_s
{
    public class AccountResDto
    {
        public long Id { get; set; }

        public string NationalId { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string? Phone { get; set; }

        public string FullNameEn { get; set; } = null!;

        public string FullNameAr { get; set; } = null!;

        public string? Status { get; set; }
    }
}
