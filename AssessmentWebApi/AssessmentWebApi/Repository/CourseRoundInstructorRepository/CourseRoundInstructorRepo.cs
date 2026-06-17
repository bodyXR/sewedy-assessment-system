using AssessmentWebApi.Data;
using AssessmentWebApi.Dto_s.CourseRoundInstructorDto_s;
using AssessmentWebApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AssessmentWebApi.Repository.CourseRoundInstructorRepository
{
    public class CourseRoundInstructorRepo : ICourseRoundInstructorRepo
    {
        private readonly AppDbContext _context;
        public CourseRoundInstructorRepo(AppDbContext context) { _context = context; }

        // ─────────────────────────────────────────────────────────────
        // Shared projection
        // ─────────────────────────────────────────────────────────────
        private IQueryable<CourseRoundInstructorResponseDto> Project(
            IQueryable<CourseRoundInstructor> query)
        {
            return query.Select(cri => new CourseRoundInstructorResponseDto
            {
                Id                 = cri.Id,
                CourseRoundId      = cri.CourseRoundId,
                AccountId          = cri.InstructorAccountId,
                InstructorName     = cri.InstructorAccount.FullNameEn ?? string.Empty,
                InstructorEmail    = cri.InstructorAccount.Email ?? string.Empty,
                RoleId             = cri.RoleId,
                RoleName           = cri.Role != null ? cri.Role.RoleName : cri.InstructorAccount.Role.RoleName,
                RoleBusinessEntity = cri.Role != null ? cri.Role.BusinessEntity : null,
                AssignedAt         = cri.AssignedDate.ToDateTime(TimeOnly.MinValue)
            });
        }

        // ─────────────────────────────────────────────────────────────
        // Get all — only Assessment roles
        // ─────────────────────────────────────────────────────────────
        public async Task<IEnumerable<CourseRoundInstructorResponseDto>> GetAllAsync()
        {
            var query = _context.CourseRoundInstructors
                .Where(cri => cri.Role != null && cri.Role.BusinessEntity == "Assessment");
            return await Project(query).ToListAsync();
        }

        // ─────────────────────────────────────────────────────────────
        // Get by cycle
        // ─────────────────────────────────────────────────────────────
        public async Task<IEnumerable<CourseRoundInstructorResponseDto>> GetByCourseRoundAsync(long courseRoundId)
        {
            var query = _context.CourseRoundInstructors
                .Where(cri => cri.CourseRoundId == courseRoundId &&
                              cri.Role != null && cri.Role.BusinessEntity == "Assessment");
            return await Project(query).ToListAsync();
        }

        // ─────────────────────────────────────────────────────────────
        // Get by instructor account — only return active, non-deleted course rounds
        // ─────────────────────────────────────────────────────────────
        public async Task<IEnumerable<CourseRoundInstructorResponseDto>> GetByInstructorAsync(long accountId)
        {
            var query = _context.CourseRoundInstructors
                .Where(cri => cri.InstructorAccountId == accountId &&
                              cri.Role != null && cri.Role.BusinessEntity == "Assessment" &&
                              cri.CourseRound != null && cri.CourseRound.IsActive);
            return await Project(query).ToListAsync();
        }

        // ─────────────────────────────────────────────────────────────
        // Create — validates role is Assessment (Assessor or Verifier)
        // ─────────────────────────────────────────────────────────────
        public async Task<CourseRoundInstructorResponseDto> CreateAsync(CourseRoundInstructorRequestDto request)
        {
            // Validate the round exists
            var round = await _context.CourseRounds
                .FirstOrDefaultAsync(cr => cr.Id == request.CourseRoundId);
            if (round is null)
                throw new InvalidOperationException($"CourseRound {request.CourseRoundId} not found.");

            // Validate account exists
            var account = await _context.Accounts
                .Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.Id == request.AccountId);
            if (account is null)
                throw new InvalidOperationException($"Account {request.AccountId} not found.");

            // Validate the role is an Assessment role
            var role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == request.RoleId);
            if (role is null)
                throw new InvalidOperationException($"Role {request.RoleId} not found.");
            if (role.BusinessEntity != "Assessment")
                throw new InvalidOperationException(
                    $"Role '{role.RoleName}' does not belong to the Assessment business entity. " +
                    "Only Assessor or Verifier roles can be assigned here.");

            // Prevent duplicate assignment in the same cycle
            var duplicate = await _context.CourseRoundInstructors
                .AnyAsync(cri => cri.CourseRoundId == request.CourseRoundId &&
                                 cri.InstructorAccountId == request.AccountId &&
                                 cri.RoleId == request.RoleId);
            if (duplicate)
                throw new InvalidOperationException(
                    $"Account {request.AccountId} is already assigned as {role.RoleName} in this cycle.");

            var instructor = new CourseRoundInstructor
            {
                CourseRoundId       = request.CourseRoundId,
                InstructorAccountId = request.AccountId,
                RoleId              = request.RoleId,
                AssignedDate        = DateOnly.FromDateTime(DateTime.UtcNow)
            };

            _context.CourseRoundInstructors.Add(instructor);
            await _context.SaveChangesAsync();

            var result = await Project(
                _context.CourseRoundInstructors.Where(cri => cri.Id == instructor.Id)
            ).FirstOrDefaultAsync();

            return result!;
        }

        // ─────────────────────────────────────────────────────────────
        // Update role — switch between Assessor and Verifier
        // ─────────────────────────────────────────────────────────────
        public async Task<CourseRoundInstructorResponseDto?> UpdateRoleAsync(long id, long roleId)
        {
            var record = await _context.CourseRoundInstructors.FindAsync(id);
            if (record is null)
                throw new InvalidOperationException($"CourseRoundInstructor {id} not found.");

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Id == roleId);
            if (role is null)
                throw new InvalidOperationException($"Role {roleId} not found.");
            if (role.BusinessEntity != "Assessment")
                throw new InvalidOperationException(
                    $"Role '{role.RoleName}' does not belong to the Assessment business entity.");

            record.RoleId = roleId;
            await _context.SaveChangesAsync();

            return await Project(
                _context.CourseRoundInstructors.Where(cri => cri.Id == id)
            ).FirstOrDefaultAsync();
        }

        // ─────────────────────────────────────────────────────────────
        // Delete
        // ─────────────────────────────────────────────────────────────
        public async Task<bool> DeleteAsync(long id)
        {
            var instructor = await _context.CourseRoundInstructors.FindAsync(id);
            if (instructor is null) return false;
            _context.CourseRoundInstructors.Remove(instructor);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
