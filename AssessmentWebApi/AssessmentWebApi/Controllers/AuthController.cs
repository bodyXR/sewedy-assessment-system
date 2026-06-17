using AssessmentWebApi.Dto_s.AuthDto_s;
using AssessmentWebApi.Repository.AuthRepository;
using Microsoft.AspNetCore.Mvc;

namespace AssessmentWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepo _repo;
        public AuthController(IAuthRepo repo) { _repo = repo; }

        // ─────────────────────────────────────────────────────────────
        // POST /api/auth/login
        // Works for engineers (awaiting role) and Control.
        // Body: { "email": "...", "password": "..." }
        // ─────────────────────────────────────────────────────────────
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginReqDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Email and password are required." });

            try
            {
                var result = await _repo.Login(request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        // ─────────────────────────────────────────────────────────────
        // POST /api/auth/signup/engineer
        // Registers an engineer with no role assigned.
        // Control will assign Assessor or Verifier later.
        // Body: { "nationalId", "email", "password", "fullNameEn", "fullNameAr", "phone" }
        // ─────────────────────────────────────────────────────────────
        [HttpPost("signup/engineer")]
        public async Task<IActionResult> SignupEngineer([FromBody] SignupReqDto request)
        {
            if (!IsValidSignup(request, out var error))
                return BadRequest(new { message = error });

            try
            {
                var result = await _repo.SignupEngineer(request);
                return StatusCode(201, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ─────────────────────────────────────────────────────────────
        // POST /api/auth/signup/control
        // Registers a Control account with the Control role pre-assigned.
        // Body: { "nationalId", "email", "password", "fullNameEn", "fullNameAr", "phone" }
        // ─────────────────────────────────────────────────────────────
        [HttpPost("signup/control")]
        public async Task<IActionResult> SignupControl([FromBody] SignupReqDto request)
        {
            if (!IsValidSignup(request, out var error))
                return BadRequest(new { message = error });

            try
            {
                var result = await _repo.SignupControl(request);
                return StatusCode(201, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ─────────────────────────────────────────────────────────────
        // Shared validation
        // ─────────────────────────────────────────────────────────────
        private static bool IsValidSignup(SignupReqDto request, out string error)
        {
            if (string.IsNullOrWhiteSpace(request.NationalId) ||
                string.IsNullOrWhiteSpace(request.Email)      ||
                string.IsNullOrWhiteSpace(request.Password)   ||
                string.IsNullOrWhiteSpace(request.FullNameEn) ||
                string.IsNullOrWhiteSpace(request.FullNameAr))
            {
                error = "NationalId, Email, Password, FullNameEn, and FullNameAr are required.";
                return false;
            }
            error = string.Empty;
            return true;
        }
    }
}
