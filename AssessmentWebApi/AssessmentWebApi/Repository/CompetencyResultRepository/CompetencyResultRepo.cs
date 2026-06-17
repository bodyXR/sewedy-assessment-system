using AssessmentWebApi.Data;
using AssessmentWebApi.Dto_s.CompetencyResultDto_s;
using AssessmentWebApi.Models;
using Holistic_Training.Repository.GenericRepo;
using Microsoft.EntityFrameworkCore;

namespace AssessmentWebApi.Repository.CompetencyResultRepository
{
    public class CompetencyResultRepo : GenericRepo<CompetencyResult>, ICompetencyResultRepo
    {
        public CompetencyResultRepo(AppDbContext context) : base(context) { }

        // ─────────────────────────────────────────────────────────────
        // Shared projection
        // ─────────────────────────────────────────────────────────────
        private async Task<ICollection<CompetencyResultResDto>> Project(
            IQueryable<CompetencyResult> query)
        {
            return await (
                from r in query
                join student in _context.Accounts
                    on r.StudentId equals student.Id into sJoin
                from student in sJoin.DefaultIfEmpty()
                join course in _context.Courses
                    on r.CourseId equals course.Id into cJoin
                from course in cJoin.DefaultIfEmpty()
                join round in _context.CourseRounds
                    on r.CourseRoundId equals round.Id into rJoin
                from round in rJoin.DefaultIfEmpty()
                join status in _context.Statuses
                    on r.ResultStatusId equals status.Id into stJoin
                from status in stJoin.DefaultIfEmpty()
                join assessor in _context.Accounts
                    on r.AssessorId equals assessor.Id into aJoin
                from assessor in aJoin.DefaultIfEmpty()
                select new CompetencyResultResDto
                {
                    Id              = r.Id,
                    StudentId       = r.StudentId,
                    StudentName     = student != null ? student.FullNameEn : null,
                    CourseId        = r.CourseId,
                    CourseName      = course != null ? course.Title : null,
                    CourseRoundId   = r.CourseRoundId,
                    RoundNumber     = round != null ? round.RoundNumber : null,
                    TotalScore      = r.TotalScore,
                    MaxScore        = r.MaxScore,
                    ScorePercentage = r.TotalScore != null && r.MaxScore != null && r.MaxScore > 0
                                        ? Math.Round(r.TotalScore!.Value / r.MaxScore!.Value * 100, 2)
                                        : null,
                    ResultStatusId   = r.ResultStatusId,
                    ResultStatusName = status != null ? status.StatusName : null,
                    AssessorId      = r.AssessorId,
                    AssessorName    = assessor != null ? assessor.FullNameEn : null,
                    Notes           = r.Notes,
                    GradedAt        = r.GradedAt,
                    CreatedAt       = r.CreatedAt
                }
            ).ToListAsync();
        }

        // ─────────────────────────────────────────────────────────────
        // Get all — optionally filtered by student, course, or round
        // ─────────────────────────────────────────────────────────────
        public async Task<ICollection<CompetencyResultResDto>> GetAll(
            long? studentId = null, long? courseId = null, long? courseRoundId = null)
        {
            var query = _context.CompetencyResults.AsQueryable();

            if (studentId.HasValue)    query = query.Where(r => r.StudentId    == studentId.Value);
            if (courseId.HasValue)     query = query.Where(r => r.CourseId     == courseId.Value);
            if (courseRoundId.HasValue) query = query.Where(r => r.CourseRoundId == courseRoundId.Value);

            return await Project(query);
        }

        // ─────────────────────────────────────────────────────────────
        // Get by ID
        // ─────────────────────────────────────────────────────────────
        public async new Task<CompetencyResultResDto?> GetById(long id)
        {
            var query = _context.CompetencyResults.Where(r => r.Id == id);
            var result = await Project(query);
            return result.FirstOrDefault();
        }

