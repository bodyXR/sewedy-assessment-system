using AssessmentWebApi.Data;
using AssessmentWebApi.Dto_s.CourseRoundDto_s;
using AssessmentWebApi.Models;
using Holistic_Training.Repository.GenericRepo;
using Microsoft.EntityFrameworkCore;

namespace AssessmentWebApi.Repository.CourseRoundRepository
{
    public class CourseRoundRepo : GenericRepo<CourseRound>, ICourseRoundRepo
    {
        public CourseRoundRepo(AppDbContext context) : base(context) { }

        // ─────────────────────────────────────────────────────────────
        // Shared flat query — CourseRound + Course name + Status name
        // Two-step to avoid chained LEFT JOIN translation issues
        // ─────────────────────────────────────────────────────────────
        private async Task<ICollection<CourseRoundResDto>> Project(
            IQueryable<CourseRound> query)
        {
            var rounds = await query.ToListAsync();

            if (!rounds.Any())
                return new List<CourseRoundResDto>();

            var courseIds = rounds.Select(r => r.CourseId).Distinct().ToList();
            var statusIds = rounds.Select(r => r.StatusId).Distinct().ToList();

            var courses = await _context.Courses
                .Where(c => courseIds.Contains(c.Id))
                .Select(c => new { c.Id, c.Title })
                .ToListAsync();

            var statuses = await _context.Statuses
                .Where(s => statusIds.Contains(s.Id))
                .Select(s => new { s.Id, s.StatusName })
                .ToListAsync();

            var courseMap = courses.ToDictionary(c => c.Id, c => c.Title);
            var statusMap = statuses.ToDictionary(s => s.Id, s => s.StatusName);

            return rounds.Select(r => new CourseRoundResDto
            {
                Id             = r.Id,
                CourseId       = r.CourseId,
                CompetencyName = courseMap.TryGetValue(r.CourseId, out var cn) ? cn : null,
                RoundNumber    = r.RoundNumber,
                StartDate      = r.StartDate,
                EndDate        = r.EndDate,
                MaxStudents    = r.MaxStudents,
                MinStudents    = r.MinStudents,
                StatusId       = r.StatusId,
                StatusName     = statusMap.TryGetValue(r.StatusId, out var sn) ? sn : null,
                CreatedAt      = r.CreatedAt
            }).ToList();
        }

        // ─────────────────────────────────────────────────────────────
        // Get all assessments — scoped to Assessment business entity,
        // optionally filtered by competency (courseId)
        // ─────────────────────────────────────────────────────────────
        public async Task<ICollection<CourseRoundResDto>> GetAllRounds(long? courseId = null)
        {
            var assessmentCourseIds = await _context.Courses
                .Where(c => c.BusinessEntity == "Assessment")
                .Select(c => c.Id)
                .ToListAsync();

            var query = _context.CourseRounds
                .Where(r => assessmentCourseIds.Contains(r.CourseId));

            if (courseId.HasValue)
                query = query.Where(r => r.CourseId == courseId.Value);

            return await Project(query);
        }

        // ─────────────────────────────────────────────────────────────
        // Get by ID
        // ─────────────────────────────────────────────────────────────
        public async Task<CourseRoundResDto?> GetRoundById(long id)
        {
            var query = _context.CourseRounds.Where(r => r.Id == id);
            var result = await Project(query);
            return result.FirstOrDefault();
        }

        // ─────────────────────────────────────────────────────────────
        // Create
        // ─────────────────────────────────────────────────────────────
        public async Task<CourseRoundResDto> CreateRound(CourseRoundReqDto request)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == request.CourseId &&
                                          c.BusinessEntity == "Assessment");

            if (course is null)
                throw new InvalidOperationException(
                    $"Assessment competency (Course) {request.CourseId} not found.");

            var round = new CourseRound
            {
                CourseId    = request.CourseId,
                RoundNumber = request.RoundNumber,
                StartDate   = request.StartDate,
                EndDate     = request.EndDate,
                MaxStudents = request.MaxStudents,
                MinStudents = request.MinStudents,
                StatusId    = request.StatusId,
                CreatedAt   = DateTime.UtcNow
            };

            await _context.CourseRounds.AddAsync(round);
            await _context.SaveChangesAsync();

            return (await GetRoundById(round.Id))!;
        }

        // ─────────────────────────────────────────────────────────────
        // Update — partial, only non-null fields applied
        // ─────────────────────────────────────────────────────────────
        public async Task<CourseRoundResDto> UpdateRound(long id, CourseRoundUpdateDto request)
        {
            var round = await _context.CourseRounds
                .FirstOrDefaultAsync(r => r.Id == id);

            if (round is null)
                throw new InvalidOperationException($"Assessment (CourseRound) {id} not found.");

            if (request.RoundNumber.HasValue) round.RoundNumber = request.RoundNumber;
            if (request.StartDate.HasValue)   round.StartDate   = request.StartDate;
            if (request.EndDate.HasValue)     round.EndDate     = request.EndDate;
            if (request.MaxStudents.HasValue) round.MaxStudents = request.MaxStudents;
            if (request.MinStudents.HasValue) round.MinStudents = request.MinStudents;
            if (request.StatusId.HasValue)    round.StatusId    = request.StatusId.Value;

            await _context.SaveChangesAsync();

            return (await GetRoundById(id))!;
        }

        // ─────────────────────────────────────────────────────────────
        // Delete
        // ─────────────────────────────────────────────────────────────
        public async Task DeleteRound(long id)
        {
            var round = await _context.CourseRounds
                .FirstOrDefaultAsync(r => r.Id == id);

            if (round is null)
                throw new InvalidOperationException($"Assessment (CourseRound) {id} not found.");

            _context.CourseRounds.Remove(round);
            await _context.SaveChangesAsync();
        }
    }
}
