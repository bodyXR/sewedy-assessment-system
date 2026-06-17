using AssessmentWebApi.Data;
using AssessmentWebApi.Dto_s.AuthDto_s;
using AssessmentWebApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace AssessmentWebApi.Repository.AuthRepository
{
    public class AuthRepo : IAuthRepo
    {
        private readonly AppDbContext _context;

        public AuthRepo(AppDbContext context) { _context = context; }

        // ─────────────────────────────────────────────────────────────
        // LOGIN
        // Works for engineers (null role → "Awaiting assignment"),
        // Control, and any Assessment-scoped account.
        // ─────────────────────────────────────────────────────────────
        public async Task<LoginResDto> Login(LoginReqDto request)
        {
            var account = await _context.Accounts
                .Include(a => a.Role)
                .Include(a => a.Status)
                .FirstOrDefaultAsync(a =>
                    a.Email.ToLower() == request.Email.ToLower() &&
                    (a.Role == null || a.Role.BusinessEntity == "Assessment"));

            if (account is null)
                throw new UnauthorizedAccessException("Invalid email or password.");

            if (!account.IsActive)
                throw new UnauthorizedAccessException("This account has been deactivated.");

            if (!VerifyPassword(request.Password, account.PasswordHash))
                throw new UnauthorizedAccessException("Invalid email or password.");

            var token = GenerateToken();

            await _context.Logins.AddAsync(new Login
            {
                AccountId    = account.Id,
                Email        = account.Email,
                PasswordHash = token,
                StatusId     = 1
            });
            await _context.SaveChangesAsync();

            return new LoginResDto
            {
                AccountId  = account.Id,
                FullNameEn = account.FullNameEn,
                FullNameAr = account.FullNameAr,
                Email      = account.Email,
                RoleName   = account.Role?.RoleName ?? "Awaiting role assignment",
                Token      = token
            };
        }

        // ─────────────────────────────────────────────────────────────
        // ENGINEER SIGNUP — no role assigned at registration
        // Control will assign Assessor or Verifier later
        // ─────────────────────────────────────────────────────────────
        public async Task<LoginResDto> SignupEngineer(SignupReqDto request)
        {
            await ValidateUniqueAccount(request);

            var account = new Account
            {
                NationalId   = request.NationalId,
                Email        = request.Email,
                PasswordHash = HashPassword(request.Password),
                FullNameEn   = request.FullNameEn,
                FullNameAr   = request.FullNameAr,
                Phone        = request.Phone,
                RoleId       = null,   // assigned later by Control
                StatusId     = 1,
                IsActive     = true,
                CreatedAt    = DateOnly.FromDateTime(DateTime.UtcNow)
            };

            await _context.Accounts.AddAsync(account);
            await _context.SaveChangesAsync();

            var token = GenerateToken();
            await _context.Logins.AddAsync(new Login
            {
                AccountId    = account.Id,
                Email        = account.Email,
                PasswordHash = token,
                StatusId     = 1
            });
            await _context.SaveChangesAsync();

            return new LoginResDto
            {
                AccountId  = account.Id,
                FullNameEn = account.FullNameEn,
                FullNameAr = account.FullNameAr,
                Email      = account.Email,
                RoleName   = "Awaiting role assignment",
                Token      = token
            };
        }

        // ─────────────────────────────────────────────────────────────
        // CONTROL SIGNUP — fixed role, assigned at registration
        // ─────────────────────────────────────────────────────────────
        public async Task<LoginResDto> SignupControl(SignupReqDto request)
        {
            await ValidateUniqueAccount(request);

            var role = await _context.Roles
                .FirstOrDefaultAsync(r =>
                    r.RoleName.ToLower() == "control" &&
                    r.BusinessEntity == "Assessment");

            if (role is null)
                throw new InvalidOperationException(
                    "Control role not found. Make sure a Role with RoleName='Control' " +
                    "and BusinessEntity='Assessment' exists in the database.");

            var account = new Account
            {
                NationalId   = request.NationalId,
                Email        = request.Email,
                PasswordHash = HashPassword(request.Password),
                FullNameEn   = request.FullNameEn,
                FullNameAr   = request.FullNameAr,
                Phone        = request.Phone,
                RoleId       = role.Id,
                StatusId     = 1,
                IsActive     = true,
                CreatedAt    = DateOnly.FromDateTime(DateTime.UtcNow)
            };

            await _context.Accounts.AddAsync(account);
            await _context.SaveChangesAsync();

            var token = GenerateToken();
            await _context.Logins.AddAsync(new Login
            {
                AccountId    = account.Id,
                Email        = account.Email,
                PasswordHash = token,
                StatusId     = 1
            });
            await _context.SaveChangesAsync();

            return new LoginResDto
            {
                AccountId  = account.Id,
                FullNameEn = account.FullNameEn,
                FullNameAr = account.FullNameAr,
                Email      = account.Email,
                RoleName   = role.RoleName,
                Token      = token
            };
        }

        // ─────────────────────────────────────────────────────────────
        // Helpers
        // ─────────────────────────────────────────────────────────────
        private async Task ValidateUniqueAccount(SignupReqDto request)
        {
            if (await _context.Accounts.AnyAsync(a => a.Email.ToLower() == request.Email.ToLower()))
                throw new InvalidOperationException("An account with this email already exists.");

            if (await _context.Accounts.AnyAsync(a => a.NationalId == request.NationalId))
                throw new InvalidOperationException("An account with this national ID already exists.");
        }

        private static string HashPassword(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
            return Convert.ToHexString(bytes).ToLower();
        }

        private static bool VerifyPassword(string plainText, string storedHash)
            => string.Equals(HashPassword(plainText), storedHash, StringComparison.OrdinalIgnoreCase);

        private static string GenerateToken()
            => Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLower();
    }
}