        // ─────────────────────────────────────────────────────────────
        // Create — auto-calculates scores from submissions if not provided
        // ─────────────────────────────────────────────────────────────
        public async Task<CompetencyResultResDto> Create(CompetencyResultReqDto request)
        {
            // Validate student
            var student = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == request.StudentId);
            if (student is null)
                throw new InvalidOperationException($"Student {request.StudentId} not found.");

            // Validate course
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == request.CourseId);
            if (course is null)
                throw new InvalidOperationException($"Course {request.CourseId} not found.");

            // Validate round
            var round = await _context.CourseRounds
                .FirstOrDefaultAsync(cr => cr.Id == request.CourseRoundId);
            if (round is null)
                throw new InvalidOperationException($"CourseRound {request.CourseRoundId} not found.");

            // Validate assessor
            var assessor = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == request.AssessorId);
            if (assessor is null)
                throw new InvalidOperationException($"Assessor {request.AssessorId} not found.");

            // Validate result status
            var status = await _context.Statuses
                .FirstOrDefaultAsync(s => s.Id == request.ResultStatusId);
            if (status is null)
                throw new InvalidOperationException($"Status {request.ResultStatusId} not found.");

            decimal? totalScore = request.TotalScore;
            decimal? maxScore   = request.MaxScore;

            // Auto-calculate from submissions if scores not provided
            if (totalScore is null || maxScore is null)
            {
                // Get all assignments for this course
                var assignments = await _context.CourseRoundAssignments
                    .Where(a => a.CourseId == request.CourseId)
                    .ToListAsync();

                var assignmentIds = assignments.Select(a => a.Id).ToList();

                // Get this student's submissions for those assignments
                var submissions = await _context.CourseRoundAssignmentSubmissions
                    .Where(s => s.StudentId == request.StudentId &&
                                assignmentIds.Contains(s.AssignmentId))
                    .ToListAsync();

                if (totalScore is null)
                    totalScore = submissions.Sum(s => s.Grade ?? 0);

                if (maxScore is null)
                    maxScore = assignments.Sum(a => a.TotalGrade);
            }

            var result = new CompetencyResult
            {
                StudentId      = request.StudentId,
                CourseId       = request.CourseId,
                CourseRoundId  = request.CourseRoundId,
                TotalScore     = totalScore,
                MaxScore       = maxScore,
                ResultStatusId = request.ResultStatusId,
                AssessorId     = request.AssessorId,
                Notes          = request.Notes,
                GradedAt       = request.GradedAt ?? DateTime.UtcNow,
                CreatedAt      = DateTime.UtcNow
            };

            await _context.CompetencyResults.AddAsync(result);
            await _context.SaveChangesAsync();

            return (await GetById(result.Id))!;
        }

        // ─────────────────────────────────────────────────────────────
        // Update — partial, only non-null fields applied
        // ─────────────────────────────────────────────────────────────
        public async Task<CompetencyResultResDto> Update(long id, CompetencyResultUpdateDto request)
        {
            var result = await _context.CompetencyResults
                .FirstOrDefaultAsync(r => r.Id == id);

            if (result is null)
                throw new InvalidOperationException($"CompetencyResult {id} not found.");

            if (request.TotalScore.HasValue)    result.TotalScore     = request.TotalScore;
            if (request.MaxScore.HasValue)      result.MaxScore       = request.MaxScore;
            if (request.ResultStatusId.HasValue) result.ResultStatusId = request.ResultStatusId.Value;
            if (request.Notes is not null)      result.Notes          = request.Notes;
            if (request.GradedAt.HasValue)      result.GradedAt       = request.GradedAt.Value;

            await _context.SaveChangesAsync();

            return (await GetById(id))!;
        }

        // ─────────────────────────────────────────────────────────────
        // Delete
        // ─────────────────────────────────────────────────────────────
        public async Task Delete(long id)
        {
            var result = await _context.CompetencyResults
                .FirstOrDefaultAsync(r => r.Id == id);

            if (result is null)
                throw new InvalidOperationException($"CompetencyResult {id} not found.");

            _context.CompetencyResults.Remove(result);
            await _context.SaveChangesAsync();
        }
    }
}
